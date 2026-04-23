import { Camera } from "../../d3/core/Camera";
import { Color } from "../../maths/Color";
import { Vector4 } from "../../maths/Vector4";
import { Viewport } from "../../maths/Viewport";
import { IRenderContext3D, PipelineMode } from "../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { InternalRenderTarget } from "../../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ISceneNodeData, ICameraNodeData } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { RenderClearFlag } from "../../RenderEngine/RenderEnum/RenderClearFlag";
import { RenderState2D } from "../../webgl/utils/RenderState2D";

/**
 * LayaXBridge3DContext - LayaX (wgpu) native wrapper for Bridge3D rendering context
 *
 * Uses conchLayaXBridge3DContext native class.
 * Each setter syncs to C++ via _nativeObj, C++ calls Rust FFI.
 */
export class LayaXBridge3DContext {
	_nativeObj: any;

	constructor() {
		this._nativeObj = new (window as any).conchLayaXBridge3DContext();
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
		// Not used on LayaX native - C++ gets RT from 2D context
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
		// Not used on LayaX native - C++ _render() handles invert matrix internally
	}

	applyToContext(context: IRenderContext3D): void {
		// Not used on LayaX native - C++ handles context application via Rust FFI
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
		return null; // Not used on LayaX native
	}

	set pipelineMode(value: PipelineMode) {
		// Not used on LayaX native
	}

	get invertY(): boolean {
		return false; // Not used on LayaX native
	}

	set invertY(value: boolean) {
		// Not used on LayaX native
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
		// Not used on LayaX native
	}

	get bridge3DLightTexture(): any {
		return null;
	}

	get bridge3DLightPixels(): Float32Array {
		return null;
	}

	/**
	 * Update viewport/scissor from camera
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
