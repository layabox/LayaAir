import { VFXAsset, VFXBlendMode, VFXBoundsMode, VFXCurveUniformDesc, VFXEventDesc, VFXExtraOutputDesc, VFXGPUEventType, VFXOutputEventDesc, VFXParticleSystemDesc, VFXPropertyDesc, VFXPropertyType, VFXSimulateSpace, VFXSpawnerConstantRateTaskDesc, VFXSpawnerCustomWrapperTaskDesc, VFXSpawnerPeriodicBurstTaskDesc, VFXSpawnerSingleBurstTaskDesc, VFXSpawnerOverDistanceTaskDesc, VFXSpawnerSetEventAttributeTaskDesc, VFXSpawnerSystemDesc, VFXSpawnerTaskType, VFXStaticMeshSystemDesc, VFXSystemType, VFXUpdateMode } from "./VFXAsset";
import { VFXEventAttributeDesc, VFXEventAttributeType } from "./VFXEventAttribute";
import { MeshFilter } from "../d3/core/MeshFilter";
import { Sprite3D } from "../d3/core/Sprite3D";
import { Mesh } from "../d3/resource/models/Mesh";
import { PrimitiveMesh } from "../d3/resource/models/PrimitiveMesh";
import { DeviceBuffer } from "../d3/graphics/DeviceBuffer";
import { EDeviceBufferUsage } from "../RenderDriver/DriverDesign/RenderDevice/IDeviceBuffer";
import { Color } from "../maths/Color";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";
import { ComputeShader } from "../RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeShader";
import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { WrapMode } from "../RenderEngine/RenderEnum/WrapMode";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../resource/BaseTexture";
import { Texture2D } from "../resource/Texture2D";
import { Laya } from "../../Laya";
import { URL } from "../net/URL";

export class VFXAssetParser {

