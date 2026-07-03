import { Vector4 } from "../maths/Vector4";

/**
 * VFX → ShaderGraph 之间 operator chain 的 runtime evaluator。
 *
 * OutputContext 的 shader uniform（如 _MainTextureColor）可以接到
 * operator chain（SampleGradient/SampleCurve/Math 等），每帧求值后写到 material。
 * 转换器把这些 chain 序列化到 .lvfx 的 shaderPropertyExpressions，runtime 这里 evaluate。
 *
 * 不支持 per-particle attribute (AgeOverLifetime 等) — 用 GlobalTimeRatio 近似 (mod(time,1))。
 */

export interface ExprNode {
    kind: string;          // Constant / VFXParameter / SampleGradient / VFXTotalTime / Add / ...
    outputType: string;    // float / vec2 / vec3 / vec4 / Gradient / Curve / int / bool
    value?: any;           // Constant / VFXParameter default
    exposedName?: string;  // VFXParameter
    defaultValue?: any;
    inputs?: string[];     // 下游节点 id 列表
}

export interface ExprGraph {
    rootNodeId: string;
    outputType: string;
    nodes: { [id: string]: ExprNode };
}

export interface GradientData {
    colorKeys: Array<{ color: { r: number; g: number; b: number; a: number }; time: number }>;
    alphaKeys: Array<{ alpha: number; time: number }>;
    mode?: number;  // 0 = Blend, 1 = Fixed
}

export interface CurveData {
    frames: Array<{ time: number; value: number; inTangent: number; outTangent: number }>;
    preWrapMode?: number;
    postWrapMode?: number;
}

export interface ExprEvalContext {
    totalTime: number;
    deltaTime: number;
    /** runtime VFXParameter 实际值 map: exposedName → cached value (含 Prefab/Inspector override 后的 Gradient/Curve/Vector 等) */
    propertyValues?: Map<string, { cached: any, value?: number[] }>;
    /** 当前 effect 是否含 ConstantRate/PeriodicBurst/VariableRate 持续 spawn (区别于纯 SingleBurst).
     *  决定 GlobalTimeRatio 行为: SingleBurst-only 用 cap min(t,1) 跟首批粒子 age 偶然同步,
     *  持续 spawn 用 mod 1 让 cycle 持续 (避免 t>1 后 Disappear=1 让所有粒子永远不可见). */
    hasContinuousSpawn?: boolean;
}

export class ShaderExpressionEvaluator {
    /**
     * 转换器注入的“年龄中位数”全局常量 slot 名。
     * SampleCurve(time = 该常量) 表示按 age 驱动 → 无法在全局表达式里 per-particle 采样，
     * 走 {@link _sampleCurveAverage} 的时间平均近似。两端约定共用，改名需同步转换器。
     */
    static readonly AGE_MEDIAN_SLOT_NAME = "ageMedian";

    /** {@link _sampleCurveAverage} 在 [0,1] 区间的中点采样点数，越大越精确、开销越高。 */
    static readonly CURVE_AVERAGE_SAMPLE_COUNT = 32;

    /** evaluate 单个 expression graph，返回 root 节点的求值结果 */
    static evaluate(graph: ExprGraph, ctx: ExprEvalContext): any {
        if (!graph || !graph.nodes || !graph.rootNodeId) return null;
        const cache: { [id: string]: any } = {};
        return this._evalNode(graph.rootNodeId, graph.nodes, cache, ctx);
    }

