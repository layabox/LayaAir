
import { Config3D } from "../../../Config3D";
import { Camera } from "../../d3/core/Camera";
import { ShadowMode } from "../../d3/core/light/ShadowMode";
import { ShadowMapFormat, ShadowUtils } from "../../d3/core/light/ShadowUtils";
import { Scene3D } from "../../d3/core/scene/Scene3D";
import { Cluster } from "../../d3/graphics/renderPath/Cluster";
import { IRenderContext2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderContext3D } from "../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ISceneRenderManager } from "../../RenderDriver/DriverDesign/3DRenderPass/ISceneRenderManager";
import { LayaXBaseSpotRP } from "../../RenderDriver/LayaXDriver/3DRenderPass/LayaXBaseSpotRP";
import { LayaXDirCascadeShadowRP } from "../../RenderDriver/LayaXDriver/3DRenderPass/LayaXDirCascadeShadowRP";
import { LayaXCameraNodeData } from "../../RenderDriver/LayaXDriver/RenderModuleData/LayaXCameraNodeData";
import { LayaXDirectLight } from "../../RenderDriver/LayaXDriver/RenderModuleData/LayaXDirectLight";
import { LayaXSpotLight } from "../../RenderDriver/LayaXDriver/RenderModuleData/LayaXSpotLight";
import { RenderTexture } from "../../resource/RenderTexture";
import { IBridgeRenderElement } from "../Bridge3DSprite";
import { LayaXBridge3DRenderElement } from "./LayaXBridge3DRenderElement";
import { IBridge3DRenderProcess } from "./IBridge3DRenderProcess";
import type { Bridge3DScene3D } from "../Bridge3DScene3D";
import { LayaXBridge3DContext } from "./LayaXBridge3DContext";

/**
 * LayaXBridge3DRenderProcess - LayaX (wgpu) native Bridge3D统一渲染流程
 *
 * 遵循 LayaXRender3DProcess 的模式：声明式属性配置 → 单次C++执行调用
 * 阴影阶段使用 LayaXDirCascadeShadowRP/LayaXBaseSpotRP (LayaX variants)
 * 前向阶段委托C++ conchLayaXBridge3DProcess 处理
 */
export class LayaXBridge3DRenderProcess implements IBridge3DRenderProcess {

	_nativeObj: any;

	// ===== 阴影渲染 (LayaX shadow passes) =====

	/** LayaX directional shadow render pass */
	private _dirShadowRP: LayaXDirCascadeShadowRP;

	/** LayaX spot shadow render pass */
	private _spotShadowRP: LayaXBaseSpotRP;

	/** 默认阴影贴图（1x1占位） */
	private _defaultShadowMap: RenderTexture;

	/** 场景渲染管理器 */
	private _render3DManager: ISceneRenderManager;
	get render3DManager(): ISceneRenderManager { return this._render3DManager; }
	set render3DManager(value: ISceneRenderManager) {
		this._render3DManager = value;
		this._nativeObj.renderManager = (value as any)._nativeObj;
	}

	/** 已注册的 Bridge3D 渲染元素列表 */
	private _bridgeElements: IBridgeRenderElement[] = [];

	constructor() {
		this._nativeObj = new (window as any).conchLayaXBridge3DProcess();
		this._dirShadowRP = new LayaXDirCascadeShadowRP();
		this._spotShadowRP = new LayaXBaseSpotRP();
		// Wire shadow passes to C++ (one-time, like LayaXForwardAddRP)
		this._nativeObj.setDirectLightShadowPass(this._dirShadowRP._nativeObj);
		this._nativeObj.setSpotLightShadowPass(this._spotShadowRP._nativeObj);
		this._defaultShadowMap = ShadowUtils.getTemporaryShadowTexture(1, 1, ShadowMapFormat.bit16);
		this._nativeObj.setDefaultShadowMap((this._defaultShadowMap._renderTarget as any)._nativeObj);
	}

	// ==================== 元素管理 ====================

	addBridgeElement(element: IBridgeRenderElement): void {
		this._bridgeElements.push(element);
	}

	removeBridgeElement(element: IBridgeRenderElement): void {
		const idx = this._bridgeElements.indexOf(element);
		if (idx !== -1) this._bridgeElements.splice(idx, 1);
	}

	// ==================== 统一渲染入口 ====================

	/**
	 * 统一渲染入口（对标 LayaXRender3DProcess.fowardRender）
	 * 由 Bridge3DCamera.render() 调用，编排完整流程：
	 *   1. syncProjection (同步相机参数到Rust ECS)
	 *   2. Bridge3D context 准备（单次 C++ 调用）
	 *   3. 元素 context3d 设置
	 *   4. 阴影渲染（条件）
	 */
	fowardRender(context3d: IRenderContext3D, camera: Camera): void {
		const scene = camera._scene as Bridge3DScene3D;
		if (!scene) return;

		// 1. Sync camera projection params to Rust ECS for culling
		// (matches LayaXRender3DProcess.initRenderpass line 60)
		(<LayaXCameraNodeData>camera._renderDataModule).syncProjection();

		// 2. Bridge3D context 准备（单次 C++ 调用）
		(scene.bridge3DContext as LayaXBridge3DContext).prepareForRender(camera, context3d);

		// 3. 将 context3d 传递给每个元素的 C++ 端，供 _render 时使用
		const nativeCtx3d = (context3d as any)._nativeObj;
		for (const element of this._bridgeElements) {
			(element as LayaXBridge3DRenderElement)._nativeObj.setContext3D(nativeCtx3d);
		}

		// 4. 阴影渲染（条件：有注册元素 + 有灯光）
		if (!scene.enableLight) return;
		if (this._bridgeElements.length === 0) return;

		scene._setCullCamera(camera);
		this.render3DManager = scene.sceneRenderableManager._sceneManagerOBJ;
		this.renderShadows(context3d, camera);
		scene.recaculateCullCamera();
	}