    async parse(data: any, baseUrl: string): Promise<VFXAsset> {

        const vfxAsset = new VFXAsset();

        // 解析 updateMode
        let updateMode = VFXUpdateMode.FixedDeltaTime;
        if (data.fixedDeltaTime === false) {
            updateMode |= VFXUpdateMode.DeltaTime;
        }
        if (data.exactFixedTime) {
            updateMode |= VFXUpdateMode.ExactFixedTimeStep;
        }
        if (data.ignoreTimeScale) {
            updateMode |= VFXUpdateMode.IgnoreTimeScale;
        }
        vfxAsset.updateMode = updateMode;

        if (data.initialEventName) {
            vfxAsset.initialEventName = data.initialEventName as string;
        }

        // PreWarm 参数
        if (typeof data.preWarmTotalTime === "number") vfxAsset.preWarmTotalTime = data.preWarmTotalTime;
        if (typeof data.preWarmStepCount === "number") vfxAsset.prewarmStepCount = data.preWarmStepCount;
        if (typeof data.preWarmDeltaTime === "number") vfxAsset.prewarmDeltaTime = data.preWarmDeltaTime;

        // 收集所有需要等待的 promise
        const loadPromises: Promise<void>[] = [];

        (data.systems as Array<any>).forEach((sys, index) => {
            const type = sys.type as VFXSystemType;
            switch (type) {
                case VFXSystemType.Spawner: {
                    const desc = new VFXSpawnerSystemDesc();
                    desc.loopCount = new Vector2(sys.loopCount[0], sys.loopCount[1]);
                    desc.loopDuration = new Vector2(sys.loopDuration[0], sys.loopDuration[1]);
                    desc.delayBeforeLoop = sys.delayBeforeLoop;
                    desc.delayAfterLoop = sys.delayAfterLoop;

                    sys.onPlayInputs && desc.onPlayInputs.push(...(sys.onPlayInputs as Array<number>));
                    sys.onStopInputs && desc.onStopInputs.push(...(sys.onStopInputs as Array<number>));

                    (sys.tasks as Array<any>).forEach(task => {
                        switch (task.type as VFXSpawnerTaskType) {
                            case VFXSpawnerTaskType.ConstantRate: {
                                const taskDesc = new VFXSpawnerConstantRateTaskDesc();
                                taskDesc.rate = task.rate;
                                desc.tasks.push(taskDesc);
                                break;
                            }
                            case VFXSpawnerTaskType.SingleBurst: {
                                const taskDesc = new VFXSpawnerSingleBurstTaskDesc();
                                taskDesc.delay = new Vector2(task.delay[0], task.delay[1]);
                                taskDesc.count = new Vector2(task.count[0], task.count[1]);
                                if (task.countFromLoopIndex) {
                                    taskDesc.countFromLoopIndex = true;
                                    if (task.countModulo > 0) taskDesc.countModulo = task.countModulo;
                                }
                                desc.tasks.push(taskDesc);
                                break;
                            }
                            case VFXSpawnerTaskType.PeriodicBurst: {
                                const taskDesc = new VFXSpawnerPeriodicBurstTaskDesc();
                                taskDesc.delay = new Vector2(task.delay[0], task.delay[1]);
                                taskDesc.count = new Vector2(task.count[0], task.count[1]);
                                desc.tasks.push(taskDesc);
                                break;
                            }
                            case VFXSpawnerTaskType.SpawnOverDistance: {
                                const taskDesc = new VFXSpawnerOverDistanceTaskDesc();
                                taskDesc.distance = typeof task.distance === "number" ? task.distance : 1;
                                desc.tasks.push(taskDesc);
                                break;
                            }
                            case VFXSpawnerTaskType.CustomWrapper: {
                                const taskDesc = new VFXSpawnerCustomWrapperTaskDesc();
                                taskDesc.callbackName = String(task.callbackName ?? "default");
                                desc.tasks.push(taskDesc);
                                break;
                            }
                            case VFXSpawnerTaskType.SetEventAttribute: {
                                const taskDesc = new VFXSpawnerSetEventAttributeTaskDesc();
                                taskDesc.attribute = String(task.attribute ?? "lifetime");
                                if (Array.isArray(task.value) && task.value.length === 4) {
                                    taskDesc.value = [Number(task.value[0]) || 0, Number(task.value[1]) || 0, Number(task.value[2]) || 0, Number(task.value[3]) || 0];
                                }
                                taskDesc.fromLoopIndex = !!task.fromLoopIndex;
                                taskDesc.loopIndexModulo = Number(task.loopIndexModulo) || 0;
                                taskDesc.fromSpawnStateLoop = !!task.fromSpawnStateLoop;
                                desc.tasks.push(taskDesc);
                                break;
                            }
                            default:
                                break;
                        }

                    });

                    vfxAsset.systems.push(desc);
                    break;
                }
                case VFXSystemType.Particle: {
                    const desc = new VFXParticleSystemDesc();
                    const initializeUrl = URL.join(baseUrl, sys.initializeShader as string);
                    const updateUrl = URL.join(baseUrl, sys.updateShader as string);
                    const outputUrl = URL.join(baseUrl, sys.outputShader as string);
                    const prepareDispatchUrl = URL.join(baseUrl, sys.prepareDispatchShader as string);
                    const updateStripsUrl = URL.join(baseUrl, sys.updateStripsShader as string);

                    desc.capacity = sys.capacity;
                    desc.attributeBytesPerParticle = sys.attributeBytesPerParticle;
                    desc.outputType = sys.outputType || "outputMesh";
                    desc.particlePerStripCount = sys.particlePerStripCount ?? 128;
                    desc.stripCapacity = sys.stripCapacity ?? 1;
                    // Billboard procedural：对齐 Unity VFXPlanarPrimitiveOutput，编译器写入 primitive/vertexCount/cropFactor
                    desc.billboardPrimitive = (sys.billboardPrimitive as string) || "";
                    desc.billboardVertexCount = Number(sys.billboardVertexCount) || 0;
                    desc.distortionMode = (sys.distortionMode as string) || "Procedural";
                    desc.billboardCropFactor = Number(sys.billboardCropFactor ?? 0.146);
                    // Alpha Clipping (Unity VFXPlanarPrimitiveOutput useAlphaClipping)
                    (desc as any).useAlphaClipping = !!sys.useAlphaClipping;
                    (desc as any).alphaThreshold = Number(sys.alphaThreshold ?? 0.5);

                    if (sys.spawnerSystems) {
                        desc.spawnerSystems.push(...(sys.spawnerSystems as Array<number>));
                    }
                    desc.receiveGPUEvent = sys.receiveGPUEvent ?? false;

                    // 解析模拟空间
                    if (sys.simulateSpace === "World") {
                        desc.simulateSpace = VFXSimulateSpace.World;
                    }

                    // 解析 blendMode
                    if (sys.blendMode && VFXBlendMode[sys.blendMode as keyof typeof VFXBlendMode]) {
                        desc.blendMode = sys.blendMode as VFXBlendMode;
                    }

                    // 解析 Soft Particle 淡出距离
                    if (typeof sys.softParticleFade === "number") {
                        desc.softParticleFade = sys.softParticleFade;
                    }

                    // 解析 Flipbook UV Mode + 图集尺寸（对齐 Unity VFX Output UV Mode）
                    if (typeof sys.uvMode === "string") desc.uvMode = sys.uvMode;
                    if (Array.isArray(sys.flipbookSize)) {
                        desc.flipbookSize = new Vector2(
                            sys.flipbookSize[0] || 4,
                            sys.flipbookSize[1] || 4
                        );
                    }
                    // mainTexture (atlas)：Flipbook/FlipbookBlend 模式下作为 BillboardMaterial.u_AlbedoTexture
                    if (typeof sys.mainTexture === "string" && sys.mainTexture) {
                        (desc as any).mainTexture = URL.join(baseUrl, sys.mainTexture);
                    }
                    if (sys.subpixelAA) desc.subpixelAA = true;
                    if (typeof sys.customShaderName === "string" && sys.customShaderName) {
                        desc.customShaderName = sys.customShaderName;
                    }
                    // customShaderRes: .bps blueprint shader asset
                    // 让 Laya.loader 预加载 .bps 触发 Shader3D 注册（否则 mat.setShaderName 找不到会报 unknown shader name）
                    if (typeof sys.customShaderRes === "string" && sys.customShaderRes) {
                        const shaderUrl = URL.join(baseUrl, sys.customShaderRes);
                        (desc as any).customShaderRes = shaderUrl;
                        loadPromises.push(
                            (Laya.loader.load(shaderUrl) as Promise<any>).then(
                                () => { console.log(`[VFX Parser] preloaded custom shader '${sys.customShaderName}' from ${shaderUrl}`); },
                                (err: any) => { console.warn(`[VFX Parser] failed preloading custom shader '${sys.customShaderName}' from ${shaderUrl}`, err); }
                            )
                        );
                    }
                    // ShaderGraph property binding (VFX exposed prop name → shader uniform name) — runtime setTexture 时按 binding 把 exposed name 转 shader uniform name
                    if (sys.shaderPropertyBindings && typeof sys.shaderPropertyBindings === "object") {
                        (desc as any).shaderPropertyBindings = sys.shaderPropertyBindings;
                    }
                    // ShaderGraph property inline defaults (shader uniform name → asset URL) — wall mesh 等 outputCtx 给 shader 属性写的 inline 资源 default
                    // .bps 编译时丢了这种 inline default，runtime 必须显式 setTexture 让 wall mesh 等用 uni_ring_warped 而非 .bps 内 white texture
                    if (sys.shaderPropertyDefaults && typeof sys.shaderPropertyDefaults === "object") {
                        const entries: { [uniformName: string]: { url: string, texture: any } } = {};
                        for (const uniformName in sys.shaderPropertyDefaults) {
                            // ⚠ "mesh" 不是 shader 纹理 uniform，而是 mesh 输出的 mesh 资源（系统 mesh 字段另有，几何用）。
                            //    误当纹理 load → setTexture 把 Mesh 塞进纹理槽 → WebGPU _updateTextureState 崩
                            //    (mesh._texture._getSampleBindingLayout is not a function)。materialize 类特效会带这个键。
                            if (uniformName === "mesh") continue;
                            const path: string = sys.shaderPropertyDefaults[uniformName];
                            if (typeof path !== "string" || !path) continue;
                            const url = URL.join(baseUrl, path);
                            const entry = { url, texture: null as any };
                            entries[uniformName] = entry;
                            loadPromises.push(
                                (Laya.loader.load(url) as Promise<any>).then(
                                    // Laya.loader.load 返回 Texture / Texture2D / BaseTexture, setTexture 期望 Laya Texture 不是 unwrap .bitmap (ImageBitmap).
                                    // 之前 .bitmap unwrap 让 setTexture 拿 ImageBitmap 实例 binding fail, MaskTexture sample 拿 default white.
                                    (tex: any) => { if (tex) entry.texture = tex; },
                                    (err: any) => { console.warn(`[VFX] shaderPropertyDefault '${uniformName}' load failed: ${url}`, err); }
                                )
                            );
                        }
                        (desc as any).shaderPropertyDefaults = entries;
                    }
                    // ShaderGraph property expression chain（VFX operator chain → shader uniform 每帧求值）
                    // 转换器把上游不是 VFXParameter 的 operator chain 序列化到 shaderPropertyExpressions，
                    // 让 ShaderExpressionEvaluator 每帧 evaluate → setVector/setNumber 到 material
                    if (sys.shaderPropertyExpressions && typeof sys.shaderPropertyExpressions === "object") {
                        (desc as any).shaderPropertyExpressions = sys.shaderPropertyExpressions;
                    }

                    // Strip 专属字段（对齐 Unity Output Trail）
                    if (typeof sys.colorMapping === "string") desc.stripColorMapping = sys.colorMapping;
                    if (typeof sys.tilingMode === "string") (desc as any).tilingMode = sys.tilingMode;
                    if (sys.uvScale && typeof sys.uvScale === "object") {
                        desc.stripUvScale = { x: Number(sys.uvScale.x ?? 1), y: Number(sys.uvScale.y ?? 1) };
                    }
                    if (sys.uvBias && typeof sys.uvBias === "object") {
                        desc.stripUvBias = { x: Number(sys.uvBias.x ?? 0), y: Number(sys.uvBias.y ?? 0) };
                    }
                    // gradient: Unity 格式 colorKeys+alphaKeys → 合并成 Laya stops 格式 (跟 sampleGradient 一致)
                    if (sys.gradient && typeof sys.gradient === "object" && Array.isArray(sys.gradient.colorKeys)) {
                        const gck = sys.gradient.colorKeys, gak = sys.gradient.alphaKeys || [];
                        const allTimes = new Set<number>();
                        gck.forEach((k: any) => allTimes.add(Number(k.time) || 0));
                        gak.forEach((k: any) => allTimes.add(Number(k.time) || 0));
                        const sortedTimes = [...allTimes].sort((a, b) => a - b);
                        const sampleColor = (t: number) => {
                            if (gck.length === 0) return { r: 1, g: 1, b: 1 };
                            if (t <= gck[0].time) return gck[0].color;
                            if (t >= gck[gck.length - 1].time) return gck[gck.length - 1].color;
                            for (let i = 0; i < gck.length - 1; i++) {
                                const a = gck[i], b = gck[i + 1];
                                if (t >= a.time && t <= b.time) {
                                    const f = (t - a.time) / (b.time - a.time + 1e-8);
                                    return { r: a.color.r + (b.color.r - a.color.r) * f, g: a.color.g + (b.color.g - a.color.g) * f, b: a.color.b + (b.color.b - a.color.b) * f };
                                }
                            }
                            return gck[gck.length - 1].color;
                        };
                        const sampleAlpha = (t: number) => {
                            if (gak.length === 0) return 1;
                            if (t <= gak[0].time) return gak[0].alpha;
                            if (t >= gak[gak.length - 1].time) return gak[gak.length - 1].alpha;
                            for (let i = 0; i < gak.length - 1; i++) {
                                const a = gak[i], b = gak[i + 1];
                                if (t >= a.time && t <= b.time) {
                                    const f = (t - a.time) / (b.time - a.time + 1e-8);
                                    return a.alpha + (b.alpha - a.alpha) * f;
                                }
                            }
                            return gak[gak.length - 1].alpha;
                        };
                        desc.stripGradientStops = sortedTimes.map(t => {
                            const c = sampleColor(t);
                            const a = sampleAlpha(t);
                            return { t, color: [c.r, c.g, c.b, a] as [number, number, number, number] };
                        });
                    }

                    // 解析包围盒模式
                    if (sys.boundsMode === "Manual") {
                        desc.boundsMode = VFXBoundsMode.Manual;
                        const c = sys.boundsCenter;
                        const e = sys.boundsExtents;
                        desc.boundsCenter = new Vector3(c[0], c[1], c[2]);
                        desc.boundsExtents = new Vector3(e[0], e[1], e[2]);
                    }

                    // 解析 GPU 事件输入配置
                    if (sys.gpuEventInput) {
                        desc.gpuEventInput = {
                            sourceSystem: sys.gpuEventInput.sourceSystem,
                            eventType: sys.gpuEventInput.eventType as VFXGPUEventType,
                        };
                    }

                    // 将 shader 加载 promise 添加到数组中
                    const shaderUrls: string[] = [initializeUrl, updateUrl];
                    if (outputUrl) {
                        shaderUrls.push(outputUrl);
                    }
                    if (prepareDispatchUrl) {
                        shaderUrls.push(prepareDispatchUrl);
                    }
                    if (updateStripsUrl) {
                        shaderUrls.push(updateStripsUrl);
                    }
                    const loadCompute = Laya.loader.load(shaderUrls).then((shaders: ComputeShader[]) => {
                        desc.initializeShader = shaders[0];
                        desc.updateShader = shaders[1];
                        let nextIdx = 2;
                        if (outputUrl) {
                            desc.outputShader = shaders[nextIdx++];
                        }
                        if (prepareDispatchUrl && shaders[nextIdx]) {
                            desc.prepareDispatchShader = shaders[nextIdx++];
                        }
                        if (updateStripsUrl && shaders[nextIdx]) {
                            desc.updateStripsShader = shaders[nextIdx];
                        }
                    });
                    loadPromises.push(loadCompute);

                    const meshUrl = URL.join(baseUrl, sys.mesh as string);
                    // Billboard / Cube procedural 不需要 mesh（VFXBillboardGeometry 用 gl_VertexID 生成顶点）
                    const isProceduralGeometry = (desc.outputType === "outputBillboard" || desc.outputType === "outputCube" || desc.outputType === "outputDistortion") && !!desc.billboardPrimitive;
                    const buildMeshFallback = (): Mesh => {
                        if (desc.outputType === "outputMesh" || desc.outputType === "outputStaticMesh") {
                            return PrimitiveMesh.createSphere(0.5, 12, 12);
                        }
                        // outputShaderGraphQuad / Billboard / Point / Line 无显式 mesh：用内置 Quad
                        return PrimitiveMesh.createQuad(1, 1);
                    };
                    // builtin: 前缀表示 Unity 内置 primitive mesh（converter 检测 guid=0000-e000+fileID 后写入）
                    // 直接用 PrimitiveMesh.createXxx 创建对齐尺寸（Unity 内置 Sphere/Cube 都是 1m，Plane 是 10m，Quad 1m）
                    const buildBuiltinMesh = (name: string): Mesh | null => {
                        switch (name) {
                            case "Sphere":   return PrimitiveMesh.createSphere(0.5, 12, 12);
                            case "Cube":     return PrimitiveMesh.createBox(1, 1, 1);
                            case "Cylinder": return PrimitiveMesh.createCylinder(0.5, 2, 12);
                            case "Capsule":  return PrimitiveMesh.createCapsule(0.5, 2, 12, 12);
                            case "Plane":    return PrimitiveMesh.createPlane(10, 10, 1, 1);
                            case "Quad":     return PrimitiveMesh.createQuad(1, 1);
                            case "Triangle": return PrimitiveMesh.createTriangle(1, 1);
                            default: return null;
                        }
                    };
                    if (meshUrl && meshUrl.startsWith("builtin:") && !isProceduralGeometry) {
                        const builtinName = meshUrl.slice(8);
                        desc.mesh = buildBuiltinMesh(builtinName) || buildMeshFallback();
                    } else if (meshUrl && !isProceduralGeometry) {
                        const loadMesh = Laya.loader.load(meshUrl).then(mesh => {
                            if (mesh) {
                                desc.mesh = mesh as Mesh;
                            } else {
                                console.error(`[VFX] mesh load returned null: ${meshUrl} (system mesh) — fallback to builtin`);
                                desc.mesh = buildMeshFallback();
                            }
                        }).catch(err => {
                            console.error(`[VFX] mesh load failed: ${meshUrl} (system mesh)`, err);
                            desc.mesh = buildMeshFallback();
                        });
                        loadPromises.push(loadMesh);
                    } else if (!isProceduralGeometry) {
                        // mesh 输出但未指定 mesh —— 即暴露的 Mesh 属性未赋值（materialize/dissolve 这类效果
                        // 在未绑定"被溶解模型"时 mesh 槽为空）。Unity 下此时渲染 nothing，绝不能 fallback 成球。
                        // mesh 类输出（outputMesh/outputStaticMesh）→ 置 outputType="none"：geometry 不创建、
                        // output 不绘制，simulation 仍跑（与 Unity 一致，且后续运行时 setMesh 赋值可恢复）。
                        // 注意：mesh 已指定但加载失败（load 返回 null/异常）仍保留 debug 球，便于排查真实错误。
                        if (desc.outputType === "outputMesh" || desc.outputType === "outputStaticMesh") {
                            desc.outputType = "none";
                        } else {
                            // 非 mesh 输出（outputShaderGraphQuad 等无显式 mesh）→ 内置 quad，正常行为
                            desc.mesh = buildMeshFallback();
                        }
                    }

                    // 解析 textureUniforms（VectorField / SampleTexture 等 block/op 引用的 3D/2D 纹理）
                    if (sys.textureUniforms && Array.isArray(sys.textureUniforms)) {
                        for (const tu of sys.textureUniforms) {
                            const uuid = tu.uuid as string;
                            const uniformName = tu.uniformName as string;
                            const textureType = tu.textureType as string;
                            const entry: any = { uniformName, texture: null as any, textureType };
                            desc.textureUniforms.push(entry);

                            // SkinnedMesh entry：runtime 通过 effect.setSkinnedMeshSource 拿 SkinnedMeshRenderer 后烘焙
                            // textureType 形如 SkinnedMesh_position / SkinnedMesh_indices / SkinnedMesh_weights / SkinnedMesh_normal / SkinnedMesh_bones
                            // uuid 字段存的是 sourceName（IDE 编译器约定）
                            const skinnedMeshMatch = /^SkinnedMesh_(position|indices|weights|normal|bones)$/.exec(textureType);
                            if (skinnedMeshMatch) {
                                entry.skinnedMeshSource = uuid;
                                entry.skinnedMeshRole = skinnedMeshMatch[1];
                                continue;   // 不进入下面的 .lmat / mesh / pcache loader 路径
                            }

                            // SkinnedMeshTransform/VFXTransform：Mat4 uniform，非纹理。记 transformSource，
                            // 引擎 VisualEffect._updateTransformSources 每帧把注册节点世界矩阵绑到该 uniform。
                            if (textureType === "Transform") {
                                entry.transformSource = uuid;
                                continue;
                            }

                            // 内联 Gradient：不需要加载 UUID，直接用编译器透传的 stops 烘焙 256×1 RGBA8 纹理
                            if (textureType === "InlineGradient") {
                                const rawStops = Array.isArray(tu.gradientStops) ? tu.gradientStops : [];
                                const stops = rawStops.map((s: any) => ({
                                    t: Number(s.t) || 0,
                                    color: [
                                        Number(s.color?.r ?? 1),
                                        Number(s.color?.g ?? 1),
                                        Number(s.color?.b ?? 1),
                                        Number(s.color?.a ?? 1),
                                    ] as [number, number, number, number],
                                }));
                                stops.sort((a: { t: number }, b: { t: number }) => a.t - b.t);
                                if (stops.length === 0) {
                                    stops.push({ t: 0, color: [1, 1, 1, 1] });
                                    stops.push({ t: 1, color: [1, 1, 1, 0] });
                                }
                                entry.texture = bakeInlineGradientTexture(stops);
                                continue;
                            }

                            // 空 uuid：保留 entry（texture=null），由 VisualEffect 初始化时绑默认纹理
                            if (!uuid) continue;
                            const resourceUrl = URL.join(baseUrl, uuid);
                            // Mesh 属性烘焙：textureType 形如 "MeshPos"/"MeshPosition"/"MeshNormal"/"MeshTangent"/"MeshUv"/"MeshColor"
                            //   或 point cache 形如 "MeshSurfacePoints"/"MeshVolumePoints"
                            const meshPCMatch = /^Mesh(SurfacePoints|VolumePoints)$/.exec(textureType);
                            const meshRoleMatch = !meshPCMatch ? /^Mesh(Pos|Position|Normal|Tangent|Uv|UV|Color|Index)$/.exec(textureType) : null;
                            const pointCacheMatch = (!meshPCMatch && !meshRoleMatch) ? /^PointCache_(.+)$/.exec(textureType) : null;
                            if (meshPCMatch) {
                                const pcRole = meshPCMatch[1] === "SurfacePoints" ? "surface" : "volume";
                                const pointCount = Math.max(16, Math.min(8192, Number((tu as any).pointCount) || 1024));
                                // 顶点缩放：优先用转换器注入的 meshScale(数据驱动)；.lvfx 没带时对已知 cm-unit
                                // mesh(Ellen.fbx)兜底 0.01；内置 mesh → 1.0(替代旧 ×0.01 硬编码，后者会错误缩小内置 mesh)。
                                const meshScale = _resolveMeshScale(Number((tu as any).meshScale), uuid);
                                if (uuid.startsWith("builtin:")) {
                                    // 内置 mesh（如 Capsule）：同步生成 + 烘点云，无异步加载（不会卡住 asset 加载）
                                    const builtinMesh = buildBuiltinMesh(uuid.slice(8));
                                    if (builtinMesh) entry.texture = pcRole === "surface"
                                        ? bakeMeshSurfacePoints(builtinMesh, pointCount, meshScale)
                                        : bakeMeshVolumePoints(builtinMesh, pointCount, meshScale);
                                    else console.warn(`[VFX] setPositionMesh(${pcRole}): unknown builtin mesh ${uuid}`);
                                } else {
                                    const loadMeshTex = Laya.loader.load(resourceUrl).then((mesh: Mesh) => {
                                        if (mesh) entry.texture = pcRole === "surface"
                                            ? bakeMeshSurfacePoints(mesh, pointCount, meshScale)
                                            : bakeMeshVolumePoints(mesh, pointCount, meshScale);
                                        else console.warn(`[VFX] setPositionMesh(${pcRole}): failed to load mesh ${resourceUrl}`);
                                    });
                                    loadPromises.push(loadMeshTex);
                                }
                            } else if (meshRoleMatch) {
                                const role = meshRoleMatch[1].toLowerCase();
                                const normalizedRole = role === "pos" ? "position" : (role === "uv" ? "uv" : role);
                                const loadMeshTex = Laya.loader.load(resourceUrl).then((mesh: Mesh) => {
                                    if (mesh) {
                                        entry.texture = bakeMeshAttributeTexture(mesh, normalizedRole as MeshRole);
                                    } else {
                                        console.warn(`[VFX] sampleMesh: failed to load mesh ${resourceUrl}`);
                                    }
                                });
                                loadPromises.push(loadMeshTex);
                            } else if (pointCacheMatch) {
                                const attrName = pointCacheMatch[1];
                                const loadPCache = Laya.loader.fetch(resourceUrl, "json", null).then((pcache: any) => {
                                    if (pcache) entry.texture = bakePointCacheTexture(pcache, attrName);
                                    else console.warn(`[VFX] samplePointCache: failed to load ${resourceUrl}`);
                                });
                                loadPromises.push(loadPCache);
                            } else {
                                const loadTex = Laya.loader.load(resourceUrl).then((tex: BaseTexture) => {
                                    entry.texture = tex;
                                });
                                loadPromises.push(loadTex);
                            }
                        }
                    }

                    // 解析 bufferUniforms（sampleGraphicsBuffer operator 引用的 StorageBuffer / setPositionMesh 点云）
                    if (sys.bufferUniforms && Array.isArray(sys.bufferUniforms)) {
                        for (const bu of sys.bufferUniforms) {
                            if ((bu as any).meshProp) {
                                // setPositionMesh 点云: 烘 mesh 表面/体积点 → DeviceBuffer (对齐 Unity buffer 采样, 绕开 compute 纹理绑定 bug)
                                const mpEntry: any = { uniformName: bu.uniformName as string, buffer: null };
                                desc.meshPointBuffers.push(mpEntry);
                                const pcUuid = String((bu as any).meshProp);
                                const pcUrl = URL.join(baseUrl, pcUuid);
                                const pcRole = String((bu as any).meshRole || "surfacePoints");
                                const pcCount = Math.max(16, Math.min(8192, Number((bu as any).pointCount) || 1024));
                                const pcScale = _resolveMeshScale(Number((bu as any).meshScale), pcUuid);
                                loadPromises.push((Laya.loader.load(pcUrl) as Promise<any>).then((mesh: Mesh) => {
                                    if (mesh) mpEntry.buffer = pcRole === "volumePoints"
                                        ? bakeMeshVolumePointsBuffer(mesh, pcCount, pcScale)
                                        : bakeMeshSurfacePointsBuffer(mesh, pcCount, pcScale);
                                    else console.warn(`[VFX] setPositionMesh(buffer): failed to load mesh ${pcUrl}`);
                                }));
                            } else {
                                desc.bufferUniforms.push({
                                    uniformName: bu.uniformName as string,
                                    propertyName: bu.propertyName as string,
                                });
                            }
                        }
                    }

                    // 解析 outputEvents（triggerEvent block 路由到 outputEvent context）
                    if (sys.outputEvents && Array.isArray(sys.outputEvents)) {
                        for (const oe of sys.outputEvents) {
                            const desc_oe = new VFXOutputEventDesc();
                            desc_oe.eventIdx = Number(oe.eventIdx) || 0;
                            desc_oe.eventName = (oe.eventName as string) || "OnReceived";
                            desc_oe.eventType = (oe.eventType as string) || "OnDie";
                            desc_oe.capacity = Math.max(1, Number(oe.capacity) || 256);
                            desc_oe.entryFloats = Number(oe.entryFloats) || 16;
                            desc_oe.entryBytes = Number(oe.entryBytes) || 64;
                            desc.outputEvents.push(desc_oe);
                        }
                    }

                    // Multi-Output: 解析 extraOutputs
                    if (Array.isArray(sys.extraOutputs)) {
                        for (const eo of sys.extraOutputs) {
                            const extra = new VFXExtraOutputDesc();
                            extra.outputType = eo.outputType || "outputMesh";
                            extra.blendMode = (eo.blendMode || "Alpha") as VFXBlendMode;
                            extra.softParticleFade = Number(eo.softParticleFade) || 0;
                            if (typeof eo.uvMode === "string") extra.uvMode = eo.uvMode;
                            if (Array.isArray(eo.flipbookSize)) {
                                extra.flipbookSize = new Vector2(eo.flipbookSize[0] || 4, eo.flipbookSize[1] || 4);
                            }
                            if (typeof eo.mainTexture === "string" && eo.mainTexture) {
                                (extra as any).mainTexture = URL.join(baseUrl, eo.mainTexture);
                            }
                            if (eo.subpixelAA) extra.subpixelAA = true;
                            if (eo.customShaderName) extra.customShaderName = eo.customShaderName;
                            if (typeof eo.customShaderRes === "string" && eo.customShaderRes) {
                                const exShaderUrl = URL.join(baseUrl, eo.customShaderRes);
                                (extra as any).customShaderRes = exShaderUrl;
                                loadPromises.push(
                                    (Laya.loader.load(exShaderUrl) as Promise<any>).then(
                                        () => { console.log(`[VFX Parser] preloaded extra custom shader '${eo.customShaderName}' from ${exShaderUrl}`); },
                                        (err: any) => { console.warn(`[VFX Parser] failed preloading extra custom shader '${eo.customShaderName}' from ${exShaderUrl}`, err); }
                                    )
                                );
                            }
                            extra.stripCapacity = Number(eo.stripCapacity) || 1;
                            extra.particlePerStripCount = Number(eo.particlePerStripCount) || 128;
                            extra.billboardPrimitive = (eo.billboardPrimitive as string) || "";
                            extra.billboardVertexCount = Number(eo.billboardVertexCount) || 0;
                            extra.billboardCropFactor = Number(eo.billboardCropFactor ?? 0.146);
                            // Alpha Clipping（extra outputBillboard，Debug Index 等用 atlas mask 时必需）
                            extra.useAlphaClipping = !!eo.useAlphaClipping;
                            extra.alphaThreshold = Number(eo.alphaThreshold ?? 0.5);
                            // Strip 专属（extra outputTrail）：tilingMode 让 runtime VFXStrip shader 决定 UV 拉伸 vs 每段 tile
                            extra.tilingMode = (eo.tilingMode as string) || "Stretch";
                            extra.colorMapping = (eo.colorMapping as string) || "Default";
                            extra.uvScale = eo.uvScale as any;
                            extra.uvBias = eo.uvBias as any;
                            // 加载 output shader
                            if (eo.outputShader) {
                                const outputShaderUrl = URL.join(baseUrl, eo.outputShader as string);
                                const loadExtraShader = Laya.loader.load(outputShaderUrl).then((shader: ComputeShader) => {
                                    extra.outputShader = shader;
                                });
                                loadPromises.push(loadExtraShader);
                            }
                            // 加载 mesh
                            const meshUrl = URL.join(baseUrl, eo.mesh as string);
                            const buildExtraMeshFallback = (): Mesh => {
                                return extra.outputType === "outputMesh" || extra.outputType === "outputStaticMesh"
                                    ? PrimitiveMesh.createSphere(0.5, 12, 12)
                                    : PrimitiveMesh.createQuad(1, 1);
                            };
                            // builtin: 前缀 → PrimitiveMesh.createXxx 同步创建
                            if (meshUrl && meshUrl.startsWith("builtin:")) {
                                const builtinName = meshUrl.slice(8);
                                extra.mesh = buildBuiltinMesh(builtinName) || buildExtraMeshFallback();
                            } else if (meshUrl) {
                                const loadMesh = Laya.loader.load(meshUrl).then((mesh: Mesh) => {
                                    if (mesh) {
                                        extra.mesh = mesh;
                                    } else {
                                        console.error(`[VFX] mesh load returned null: ${meshUrl} (extra output) — fallback to builtin`);
                                        extra.mesh = buildExtraMeshFallback();
                                    }
                                }).catch(err => {
                                    console.error(`[VFX] mesh load failed: ${meshUrl} (extra output)`, err);
                                    extra.mesh = buildExtraMeshFallback();
                                });
                                loadPromises.push(loadMesh);
                            } else {
                                extra.mesh = buildExtraMeshFallback();
                            }
                            desc.extraOutputs.push(extra);
                        }
                    }

                    vfxAsset.systems.push(desc);
                    break;
                }
                case VFXSystemType.StaticMesh: {
                    const desc = new VFXStaticMeshSystemDesc();
                    desc.materialUuid = URL.join(baseUrl, String(sys.materialUuid || ""));
                    if (Array.isArray(sys.bindings)) {
                        desc.bindings = sys.bindings as any;
                    }
                    const meshUrl = URL.join(baseUrl, sys.mesh as string);
                    const buildStaticBuiltin = (name: string): Mesh | null => {
                        switch (name) {
                            case "Sphere":   return PrimitiveMesh.createSphere(0.5, 12, 12);
                            case "Cube":     return PrimitiveMesh.createBox(1, 1, 1);
                            case "Cylinder": return PrimitiveMesh.createCylinder(0.5, 2, 12);
                            case "Capsule":  return PrimitiveMesh.createCapsule(0.5, 2, 12, 12);
                            case "Plane":    return PrimitiveMesh.createPlane(10, 10, 1, 1);
                            case "Quad":     return PrimitiveMesh.createQuad(1, 1);
                            case "Triangle": return PrimitiveMesh.createTriangle(1, 1);
                            default: return null;
                        }
                    };
                    if (meshUrl && meshUrl.startsWith("builtin:")) {
                        desc.mesh = buildStaticBuiltin(meshUrl.slice(8)) || PrimitiveMesh.createSphere(0.5, 12, 12);
                    } else if (meshUrl) {
                        const loadMesh = Laya.loader.load(meshUrl).then(mesh => {
                            if (mesh) {
                                desc.mesh = mesh as Mesh;
                            } else {
                                console.error(`[VFX] mesh load returned null: ${meshUrl} (StaticMesh) — fallback to sphere`);
                                desc.mesh = PrimitiveMesh.createSphere(0.5, 12, 12);
                            }
                        }).catch(err => {
                            console.error(`[VFX] mesh load failed: ${meshUrl} (StaticMesh)`, err);
                            desc.mesh = PrimitiveMesh.createSphere(0.5, 12, 12);
                        });
                        loadPromises.push(loadMesh);
                    } else {
                        // mesh 未指定 → fallback sphere（让用户至少看到东西）
                        desc.mesh = PrimitiveMesh.createSphere(0.5, 12, 12);
                    }
                    vfxAsset.systems.push(desc);
                    break;
                }
                default:
                    break;
            }

        });

        // 解析 properties
        if (data.properties) {
            for (const prop of data.properties) {
                const desc = new VFXPropertyDesc();
                desc.name = prop.name;
                desc.uniform = prop.uniform;
                // IDE 端类型字符串归一化（number / Float / Gradient 等 → enum 值）
                desc.type = normalizePropertyType(prop.type);
                const d = prop.default;
                switch (desc.type) {
                    case VFXPropertyType.Float:
                        desc.default = [d];
                        break;
                    case VFXPropertyType.Vec2:
                        desc.default = [d.x, d.y];
                        break;
                    case VFXPropertyType.Vec3:
                        desc.default = [d.x, d.y, d.z];
                        break;
                    case VFXPropertyType.Vec4:
                        desc.default = [d.x, d.y, d.z, d.w];
                        break;
                    case VFXPropertyType.Color:
                        desc.default = [d.r ?? d.x ?? 1, d.g ?? d.y ?? 1, d.b ?? d.z ?? 1, d.a ?? d.w ?? 1];
                        break;
                    case VFXPropertyType.Gradient: {
                        // 默认值形如 { stops: [{ t, color: {r,g,b,a} }] }
                        const stops = Array.isArray(d?.stops) ? d.stops : [];
                        desc.gradientStops = stops.map((s: any) => ({
                            t: Number(s.t) || 0,
                            color: [
                                Number(s.color?.r ?? 1),
                                Number(s.color?.g ?? 1),
                                Number(s.color?.b ?? 1),
                                Number(s.color?.a ?? 1),
                            ] as [number, number, number, number],
                        }));
                        // 排序 + 保底至少两个关键帧
                        desc.gradientStops.sort((a, b) => a.t - b.t);
                        if (desc.gradientStops.length === 0) {
                            desc.gradientStops = [
                                { t: 0, color: [1, 1, 1, 1] },
                                { t: 1, color: [1, 1, 1, 0] },
                            ];
                        }
                        desc.default = [];
                        break;
                    }
                    case VFXPropertyType.Texture2D: {
                        // Texture2D property: d 是 string 或 string array（转换器统一输出后者）
                        // Unity VFX exposed prop 跟 ShaderGraph 内 shader uniform 是双命名空间，OutputContext 含 binding；
                        // 这里只 load 资源存到 desc.texture，setTexture 绑定 shader uniform 在 VisualEffect.onStart 用 binding 名做
                        let path: string | null = null;
                        if (Array.isArray(d) && typeof d[0] === "string") path = d[0];
                        else if (typeof d === "string") path = d;
                        const url = path ? URL.join(baseUrl, path) : null;
                        desc.default = url ? [url] : [];
                        desc.texture = null;
                        if (url) {
                            const loadTex = Laya.loader.load(url).then((tex: any) => {
                                if (tex) {
                                    // loader 对 PNG 返回 Texture wrapper，取其 bitmap (Texture2D) 用来 bind shader sampler
                                    desc.texture = tex.bitmap || tex._image || tex._source || tex;
                                } else {
                                    console.warn(`[VFX] Texture2D property '${prop.name}' load returned null: ${url}`);
                                }
                            }, (err: any) => {
                                console.warn(`[VFX] Texture2D property '${prop.name}' load failed: ${url}`, err);
                            });
                            loadPromises.push(loadTex);
                        }
                        break;
                    }
                }
                vfxAsset.properties.push(desc);
            }
        }

        const descs = getDescMap(data.eventAttributes as Array<{ name: string, type: string }>);

        vfxAsset.eventAttributeDesc = new VFXEventAttributeDesc(descs);

        (data.events as Array<any>).forEach(evt => {
            const evtDesc = new VFXEventDesc();
            evtDesc.id = Shader3D.propertyNameToID(evt.name);
            evtDesc.playSystems.push(...evt.playSystems);
            evtDesc.stopSystems.push(...evt.stopSystems);
            evtDesc.initSystems.push(...evt.initSystems);
            vfxAsset.events.set(evtDesc.id, evtDesc);
        });

        // 解析 curveUniforms
        if (data.curveUniforms) {
            for (const cu of data.curveUniforms) {
                const desc = new VFXCurveUniformDesc();
                desc.opId = cu.opId;
                desc.uniform = cu.uniform;
                desc.curveData = cu.curveData as number[];
                vfxAsset.curveUniforms.push(desc);
            }
        }

        // 解析 bakedTexture
        if (data.bakedTexture) {
            const bakedTextureUrl = URL.join(baseUrl, data.bakedTexture as string);
            const loadBakedTex = Laya.loader.load(bakedTextureUrl).then((tex: BaseTexture) => {
                vfxAsset.bakedTexture = tex;
            });
            loadPromises.push(loadBakedTex);
        }

        // 等待所有资源加载完成
        await Promise.all(loadPromises);

        // 资源加载完成后，由 VFXAsset 统一注册依赖
        vfxAsset.resolveDeps();

        return vfxAsset;
    }

}

