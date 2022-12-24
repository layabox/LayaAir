import { Config3D } from "../../../../Config3D";
import { ILaya3D } from "../../../../ILaya3D";
import { Camera, CameraEventFlags } from "../../core/Camera";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { Scene3D } from "../../core/scene/Scene3D";
import { Cluster } from "../../graphics/renderPath/Cluster";
import { Viewport } from "../../math/Viewport";
import { WebXRCameraManager } from "./WebXRCameraManager";
import { WebXRRenderTexture } from "./WebXRRenderTexture";
import { RenderStateContext } from "../../../RenderEngine/RenderStateContext";
import { WebXRExperienceHelper } from "./WebXRExperienceHelper";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { RenderTexture } from "../../../resource/RenderTexture";


/**
 * @author miner
 * 类用于创建WebXR摄像机。
 */
export class WebXRCamera extends Camera {
	/**
	 * @internal
	 */
	public isWebXR = true;
	/**
	 * WebXRSessionManager
	 */
	private _webXRManager: WebXRCameraManager;

	/**
	 * override client
	 */
	private _clientWidth: number;
	/**
	 * override client
	 */
	private _clientHeight: number;

	/**
	 * 自定义渲染场景的渲染目标。
	 */
	get renderTarget(): RenderTexture {
		return this._internalRenderTexture;
	}

	/**
	 * @internal
	 */
	set renderTarget(value: RenderTexture) {
		this._internalRenderTexture = value;
	}

	/**
	 * @internal
	 */
	set clientWidth(value: number) {
		this._clientWidth = value;
	}
	/**
	 * @internal
	 */
	set clientHeight(value: number) {
		this._clientHeight = value;
	}
	/**
	 * @internal
	 */
	get clientWidth(): number {
		return this._clientWidth;
	}
	/**
	 * @internal
	 */
	get clientHeight(): number {
		return this._clientHeight;
	}

	/**
	 * restore view state
	 * @internal
	 */
	private _restoreView(gl: WebGLRenderingContext) {
		//恢复渲染区
		var viewport: Viewport = this.viewport;
		var vpX: number, vpY: number;
		var vpW: number = viewport.width;
		var vpH: number = viewport.height;
		if (this._needInternalRenderTexture()) {
			vpX = 0;
			vpY = 0;
		}
		else {
			vpX = viewport.x;
			vpY = this._getCanvasHeight() - viewport.y - vpH;
		}
		gl.viewport(vpX, vpY, vpW, vpH);
	}

	/**
	 * 渲染
	 * @override
	 * @param shader 
	 * @param replacementTag 
	 */
	render(shader: Shader3D = null, replacementTag: string = null): void {
		if (!this.activeInHierarchy) //custom render should protected with activeInHierarchy=true
			return;

		var viewport: Viewport = this.viewport;
		var needInternalRT: boolean = true;
		var context: RenderContext3D = RenderContext3D._instance;
		var scene: Scene3D = context.scene = <Scene3D>this._scene;
		context.pipelineMode = context.configPipeLineMode;
		context.replaceTag = replacementTag;
		context.customShader = shader;
		var needShadowCasterPass: boolean = this._renderShadowMap(scene, context);
		this._preRenderMainPass(context, scene, needInternalRT, viewport);
		this._renderMainPass(context, viewport, scene, shader, replacementTag, needInternalRT);
		this._aftRenderMainPass(needShadowCasterPass);
	}

	/**
 * 渲染主流程
 * @internal
 * @param context 渲染上下文
 * @param viewport 视口
 * @param scene 场景
 * @param shader shader
 * @param replacementTag 替换标签
 * @param needInternalRT 是否需要内部RT
 */
	_renderMainPass(context: RenderContext3D, viewport: Viewport, scene: Scene3D, shader: Shader3D, replacementTag: string, needInternalRT: boolean) {
		var gl: WebGLRenderingContext = WebXRExperienceHelper.glInstance;
		var renderTex: RenderTexture = this._internalRenderTexture;

		context.viewport = viewport;
		this._prepareCameraToRender();
		var multiLighting: boolean = Config3D._multiLighting;
		(multiLighting) && (Cluster.instance.update(this, <Scene3D>(scene)));
		scene._preCulling(context, this);

		if (renderTex && renderTex._isCameraTarget)//保证反转Y状态正确
			context.invertY = true;
		this._applyViewProject(context, this.viewMatrix, this._projectionMatrix);
		if (this.depthTextureMode != 0) {
			//TODO:是否可以不多次
			this._renderDepthMode(context);
		}
		(renderTex) && (renderTex._start());
		if ((renderTex as any).frameLoop != Scene3D._updateMark) {
			(renderTex as any).frameLoop = Scene3D._updateMark;
			//scene._clear(gl, context);
			this.clear(gl);
		}
		this._restoreView(gl);
		this._prepareCameraToRender();

		this._applyCommandBuffer(CameraEventFlags.BeforeForwardOpaque, context);
		scene._renderScene(context, ILaya3D.Scene3D.SCENERENDERFLAG_RENDERQPAQUE);
		this._applyCommandBuffer(CameraEventFlags.BeforeSkyBox, context);
		scene._renderScene(context, ILaya3D.Scene3D.SCENERENDERFLAG_SKYBOX);
		this._applyCommandBuffer(CameraEventFlags.BeforeTransparent, context);
		scene._renderScene(context, ILaya3D.Scene3D.SCENERENDERFLAG_RENDERTRANSPARENT);
		scene._componentDriver.callPostRender();//TODO:duo相机是否重复
		this._applyCommandBuffer(CameraEventFlags.BeforeImageEffect, context);
		(renderTex) && (renderTex._end());
		//PostProcess TODO
		// if (needInternalRT) {
		// 	if (this._postProcess && this._postProcess.enable) {
		// 		this._postProcess.commandContext = context;
		// 		this._postProcess._render();
		// 		this._postProcess._applyPostProcessCommandBuffers();
		// 	} else if (this._enableHDR || this._needBuiltInRenderTexture) {
		// 		var canvasWidth: number = this._getCanvasWidth(), canvasHeight: number = this._getCanvasHeight();
		// 		if (this._offScreenRenderTexture) {
		// 			this._screenOffsetScale.setValue(viewport.x / canvasWidth, viewport.y / canvasHeight, viewport.width / canvasWidth, viewport.height / canvasHeight);
		// 			this._internalCommandBuffer._camera = this;
		// 			this._internalCommandBuffer._context = context;
		// 			this._internalCommandBuffer.blitScreenQuad(this._internalRenderTexture, this._offScreenRenderTexture, this._screenOffsetScale, null, null, 0, true);
		// 			this._internalCommandBuffer._apply();
		// 			this._internalCommandBuffer.clear();
		// 		}
		// 	}
		// 	RenderTexture.bindCanvasRender = this._internalRenderTexture;
		// 	//RenderTexture.recoverToPool(this._internalRenderTexture);
		// } else {
		// 	RenderTexture.bindCanvasRender = null;
		// }
		this._applyCommandBuffer(CameraEventFlags.AfterEveryThing, context);
	}

	/**
	 * null function
	 */
	protected _calculateProjectionMatrix(): void {
	}

	/**
	 * @internal
	 */
	clear(gl: WebGLRenderingContext) {
		gl.viewport(0, 0, this._clientWidth, this._clientHeight);
		gl.scissor(0, 0, this._clientWidth, this._clientHeight);
		gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
		RenderStateContext.setDepthMask(true);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	/**
	 * destroy
	 */
	destroy() {
		super.destroy(true);
	}
}


