import { VFXEvent, VFXEventQueue, VFXEventType } from "./event/VFXEventQueue";
import { VFXShaderInit } from "./shader/VFXShaderInit";
import { VFXParticleSystem, ensureIDs } from "./systems/VFXParticleSystem";
import { VFXSpawnerSystem } from "./systems/VFXSpawnerSystem";
import { VFXStaticMeshSystem } from "./systems/VFXStaticMeshSystem";
import { VFXSpawnerConstantRate, VFXSpawnerCustomWrapper, VFXSpawnerPeriodicBurst, VFXSpawnerSingleBurst, VFXSpawnerTask, VFXSpawnerOverDistance, VFXSpawnerSetEventAttribute, IVFXCustomSpawnCallback } from "./systems/VFXSpawnerTask";
import { VFXSystem } from "./systems/VFXSystem";
import { VFXAsset, VFXUpdateMode, VFXSystemType, VFXSpawnerSystemDesc, VFXParticleSystemDesc, VFXSpawnerTaskType, VFXSpawnerConstantRateTaskDesc, VFXSpawnerCustomWrapperTaskDesc, VFXSpawnerSingleBurstTaskDesc, VFXSpawnerPeriodicBurstTaskDesc, VFXSpawnerOverDistanceTaskDesc, VFXSpawnerSetEventAttributeTaskDesc, VFXStaticMeshSystemDesc, VFXPropertyDesc, VFXPropertyType, VFXCurveUniformDesc } from "./VFXAsset";
import { VFXEventAttribute } from "./VFXEventAttribute";
import { bakeSkinnedMeshVertexTexture, bakeSkinnedMeshBonesTexture } from "./VFXAssetParser";
import { VFXFrameTime } from "./VFXFrameTime";
import { VFXGeometry, VFXGeometryParams } from "./VFXGeometry";
import { VFXBillboardGeometry, VFXBillboardGeometryParams } from "./VFXBillboardGeometry";
import { VFXStripGeometry, VFXStripGeometryParams } from "./VFXStripGeometry";
import { VFXRenderer } from "./VFXRenderer";
import { VFXState } from "./VFXState";
import { Script } from "../components/Script";
import { Camera } from "../d3/core/Camera";
import { MeshFilter } from "../d3/core/MeshFilter";
import { Scene3D } from "../d3/core/scene/Scene3D";
import { Sprite3D } from "../d3/core/Sprite3D";
import { DeviceBuffer } from "../d3/graphics/DeviceBuffer";
import { Mesh } from "../d3/resource/models/Mesh";
import { PrimitiveMesh } from "../d3/resource/models/PrimitiveMesh";
import { LayaGL } from "../layagl/LayaGL";
import { MathUtil } from "../maths/MathUtil";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Rand } from "../maths/Rand";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";
import { IRenderContext3D } from "../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ComputeCommandBuffer } from "../RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeCommandBuffer";
import { EDeviceBufferUsage } from "../RenderDriver/DriverDesign/RenderDevice/IDeviceBuffer";
import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { RenderCapable } from "../RenderEngine/RenderEnum/RenderCapable";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { WrapMode } from "../RenderEngine/RenderEnum/WrapMode";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../resource/BaseTexture";
import { Texture2D } from "../resource/Texture2D";
import { Texture2DArray } from "../resource/Texture2DArray";
import { Texture3D } from "../resource/Texture3D";
import { Laya } from "../../Laya";

const globalRand = new Rand((Math.random() * 0xFFFFFFFF) >>> 0);
const _tempCamForward = new Vector3();

export class VisualEffect extends Script {

    declare owner: Sprite3D;
    private _asset: VFXAsset;
    public get asset(): VFXAsset {
        return this._asset;
    }
    public set asset(value: VFXAsset) {
        if (this._asset === value) return;

        // 释放旧资源
        this.releaseAssetData();

        this._asset = value;

        if (this._asset) {
            this._asset._addReference();
            this.initialEvent = this._asset.initialEventName;

            const supportedCompute = LayaGL.renderEngine.getCapable(RenderCapable.ComputeShader);
            if (supportedCompute) {
                this.createAssetData();
                this.initAssetData();
            }
        }
    }

    randomSeed: number = 0;

    private currentSeed: number = 0;

    private rand: Rand = new Rand(0);

    resetSeedOnPlay: boolean = true;

    private initialEventID: number;

    private _initialEvent: string;

    public get initialEvent(): string {
        return this._initialEvent;
    }
    public set initialEvent(value: string) {
        this._initialEvent = value;
        this.initialEventID = Shader3D.propertyNameToID(this._initialEvent);
    }

    private eventQueue: VFXEventQueue;

    private globalEventAttribute: VFXEventAttribute;

    /** @internal */
    renderer: VFXRenderer;

    private frameTime: VFXFrameTime = new VFXFrameTime();

    private cmd: ComputeCommandBuffer = new ComputeCommandBuffer();

    /** @internal */
    systems: Array<VFXSystem> = [];

    playRate: number = 1.0;

    private _mainCamera: Camera;

    /**
     * 主相机，用于模拟阶段的相机相关计算
     * 默认自动获取场景主相机，也可手动指定
     */
    public get mainCamera(): Camera {
        return this._mainCamera;
    }
    public set mainCamera(value: Camera) {
        this._mainCamera = value;
    }

    state: VFXState = new VFXState();

    /**
     * Output Event 回调（对齐 Unity VFXOutputEventArgs）
     *
     * 当 triggerEvent block 路由到 outputEvent context 且触发条件满足时，
     * 每一条触发都会异步回调一次（typically 1-2 帧延迟 due to GPU readback）。
     *
     * args 字段：
     *   eventName   — outputEvent context 的 eventName prop
     *   particleId  — 源粒子 id（uint）
     *   position    — vec3 世界/本地坐标（按 simulateSpace）
     *   velocity    — vec3
     *   age/lifetime — float
     *   color       — vec4 rgba
     *   size        — float
     *
     * 用法：
     *   vfx.outputEventReceived = (args) => {
     *       if (args.eventName === "OnDie") spawnExplosion(args.position);
     *   };
     */
    outputEventReceived: ((args: {
        eventName: string;
        particleId: number;
        position: number[];
        velocity: number[];
        age: number;
        lifetime: number;
        color: number[];
        size: number;
    }) => void) | null = null;

    // CustomSpawn 回调注册表 — Unity VFXSpawnerCustomWrapper 对齐
    // 用 customSpawn block 的 Callback Name 索引到对应回调
    private _customSpawnCallbacks: Map<string, IVFXCustomSpawnCallback> = new Map();

    // SkinnedMesh source 注册表 — sampleSkinnedMeshXxx operator 通过 sourceName 引用
    // 用户脚本：visualEffect.setSkinnedMeshSource("monkey", monkey.getComponent(SkinnedMeshRenderer))
    private _skinnedMeshSources: Map<string, any> = new Map();
    // 缓存 bones texture（每个 sourceName 一份），避免每帧重新分配
    private _skinnedMeshBoneTextures: Map<string, Texture2D> = new Map();
    // 标记静态 vertex 属性（pos/idx/weight/normal）是否已烘焙过（每个 sourceName 一份）
    private _skinnedMeshVertexBaked: Set<string> = new Set();