/**
 * 把 Mesh 顶点的 position 打包成 RGBA32F Texture2D（宽 = 顶点数 / 高 = 1）。
 * setPositionMesh block 在 compute shader 里通过 texelFetch(tex, ivec2(i, 0), 0) 取点。
 * 对齐 Unity VFX Graph 的 Point Cache 方案。
 */
/**
 * 按关键帧烘焙 256×1 RGBA8 Gradient Texture2D
 * 用于 sampleGradient operator 的 inline gradient 分支（textureLod(tex, vec2(t, 0.5), 0)）
 * 与 VisualEffect.bakeGradientTexture（Graph Property 用）算法一致但独立定义避免跨文件耦合
 */
// float32 → float16 bits（渐变 HDR 烘焙用；R16G16B16A16=rgba16float 原始字节直传）
const _f16ScratchF32 = new Float32Array(1);
const _f16ScratchU32 = new Uint32Array(_f16ScratchF32.buffer);
function _f32ToF16(v: number): number {
    _f16ScratchF32[0] = v;
    const bits = _f16ScratchU32[0];
    const sign = (bits >> 16) & 0x8000;
    const exp = ((bits >> 23) & 0xff) - 127 + 15;
    const frac = bits & 0x7fffff;
    if (exp <= 0) {
        if (exp < -10) return sign;
        const m = (frac | 0x800000) >> (1 - exp);
        return sign | (m >> 13);
    }
    if (exp >= 31) return sign | 0x7c00;
    return sign | (exp << 10) | (frac >> 13);
}

