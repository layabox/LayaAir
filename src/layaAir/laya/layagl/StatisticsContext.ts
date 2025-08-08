import { Browser } from "../utils/Browser";


export enum StatisticsElement {
    //----------------------------module time Start------------------
    /**
     * fps
     */
    T_FPS_Frame,
    /**
     * frame time
     */
    T_FPS_Time,
    /**
     * render 3D time
     */
    T_AllRender3D,
    /**
     * render 3D Depth Normal/Depth time
     */
    T_DepthPass,
    /**
     * render shadow pass time
     */
    T_ShadowPass,
    /**
     * main render pass time
     */
    T_3DMainPass,
    /**
     * main render opaque time
     */
    T_3DMainPass_Opaque,
    /**
     * main render trans time
     */
    T_3DMainPass_Trans,
    /**
     * Batch 3D module Time
     */
    T_3DBatchTime,
    /**
     * 3D main cull time
     */
    T_CullMain,
    /**
     * 3D shadow cull time
     */
    T_CullShadow,
    /**
     * render postprocess time
     */
    T_Render_PostProcess,
    /**
     * render 2D time
     */
    T_AllRender2D,
    /**
     * render 2D Pass Time
     */
    T_2DPass,
    /**
     * component update time
     */
    T_ScriptUpdateTime,
    /**
     * component Late update time
     */
    T_ScriptLateUpdateTime,
    //----------------------------module time Start------------------
    //----------------------------Draw Call Start------------------
    //Draw Call
    /**
     * 非透明物体DrawCall
     */
    CT_OpaqueDrawCall,
    /**
     * 透明物体的DrawCall
     */
    CT_TransDrawCall,
    /**
     * 深度图/法线深度图的DrawCall
     */
    CT_DepthCastDrawCall,
    /**
     * 阴影DrawCall
     */
    CT_ShadowDrawCall,
    /**
     * 2DDrawCall
     */
    CT_2DDrawCall,
    /**
     * 3DDrawCall
     */
    CT_3DDrawCall,
    /**
     * drawCall
     */
    CT_DrawCall,
    CT_IndirectDrawCall,
    /**
     * instance Draw Call
     */
    CT_Instancing_DrawCallCount,
    //----------------------------Draw Call End------------------
    //----------------------------GPU Buffer Resource/MemoryData Start-----------------
    M_GPUBuffer,
    C_GPUBuffer,
    M_VertexBuffer,
    C_VertexBuffer,
    M_IndexBuffer,
    C_IndexBuffer,
    M_UBOBuffer,
    C_UBOBuffer,
    M_DeviceBuffer,
    C_DeviceBuffer,
    //----------------------------GPU Buffer Resource/MemoryData End-----------------
    //----------------------------GPU Texture Resource/MemoryData Start-----------------
    M_ALLTexture,
    C_ALLTexture,
    M_Texture2D,
    C_Texture2D,
    M_TextureCube,
    C_TextureCube,
    M_Texture3D,
    C_Texture3D,
    M_Texture2DArray,
    C_Texture2DArray,
    M_RenderTexture,
    C_RenderTexture,
    //----------------------------GPU Texture Resource/MemoryData End-----------------
    //----------------------------GPU other Data Start--------------------------
    M_GPUMemory,
    CT_ShaderChange,
    CT_Triangle,
    CT_BufferUploadCount,
    CT_GeometryBufferUploadCount,
    CT_UBOBufferUploadCount,
    CT_UBOBufferUploadMemory,
    //----------------------------GPU other Data End--------------------------


    //----------------------------Other Game Count/Time Start--------------------

    C_Sprite2DCount,
    C_Sprite3DCount,
    C_BaseRenderCount,
    C_MeshRenderCount,
    C_SkinnedMeshRenderCount,
    C_ShurikenParticleRenderCount,
    T_AnimatorUpdate,
    T_SkinBoneUpdate,
    T_ShurikenUpdate,
    //----------------------------Other Game Count end--------------------
    //----------------------------physics 2D Stat Start----------------------