    /**
     * 注册 SkinnedMesh source — sampleSkinnedMeshXxx operator 通过 sourceName 引用
     * @param name      与 .vfx 中 sampleSkinnedMeshXxx operator 的 Source Name 一致
     * @param renderer  场景里现有的 SkinnedMeshRenderer 组件
     */
    setSkinnedMeshSource(name: string, renderer: any): void {
        this._skinnedMeshSources.set(name, renderer);
        // 重新注册时，强制重新烘焙（mesh 可能换了）
        this._skinnedMeshVertexBaked.delete(name);
    }

    /** 移除 SkinnedMesh source 注册 */
    clearSkinnedMeshSource(name: string): void {
        this._skinnedMeshSources.delete(name);
        this._skinnedMeshVertexBaked.delete(name);
        const tex = this._skinnedMeshBoneTextures.get(name);
        if (tex) tex.destroy();
        this._skinnedMeshBoneTextures.delete(name);
    }

    /**
     * 注册 customSpawn block 的 spawn 数量回调。
     * @param name      与 .vfx 中 customSpawn block 的 Callback Name 一致
     * @param callback  签名 (state, dt) => spawnCount，返回本帧要 spawn 的粒子数（>=0；可为分数）
     */
    setCustomSpawnCallback(name: string, callback: IVFXCustomSpawnCallback): void {
        this._customSpawnCallbacks.set(name, callback);
    }

    /** 移除指定 name 的 customSpawn 回调 */
    clearCustomSpawnCallback(name: string): void {
        this._customSpawnCallbacks.delete(name);
    }

    /** runtime 内部调用，根据 name 取回调 */
    getCustomSpawnCallback(name: string): IVFXCustomSpawnCallback | undefined {
        return this._customSpawnCallbacks.get(name);
    }

    // 缓存逆矩阵对象，避免每帧分配
    private _invEmitterWorldMatrix: Matrix4x4 = new Matrix4x4();

    // property 运行时值：key = property name, value = uniform ID + 当前值 + 缓存对象
    private _propertyValues: Map<string, { id: number, type: VFXPropertyType, value: number[], cached: any }> = new Map();


