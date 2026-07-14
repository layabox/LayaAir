import { VFXBoundsMode, VFXGPUEventInput, VFXGPUEventType, VFXOutputEventDesc, VFXSimulateSpace } from "../VFXAsset";
import { VFXEventAttribute } from "../VFXEventAttribute";
import { VFXBillboardGeometry, VFXBillboardGeometryParams } from "../VFXBillboardGeometry";
import { VFXGeometry, VFXGeometryParams } from "../VFXGeometry";
import { VFXLineGeometry, VFXLineGeometryParams } from "../VFXLineGeometry";
import { VFXLineStripGeometry, VFXLineStripGeometryParams } from "../VFXLineStripGeometry";
import { VFXPointGeometry, VFXPointGeometryParams } from "../VFXPointGeometry";
import { VFXState } from "../VFXState";
import { VFXStripGeometry, VFXStripGeometryParams } from "../VFXStripGeometry";
import { VFXSpawnerSystem } from "./VFXSpawnerSystem";
import { VFXSystem } from "./VFXSystem";
import { Camera } from "../../d3/core/Camera";
import { GeometryElement } from "../../d3/core/GeometryElement";
import { DeviceBuffer } from "../../d3/graphics/DeviceBuffer";
import { Mesh } from "../../d3/resource/models/Mesh";
import { LayaGL } from "../../layagl/LayaGL";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";
import { ComputeCommandBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeCommandBuffer";
import { ComputeShader } from "../../RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeShader";
import { EDeviceBufferUsage } from "../../RenderDriver/DriverDesign/RenderDevice/IDeviceBuffer";
import { ShaderData, ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../resource/BaseTexture";

// 缓存 Shader3D.propertyNameToID 结果，避免每帧重复查找
// 延迟初始化：Shader3D.propertyNameToID 需要在引擎初始化后调用
let ID: {
    DeadListBuffer: number;
    AliveListReadBuffer: number;
    AliveListWriteBuffer: number;
    AttributeBuffer: number;
    RenderBuffer: number;
    IndirectBuffer: number;
    SourceAttributeBuffer: number;
    PrefixSumBuffer: number;
    EventIndexBuffer: number;
    SourceParticleBuffer: number;
    AccumulatorBuffer: number;
    GPUEventDispatchBuffer: number;
    BoundsBuffer: number;
    u_Capacity: number;
    u_DeltaTime: number;
    u_TotalTime: number;
    u_SystemSeed: number;
    u_SpawnedCount: number;
    u_TotalSpawnedCount: number;
    u_LoopIndex: number;
    u_EventCount: number;
    u_MaxSpawnCount: number;
    // SpawnState operator (Unity SpawnState.cs 对齐) — Initialize stage uniforms
    u_NewLoop: number;
    u_LoopState: number;
    u_SpawnCount: number;
    u_SpawnDeltaTime: number;
    u_SpawnTotalTime: number;
    u_LoopDuration: number;
    u_LoopCount: number;
    u_DelayBeforeLoop: number;
    u_DelayAfterLoop: number;
    u_EmitterWorldMatrix: number;
    u_InvEmitterWorldMatrix: number;
    u_SourceSimulateSpace: number;
    u_VfxCameraParams: number;
    u_VfxCameraParams2: number;
    u_VfxCameraParams3: number;
    u_CameraDepthTexture: number;
    u_VfxViewProjection: number;
    u_VfxInvViewProjection: number;
    u_OrientCameraPos: number;
    u_OrientCameraDir: number;
    u_ParticlePerStrip: number;
    u_StripCapacity: number;
    StripDataBuffer: number;
};

export function ensureIDs(): void {
    if (ID) return;
    ID = {
        DeadListBuffer: Shader3D.propertyNameToID("DeadListBuffer"),
        AliveListReadBuffer: Shader3D.propertyNameToID("AliveListReadBuffer"),
        AliveListWriteBuffer: Shader3D.propertyNameToID("AliveListWriteBuffer"),
        AttributeBuffer: Shader3D.propertyNameToID("AttributeBuffer"),
        RenderBuffer: Shader3D.propertyNameToID("RenderBuffer"),
        IndirectBuffer: Shader3D.propertyNameToID("IndirectBuffer"),
        SourceAttributeBuffer: Shader3D.propertyNameToID("SourceAttributeBuffer"),
        PrefixSumBuffer: Shader3D.propertyNameToID("PrefixSumBuffer"),
        EventIndexBuffer: Shader3D.propertyNameToID("EventIndexBuffer"),
        SourceParticleBuffer: Shader3D.propertyNameToID("SourceParticleBuffer"),
        AccumulatorBuffer: Shader3D.propertyNameToID("AccumulatorBuffer"),
        GPUEventDispatchBuffer: Shader3D.propertyNameToID("GPUEventDispatchBuffer"),
        BoundsBuffer: Shader3D.propertyNameToID("BoundsBuffer"),
        StripDataBuffer: Shader3D.propertyNameToID("StripDataBuffer"),
        u_Capacity: Shader3D.propertyNameToID("u_Capacity"),
        u_DeltaTime: Shader3D.propertyNameToID("u_DeltaTime"),
        u_TotalTime: Shader3D.propertyNameToID("u_TotalTime"),
        u_SystemSeed: Shader3D.propertyNameToID("u_SystemSeed"),
        u_SpawnedCount: Shader3D.propertyNameToID("u_SpawnedCount"),
        u_TotalSpawnedCount: Shader3D.propertyNameToID("u_TotalSpawnedCount"),
        u_LoopIndex: Shader3D.propertyNameToID("u_LoopIndex"),
        u_EventCount: Shader3D.propertyNameToID("u_EventCount"),
        u_MaxSpawnCount: Shader3D.propertyNameToID("u_MaxSpawnCount"),
        u_EmitterWorldMatrix: Shader3D.propertyNameToID("u_EmitterWorldMatrix"),
        u_InvEmitterWorldMatrix: Shader3D.propertyNameToID("u_InvEmitterWorldMatrix"),
        u_SourceSimulateSpace: Shader3D.propertyNameToID("u_SourceSimulateSpace"),
        u_VfxCameraParams: Shader3D.propertyNameToID("u_VfxCameraParams"),
        u_VfxCameraParams2: Shader3D.propertyNameToID("u_VfxCameraParams2"),
        u_VfxCameraParams3: Shader3D.propertyNameToID("u_VfxCameraParams3"),
        u_CameraDepthTexture: Shader3D.propertyNameToID("u_CameraDepthTexture"),
        u_VfxViewProjection: Shader3D.propertyNameToID("u_VfxViewProjection"),
        u_VfxInvViewProjection: Shader3D.propertyNameToID("u_VfxInvViewProjection"),
        u_OrientCameraPos: Shader3D.propertyNameToID("u_OrientCameraPos"),
        u_OrientCameraDir: Shader3D.propertyNameToID("u_OrientCameraDir"),
        u_ParticlePerStrip: Shader3D.propertyNameToID("u_ParticlePerStrip"),
        u_StripCapacity: Shader3D.propertyNameToID("u_StripCapacity"),
        // SpawnState
        u_NewLoop: Shader3D.propertyNameToID("u_NewLoop"),
        u_LoopState: Shader3D.propertyNameToID("u_LoopState"),
        u_SpawnCount: Shader3D.propertyNameToID("u_SpawnCount"),
        u_SpawnDeltaTime: Shader3D.propertyNameToID("u_SpawnDeltaTime"),
        u_SpawnTotalTime: Shader3D.propertyNameToID("u_SpawnTotalTime"),
        u_LoopDuration: Shader3D.propertyNameToID("u_LoopDuration"),
        u_LoopCount: Shader3D.propertyNameToID("u_LoopCount"),
        u_DelayBeforeLoop: Shader3D.propertyNameToID("u_DelayBeforeLoop"),
        u_DelayAfterLoop: Shader3D.propertyNameToID("u_DelayAfterLoop"),
    };
}

export class VFXParticleSystem extends VFXSystem {

    /**
     * 关联的SpawnerSystem索引列表
     */
    spawnerSystems: number[] = [];

    // 包围盒模式
    boundsMode: VFXBoundsMode = VFXBoundsMode.Automatic;
    boundsCenter: Vector3 = new Vector3(0, 0, 0);
    boundsExtents: Vector3 = new Vector3(1, 1, 1);

    // 缓存相机参数 Vector4，避免每帧分配
    private _cameraParams: Vector4 = new Vector4();
    private _cameraParams2: Vector4 = new Vector4();
    private _cameraParams3: Vector4 = new Vector4();

    // 模拟空间
    simulateSpace: VFXSimulateSpace = VFXSimulateSpace.Local;

    // GPU 事件接收标志，与 spawnerSystems (CPU 事件) 互斥
    receiveGPUEvent: boolean = false;

    // GPU 事件输入配置
    gpuEventInput: VFXGPUEventInput | null = null;

    // GPU 事件运行时引用（init 时解析）
    gpuEventSourceSystem: VFXParticleSystem | null = null;
    gpuEventType: VFXGPUEventType | null = null;

    // GPU 事件接收系统计数（源系统持有，用于累加器缓冲大小计算）
    gpuEventReceiverCount: number = 0;

    // EventIndexBuffer 数组: 每个接收系统独立一个 { uint count; uint indices[capacity]; }
    // 由源系统持有，接收系统 init 时通过 addEventIndexBuffer() 创建
    eventIndexBuffers: DeviceBuffer[] = [];

    // 接收系统在源系统 eventIndexBuffers 中的索引
    gpuEventBufferIndex: number = -1;

    // GPU 事件累加器缓冲（源系统持有，所有事件类型通用，capacity * numEvents 个 float）
    gpuEventAccumulatorBuffer: DeviceBuffer | null = null;

    initializeShader: ComputeShader;
    updateShader: ComputeShader;
    outputShader: ComputeShader;

    // DispatchIndirect 预处理 shader
    prepareDispatchShader: ComputeShader;
    prepareDispatchDatas: ShaderData[];

    // GPU 事件 DispatchIndirect 参数缓冲 (12 bytes: x, y, z)
    gpuEventDispatchBuffer: DeviceBuffer | null = null;

    capacity: number = 10;

    // AttributeBuffer 每粒子字节数
    attributeBytesPerParticle: number;

    mesh: Mesh;

    // Strip/Trail 模式
    outputType: string = "outputMesh";

    get isStripOutput(): boolean {
        return this.outputType === "outputTrail" || this.outputType === "outputParticleStripSGQuad";
    }
    particlePerStripCount: number = 128;
    stripCapacity: number = 1;

    // 混合模式 — 对齐 Unity VFX Graph BlendMode
    blendMode: import("../VFXAsset").VFXBlendMode = "Alpha" as any;

    // Soft Particle 淡出距离（eye 空间单位，0 = 关闭）
    softParticleFade: number = 0;

    // Flipbook UV 模式 + 图集尺寸（对齐 Unity Output Context UV Mode）
    uvMode: string = "Default";
    flipbookSize: Vector2 = new Vector2(4, 4);
    // Flipbook atlas 资源（res:// uuid），uvMode != Default 时由 runtime 加载到 BillboardMaterial.u_AlbedoTexture
    mainTexture: string = "";

    // Subpixel AA 开关
    subpixelAA: boolean = false;

    // Strip output 专属字段（对齐 Unity Output Trail）
    stripColorMapping: string = "Default";   // "Default" | "GradientMapped"
    stripUvScale: { x: number, y: number } = { x: 1, y: 1 };
    stripUvBias: { x: number, y: number } = { x: 0, y: 0 };
    stripGradientStops: { t: number, color: [number, number, number, number] }[] = [];
    stripTilingMode: string = "Stretch";   // "Stretch" | "RepeatPerSegment"

    // 自定义 Shader 名（空 = VFXUnlit）
    customShaderName: string = "";

    // Billboard procedural 配置（对齐 Unity VFXPlanarPrimitiveOutput）
    // 空 = 走旧 mesh 路径；"Quad"/"Triangle"/"Octagon" = VFXBillboardGeometry
    billboardPrimitive: string = "";
    billboardVertexCount: number = 0;
    billboardCropFactor: number = 0.146;
    useAlphaClipping: boolean = false;
    alphaThreshold: number = 0.5;

    get isBillboardProcedural(): boolean {
        return this.outputType === "outputBillboard" && !!this.billboardPrimitive;
    }

    /** Billboard / Cube / Distortion procedural：都走 VFXBillboardGeometry + gl_VertexID */
    get isProceduralGeometry(): boolean {
        return (this.outputType === "outputBillboard" || this.outputType === "outputCube" || this.outputType === "outputDistortion") && !!this.billboardPrimitive;
    }

    /** Distortion mode: "Procedural" (默认径向) / "NormalMap" */
    distortionMode: string = "Procedural";

    // Strip 渲染 buffer（仅 outputTrail 使用）
    stripVertexBuffer: DeviceBuffer | null = null;

    // Strip Ring Buffer data (4 uint per strip, for ring buffer architecture)
    stripDataBuffer: DeviceBuffer | null = null;
    updateStripsShader: ComputeShader | null = null;
    updateStripsDatas: ShaderData[] | null = null;
    useStripRingBuffer: boolean = false;

    spawnedCount: number = 0;
    eventCount: number = 0;

    /** 本系统历史上已成功 Initialize 的粒子总数（用于 spawnIndex / particleId 与 Unity 对齐） */
    private _cumulativeSpawnTotal: number = 0;

    maxEventsPerFrame: number = 32;

    // CPU 暂存：逐事件的源属性数据 (与 SourceAttributeBuffer GPU 布局一致)
    private sourceAttributeStaging: Float32Array;
    // CPU 暂存：前缀和数组
    private prefixSumStaging: Uint32Array;
    // CPU 暂存：逐事件生成数量
    private spawnCountsPerEvent: Uint32Array;

    dispatch: Vector3 = new Vector3(1, 1, 1);

    initializeDatas: ShaderData[];
    updateDatas: ShaderData[];
    outputDatas: ShaderData[];

    // Multi-Output: 额外 output 的独立资源
    extraOutputs: Array<{
        outputShader: ComputeShader;
        outputDatas: ShaderData[];
        renderBuffer: DeviceBuffer;
        indirectBuffer: DeviceBuffer;
        geometry: GeometryElement;
        outputType: string;
        blendMode: string;
        softParticleFade: number;
        uvMode: string;
        flipbookSize: Vector2;
        subpixelAA: boolean;
        customShaderName: string;
        mesh: Mesh;
        billboardPrimitive?: string;
        billboardVertexCount?: number;
        billboardCropFactor?: number;
        useAlphaClipping?: boolean;
        alphaThreshold?: number;
        tilingMode?: string;
        colorMapping?: string;
        uvScale?: { x: number; y: number };
        uvBias?: { x: number; y: number };
        mainTexture?: string;
    }> = [];

    // DeadList 管理空闲槽位
    deadListBuffer: DeviceBuffer;

    // 双缓冲AliveList
    aliveListBufferRead: DeviceBuffer;
    aliveListBufferWrite: DeviceBuffer;

    // 粒子属性存储
    attributeBuffer: DeviceBuffer;

    // 渲染数据
    renderBuffer: DeviceBuffer;

    // 间接渲染参数
    indirectBuffer: DeviceBuffer;

    // 逐事件源属性 (SourceAttributeBuffer)
    sourceAttributeBuffer: DeviceBuffer;

    // 前缀和数组 (PrefixSumBuffer)
    prefixSumBuffer: DeviceBuffer;

    // 独立的渲染几何体（outputType 不同时会是其中任一种）
    geometry: VFXGeometry | VFXStripGeometry | VFXPointGeometry | VFXLineGeometry | VFXLineStripGeometry | VFXBillboardGeometry;

    // 包围盒 GPU 计算 + 异步回读
    boundsBuffer: DeviceBuffer;           // STORAGE | COPY_SRC, 24 bytes (6 × int32)
    boundsStagingBuffer: DeviceBuffer;    // MAP_READ | COPY_DST, 24 bytes
    private boundsResetData: Int32Array;       // 预分配的重置数据 [INT_MAX×3, INT_MIN×3]
    private boundsReadbackDest: ArrayBuffer;   // 预分配的回读目标缓冲
    private boundsReadbackPending: boolean = false;
    private boundsDataView: DataView;          // 预分配的 DataView 用于 int→float 转换
    private _released: boolean = false;


    // EventIndexBuffer_N 的 propertyID 缓存
    private eventIndexBufferIDs: number[] = [];

    // ─── Output Event (CPU readback) ─────────────────
    // 每条 outputEvent 一个 storage buffer + staging buffer
    outputEventDescs: VFXOutputEventDesc[] = [];
    outputEventBuffers: DeviceBuffer[] = [];               // STORAGE | COPY_SRC | COPY_DST，update shader 写入
    private outputEventStagingBuffers: DeviceBuffer[] = []; // MAP_READ | COPY_DST，CPU 回读
    private outputEventBufferIDs: number[] = [];                 // OutputEventBuffer_<idx> propertyID
    private outputEventReadbackDest: ArrayBuffer[] = [];         // 预分配回读目标
    private outputEventReadbackPending: boolean[] = [];
    // 共享 OverTime/OverDistance 累加器（per-particle × oeAccumulatorSlots）
    private outputEventAccumulatorBuffer: DeviceBuffer | null = null;
    private outputEventAccumulatorBufferID: number = -1;
    private outputEventAccumulatorSlots: number = 0;

    constructor() {
        super();

        this.initializeDatas = [LayaGL.renderDeviceFactory.createShaderData()];
        this.updateDatas = [LayaGL.renderDeviceFactory.createShaderData()];
        this.outputDatas = [LayaGL.renderDeviceFactory.createShaderData()];
        this.prepareDispatchDatas = [LayaGL.renderDeviceFactory.createShaderData()];

        this._allShaderDatas = [
            this.initializeDatas[0],
            this.updateDatas[0],
            this.outputDatas[0],
            this.prepareDispatchDatas[0],
        ];
        // Multi-Output: extra outputs 的 ShaderData 也需要 common uniforms
        for (const extra of this.extraOutputs) {
            if (extra.outputDatas?.[0]) {
                this._allShaderDatas.push(extra.outputDatas[0]);
            }
        }
    }

    /**
     * 创建 Output Event 资源（缓冲 + staging + accumulator）
     * 在 init() 中根据 outputEventDescs 调用一次
     */
    private setupOutputEventBuffers(): void {
        if (!this.outputEventDescs || this.outputEventDescs.length === 0) return;

        // 累加器槽位计数：OverTime/OverDistance 每事件 1 slot/particle
        this.outputEventAccumulatorSlots = 0;
        for (const desc of this.outputEventDescs) {
            if (desc.eventType === "OverTime" || desc.eventType === "OverDistance") {
                this.outputEventAccumulatorSlots++;
            }
        }

        const bufUsage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_SRC | EDeviceBufferUsage.COPY_DST;
        const stagingUsage = EDeviceBufferUsage.MAP_READ | EDeviceBufferUsage.COPY_DST;

        for (let i = 0; i < this.outputEventDescs.length; i++) {
            const desc = this.outputEventDescs[i];
            // 布局：{ uint count; float data[]; } — count 占 4 byte，data 从 byte 4 开始（对齐 EventIndexBuffer pattern）
            const bufSize = 4 + desc.capacity * desc.entryBytes;

            const buffer = new DeviceBuffer(bufSize, bufUsage);
            // 初始化 count = 0
            const initData = new Uint32Array(1);
            initData[0] = 0;
            buffer.deviceBuffer.setData(initData.buffer, 0, 0, 4);
            this.outputEventBuffers.push(buffer);

            const staging = new DeviceBuffer(bufSize, stagingUsage);
            this.outputEventStagingBuffers.push(staging);

            this.outputEventBufferIDs.push(Shader3D.propertyNameToID(`OutputEventBuffer_${desc.eventIdx}`));
            this.outputEventReadbackDest.push(new ArrayBuffer(bufSize));
            this.outputEventReadbackPending.push(false);
        }

        // OverTime/OverDistance 累加器（共享一份）
        if (this.outputEventAccumulatorSlots > 0) {
            const accBytes = this.capacity * this.outputEventAccumulatorSlots * 4;
            const accUsage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST;
            this.outputEventAccumulatorBuffer = new DeviceBuffer(accBytes, accUsage);
            const init = new Float32Array(this.capacity * this.outputEventAccumulatorSlots);
            this.outputEventAccumulatorBuffer.deviceBuffer.setData(init.buffer, 0, 0, accBytes);
            this.outputEventAccumulatorBufferID = Shader3D.propertyNameToID("OutputEventAccumulatorBuffer");
        }
    }

    /**
     * Update 阶段后，将 OutputEventBuffer 拷贝到 staging（与 bounds 同批次提交）
     */
    copyOutputEventsToStaging(cmd: ComputeCommandBuffer): void {
        for (let i = 0; i < this.outputEventBuffers.length; i++) {
            if (this.outputEventReadbackPending[i]) continue;
            const buf = this.outputEventBuffers[i];
            const staging = this.outputEventStagingBuffers[i];
            if (!buf || !staging) continue;
            const desc = this.outputEventDescs[i];
            const bytes = 4 + desc.capacity * desc.entryBytes;
            cmd.addBufferToBufferCommand(buf.deviceBuffer, staging.deviceBuffer, 0, 0, bytes);
        }
    }

    /**
     * 异步回读 OutputEventBuffer，解析后调用 callback 派发事件
     * @param dispatch (eventName, entries[]) => void  其中 entries 是已解析为对象数组
     */
    requestOutputEventReadback(dispatch: (eventName: string, entries: Array<any>) => void): void {
        if (this._released) return;
        for (let i = 0; i < this.outputEventStagingBuffers.length; i++) {
            if (this.outputEventReadbackPending[i]) continue;
            const staging = this.outputEventStagingBuffers[i];
            const desc = this.outputEventDescs[i];
            if (!staging || !desc) continue;
            const bytes = 4 + desc.capacity * desc.entryBytes;
            const dest = this.outputEventReadbackDest[i];
            this.outputEventReadbackPending[i] = true;
            const idx = i;
            staging.deviceBuffer.readData(dest, 0, 0, bytes).then(() => {
                this.outputEventReadbackPending[idx] = false;
                if (this._released) return;
                this._dispatchOutputEvent(idx, dispatch);
            });
        }
    }

    private _dispatchOutputEvent(idx: number, dispatch: (eventName: string, entries: Array<any>) => void): void {
        const desc = this.outputEventDescs[idx];
        const dest = this.outputEventReadbackDest[idx];
        if (!desc || !dest) return;
        const u32 = new Uint32Array(dest);
        const f32 = new Float32Array(dest);
        const count = Math.min(u32[0], desc.capacity);
        if (count === 0) return;
        const entries: any[] = [];
        const headerFloats = 1; // count 占 4 byte = 1 float
        for (let i = 0; i < count; i++) {
            const base = headerFloats + i * desc.entryFloats;
            entries.push({
                particleId: u32[base + 0],
                position: [f32[base + 1], f32[base + 2], f32[base + 3]],
                age: f32[base + 4],
                velocity: [f32[base + 5], f32[base + 6], f32[base + 7]],
                lifetime: f32[base + 8],
                color: [f32[base + 9], f32[base + 10], f32[base + 11], f32[base + 12]],
                size: f32[base + 13],
            });
        }
        dispatch(desc.eventName, entries);
    }

    /**
     * 创建一个新的 EventIndexBuffer，返回其在数组中的索引
     * 每个接收系统调用一次，获得独立的事件缓冲
     */
    addEventIndexBuffer(maxEntries: number): number {
        const index = this.eventIndexBuffers.length;

        const bufferSize = 4 * (maxEntries + 1); // count + indices[]
        const usage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST;
        const buffer = new DeviceBuffer(bufferSize, usage);

        // 初始化 count = 0
        const initData = new Uint32Array(1);
        initData[0] = 0;
        buffer.deviceBuffer.setData(initData.buffer, 0, 0, 4);

        this.eventIndexBuffers.push(buffer);
        this.eventIndexBufferIDs.push(Shader3D.propertyNameToID(`EventIndexBuffer_${index}`));
        return index;
    }

    /**
     * 创建 GPU 事件累加器缓冲（所有事件类型通用，每个接收系统注册时调用）
     * 每粒子每事件 1 个 float，shader 中通过 acc += triggerValue 累加到 >= 1.0 时触发
     */
    ensureAccumulatorBuffer(): void {
        if (this.gpuEventAccumulatorBuffer) {
            this.gpuEventAccumulatorBuffer.destroy();
        }
        const numEvents = this.gpuEventReceiverCount;
        if (numEvents === 0) return;

        const bufferSize = this.capacity * numEvents * 4;
        const usage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST;
        this.gpuEventAccumulatorBuffer = new DeviceBuffer(bufferSize, usage);

        // 零初始化
        const initData = new Float32Array(this.capacity * numEvents);
        this.gpuEventAccumulatorBuffer.deviceBuffer.setData(initData.buffer, 0, 0, bufferSize);
    }

    private initSourceAttributes() {
        const desc = this.effect.asset.eventAttributeDesc;

        // 从 desc 获取 std430 对齐的布局参数（与 GPU SourceAttributeBuffer 一致）
        const headerBytes = desc.eventDataOffset;
        const eventStride = desc.eventDataStride;
        const totalBytes = headerBytes + this.maxEventsPerFrame * eventStride;

        this.sourceAttributeStaging = new Float32Array(totalBytes / 4);
        this.prefixSumStaging = new Uint32Array(this.maxEventsPerFrame + 1);
        this.spawnCountsPerEvent = new Uint32Array(this.maxEventsPerFrame);

        const storageUsage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST;
        this.sourceAttributeBuffer = new DeviceBuffer(totalBytes, storageUsage);
        this.prefixSumBuffer = new DeviceBuffer(4 * (this.maxEventsPerFrame + 1), storageUsage);
    }

    private releaseSourceAttributes() {
        this.sourceAttributeBuffer.destroy();
        this.prefixSumBuffer.destroy();
    }

    /**
     * 设置各阶段共享的 uniform（每帧调用一次，赋值给所有 shaderData）
     */
    private _allShaderDatas: ShaderData[];

    getAllShaderDatas(): ShaderData[] {
        // Multi-Output: extras 是 VisualEffect.onAwake 之后 push 进 this.extraOutputs 的，
        // 比 constructor 里收集 _allShaderDatas 晚 → 不修就不会被 setCommonUniforms 设 u_Capacity / u_TotalTime 等,
        // 导致 extra compute shader uniform 全 0, thread bound check 全失败, indirect.instanceCount 永远不写 → extra 不渲染。
        // 每次 read 时重算 union（相同 ShaderData 不重复 push）。
        if (this.extraOutputs.length > 0) {
            for (const extra of this.extraOutputs) {
                const esd = extra.outputDatas?.[0];
                if (esd && this._allShaderDatas.indexOf(esd) === -1) {
                    this._allShaderDatas.push(esd);
                }
            }
        }
        return this._allShaderDatas;
    }

    setCommonUniforms(state: VFXState, camera: Camera): void {
        const allDatas = this.getAllShaderDatas();
        for (const sd of allDatas) {
            sd.setInt(ID.u_Capacity, this.capacity);
            sd.setNumber(ID.u_DeltaTime, state.deltaTime);
            sd.setNumber(ID.u_TotalTime, state.totalTime);
            sd.setInt(ID.u_SystemSeed, state.systemSeed);
            sd.setInt(ID.u_MaxSpawnCount, this.capacity);
            sd.setInt(ID.u_ParticlePerStrip, this.particlePerStripCount);
            sd.setInt(ID.u_StripCapacity, this.stripCapacity);
        }

        // 设置 emitter 矩阵到所有阶段（空间变换需要）
        for (const sd of allDatas) {
            sd.setMatrix4x4(ID.u_EmitterWorldMatrix, state.emitterWorldMatrix);
            sd.setMatrix4x4(ID.u_InvEmitterWorldMatrix, state.invEmitterWorldMatrix);
        }

        // 设置主相机数据
        // u_VfxCameraParams:  xyz=position, w=orthographic
        // u_VfxCameraParams2: xyz=rotation(euler), w=fov
        // u_VfxCameraParams3: x=near, y=far, z=orthoSize, w=aspect
        if (camera) {
            const pos = camera.transform.position;
            const rot = camera.transform.localRotationEuler;
            const isOrtho = camera.orthographic ? 1.0 : 0.0;

            this._cameraParams.setValue(pos.x, pos.y, pos.z, isOrtho);
            this._cameraParams2.setValue(rot.x, rot.y, rot.z, camera.fieldOfView);
            this._cameraParams3.setValue(camera.nearPlane, camera.farPlane, camera.orthographicVerticalSize, camera.aspectRatio);

            for (const sd of allDatas) {
                sd.setVector(ID.u_VfxCameraParams, this._cameraParams);
                sd.setVector(ID.u_VfxCameraParams2, this._cameraParams2);
                sd.setVector(ID.u_VfxCameraParams3, this._cameraParams3);
            }

            // collisionDepthBuffer 需要的深度纹理 + VP 矩阵
            // 访问 Camera 深度纹理：优先 @internal getter，fallback 到 private 字段
            const depthTex = ((camera as any).depthTexture
                ?? (camera as any)._depthTexture) as BaseTexture | null;
            if (depthTex) {
                const vp = camera.projectionViewMatrix;
                if (!this._invVP) this._invVP = new Matrix4x4();
                vp.invert(this._invVP);
                for (const sd of allDatas) {
                    sd.setTexture(ID.u_CameraDepthTexture, depthTex);
                    sd.setMatrix4x4(ID.u_VfxViewProjection, vp);
                    sd.setMatrix4x4(ID.u_VfxInvViewProjection, this._invVP);
                }
            }
        }
    }

    private _invVP: Matrix4x4;

    /**
     * 通过 cmd 设置当前渲染相机的位置和朝向到 output shader
     */
    setOrientCamera(cmd: ComputeCommandBuffer, cameraWorldPos: Vector3, cameraForward: Vector3): void {
        for (const sd of this.outputDatas) {
            cmd.addSetShaderDataCommand(sd, ID.u_OrientCameraPos, ShaderDataType.Vector3, cameraWorldPos);
            cmd.addSetShaderDataCommand(sd, ID.u_OrientCameraDir, ShaderDataType.Vector3, cameraForward);
        }
        // Multi-Output: extra outputDatas 也需要 orient camera 数据,
        // 不然 extra orient block 算出 (0,0,0) 假相机位置 → quaternion 错 → 粒子 quad 朝怪方向 / size collapse → 不可见
        for (const extra of this.extraOutputs) {
            const esd = extra.outputDatas?.[0];
            if (esd) {
                cmd.addSetShaderDataCommand(esd, ID.u_OrientCameraPos, ShaderDataType.Vector3, cameraWorldPos);
                cmd.addSetShaderDataCommand(esd, ID.u_OrientCameraDir, ShaderDataType.Vector3, cameraForward);
            }
        }
    }

    init(): void {

        const capacity = this.capacity;

        // 初始化DeadList（count + indices[]）
        const deadListSize = 4 * (capacity + 1);
        const deadListUsage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST;
        this.deadListBuffer = new DeviceBuffer(deadListSize, deadListUsage);

        // 初始化DeadList
        {
            const initData = new Uint32Array(capacity + 1);
            if (this.useStripRingBuffer) {
                // Ring buffer mode: DeadList starts empty (count=0), ring buffer manages allocation
                initData[0] = 0;
            } else {
                // Normal mode: all slots are free
                initData[0] = capacity; // count = capacity
                for (let i = 0; i < capacity; i++) {
                    initData[i + 1] = i;
                }
            }
            this.deadListBuffer.deviceBuffer.setData(initData.buffer, 0, 0, deadListSize);
        }

        // Strip: StripDataBuffer (5 uint per strip) for ring buffer tracking
        // Layout: [firstIndex, nextIndex, snapFirst, snapNext, minAlive(hi16)|maxAlive(lo16)]
        // Matches Unity: firstIndex, nextIndex, prevNextIndex, minAlive, maxAlive
        if (this.isStripOutput) {
            const stripCount = this.stripCapacity;
            const stripDataSize = stripCount * 5 * 4; // 5 uint per strip
            const stripDataUsage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST;
            this.stripDataBuffer = new DeviceBuffer(stripDataSize, stripDataUsage);

            // Initialize: all zeros, minAlive = 0xFFFFFFFF (no alive yet)
            const stripInit = new Uint32Array(stripCount * 5);
            for (let s = 0; s < stripCount; s++) {
                stripInit[s * 5 + 4] = 0xFFFFFFFF; // minAlive = max uint (sentinel)
            }
            this.stripDataBuffer.deviceBuffer.setData(stripInit.buffer, 0, 0, stripDataSize);

        }

        // 初始化AliveList双缓冲（count + indices[]）
        const aliveListSize = 4 * (capacity + 1);
        const aliveListUsage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST;

        this.aliveListBufferRead = new DeviceBuffer(aliveListSize, aliveListUsage);
        this.aliveListBufferWrite = new DeviceBuffer(aliveListSize, aliveListUsage);

        // 初始化count=0
        {
            const initData = new Uint32Array(1);
            initData[0] = 0;
            this.aliveListBufferRead.deviceBuffer.setData(initData.buffer, 0, 0, 4);
            this.aliveListBufferWrite.deviceBuffer.setData(initData.buffer, 0, 0, 4);
        }

        // 初始化AttributeBuffer
        const attributeStride = this.attributeBytesPerParticle;
        const attributeUsage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST;
        this.attributeBuffer = new DeviceBuffer(attributeStride * capacity, attributeUsage);

        const isNoOutput = this.outputType === "none";
        const isStrip = this.isStripOutput;
        const isPoint = this.outputType === "outputPoint";
        const isLine = this.outputType === "outputLine";
        const isLineStrip = this.outputType === "outputLineStrip";
        const isBillboardProc = this.isProceduralGeometry;

        if (!isNoOutput) {
            // 初始化RenderBuffer 每粒子 stride：
            // Strip: 2 verts × 4 vec4 = 128 bytes
            // Point: 1 vert × 3 vec4 = 48 bytes
            // Line:  2 verts × 4 vec4 = 128 bytes
            // Mesh/Billboard: RENDER_STRIDE vec4 = 80 bytes (instance)
            let renderStride: number;
            if (isStrip) renderStride = 2 * 4 * 16;
            else if (isPoint) renderStride = 3 * 16;
            else if (isLineStrip) renderStride = 3 * 16;  // 同 Point: 1 vertex × 3 vec4
            else if (isLine) renderStride = 2 * 4 * 16;
            else renderStride = VFXGeometry.ParticleDecl.vertexStride;
            const renderUsage = EDeviceBufferUsage.STORAGE |
                EDeviceBufferUsage.COPY_DST |
                EDeviceBufferUsage.VERTEX;
            this.renderBuffer = new DeviceBuffer(renderStride * capacity, renderUsage);
            if (isStrip) {
                if (!VFXStripGeometry.StripVertexDecl) VFXStripGeometry.init();
                this.renderBuffer.vertexBuffer.vertexDeclaration = VFXStripGeometry.StripVertexDecl;
            } else if (isPoint) {
                if (!VFXPointGeometry.PointVertexDecl) VFXPointGeometry.init();
                this.renderBuffer.vertexBuffer.vertexDeclaration = VFXPointGeometry.PointVertexDecl;
            } else if (isLineStrip) {
                if (!VFXLineStripGeometry.LineStripVertexDecl) VFXLineStripGeometry.init();
                this.renderBuffer.vertexBuffer.vertexDeclaration = VFXLineStripGeometry.LineStripVertexDecl;
            } else if (isLine) {
                if (!VFXLineGeometry.LineVertexDecl) VFXLineGeometry.init();
                this.renderBuffer.vertexBuffer.vertexDeclaration = VFXLineGeometry.LineVertexDecl;
            } else {
                this.renderBuffer.vertexBuffer.vertexDeclaration = VFXGeometry.ParticleDecl;
                this.renderBuffer.vertexBuffer.instanceBuffer = true;
            }

            // 初始化IndirectBuffer
            const indirectUsage = EDeviceBufferUsage.INDIRECT |
                EDeviceBufferUsage.STORAGE |
                EDeviceBufferUsage.COPY_DST;
            this.indirectBuffer = new DeviceBuffer(20, indirectUsage);
        }

        this.initSourceAttributes();

        if (!isNoOutput) {
            // 创建独立的 geometry（注册到 renderer 由 VisualEffect.onAwake 统一执行）
            // 包在 try-catch 中，确保 geometry 创建失败不会阻断后续的 Bounds 和 GPU Event 初始化
            try {
                if (isStrip) {
                    console.log(`[VFX] Creating StripGeometry: capacity=${capacity}, stripCap=${this.stripCapacity}, perStrip=${this.particlePerStripCount}, blend=${this.blendMode}`);
                    const stripParams = new VFXStripGeometryParams();
                    stripParams.capacity = capacity;
                    stripParams.stripVertexBuffer = this.renderBuffer;
                    stripParams.indirectBuffer = this.indirectBuffer;
                    stripParams.stripCapacity = this.stripCapacity;
                    stripParams.particlePerStripCount = this.particlePerStripCount;
                    this.geometry = new VFXStripGeometry(stripParams);
                    (this.geometry as any).blendMode = this.blendMode;
                    (this.geometry as any).outputType = this.outputType;
                    (this.geometry as any).customShaderName = this.customShaderName;
                    (this.geometry as any).mainTexture = this.mainTexture;
                    (this.geometry as any).stripColorMapping = this.stripColorMapping;
                    (this.geometry as any).stripUvScale = this.stripUvScale;
                    (this.geometry as any).stripUvBias = this.stripUvBias;
                    (this.geometry as any).stripGradientStops = this.stripGradientStops;
                    (this.geometry as any).stripTilingMode = this.stripTilingMode;
                    (this.geometry as any).stripPpsc = this.particlePerStripCount;
                    console.log(`[VFX] StripGeometry created:`, this.geometry ? "OK" : "FAILED");
                } else if (isPoint) {
                    const pointParams = new VFXPointGeometryParams();
                    pointParams.capacity = capacity;
                    pointParams.renderBuffer = this.renderBuffer;
                    pointParams.indirectBuffer = this.indirectBuffer;
                    this.geometry = new VFXPointGeometry(pointParams);
                    (this.geometry as any).blendMode = this.blendMode;
                    (this.geometry as any).outputType = this.outputType;
                } else if (isLineStrip) {
                    const lsParams = new VFXLineStripGeometryParams();
                    lsParams.capacity = capacity;
                    lsParams.renderBuffer = this.renderBuffer;
                    lsParams.indirectBuffer = this.indirectBuffer;
                    this.geometry = new VFXLineStripGeometry(lsParams);
                    (this.geometry as any).blendMode = this.blendMode;
                    (this.geometry as any).outputType = this.outputType;
                } else if (isLine) {
                    const lineParams = new VFXLineGeometryParams();
                    lineParams.capacity = capacity;
                    lineParams.renderBuffer = this.renderBuffer;
                    lineParams.indirectBuffer = this.indirectBuffer;
                    this.geometry = new VFXLineGeometry(lineParams);
                    (this.geometry as any).blendMode = this.blendMode;
                    (this.geometry as any).outputType = this.outputType;
                } else if (isBillboardProc) {
                    // 对齐 Unity VFXPlanarPrimitiveOutput：DrawArrayIndirect + gl_VertexID 生成顶点
                    const bbParams = new VFXBillboardGeometryParams();
                    bbParams.capacity = capacity;
                    bbParams.vertexCount = this.billboardVertexCount;
                    bbParams.particleBuffer = this.renderBuffer.vertexBuffer;
                    bbParams.particleDeviceBuffer = this.renderBuffer;
                    bbParams.indirectBuffer = this.indirectBuffer;
                    this.geometry = new VFXBillboardGeometry(bbParams);
                    (this.geometry as any).blendMode = this.blendMode;
                    (this.geometry as any).outputType = this.outputType;
                    (this.geometry as any).softParticleFade = this.softParticleFade;
                    (this.geometry as any).uvMode = this.uvMode;
                    (this.geometry as any).flipbookSize = this.flipbookSize;
                    (this.geometry as any).mainTexture = this.mainTexture;
                    (this.geometry as any).subpixelAA = this.subpixelAA;
                    (this.geometry as any).customShaderName = this.customShaderName;
                    (this.geometry as any).primitive = this.billboardPrimitive;
                    (this.geometry as any).cropFactor = this.billboardCropFactor;
                    (this.geometry as any).useAlphaClipping = this.useAlphaClipping;
                    (this.geometry as any).alphaThreshold = this.alphaThreshold;
                    // Distortion 专属：mode（Procedural / NormalMap）
                    if (this.outputType === "outputDistortion") {
                        (this.geometry as any).distortionMode = this.distortionMode;
                    }
                } else {
                    const geometryParams = new VFXGeometryParams();
                    geometryParams.particleBuffer = this.renderBuffer.vertexBuffer;
                    geometryParams.particleDeviceBuffer = this.renderBuffer;
                    geometryParams.indirectBuffer = this.indirectBuffer;
                    geometryParams.capacity = capacity;
                    geometryParams.mesh = this.mesh;
                    this.geometry = new VFXGeometry(geometryParams);
                    (this.geometry as any).blendMode = this.blendMode;
                    (this.geometry as any).outputType = this.outputType;
                    (this.geometry as any).softParticleFade = this.softParticleFade;
                    (this.geometry as any).uvMode = this.uvMode;
                    (this.geometry as any).flipbookSize = this.flipbookSize;
                    (this.geometry as any).subpixelAA = this.subpixelAA;
                    (this.geometry as any).customShaderName = this.customShaderName;
                }
            } catch (e) {
                console.warn("VFXParticleSystem: geometry creation failed, compute pipeline will still run.", e);
            }
        }

        // 初始化包围盒
        // 始终创建 BoundsBuffer（Output shader 声明了 BoundsBuffer binding，即使 Manual 模式也需要）
        {
            // Automatic 模式：创建 GPU bounds 缓冲用于每帧计算和回读
            const boundsUsage = EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_SRC | EDeviceBufferUsage.COPY_DST;
            this.boundsBuffer = new DeviceBuffer(24, boundsUsage);

            const stagingUsage = EDeviceBufferUsage.MAP_READ | EDeviceBufferUsage.COPY_DST;
            this.boundsStagingBuffer = new DeviceBuffer(24, stagingUsage);

            // 重置数据：minXYZ = INT_MAX, maxXYZ = INT_MIN
            this.boundsResetData = new Int32Array([
                0x7FFFFFFF, 0x7FFFFFFF, 0x7FFFFFFF,
                -0x80000000, -0x80000000, -0x80000000
            ]);
            this.boundsBuffer.deviceBuffer.setData(this.boundsResetData.buffer, 0, 0, 24);

            this.boundsReadbackDest = new ArrayBuffer(24);
            this.boundsDataView = new DataView(new ArrayBuffer(4));
        }

        // Manual 模式：设置静态包围盒
        if (this.boundsMode === VFXBoundsMode.Manual && this.geometry) {
            const c = this.boundsCenter;
            const e = this.boundsExtents;
            this.geometry.bounds.setMin(new Vector3(c.x - e.x, c.y - e.y, c.z - e.z));
            this.geometry.bounds.setMax(new Vector3(c.x + e.x, c.y + e.y, c.z + e.z));
        }

        this.spawnedCount = 0;
        this._cumulativeSpawnTotal = 0;

        // GPU 事件初始化：解析源系统引用
        if (this.receiveGPUEvent && this.gpuEventInput) {
            const sourceIndex = this.gpuEventInput.sourceSystem;
            const sourceSystem = this.effect.systems[sourceIndex] as VFXParticleSystem;
            this.gpuEventSourceSystem = sourceSystem;
            this.gpuEventType = this.gpuEventInput.eventType;

            // 统一初始化：所有事件类型共享相同的资源创建流程
            // EventIndexBuffer: 接收系统独立持有，大小由接收系统 capacity 决定
            // AccumulatorBuffer: 所有事件类型通用的逐粒子累加器
            this.gpuEventBufferIndex = sourceSystem.addEventIndexBuffer(this.capacity);
            sourceSystem.gpuEventReceiverCount++;
            sourceSystem.ensureAccumulatorBuffer();

            // 创建 DispatchIndirect 参数缓冲 (12 bytes: x, y, z)
            const dispatchUsage = EDeviceBufferUsage.INDIRECT |
                EDeviceBufferUsage.STORAGE |
                EDeviceBufferUsage.COPY_DST;
            this.gpuEventDispatchBuffer = new DeviceBuffer(12, dispatchUsage);
            const initDispatch = new Uint32Array([0, 1, 1]);
            this.gpuEventDispatchBuffer.deviceBuffer.setData(initDispatch.buffer, 0, 0, 12);
        }

        // Output Event 资源（buffer + staging + accumulator）
        this.setupOutputEventBuffers();
    }

    /**
     * 运行时更换 mesh 输出的 mesh（VFX 组件级 Mesh 属性 override）。
     * 仅对 mesh 输出（geometry 为 VFXGeometry）生效；strip/point/line/billboard 无 setMesh 自动跳过。
     */
    setMesh(mesh: Mesh): void {
        if (!mesh) return;
        const geo: any = this.geometry;
        // 仅 mesh 输出（geometry 是 VFXGeometry，有 setMesh）才换；billboard/strip/point/line 无 setMesh → 跳过
        if (geo && typeof geo.setMesh === "function") {
            this.mesh = mesh;
            geo.setMesh(mesh);
        }
    }

    receiveInitializeEvent(attr: VFXEventAttribute): void {
        let spawnCount = Math.floor(attr.getFloat("spawnCount"));
        if (spawnCount <= 0) {
            return;
        }

        if (this.eventCount >= this.maxEventsPerFrame) {
            // 扩充事件容量
            this.releaseSourceAttributes();

            const oldSourceStaging = this.sourceAttributeStaging;
            const oldPrefixSumStaging = this.prefixSumStaging;
            const oldSpawnCounts = this.spawnCountsPerEvent;

            this.maxEventsPerFrame *= 2;
            this.initSourceAttributes();

            // 拷贝旧数据
            this.sourceAttributeStaging.set(oldSourceStaging);
            this.prefixSumStaging.set(oldPrefixSumStaging);
            this.spawnCountsPerEvent.set(oldSpawnCounts);
        }

        this.spawnCountsPerEvent[this.eventCount] = spawnCount;

        // 直接 memcpy 事件数据区域（std430 对齐，与 GPU SourceEventData 布局一致）
        const desc = attr.desc;
        const dstByteOffset = desc.eventDataOffset + this.eventCount * desc.eventDataStride;
        const src = new Uint8Array(attr.buffer, attr.view.byteOffset + desc.eventDataOffset, desc.eventDataStride);
        new Uint8Array(this.sourceAttributeStaging.buffer).set(src, dstByteOffset);

        this.spawnedCount += spawnCount;
        this.eventCount++;
    }

    // ===== 分阶段执行方法 =====

    /**
     * 阶段1: Update — 更新现有粒子（物理、生命、死亡回收）
     * 源系统的 Update shader 同时写入 EventIndexBuffer
     */
    updatePhase(state: VFXState, cmd: ComputeCommandBuffer): void {
        if (state.deltaTime <= 0) return;
        if (!this.deadListBuffer || !this.aliveListBufferRead) return;

        // EventIndexBuffer.count 的重置由 UpdateWithEvent shader 内部处理
        // （线程0在 dispatch 开始时写入 count=0）
        // 不能使用 CPU 端 addClearBufferCommand / setData 清零，
        // 因为 Laya 的 buffer 写入时序会导致清零在 dispatch 之后执行

        const shaderData = this.updateDatas[0];

        shaderData.setDeviceBuffer(ID.DeadListBuffer, this.deadListBuffer.deviceBuffer);
        shaderData.setDeviceBuffer(ID.AliveListReadBuffer, this.aliveListBufferRead.deviceBuffer);
        shaderData.setDeviceBuffer(ID.AliveListWriteBuffer, this.aliveListBufferWrite.deviceBuffer);
        shaderData.setDeviceBuffer(ID.AttributeBuffer, this.attributeBuffer.deviceBuffer);

        // 通用模板在 Update shader 中也声明了 PrefixSum / SourceAttributes，
        // naga 可能不会优化掉，WebGPU 仍要求所有声明的 binding 有对应资源。
        shaderData.setDeviceBuffer(ID.SourceAttributeBuffer, this.sourceAttributeBuffer.deviceBuffer);
        shaderData.setDeviceBuffer(ID.PrefixSumBuffer, this.prefixSumBuffer.deviceBuffer);

        // Bind StripDataBuffer for ring buffer alive tracking (atomicMin in Update shader)
        if (this.useStripRingBuffer && this.stripDataBuffer) {
            shaderData.setDeviceBuffer(ID.StripDataBuffer, this.stripDataBuffer.deviceBuffer);
        }

        // 如果本系统是 GPU 事件源，绑定所有 EventIndexBuffer 到 Update shader
        if (this.eventIndexBuffers) {
            for (let i = 0; i < this.eventIndexBuffers.length; i++) {
                const eib = this.eventIndexBuffers[i];
                if (eib) shaderData.setDeviceBuffer(this.eventIndexBufferIDs[i], eib.deviceBuffer);
            }
            // 向后兼容：单事件源 shader 使用 "EventIndexBuffer" 名称
            if (this.eventIndexBuffers.length > 0 && this.eventIndexBuffers[0]) {
                shaderData.setDeviceBuffer(ID.EventIndexBuffer, this.eventIndexBuffers[0].deviceBuffer);
            }
        }

        // 绑定 GPU 事件累加器缓冲（所有事件类型通用）
        if (this.gpuEventAccumulatorBuffer) {
            shaderData.setDeviceBuffer(ID.AccumulatorBuffer, this.gpuEventAccumulatorBuffer.deviceBuffer);
        }

        // 绑定 Output Event buffers（update shader 写入）
        for (let i = 0; i < this.outputEventBuffers.length; i++) {
            const buf = this.outputEventBuffers[i];
            if (buf) shaderData.setDeviceBuffer(this.outputEventBufferIDs[i], buf.deviceBuffer);
        }
        if (this.outputEventAccumulatorBuffer) {
            shaderData.setDeviceBuffer(this.outputEventAccumulatorBufferID, this.outputEventAccumulatorBuffer.deviceBuffer);
        }

        // 清空写缓冲的count
        cmd.addClearBufferCommand(this.aliveListBufferWrite.deviceBuffer, 0, 4);

        // 使用capacity作为上限
        this.dispatch.x = Math.ceil(this.capacity / 64);
        DispatchCommand(cmd, this.updateShader, this.updateDatas, this.dispatch);

        // 交换缓冲
        this.swapAliveListBuffers();
    }

    /**
     * 阶段2: Initialize — CPU 或 GPU 事件驱动的粒子生成
     */
    initializePhase(state: VFXState, cmd: ComputeCommandBuffer): void {
        if (!this.deadListBuffer || !this.aliveListBufferRead) return;
        if (this.receiveGPUEvent) {
            this.initializeFromGPUEvent(cmd);
        } else {
            this.initializeFromCPUEvent(cmd);
        }

        // 清理 CPU 事件数据
        this.spawnedCount = 0;
        this.eventCount = 0;
    }

    /**
     * 阶段3: Output — 压缩输出到 RenderBuffer
     */
    private _outputLogOnce = false;
    outputPhase(state: VFXState, cmd: ComputeCommandBuffer): void {
        if (!this._outputLogOnce && this.isStripOutput) {
            this._outputLogOnce = true;
            console.log(`[VFX OutputPhase] type=${this.outputType}, hasShader=${!!this.outputShader}, hasAlive=${!!this.aliveListBufferRead}, hasRender=${!!this.renderBuffer}, hasIndirect=${!!this.indirectBuffer}, isStrip=${this.isStripOutput}, geometry=${this.geometry?.constructor?.name}`);
        }
        if (this.outputType === "none" || !this.outputShader) return;
        if (!this.aliveListBufferRead || !this.renderBuffer || !this.indirectBuffer) return;

        const shaderData = this.outputDatas[0];

        shaderData.setDeviceBuffer(ID.AliveListReadBuffer, this.aliveListBufferRead.deviceBuffer);
        shaderData.setDeviceBuffer(ID.AttributeBuffer, this.attributeBuffer.deviceBuffer);

        // Strip 和 Mesh 都复用 RenderBuffer + IndirectBuffer
        shaderData.setDeviceBuffer(ID.RenderBuffer, this.renderBuffer.deviceBuffer);
        shaderData.setDeviceBuffer(ID.IndirectBuffer, this.indirectBuffer.deviceBuffer);

        // 通用模板在 Output shader 中也声明了 DeadList / AliveListWrite / PrefixSum / SourceAttributes，
        // 即便 Output 阶段不使用它们，naga 可能不会优化掉，WebGPU 仍要求所有声明的 binding 有对应资源。
        shaderData.setDeviceBuffer(ID.DeadListBuffer, this.deadListBuffer.deviceBuffer);
        shaderData.setDeviceBuffer(ID.AliveListWriteBuffer, this.aliveListBufferWrite.deviceBuffer);
        shaderData.setDeviceBuffer(ID.SourceAttributeBuffer, this.sourceAttributeBuffer.deviceBuffer);
        shaderData.setDeviceBuffer(ID.PrefixSumBuffer, this.prefixSumBuffer.deviceBuffer);

        if (this.boundsBuffer) {
            shaderData.setDeviceBuffer(ID.BoundsBuffer, this.boundsBuffer.deviceBuffer);
        }

        // Bind StripDataBuffer for strip output
        if (this.isStripOutput && this.stripDataBuffer) {
            shaderData.setDeviceBuffer(ID.StripDataBuffer, this.stripDataBuffer.deviceBuffer);
        }

        if (this.isStripOutput) {
            // Strip: clear indexCount (offset 0)
            cmd.addClearBufferCommand(this.indirectBuffer.deviceBuffer, 0, 4);
        } else {
            // Mesh instancing: clear instanceCount (offset 4)
            cmd.addClearBufferCommand(this.indirectBuffer.deviceBuffer, 4, 4);
        }

        if (this.isStripOutput && this.useStripRingBuffer) {
            // Ring buffer: one workgroup per strip
            this.dispatch.x = this.stripCapacity;
        } else if (this.isStripOutput) {
            // Legacy sort-based: single workgroup
            this.dispatch.x = 1;
        } else {
            this.dispatch.x = Math.ceil(this.capacity / 64);
        }
        DispatchCommand(cmd, this.outputShader, this.outputDatas, this.dispatch);

        // Multi-Output: 为每个额外 output 也执行 dispatch
        for (const extra of this.extraOutputs) {
            if (!extra.outputShader || !extra.outputDatas) continue;
            const extraIsStrip = extra.outputType === "outputTrail" || extra.outputType === "outputParticleStripSGQuad";
            // 清 indirect buffer
            cmd.addClearBufferCommand(extra.indirectBuffer.deviceBuffer, 4, 4);
            // 绑定共享的粒子数据到 extra output shader。
            // 必须跟主 output 一致地绑全 7 类 buffer（即便 Output 阶段不使用它们，naga 不一定优化掉，
            // WebGPU 严格 validate 所有声明的 binding 必须有对应资源，否则整个 dispatch fail → indirect.instanceCount 不写）。
            const esd = extra.outputDatas[0];
            esd.setDeviceBuffer(ID.AliveListReadBuffer, this.aliveListBufferRead.deviceBuffer);
            esd.setDeviceBuffer(ID.AttributeBuffer, this.attributeBuffer.deviceBuffer);
            esd.setDeviceBuffer(ID.RenderBuffer, extra.renderBuffer.deviceBuffer);
            esd.setDeviceBuffer(ID.IndirectBuffer, extra.indirectBuffer.deviceBuffer);
            if (this.boundsBuffer) {
                esd.setDeviceBuffer(ID.BoundsBuffer, this.boundsBuffer.deviceBuffer);
            }
            esd.setDeviceBuffer(ID.DeadListBuffer, this.deadListBuffer.deviceBuffer);
            esd.setDeviceBuffer(ID.AliveListWriteBuffer, this.aliveListBufferWrite.deviceBuffer);
            esd.setDeviceBuffer(ID.SourceAttributeBuffer, this.sourceAttributeBuffer.deviceBuffer);
            esd.setDeviceBuffer(ID.PrefixSumBuffer, this.prefixSumBuffer.deviceBuffer);
            // Strip extra output 需要 StripDataBuffer 读 ring buffer first/next index
            if (extraIsStrip && this.stripDataBuffer) {
                esd.setDeviceBuffer(ID.StripDataBuffer, this.stripDataBuffer.deviceBuffer);
            }
            // Strip 用 stripCapacity 个 workgroups（一个 strip 一个），Mesh/Billboard 用 ceil(capacity/64)
            this.dispatch.x = extraIsStrip ? this.stripCapacity : Math.ceil(this.capacity / 64);
            DispatchCommand(cmd, extra.outputShader, extra.outputDatas, this.dispatch);
        }

    }

    /**
     * UpdateStrips phase: advance ring buffer pointers after Update
     */
    updateStripsPhase(cmd: ComputeCommandBuffer): void {
        if (!this.updateStripsShader || !this.stripDataBuffer || !this.updateStripsDatas) return;

        const shaderData = this.updateStripsDatas[0];
        shaderData.setDeviceBuffer(ID.StripDataBuffer, this.stripDataBuffer.deviceBuffer);
        shaderData.setInt(ID.u_StripCapacity, this.stripCapacity);
        shaderData.setInt(ID.u_ParticlePerStrip, this.particlePerStripCount);

        this.dispatch.x = Math.ceil(this.stripCapacity / 64);
        DispatchCommand(cmd, this.updateStripsShader, this.updateStripsDatas, this.dispatch);
    }

    // ===== Initialize 实现 =====

    private initializeFromCPUEvent(cmd: ComputeCommandBuffer): void {
        // 收集spawn数量
        for (let index of this.spawnerSystems) {
            let spawner = this.effect.systems[index] as VFXSpawnerSystem;
            this.receiveInitializeEvent(spawner.spawnerState.eventAttribute);
        }

        if (this.spawnedCount <= 0) {
            return;
        }
        // 构建前缀和
        this.prefixSumStaging[0] = 0;
        for (let i = 0; i < this.eventCount; i++) {
            this.prefixSumStaging[i + 1] = this.prefixSumStaging[i] + this.spawnCountsPerEvent[i];
        }

        // 上传到 GPU（desc 驱动的 header + 事件数据）
        const desc = this.effect.asset.eventAttributeDesc;
        const uploadSize = desc.eventDataOffset + this.eventCount * desc.eventDataStride;
        this.sourceAttributeBuffer.deviceBuffer.setData(
            this.sourceAttributeStaging.buffer, 0, 0, uploadSize
        );
        this.prefixSumBuffer.deviceBuffer.setData(
            this.prefixSumStaging.buffer, 0, 0, (this.eventCount + 1) * 4
        );

        const shaderData = this.initializeDatas[0];

        shaderData.setDeviceBuffer(ID.DeadListBuffer, this.deadListBuffer.deviceBuffer);
        // 绑定 Read 缓冲为写目标，新粒子直接追加到现有存活列表
        shaderData.setDeviceBuffer(ID.AliveListWriteBuffer, this.aliveListBufferRead.deviceBuffer);
        shaderData.setDeviceBuffer(ID.AttributeBuffer, this.attributeBuffer.deviceBuffer);
        shaderData.setDeviceBuffer(ID.SourceAttributeBuffer, this.sourceAttributeBuffer.deviceBuffer);
        shaderData.setDeviceBuffer(ID.PrefixSumBuffer, this.prefixSumBuffer.deviceBuffer);
        const sc = Math.floor(this.spawnedCount);
        shaderData.setInt(ID.u_TotalSpawnedCount, this._cumulativeSpawnTotal);
        shaderData.setInt(ID.u_SpawnedCount, sc);
        shaderData.setInt(ID.u_EventCount, this.eventCount);
        // 传递 LoopIndex + SpawnState 全套（Unity SpawnState.cs 对齐）
        if (this.spawnerSystems.length > 0) {
            const spawner = this.effect.systems[this.spawnerSystems[0]] as VFXSpawnerSystem;
            if (spawner) {
                const ss = spawner.spawnerState;
                shaderData.setInt(ID.u_LoopIndex, ss.loopIndex);
                shaderData.setInt(ID.u_NewLoop, ss.newLoop ? 1 : 0);
                shaderData.setInt(ID.u_LoopState, ss.loopState);
                shaderData.setNumber(ID.u_SpawnCount, ss.spawnCount);
                shaderData.setNumber(ID.u_SpawnDeltaTime, ss.deltaTime);
                shaderData.setNumber(ID.u_SpawnTotalTime, ss.totalTime);
                shaderData.setNumber(ID.u_LoopDuration, ss.settings.loopDuration);
                shaderData.setInt(ID.u_LoopCount, ss.settings.loopCount);
                shaderData.setNumber(ID.u_DelayBeforeLoop, ss.settings.delayBeforeLoop);
                shaderData.setNumber(ID.u_DelayAfterLoop, ss.settings.delayAfterLoop);
            }
        }

        // Bind StripDataBuffer for ring buffer allocation (CPU-spawned trail)
        if (this.useStripRingBuffer && this.stripDataBuffer) {
            shaderData.setDeviceBuffer(ID.StripDataBuffer, this.stripDataBuffer.deviceBuffer);
        }

        // 绑定 GPU 事件累加器缓冲（所有事件类型通用）（Initialize 需要清零新粒子的累加器）
        if (this.gpuEventAccumulatorBuffer) {
            shaderData.setDeviceBuffer(ID.AccumulatorBuffer, this.gpuEventAccumulatorBuffer.deviceBuffer);
        }

        this.dispatch.x = Math.ceil(this.spawnedCount / 64);
        DispatchCommand(cmd, this.initializeShader, this.initializeDatas, this.dispatch);
        this._cumulativeSpawnTotal += sc;
    }

    private initializeFromGPUEvent(cmd: ComputeCommandBuffer): void {
        if (!this.gpuEventSourceSystem) {
            return;
        }

        const source = this.gpuEventSourceSystem;

        if (this.capacity <= 0) return;

        // ① PrepareDispatch: GPU 端根据 GPUEvent.count 计算实际 dispatch 参数
        {
            const sd = this.prepareDispatchDatas[0];
            sd.setDeviceBuffer(ID.EventIndexBuffer, source.eventIndexBuffers[this.gpuEventBufferIndex].deviceBuffer);
            sd.setDeviceBuffer(ID.GPUEventDispatchBuffer, this.gpuEventDispatchBuffer.deviceBuffer);

            this.dispatch.x = 1;
            DispatchCommand(cmd, this.prepareDispatchShader, this.prepareDispatchDatas, this.dispatch);
        }

        // 屏障：确保 GPUEventDispatchBuffer 写入完成后再作为 indirect 参数使用
        cmd.executeCMDs();
        cmd.clearCMDs();

        // ② GPUInitialize: 使用 DispatchIndirect，只 dispatch 实际需要的 workgroup 数量
        {
            const shaderData = this.initializeDatas[0];

            // 绑定 receiver 自己的 buffer
            shaderData.setDeviceBuffer(ID.DeadListBuffer, this.deadListBuffer.deviceBuffer);
            // 新粒子追加到 AliveListRead（与 CPU Initialize 一致）
            shaderData.setDeviceBuffer(ID.AliveListWriteBuffer, this.aliveListBufferRead.deviceBuffer);
            shaderData.setDeviceBuffer(ID.AttributeBuffer, this.attributeBuffer.deviceBuffer);

            // 绑定源系统的 EventIndexBuffer（只读，按接收者索引）
            shaderData.setDeviceBuffer(ID.EventIndexBuffer, source.eventIndexBuffers[this.gpuEventBufferIndex].deviceBuffer);
            // 绑定源系统的 AttributeBuffer 为 SourceParticleBuffer（只读）
            shaderData.setDeviceBuffer(ID.SourceParticleBuffer, source.attributeBuffer.deviceBuffer);

            // 传递源系统的模拟空间类型（用于跨空间坐标变换）
            shaderData.setInt(ID.u_SourceSimulateSpace, source.simulateSpace);

            // Bind StripDataBuffer for ring buffer allocation
            if (this.useStripRingBuffer && this.stripDataBuffer) {
                shaderData.setDeviceBuffer(ID.StripDataBuffer, this.stripDataBuffer.deviceBuffer);
            }

            // GPU Event 接收端也需要绑定 AccumulatorBuffer（链式事件场景下清零新粒子的累加器）
            if (this.gpuEventAccumulatorBuffer) {
                shaderData.setDeviceBuffer(ID.AccumulatorBuffer, this.gpuEventAccumulatorBuffer.deviceBuffer);
            }

            cmd.addDispatchIndirectCommand(
                this.initializeShader,
                shaderData.getDefineData(),
                this.initializeDatas,
                this.gpuEventDispatchBuffer.deviceBuffer,
                0
            );
        }
    }

    // ===== 兼容旧接口 =====

    update(state: VFXState, cmd: ComputeCommandBuffer): void {
        // 分阶段执行由 VisualEffect.updateVFX() 调用
    }

    private swapAliveListBuffers(): void {
        [this.aliveListBufferRead, this.aliveListBufferWrite] =
            [this.aliveListBufferWrite, this.aliveListBufferRead];
    }

    // ===== 包围盒 GPU 计算 + 异步回读 =====

    /**
     * 重置 BoundsBuffer 为 INT_MAX/INT_MIN（在 Output dispatch 之前调用）
     */
    resetBoundsBuffer(): void {
        if (this.boundsMode === VFXBoundsMode.Manual) return;
        if (!this.boundsBuffer) return;
        this.boundsBuffer.deviceBuffer.setData(this.boundsResetData.buffer, 0, 0, 24);
    }

    /**
     * 将 BoundsBuffer 拷贝到 StagingBuffer（在 Output dispatch 之后、同批次提交）
     * 当 staging buffer 正在被映射读取时跳过
     */
    copyBoundsToStaging(cmd: ComputeCommandBuffer): void {
        if (this.boundsMode === VFXBoundsMode.Manual) return;
        if (!this.boundsBuffer || !this.boundsStagingBuffer) return;
        if (this.boundsReadbackPending) return;
        cmd.addBufferToBufferCommand(
            this.boundsBuffer.deviceBuffer,
            this.boundsStagingBuffer.deviceBuffer,
            0, 0, 24
        );
    }

    /**
     * 发起异步回读（在 executeCMDs 之后调用）
     */
    requestBoundsReadback(): void {
        if (this.boundsMode === VFXBoundsMode.Manual) return;
        if (!this.boundsStagingBuffer) return;
        if (this.boundsReadbackPending || this._released) return;
        this.boundsReadbackPending = true;

        this.boundsStagingBuffer.deviceBuffer.readData(this.boundsReadbackDest, 0, 0, 24).then(() => {
            this.boundsReadbackPending = false;
            if (this._released) return;
            this.updateBoundsFromReadback();
        });
    }

    private updateBoundsFromReadback(): void {
        if (!this.geometry) return;

        const data = new Int32Array(this.boundsReadbackDest);

        // 检查是否为重置值（无活跃粒子）
        if (data[0] === 0x7FFFFFFF) return;

        const minX = this.sortableIntToFloat(data[0]);
        const minY = this.sortableIntToFloat(data[1]);
        const minZ = this.sortableIntToFloat(data[2]);
        const maxX = this.sortableIntToFloat(data[3]);
        const maxY = this.sortableIntToFloat(data[4]);
        const maxZ = this.sortableIntToFloat(data[5]);

        const bounds = this.geometry.bounds;
        bounds.setMin(new Vector3(minX, minY, minZ));
        bounds.setMax(new Vector3(maxX, maxY, maxZ));
    }

    private sortableIntToFloat(si: number): number {
        const i = (si >= 0) ? si : (si ^ 0x7FFFFFFF);
        this.boundsDataView.setInt32(0, i, true);
        return this.boundsDataView.getFloat32(0, true);
    }

    release(): void {
        this._released = true;

        // 从 renderer 移除并销毁 geometry
        if (this.geometry) {
            this.effect.renderer?.removeGeometry(this.geometry);
            this.geometry.destroy();
            this.geometry = null;
        }

        this.deadListBuffer.destroy();
        this.aliveListBufferRead.destroy();
        this.aliveListBufferWrite.destroy();
        this.attributeBuffer.destroy();
        if (this.renderBuffer) this.renderBuffer.destroy();
        if (this.indirectBuffer) this.indirectBuffer.destroy();

        if (this.boundsBuffer) {
            this.boundsBuffer.destroy();
        }
        if (this.boundsStagingBuffer) {
            this.boundsStagingBuffer.destroy();
        }

        this.boundsReadbackDest = null;
        this.boundsDataView = null;
        this.boundsResetData = null;

        this.releaseSourceAttributes();

        this.sourceAttributeStaging = null;
        this.prefixSumStaging = null;
        this.spawnCountsPerEvent = null;

        this.initializeDatas.forEach(sd => sd.destroy());
        this.initializeDatas = null;
        this.updateDatas.forEach(sd => sd.destroy());
        this.updateDatas = null;
        this.outputDatas.forEach(sd => sd.destroy());
        this.outputDatas = null;
        this.prepareDispatchDatas.forEach(sd => sd.destroy());
        this.prepareDispatchDatas = null;

        // GPU 事件资源
        for (const buffer of this.eventIndexBuffers) {
            buffer.destroy();
        }
        this.eventIndexBuffers = [];

        if (this.gpuEventAccumulatorBuffer) {
            this.gpuEventAccumulatorBuffer.destroy();
            this.gpuEventAccumulatorBuffer = null;
        }
        if (this.gpuEventDispatchBuffer) {
            this.gpuEventDispatchBuffer.destroy();
            this.gpuEventDispatchBuffer = null;
        }
        this.gpuEventSourceSystem = null;

        // Output Event 资源
        for (const b of this.outputEventBuffers) b.destroy();
        for (const b of this.outputEventStagingBuffers) b.destroy();
        this.outputEventBuffers = [];
        this.outputEventStagingBuffers = [];
        this.outputEventReadbackDest = [];
        this.outputEventReadbackPending = [];
        if (this.outputEventAccumulatorBuffer) {
            this.outputEventAccumulatorBuffer.destroy();
            this.outputEventAccumulatorBuffer = null;
        }
    }

}

function DispatchCommand(cmd: ComputeCommandBuffer, shader: ComputeShader, shaderDatas: ShaderData[], dispatch: Vector3) {
    cmd.addDispatchCommand(shader, shaderDatas[0].getDefineData(), shaderDatas, dispatch);
}
