import { Config3D } from "../../../Config3D";
import { Laya } from "../../../Laya";
import { Node } from "../../display/Node";
import { Event } from "../../events/Event";
import { LayaGL } from "../../layagl/LayaGL";
import { Render } from "../../renders/Render";
import { BaseTexture } from "../../resource/BaseTexture";
import { RenderTextureDepthFormat, RenderTextureFormat } from "../../resource/RenderTextureFormat";
import { WebGLContext } from "../../webgl/WebGLContext";
import { PostProcess } from "../component/PostProcess";
import { FrustumCulling } from "../graphics/FrustumCulling";
import { Cluster } from "../graphics/renderPath/Cluster";
import { BoundFrustum } from "../math/BoundFrustum";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Plane } from "../math/Plane";
import { Ray } from "../math/Ray";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { Viewport } from "../math/Viewport";
import { RenderTexture } from "../resource/RenderTexture";
import { Shader3D } from "../shader/Shader3D";
import { ShaderData } from "../shader/ShaderData";
import { ParallelSplitShadowMap } from "../shadowMap/ParallelSplitShadowMap";
import { Picker } from "../utils/Picker";
import { SystemUtils } from "../utils/SystemUtils";
import { BaseCamera } from "./BaseCamera";
import { BlitScreenQuadCMD } from "./render/command/BlitScreenQuadCMD";
import { CommandBuffer } from "./render/command/CommandBuffer";
import { RenderContext3D } from "./render/RenderContext3D";
import { RenderQueue } from "./render/RenderQueue";
import { Scene3D } from "./scene/Scene3D";
import { Scene3DShaderDeclaration } from "./scene/Scene3DShaderDeclaration";
import { Transform3D } from "./Transform3D";

/**
 * 相机清除标记。
 */
enum CameraClearFlags {
	/**固定颜色。*/
	SolidColor = 0,
	/**天空。*/
	Sky = 1,
	/**仅深度。*/
	DepthOnly = 2,
	/**不清除。*/
	Nothing = 3
}

/**
 * <code>Camera</code> 类用于创建摄像机。
 */
export class Camera extends BaseCamera {
	/** @internal */
	static CAMERAEVENT_POSTPROCESS: number = 0;

	/** @internal */
	static _tempVector20: Vector2 = new Vector2();

	/** @internal */
	static _updateMark: number = 0;

	/** @internal */
	private _aspectRatio: number;
	/** @internal */
	private _viewport: Viewport;
	/** @internal */
	private _normalizedViewport: Viewport;
	/** @internal */
	private _viewMatrix: Matrix4x4;
	/** @internal */
	private _projectionMatrix: Matrix4x4;
	/** @internal */
	private _projectionViewMatrix: Matrix4x4;
	/** @internal */
	private _boundFrustum: BoundFrustum;
	/** @internal */
	private _updateViewMatrix: boolean = true;
	/** @internal */
	private _postProcess: PostProcess = null;
	/** @internal */
	private _enableHDR: boolean = false;
	/** @internal */
	private _viewportParams: Vector4 = new Vector4();
	/** @internal */
	private _projectionParams: Vector4 = new Vector4();


	/** @internal */
	_offScreenRenderTexture: RenderTexture = null;
	/** @internal */
	_internalRenderTexture: RenderTexture = null;
	/** @internal */
	_postProcessCommandBuffers: CommandBuffer[] = [];
	/** @internal */
	_clusterXPlanes: Vector3[];
	/** @internal */
	_clusterYPlanes: Vector3[];
	/** @internal */
	_clusterPlaneCacheFlag: Vector2 = new Vector2(-1, -1);
	/** @internal */
	_screenOffsetScale: Vector4 = new Vector4();

	/**是否允许渲染。*/
	enableRender: boolean = true;
	/**清除标记。*/
	clearFlag: CameraClearFlags = CameraClearFlags.SolidColor;

	/**
	 * 横纵比。
	 */
	get aspectRatio(): number {
		if (this._aspectRatio === 0) {
			var vp: Viewport = this.viewport;
			return vp.width / vp.height;
		}
		return this._aspectRatio;
	}

	set aspectRatio(value: number) {
		if (value < 0)
			throw new Error("Camera: the aspect ratio has to be a positive real number.");
		this._aspectRatio = value;
		this._calculateProjectionMatrix();
	}