    private createAssetData() {
        const asset = this.asset;

        // 根据 asset.systems 创建对应的系统实例
        asset.systems.forEach((desc, index) => {
            switch (desc.type) {
                case VFXSystemType.Spawner: {
                    const spawnerDesc = desc as VFXSpawnerSystemDesc;
                    const spawnerSystem = new VFXSpawnerSystem();
                    spawnerSystem.effect = this;
                    spawnerSystem.desc = spawnerDesc;

                    // 设置循环参数
                    spawnerSystem.settings.delayBeforeLoop = spawnerDesc.delayBeforeLoop;
                    spawnerSystem.settings.delayAfterLoop = spawnerDesc.delayAfterLoop;

                    spawnerSystem.onPlayInputs.push(...spawnerDesc.onPlayInputs);
                    spawnerSystem.onStopInputs.push(...spawnerDesc.onStopInputs);

                    // 创建任务
                    spawnerDesc.tasks.forEach(taskDesc => {
                        let task: VFXSpawnerTask;
                        switch (taskDesc.type) {
                            case VFXSpawnerTaskType.ConstantRate: {
                                const constantRateDesc = taskDesc as VFXSpawnerConstantRateTaskDesc;
                                const constantRateTask = task = new VFXSpawnerConstantRate();
                                constantRateTask.rate = constantRateDesc.rate;
                                break;
                            }
                            case VFXSpawnerTaskType.SingleBurst: {
                                const singleBurstDesc = taskDesc as VFXSpawnerSingleBurstTaskDesc;
                                const singleBurstTask = task = new VFXSpawnerSingleBurst();
                                singleBurstTask.delay = singleBurstDesc.delay;
                                singleBurstTask.count = singleBurstDesc.count;
                                singleBurstTask.countFromLoopIndex = singleBurstDesc.countFromLoopIndex;
                                singleBurstTask.countModulo = singleBurstDesc.countModulo;
                                break;
                            }
                            case VFXSpawnerTaskType.PeriodicBurst: {
                                const periodicBurstDesc = taskDesc as VFXSpawnerPeriodicBurstTaskDesc;
                                const periodicBurstTask = task = new VFXSpawnerPeriodicBurst();
                                periodicBurstTask.delay = periodicBurstDesc.delay;
                                periodicBurstTask.count = periodicBurstDesc.count;
                                break;
                            }
                            case VFXSpawnerTaskType.SpawnOverDistance: {
                                const spawnOverDistanceDesc = taskDesc as VFXSpawnerOverDistanceTaskDesc;
                                const spawnOverDistanceTask = task = new VFXSpawnerOverDistance();
                                spawnOverDistanceTask.distance = spawnOverDistanceDesc.distance;
                                spawnOverDistanceTask.owner = this.owner;
                                break;
                            }
                            case VFXSpawnerTaskType.CustomWrapper: {
                                const customDesc = taskDesc as VFXSpawnerCustomWrapperTaskDesc;
                                const customTask = task = new VFXSpawnerCustomWrapper();
                                customTask.callbackName = customDesc.callbackName;
                                customTask.effect = this;
                                break;
                            }
                            case VFXSpawnerTaskType.SetEventAttribute: {
                                const sd = taskDesc as VFXSpawnerSetEventAttributeTaskDesc;
                                const t = task = new VFXSpawnerSetEventAttribute();
                                t.attribute = sd.attribute;
                                t.value = sd.value && sd.value.length === 4 ? sd.value : [0, 0, 0, 0];
                                t.fromLoopIndex = !!sd.fromLoopIndex;
                                t.loopIndexModulo = sd.loopIndexModulo || 0;
                                t.fromSpawnStateLoop = !!(sd as any).fromSpawnStateLoop;
                                break;
                            }
                            default:
                                break;
                        }
                        spawnerSystem.tasks.push(task);

                    });

                    this.systems.push(spawnerSystem);
                    break;
                }
                case VFXSystemType.Particle: {
                    const particleDesc = desc as VFXParticleSystemDesc;
                    const particleSystem = new VFXParticleSystem();
                    particleSystem.effect = this;

                    // 设置 shader
                    particleSystem.initializeShader = particleDesc.initializeShader;
                    particleSystem.updateShader = particleDesc.updateShader;
                    particleSystem.outputShader = particleDesc.outputShader;

                    particleSystem.capacity = particleDesc.capacity;
                    particleSystem.attributeBytesPerParticle = particleDesc.attributeBytesPerParticle;
                    particleSystem.outputType = particleDesc.outputType || "outputMesh";
                    particleSystem.particlePerStripCount = particleDesc.particlePerStripCount;
                    particleSystem.stripCapacity = particleDesc.stripCapacity ?? 1;
                    particleSystem.mesh = particleDesc.mesh;

                    particleSystem.spawnerSystems.push(...particleDesc.spawnerSystems);
                    particleSystem.receiveGPUEvent = particleDesc.receiveGPUEvent;
                    particleSystem.gpuEventInput = particleDesc.gpuEventInput;
                    if (particleDesc.outputEvents && particleDesc.outputEvents.length > 0) {
                        particleSystem.outputEventDescs = particleDesc.outputEvents.slice();
                    }
                    particleSystem.simulateSpace = particleDesc.simulateSpace;
                    particleSystem.boundsMode = particleDesc.boundsMode;
                    particleSystem.boundsCenter = particleDesc.boundsCenter;
                    particleSystem.boundsExtents = particleDesc.boundsExtents;
                    particleSystem.blendMode = particleDesc.blendMode;
                    particleSystem.softParticleFade = particleDesc.softParticleFade;
                    particleSystem.uvMode = particleDesc.uvMode;
                    particleSystem.flipbookSize = particleDesc.flipbookSize;
                    particleSystem.mainTexture = (particleDesc as any).mainTexture || "";
                    particleSystem.subpixelAA = particleDesc.subpixelAA;
                    particleSystem.customShaderName = particleDesc.customShaderName;
                    // Billboard procedural 配置（对齐 Unity VFXPlanarPrimitiveOutput）
                    particleSystem.billboardPrimitive = particleDesc.billboardPrimitive;
                    particleSystem.billboardVertexCount = particleDesc.billboardVertexCount;
                    particleSystem.distortionMode = particleDesc.distortionMode || "Procedural";
                    particleSystem.billboardCropFactor = particleDesc.billboardCropFactor;
                    // Alpha Clipping (Unity VFXPlanarPrimitiveOutput useAlphaClipping)
                    particleSystem.useAlphaClipping = (particleDesc as any).useAlphaClipping || false;
                    particleSystem.alphaThreshold = (particleDesc as any).alphaThreshold ?? 0.5;
                    // Strip 专属字段
                    particleSystem.stripColorMapping = (particleDesc as any).stripColorMapping || "Default";
                    particleSystem.stripUvScale = (particleDesc as any).stripUvScale || { x: 1, y: 1 };
                    particleSystem.stripUvBias = (particleDesc as any).stripUvBias || { x: 0, y: 0 };
                    particleSystem.stripGradientStops = (particleDesc as any).stripGradientStops || [];
                    particleSystem.stripTilingMode = (particleDesc as any).tilingMode || "Stretch";
                    if (particleDesc.prepareDispatchShader) {
                        particleSystem.prepareDispatchShader = particleDesc.prepareDispatchShader;
                    }
                    if (particleDesc.updateStripsShader) {
                        particleSystem.updateStripsShader = particleDesc.updateStripsShader;
                        particleSystem.updateStripsDatas = [LayaGL.renderDeviceFactory.createShaderData()];
                    }
                    // Strip ring buffer: enable for ALL trail systems (GPU event and CPU spawned)
                    if (particleDesc.outputType === "outputTrail" || particleDesc.outputType === "outputParticleStripSGQuad") {
                        particleSystem.useStripRingBuffer = true;
                    }

                    // Multi-Output: 为额外 output 创建独立的 RenderBuffer + IndirectBuffer + ShaderData
                    if (particleDesc.extraOutputs && particleDesc.extraOutputs.length > 0) {
                        for (const extraDesc of particleDesc.extraOutputs) {
                            if (!extraDesc.outputShader) continue;
                            // Strip output 用 strip stride (2 vert × 4 vec4 = 128B/particle，instance 化在 strip geometry 内部）
                            // Mesh/Billboard 用 instance stride (RENDER_STRIDE=5 vec4 = 80B/particle)
                            const isStripExtra = extraDesc.outputType === "outputTrail" || extraDesc.outputType === "outputParticleStripSGQuad";
                            const renderStride = isStripExtra ? 128 : (5 * 16);
                            // 跟主 renderBuffer 一致 flags：STORAGE | COPY_DST | VERTEX；strip 需要 DrawElementIndirect 的 INDEX buffer 已由 StripGeometry 创建
                            const renderUsage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST | EDeviceBufferUsage.VERTEX;
                            const extraRenderBuffer = new DeviceBuffer(renderStride * particleDesc.capacity, renderUsage);
                            extraRenderBuffer.vertexBuffer.vertexDeclaration = isStripExtra ? VFXStripGeometry.StripVertexDecl : VFXGeometry.ParticleDecl;
                            extraRenderBuffer.vertexBuffer.instanceBuffer = !isStripExtra;

                            const indirectUsage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.INDIRECT | EDeviceBufferUsage.COPY_DST;
                            const extraIndirectBuffer = new DeviceBuffer(20, indirectUsage);

                            const extraOutputDatas = [LayaGL.renderDeviceFactory.createShaderData()];

                            particleSystem.extraOutputs.push({
                                outputShader: extraDesc.outputShader,
                                outputDatas: extraOutputDatas,
                                renderBuffer: extraRenderBuffer,
                                indirectBuffer: extraIndirectBuffer,
                                geometry: null,
                                outputType: extraDesc.outputType,
                                blendMode: extraDesc.blendMode,
                                softParticleFade: extraDesc.softParticleFade,
                                uvMode: extraDesc.uvMode,
                                flipbookSize: extraDesc.flipbookSize,
                                mainTexture: (extraDesc as any).mainTexture || "",
                                subpixelAA: extraDesc.subpixelAA,
                                customShaderName: extraDesc.customShaderName,
                                mesh: extraDesc.mesh || PrimitiveMesh.createSphere(0.5, 12, 12),
                                billboardPrimitive: extraDesc.billboardPrimitive,
                                billboardVertexCount: extraDesc.billboardVertexCount,
                                billboardCropFactor: extraDesc.billboardCropFactor,
                                useAlphaClipping: extraDesc.useAlphaClipping,
                                alphaThreshold: extraDesc.alphaThreshold,
                                // Strip 专属（extra outputTrail）：tilingMode 让 fragment shader 决定 UV 拉伸 vs 每段 tile
                                tilingMode: (extraDesc as any).tilingMode || "Stretch",
                                colorMapping: (extraDesc as any).colorMapping || "Default",
                                uvScale: (extraDesc as any).uvScale,
                                uvBias: (extraDesc as any).uvBias,
                            } as any);
                        }
                    }

                    this.systems.push(particleSystem);
                    break;
                }
                case VFXSystemType.StaticMesh: {
                    const staticDesc = desc as VFXStaticMeshSystemDesc;
                    const staticSys = new VFXStaticMeshSystem();
                    staticSys.effect = this;
                    staticSys.desc = staticDesc;
                    this.systems.push(staticSys);
                    break;
                }
            }
        });

        this.eventQueue = new VFXEventQueue(100);
    }

