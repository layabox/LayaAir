import { Viewport } from "../../layaAir/laya/maths/Viewport";
import { Vector4 } from "../../layaAir/laya/maths/Vector4";
import { RenderClearFlag } from "../../layaAir/laya/RenderEngine/RenderEnum/RenderClearFlag";
import { IRenderContext3D, PipelineMode } from "../../layaAir/laya/RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ICameraNodeData, ISceneNodeData } from "../../layaAir/laya/RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { ShaderData } from "../../layaAir/laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Camera } from "laya/d3/core/Camera";
import { Color } from "laya/maths/Color";

/**
 * Bridge3DContext封装了Bridge3D渲染所需的3D上下文配置
 *
 * @remarks
 * 这个类负责：
 * 1. 存储viewport、scissor等渲染参数
 * 2. 管理shader数据和模块数据
 * 3. 管理清除标志和清除参数
 * 4. 提供统一的接口来应用这些参数到3D渲染上下文
 */
export class Bridge3DContext {
    /**
     * 视口
     */
    private _viewport: Viewport;

    /**
     * 裁剪区域
     */
    private _scissor: Vector4;

    /**
     * 是否在渲染前清空深度缓冲
     */
    private _clearDepthBeforeRender: boolean = true;

    /**
     * 渲染管线模式
     */
    private _pipelineMode: PipelineMode = "Forward";

    /**
     * 是否翻转Y轴
     */
    private _invertY: boolean = false;

    /**
     * 清除深度值
     */
    private _clearDepth: number = 1.0;

    /**
     * 清除模板值
     */
    private _clearStencil: number = 0;

    /**
     * 场景模块数据
     */
    private _sceneModuleData: ISceneNodeData = null;

    /**
     * 相机模块数据
     */
    private _cameraModuleData: ICameraNodeData = null;

    /**
     * 场景shader数据
     */
    private _sceneData: ShaderData = null;

    /**
     * 相机shader数据
     */
    private _cameraData: ShaderData = null;

    /**
     * 全局shader数据
     */
    private _globalShaderData: ShaderData = null;


    private _color: Color = null;

    constructor() {
        this._viewport = new Viewport(0, 0, 0, 0);
        this._scissor = new Vector4(0, 0, 0, 0);
        this._color = new Color(1, 1, 1, 1);
    }

    /**
     * 设置场景模块数据
     */
    setSceneModuleData(data: ISceneNodeData): void {
        this._sceneModuleData = data;
    }

    /**
     * 设置相机模块数据
     */
    setCameraModuleData(data: ICameraNodeData): void {
        this._cameraModuleData = data;
    }

    /**
     * 设置场景shader数据
     */
    setSceneData(data: ShaderData): void {
        this._sceneData = data;
    }

    /**
     * 设置相机shader数据
     */
    setCameraData(data: ShaderData): void {
        this._cameraData = data;
    }

    /**
     * 设置全局shader数据
     */
    setGlobalShaderData(data: ShaderData): void {
        this._globalShaderData = data;
    }

    /**
     * 从相机模块数据更新viewport和scissor
     * @param camera 相机模块数据
     */
    updateFromCamera(camera: Camera): void {
        if (!camera) return;

        // 获取相机的viewport
        // camera.viewport会根据clientWidth/clientHeight和normalizedViewport计算
        const viewport = camera.viewport;

        // 更新viewport
        this._viewport.x = viewport.x;
        this._viewport.y = viewport.y;
        this._viewport.width = viewport.width;
        this._viewport.height = viewport.height;

        // 更新scissor（与viewport保持一致）
        this._scissor.setValue(viewport.x, viewport.y, viewport.width, viewport.height);
    }

    /**
     * 应用上下文参数到3D渲染上下文
     * @param context3d 3D渲染上下文
     * @remarks
     * 这个方法会设置：
     * 1. Shader数据和模块数据
     * 2. Viewport和scissor
     * 3. 清除参数
     * 4. Pipeline mode和invertY
     */
    applyToContext(context3d: IRenderContext3D): void {
        // 设置shader数据和模块数据
        context3d.sceneData = this._sceneData;
        context3d.cameraData = this._cameraData;
        context3d.sceneModuleData = this._sceneModuleData;
        context3d.cameraModuleData = this._cameraModuleData;
        context3d.globalShaderData = this._globalShaderData;

        // 设置viewport和scissor
        context3d.setViewPort(this._viewport);
        context3d.setScissor(this._scissor);

        // 设置清除参数
        const clearFlag = this._clearDepthBeforeRender ? RenderClearFlag.Depth : RenderClearFlag.Nothing;
        context3d.setClearData(clearFlag, this._color, this._clearDepth, this._clearStencil);

        // 设置pipeline mode
        context3d.pipelineMode = this._pipelineMode;

        // 设置invertY
        context3d.invertY = this._invertY;
    }

    /**
     * 是否在渲染前清空深度缓冲
     */
    get clearDepthBeforeRender(): boolean {
        return this._clearDepthBeforeRender;
    }

    set clearDepthBeforeRender(value: boolean) {
        this._clearDepthBeforeRender = value;
    }

    /**
     * 渲染管线模式
     */
    get pipelineMode(): PipelineMode {
        return this._pipelineMode;
    }

    set pipelineMode(value: PipelineMode) {
        this._pipelineMode = value;
    }

    /**
     * 是否翻转Y轴
     */
    get invertY(): boolean {
        return this._invertY;
    }

    set invertY(value: boolean) {
        this._invertY = value;
    }

    /**
     * 清除深度值
     */
    get clearDepth(): number {
        return this._clearDepth;
    }

    set clearDepth(value: number) {
        this._clearDepth = value;
    }

    /**
     * 清除模板值
     */
    get clearStencil(): number {
        return this._clearStencil;
    }

    set clearStencil(value: number) {
        this._clearStencil = value;
    }

    /**
     * 获取viewport（只读）
     */
    get viewport(): Viewport {
        return this._viewport;
    }

    /**
     * 获取scissor（只读）
     */
    get scissor(): Vector4 {
        return this._scissor;
    }

    /**
     * 获取场景模块数据（只读）
     */
    get sceneModuleData(): ISceneNodeData {
        return this._sceneModuleData;
    }

    /**
     * 获取相机模块数据（只读）
     */
    get cameraModuleData(): ICameraNodeData {
        return this._cameraModuleData;
    }

    /**
     * 获取场景shader数据（只读）
     */
    get sceneData(): ShaderData {
        return this._sceneData;
    }

    /**
     * 获取相机shader数据（只读）
     */
    get cameraData(): ShaderData {
        return this._cameraData;
    }

    /**
     * 获取全局shader数据（只读）
     */
    get globalShaderData(): ShaderData {
        return this._globalShaderData;
    }
}