	/**
	 * 获取屏幕像素坐标的视口。
	 */
	get viewport(): Viewport {//TODO:优化
		if (this._offScreenRenderTexture)
			this._calculationViewport(this._normalizedViewport, this._offScreenRenderTexture.width, this._offScreenRenderTexture.height);
		else
			this._calculationViewport(this._normalizedViewport, RenderContext3D.clientWidth, RenderContext3D.clientHeight);//屏幕尺寸会动态变化,需要重置
		return this._viewport;
	}

	set viewport(value: Viewport) {
		var width: number;
		var height: number;
		if (this._offScreenRenderTexture) {
			width = this._offScreenRenderTexture.width;
			height = this._offScreenRenderTexture.height;
		} else {
			width = RenderContext3D.clientWidth;
			height = RenderContext3D.clientHeight;
		}
		this._normalizedViewport.x = value.x / width;
		this._normalizedViewport.y = value.y / height;
		this._normalizedViewport.width = value.width / width;
		this._normalizedViewport.height = value.height / height;
		this._calculationViewport(this._normalizedViewport, width, height);
		this._calculateProjectionMatrix();
	}

	/**
	 * 裁剪空间的视口。
	 */
	get normalizedViewport(): Viewport {
		return this._normalizedViewport;
	}

	set normalizedViewport(value: Viewport) {
		var width: number;
		var height: number;
		if (this._offScreenRenderTexture) {
			width = this._offScreenRenderTexture.width;
			height = this._offScreenRenderTexture.height;
		} else {
			width = RenderContext3D.clientWidth;
			height = RenderContext3D.clientHeight;
		}
		if (this._normalizedViewport !== value)
			value.cloneTo(this._normalizedViewport);
		this._calculationViewport(value, width, height);
		this._calculateProjectionMatrix();
	}

	/**
	 * 获取视图矩阵。
	 */
	get viewMatrix(): Matrix4x4 {
		if (this._updateViewMatrix) {
			var scale: Vector3 = this.transform.getWorldLossyScale();
			var scaleX: number = scale.x;
			var scaleY: number = scale.y;
			var scaleZ: number = scale.z;
			var viewMatE: Float32Array = this._viewMatrix.elements;

			this.transform.worldMatrix.cloneTo(this._viewMatrix)
			viewMatE[0] /= scaleX;//忽略缩放
			viewMatE[1] /= scaleX;
			viewMatE[2] /= scaleX;
			viewMatE[4] /= scaleY;
			viewMatE[5] /= scaleY;
			viewMatE[6] /= scaleY;
			viewMatE[8] /= scaleZ;
			viewMatE[9] /= scaleZ;
			viewMatE[10] /= scaleZ;
			this._viewMatrix.invert(this._viewMatrix);
			this._updateViewMatrix = false;
		}
		return this._viewMatrix;
	}

	/**
	 * 投影矩阵。
	 */
	get projectionMatrix(): Matrix4x4 {
		return this._projectionMatrix;
	}

	set projectionMatrix(value: Matrix4x4) {
		this._projectionMatrix = value;
		this._useUserProjectionMatrix = true;
	}

	/**
	 * 获取视图投影矩阵。
	 */
	get projectionViewMatrix(): Matrix4x4 {
		Matrix4x4.multiply(this.projectionMatrix, this.viewMatrix, this._projectionViewMatrix);
		return this._projectionViewMatrix;
	}

	/**
	 * 获取摄像机视锥。
	 */
	get boundFrustum(): BoundFrustum {
		this._boundFrustum.matrix = this.projectionViewMatrix;
		if (Render.supportWebGLPlusCulling) {
			var near: Plane = this._boundFrustum.near;
			var far: Plane = this._boundFrustum.far;
			var left: Plane = this._boundFrustum.left;
			var right: Plane = this._boundFrustum.right;
			var top: Plane = this._boundFrustum.top;
			var bottom: Plane = this._boundFrustum.bottom;
			var nearNE: Vector3 = near.normal;
			var farNE: Vector3 = far.normal;
			var leftNE: Vector3 = left.normal;
			var rightNE: Vector3 = right.normal;
			var topNE: Vector3 = top.normal;
			var bottomNE: Vector3 = bottom.normal;
			var buffer: Float32Array = this._boundFrustumBuffer;
			buffer[0] = nearNE.x, buffer[1] = nearNE.y, buffer[2] = nearNE.z, buffer[3] = near.distance;
			buffer[4] = farNE.x, buffer[5] = farNE.y, buffer[6] = farNE.z, buffer[7] = far.distance;
			buffer[8] = leftNE.x, buffer[9] = leftNE.y, buffer[10] = leftNE.z, buffer[11] = left.distance;
			buffer[12] = rightNE.x, buffer[13] = rightNE.y, buffer[14] = rightNE.z, buffer[15] = right.distance;
			buffer[16] = topNE.x, buffer[17] = topNE.y, buffer[18] = topNE.z, buffer[19] = top.distance;
			buffer[20] = bottomNE.x, buffer[21] = bottomNE.y, buffer[22] = bottomNE.z, buffer[23] = bottom.distance;
		}

		return this._boundFrustum;
	}