function bakeInlineGradientTexture(stops: { t: number; color: [number, number, number, number] }[]): Texture2D {
    const width = 256;
    const data = new Uint16Array(width * 4);
    const rawKeys = stops.length >= 2 ? stops : [
        { t: 0, color: [1, 1, 1, 1] as [number, number, number, number] },
        { t: 1, color: [1, 1, 1, 0] as [number, number, number, number] },
    ];
    // ⭐2026-06-11 HDR 直通：烘到 R16G16B16A16 半精度浮点纹理，不再 max-channel 归一化。
    // 归一化是 LDR framebuffer 时代的 crutch——保了 chroma 但丢强度，让 Unity 的 HDR 红(23.97,0,0)
    // 在 additive 下永远压不过低强度橙 → Buff 爆心橙白 vs Unity 饱和红的根因。
    // 场景 enableHDR(浮点 framebuffer)下直通才是 Unity 语义(LDR 场景 clip 爆白同样是 Unity 行为)。
    const sanitizeStop = (c: number[]): [number, number, number, number] => [
        Math.max(0, c[0]), Math.max(0, c[1]), Math.max(0, c[2]), Math.max(0, Math.min(1, c[3])),
    ];
    const keys = rawKeys.map(k => ({
        t: k.t,
        color: sanitizeStop(k.color),
    }));
    for (let i = 0; i < width; i++) {
        const t = i / (width - 1);
        let a = keys[0], b = keys[keys.length - 1];
        for (let k = 0; k < keys.length - 1; k++) {
            if (t >= keys[k].t && t <= keys[k + 1].t) { a = keys[k]; b = keys[k + 1]; break; }
        }
        const span = Math.max(b.t - a.t, 1e-6);
        const u = Math.max(0, Math.min(1, (t - a.t) / span));
        const r = a.color[0] + (b.color[0] - a.color[0]) * u;
        const g = a.color[1] + (b.color[1] - a.color[1]) * u;
        const bB = a.color[2] + (b.color[2] - a.color[2]) * u;
        const aA = a.color[3] + (b.color[3] - a.color[3]) * u;
        data[i * 4]     = _f32ToF16(r);
        data[i * 4 + 1] = _f32ToF16(g);
        data[i * 4 + 2] = _f32ToF16(bB);
        data[i * 4 + 3] = _f32ToF16(aA);
    }
    const tex = new Texture2D(width, 1, TextureFormat.R16G16B16A16, false, false, false, false);
    tex.setPixelsData(data, false, false);
    tex.wrapModeU = WrapMode.Clamp;
    tex.wrapModeV = WrapMode.Clamp;
    tex.filterMode = FilterMode.Bilinear;
    return tex;
}

