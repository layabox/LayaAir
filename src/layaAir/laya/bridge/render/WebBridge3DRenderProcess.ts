
import { Config3D } from "../../../Config3D";
import { BaseCamera } from "../../d3/core/BaseCamera";
import { Camera } from "../../d3/core/Camera";
import { ShadowMode } from "../../d3/core/light/ShadowMode";
import { ShadowMapFormat, ShadowUtils } from "../../d3/core/light/ShadowUtils";
import { Scene3D } from "../../d3/core/scene/Scene3D";
import { Cluster } from "../../d3/graphics/renderPath/Cluster";
import { ShadowCasterPass } from "../../d3/shadowMap/ShadowCasterPass";
import { Color } from "../../maths/Color";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector4 } from "../../maths/Vector4";
import { Viewport } from "../../maths/Viewport";
import { IRenderContext2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderContext3D } from "../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ISceneRenderManager } from "../../RenderDriver/DriverDesign/3DRenderPass/ISceneRenderManager";
import { WebDirectLight } from "../../RenderDriver/RenderModuleData/WebModuleData/3D/WebDirectLight";
import { WebCameraNodeData } from "../../RenderDriver/RenderModuleData/WebModuleData/3D/WebModuleData";
import { WebBaseSpotRP } from "../../RenderDriver/RenderModuleData/WebModuleData/3D/WebShadowRP/WebBaseSpotRP";
import { WebDirCascadeShadowRP } from "../../RenderDriver/RenderModuleData/WebModuleData/3D/WebShadowRP/WebDirCascadeShadowRP";
import { WebSpotLight } from "../../RenderDriver/RenderModuleData/WebModuleData/3D/WebSpotLight";
import type { WebRenderStruct2D } from "../../RenderDriver/RenderModuleData/WebModuleData/2D/WebRenderStruct2D";
import { RenderClearFlag } from "../../RenderEngine/RenderEnum/RenderClearFlag";
import { RenderContext3D } from "../../d3/core/render/RenderContext3D";
import { RenderTexture } from "../../resource/RenderTexture";
import { RenderState2D } from "../../webgl/utils/RenderState2D";
import { ShaderDefines2D } from "../../webgl/shader/d2/ShaderDefines2D";
import { IBridgeRenderElement } from "../Bridge3DSprite";
import { Bridge3DCamera } from "../Bridge3DCamera";
import { Bridge3DContext } from "./Bridge3DContext";
import { Bridge3DRenderElement } from "./Bridge3DRenderElement";
import { IBridge3DRenderProcess } from "./IBridge3DRenderProcess";
import type { Bridge3DScene3D } from "../Bridge3DScene3D";

/**
 * WebBridge3DRenderProcess - Web端Bridge3D统一渲染流程
 *
 * 遵循 WebRender3DProcess 的架构，统一管理阴影和前向渲染:
 *   renderShadows (阴影阶段) + render → initBridge3DRenderPass → prepareProjectionCorrection → renderBridge3DForward (前向阶段)
 */
export class WebBridge3DRenderProcess implements IBridge3DRenderProcess {

    // ===== 阴影渲染 (从 WebShadowOnlyProcess 合并) =====

    /** 方向光阴影渲染管线 */
    private _dirShadowRP: WebDirCascadeShadowRP;

    /** 聚光灯阴影渲染管线 */
    private _spotShadowRP: WebBaseSpotRP;

    /** 默认阴影贴图（1x1占位） */
    private _defaultShadowMap: RenderTexture;

    /** 场景渲染管理器引用 */
    render3DManager: ISceneRenderManager;

    /** 已注册的 Bridge3D 渲染元素列表（注册时加入，避免每帧遍历 bridge3DList） */
    private _bridgeElements: IBridgeRenderElement[] = [];

    // ===== 前向渲染阶段间共享状态 =====

    private _rt2d: any = null;
    private _cachedInvertY: boolean = false;
    private _rtW: number = 0;
    private _rtH: number = 0;
    private _vpW: number = 0;
    private _vpH: number = 0;

    private _hasInvertMatrix: boolean = false;
    private _invA: number = 1;
    private _invB: number = 0;
    private _invC: number = 0;
    private _invD: number = 1;
    private _invTx: number = 0;
    private _invTy: number = 0;