	/**
	 * 自定义渲染场景的渲染目标。
	 */
	get renderTarget(): RenderTexture {
		return this._offScreenRenderTexture;
	}

	set renderTarget(value: RenderTexture) {
		var lastValue: RenderTexture = this._offScreenRenderTexture;
		if (lastValue !== value) {
			(lastValue) && (lastValue._isCameraTarget = false);
			(value) && (value._isCameraTarget = true);
			this._offScreenRenderTexture = value;
			this._calculateProjectionMatrix();
		}
	}

	/**
	 * 后期处理。
	 */
	get postProcess(): PostProcess {
		return this._postProcess;
	}

	set postProcess(value: PostProcess) {
		this._postProcess = value;
		var postProcessCommandBuffer: CommandBuffer = new CommandBuffer();
		this.addCommandBuffer(Camera.CAMERAEVENT_POSTPROCESS, postProcessCommandBuffer);
		value._init(this, postProcessCommandBuffer);
	}

	/**
	 * 是否开启HDR。
	 * 开启后对性能有一定影响。
	 */
	get enableHDR(): boolean {
		return this._enableHDR;
	}

	set enableHDR(value: boolean) {
		if (value && !SystemUtils.supportRenderTextureFormat(RenderTextureFormat.R16G16B16A16)) {
			console.warn("Camera:can't enable HDR in this device.");
			return;
		}
		this._enableHDR = value;
	}