type MeshRole = "position" | "normal" | "tangent" | "uv" | "color" | "index";

/**
 * 把 .pcache JSON 资源的指定 attribute 烘焙到 RGBA32F 1×N 纹理。
 * pcache 格式：{ elementCount: N, attributes: { <name>: number[][] } }
 *   每个 attribute 元素长度可为 1/2/3/4，自动 promote 到 vec4
 *   缺失 attribute 或元素 → 返回 1×1 black（不会崩 shader）
 */
function bakePointCacheTexture(pcache: any, attrName: string): Texture2D {
    let count = 1;
    let data: Float32Array = new Float32Array(4);
    try {
        const attrs = pcache?.attributes;
        const arr: any[] = attrs?.[attrName];
        if (Array.isArray(arr) && arr.length > 0) {
            count = arr.length;
            data = new Float32Array(count * 4);
            for (let i = 0; i < count; i++) {
                const v = arr[i];
                if (v == null) continue;
                if (typeof v === "number") {
                    data[i * 4] = v;
                } else if (Array.isArray(v)) {
                    data[i * 4] = v[0] ?? 0;
                    data[i * 4 + 1] = v[1] ?? 0;
                    data[i * 4 + 2] = v[2] ?? 0;
                    data[i * 4 + 3] = v[3] ?? (v.length === 3 ? 1 : 0);
                } else if (typeof v === "object") {
                    // 兼容 {x,y,z,w} / {r,g,b,a} 形式
                    data[i * 4]     = v.x ?? v.r ?? 0;
                    data[i * 4 + 1] = v.y ?? v.g ?? 0;
                    data[i * 4 + 2] = v.z ?? v.b ?? 0;
                    data[i * 4 + 3] = v.w ?? v.a ?? 0;
                }
            }
        } else {
            console.warn(`[VFX] samplePointCache: attribute "${attrName}" not found in pcache`);
        }
    } catch (e) {
        console.warn(`[VFX] bakePointCacheTexture(${attrName}) failed`, e);
    }
    const tex = new Texture2D(count, 1, TextureFormat.R32G32B32A32, false, false, false, false);
    tex.setPixelsData(new Uint8Array(data.buffer, data.byteOffset, data.byteLength), false, false);
    tex.wrapModeU = WrapMode.Clamp;
    tex.wrapModeV = WrapMode.Clamp;
    tex.filterMode = FilterMode.Point;
    return tex;
}