    private _projCorrected: boolean = false;
    private _hasShaderClip: boolean = false;
    private _hasGammaCorrect: boolean = false;

    // ===== 静态临时对象 (避免每帧分配) =====

    private static _tempViewport: Viewport = new Viewport(0, 0, 0, 0);
    private static _tempScissor: Vector4 = new Vector4(0, 0, 0, 0);
    private static _savedProjMatrix: Matrix4x4 = new Matrix4x4();
    private static _savedProjViewMatrix: Matrix4x4 = new Matrix4x4();
    private static _sceneCorrectionMatrix: Matrix4x4 = new Matrix4x4();
    private static _combinedCorrectionMatrix: Matrix4x4 = new Matrix4x4();

    constructor() {
        this._defaultShadowMap = ShadowUtils.getTemporaryShadowTexture(1, 1, ShadowMapFormat.bit16);
        this._dirShadowRP = new WebDirCascadeShadowRP();
        this._spotShadowRP = new WebBaseSpotRP();
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
     * 统一渲染入口（对标 WebRender3DProcess.fowardRender）
     * 由 Bridge3DCamera.render() 调用，编排完整流程：
     *   1. Bridge3D context 准备
     *   2. 元素收集（直接遍历已注册的元素列表）
     *   3. 阴影渲染（条件）
     */
    fowardRender(context3d: IRenderContext3D, camera: Camera): void {
        const scene = camera._scene as Bridge3DScene3D;
        if (!scene) return;

        // 1. Bridge3D context 准备
        const bridge3DContext = scene.bridge3DContext as Bridge3DContext;
        bridge3DContext.updateFromCamera(camera);
        bridge3DContext.applyToContext(context3d);
        context3d.preDrawUniformMaps.add("Scene3D");
        context3d.preDrawUniformMaps.add("Global");

        // 2. 阴影渲染（条件：有注册元素 + 有灯光）
        // collectElements 延后到每个 element 的 _render() 中按需执行
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
     *
     * 对应 WebRender3DProcess._renderForwardAddCameraPass() 中的阴影部分
     */
    renderShadows(context: IRenderContext3D, camera: Camera): void {
        const scene = camera._scene as Scene3D;

        if (!scene) {
            return;
        }

        // 更新光照集群
        if (Config3D._multiLighting) {
            Cluster.instance.update(camera, scene);
        }

        // 检查阴影更新频率
        const enableShadow = (Scene3D._updateMark % scene._ShadowMapupdateFrequency === 0);
        if (!enableShadow) {
            return;
        }

        // 添加 Shadow uniform map
        context.preDrawUniformMaps.add("Shadow");

        context.sceneData.setTexture(ShadowCasterPass.SHADOW_SPOTMAP, this._defaultShadowMap);

        // 渲染方向光阴影
        const mainDirLight = scene._mainDirectionLight;
        const needDirectionShadow = mainDirLight && mainDirLight.shadowMode !== ShadowMode.None;

        if (needDirectionShadow) {
            this._dirShadowRP.setRPData(
                mainDirLight._dataModule as WebDirectLight,
                camera._renderDataModule as WebCameraNodeData,
                context
            );
            this._dirShadowRP.setCameraCullInfo(this.render3DManager);
            this._dirShadowRP.update(context);
            this._dirShadowRP.render(context, this.render3DManager);
            this._dirShadowRP.useRPResource(context);
        } else {
            this._dirShadowRP.unuseRPResource(context);
        }

        // 渲染聚光灯阴影
        const mainSpotLight = scene._mainSpotLight;
        const needSpotShadow = mainSpotLight && mainSpotLight.shadowMode !== ShadowMode.None;

        if (needSpotShadow) {
            this._spotShadowRP.setRPData(
                mainSpotLight._dataModule as WebSpotLight,
                context
            );
            this._spotShadowRP.setCameraCullInfo(this.render3DManager);
            this._spotShadowRP.update(context);
            this._spotShadowRP.render(context, this.render3DManager);
            this._spotShadowRP.useRPResource(context);
        } else {
            this._spotShadowRP.unuseRPResource(context);
        }

        // 如果没有任何阴影，移除 Shadow uniform map
        if (!needDirectionShadow && !needSpotShadow) {
            context.preDrawUniformMaps.delete("Shadow");
        }

        context.setRenderTarget(null, RenderClearFlag.Nothing);
    }

    // ==================== 前向渲染阶段 ====================

    /**
     * 阶段1: 初始化渲染Pass
     */
    initBridge3DRenderPass(element: IBridgeRenderElement, context2d: IRenderContext2D, context3d: IRenderContext3D): void {
        const bridge3DElement = element as Bridge3DRenderElement;
        const bridge3DContext = bridge3DElement.bridge3DContext;

        // ===== 1. 获取2D当前RT =====
        this._rt2d = context2d.getRenderTarget();
        this._cachedInvertY = context2d.invertY;

        // 获取RT尺寸和viewport尺寸
        this._vpW = RenderState2D.width;
        this._vpH = RenderState2D.height;

        if (this._rt2d) {
            this._rtW = this._rt2d._textures[0].width;
            this._rtH = this._rt2d._textures[0].height;
        } else {
            this._rtW = this._vpW;
            this._rtH = this._vpH;
        }

        // ===== 2. 获取逆矩阵 =====
        this._hasInvertMatrix = false;
        this._invA = 1; this._invB = 0; this._invC = 0;
        this._invD = 1; this._invTx = 0; this._invTy = 0;

        if (this._rt2d) {
            const passData = context2d.passData;
            if (passData) {
                const mat0 = passData.getVector3(ShaderDefines2D.UNIFORM_INVERTMAT_0);
                const mat1 = passData.getVector3(ShaderDefines2D.UNIFORM_INVERTMAT_1);
                if (mat0 && mat1) {
                    this._invA = mat0.x;   // a
                    this._invC = mat0.y;   // c
                    this._invTx = mat0.z;  // tx
                    this._invB = mat1.x;   // b
                    this._invD = mat1.y;   // d
                    this._invTy = mat1.z;  // ty
                    this._hasInvertMatrix = true;
                }
            }
        }

        // ===== 3. 应用Bridge3D基础上下文参数 =====
        bridge3DContext.applyToContext(context3d);

        // ===== 4. 设置3D渲染目标为2D当前RT =====
        const clearFlag = bridge3DContext.clearDepthBeforeRender
            ? RenderClearFlag.Depth | RenderClearFlag.Stencil
            : RenderClearFlag.Nothing;
        context3d.setRenderTarget(this._rt2d, clearFlag);

        context3d.pipelineMode = context2d.pipelineMode;

        // ===== 4b. Gamma correction: 输出到屏幕或 gamma-space RT 时启用 =====
        this._hasGammaCorrect = false;
        const cameraData = bridge3DContext.cameraData;
        if (!this._rt2d || this._rt2d._textures[0].gammaCorrection !== 1) {
            cameraData.addDefine(RenderContext3D.GammaCorrect);
            this._hasGammaCorrect = true;
        } else {
            cameraData.removeDefine(RenderContext3D.GammaCorrect);
        }

        // ===== 5. 设置viewport和scissor为RT尺寸 =====
        if (this._rt2d) {
            const tempVP = WebBridge3DRenderProcess._tempViewport;
            tempVP.x = 0;
            tempVP.y = 0;
            tempVP.width = this._rtW;
            tempVP.height = this._rtH;
            context3d.setViewPort(tempVP);

            const tempSC = WebBridge3DRenderProcess._tempScissor;
            tempSC.setValue(0, 0, this._rtW, this._rtH);
            context3d.setScissor(tempSC);
        }
    }

    /**
     * 阶段2: 投影校正准备
     */
    prepareProjectionCorrection(element: IBridgeRenderElement, context2d: IRenderContext2D, context3d: IRenderContext3D): void {
        const bridge3DElement = element as Bridge3DRenderElement;
        const bridge3DContext = bridge3DElement.bridge3DContext;

        // ===== 6. 投影校正 =====
        // Bridge3D camera works in Scene-local pixels. A clip-space correction matrix maps
        // Scene NDC to the current 2D render target NDC, so Scene global transform is applied
        // at the final projection/uniform stage instead of being baked into the 3D view matrix.
        this._projCorrected = false;
        const cameraData = bridge3DContext.cameraData;

        // 保存原始投影矩阵
        const origProj = cameraData.getMatrix4x4(BaseCamera.PROJECTMATRIX);
        const origProjView = cameraData.getMatrix4x4(BaseCamera.VIEWPROJECTMATRIX);

        if (origProj && origProjView) {
            origProj.cloneTo(WebBridge3DRenderProcess._savedProjMatrix);
            origProjView.cloneTo(WebBridge3DRenderProcess._savedProjViewMatrix);

            const sceneCorrection = WebBridge3DRenderProcess._sceneCorrectionMatrix;
            this._computeSceneCorrectionMatrix(bridge3DContext, sceneCorrection);

            let correctionMatrix = sceneCorrection;
            if (this._hasInvertMatrix) {
                // 设置逆矩阵到context并计算校正矩阵
                bridge3DContext.setInvertMatrix(this._invA, this._invB, this._invC, this._invD, this._invTx, this._invTy);
                const corrMat = Bridge3DContext._correctionMatrix;
                bridge3DContext.computeCorrectionMatrix(this._vpW, this._vpH, this._rtW, this._rtH, corrMat);

                correctionMatrix = WebBridge3DRenderProcess._combinedCorrectionMatrix;
                Matrix4x4.multiply(corrMat, sceneCorrection, correctionMatrix);
            }

            // correctedProj = M_corr × projectionMatrix
            const correctedProj = Bridge3DContext._tempCorrectedProj;
            Matrix4x4.multiply(correctionMatrix, origProj, correctedProj);

            // correctedProjView = M_corr × projectionViewMatrix
            const correctedProjView = Bridge3DContext._tempCorrectedProjView;
            Matrix4x4.multiply(correctionMatrix, origProjView, correctedProjView);

            // 临时修改camera shader data
            cameraData.setMatrix4x4(BaseCamera.PROJECTMATRIX, correctedProj);
            cameraData.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, correctedProjView);

            this._projCorrected = true;
        }

        // ===== 7. Fragment shader clip =====
        this._hasShaderClip = false;
        const ownerStruct = bridge3DElement.owner as WebRenderStruct2D;
        if (ownerStruct && typeof ownerStruct.getClipInfo === 'function') {
            if (ownerStruct.hasClip()) {
                const info = ownerStruct.getClipInfo();
                const clipReuse =
                    bridge3DElement._clipCacheValid &&
                    bridge3DElement._cachedClipUpdateFrame === info._updateFrame &&
                    bridge3DElement._cachedRtH === this._rtH &&
                    bridge3DElement._cachedPassData === context2d.passData;

                if (!clipReuse) {
                    const clipDir = info.clipMatDir;
                    const clipPos = info.clipMatPos;
                    bridge3DElement._cachedRtClipPos.x = this._invA * clipPos.x + this._invC * clipPos.y + this._invTx;
                    bridge3DElement._cachedRtClipPos.y = this._invB * clipPos.x + this._invD * clipPos.y + this._invTy;
                    bridge3DElement._cachedRtClipPos.z = this._rtH;
                    bridge3DElement._cachedRtClipPos.w = 0;
                    bridge3DElement._cachedRtClipDir.x = this._invA * clipDir.x + this._invC * clipDir.y;
                    bridge3DElement._cachedRtClipDir.y = this._invB * clipDir.x + this._invD * clipDir.y;
                    bridge3DElement._cachedRtClipDir.z = this._invA * clipDir.z + this._invC * clipDir.w;
                    bridge3DElement._cachedRtClipDir.w = this._invB * clipDir.z + this._invD * clipDir.w;
                    bridge3DElement._cachedClipUpdateFrame = info._updateFrame;
                    bridge3DElement._cachedRtH = this._rtH;
                    bridge3DElement._cachedPassData = context2d.passData;
                    bridge3DElement._clipCacheValid = true;
                }

                const cameraData = bridge3DContext.cameraData;
                cameraData.addDefine(Bridge3DCamera.BRIDGE3D_CLIP);
                cameraData.setVector(Bridge3DCamera.BRIDGE3D_CLIPDIR, bridge3DElement._cachedRtClipDir);
                cameraData.setVector(Bridge3DCamera.BRIDGE3D_CLIPPOS, bridge3DElement._cachedRtClipPos);
                this._hasShaderClip = true;
            } else {
                bridge3DElement._clipCacheValid = false;
            }
        } else {
            bridge3DElement._clipCacheValid = false;
        }
    }

    private _computeSceneCorrectionMatrix(bridge3DContext: Bridge3DContext, out: Matrix4x4): void {
        const sceneW = bridge3DContext.bridgePlaneWidth;
        const sceneH = bridge3DContext.bridgePlaneHeight;
        const stageW = this._vpW || this._rtW || 1;
        const stageH = this._vpH || this._rtH || 1;
        const src = bridge3DContext.sceneOffsetMatrix.elements;
        const e = out.elements;

        const a = src[0], b = src[1], c = src[4], d = src[5], tx = src[12], ty = src[13];

        e[0] = a * sceneW / stageW;
        e[1] = b * sceneW / stageH;
        e[2] = 0;
        e[3] = 0;
        e[4] = c * sceneH / stageW;
        e[5] = d * sceneH / stageH;
        e[6] = 0;
        e[7] = 0;
        e[8] = 0;
        e[9] = 0;
        e[10] = 1;
        e[11] = 0;
        e[12] = (a * sceneW + c * sceneH + 2 * tx) / stageW - 1;
        e[13] = (b * sceneW + d * sceneH + 2 * ty) / stageH - 1;
        e[14] = 0;
        e[15] = 1;
    }

    /**
     * 阶段3: 执行前向渲染
     */
    renderBridge3DForward(element: IBridgeRenderElement, context2d: IRenderContext2D, context3d: IRenderContext3D): void {
        const bridge3DElement = element as Bridge3DRenderElement;
        const bridge3DContext = bridge3DElement.bridge3DContext;

        // ===== 8. 渲染3D内容 =====
        const opaqueList = bridge3DElement.getOpaqueList();
        const transparentList = bridge3DElement.getTransparentList();

        if (opaqueList.elements.length > 0) {
            opaqueList.renderQueueOnly(context3d);
        }

        if (transparentList.elements.length > 0) {
            transparentList.renderQueueOnly(context3d);
        }

        // ===== 9. 恢复状态 =====
        // 恢复 gamma correction
        if (this._hasGammaCorrect) {
            bridge3DContext.cameraData.removeDefine(RenderContext3D.GammaCorrect);
        }

        // 恢复shader clip
        if (this._hasShaderClip) {
            const cameraData = bridge3DContext.cameraData;
            cameraData.removeDefine(Bridge3DCamera.BRIDGE3D_CLIP);
        }

        // 恢复投影矩阵
        if (this._projCorrected) {
            const cameraData = bridge3DContext.cameraData;
            cameraData.setMatrix4x4(BaseCamera.PROJECTMATRIX, WebBridge3DRenderProcess._savedProjMatrix);
            cameraData.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, WebBridge3DRenderProcess._savedProjViewMatrix);
        }

        // 恢复2D RT和invertY
        context2d.setRenderTarget(this._rt2d, false, Color.BLACK);
        context2d.invertY = this._cachedInvertY;
    }

