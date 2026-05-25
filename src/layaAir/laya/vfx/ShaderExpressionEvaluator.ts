import { Vector4 } from "../maths/Vector4";

/**
 * VFX → ShaderGraph 之间 operator chain 的 runtime evaluator。
 *
 * Unity VFX Graph 中 OutputContext 的 shader uniform（如 _MainTextureColor）可以接到
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
}

export class ShaderExpressionEvaluator {
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
                const pv: any = ctx.propertyValues && n.exposedName ? ctx.propertyValues.get(n.exposedName) : null;
                if (pv) {
                    // Gradient 类：cached 是 baked Texture（不可 CPU sample），用 rawGradientStops 给 SampleGradient lerp
                    if (pv.rawGradientStops && pv.rawGradientStops.length > 0) {
                        result = { __layaGradientStops: pv.rawGradientStops };
                    } else if (pv.rawCurveFrames && pv.rawCurveFrames.length > 0) {
                        result = { __layaCurveFrames: pv.rawCurveFrames };
                    } else if (pv.value && pv.value.length > 0) {
                        // Vector / Color / Float 走 value[] 拼 Vector4
                        const v = pv.value;
                        result = pv.value.length === 1 ? Number(v[0]) || 0 : { r: v[0] ?? 0, g: v[1] ?? 0, b: v[2] ?? 0, a: v[3] ?? 0 };
                    } else if (pv.cached != null) {
                        result = pv.cached;
                    } else {
                        result = n.defaultValue;
                    }
                } else {
                    result = n.defaultValue;
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
                // AgeOverLifetime 的近似：vfx 总时间 mod 1
                result = ctx.totalTime - Math.floor(ctx.totalTime);
                break;
            case "Random": {
                // Unity 端 Random(min, max, seed) 是 per-particle random, Laya material uniform 是 per-system 一份不能 per-particle.
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
                const t = Number(this._evalNode(n.inputs![1], nodes, cache, ctx)) || 0;
                result = this._sampleCurve(curve, t);
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
            default:
                result = null;
        }
        cache[id] = result;
        return result;
    }

    /** Gradient sample lerp — 支持两种格式：
     *  Unity {colorKeys:[{color,time}], alphaKeys:[{alpha,time}]}
     *  Laya  {__layaGradientStops:[{time,r,g,b,a}]} (color+alpha 同 stop)
     */
    private static _sampleGradient(g: any, t: number): { r: number; g: number; b: number; a: number } {
        if (!g) return { r: 1, g: 1, b: 1, a: 1 };
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
        // Unity 格式
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

    /** Unity AnimationCurve sample — 简化 linear lerp（不算 Hermite tangent，足够多数 material uniform 用例） */
    private static _sampleCurve(c: CurveData, t: number): number {
        if (!c || !c.frames || c.frames.length === 0) return 0;
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