/**
 * 烘焙 Mesh 指定属性到 RGBA32F Texture2D（每顶点一像素）
 * role: "position"/"normal"/"tangent" → vec3+1.0, "uv" → vec2+0+0, "color" → vec4
 */
function bakeMeshAttributeTexture(mesh: Mesh, role: MeshRole = "position"): Texture2D {
    // color 失败 fallback 白色（mesh 无顶点色时不可见在黑背景上）；其他属性 fallback 0
    // 注意：Laya._getVerticeElementData 会先 data.length=vertexCount 再 if(element) 填充，
    //   所以 mesh 缺该顶点元素时 vs.length>0 但 vs[i] 全是 undefined，必须检查 vs[0] 是否存在
    // WebGPU 单维 texture max width = 16384, 大 mesh (>16384 vertex) 用 stride 抽样降到 16384 内
    // (粒子在 mesh 上分布密度降低但形状保留, 比超 limit GPUValidationError 整个不渲染好)
    const MAX_VERTS = 16384;
    let count = 1;
    let data: Float32Array = new Float32Array(4);
    if (role === "color") { data[0] = 1; data[1] = 1; data[2] = 1; data[3] = 1; }
    const hasData = (vs: any[]) => vs.length > 0 && vs[0] != null;
    try {
        // 大 mesh stride: 总顶点 N > MAX_VERTS 时, 每 stride=ceil(N/MAX_VERTS) 取 1 个,让 count<=MAX_VERTS
        const _calcStride = (totalCount: number) => totalCount > MAX_VERTS ? Math.ceil(totalCount / MAX_VERTS) : 1;
        if (role === "position") {
            const vs: Vector3[] = [];
            mesh.getPositions(vs);
            if (hasData(vs)) {
                const stride = _calcStride(vs.length);
                count = Math.ceil(vs.length / stride);
                data = new Float32Array(count * 4);
                for (let j = 0; j < count; j++) { const v = vs[j * stride]; if (!v) continue; data[j * 4] = v.x; data[j * 4 + 1] = v.y; data[j * 4 + 2] = v.z; data[j * 4 + 3] = 1.0; }
            }
        } else if (role === "normal") {
            const vs: Vector3[] = [];
            mesh.getNormals(vs);
            if (hasData(vs)) {
                const stride = _calcStride(vs.length);
                count = Math.ceil(vs.length / stride);
                data = new Float32Array(count * 4);
                for (let j = 0; j < count; j++) { const v = vs[j * stride]; if (!v) continue; data[j * 4] = v.x; data[j * 4 + 1] = v.y; data[j * 4 + 2] = v.z; data[j * 4 + 3] = 0.0; }
            }
        } else if (role === "tangent") {
            const vs: Vector4[] = [];
            mesh.getTangents(vs);
            if (hasData(vs)) {
                const stride = _calcStride(vs.length);
                count = Math.ceil(vs.length / stride);
                data = new Float32Array(count * 4);
                for (let j = 0; j < count; j++) { const v = vs[j * stride]; if (!v) continue; data[j * 4] = v.x; data[j * 4 + 1] = v.y; data[j * 4 + 2] = v.z; data[j * 4 + 3] = v.w; }
            }
        } else if (role === "uv") {
            const vs: Vector2[] = [];
            mesh.getUVs(vs);
            if (hasData(vs)) {
                const stride = _calcStride(vs.length);
                count = Math.ceil(vs.length / stride);
                data = new Float32Array(count * 4);
                for (let j = 0; j < count; j++) { const v = vs[j * stride]; if (!v) continue; data[j * 4] = v.x; data[j * 4 + 1] = v.y; data[j * 4 + 2] = 0.0; data[j * 4 + 3] = 0.0; }
            }
        } else if (role === "color") {
            const vs: Color[] = [];
            if ((mesh as any).getColors) {
                try { (mesh as any).getColors(vs); } catch { /* mesh 可能不可读，保留白色 fallback */ }
            }
            if (hasData(vs)) {
                const stride = _calcStride(vs.length);
                count = Math.ceil(vs.length / stride);
                data = new Float32Array(count * 4);
                // mesh 有顶点色 → 填充实际值；前面 if(role==="color") 写过白色已不再需要
                for (let j = 0; j < count; j++) { const v = vs[j * stride]; if (!v) { data[j * 4] = 1; data[j * 4 + 1] = 1; data[j * 4 + 2] = 1; data[j * 4 + 3] = 1; continue; } data[j * 4] = v.r; data[j * 4 + 1] = v.g; data[j * 4 + 2] = v.b; data[j * 4 + 3] = v.a; }
            }
        } else if (role === "index") {
            // mesh.getIndices() 返回 Uint8/16/32Array，每元素是 vertex ID
            // 烘焙到 RGBA32F 1D 纹理的 .r 通道（promote 成 float32），shader 端 textureLod(...).x 再 cast int
            const indices = (mesh as any).getIndices ? (mesh as any).getIndices() : null;
            if (indices && indices.length > 0) {
                const stride = _calcStride(indices.length);
                count = Math.ceil(indices.length / stride);
                data = new Float32Array(count * 4);
                for (let j = 0; j < count; j++) { data[j * 4] = indices[j * stride]; }
            }
        }
    } catch (e) {
        console.warn(`[VFX] bakeMeshAttributeTexture(${role}) failed`, e);
    }
    const tex = new Texture2D(count, 1, TextureFormat.R32G32B32A32, false, false, false, false);
    tex.setPixelsData(new Uint8Array(data.buffer, data.byteOffset, data.byteLength), false, false);
    tex.wrapModeU = WrapMode.Clamp;
    tex.wrapModeV = WrapMode.Clamp;
    tex.filterMode = FilterMode.Point;
    return tex;
}

