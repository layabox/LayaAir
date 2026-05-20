import { VFXEventAttributeDesc } from "./VFXEventAttribute";
import { Mesh } from "../d3/resource/models/Mesh";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { ComputeShader } from "../RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeShader";
import { BaseTexture } from "../resource/BaseTexture";
import { Resource } from "../resource/Resource";

export enum VFXUpdateMode {
    FixedDeltaTime = 0,
    DeltaTime = 1 << 0,
    IgnoreTimeScale = 1 << 1,
    ExactFixedTimeStep = 1 << 2
}

export class VFXEventDesc {
    id: number;
    playSystems: Array<number> = [];
    stopSystems: Array<number> = [];
    initSystems: Array<number> = [];
}


export enum VFXSpawnerTaskType {
    ConstantRate = "ConstantRate",
    SingleBurst = "SingleBurst",
    PeriodicBurst = "PeriodicBurst",
    SpawnOverDistance = "SpawnOverDistance",
    CustomWrapper = "CustomWrapper",
    SetEventAttribute = "SetEventAttribute"
}

interface VFXSpawnerTaskDesc {
    type: VFXSpawnerTaskType;
}

export class VFXSpawnerConstantRateTaskDesc implements VFXSpawnerTaskDesc {
    type: VFXSpawnerTaskType = VFXSpawnerTaskType.ConstantRate;
    rate: number = 1;
}

export class VFXSpawnerSingleBurstTaskDesc implements VFXSpawnerTaskDesc {
    type: VFXSpawnerTaskType = VFXSpawnerTaskType.SingleBurst;
    delay: Vector2 = new Vector2();
    count: Vector2 = new Vector2(1, 1);
    countFromLoopIndex: boolean = false;
    countModulo: number = 0;
}

export class VFXSpawnerPeriodicBurstTaskDesc implements VFXSpawnerTaskDesc {
    type: VFXSpawnerTaskType = VFXSpawnerTaskType.PeriodicBurst;
    delay: Vector2 = new Vector2(1, 1);
    count: Vector2 = new Vector2(1, 1);
}

export class VFXSpawnerOverDistanceTaskDesc implements VFXSpawnerTaskDesc {
    type: VFXSpawnerTaskType = VFXSpawnerTaskType.SpawnOverDistance;
    distance: number = 1;   // 每累积 distance 米发射 1 颗
}

export class VFXSpawnerCustomWrapperTaskDesc implements VFXSpawnerTaskDesc {
    type: VFXSpawnerTaskType = VFXSpawnerTaskType.CustomWrapper;
    callbackName: string = "default";   // VisualEffect.setCustomSpawnCallback(name, fn) 注册的回调名
}

export class VFXSpawnerSetEventAttributeTaskDesc implements VFXSpawnerTaskDesc {
    type: VFXSpawnerTaskType = VFXSpawnerTaskType.SetEventAttribute;
    attribute: string = "lifetime";
    value: [number, number, number, number] = [0, 0, 0, 0];
    fromLoopIndex: boolean = false;
    loopIndexModulo: number = 0;
    // Unity Add(spawnState.loopDuration, spawnState.delayAfterLoop) → src.lifetime 模式
    fromSpawnStateLoop: boolean = false;
}

export enum VFXGPUEventType {
    OnDie = "OnDie",
    Always = "Always",
    OverTime = "OverTime",
    OverDistance = "OverDistance",
    // 后续扩展: OnCollide
}

export interface VFXGPUEventInput {
    sourceSystem: number;       // 源粒子系统在 systems[] 中的索引
    eventType: VFXGPUEventType;
}

/**
 * Output Event 描述（CPU readback 通知，对齐 Unity VFXOutputEvent）
 * 每个 outputEvent context 对应 update shader 中一份 OutputEventBuffer_<eventIdx>
 * Runtime 每帧 readback，按 eventName 派发到 VisualEffect.outputEventReceived 回调
 */