	// ==================== 阴影阶段 ====================

	/**
	 * 阴影渲染（由 fowardRender 内部调用）
	 * 遵循 LayaXRender3DProcess.initRenderpass 的声明式模式：
	 *   TS 端配置属性 → 单次 C++ renderShadows 执行
	 *
	 * 使用 LayaX shadow RP 类（LayaXDirCascadeShadowRP/LayaXBaseSpotRP）
	 * 和 LayaX uniform map 管理（conchLayaXRT3DRenderProcess._addPreDrawUniformMap）
	 */
	renderShadows(context: IRenderContext3D, camera: Camera): void {
		const scene = camera._scene as Scene3D;

		if (!scene) {
			return;
		}

		// 更新光照集群 (stays in TS, same as LayaXRender3DProcess)
		if (Config3D._multiLighting) {
			Cluster.instance.update(camera, scene);
		}

		// 检查阴影更新频率
		const enableShadow = (Scene3D._updateMark % scene._ShadowMapupdateFrequency === 0);
		this._nativeObj.shadowCastPass = enableShadow;

		if (!enableShadow) {
			// Remove shadow uniform map (matches LayaXRender3DProcess pattern)
			(window as any).conchLayaXRT3DRenderProcess._removePreDrawUniformMap("Shadow", (context as any)._nativeObj);
			context.preDrawUniformMaps = context.preDrawUniformMaps;
			return;
		}

		// 方向光阴影
		const mainDirLight = scene._mainDirectionLight;
		const needDirectionShadow = mainDirLight && mainDirLight.shadowMode !== ShadowMode.None;
		this._nativeObj.enableDirectLightShadow = needDirectionShadow;

		if (needDirectionShadow) {
			const dirLight = <LayaXDirectLight>mainDirLight._dataModule;
			const camData = <LayaXCameraNodeData>camera._renderDataModule;
			dirLight.syncShadow();
			this._dirShadowRP.setRPData(dirLight, camData, context);
			this._dirShadowRP.setCameraCullInfo(this._render3DManager);
		}

		// 聚光灯阴影
		const mainSpotLight = scene._mainSpotLight;
		const needSpotShadow = mainSpotLight && mainSpotLight.shadowMode !== ShadowMode.None;
		this._nativeObj.enableSpotLightShadowPass = needSpotShadow;

		if (needSpotShadow) {
			this._spotShadowRP.setRPData(
				<LayaXSpotLight>mainSpotLight._dataModule,
				context
			);
			this._spotShadowRP.setCameraCullInfo(this._render3DManager);
		}

		// uniform map 管理 (matches LayaXRender3DProcess.initRenderpass pattern)
		if (needDirectionShadow || needSpotShadow) {
			(window as any).conchLayaXRT3DRenderProcess._addPreDrawUniformMap("Shadow", (context as any)._nativeObj);
		} else {
			(window as any).conchLayaXRT3DRenderProcess._removePreDrawUniformMap("Shadow", (context as any)._nativeObj);
		}

		// Sync preDrawUniformMaps to C++ (same as LayaXRender3DProcess)
		context.preDrawUniformMaps = context.preDrawUniformMaps;

		// Single C++ execution call: handles shadow pass execution and render target reset
		this._nativeObj.renderShadows((context as any)._nativeObj);
	}

	// ==================== 前向渲染阶段 (委托C++) ====================

	/**
	 * 完整前向渲染流程 (单次C++调用)
	 * C++ 端执行 3-phase pipeline:
	 *   initBridge3DRenderPass → prepareProjectionCorrection → renderBridge3DForward
	 */
	render(element: IBridgeRenderElement, context2d: IRenderContext2D, context3d: IRenderContext3D): void {
		this._nativeObj.render(
			(element as LayaXBridge3DRenderElement)._nativeObj,
			(context2d as any)._nativeObj,
			(context3d as any)._nativeObj
		);
	}

	destroy(): void {
		if (this._dirShadowRP) {
			this._dirShadowRP.destroy();
			this._dirShadowRP = null;
		}

		if (this._spotShadowRP) {
			this._spotShadowRP.destroy();
			this._spotShadowRP = null;
		}

		if (this._defaultShadowMap) {
			this._defaultShadowMap.destroy();
			this._defaultShadowMap = null;
		}

		this._render3DManager = null;

		if (this._nativeObj) {
			this._nativeObj.destroy();
			this._nativeObj = null;
		}
	}
}