// 向后兼容别名
/**
 * SkinnedMesh 顶点静态属性烘焙到 RGBA32F 1×N 纹理
 * @param role  "position" | "indices" | "weights" | "normal"
 *  - position/normal: vec3 → RGBA (.w 给 1)
 *  - indices: vec4 (4 骨骼索引)
 *  - weights: vec4 (4 骨骼权重)
 */
export function bakeSkinnedMeshVertexTexture(mesh: Mesh, role: "position" | "indices" | "weights" | "normal"): Texture2D {
    let count = 1;
    let data = new Float32Array(4);
    try {
        if (role === "position") {
            const vs: Vector3[] = []; mesh.getPositions(vs);
            if (vs.length > 0 && vs[0]) {
                count = vs.length; data = new Float32Array(count * 4);
                for (let i = 0; i < count; i++) { const v = vs[i]; if (!v) continue; data[i*4]=v.x; data[i*4+1]=v.y; data[i*4+2]=v.z; data[i*4+3]=1; }
            }
        } else if (role === "normal") {
            const vs: Vector3[] = []; mesh.getNormals(vs);
            if (vs.length > 0 && vs[0]) {
                count = vs.length; data = new Float32Array(count * 4);
                for (let i = 0; i < count; i++) { const v = vs[i]; if (!v) continue; data[i*4]=v.x; data[i*4+1]=v.y; data[i*4+2]=v.z; data[i*4+3]=0; }
            }
        } else if (role === "indices") {
            const vs: Vector4[] = []; mesh.getBoneIndices(vs);
            if (vs.length > 0 && vs[0]) {
                count = vs.length; data = new Float32Array(count * 4);
                for (let i = 0; i < count; i++) { const v = vs[i]; if (!v) continue; data[i*4]=v.x; data[i*4+1]=v.y; data[i*4+2]=v.z; data[i*4+3]=v.w; }
            }
        } else if (role === "weights") {
            const vs: Vector4[] = []; mesh.getBoneWeights(vs);
            if (vs.length > 0 && vs[0]) {
                count = vs.length; data = new Float32Array(count * 4);
                for (let i = 0; i < count; i++) { const v = vs[i]; if (!v) continue; data[i*4]=v.x; data[i*4+1]=v.y; data[i*4+2]=v.z; data[i*4+3]=v.w; }
            }
        }
    } catch (e) {
        console.warn(`[VFX] bakeSkinnedMeshVertexTexture(${role}) failed`, e);
    }
    const tex = new Texture2D(count, 1, TextureFormat.R32G32B32A32, false, false, false, false);
    tex.setPixelsData(new Uint8Array(data.buffer, data.byteOffset, data.byteLength), false, false);
    tex.wrapModeU = WrapMode.Clamp;
    tex.wrapModeV = WrapMode.Clamp;
    tex.filterMode = FilterMode.Point;
    return tex;
}

/**
 * 烘焙/更新 bones 矩阵到 256×1 RGBA32F 纹理（64 mat4 × 4 vec4）
 * 每帧调用 — skinningMatrix[i] = bones[i].worldMatrix * mesh._inverseBindPoses[i]
 * @param existingTex 复用现有纹理（避免每帧分配）；首次传 null 创建新纹理
 */
export function bakeSkinnedMeshBonesTexture(renderer: any, existingTex: Texture2D | null): Texture2D {
    const bones = renderer.bones as Sprite3D[];
    // LayaAir mesh 在 owner Sprite3D 的 MeshFilter 组件上（不在 SkinnedMeshRenderer 上）
    const mesh = renderer.owner?.getComponent?.(MeshFilter)?.sharedMesh as Mesh;
    const inverseBindPoses = (mesh as any)?._inverseBindPoses as Matrix4x4[];
    const data = new Float32Array(256 * 4);   // 64 mat4 × 4 vec4 = 1024 floats
    const tmpMtx = new Matrix4x4();
    const boneCount = Math.min(bones?.length ?? 0, 64);
    for (let i = 0; i < boneCount; i++) {
        const bone = bones[i];
        if (!bone) continue;
        const boneWorld = bone.transform.worldMatrix;
        const ibp = inverseBindPoses?.[i];
        // skinningMatrix = boneWorld * inverseBindPose
        if (ibp) {
            Matrix4x4.multiply(boneWorld, ibp, tmpMtx);
        } else {
            boneWorld.cloneTo(tmpMtx);
        }
        // GLSL mat4 是 column-major，elements 已是 column-major（同 Three / Unity）
        const e = tmpMtx.elements;
        const off = i * 16;
        for (let k = 0; k < 16; k++) data[off + k] = e[k];
    }
    let tex = existingTex;
    if (!tex) {
        tex = new Texture2D(256, 1, TextureFormat.R32G32B32A32, false, false, false, false);
        tex.wrapModeU = WrapMode.Clamp;
        tex.wrapModeV = WrapMode.Clamp;
        tex.filterMode = FilterMode.Point;
    }
    tex.setPixelsData(new Uint8Array(data.buffer, data.byteOffset, data.byteLength), false, false);
    return tex;
}

function bakeMeshPointCacheTexture(mesh: Mesh): Texture2D {
    return bakeMeshAttributeTexture(mesh, "position");
}

// ── Mesh 三角形拆解 ──
// 返回拍平的 (positions, indices)；若 mesh 不可读或无 subMesh，返回 null
function getMeshTriangles(mesh: Mesh): { positions: Vector3[]; indices: Uint16Array | Uint32Array } | null {
    try {
        const positions: Vector3[] = [];
        mesh.getPositions(positions);
        if (!positions.length || positions[0] == null) return null;
        // 拼接所有 subMesh 的 indices
        const subCount = (mesh as any).subMeshCount as number;
        if (!subCount) return null;
        const parts: (Uint16Array | Uint32Array)[] = [];
        let total = 0;
        for (let i = 0; i < subCount; i++) {
            const sm = (mesh as any).getSubMesh(i);
            if (!sm) continue;
            const idx = sm.getIndices() as (Uint16Array | Uint32Array);
            if (!idx || idx.length === 0) continue;
            parts.push(idx);
            total += idx.length;
        }
        if (total === 0) return null;
        // 全部转 Uint32Array 简化使用
        const indices = new Uint32Array(total);
        let off = 0;
        for (const p of parts) { indices.set(p, off); off += p.length; }
        return { positions, indices };
    } catch (e) {
        console.warn("[VFX] getMeshTriangles failed", e);
        return null;
    }
}

function _triArea(a: Vector3, b: Vector3, c: Vector3): number {
    const ux = b.x - a.x, uy = b.y - a.y, uz = b.z - a.z;
    const vx = c.x - a.x, vy = c.y - a.y, vz = c.z - a.z;
    const cx = uy * vz - uz * vy;
    const cy = uz * vx - ux * vz;
    const cz = ux * vy - uy * vx;
    return 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);
}

// Möller-Trumbore ray-triangle intersection；返回正向 t 距离或 null
function _rayTri(ox: number, oy: number, oz: number, dx: number, dy: number, dz: number,
    a: Vector3, b: Vector3, c: Vector3): number | null {
    const e1x = b.x - a.x, e1y = b.y - a.y, e1z = b.z - a.z;
    const e2x = c.x - a.x, e2y = c.y - a.y, e2z = c.z - a.z;
    const hx = dy * e2z - dz * e2y;
    const hy = dz * e2x - dx * e2z;
    const hz = dx * e2y - dy * e2x;
    const det = e1x * hx + e1y * hy + e1z * hz;
    if (Math.abs(det) < 1e-10) return null;
    const inv = 1 / det;
    const sx = ox - a.x, sy = oy - a.y, sz = oz - a.z;
    const u = (sx * hx + sy * hy + sz * hz) * inv;
    if (u < 0 || u > 1) return null;
    const qx = sy * e1z - sz * e1y;
    const qy = sz * e1x - sx * e1z;
    const qz = sx * e1y - sy * e1x;
    const v = (dx * qx + dy * qy + dz * qz) * inv;
    if (v < 0 || u + v > 1) return null;
    const t = (e2x * qx + e2y * qy + e2z * qz) * inv;
    return t > 1e-6 ? t : null;
}

const _f16f32buf = new Float32Array(1);
const _f16i32buf = new Int32Array(_f16f32buf.buffer);
function _f32tof16(val: number): number {
    _f16f32buf[0] = val;
    const x = _f16i32buf[0];
    let bits = (x >> 16) & 0x8000;
    let m = (x >> 12) & 0x07ff;
    const e = (x >> 23) & 0xff;
    if (e < 103) return bits;
    if (e > 142) { bits |= 0x7c00; return bits; }
    if (e < 113) { m |= 0x0800; bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1); return bits; }
    bits |= ((e - 112) << 10) | (m >> 1);
    bits += m & 1;
    return bits;
}
function _makePointTexture(data: Float32Array, count: number): Texture2D {
    // 点云改半精度 R16G16B16A16(可过滤): R32G32B32A32(rgba32float)不可过滤,
    // compute bind group 按可过滤 float 声明它 → 绑不上(替换默认) → texelFetch 读 0 → 粒子塌原点。
    const half = new Uint16Array(count * 4);
    for (let i = 0; i < count * 4; i++) half[i] = _f32tof16(data[i]);
    const tex = new Texture2D(count, 1, TextureFormat.R16G16B16A16, false, false, false, false);
    tex.setPixelsData(new Uint8Array(half.buffer, half.byteOffset, half.byteLength), false, false);
    tex.wrapModeU = WrapMode.Clamp;
    tex.wrapModeV = WrapMode.Clamp;
    tex.filterMode = FilterMode.Point;
    return tex;
}