    private initAssetData() {
        for (let system of this.systems) {
            system.init();
        }

        this.state.totalTime = 0;

        if (this.resetSeedOnPlay) {
            this.currentSeed = globalRand.getUint();
        }
        else {
            this.currentSeed = this.randomSeed;
        }

        this.rand.seed = this.currentSeed;

        this.eventQueue.push(this.initialEventID, VFXEventType.Initialize);

        this.globalEventAttribute = this.createEmptyEventAttribute();
        this.globalEventAttribute.setFloat("spawnCount", 1);
        this.globalEventAttribute.setVector4("color", 1, 1, 1, 1);
        this.globalEventAttribute.setVector3("velocity", 1.5, 0, 0);

        // 初始化 property 默认值并创建缓存对象
        this._propertyValues.clear();
        for (const prop of this.asset.properties) {
            const id = Shader3D.propertyNameToID(prop.uniform);
            const v = prop.default;
            let cached: any = null;
            switch (prop.type) {
                case VFXPropertyType.Vec2:
                    cached = new Vector2(v[0], v[1]);
                    break;
                case VFXPropertyType.Vec3:
                    cached = new Vector3(v[0], v[1], v[2]);
                    break;
                case VFXPropertyType.Vec4:
                    cached = new Vector4(v[0], v[1], v[2], v[3]);
                    break;
                case VFXPropertyType.Color:
                    cached = new Vector4(v[0], v[1], v[2], v[3]);
                    break;
                case VFXPropertyType.Gradient:
                    // 烘焙 256×1 Texture2D；sampleGradient 走 textureLod(uniform, vec2(t, 0.5), 0)
                    cached = bakeGradientTexture(prop.gradientStops || []);
                    break;
            }
            this._propertyValues.set(prop.name, {
                id,
                type: prop.type,
                value: [...v],
                cached
            });
            // Gradient 属性直接绑到所有粒子系统的 shaderData（texture uniform）
            if (prop.type === VFXPropertyType.Gradient && cached) {
                for (const sys of this.systems) {
                    if (sys instanceof VFXParticleSystem) {
                        for (const sd of sys.getAllShaderDatas()) {
                            sd.setTexture(id, cached);
                        }
                    }
                }
            }
        }

        // 将 curveUniforms 和 bakedTexture 设置到所有粒子系统的 shaderData
        this.applyCurveUniforms();
    }

    private releaseAssetData(): void {
        for (let system of this.systems) {
            system.release();
        }
        this.systems = [];

        if (this.globalEventAttribute) {
            this.globalEventAttribute.destroy();
            this.globalEventAttribute = null;
        }

        // 清理 Strip 子节点
        if (this._stripNode) {
            this._stripNode.destroy();
            this._stripNode = null;
            this._stripRenderer = null;
        }

        if (this._asset) {
            this._asset._removeReference();
            this._asset = null;
        }
    }

    constructor() {
        super();
        this.initialEvent = "OnPlay";
    }

    /// lifecycle methods
    onStart(): void {
        console.log("VisualEffect onStart", this, this.asset);
        console.log(`[VFX-DBG] VE onStart systems=${this.systems.length}`,
            this.systems.map((s: any, i: number) => {
                const cap = (s as any).capacity ?? (s.desc && (s.desc as any).capacity);
                const t = s.constructor.name;
                return `${i}:${t}${cap != null ? `(cap=${cap})` : ""}`;
            }).join(","));
    }

    // Strip 专用子节点和 Renderer（避免与 Mesh instancing 的渲染管线冲突）
    private _stripNode: Sprite3D;
    private _stripRenderer: VFXRenderer;

    onAwake(): void {
        const supportedCompute = LayaGL.renderEngine.getCapable(RenderCapable.ComputeShader)
        if (!supportedCompute) {
            return;
        }

        this.renderer = this.owner.getComponent(VFXRenderer) as VFXRenderer;
        this.renderer.visualEffect = this;

        // Mesh/Billboard（instance triangles）注册到主 renderer
        // Strip/Point/Line 都是独立顶点几何，走独立子节点 renderer 避免管线冲突
        const isNonMeshOutput = (t: string) => t === "outputTrail" || t === "outputParticleStripSGQuad" || t === "outputPoint" || t === "outputLine";
        let hasStrip = false;
        let hasMesh = false;
        for (let system of this.systems) {
            if (system instanceof VFXParticleSystem && system.geometry) {
                if (isNonMeshOutput(system.outputType)) {
                    hasStrip = true;
                } else {
                    hasMesh = true;
                    this.renderer.addGeometry(system.geometry);
                }

                // Multi-Output: 为每个 extra output 创建 geometry 并注册
                // outputTrail → VFXStripGeometry（与主 strip 共享 stripDataBuffer，独立 vertexBuffer + indirectBuffer）
                // outputBillboard / outputCube / outputDistortion → procedural 路径用 VFXBillboardGeometry
                // 其他走普通 VFXGeometry — 与主 output 同逻辑保持一致
                for (const extra of system.extraOutputs) {
                    try {
                        const isExtraStrip = extra.outputType === "outputTrail" || extra.outputType === "outputParticleStripSGQuad";
                        const isBillboardProc = (extra.outputType === "outputBillboard"
                            || extra.outputType === "outputCube"
                            || extra.outputType === "outputDistortion") && !!extra.billboardPrimitive;
                        let geo: any;
                        if (isExtraStrip) {
                            // 共享主 system 的 strip 配置（stripCapacity + ppsc），独立 vertex/indirect buffer
                            const stripParams = new VFXStripGeometryParams();
                            stripParams.capacity = system.capacity;
                            stripParams.stripVertexBuffer = extra.renderBuffer;
                            stripParams.indirectBuffer = extra.indirectBuffer;
                            stripParams.stripCapacity = system.stripCapacity;
                            stripParams.particlePerStripCount = system.particlePerStripCount;
                            geo = new VFXStripGeometry(stripParams);
                        } else if (isBillboardProc) {
                            const bbParams = new VFXBillboardGeometryParams();
                            bbParams.capacity = system.capacity;
                            bbParams.vertexCount = extra.billboardVertexCount;
                            // 恢复用 extra 自己的 buffer
                            bbParams.particleBuffer = extra.renderBuffer.vertexBuffer;
                            bbParams.particleDeviceBuffer = extra.renderBuffer;
                            bbParams.indirectBuffer = extra.indirectBuffer;
                            geo = new VFXBillboardGeometry(bbParams);
                            geo.primitive = extra.billboardPrimitive;
                            geo.cropFactor = extra.billboardCropFactor;
                        } else {
                            const geoParams = new VFXGeometryParams();
                            geoParams.particleBuffer = extra.renderBuffer.vertexBuffer;
                            geoParams.particleDeviceBuffer = extra.renderBuffer;
                            geoParams.indirectBuffer = extra.indirectBuffer;
                            geoParams.capacity = system.capacity;
                            geoParams.mesh = extra.mesh;
                            geo = new VFXGeometry(geoParams);
                        }
                        geo.blendMode = extra.blendMode;
                        geo.outputType = extra.outputType;
                        geo.softParticleFade = extra.softParticleFade;
                        geo.uvMode = extra.uvMode;
                        geo.flipbookSize = extra.flipbookSize;
                        (geo as any).mainTexture = (extra as any).mainTexture || "";
                        (geo as any).stripColorMapping = (extra as any).colorMapping || "Default";
                        (geo as any).stripUvScale = (extra as any).uvScale;
                        (geo as any).stripUvBias = (extra as any).uvBias;
                        (geo as any).stripGradientStops = (extra as any).gradientStops || [];
                        (geo as any).stripTilingMode = extra.tilingMode || "Stretch";
                        (geo as any).stripPpsc = system.particlePerStripCount;
                        // Alpha Clipping (extra outputBillboard, Debug Index 等用 atlas mask 字符)
                        (geo as any).useAlphaClipping = !!(extra as any).useAlphaClipping;
                        (geo as any).alphaThreshold = Number((extra as any).alphaThreshold ?? 0.5);
                        geo.subpixelAA = extra.subpixelAA;
                        geo.customShaderName = extra.customShaderName;
                        extra.geometry = geo;
                        if (isNonMeshOutput(extra.outputType)) {
                            hasStrip = true;
                        } else {
                            hasMesh = true;
                            this.renderer.addGeometry(geo);
                        }
                    } catch (e) {
                        console.warn("[VFX] Multi-Output: extra geometry creation failed", e);
                    }
                }
            }
        }

        if (hasStrip) {
            this._stripNode = new Sprite3D("VFX_Strip");
            (this.owner as Sprite3D).addChild(this._stripNode);

            this._stripRenderer = this._stripNode.addComponent(VFXRenderer) as VFXRenderer;
            // 从主 renderer 拷贝用户材质到 strip renderer（strip 用独立子节点，不自动继承材质）
            if (this.renderer.sharedMaterials?.length > 0) {
                this._stripRenderer.sharedMaterials = this.renderer.sharedMaterials;
            }
            // outputVFX 只能由一个 renderer 触发，避免 compute shader 重复 dispatch
            // 当只有 strip 没有 mesh 时：strip renderer 触发，清除主 renderer 的 visualEffect
            // 当两者都有时：主 renderer 触发（它已设置了 visualEffect）
            if (!hasMesh) {
                this.renderer.visualEffect = null;
                this._stripRenderer.visualEffect = this;
            }

            // 添加 COLOR define 到 strip renderer 的 shaderData，让 Unlit shader 启用顶点颜色
            const colorDefine = Shader3D.getDefineByName("COLOR");
            this._stripRenderer._baseRenderNode.shaderData.addDefine(colorDefine);

            for (let system of this.systems) {
                if (system instanceof VFXParticleSystem) {
                    if (system.geometry && isNonMeshOutput(system.outputType)) {
                        this._stripRenderer.addGeometry(system.geometry);
                    }
                    // Multi-Output: extra outputTrail 也走 stripRenderer
                    for (const extra of system.extraOutputs) {
                        if (extra.geometry && isNonMeshOutput(extra.outputType)) {
                            this._stripRenderer.addGeometry(extra.geometry);
                        }
                    }
                }
            }
        }
    }