    private static _evalNode(id: string, nodes: { [id: string]: ExprNode }, cache: any, ctx: any): any {
        if (cache[id] !== undefined) return cache[id];
        const n = nodes[id];
        if (!n) return null;
        let result: any = null;
        switch (n.kind) {
            case "Constant":
                result = n.value;
                break;
            case "VFXParameter": {
                // 优先从 runtime _propertyValues 取（含 Prefab/Inspector override 的最终值）
                // 关键: 拿不到 override 时 return undefined → caller (caller 在 outer eval / setUniform 调用方) 跳过
                // setUniform 让 ShaderGraph 编译期 default 生效 (e.g. 金色 SecondaryGradient).
                // 之前 fallback 到 n.defaultValue (.vfx VFXParameter 端的内置 default 通常是灰白占位) →
                // 覆盖 ShaderGraph default 让 UNI VFX1 wisps 颜色丢失 (原本金色变灰白).
                const pv: any = ctx.propertyValues && n.exposedName ? ctx.propertyValues.get(n.exposedName) : null;
                if (pv) {
                    if (pv.rawGradientStops && pv.rawGradientStops.length > 0) {
                        result = { __layaGradientStops: pv.rawGradientStops };
                    } else if (pv.rawCurveFrames && pv.rawCurveFrames.length > 0) {
                        result = { __layaCurveFrames: pv.rawCurveFrames };
                    } else if (pv.value && pv.value.length > 0) {
                        const v = pv.value;
                        result = pv.value.length === 1 ? Number(v[0]) || 0 : { r: v[0] ?? 0, g: v[1] ?? 0, b: v[2] ?? 0, a: v[3] ?? 0 };
                    } else if (pv.cached != null) {
                        result = pv.cached;
                    } else {
                        result = undefined;   // 没真值 — 让上游 SampleGradient/CombineVec 等返回 undefined → 整个 expression 跳过
                    }
                } else {
                    result = undefined;   // 同上
                }
                break;
            }
            case "VFXTotalTime":
            case "VFXTime":
                result = ctx.totalTime;
                break;
            case "VFXDeltaTime":
                result = ctx.deltaTime;
                break;
            case "VFXFrameIndex":
                result = Math.floor(ctx.totalTime * 60);   // assume 60fps frame index
                break;
            case "GlobalTimeRatio":
                // AgeOverLifetime 的近似 — material uniform 不能 per-particle，用 system 全局时间
                // 行为依赖 spawner 类型 (ctx.hasContinuousSpawn 由 VisualEffect 注入):
                //   SingleBurst-only: cap min(totalTime, 1) — 跟 per-particle ageOverLifetime 偶然吻合 (system 跟首批粒子同步)
                //     避免 lifetime>1s 的 sample (UNI VFX2 1.4s) 让 curve fade 循环 ("ring 2 圈")
                //   ConstantRate/PeriodicBurst: mod(totalTime, 1) — 让 cycle 持续循环
                //     避免 cap 后 totalTime>1 让 Disappear=curve(1)=1 让所有粒子永远不可见 (UNI VFX6 不显示)
                result = ctx.hasContinuousSpawn
                    ? (ctx.totalTime - Math.floor(ctx.totalTime))
                    : Math.min(ctx.totalTime, 1);
                break;
            case "Random": {
                // 源引擎端 Random(min, max, seed) 是 per-particle random, Laya material uniform 是 per-system 一份不能 per-particle.
                // 之前写死 result=0.5 完全 ignore inputs 让 _MaskFlipbookIndex Random(0,3) 永远 0.5 而不是 0~3 范围
                // 改成读 min/max input + 用 totalTime+seed-based deterministic random 让每帧动画 (frame 切换 mask flipbook)
                const min = Number(this._evalNode(n.inputs![0], nodes, cache, ctx)) || 0;
                const max = Number(this._evalNode(n.inputs![1], nodes, cache, ctx)) || 1;
                const seed = n.inputs!.length > 2 ? Number(this._evalNode(n.inputs![2], nodes, cache, ctx)) || 0 : 0;
                // 用 totalTime + seed 做伪随机 (deterministic per-frame, 让 mask flipbook frame 切换)
                const t = ctx.totalTime + seed * 13.7;
                const r = Math.abs(Math.sin(t * 12.9898) * 43758.5453) % 1;
                result = min + (max - min) * r;
                break;
            }
            case "SampleGradient": {
                const grad = this._evalNode(n.inputs![0], nodes, cache, ctx) as GradientData;
                const t = Number(this._evalNode(n.inputs![1], nodes, cache, ctx)) || 0;
                result = this._sampleGradient(grad, t);
                break;
            }
            case "SampleCurve": {
                const curve = this._evalNode(n.inputs![0], nodes, cache, ctx) as CurveData;
                const timeNode = nodes[n.inputs![1]] as any;
                // age 驱动的 SampleCurve(time=ageMedian 全局常量)在全局表达式里无法 per-particle 采样。
                // 用曲线在 [0,1] 的【时间平均值】—— 数学上等于源引擎 per-particle 随年龄采样后所有粒子的平均
                // (粒子年龄在常 spawn 下均匀分布 [0,1])→ 整体亮度与源引擎对齐。
                // 注:Alpha_Multiplier 已在 VisualEffect._evaluateShaderExpressions 走真·per-particle 曲线 uniform,
                // 此平均仅作其它 age 驱动属性 / per-particle 未注入时的兜底近似。
                if (timeNode && timeNode.kind === "Constant" && timeNode.slotName === ShaderExpressionEvaluator.AGE_MEDIAN_SLOT_NAME) {
                    result = this._sampleCurveAverage(curve);
                } else {
                    const t = Number(this._evalNode(n.inputs![1], nodes, cache, ctx)) || 0;
                    result = this._sampleCurve(curve, t);
                }
                break;
            }
            case "Add":
            case "Sub":
            case "Mul":
            case "Div":
            case "Mod": {
                const a = this._evalNode(n.inputs![0], nodes, cache, ctx);
                const b = this._evalNode(n.inputs![1], nodes, cache, ctx);
                result = this._binOp(n.kind, a, b);
                break;
            }
            case "Lerp": {
                const x = this._evalNode(n.inputs![0], nodes, cache, ctx);
                const y = this._evalNode(n.inputs![1], nodes, cache, ctx);
                const s = Number(this._evalNode(n.inputs![2], nodes, cache, ctx)) || 0;
                result = this._lerp(x, y, s);
                break;
            }
            case "Sin": result = Math.sin(Number(this._evalNode(n.inputs![0], nodes, cache, ctx)) || 0); break;
            case "Cos": result = Math.cos(Number(this._evalNode(n.inputs![0], nodes, cache, ctx)) || 0); break;
            case "Frac": {
                const x = Number(this._evalNode(n.inputs![0], nodes, cache, ctx)) || 0;
                result = x - Math.floor(x);
                break;
            }
            case "Abs": result = Math.abs(Number(this._evalNode(n.inputs![0], nodes, cache, ctx)) || 0); break;
            case "Neg": result = -(Number(this._evalNode(n.inputs![0], nodes, cache, ctx)) || 0); break;
            case "Saturate": {
                const x = Number(this._evalNode(n.inputs![0], nodes, cache, ctx)) || 0;
                result = Math.max(0, Math.min(1, x));
                break;
            }
            // 子分量 combine: 转换器 walkSlotTree 检测 vec2/3/4 master slot 的子 slot link 时 emit
            // (e.g. _MainTextureOffset.y 接 Random output → CombineVec2(0, Random))
            case "CombineVec2": {
                const x = Number(this._evalNode(n.inputs![0], nodes, cache, ctx)) || 0;
                const y = Number(this._evalNode(n.inputs![1], nodes, cache, ctx)) || 0;
                result = { x, y };
                break;
            }
            case "CombineVec3": {
                const x = Number(this._evalNode(n.inputs![0], nodes, cache, ctx)) || 0;
                const y = Number(this._evalNode(n.inputs![1], nodes, cache, ctx)) || 0;
                const z = Number(this._evalNode(n.inputs![2], nodes, cache, ctx)) || 0;
                result = { x, y, z };
                break;
            }
            case "CombineVec4": {
                const x = Number(this._evalNode(n.inputs![0], nodes, cache, ctx)) || 0;
                const y = Number(this._evalNode(n.inputs![1], nodes, cache, ctx)) || 0;
                const z = Number(this._evalNode(n.inputs![2], nodes, cache, ctx)) || 0;
                const w = Number(this._evalNode(n.inputs![3], nodes, cache, ctx)) || 0;
                result = { x, y, z, w };
                break;
            }
            default:
                result = null;
        }
        cache[id] = result;
        return result;
    }