    //----------------------------physics 2D Stat End----------------------
    //----------------------------physics 3D Stat Start----------------------
    T_Physics_Simulation,
    T_Physics_UpdateNode,
    T_PhysicsEvent,
    C_PhysicsEventCount,
    T_PhysicsCollider,
    T_PhysicsTrigger,
    T_PhysicsColliderEnter,
    T_PhysicsColliderExit,
    T_PhysicsColliderStay,
    T_PhysicsTriggerEnter,
    T_PhysicsTriggerExit,
    T_PhysicsTriggerStay,
    C_PhysicaDynamicRigidBody,
    C_PhysicaStaticRigidBody,
    C_PhysicaKinematicRigidBody,
    C_PhysicaCharacterController,
    C_PhysicsJoint,
    //----------------------------physics 3D Stat End----------------------
    //----------------------------Load Stat Start----------------------
    /**
     * 资源下载 + 解析时间。
     */
    T_LoadResourceTime,//Loader.LoaderStat_LoadResourceTime
    /**
     * 加载次数
     */
    C_LoadResourceCount,//Loader.LoaderStat_LoaderResourceCount
    /**
     * 请求次数
     */
    C_LoadRequestCount,//Loader.LoaderStat_LoadRequestCount
    /**
     *  网络下载时间
     */
    T_LoadRequestTime,
    //----------------------------Load End Start----------------------
    StatEnd,
}

export interface IStaticsContext {
    /**
     * 记录数据统计数据
     * @param element 
     * @param data 
     */
    recordCountData(element: StatisticsElement, data: number): void;
    /**
     * 帧数据 会累计输出平均值（比如drawCall）
     * @param element 
     * @param data 
     */
    recordCTData(element: StatisticsElement, data: number): void;
    /**
     * 记录时间统计数据
     * @param element
     * @param data
     */
    recordTimeData(element: StatisticsElement, data: number): void;
    /**
     * 记录内存统计数据
     */
    recordMemoryData(element: StatisticsElement, data: number): void;
    /**
     * 获取统计数据
     * @param element 
     * @returns 
     */
    getElementData(element: StatisticsElement): number;
    /**
     * 开始帧逻辑
     */
    startFrameLogic(): void;
    /**
     * 结束帧逻辑
     */
    endFrameLogic(): void;
    /**
     * 中途切换统计信息 将当前统计信息复制到另一个统计信息中
     * @param context 
     */
    cloneTo(context: IStaticsContext): void;
}

export class DefaultStaticsContext implements IStaticsContext {

    private _tQueue: Set<StatisticsElement> = new Set();
    private _ctQueue: Set<StatisticsElement> = new Set();
    private statArray: Float32Array;
    private _timeArray: Float32Array;//因为可能会计算时间的均值
    private _cacheCount: number = 0;
    private _cacheTime: number = 0;
    private _init() {
        //引擎默认的统计数据列表

    }
    constructor() {
        this.statArray = new Float32Array(StatisticsElement.StatEnd);
        this._timeArray = new Float32Array(StatisticsElement.StatEnd);
        for (let i = 0; i < StatisticsElement.StatEnd; i++) {
            const elementName = StatisticsElement[i];
            if (!elementName) continue;
            if (elementName.startsWith("T_")) {
                this._tQueue.add(i);
            }
            if (elementName.startsWith("CT_"))
                this._ctQueue.add(i);
        }
    }

    cloneTo(context: IStaticsContext): void {
        // 将所有以C_和M_开头的统计项设置到新的staticsContext
        for (let i = 0; i < StatisticsElement.StatEnd; i++) {
            const elementName = StatisticsElement[i];
            if (!elementName) continue;
            if (elementName.startsWith("C_")) {
                // 复制计数和内存相关的数据
                (context).recordCountData(i, this.statArray[i]);
            } else if (elementName.startsWith("M_")) {
                (context).recordMemoryData(i, this.statArray[i] * 1024 * 1024);
            }
        }
    }

    recordCountData(element: StatisticsElement, data: number): void {
        this.statArray[element] += data;
    }

    recordTimeData(element: StatisticsElement, data: number): void {
        this._timeArray[element] += data;
    }

    recordCTData(element: StatisticsElement, data: number): void {
        this._timeArray[element] += data;
    }

    recordMemoryData(element: StatisticsElement, data: number): void {
        this.statArray[element] += data / 1024 / 1024;
    }

    getElementData(element: StatisticsElement): number {
        return this.statArray[element];
    }



    startFrameLogic(): void {

    }

    endFrameLogic(): void {
        this._cacheCount++;
        let time = Browser.now();
        let deltytime = time - this._cacheTime;
        if (deltytime < 1000) return;

        let fps = Math.round(this._cacheCount * 1000) / (time - this._cacheTime);
      

        for (let element of this._tQueue) {
            this.statArray[element] = this._timeArray[element] / this._cacheCount / 1000;
            this._timeArray[element] = 0;
        }
        for (let element of this._ctQueue) {
            this.statArray[element] = this._timeArray[element] / this._cacheCount;
            this._timeArray[element] = 0;
        }
        this.statArray[StatisticsElement.T_FPS_Frame] =  Math.round(fps);
        this.statArray[StatisticsElement.T_FPS_Time] = fps > 0 ? Math.floor(1000 / fps) : 0;

        this._cacheTime = time;
        this._cacheCount = 0;
    }
}