    onEnable(): void {
    }

    onUpdate(): void {
        const supportedCompute = LayaGL.renderEngine.getCapable(RenderCapable.ComputeShader)
        if (!this.asset || !supportedCompute) {
            return;
        }

        // update frame time
        const currentDeltaTime = this.owner.scene.timer.delta / 1000;
        const currentUnscaledDeltaTime = this.owner.scene.timer.unscaledDelta / 1000;

        const fixedTimeStep = 1.0 / 60.0;
        const maxDeltaTime = 1 / 20;
        const maxFixedTimeStepCount = Math.max(1, Math.ceil(maxDeltaTime / fixedTimeStep));

        this.frameTime.computeStepCount(fixedTimeStep, maxFixedTimeStepCount, currentDeltaTime, maxDeltaTime);
        this.frameTime.computeUnscaledStepCount(fixedTimeStep, maxFixedTimeStepCount, currentUnscaledDeltaTime, maxDeltaTime);

        this.frameTime.fixedDeltaTime = this.frameTime.timeStepCount * fixedTimeStep;
        this.frameTime.deltaTime = MathUtil.clamp(currentDeltaTime, 0, maxDeltaTime);
        this.frameTime.unscaledFixedDeltaTime = this.frameTime.unscaledTimeStepCount * fixedTimeStep;
        this.frameTime.unscaledDeltaTime = MathUtil.clamp(currentUnscaledDeltaTime, 0.0, maxDeltaTime);

        // console.log(`VisualEffect onUpdate deltaTime:${this.frameTime.deltaTime.toFixed(4)} fixedDeltaTime:${this.frameTime.fixedDeltaTime.toFixed(4)} timeStepCount:${this.frameTime.timeStepCount}`);

        // update state
        let currentUnscaledVfxDeltaTime = 0;
        let stepCount = 0;
        const updateMode = this.asset.updateMode;
        const isIgnoreTimeScale = (updateMode & VFXUpdateMode.IgnoreTimeScale) !== 0;
        if (updateMode & VFXUpdateMode.DeltaTime) {
            stepCount = 1;
            if (isIgnoreTimeScale) {
                currentUnscaledVfxDeltaTime = this.frameTime.unscaledDeltaTime;
            }
            else {
                currentUnscaledVfxDeltaTime = this.frameTime.deltaTime;
            }
        }
        else {
            if (isIgnoreTimeScale) {
                stepCount = this.frameTime.unscaledTimeStepCount;
                currentUnscaledVfxDeltaTime = this.frameTime.unscaledFixedDeltaTime;
            }
            else {
                stepCount = this.frameTime.timeStepCount;
                currentUnscaledVfxDeltaTime = this.frameTime.fixedDeltaTime;
            }

            if (this.asset.updateMode & VFXUpdateMode.ExactFixedTimeStep) {
                if (stepCount != 0) {
                    currentUnscaledVfxDeltaTime = fixedTimeStep;
                }
                else {
                    currentUnscaledVfxDeltaTime = 0;
                    stepCount = 1;
                }
            }
            else {
                stepCount = 1;
            }
        }

        let currentVFXDeltaTime = currentUnscaledVfxDeltaTime * this.playRate;
        if (this.pause) {
            currentVFXDeltaTime = 0;
        }

        this.state.deltaTime = currentVFXDeltaTime;
        this.state.unscaledDeltaTime = currentUnscaledVfxDeltaTime;
        this.state.playRate = this.playRate;
        this.state.systemSeed = this.currentSeed;
        this.state.rand = this.rand;

        for (let i = 0; i < stepCount; i++) {
            this.simulateVFX();
            this.state.totalTime += this.state.deltaTime;
        }

    }

    onDestroy(): void {
        this.releaseAssetData();
        this.eventQueue?.destroy();
        this.eventQueue = null;
    }

    sendEvent(id: number, attribute: VFXEventAttribute = null) {
        if (!this.asset) {
            return;
        }
        if (this.resetSeedOnPlay && id == VFXEvent.OnPlayEventID) {
            this.currentSeed = globalRand.getUint();
        }

        this.eventQueue.push(id, VFXEventType.Event, attribute);
    }

    sendEventByName(name: string, attribute: VFXEventAttribute = null) {
        const id = Shader3D.propertyNameToID(name);
        this.sendEvent(id, attribute);
    }

    processEvent(evt: VFXEvent, state: VFXState) {
        const asset = this.asset;

        const evtAttr = evt.attribute ? evt.attribute : this.globalEventAttribute;

        const evtDesc = asset.getEvents().get(evt.id);
        if (evtDesc) {
            for (let index of evtDesc.playSystems) {
                const system = this.systems[index] as VFXSpawnerSystem;
                system.onPlay(evtAttr);
            }

            for (let index of evtDesc.stopSystems) {
                const system = this.systems[index] as VFXSpawnerSystem;
                system.onStop();
            }

            for (let index of evtDesc.initSystems) {
                const system = this.systems[index] as VFXParticleSystem;
                system.receiveInitializeEvent(evtAttr);
            }
        }
    }

