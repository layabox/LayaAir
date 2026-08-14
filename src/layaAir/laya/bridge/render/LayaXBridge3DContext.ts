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
 * LayaXBridge3DContext - LayaX (wgpu) native wrapper for Bridge3D rendering context
 *
 * Uses conchLayaXBridge3DContext native class.
 * Each setter syncs to C++ via _nativeObj, C++ calls Rust FFI.
 */
export class LayaXBridge3DContext {
	_nativeObj: any;

	/** @internal clear 参数共享 Buffer：JS 写、C++ initBridge3DRenderPass 读。槽 0=depthBefore(i32) 1=depth(f32) 2=stencil(i32) */
	private _clearBuf = new ArrayBuffer(3 * 4);
	private _clearI32 = new Int32Array(this._clearBuf);
	private _clearF32 = new Float32Array(this._clearBuf);

	constructor() {
		this._nativeObj = new (window as any).conchLayaXBridge3DContext();
		this._nativeObj.bindPropertyBuffer(this._clearBuf);
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
		// Not used on LayaX native - C++ gets RT from 2D context
	}

	getRenderTarget2D(): InternalRenderTarget {
		return null;
	}

	setViewPort(vp: Viewport): void {
		// viewport 在 LayaX 路径无消费者（死数据），native 已删；保留空方法兼容接口。
	}

	setScissor(sc: Vector4): void {
		// scissor 同上，死数据，no-op。
	}

	setClearData(flag: number, color: Color, depthValue: number, stencilValue: number): void {
		this._clearI32[0] = (flag & RenderClearFlag.Depth) !== 0 ? 1 : 0;
		this._clearF32[1] = depthValue;
		this._clearI32[2] = stencilValue;
	}

	setInvertMatrix(a: number, b: number, c: number, d: number, tx: number, ty: number): void {
		// Not used on LayaX native - C++ _render() handles invert matrix internally
	}

	applyToContext(context: IRenderContext3D): void {
		// Not used on LayaX native - C++ handles context application via Rust FFI
	}

	get clearDepthBeforeRender(): boolean {
		return this._clearI32[0] !== 0;
	}

	set clearDepthBeforeRender(value: boolean) {
		this._clearI32[0] = value ? 1 : 0;
	}

	get clearDepth(): number {
		return this._clearF32[1];
	}

	set clearDepth(value: number) {
		this._clearF32[1] = value;
	}

	get clearStencil(): number {
		return this._clearI32[2];
	}

	set clearStencil(value: number) {
		this._clearI32[2] = value;
	}

	get pipelineMode(): PipelineMode {
		return null; // Not used on LayaX native
	}

	set pipelineMode(value: PipelineMode) {
		// Not used on LayaX native
	}

	private _invertY: boolean = false;

	get invertY(): boolean {
		return this._invertY;
	}

	set invertY(value: boolean) {
		if (this._invertY !== value) {
			this._invertY = value;
			this._nativeObj.setInvertY(value);
		}
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
		// viewport/scissor 在 LayaX 路径无消费者（死数据），已删 native；no-op 保留接口。
	}

	/**
	 * 合并多个初始化操作为一次 C++ 调用
	 * 包含: updateFromCamera + applyToContext + addPreDrawUniformMap("Scene3D") + addPreDrawUniformMap("Global")
	 * 同时设置 stageRenderSize
	 */
	prepareForRender(camera: Camera, context3d: IRenderContext3D): void {
		this._nativeObj.prepareForRender(RenderState2D.width, RenderState2D.height);
	}
}