export class VFXOutputEventDesc {
    eventIdx: number;       // 在 update shader 中的序号 (与 OutputEventBuffer_N 的 N 对应)
    eventName: string;      // CPU 派发事件名（"OnDie" 等，可任意自定义）
    eventType: string;      // "OnDie" / "Always" / "OverTime" / "OverDistance"
    capacity: number;       // 缓冲容量上限（每帧最多 capacity 条 entry）
    entryFloats: number = 16;   // 每条 entry float 数（与 OutputEventTemplates 同步）
    entryBytes: number = 64;    // 每条 entry 字节数
}

export enum VFXSimulateSpace {
    Local = 0,
    World = 1
}

export enum VFXBoundsMode {
    Automatic,
    Manual
}

export enum VFXBlendMode {
    Alpha = "Alpha",
    Additive = "Additive",
    Premultiplied = "Premultiplied",
    Opaque = "Opaque"
}

export enum VFXSystemType {
    Spawner = "Spawner",
    Particle = "Particle",
    StaticMesh = "StaticMesh"
}

interface VFXSystemDesc {
    type: VFXSystemType;
}

/**
 * VFXStaticMeshSystem 描述：渲染单个 mesh，不跑 particle simulation
 * Unity VFXStaticMeshOutput 对齐 — mesh 跟随 owner transform，material 由用户提供
 * bindings: setStaticMeshAttr block 收集到的 graph driven 绑定
 *   target: "position" | "rotation" | "scale" | "color"
 *   source: "inline" → value 是静态值 / "property" → name 引用 effect graph property
 */
export interface VFXStaticMeshBinding {
    target: "position" | "rotation" | "scale" | "color";
    source: "inline" | "property";
    value?: any;     // source=inline 时使用（vec3 {x,y,z} / color {r,g,b,a}）
    name?: string;   // source=property 时使用
}

export class VFXStaticMeshSystemDesc implements VFXSystemDesc {
    type: VFXSystemType = VFXSystemType.StaticMesh;
    mesh: Mesh = null;
    materialUuid: string = "";   // runtime 加载得到 material；空字符串则用默认 unlit material
    bindings: VFXStaticMeshBinding[] = [];
}

export class VFXSpawnerSystemDesc implements VFXSystemDesc {
    type: VFXSystemType = VFXSystemType.Spawner;

    loopCount: Vector2 = new Vector2(-1, -1);
    loopDuration: Vector2 = new Vector2(-1, -1);
    delayBeforeLoop: number = 0;
    delayAfterLoop: number = 0;
    tasks: Array<VFXSpawnerTaskDesc> = [];

    onPlayInputs: number[] = []; // 触发该任务的 OnPlay 事件来源系统索引
    onStopInputs: number[] = []; // 触发该任务的 OnStop 事件来源系统索引
}

export class VFXParticleSystemDesc implements VFXSystemDesc {
    type: VFXSystemType = VFXSystemType.Particle;

    capacity: number;

    // AttributeBuffer 每粒子字节数
    attributeBytesPerParticle: number;

    initializeShader: ComputeShader;
    updateShader: ComputeShader;
    outputShader: ComputeShader;

    // DispatchIndirect 预处理 shader（仅当 receiveGPUEvent = true 时需要）
    prepareDispatchShader: ComputeShader;

    // UpdateStrips shader（仅当 strip ring buffer 模式时需要）
    updateStripsShader: ComputeShader;

    outputType: string = "outputMesh";

    spawnerSystems: number[] = [];

    // GPU 事件接收标志，与 spawnerSystems (CPU 事件) 互斥
    receiveGPUEvent: boolean = false;

    // GPU 事件输入配置（仅当 receiveGPUEvent = true 时有效）
    gpuEventInput: VFXGPUEventInput | null = null;

    mesh: Mesh;

    simulateSpace: VFXSimulateSpace = VFXSimulateSpace.Local;