    /** Gradient sample lerp — 支持两种格式：
     *  源格式 {colorKeys:[{color,time}], alphaKeys:[{alpha,time}]}
     *  Laya  {__layaGradientStops:[{time,r,g,b,a}]} (color+alpha 同 stop)
     */
    private static _sampleGradient(g: any, t: number): { r: number; g: number; b: number; a: number } | null {
        // grad 未提供 (VFXParameter 无 propertyValues override) → return null 让 caller skip setUniform
        // 让 ShaderGraph 编译期 default 生效 (e.g. UNI VFX1 金色 SecondaryGradient)
        if (!g) return null as any;
        const clamp = Math.max(0, Math.min(1, t));
        // Laya VFXGradientStop 格式：[{t, color:[r,g,b,a]}]
        if (g.__layaGradientStops && Array.isArray(g.__layaGradientStops) && g.__layaGradientStops.length > 0) {
            const stops = g.__layaGradientStops;
            let s0 = stops[0], s1 = stops[stops.length - 1];
            for (let i = 0; i < stops.length - 1; i++) {
                if (clamp >= stops[i].t && clamp <= stops[i + 1].t) {
                    s0 = stops[i]; s1 = stops[i + 1]; break;
                }
            }
            const denom = (s1.t - s0.t) || 1;
            const u = Math.max(0, Math.min(1, (clamp - s0.t) / denom));
            const c0 = s0.color || [1, 1, 1, 1];
            const c1 = s1.color || [1, 1, 1, 1];
            return {
                r: c0[0] + (c1[0] - c0[0]) * u,
                g: c0[1] + (c1[1] - c0[1]) * u,
                b: c0[2] + (c1[2] - c0[2]) * u,
                a: c0[3] + (c1[3] - c0[3]) * u,
            };
        }
        // 源格式
        if (!g.colorKeys || g.colorKeys.length === 0) return { r: 1, g: 1, b: 1, a: 1 };
        const keys = g.colorKeys;
        const aKeys = g.alphaKeys || [{ alpha: 1, time: 0 }];
        const mode = g.mode || 0;
        let c0 = keys[0], c1 = keys[keys.length - 1];
        for (let i = 0; i < keys.length - 1; i++) {
            if (clamp >= keys[i].time && clamp <= keys[i + 1].time) {
                c0 = keys[i]; c1 = keys[i + 1]; break;
            }
        }
        const denom = (c1.time - c0.time) || 1;
        const u = mode === 1 ? 0 : Math.max(0, Math.min(1, (clamp - c0.time) / denom));
        const r = c0.color.r + (c1.color.r - c0.color.r) * u;
        const g_ = c0.color.g + (c1.color.g - c0.color.g) * u;
        const b = c0.color.b + (c1.color.b - c0.color.b) * u;
        let a0 = aKeys[0], a1 = aKeys[aKeys.length - 1];
        for (let i = 0; i < aKeys.length - 1; i++) {
            if (clamp >= aKeys[i].time && clamp <= aKeys[i + 1].time) {
                a0 = aKeys[i]; a1 = aKeys[i + 1]; break;
            }
        }
        const aDenom = (a1.time - a0.time) || 1;
        const au = mode === 1 ? 0 : Math.max(0, Math.min(1, (clamp - a0.time) / aDenom));
        const a = a0.alpha + (a1.alpha - a0.alpha) * au;
        return { r, g: g_, b, a };
    }