    processInitialize(evt: VFXEvent, state: VFXState) {

        this.processEvent(evt, state);

        this.asset.prewarmDeltaTime;
        this.asset.prewarmStepCount;
        // todo prewarm simulate
    }

    execudeEvents(state: VFXState) {
        if (this.eventQueue.empty()) {
            return;
        }
        this.eventQueue.swap();
        const evtList = this.eventQueue.getPreviousList();
        for (let evt of evtList) {
            switch (evt.type) {
                case VFXEventType.Event:
                    this.processEvent(evt, state);
                    break;
                case VFXEventType.Initialize:
                    this.processInitialize(evt, state);
                    break;
                case VFXEventType.Simulate:
                default:
                    break;
            }
        }
    }

    updateVFX() {
        this.simulateVFX();
        // this.outputVFX();
    }

    /**
     * 模拟阶段：事件处理 + Spawner 更新 + 粒子 Update/Initialize
     * 每帧调用一次
     */
    simulateVFX() {
        const state = this.state;

        // Phase 0: CPU 事件处理 + Spawner 更新
        this.execudeEvents(state);
        for (let system of this.systems) {
            if (system instanceof VFXSpawnerSystem) {
                system.update(state);
            }
        }

        // Phase 0.5: StaticMesh binding 应用（每帧 evaluate property → transform/material color）
        for (let system of this.systems) {
            if (system instanceof VFXStaticMeshSystem) {
                system.update(state, null);
            }
        }

        // Phase 0.6: SkinnedMesh texture 烘焙/刷新（首次烘焙静态 vertex 属性，每帧刷 bones 矩阵）
        this._updateSkinnedMeshTextures();

        // 计算 emitter 世界矩阵
        state.emitterWorldMatrix = this.owner.transform.worldMatrix;
        state.emitterWorldMatrix.invert(this._invEmitterWorldMatrix);
        state.invEmitterWorldMatrix = this._invEmitterWorldMatrix;

        // 获取主相机（优先手动指定，否则自动获取场景第一个相机）
        const camera = this._mainCamera ?? (this.owner.scene as Scene3D)?._cameraPool?.[0] as Camera;

        // 设置各粒子系统的共享 uniform（u_Capacity, u_DeltaTime, u_SystemSeed, 相机数据）
        for (let system of this.systems) {
            if (system instanceof VFXParticleSystem) {
                system.setCommonUniforms(state, camera);
            }
        }

        // 将 property 值写入所有粒子系统的 shaderData
        this.applyProperties();

        // Phase 1: Update ALL 粒子系统（死亡时写入 EventIndexBuffer）
        for (let system of this.systems) {
            if (system instanceof VFXParticleSystem) {
                system.updatePhase(state, this.cmd);
            }
        }

        // GPU 内存屏障：确保 Update 阶段完成
        this.cmd.executeCMDs();
        this.cmd.clearCMDs();

        // Phase 1.5: UpdateStrips — compact ring buffer (advance firstIndex past dead particles)
        for (let system of this.systems) {
            if (system instanceof VFXParticleSystem && system.useStripRingBuffer) {
                system.updateStripsPhase(this.cmd);
            }
        }

        // GPU 内存屏障：确保 UpdateStrips 完成后再 Initialize（Init 读取 compacted firstIndex/nextIndex）
        this.cmd.executeCMDs();
        this.cmd.clearCMDs();

        // Phase 2: GPU Initialize（接收 GPU 事件的粒子系统）
        for (let system of this.systems) {
            if (system instanceof VFXParticleSystem && system.receiveGPUEvent) {
                system.initializePhase(state, this.cmd);
            }
        }

        // GPU 内存屏障：确保 GPU Initialize 完成后再 CPU Initialize
        // 否则 CPU Init 覆写 head slot 数据时，GPU Init 可能还在读取 readSourceParticle
        this.cmd.executeCMDs();
        this.cmd.clearCMDs();

        // Phase 3: CPU Initialize（接收 CPU 事件的粒子系统）
        for (let system of this.systems) {
            if (system instanceof VFXParticleSystem && !system.receiveGPUEvent) {
                system.initializePhase(state, this.cmd);
            }
        }

        // GPU 内存屏障：确保 Initialize 阶段对 AliveList 的写入
        // 在 Output 阶段读取之前已完成提交
        this.cmd.executeCMDs();
        this.cmd.clearCMDs();
    }

    /**
     * 输出阶段：生成 RenderBuffer + IndirectBuffer + BoundsBuffer
     * 可逐相机调用，为后续传入相机数据做准备
     */
    outputVFX(context3D: IRenderContext3D) {
        const state = this.state;

        // 通过 cmd 设置当前渲染相机的位置和朝向到 output shader
        const cameraModuleData = context3D.cameraModuleData;
        if (cameraModuleData) {
            const camTransform = cameraModuleData.transform;
            const cameraWorldPos = camTransform.position;
            camTransform.getForward(_tempCamForward);
            for (let system of this.systems) {
                if (system instanceof VFXParticleSystem) {
                    system.setOrientCamera(this.cmd, cameraWorldPos, _tempCamForward);
                }
            }
        }

        // 重置 BoundsBuffer（在 Output dispatch 之前）
        for (let system of this.systems) {
            if (system instanceof VFXParticleSystem) {
                system.resetBoundsBuffer();
            }
        }

        // Output ALL 粒子系统
        for (let system of this.systems) {
            if (system instanceof VFXParticleSystem) {
                system.outputPhase(state, this.cmd);
            }
        }
        // 同批次追加 BoundsBuffer → StagingBuffer 拷贝
        for (let system of this.systems) {
            if (system instanceof VFXParticleSystem) {
                system.copyBoundsToStaging(this.cmd);
                system.copyOutputEventsToStaging(this.cmd);
            }
        }

        this.cmd.executeCMDs();
        this.cmd.clearCMDs();

        // 发起异步回读
        for (let system of this.systems) {
            if (system instanceof VFXParticleSystem) {
                system.requestBoundsReadback();
                if (system.outputEventDescs.length > 0) {
                    system.requestOutputEventReadback((eventName, entries) => this._dispatchOutputEvent(eventName, entries));
                }
            }
        }
    }

    /** Output Event 派发入口 — 由各系统 readback 完成后调用 */
    private _dispatchOutputEvent(eventName: string, entries: Array<any>): void {
        const cb = this.outputEventReceived;
        if (!cb) return;
        for (const e of entries) {
            cb({ eventName, ...e });
        }
    }


    /// control API
    play() {
        this.sendEvent(VFXEvent.OnPlayEventID);
        // PreWarm：让粒子系统预先运行 N 步，达到"已运行 totalTime 秒"的稳态
        // 触发 play 事件后立即 advance，让 spawner 生成的粒子经过 initialize + update 迭代
        this._executePreWarm();
    }