    boundsMode: VFXBoundsMode = VFXBoundsMode.Automatic;
    boundsCenter: Vector3 = new Vector3(0, 0, 0);
    boundsExtents: Vector3 = new Vector3(1, 1, 1);

    particlePerStripCount: number = 128;
    stripCapacity: number = 1;

    blendMode: VFXBlendMode = VFXBlendMode.Alpha;

    // Soft Particle 淡出距离（eye 空间单位，0 = 关闭）
    softParticleFade: number = 0;

    // Flipbook 帧动画图集模式（对齐 Unity VFX Graph Output Context UV Mode）
    // "Default" | "Flipbook" | "FlipbookBlend"
    uvMode: string = "Default";
    // Flipbook atlas 的列数/行数（cols, rows），启用 Flipbook 时用
    flipbookSize: Vector2 = new Vector2(4, 4);
    // Flipbook 模式专用 atlas 资源（res:// uuid），runtime 加载后设到 BillboardMaterial.u_AlbedoTexture
    mainTexture: string = "";

    // Subpixel AA 开关（对齐 Unity subpixelAA block）
    subpixelAA: boolean = false;

    // 自定义 Shader 名（outputShaderGraphQuad 使用，空 = 默认 VFXUnlit）
    customShaderName: string = "";

    // Billboard procedural 配置（对齐 Unity VFXPlanarPrimitiveOutput）
    // 空 = 走旧 mesh 路径（createQuad）兼容现有 VFX；
    // "Quad" / "Triangle" / "Octagon" = 走 VFXBillboardGeometry + gl_VertexID procedural
    billboardPrimitive: string = "";
    // 每 instance 顶点数（Quad=6, Triangle=3, Octagon=18），编译时决定
    billboardVertexCount: number = 0;
    // Octagon 裁角因子 [0, 0.5]，运行时可通过 property 系统动态调整
    billboardCropFactor: number = 0.146;

    // Alpha Clipping (Unity VFXPlanarPrimitiveOutput useAlphaClipping):
    // 让 atlas mask 字符 (alpha<threshold 时 fragment discard)，背景方块透明
    useAlphaClipping: boolean = false;
    alphaThreshold: number = 0.5;

    // Strip output 专属字段（对齐 Unity Output Trail）
    stripColorMapping: string = "Default";   // "Default" | "GradientMapped"
    stripUvScale: { x: number, y: number } = { x: 1, y: 1 };
    stripUvBias: { x: number, y: number } = { x: 0, y: 0 };
    stripGradientStops: { t: number, color: [number, number, number, number] }[] = [];

    // Distortion 模式（outputDistortion 专属）："Procedural" | "NormalMap"
    distortionMode: string = "Procedural";

    // Multi-Output: 额外 output 渲染参数（共享同一粒子数据，独立渲染）
    extraOutputs: VFXExtraOutputDesc[] = [];

    // 纹理 uniform 列表（由 block/operator 的 Texture2D/Texture3D 属性生成）
    // 运行时需要把 texture 绑到 Update/Output shader 的 ShaderData
    textureUniforms: Array<{ uniformName: string; texture: BaseTexture; textureType: string }> = [];

    // StorageBuffer uniform 列表（由 sampleGraphicsBuffer operator 生成）
    // 运行时通过 VisualEffect.setBuffer(name, buffer) 公开 API 绑定
    bufferUniforms: Array<{ uniformName: string; propertyName: string }> = [];

    // Output Event 描述（CPU readback 通知，对齐 Unity VFXOutputEvent）
    outputEvents: Array<VFXOutputEventDesc> = [];
}