    /** AnimationCurve sample — 简化 linear lerp（不算 Hermite tangent，足够多数 material uniform 用例） */
    static _sampleCurve(c: CurveData, t: number): number {
        // curve 未提供 → return null 让 caller skip setUniform 让 ShaderGraph default 生效
        if (!c) return null as any;
        if (!c.frames || c.frames.length === 0) return 0;
        if (c.frames.length === 1) return c.frames[0].value;
        const clamp = Math.max(c.frames[0].time, Math.min(c.frames[c.frames.length - 1].time, t));
        let f0 = c.frames[0], f1 = c.frames[c.frames.length - 1];
        for (let i = 0; i < c.frames.length - 1; i++) {
            if (clamp >= c.frames[i].time && clamp <= c.frames[i + 1].time) {
                f0 = c.frames[i]; f1 = c.frames[i + 1]; break;
            }
        }
        const denom = (f1.time - f0.time) || 1;
        const u = (clamp - f0.time) / denom;
        return f0.value + (f1.value - f0.value) * u;
    }

    /** 曲线在 [0,1] 的时间平均值（中点采样，点数见 {@link CURVE_AVERAGE_SAMPLE_COUNT}）— 见 SampleCurve 的 ageMedian 分支 */
    static _sampleCurveAverage(c: CurveData): number {
        if (!c || !c.frames || c.frames.length === 0) return 0;
        if (c.frames.length === 1) return c.frames[0].value;
        const N = this.CURVE_AVERAGE_SAMPLE_COUNT;
        let sum = 0;
        for (let i = 0; i < N; i++) sum += this._sampleCurve(c, (i + 0.5) / N);
        return sum / N;
    }

