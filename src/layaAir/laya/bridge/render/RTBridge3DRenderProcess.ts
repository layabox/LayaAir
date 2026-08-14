
import { Config3D } from "../../../Config3D";
import { Camera } from "../../d3/core/Camera";
import { ShadowMode } from "../../d3/core/light/ShadowMode";
import { ShadowMapFormat, ShadowUtils } from "../../d3/core/light/ShadowUtils";
import { Scene3D } from "../../d3/core/scene/Scene3D";
import { Cluster } from "../../d3/graphics/renderPath/Cluster";
import { IRenderContext2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderContext3D } from "../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ISceneRenderManager } from "../../RenderDriver/DriverDesign/3DRenderPass/ISceneRenderManager";
import { RTBaseSpotRP } from "../../RenderDriver/RenderModuleData/RuntimeModuleData/3D/3DRenderProcess/RTBaseSpotRP";
import { RTDirCascadeShadowRP } from "../../RenderDriver/RenderModuleData/RuntimeModuleData/3D/3DRenderProcess/RTDirCascadeShadowRP";
import { RTCameraNodeData } from "../../RenderDriver/RenderModuleData/RuntimeModuleData/3D/RT3DRenderModuleData";
import { RTDirectLight } from "../../RenderDriver/RenderModuleData/RuntimeModuleData/3D/RTDirectLight";
import { RTSpotLight } from "../../RenderDriver/RenderModuleData/RuntimeModuleData/3D/RTSpotLight";
import { RenderTexture } from "../../resource/RenderTexture";
import { IBridgeRenderElement } from "../Bridge3DSprite";
import { RTBridge3DRenderElement } from "./RTBridge3DRenderElement";
import { IBridge3DRenderProcess } from "./IBridge3DRenderProcess";
import type { Bridge3DScene3D } from "../Bridge3DScene3D";
import { RTBridge3DContext } from "./RTBridge3DContext";
import { NativeMemory } from "../../RenderDriver/RenderModuleData/RuntimeModuleData/NativeMemory";

/** @internal conchGLESBridge3DRenderProcess 共享块槽位（与 C++ GLESBridge3DRenderProcess::Props 一致）。 */
const enum Bridge3DRenderProcessSlot {
    shadowCastPass = 0,
    enableDirectLightShadow = 1,
    enableSpotLightShadowPass = 2,
    Count = 3,
}

/**
 * RTBridge3DRenderProcess - Native端Bridge3D统一渲染流程
 *
 * 遵循 RTRender3DProcess 的模式：声明式属性配置 → 单次C++执行调用
 * 阴影阶段使用 RTDirCascadeShadowRP/RTBaseSpotRP
 * 前向阶段委托C++ conchGLESBridge3DRenderProcess 处理
 */
export class RTBridge3DRenderProcess implements IBridge3DRenderProcess {

    _nativeObj: any;

    // ===== 阴影渲染 =====

    /** Native directional shadow render pass */
    private _dirShadowRP: RTDirCascadeShadowRP;

    /** Native spot shadow render pass */
    private _spotShadowRP: RTBaseSpotRP;

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

    private _mem: NativeMemory;
    private _i32: Int32Array;

