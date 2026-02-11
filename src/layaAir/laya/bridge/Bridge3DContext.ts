import { Camera } from "../d3/core/Camera";
import { Color } from "../maths/Color";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Vector4 } from "../maths/Vector4";
import { Viewport } from "../maths/Viewport";
import { PipelineMode, IRenderContext3D } from "../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { InternalRenderTarget } from "../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { ShaderData } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IClipInfo } from "../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { ISceneNodeData, ICameraNodeData } from "../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { RenderClearFlag } from "../RenderEngine/RenderEnum/RenderClearFlag";

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

    /**
     * 2D当前渲染目标（null表示屏幕）
     */
    private _renderTarget2D: InternalRenderTarget = null;

    /**
     * 2D逆矩阵分量 [a, c, tx]
     */
    private _invertMat0_a: number = 1;
    private _invertMat0_c: number = 0;
    private _invertMat0_tx: number = 0;

    /**
     * 2D逆矩阵分量 [b, d, ty]
     */
    private _invertMat1_b: number = 0;
    private _invertMat1_d: number = 1;
    private _invertMat1_ty: number = 0;

    /**
     * 2D clip信息
     */
    private _clipInfo: IClipInfo = null;

    /**
     * 是否有有效的clip（非默认clip）
     */
    private _hasClip: boolean = false;

    /**
     * 2D invertY状态
     */
    private _invertY2D: boolean = false;

    /**
     * 校正矩阵（用于将Stage NDC变换到RT NDC）
     * @internal
     */
    static _correctionMatrix: Matrix4x4 = new Matrix4x4();

    /**
     * 临时矩阵用于投影校正
     * @internal
     */
    static _tempCorrectedProj: Matrix4x4 = new Matrix4x4();
    static _tempCorrectedProjView: Matrix4x4 = new Matrix4x4();

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
     * 设置2D渲染目标
     */
    setRenderTarget2D(rt: InternalRenderTarget): void {
        this._renderTarget2D = rt;
    }

    /**
     * 获取2D渲染目标
     */
    getRenderTarget2D(): InternalRenderTarget {
        return this._renderTarget2D;
    }

    /**
     * 设置2D逆矩阵分量
     * 逆矩阵格式: [a c tx; b d ty]
     */
    setInvertMatrix(a: number, b: number, c: number, d: number, tx: number, ty: number): void {
        this._invertMat0_a = a;
        this._invertMat0_c = c;
        this._invertMat0_tx = tx;
        this._invertMat1_b = b;
        this._invertMat1_d = d;
        this._invertMat1_ty = ty;
    }

    /**
     * 设置2D clip信息
     */
    setClipInfo(clipInfo: IClipInfo, hasClip: boolean): void {
        this._clipInfo = clipInfo;
        this._hasClip = hasClip;
    }

    /**
     * 获取clip信息
     */
    getClipInfo(): IClipInfo {
        return this._clipInfo;
    }

    /**
     * 是否有有效的clip
     */
    get hasClip(): boolean {
        return this._hasClip;
    }

    /**
     * 设置2D invertY状态
     */
    set invertY2D(value: boolean) {
        this._invertY2D = value;
    }

    get invertY2D(): boolean {
        return this._invertY2D;
    }

    /**
     * 判断是否需要投影校正（逆矩阵不是单位矩阵）
     */
    get needsProjectionCorrection(): boolean {
        return this._renderTarget2D != null;
    }

    /**
     * 计算校正矩阵 M_corr
     * 将 Stage NDC 变换到 RT NDC，考虑2D逆矩阵
     *
     * 变换链:
     *   Stage NDC → Stage 像素 → (逆矩阵 M⁻¹) → RT 像素 → RT NDC
     *
     * @param vpW Stage viewport宽度
     * @param vpH Stage viewport高度
     * @param rtW RT宽度
     * @param rtH RT高度
     * @param out 输出校正矩阵
     */
    computeCorrectionMatrix(vpW: number, vpH: number, rtW: number, rtH: number, out: Matrix4x4): void {
        const a = this._invertMat0_a;
        const b = this._invertMat1_b;
        const c = this._invertMat0_c;
        const d = this._invertMat1_d;
        const tx = this._invertMat0_tx;
        const ty = this._invertMat1_ty;

        // M_corr 矩阵元素（列主序存储）
        // 行0: A = a*vpW/rtW, B = -c*vpH/rtW, C = (a*vpW + c*vpH + 2*tx)/rtW - 1  (注意这里c前面的符号)
        // 行1: D = -b*vpW/rtH, E = d*vpH/rtH, F = 1 - (b*vpW + d*vpH + 2*ty)/rtH
        //
        // 推导:
        // Stage NDC → Stage 像素:
        //   px = (ndcX + 1) / 2 * vpW
        //   py = (1 - ndcY) / 2 * vpH
        //
        // Stage 像素 → RT 像素 (通过逆矩阵):
        //   rx = a*px + c*py + tx
        //   ry = b*px + d*py + ty
        //
        // RT 像素 → RT NDC:
        //   ndcX' = rx / rtW * 2 - 1
        //   ndcY' = 1 - ry / rtH * 2

        const A = a * vpW / rtW;
        const B = -c * vpH / rtW;
        const C = (a * vpW + c * vpH + 2 * tx) / rtW - 1;
        const D = -b * vpW / rtH;
        const E = d * vpH / rtH;
        const F = 1 - (b * vpW + d * vpH + 2 * ty) / rtH;

        // 列主序: e[row + col*4]
        const e = out.elements;
        // Column 0
        e[0] = A;
        e[1] = D;
        e[2] = 0;
        e[3] = 0;
        // Column 1
        e[4] = B;
        e[5] = E;
        e[6] = 0;
        e[7] = 0;
        // Column 2
        e[8] = 0;
        e[9] = 0;
        e[10] = 1;
        e[11] = 0;
        // Column 3
        e[12] = C;
        e[13] = F;
        e[14] = 0;
        e[15] = 1;
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

    /**
     * Bridge3D独立的灯光贴图（用于解决全局灯光贴图冲突问题）
     * @private
     */
    private _bridge3DLightTexture: any = null;

    /**
     * Bridge3D独立的灯光像素数据
     * @private
     */
    private _bridge3DLightPixels: Float32Array = null;

    /**
     * 设置Bridge3D独立的灯光数据
     * @param lightTexture 灯光贴图
     * @param lightPixels 灯光像素数据
     */
    setBridge3DLightData(lightTexture: any, lightPixels: Float32Array): void {
        this._bridge3DLightTexture = lightTexture;
        this._bridge3DLightPixels = lightPixels;
    }

    /**
     * 获取Bridge3D的灯光贴图
     */
    get bridge3DLightTexture(): any {
        return this._bridge3DLightTexture;
    }

    /**
     * 获取Bridge3D的灯光像素数据
     */
    get bridge3DLightPixels(): Float32Array {
        return this._bridge3DLightPixels;
    }
}