    private static _binOp(kind: string, a: any, b: any): any {
        const isVec = (v: any) => v && typeof v === "object" && ("r" in v || "x" in v);
        if (isVec(a) || isVec(b)) {
            // vec op vec / vec op float 都 broadcast
            const getC = (v: any, k: string) => {
                if (typeof v === "number") return v;
                if (k === "r" || k === "x") return v.r !== undefined ? v.r : v.x;
                if (k === "g" || k === "y") return v.g !== undefined ? v.g : v.y;
                if (k === "b" || k === "z") return v.b !== undefined ? v.b : v.z;
                if (k === "a" || k === "w") return v.a !== undefined ? v.a : v.w;
                return 0;
            };
            const op = (x: number, y: number) => kind === "Add" ? x + y : kind === "Sub" ? x - y : kind === "Mul" ? x * y : kind === "Div" ? (y !== 0 ? x / y : 0) : kind === "Mod" ? x - y * Math.floor(x / (y || 1)) : 0;
            return {
                r: op(getC(a, "r"), getC(b, "r")),
                g: op(getC(a, "g"), getC(b, "g")),
                b: op(getC(a, "b"), getC(b, "b")),
                a: op(getC(a, "a"), getC(b, "a")),
            };
        }
        const x = Number(a) || 0, y = Number(b) || 0;
        switch (kind) {
            case "Add": return x + y;
            case "Sub": return x - y;
            case "Mul": return x * y;
            case "Div": return y !== 0 ? x / y : 0;
            case "Mod": return x - y * Math.floor(x / (y || 1));
        }
        return 0;
    }

    private static _lerp(x: any, y: any, s: number): any {
        const isVec = (v: any) => v && typeof v === "object";
        if (isVec(x)) {
            return {
                r: (x.r ?? x.x ?? 0) * (1 - s) + (y.r ?? y.x ?? 0) * s,
                g: (x.g ?? x.y ?? 0) * (1 - s) + (y.g ?? y.y ?? 0) * s,
                b: (x.b ?? x.z ?? 0) * (1 - s) + (y.b ?? y.z ?? 0) * s,
                a: (x.a ?? x.w ?? 0) * (1 - s) + (y.a ?? y.w ?? 0) * s,
            };
        }
        return (Number(x) || 0) * (1 - s) + (Number(y) || 0) * s;
    }

    /** 把求值结果转 Vector4（用于 setVector 到 ShaderData） */
    static toVector4(v: any, out?: Vector4): Vector4 {
        if (!out) out = new Vector4();
        if (typeof v === "number") {
            out.setValue(v, v, v, v);
        } else if (v && typeof v === "object") {
            out.setValue(
                v.r !== undefined ? v.r : (v.x !== undefined ? v.x : 0),
                v.g !== undefined ? v.g : (v.y !== undefined ? v.y : 0),
                v.b !== undefined ? v.b : (v.z !== undefined ? v.z : 0),
                v.a !== undefined ? v.a : (v.w !== undefined ? v.w : 0),
            );
        }
        return out;
    }
}
