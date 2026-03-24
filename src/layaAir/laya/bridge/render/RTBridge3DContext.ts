import { Camera } from "../../d3/core/Camera";
import { Color } from "../../maths/Color";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector4 } from "../../maths/Vector4";
import { Viewport } from "../../maths/Viewport";
import { IRenderContext3D, PipelineMode } from "../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { InternalRenderTarget } from "../../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ISceneNodeData, ICameraNodeData } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { RenderClearFlag } from "../../RenderEngine/RenderEnum/RenderClearFlag";
import { RenderState2D } from "../../webgl/utils/RenderState2D";

/**
 * RTBridge3DContext - Native wrapper for GLESBridge3DContext
 *
 * Wraps the C++ GLESBridge3DContext for use on native platforms.
 */
export class RTBridge3DContext {
    _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchGLESBridge3DContext();
    }

    setSceneModuleData(data: ISceneNodeData): void {
        this._nativeObj.setSceneModuleData(data ? (data as any)._nativeObj : null);
    }

    setCameraModuleData(data: ICameraNodeData): void {
        this._nativeObj.setCameraModuleData(data ? (data as any)._nativeObj : null);
    }

    setSceneData(data: ShaderData): void {
        this._nativeObj.setSceneData(data ? (data as any)._nativeObj : null);
    }

    setCameraData(data: ShaderData): void {
        this._nativeObj.setCameraData(data ? (data as any)._nativeObj : null);
    }

    setGlobalShaderData(data: ShaderData): void {
        this._nativeObj.setGlobalShaderData(data ? (data as any)._nativeObj : null);
    }

    setRenderTarget2D(rt: InternalRenderTarget): void {
        // Not used on native - C++ gets RT from 2D context
    }

    getRenderTarget2D(): InternalRenderTarget {
        return null;
    }

    setViewPort(vp: Viewport): void {
        this._nativeObj.setViewport(vp);
    }

    setScissor(sc: Vector4): void {
        this._nativeObj.setScissor(sc);
    }

    setClearData(flag: number, color: Color, depthValue: number, stencilValue: number): void {
        this._nativeObj.clearDepthBeforeRender = (flag & RenderClearFlag.Depth) !== 0;
        this._nativeObj.clearDepth = depthValue;
        this._nativeObj.clearStencil = stencilValue;
    }

    setInvertMatrix(a: number, b: number, c: number, d: number, tx: number, ty: number): void {
        // Not used on native - C++ _render() handles invert matrix internally
    }

    applyToContext(context: IRenderContext3D): void {
        this._nativeObj.applyToContext((context as any)._nativeObj);
    }

    computeCorrectionMatrix(vpW: number, vpH: number, rtW: number, rtH: number, out: Matrix4x4): void {
        // Not used on native - C++ _render() handles projection correction internally
    }

    get clearDepthBeforeRender(): boolean {
        return this._nativeObj.clearDepthBeforeRender;
    }

    set clearDepthBeforeRender(value: boolean) {
        this._nativeObj.clearDepthBeforeRender = value;
    }

    get clearDepth(): number {
        return this._nativeObj.clearDepth;
    }

    set clearDepth(value: number) {
        this._nativeObj.clearDepth = value;
    }

    get clearStencil(): number {
        return this._nativeObj.clearStencil;
    }

    set clearStencil(value: number) {
        this._nativeObj.clearStencil = value;
    }

    get pipelineMode(): PipelineMode {
        return null; // Not used on native - C++ handles pipelineMode via applyToContext internally
    }

    set pipelineMode(value: PipelineMode) {
        // Not used on native - C++ handles pipelineMode via applyToContext internally
    }

    get invertY(): boolean {
        return false; // Not used on native - C++ handles invertY internally
    }

    set invertY(value: boolean) {
        // Not used on native - C++ handles invertY internally
    }

    get sceneModuleData(): ISceneNodeData {
        return null; // Read-only, not exposed
    }

    get cameraModuleData(): ICameraNodeData {
        return null; // Read-only, not exposed
    }

    get sceneData(): ShaderData {
        return null; // Read-only, not exposed
    }

    get cameraData(): ShaderData {
        return null; // Read-only, not exposed
    }

    get globalShaderData(): ShaderData {
        return null; // Read-only, not exposed
    }

    setBridge3DLightData(lightTexture: any, lightPixels: Float32Array): void {
        // Not used on native
    }

    get bridge3DLightTexture(): any {
        return null;
    }

    get bridge3DLightPixels(): Float32Array {
        return null;
    }

    /**
     * Update viewport/scissor from camera (mirrors Bridge3DContext.updateFromCamera)
     */
    updateFromCamera(camera: Camera): void {
        if (!camera) return;
        const viewport = camera.viewport;
        const vp = new Viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        this._nativeObj.setViewport(vp);
        const sc = new Vector4(viewport.x, viewport.y, viewport.width, viewport.height);
        this._nativeObj.setScissor(sc);
    }

    // Stage render dimensions (set before rendering)
    updateStageRenderSize(): void {
        this._nativeObj.stageRenderWidth = RenderState2D.width;
        this._nativeObj.stageRenderHeight = RenderState2D.height;
    }
}
