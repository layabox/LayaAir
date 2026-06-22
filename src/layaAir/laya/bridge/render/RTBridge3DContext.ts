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
import { NativeMemory } from "../../RenderDriver/RenderModuleData/RuntimeModuleData/NativeMemory";

/** @internal conchGLESBridge3DContext 共享块槽位（与 C++ GLESBridge3DContext::Props 一致）。 */
const enum Bridge3DContextSlot {
    clearDepthBeforeRender = 0,
    clearDepth = 1,
    clearStencil = 2,
    Count = 3,
}

/**
 * RTBridge3DContext - Native wrapper for GLESBridge3DContext
 *
 * Wraps the C++ GLESBridge3DContext for use on native platforms.
 */
export class RTBridge3DContext {
    _nativeObj: any;
    private _mem: NativeMemory;
    private _f32: Float32Array;
    private _i32: Int32Array;

    constructor() {
        this._nativeObj = new (window as any).conchGLESBridge3DContext();
        this._mem = new NativeMemory(Bridge3DContextSlot.Count * 4, false);
        this._f32 = this._mem.float32Array;
        this._i32 = this._mem.int32Array;
        this._nativeObj.bindPropertyBuffer(this._mem._buffer);
        // C++ defaults (depth clear on, clearDepth=1.0); zero-init would disable depth clear.
        this._i32[Bridge3DContextSlot.clearDepthBeforeRender] = 1;
        this._f32[Bridge3DContextSlot.clearDepth] = 1.0;
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

    setBridgeProjectionData(sceneOffsetMatrix: Matrix4x4, bridgePlaneWidth: number, bridgePlaneHeight: number): void {
        this._nativeObj.setBridgeProjectionData(sceneOffsetMatrix, bridgePlaneWidth, bridgePlaneHeight);
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
        this._i32[Bridge3DContextSlot.clearDepthBeforeRender] = (flag & RenderClearFlag.Depth) !== 0 ? 1 : 0;
        this._f32[Bridge3DContextSlot.clearDepth] = depthValue;
        this._i32[Bridge3DContextSlot.clearStencil] = stencilValue | 0;
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
        return this._i32[Bridge3DContextSlot.clearDepthBeforeRender] !== 0;
    }

    set clearDepthBeforeRender(value: boolean) {
        this._i32[Bridge3DContextSlot.clearDepthBeforeRender] = value ? 1 : 0;
    }

    get clearDepth(): number {
        return this._f32[Bridge3DContextSlot.clearDepth];
    }

    set clearDepth(value: number) {
        this._f32[Bridge3DContextSlot.clearDepth] = value;
    }

    get clearStencil(): number {
        return this._i32[Bridge3DContextSlot.clearStencil];
    }

    set clearStencil(value: number) {
        this._i32[Bridge3DContextSlot.clearStencil] = value | 0;
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
     * @remarks Kept for backward compatibility, but not called in hot path (use prepareForRender instead)
     */
    updateFromCamera(camera: Camera): void {
        if (!camera) return;
        const viewport = camera.viewport;
        const vp = new Viewport(viewport.x, viewport.y, viewport.width, viewport.height);
        this._nativeObj.setViewport(vp);
        const sc = new Vector4(viewport.x, viewport.y, viewport.width, viewport.height);
        this._nativeObj.setScissor(sc);
    }

    /**
     * 合并多个初始化操作为一次 C++ 调用
     * 包含: updateFromCamera + applyToContext + addPreDrawUniformMap("Scene3D") + addPreDrawUniformMap("Global")
     * 同时设置 stageRenderSize
     */
    prepareForRender(camera: Camera, context3d: IRenderContext3D): void {
        this._nativeObj.prepareForRender(
            (context3d as any)._nativeObj,
            camera.viewport.x, camera.viewport.y,
            camera.viewport.width, camera.viewport.height,
            RenderState2D.width, RenderState2D.height
        );
    }
}