    /**
     * PreWarm 接入：按 asset.prewarmStepCount 循环执行 simulateVFX，每步 dt = prewarmDeltaTime
     * 典型用法：瀑布/烟雾/下雪 vfx 启动就已是稳态，不用等 N 秒填充
     */
    private _executePreWarm() {
        const asset = this.asset;
        if (!asset) return;
        const stepCount = asset.prewarmStepCount | 0;
        const dt = asset.prewarmDeltaTime;
        if (stepCount <= 0 || dt <= 0) return;

        const state = this.state;
        const savedDt = state.deltaTime;
        for (let i = 0; i < stepCount; i++) {
            state.deltaTime = dt;
            this.simulateVFX();
            state.totalTime += dt;
        }
        // 恢复常规 dt（totalTime 保留累加的预热时间，让后续生命周期正确）
        state.deltaTime = savedDt;
    }

    stop() {
        this.sendEvent(VFXEvent.OnStopEventID);
    }

    private _pause: boolean = false;

    public get pause(): boolean {
        return this._pause;
    }
    public set pause(value: boolean) {
        this._pause = value;
    }

    /**
     * 单步前进一帧
     */
    advanceOneFrame() {

    }

    private createEmptyEventAttribute(): VFXEventAttribute {
        if (this.asset) {
            const desc = this.asset.eventAttributeDesc;
            const evtAttr = new VFXEventAttribute(desc);
            const buffer = desc.createBuffer();
            evtAttr.initBuffer(buffer);
            return evtAttr;
        }
        return null;
    }

    createEventAttribute(): VFXEventAttribute {
        const evtAttr = this.createEmptyEventAttribute();

        if (evtAttr) {
            evtAttr.copyFrom(this.globalEventAttribute);
        }

        return evtAttr;
    }

    reset() {

    }

    /**
     * 设置 property 值（按 property name）
     */
    setPropertyFloat(name: string, value: number): void {
        const entry = this._propertyValues.get(name);
        if (entry) {
            entry.value[0] = value;
        }
    }

    setPropertyVec2(name: string, x: number, y: number): void {
        const entry = this._propertyValues.get(name);
        if (entry) {
            entry.value[0] = x;
            entry.value[1] = y;
        }
    }

    setPropertyVec3(name: string, x: number, y: number, z: number): void {
        const entry = this._propertyValues.get(name);
        if (entry) {
            entry.value[0] = x;
            entry.value[1] = y;
            entry.value[2] = z;
        }
    }

    setPropertyVec4(name: string, x: number, y: number, z: number, w: number): void {
        const entry = this._propertyValues.get(name);
        if (entry) {
            entry.value[0] = x;
            entry.value[1] = y;
            entry.value[2] = z;
            entry.value[3] = w;
        }
    }

    /**
     * 绑定外部 DeviceBuffer 到 VFX 系统（供 sampleGraphicsBuffer operator 使用）
     * @param name bufferUniforms 中的 propertyName
     * @param buffer 要绑定的 DeviceBuffer
     */
    setBuffer(name: string, buffer: DeviceBuffer): void {
        const asset = this.asset;
        if (!asset) return;
        for (let i = 0; i < this.systems.length; i++) {
            const sys = this.systems[i];
            if (!(sys instanceof VFXParticleSystem)) continue;
            const desc = asset.systems[i] as any;
            if (!desc?.bufferUniforms) continue;
            for (const bu of desc.bufferUniforms) {
                if (bu.propertyName !== name) continue;
                const id = Shader3D.propertyNameToID(bu.uniformName + "Buffer");
                for (const sd of sys.getAllShaderDatas()) {
                    sd.setDeviceBuffer(id, buffer.deviceBuffer);
                }
            }
        }
    }

    /**
     * 将 curveUniforms（vec4 采样参数）和 bakedTexture 写入所有粒子系统的 shaderData
     * 只需在资源初始化时调用一次
     */
    private applyCurveUniforms(): void {
        const asset = this.asset;
        if (!asset) return;

        const bakedTexId = asset.bakedTexture ? Shader3D.propertyNameToID("u_VfxBakedTex") : 0;

        for (const system of this.systems) {
            if (!(system instanceof VFXParticleSystem)) continue;
            const allDatas = system.getAllShaderDatas();

            // 设置曲线采样参数
            for (const cu of asset.curveUniforms) {
                const id = Shader3D.propertyNameToID(cu.uniform);
                const d = cu.curveData;
                const vec = new Vector4(d[0] ?? 0, d[1] ?? 0, d[2] ?? 0, d[3] ?? 0);
                for (const sd of allDatas) {
                    sd.setVector(id, vec);
                }
            }

            // 设置烘焙曲线纹理
            if (asset.bakedTexture) {
                for (const sd of allDatas) {
                    sd.setTexture(bakedTexId, asset.bakedTexture);
                }
            }
        }

        // 绑定 Block/Operator 引用的 Texture2D/Texture3D uniform（如 VectorFieldForce）
        const descs = asset.systems;
        for (let i = 0; i < this.systems.length; i++) {
            const system = this.systems[i];
            const desc = descs[i];
            if (!(system instanceof VFXParticleSystem)) continue;
            const textureUniforms = (desc as any).textureUniforms as Array<{ uniformName: string; texture: BaseTexture; textureType?: string }> | undefined;
            if (!textureUniforms || textureUniforms.length === 0) continue;
            const allDatas = system.getAllShaderDatas();
            for (const tu of textureUniforms) {
                const id = Shader3D.propertyNameToID(tu.uniformName);
                // 空 texture fallback 到默认纹理，避免 compute shader bind group 读 null 崩溃
                // （用户可通过 shaderData.setTexture 运行时覆盖）
                let texture: BaseTexture = tu.texture;
                if (!texture) {
                    if (tu.textureType === "Texture3D") {
                        texture = Texture3D.defaultTexture;
                    } else if (tu.textureType === "Texture2DArray") {
                        texture = (Texture2DArray as any).defaultTexture;
                    } else {
                        texture = (Texture2D as any).whiteTexture;
                    }
                }
                if (!texture) continue;
                for (const sd of allDatas) {
                    sd.setTexture(id, texture);
                }
            }
        }
    }

    /**
     * 每帧扫描所有 system 的 textureUniforms，处理 SkinnedMesh entry：
     * - 首次：从 source.sharedMesh 烘焙静态 vertex 属性（pos/idx/weight/normal）
     * - 每帧：刷新 bones 矩阵 texture（动画驱动）
     */
    private _updateSkinnedMeshTextures(): void {
        if (this._skinnedMeshSources.size === 0) return;
        const asset = this.asset;
        if (!asset) return;
        const descs = asset.systems;
        for (let i = 0; i < this.systems.length; i++) {
            const system = this.systems[i];
            const desc = descs[i] as any;
            if (!(system instanceof VFXParticleSystem)) continue;
            if (!desc?.textureUniforms) continue;
            for (const tu of desc.textureUniforms as any[]) {
                if (!tu.skinnedMeshSource) continue;
                const source = this._skinnedMeshSources.get(tu.skinnedMeshSource);
                if (!source) continue;   // 用户尚未注册，保留 fallback texture

                const role = tu.skinnedMeshRole as string;
                if (role === "bones") {
                    // 每帧刷新 bones 矩阵
                    let bonesTex = this._skinnedMeshBoneTextures.get(tu.skinnedMeshSource);
                    bonesTex = bakeSkinnedMeshBonesTexture(source, bonesTex);
                    this._skinnedMeshBoneTextures.set(tu.skinnedMeshSource, bonesTex);
                    tu.texture = bonesTex;
                } else {
                    // 静态 vertex 属性烘焙一次（mesh 不变就不重烘）
                    const bakedKey = `${tu.skinnedMeshSource}|${role}`;
                    if (!tu.texture || !this._skinnedMeshVertexBaked.has(bakedKey)) {
                        // LayaAir mesh 在 owner Sprite3D 的 MeshFilter 组件上
                        const mesh = (source.owner as any)?.getComponent?.(MeshFilter)?.sharedMesh as Mesh;
                        if (!mesh) continue;   // mesh 还没加载完，下一帧再试
                        tu.texture = bakeSkinnedMeshVertexTexture(mesh, role as any);
                        this._skinnedMeshVertexBaked.add(bakedKey);
                    }
                }
                // 应用到 ShaderData
                const id = Shader3D.propertyNameToID(tu.uniformName);
                const allDatas = system.getAllShaderDatas();
                for (const sd of allDatas) sd.setTexture(id, tu.texture);
            }
        }
    }