/** Multi-Output 额外输出描述（共享粒子数据，独立渲染参数） */
export class VFXExtraOutputDesc {
    outputType: string = "outputMesh";
    outputShader: ComputeShader;
    blendMode: VFXBlendMode = VFXBlendMode.Alpha;
    softParticleFade: number = 0;
    uvMode: string = "Default";
    flipbookSize: Vector2 = new Vector2(4, 4);
    mainTexture: string = "";
    subpixelAA: boolean = false;
    customShaderName: string = "";
    mesh: Mesh;
    stripCapacity: number = 1;
    particlePerStripCount: number = 128;
    textureUniforms: Array<{ uniformName: string; texture: BaseTexture; textureType: string }> = [];

    // outputBillboard / outputCube / outputDistortion 走 procedural geometry 时必需，
    // 否则 VFXBillboardGeometry 构造失败 / 顶点数错 → extra output 渲染不出
    billboardPrimitive: string = "";
    billboardVertexCount: number = 0;
    billboardCropFactor: number = 0.146;
    useAlphaClipping: boolean = false;
    alphaThreshold: number = 0.5;
    // Strip 专属（extra outputTrail）：tilingMode 控制 fragment shader UV 拉伸 vs 每段 tile
    tilingMode: string = "Stretch";
    colorMapping: string = "Default";
    uvScale?: { x: number; y: number };
    uvBias?: { x: number; y: number };
}

export enum VFXPropertyType {
    Float = "float",
    Vec2 = "vec2",
    Vec3 = "vec3",
    Vec4 = "vec4",
    Color = "color",
    Gradient = "gradient",
}

export interface VFXGradientStop {
    t: number;                  // 位置 0~1
    color: [number, number, number, number]; // RGBA
}

export class VFXPropertyDesc {
    name: string;           // 面向用户的属性名
    uniform: string;        // shader uniform 名
    type: VFXPropertyType;
    default: number[];      // 标量 / 向量默认值（非 Gradient 用）
    gradientStops?: VFXGradientStop[];  // Gradient 类型：关键帧列表
}

export class VFXCurveUniformDesc {
    opId: number;           // 操作节点 ID
    uniform: string;        // shader uniform 名，如 "u_VfxCurve_79"
    curveData: number[];    // 曲线采样参数（vec4：用于纹理采样时的 UV 偏移/缩放等）
}

export class VFXAsset extends Resource {

    updateMode: VFXUpdateMode = VFXUpdateMode.FixedDeltaTime;

    initialEventName: string = "OnPlay";

    prewarmStepCount: number = 0;

    prewarmDeltaTime: number = 0;

    /** PreWarm 总时间（秒）；>0 时 play 初次触发会用 prewarmDeltaTime 步长循环 stepCount 次模拟 */
    preWarmTotalTime: number = 0;

    eventAttributeDesc: VFXEventAttributeDesc;

    properties: Array<VFXPropertyDesc> = [];

    /**
     * @internal
     * key: event id
     * value: event desc
    */
    events: Map<number, VFXEventDesc> = new Map<number, VFXEventDesc>();

    systems: Array<VFXSystemDesc> = [];

    // 曲线 uniform 描述列表
    curveUniforms: Array<VFXCurveUniformDesc> = [];

    // 烘焙曲线纹理
    bakedTexture: BaseTexture = null;

    constructor() {
        super(true);
    }

    getEvents(): ReadonlyMap<number, VFXEventDesc> {
        return this.events;
    }

    /**
     * 扫描 systems，将所有 Resource 类型依赖注册到 addDep
     * 在 parser 异步加载完成后调用
     */
    resolveDeps(): void {
        for (const desc of this.systems) {
            if (desc.type === VFXSystemType.Particle) {
                const particleDesc = desc as VFXParticleSystemDesc;
                if (particleDesc.mesh) {
                    this.addDep(particleDesc.mesh);
                }
            }
        }
        if (this.bakedTexture) {
            this.addDep(this.bakedTexture);
        }
    }

    protected _disposeResource(): void {
        this.events.clear();
        this.systems = [];
        this.curveUniforms = [];
        this.bakedTexture = null;
    }

}