    /**
     * 完整前向渲染流程
     */
    render(element: IBridgeRenderElement, context2d: IRenderContext2D, context3d: IRenderContext3D): void {
        // 阶段1: 初始化渲染Pass（内含 applyToContext，确保 context3d.sceneData 正确）
        this.initBridge3DRenderPass(element, context2d, context3d);

        // 在 applyToContext 之后收集元素，确保 _renderUpdatePre 使用正确的 sceneData
        const bridge3DElement = element as Bridge3DRenderElement;
        bridge3DElement.collectElements(context3d);

        // 空列表早退：恢复 2D RT 状态后返回
        if (bridge3DElement.getOpaqueList().elements.length === 0 && bridge3DElement.getTransparentList().elements.length === 0) {
            context2d.setRenderTarget(this._rt2d, false, Color.BLACK);
            context2d.invertY = this._cachedInvertY;
            return;
        }

        this.prepareProjectionCorrection(element, context2d, context3d);
        this.renderBridge3DForward(element, context2d, context3d);
    }

    destroy(): void {
        if (this._dirShadowRP) {
            this._dirShadowRP.destory();
            this._dirShadowRP = null;
        }

        if (this._spotShadowRP) {
            this._spotShadowRP.destory();
            this._spotShadowRP = null;
        }

        if (this._defaultShadowMap) {
            this._defaultShadowMap.destroy();
            this._defaultShadowMap = null;
        }

        this.render3DManager = null;
        this._rt2d = null;
    }
}