	/**
	 * 创建一个 <code>Camera</code> 实例。
	 * @param	aspectRatio 横纵比。
	 * @param	nearPlane 近裁面。
	 * @param	farPlane 远裁面。
	 */
	constructor(aspectRatio: number = 0, nearPlane: number = 0.3, farPlane: number = 1000) {
		super(nearPlane, farPlane);
		this._viewMatrix = new Matrix4x4();
		this._projectionMatrix = new Matrix4x4();
		this._projectionViewMatrix = new Matrix4x4();
		this._viewport = new Viewport(0, 0, 0, 0);
		this._normalizedViewport = new Viewport(0, 0, 1, 1);
		this._aspectRatio = aspectRatio;
		this._boundFrustum = new BoundFrustum(Matrix4x4.DEFAULT);
		if (Render.supportWebGLPlusCulling)
			this._boundFrustumBuffer = new Float32Array(24);

		this._calculateProjectionMatrix();
		Laya.stage.on(Event.RESIZE, this, this._onScreenSizeChanged);
		this.transform.on(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
	}

	/**
	 * @internal
	 */
	private _calculationViewport(normalizedViewport: Viewport, width: number, height: number): void {
		var lx: number = normalizedViewport.x * width;//不应限制x范围
		var ly: number = normalizedViewport.y * height;//不应限制y范围
		var rx: number = lx + Math.max(normalizedViewport.width * width, 0);
		var ry: number = ly + Math.max(normalizedViewport.height * height, 0);

		var ceilLeftX: number = Math.ceil(lx);
		var ceilLeftY: number = Math.ceil(ly);
		var floorRightX: number = Math.floor(rx);
		var floorRightY: number = Math.floor(ry);

		var pixelLeftX: number = ceilLeftX - lx >= 0.5 ? Math.floor(lx) : ceilLeftX;
		var pixelLeftY: number = ceilLeftY - ly >= 0.5 ? Math.floor(ly) : ceilLeftY;
		var pixelRightX: number = rx - floorRightX >= 0.5 ? Math.ceil(rx) : floorRightX;
		var pixelRightY: number = ry - floorRightY >= 0.5 ? Math.ceil(ry) : floorRightY;

		this._viewport.x = pixelLeftX;
		this._viewport.y = pixelLeftY;
		this._viewport.width = pixelRightX - pixelLeftX;
		this._viewport.height = pixelRightY - pixelLeftY;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _calculateProjectionMatrix(): void {
		if (!this._useUserProjectionMatrix) {
			if (this._orthographic) {
				var halfHeight: number = this.orthographicVerticalSize * 0.5;
				var halfWidth: number = halfHeight * this.aspectRatio;
				Matrix4x4.createOrthoOffCenter(-halfWidth, halfWidth, -halfHeight, halfHeight, this.nearPlane, this.farPlane, this._projectionMatrix);
			} else {
				Matrix4x4.createPerspective(3.1416 * this.fieldOfView / 180.0, this.aspectRatio, this.nearPlane, this.farPlane, this._projectionMatrix);
			}
		}
	}

	/**
	 *	通过蒙版值获取蒙版是否显示。
	 * 	@param  layer 层。
	 * 	@return 是否显示。
	 */
	_isLayerVisible(layer: number): boolean {
		return (Math.pow(2, layer) & this.cullingMask) != 0;
	}

	/**
	 * @internal
	 */
	_onTransformChanged(flag: number): void {
		flag &= Transform3D.TRANSFORM_WORLDMATRIX;//过滤有用TRANSFORM标记
		(flag) && (this._updateViewMatrix = true);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_parse(data: any, spriteMap: any): void {
		super._parse(data, spriteMap);
		var clearFlagData: any = data.clearFlag;
		(clearFlagData !== undefined) && (this.clearFlag = clearFlagData);
		var viewport: any[] = data.viewport;
		this.normalizedViewport = new Viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
		var enableHDR: boolean = data.enableHDR;
		(enableHDR !== undefined) && (this.enableHDR = enableHDR);
	}


	/**
	 * @internal
	 */
	_getCanvasWidth(): number {
		if (this._offScreenRenderTexture)
			return this._offScreenRenderTexture.width;
		else
			return RenderContext3D.clientWidth;
	}

	/**
	 * @internal
	 */
	_getCanvasHeight(): number {
		if (this._offScreenRenderTexture)
			return this._offScreenRenderTexture.height;
		else
			return RenderContext3D.clientHeight;
	}

	/**
	 * @internal
	 */
	_getRenderTexture(): RenderTexture {
		return this._internalRenderTexture || this._offScreenRenderTexture;
	}

	/**
	 * @internal
	 */
	_needInternalRenderTexture(): boolean {
		return this._postProcess || this._enableHDR ? true : false;//condition of internal RT
	}

	/**
	 * @internal
	 */
	_applyPostProcessCommandBuffers(): void {
		for (var i: number = 0, n: number = this._postProcessCommandBuffers.length; i < n; i++)
			this._postProcessCommandBuffers[i]._apply();
	}

	/**
	 * @internal
	 */
	_getRenderTextureFormat(): number {
		if (this._enableHDR)
			return RenderTextureFormat.R16G16B16A16;
		else
			return RenderTextureFormat.R8G8B8;
	}

	/**
	 * @override
	 * @internal
	 */
	_prepareCameraToRender(): void {
		super._prepareCameraToRender();
		var vp: Viewport = this.viewport;
		this._viewportParams.setValue(vp.x, vp.y, vp.width, vp.height);
		this._projectionParams.setValue(this._nearPlane, this._farPlane, this._getRenderTexture() ? -1 : 1, 0);
		this._shaderValues.setVector(BaseCamera.VIEWPORT, this._viewportParams);
		this._shaderValues.setVector(BaseCamera.PROJECTION_PARAMS, this._projectionParams);
	}

	/**
	 * @internal
	 */
	_applyViewProject(context: RenderContext3D, viewMat: Matrix4x4, proMat: Matrix4x4): void {
		var projectView: Matrix4x4;
		var shaderData: ShaderData = this._shaderValues;
		if (context.invertY) {
			Matrix4x4.multiply(BaseCamera._invertYScaleMatrix, proMat, BaseCamera._invertYProjectionMatrix);
			Matrix4x4.multiply(BaseCamera._invertYProjectionMatrix, viewMat, BaseCamera._invertYProjectionViewMatrix);
			proMat = BaseCamera._invertYProjectionMatrix;
			projectView = BaseCamera._invertYProjectionViewMatrix;
		}
		else {
			Matrix4x4.multiply(proMat, viewMat, this._projectionViewMatrix);
			projectView = this._projectionViewMatrix;
		}

		context.viewMatrix = viewMat;
		context.projectionMatrix = proMat;
		context.projectionViewMatrix = projectView;
		shaderData.setMatrix4x4(BaseCamera.VIEWMATRIX, viewMat);
		shaderData.setMatrix4x4(BaseCamera.PROJECTMATRIX, proMat);
		shaderData.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, projectView);
	}

	/**
	 * @internal
	 */
	_updateClusterPlaneXY(): void {
		var fieldOfView: number = this.fieldOfView;
		var aspectRatio: number = this.aspectRatio;
		if (this._clusterPlaneCacheFlag.x !== fieldOfView || this._clusterPlaneCacheFlag.y !== aspectRatio) {
			var clusterCount: Vector3 = Config3D._config.lightClusterCount;
			var xSlixe: number = clusterCount.x, ySlice: number = clusterCount.y;
			var xCount: number = xSlixe + 1, yCount: number = ySlice + 1;
			var xPlanes: Vector3[] = this._clusterXPlanes, yPlanes: Vector3[] = this._clusterYPlanes;

			if (!xPlanes) {
				xPlanes = this._clusterXPlanes = new Array(xCount);
				yPlanes = this._clusterYPlanes = new Array(yCount);
				for (var i: number = 0; i < xCount; i++)
					xPlanes[i] = new Vector3();
				for (var i: number = 0; i < yCount; i++)
					yPlanes[i] = new Vector3();
			}

			var halfY = Math.tan((this.fieldOfView / 2) * Math.PI / 180);
			var halfX = this.aspectRatio * halfY;
			var yLengthPerCluster = 2 * halfY / xSlixe;
			var xLengthPerCluster = 2 * halfX / ySlice;
			for (var i: number = 0; i < xCount; i++) {
				var angle: number = -halfX + xLengthPerCluster * i;
				var bigHypot: number = Math.sqrt(1 + angle * angle);
				var normX: number = 1 / bigHypot;
				var xPlane: Vector3 = xPlanes[i];
				xPlane.setValue(normX, 0, -angle * normX);
			}
			//start from top is more similar to light pixel data
			for (var i: number = 0; i < yCount; i++) {
				var angle: number = halfY - yLengthPerCluster * i;
				var bigHypot: number = Math.sqrt(1 + angle * angle);
				var normY: number = -1 / bigHypot;
				var yPlane: Vector3 = yPlanes[i];
				yPlane.setValue(0, normY, -angle * normY);
			}

			this._clusterPlaneCacheFlag.x = fieldOfView;
			this._clusterPlaneCacheFlag.y = aspectRatio;
		}
	}

	/**
	 * @override
	 * @param shader 着色器
	 * @param replacementTag 替换标记。
	 */
	render(shader: Shader3D = null, replacementTag: string = null): void {
		if (!this.activeInHierarchy) //custom render should protected with activeInHierarchy=true
			return;

		var viewport: Viewport = this.viewport;
		var needInternalRT: boolean = this._needInternalRenderTexture();
		var gl: WebGLRenderingContext = LayaGL.instance;
		var context: RenderContext3D = RenderContext3D._instance;
		var scene: Scene3D = context.scene = <Scene3D>this._scene;

		if (needInternalRT)
			this._internalRenderTexture = RenderTexture.createFromPool(viewport.width, viewport.height, this._getRenderTextureFormat(), RenderTextureDepthFormat.DEPTH_16, BaseTexture.FILTERMODE_BILINEAR);
		else
			this._internalRenderTexture = null;
		if (scene.parallelSplitShadowMaps[0]) {//TODO:SM
			ShaderData.setRuntimeValueMode(false);
			var parallelSplitShadowMap: ParallelSplitShadowMap = scene.parallelSplitShadowMaps[0];
			parallelSplitShadowMap._calcAllLightCameraInfo(this);
			scene._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_CAST_SHADOW);//增加宏定义
			for (var i: number = 0, n: number = parallelSplitShadowMap.shadowMapCount; i < n; i++) {
				var smCamera: Camera = parallelSplitShadowMap.cameras[i];
				context.camera = smCamera;
				FrustumCulling.renderObjectCulling(smCamera, scene, context, shader, replacementTag, true);

				var shadowMap: RenderTexture = parallelSplitShadowMap.cameras[i + 1].renderTarget;
				shadowMap._start();
				RenderContext3D._instance.invertY = false;//阴影不需要翻转,临时矫正，待重构处理
				context.camera = smCamera;
				Camera._updateMark++;
				context.viewport = smCamera.viewport;
				smCamera._prepareCameraToRender();
				smCamera._applyViewProject(context, smCamera.viewMatrix, smCamera.projectionMatrix);
				scene._clear(gl, context);
				var queue: RenderQueue = scene._opaqueQueue;//阴影均为非透明队列
				queue._render(context);
				shadowMap._end();
			}
			scene._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_CAST_SHADOW);//去掉宏定义
			ShaderData.setRuntimeValueMode(true);
		}

		context.camera = this;
		Camera._updateMark++;
		scene._preRenderScript();//TODO:duo相机是否重复
		//TODO:webgl2 should use blitFramebuffer
		//TODO:if adjacent camera param can use same internal RT can merge
		//if need internal RT and no off screen RT and clearFlag is DepthOnly or Nothing, should grab the backBuffer
		if (needInternalRT && !this._offScreenRenderTexture && (this.clearFlag == CameraClearFlags.DepthOnly || this.clearFlag == CameraClearFlags.Nothing)) {
			if (this._enableHDR) {//internal RT is HDR can't directly copy
				var grabTexture: RenderTexture = RenderTexture.createFromPool(viewport.width, viewport.height, RenderTextureFormat.R8G8B8, RenderTextureDepthFormat.DEPTH_16, BaseTexture.FILTERMODE_BILINEAR);
				WebGLContext.bindTexture(gl, gl.TEXTURE_2D, grabTexture._getSource());
				gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, viewport.x, RenderContext3D.clientHeight - (viewport.y + viewport.height), viewport.width, viewport.height);
				var blit: BlitScreenQuadCMD = BlitScreenQuadCMD.create(grabTexture, this._internalRenderTexture);
				blit.run();
				blit.recover();
				RenderTexture.recoverToPool(grabTexture);
			}
			else {
				WebGLContext.bindTexture(gl, gl.TEXTURE_2D, this._internalRenderTexture._getSource());
				gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, viewport.x, RenderContext3D.clientHeight - (viewport.y + viewport.height), viewport.width, viewport.height);
			}
		}
		var renderTex: RenderTexture = this._getRenderTexture();//如果有临时renderTexture则画到临时renderTexture,最后再画到屏幕或者离屏画布,如果无临时renderTexture则直接画到屏幕或离屏画布
		(renderTex) && (renderTex._start());
		context.viewport = viewport;
		this._prepareCameraToRender();
		var multiLighting: boolean = Config3D._config._multiLighting;
		(multiLighting) && (Cluster.instance.update(this, <Scene3D>(this._scene)));

		this._applyViewProject(context, this.viewMatrix, this._projectionMatrix);

		scene._preCulling(context, this, shader, replacementTag);
		scene._clear(gl, context);
		scene._renderScene(context);
		scene._postRenderScript();//TODO:duo相机是否重复
		(renderTex) && (renderTex._end());

		if (needInternalRT) {
			if (this._postProcess) {
				this._postProcess._render();
				this._applyPostProcessCommandBuffers();
			} else if (this._enableHDR) {
				var canvasWidth: number = this._getCanvasWidth(), canvasHeight: number = this._getCanvasHeight();
				this._screenOffsetScale.setValue(viewport.x / canvasWidth, viewport.y / canvasHeight, viewport.width / canvasWidth, viewport.height / canvasHeight);
				var blit: BlitScreenQuadCMD = BlitScreenQuadCMD.create(this._internalRenderTexture, this._offScreenRenderTexture ? this._offScreenRenderTexture : null, this._screenOffsetScale);
				blit.run();
				blit.recover();
			}
			RenderTexture.recoverToPool(this._internalRenderTexture);
		}
	}


	/**
	 * 计算从屏幕空间生成的射线。
	 * @param point 屏幕空间的位置位置。
	 * @param out  输出射线。
	 */
	viewportPointToRay(point: Vector2, out: Ray): void {
		Picker.calculateCursorRay(point, this.viewport, this._projectionMatrix, this.viewMatrix, null, out);
	}

	/**
	 * 计算从裁切空间生成的射线。
	 * @param point 裁切空间的位置。
	 * @param out  输出射线。
	 */
	normalizedViewportPointToRay(point: Vector2, out: Ray): void {
		var finalPoint: Vector2 = Camera._tempVector20;
		var vp: Viewport = this.viewport;
		finalPoint.x = point.x * vp.width;
		finalPoint.y = point.y * vp.height;

		Picker.calculateCursorRay(finalPoint, this.viewport, this._projectionMatrix, this.viewMatrix, null, out);
	}

	/**
	 * 将一个点从世界空间转换到视口空间。
	 * @param position 世界空间的坐标。
	 * @param out  视口空间的坐标。
	 */
	worldToViewportPoint(position: Vector3, out: Vector3): void {
		Matrix4x4.multiply(this._projectionMatrix, this._viewMatrix, this._projectionViewMatrix);
		this.viewport.project(position, this._projectionViewMatrix, out);
		out.x = out.x / Laya.stage.clientScaleX;
		out.y = out.y / Laya.stage.clientScaleY;
	}

	/**
	 * 将一个点从世界空间转换到归一化视口空间。
	 * @param position 世界空间的坐标。
	 * @param out  归一化视口空间的坐标。
	 */
	worldToNormalizedViewportPoint(position: Vector3, out: Vector3): void {
		Matrix4x4.multiply(this._projectionMatrix, this._viewMatrix, this._projectionViewMatrix);
		this.normalizedViewport.project(position, this._projectionViewMatrix, out);
		out.x = out.x / Laya.stage.clientScaleX;
		out.y = out.y / Laya.stage.clientScaleY;
	}

	/**
	 * 转换2D屏幕坐标系统到3D正交投影下的坐标系统，注:只有正交模型下有效。
	 * @param   source 源坐标。
	 * @param   out 输出坐标。
	 * @return 是否转换成功。
	 */
	convertScreenCoordToOrthographicCoord(source: Vector3, out: Vector3): boolean {//TODO:是否应该使用viewport宽高
		if (this._orthographic) {
			var clientWidth: number = RenderContext3D.clientWidth;
			var clientHeight: number = RenderContext3D.clientHeight;
			var ratioX: number = this.orthographicVerticalSize * this.aspectRatio / clientWidth;
			var ratioY: number = this.orthographicVerticalSize / clientHeight;
			out.x = (-clientWidth / 2 + source.x * Laya.stage.clientScaleX) * ratioX;
			out.y = (clientHeight / 2 - source.y * Laya.stage.clientScaleY) * ratioY;
			out.z = (this.nearPlane - this.farPlane) * (source.z + 1) / 2 - this.nearPlane;
			Vector3.transformCoordinate(out, this.transform.worldMatrix, out);
			return true;
		} else {
			return false;
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	destroy(destroyChild: boolean = true): void {
		this._offScreenRenderTexture = null;
		this.transform.off(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
		super.destroy(destroyChild);
	}

	/**
	 * 在特定渲染管线阶段添加指令缓存。
	 */
	addCommandBuffer(event: number, commandBuffer: CommandBuffer): void {
		switch (event) {
			case Camera.CAMERAEVENT_POSTPROCESS:
				this._postProcessCommandBuffers.push(commandBuffer);
				commandBuffer._camera = this;
				break;
			default:
				throw "Camera:unknown event.";
		}
	}

	/**
	 * 在特定渲染管线阶段移除指令缓存。
	 */
	removeCommandBuffer(event: number, commandBuffer: CommandBuffer): void {
		switch (event) {
			case Camera.CAMERAEVENT_POSTPROCESS:
				var index: number = this._postProcessCommandBuffers.indexOf(commandBuffer);
				if (index !== -1)
					this._postProcessCommandBuffers.splice(index, 1);
				break;
			default:
				throw "Camera:unknown event.";
		}
	}

	/**
	 * 在特定渲染管线阶段移除所有指令缓存。
	 */
	removeCommandBuffers(event: number): void {
		switch (event) {
			case Camera.CAMERAEVENT_POSTPROCESS:
				this._postProcessCommandBuffers.length = 0;
				break;
			default:
				throw "Camera:unknown event.";
		}
	}

	/**
	 * @internal
	 */
	protected _create(): Node {
		return new Camera();
	}

	/** @internal [NATIVE]*/
	_boundFrustumBuffer: Float32Array;
}