function _fallbackPointTexture(): Texture2D {
    const data = new Float32Array(4); data[3] = 1;
    return _makePointTexture(data, 1);
}

// ── 点云数据计算 (Float32Array, count*4: xyz + w=1)。失败返回 null ──
// Surface 采样：按三角形面积加权 → 重心 random
function _computeSurfacePointsData(mesh: Mesh, count: number, scale?: number): Float32Array | null {
    const tri = getMeshTriangles(mesh);
    if (!tri || tri.indices.length < 3) return null;
    const { positions, indices } = tri;
    const triCount = (indices.length / 3) | 0;
    if (triCount <= 0) return null;
    // 顶点缩放：转换器按 mesh 注入(数据驱动)，缺省 1.0；cm-unit mesh(如 Ellen.fbx，Unity fileScale 未应用，顶点 100x)=0.01
    const _S = (typeof scale === "number" && scale > 0) ? scale : 1;
    // 按三角形均匀采样(每个三角形等概率,非面积加权) —— 对齐 Unity:
    // 曲面细分密的区域(如胶囊半球帽)三角形更多 → 自然采到更多点,两端更密。
    const data = new Float32Array(count * 4);
    for (let p = 0; p < count; p++) {
        const ti = Math.min((Math.random() * triCount) | 0, triCount - 1);
        const a = positions[indices[ti * 3]];
        const b = positions[indices[ti * 3 + 1]];
        const c = positions[indices[ti * 3 + 2]];
        if (!a || !b || !c) continue;
        let u = Math.random(), v = Math.random();
        if (u + v > 1) { u = 1 - u; v = 1 - v; }
        const w = 1 - u - v;
        data[p * 4] = (w * a.x + u * b.x + v * c.x) * _S;
        data[p * 4 + 1] = (w * a.y + u * b.y + v * c.y) * _S;
        data[p * 4 + 2] = (w * a.z + u * b.z + v * c.z) * _S;
        data[p * 4 + 3] = 1;
    }
    return data;
}

// Volume 采样：AABB rejection + ray-tri parity test
function _computeVolumePointsData(mesh: Mesh, count: number, scale?: number): Float32Array | null {
    const _S = (typeof scale === "number" && scale > 0) ? scale : 1; // 顶点缩放(同 surface,缺省 1.0)
    const tri = getMeshTriangles(mesh);
    if (!tri || tri.indices.length < 3) return null;
    const { positions, indices } = tri;
    const triCount = (indices.length / 3) | 0;
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const p of positions) {
        if (!p) continue;
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
        if (p.z < minZ) minZ = p.z; if (p.z > maxZ) maxZ = p.z;
    }
    if (!isFinite(minX)) return null;
    const triA: Vector3[] = new Array(triCount);
    const triB: Vector3[] = new Array(triCount);
    const triC: Vector3[] = new Array(triCount);
    for (let i = 0; i < triCount; i++) {
        triA[i] = positions[indices[i * 3]];
        triB[i] = positions[indices[i * 3 + 1]];
        triC[i] = positions[indices[i * 3 + 2]];
    }
    const data = new Float32Array(count * 4);
    let written = 0;
    const maxAttempts = count * 32;
    let attempts = 0;
    while (written < count && attempts < maxAttempts) {
        attempts++;
        const px = minX + Math.random() * (maxX - minX);
        const py = minY + Math.random() * (maxY - minY);
        const pz = minZ + Math.random() * (maxZ - minZ);
        let crossings = 0;
        for (let i = 0; i < triCount; i++) {
            const a = triA[i], b = triB[i], c = triC[i];
            if (!a || !b || !c) continue;
            if (_rayTri(px, py, pz, 1, 0, 0, a, b, c) !== null) crossings++;
        }
        if ((crossings & 1) === 1) {
            data[written * 4] = px * _S; data[written * 4 + 1] = py * _S; data[written * 4 + 2] = pz * _S; data[written * 4 + 3] = 1;
            written++;
        }
    }
    if (written === 0) return _computeSurfacePointsData(mesh, count, scale);
    for (let i = written; i < count; i++) {
        const src = (i % written) * 4;
        data[i * 4] = data[src]; data[i * 4 + 1] = data[src + 1]; data[i * 4 + 2] = data[src + 2]; data[i * 4 + 3] = 1;
    }
    return data;
}

function _fallbackPointData(count: number): Float32Array {
    const data = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) data[i * 4 + 3] = 1; // 全原点 (xyz=0, w=1)
    return data;
}

// 已知 cm-unit mesh(顶点 100x，Unity fileScale 未应用)的【兜底】缩放表：
// 当 .lvfx 没带 meshScale 时(旧编译产物 / 引擎更新但 .vfx 未用新编译器重导)仍能把点云缩回世界尺度，
// 避免火焰点云 100x 喷到屏幕外。⭐优先用转换器注入的数据驱动 meshScale，此表仅兜底。
const MESH_CMUNIT_FALLBACK: Record<string, number> = { "e38d2d0d-ea52-4bc0-ae3f-09506c2cde20": 0.01 };  // Ellen.fbx (Smoke DM 火焰发射面)
function _resolveMeshScale(rawScale: number, uuid?: string): number {
    if (typeof rawScale === "number" && rawScale > 0 && rawScale !== 1) return rawScale;  // 数据驱动优先
    if (uuid) {
        const bare = String(uuid).replace(/^res:\/\//, "").replace(/@.*$/, "");
        if (MESH_CMUNIT_FALLBACK[bare]) return MESH_CMUNIT_FALLBACK[bare];
    }
    return (typeof rawScale === "number" && rawScale > 0) ? rawScale : 1;
}

// 兼容旧纹理路径（setPositionMesh 已改 storage buffer，此处保留供其他可能引用）
function bakeMeshSurfacePoints(mesh: Mesh, count: number, scale?: number): Texture2D {
    const data = _computeSurfacePointsData(mesh, count, scale);
    if (!data) console.warn("[VFX] bakeMeshSurfacePoints: mesh has no triangles, fallback to single point");
    return data ? _makePointTexture(data, count) : _fallbackPointTexture();
}
function bakeMeshVolumePoints(mesh: Mesh, count: number, scale?: number): Texture2D {
    const data = _computeVolumePointsData(mesh, count, scale);
    if (!data) console.warn("[VFX] bakeMeshVolumePoints: mesh has no triangles, fallback to single point");
    return data ? _makePointTexture(data, count) : _fallbackPointTexture();
}

// ── 点云 storage buffer (对齐 Unity 的 buffer 采样, 绕开 WebGPU compute 动态纹理绑定 bug) ──
function _makePointBuffer(data: Float32Array, count: number): DeviceBuffer {
    const buf = new DeviceBuffer(count * 16, EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST);
    buf.deviceBuffer.setData(data.buffer as ArrayBuffer, 0, 0, count * 16);
    return buf;
}
function bakeMeshSurfacePointsBuffer(mesh: Mesh, count: number, scale?: number): DeviceBuffer {
    const data = _computeSurfacePointsData(mesh, count, scale) || _fallbackPointData(count);
    return _makePointBuffer(data, count);
}
function bakeMeshVolumePointsBuffer(mesh: Mesh, count: number, scale?: number): DeviceBuffer {
    const data = _computeVolumePointsData(mesh, count, scale) || _fallbackPointData(count);
    return _makePointBuffer(data, count);
}

function normalizePropertyType(raw: string): VFXPropertyType {
    const s = String(raw || "").toLowerCase();
    if (s === "number" || s === "float") return VFXPropertyType.Float;
    if (s === "vec2" || s === "vector2") return VFXPropertyType.Vec2;
    if (s === "vec3" || s === "vector3") return VFXPropertyType.Vec3;
    if (s === "vec4" || s === "vector4") return VFXPropertyType.Vec4;
    if (s === "color") return VFXPropertyType.Color;
    if (s === "gradient") return VFXPropertyType.Gradient;
    if (s === "texture2d") return VFXPropertyType.Texture2D;
    return VFXPropertyType.Float;
}

const EventAttributeTypeMap: Record<string, VFXEventAttributeType> = {
    "Bool": VFXEventAttributeType.Bool,
    "Int": VFXEventAttributeType.Int,
    "Uint": VFXEventAttributeType.Uint,
    "Float": VFXEventAttributeType.Float,
    "Vector2": VFXEventAttributeType.Vector2,
    "Vector3": VFXEventAttributeType.Vector3,
    "Vector4": VFXEventAttributeType.Vector4,
};

function getDescMap(desc: { name: string, type: string }[]): { name: string, type: VFXEventAttributeType }[] {
    if (!desc) return null;

    return desc.map(attr => ({
        name: attr.name,
        type: EventAttributeTypeMap[attr.type],
    }));
}