    constructor() {
        this._nativeObj = new (window as any).conchGLESBridge3DRenderProcess();
        this._mem = new NativeMemory(Bridge3DRenderProcessSlot.Count * 4, false);
        this._i32 = this._mem.int32Array;
        this._nativeObj.bindPropertyBuffer(this._mem._buffer);
        this._dirShadowRP = new RTDirCascadeShadowRP();
        this._spotShadowRP = new RTBaseSpotRP();
        // Wire shadow passes to C++ (one-time, like RTForwardAddRP)
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
     * 统一渲染入口（对标 RTRender3DProcess.fowardRender）
     * 由 Bridge3DCamera.render() 调用，编排完整流程：
     *   1. Bridge3D context 准备（单次 C++ 调用）
     *   2. 元素收集（直接遍历已注册的元素列表）
     *   3. 阴影渲染（条件）
     */
    fowardRender(context3d: IRenderContext3D, camera: Camera): void {
        const scene = camera._scene as Bridge3DScene3D;
        if (!scene) return;

        // 1. Bridge3D context 准备（单次 C++ 调用）
        (scene.bridge3DContext as RTBridge3DContext).prepareForRender(camera, context3d);

        // 2. 将 context3d 传递给每个元素的 C++ 端，供 _render 时使用
        const nativeCtx3d = (context3d as any)._nativeObj;
        for (const element of this._bridgeElements) {
            (element as RTBridge3DRenderElement)._nativeObj.setContext3D(nativeCtx3d);
        }

        // 3. 阴影渲染（条件：有注册元素 + 有灯光）
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
     * 遵循 RTRender3DProcess.initRenderpass 的声明式模式：
     *   TS 端配置属性 → 单次 C++ renderShadows 执行
     */
    renderShadows(context: IRenderContext3D, camera: Camera): void {
        const scene = camera._scene as Scene3D;

        if (!scene) {
            return;
        }

        // 更新光照集群 (stays in TS, same as RTRender3DProcess)
        if (Config3D._multiLighting) {
            Cluster.instance.update(camera, scene);
        }

        // 检查阴影更新频率
        const enableShadow = (Scene3D._updateMark % scene._ShadowMapupdateFrequency === 0);
        this._i32[Bridge3DRenderProcessSlot.shadowCastPass] = enableShadow ? 1 : 0;

        if (!enableShadow) {
            (window as any).conchRT3DRenderProcess._removePreDrawUniformMap("Shadow", (context as any)._nativeObj);
            context.preDrawUniformMaps = context.preDrawUniformMaps;
            return;
        }

        // 方向光阴影
        const mainDirLight = scene._mainDirectionLight;
        const needDirectionShadow = mainDirLight && mainDirLight.shadowMode !== ShadowMode.None;
        this._i32[Bridge3DRenderProcessSlot.enableDirectLightShadow] = needDirectionShadow ? 1 : 0;

        if (needDirectionShadow) {
            this._dirShadowRP.setRPData(
                mainDirLight._dataModule as RTDirectLight,
                camera._renderDataModule as RTCameraNodeData,
                context
            );
            this._dirShadowRP.setCameraCullInfo(this._render3DManager);
        }

        // 聚光灯阴影
        const mainSpotLight = scene._mainSpotLight;
        const needSpotShadow = mainSpotLight && mainSpotLight.shadowMode !== ShadowMode.None;
        this._i32[Bridge3DRenderProcessSlot.enableSpotLightShadowPass] = needSpotShadow ? 1 : 0;

        if (needSpotShadow) {
            this._spotShadowRP.setRPData(
                mainSpotLight._dataModule as RTSpotLight,
                context
            );
            this._spotShadowRP.setCameraCullInfo(this._render3DManager);
        }

        // uniform map 管理 (stays in TS, same as RTRender3DProcess)
        if (needDirectionShadow || needSpotShadow) {
            (window as any).conchRT3DRenderProcess._addPreDrawUniformMap("Shadow", (context as any)._nativeObj);
        } else {
            (window as any).conchRT3DRenderProcess._removePreDrawUniformMap("Shadow", (context as any)._nativeObj);
        }

        // Sync preDrawUniformMaps to C++ (same as RTRender3DProcess line 165)
        context.preDrawUniformMaps = context.preDrawUniformMaps;

        // Single C++ execution call: handles shadow pass execution and render target reset
        this._nativeObj.renderShadows((context as any)._nativeObj);
    }

    // ==================== 前向渲染阶段 (委托C++) ====================

    /**
     * 完整前向渲染流程 (单次C++调用)
     */
    render(element: IBridgeRenderElement, context2d: IRenderContext2D, context3d: IRenderContext3D): void {
        this._nativeObj.render(
            (element as RTBridge3DRenderElement)._nativeObj,
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