    private applyProperties(): void {
        for (const entry of this._propertyValues.values()) {
            const v = entry.value;
            const c = entry.cached;

            // 同步缓存对象
            switch (entry.type) {
                case VFXPropertyType.Vec2:
                    c.x = v[0]; c.y = v[1];
                    break;
                case VFXPropertyType.Vec3:
                    c.x = v[0]; c.y = v[1]; c.z = v[2];
                    break;
                case VFXPropertyType.Vec4:
                    c.x = v[0]; c.y = v[1]; c.z = v[2]; c.w = v[3];
                    break;
            }

            for (const system of this.systems) {
                if (system instanceof VFXParticleSystem) {
                    const allDatas = system.getAllShaderDatas();
                    for (const sd of allDatas) {
                        switch (entry.type) {
                            case VFXPropertyType.Float:
                                sd.setNumber(entry.id, v[0]);
                                break;
                            case VFXPropertyType.Vec2:
                                sd.setVector2(entry.id, c);
                                break;
                            case VFXPropertyType.Vec3:
                                sd.setVector3(entry.id, c);
                                break;
                            case VFXPropertyType.Vec4:
                            case VFXPropertyType.Color:
                                sd.setVector(entry.id, c);
                                break;
                            case VFXPropertyType.Gradient:
                                if (c) sd.setTexture(entry.id, c);
                                break;
                        }
                    }
                }
            }
        }
    }

}

/**
 * 按关键帧烘焙 256×1 RGBA8 Gradient Texture2D
 * 用于 sampleGradient 在 VFX shader 里 textureLod(tex, vec2(t, 0.5), 0) 采样
 */
function bakeGradientTexture(stops: { t: number; color: [number, number, number, number] }[]): Texture2D {
    const width = 256;
    const data = new Uint8Array(width * 4);

    // 保底至少两个关键帧
    const rawKeys = stops.length >= 2 ? stops : [
        { t: 0, color: [1, 1, 1, 1] as [number, number, number, number] },
        { t: 1, color: [1, 1, 1, 0] as [number, number, number, number] },
    ];
    // Unity HDR color picker 让 gradient stops 含 >1 值；之前 per-channel clamp 让 (1.22, 5.66, 3.62) 全 >1
    // 的 HDR teal 变成 (1,1,1) 纯白丢 chroma。修：per-stop max-normalize 保留 chroma 方向
    const normalizeStop = (c: number[]): [number, number, number, number] => {
        const r = Math.max(0, c[0]);
        const g = Math.max(0, c[1]);
        const b = Math.max(0, c[2]);
        const a = Math.max(0, Math.min(1, c[3]));
        const maxRGB = Math.max(r, g, b);
        if (maxRGB > 1) {
            return [r / maxRGB, g / maxRGB, b / maxRGB, a];
        }
        return [r, g, b, a];
    };
    const keys = rawKeys.map(k => ({
        t: k.t,
        color: normalizeStop(k.color),
    }));

    for (let i = 0; i < width; i++) {
        const t = i / (width - 1);
        // 在 keys 中线性插值
        let a = keys[0], b = keys[keys.length - 1];
        for (let k = 0; k < keys.length - 1; k++) {
            if (t >= keys[k].t && t <= keys[k + 1].t) {
                a = keys[k];
                b = keys[k + 1];
                break;
            }
        }
        const span = Math.max(b.t - a.t, 1e-6);
        const u = Math.max(0, Math.min(1, (t - a.t) / span));
        const r = a.color[0] + (b.color[0] - a.color[0]) * u;
        const g = a.color[1] + (b.color[1] - a.color[1]) * u;
        const bB = a.color[2] + (b.color[2] - a.color[2]) * u;
        const aA = a.color[3] + (b.color[3] - a.color[3]) * u;
        data[i * 4] = Math.round(r * 255);
        data[i * 4 + 1] = Math.round(g * 255);
        data[i * 4 + 2] = Math.round(bB * 255);
        data[i * 4 + 3] = Math.round(aA * 255);
    }

    const tex = new Texture2D(width, 1, TextureFormat.R8G8B8A8, false, false, false, false);
    tex.setPixelsData(data, false, false);
    tex.wrapModeU = WrapMode.Clamp;
    tex.wrapModeV = WrapMode.Clamp;
    tex.filterMode = FilterMode.Bilinear;
    return tex;
}

export const VFXInit = () => {
    VFXGeometry.init();
    VFXStripGeometry.init();
    VFXEvent.init();
    VFXShaderInit.init();
    ensureIDs();

    // 预加载 vfx 内置默认 material/shader，触发 Shader3D.add 注册让 VFXRenderer
    // fallback 路径能命中。资源位置：用户工程 assets/VfxEditor/runtime/ 下，
    // UUID 与 .meta 一致（与 LayaIDE 插件提供的 .meta 保持同步）。
    //
    // 仅在浏览器/构建产物模式下执行 —— LayaIDE scene 进程会暴露 IEditorEnv 全局，
    // IDE 模式下由 VfxEditor 插件的 Scene.ts @IEditorEnv.onPreload 触发加载（时机
    // 晚于 AssetManager 扫描完成，UUID 能正确解析）。这里跳过 IDE 模式避免引擎
    // init 抢跑 AssetManager 产生 5 个 "Failed to load" warning。
    if (typeof (globalThis as any).IEditorEnv === "undefined") {
        const builtinUuids = [
            "13d6c5e4-ff1f-4739-b21d-0d64931564cb", // VFXUnlit.lmat
            "356f6643-fab9-4626-b04f-9e07482f5b53", // VFXStrip.lmat
            "046c3dc9-8ef4-4e3b-bce3-df93e11bd86e", // VFXBillboardProcedural.shader
            "9e6cee89-5666-43e3-a064-7c26d8ce36d8", // VFXCubeProcedural.shader
            "7b8f3d2e-a415-4c6b-9d8f-2e1a5c3b4d6a", // VFXDistortionQuad.shader
        ];
        for (const uuid of builtinUuids) {
            Laya.loader.load("res://" + uuid).catch(() => { });
        }
    }
}

Laya.addAfterInitCallback(VFXInit);
