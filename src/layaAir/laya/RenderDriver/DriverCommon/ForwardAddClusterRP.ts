import { Camera } from "../../d3/core/Camera";
import { CommandBuffer } from "../../d3/core/render/command/CommandBuffer";
import { DepthPass } from "../../d3/depthMap/DepthPass";
import { CameraCullInfo } from "../../d3/shadowMap/ShadowSliceData";
import { Color } from "../../maths/Color";
import { Vector4 } from "../../maths/Vector4";
import { RenderClearFlag } from "../../RenderEngine/RenderEnum/RenderClearFlag";
import { DepthTextureMode } from "../../resource/RenderTexture";
import { IRenderContext3D, PipelineMode } from "../DriverDesign/3DRenderPass/I3DRenderPass";
import { InternalRenderTarget } from "../DriverDesign/RenderDevice/InternalRenderTarget";
import { ICameraNodeData } from "../RenderModuleData/Design/3D/I3DRenderModuleData";
import { WebBaseRenderNode } from "../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { RenderCullUtil } from "./RenderCullUtil";
import { RenderPassUtil } from "./RenderPassUtil";
import { RenderListQueue } from "./RenderListQueue";
import { Viewport } from "../../maths/Viewport";

/**
 * 前向渲染流程通用类
 */
export class ForwardAddClusterRP {
    pipelineMode: PipelineMode;
    depthPipelineMode: PipelineMode;
    depthNormalPipelineMode: PipelineMode
    depthTarget: InternalRenderTarget;
    destTarget: InternalRenderTarget;
    camera: ICameraNodeData;
    cameraCullInfo: CameraCullInfo;
    depthTextureMode: DepthTextureMode;
    depthNormalTarget: InternalRenderTarget;
    beforeForwardCmds: CommandBuffer[];
    beforeSkyboxCmds: CommandBuffer[];
    beforeTransparentCmds: CommandBuffer[];
    skyRenderNode: WebBaseRenderNode;
    clearColor: Color;
    clearFlag: number;
    enableCMD: boolean;
    enableOpaque: boolean;
    enableTransparent: boolean;
    protected _opaqueList: RenderListQueue;
    protected _transparent: RenderListQueue;
    protected _zBufferParams: Vector4;
    protected _defaultNormalDepthColor: Color;

    protected _viewPort: Viewport;
    setViewPort(value: Viewport) {
        value.cloneTo(this._viewPort);
    }

    protected _scissor: Vector4;
    setScissor(value: Vector4) {
        value.cloneTo(this._scissor);
    }

    constructor() {
        this._opaqueList = new RenderListQueue(false);
        this._transparent = new RenderListQueue(true);
        this.cameraCullInfo = new CameraCullInfo();
        this._zBufferParams = new Vector4();
        this._scissor = new Vector4();
        this._viewPort = new Viewport();
        this._defaultNormalDepthColor = new Color(0.5, 0.5, 1, 0);
        this.clearColor = new Color();
        this.depthPipelineMode = "ShadowCaster";
        this.depthNormalPipelineMode = "DepthNormal";
    }

    /**
     * 设置相机裁剪信息
     * @param camera 
     */
    setCameraCullInfo(camera: Camera): void {
        this.cameraCullInfo.position = camera._transform.position;
        this.cameraCullInfo.cullingMask = camera.cullingMask;
        this.cameraCullInfo.staticMask = camera.staticMask;
        this.cameraCullInfo.boundFrustum = camera.boundFrustum;
        this.cameraCullInfo.useOcclusionCulling = camera.useOcclusionCulling;
    }

    /**
     * 设置渲染命令（前向渲染之前）
     * @param value 
     */
    setBeforeForwardCmds(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this.beforeForwardCmds = value;
            value.forEach(element => element._apply(false));
        }
    }

    /**
     * 设置渲染命令（天空渲染之前）
     * @param value 
     */
    setBeforeSkyboxCmds(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this.beforeSkyboxCmds = value;
            value.forEach(element => element._apply(false));
        }
    }

    /**
     * 设置渲染命令（透明物体渲染之前）
     * @param value 
     */
    setBeforeTransparentCmds(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this.beforeTransparentCmds = value;
            value.forEach(element => element._apply(false));
        }
    }

    /**
     * 渲染流程（TODO:其他两个pass合并MulTargetRT）
     * @param context 
     * @param list 
     * @param count 
     */
    render(context: IRenderContext3D, list: WebBaseRenderNode[], count: number): void {
        context.cameraUpdateMask++
        this._clearRenderList();
        RenderCullUtil.cullByCameraCullInfo(this.cameraCullInfo, list, count, this._opaqueList, this._transparent, context)
        if ((this.depthTextureMode & DepthTextureMode.Depth) != 0)
            this._renderDepthPass(context);
        if ((this.depthTextureMode & DepthTextureMode.DepthNormals) != 0)
            this._renderDepthNormalPass(context);
        this._cacheViewPortAndScissor();
        this._mainPass(context);

        this._opaqueList._batch.recoverData();
    }

    /**
     * 清除渲染队列
     */
    protected _clearRenderList() {
        this._opaqueList.clear();
        this._transparent.clear();
    }

    /**
     * 缓存视口和裁剪
     */
    protected _cacheViewPortAndScissor(): void {
        this._viewPort.cloneTo(RenderPassUtil.contextViewPortCache);
        this._scissor.cloneTo(RenderPassUtil.contextScissorCache);
    }

    /**
     * 渲染深度流程
     * @param context 
     */
    protected _renderDepthPass(context: IRenderContext3D,): void {
        context.pipelineMode = this.depthPipelineMode;
        const viewport = this._viewPort;
        const shadervalue = context.sceneData;
        shadervalue.addDefine(DepthPass.DEPTHPASS);
        shadervalue.setVector(DepthPass.DEFINE_SHADOW_BIAS, Vector4.ZERO);
        Viewport._tempViewport.set(viewport.x, viewport.y, viewport.width, viewport.height);
        Vector4.tempVec4.setValue(viewport.x, viewport.y, viewport.width, viewport.height);
        context.setViewPort(Viewport._tempViewport);
        context.setScissor(Vector4.tempVec4);
        context.setRenderTarget(this.depthTarget, RenderClearFlag.Depth);
        context.setClearData(RenderClearFlag.Depth, Color.BLACK, 1, 0);
        this._opaqueList.renderQueue(context);
        //渲染完后传入使用的参数
        const far = this.camera.farplane;
        const near = this.camera.nearplane;
        this._zBufferParams.setValue(1.0 - far / near, far / near, (near - far) / (near * far), 1 / near);
        context.cameraData.setVector(DepthPass.DEFINE_SHADOW_BIAS, DepthPass.SHADOW_BIAS);
        context.cameraData.setVector(DepthPass.DEPTHZBUFFERPARAMS, this._zBufferParams);
        shadervalue.removeDefine(DepthPass.DEPTHPASS);
    }

    /**
     * 渲染法线深度流程
     * @param context 
     */
    protected _renderDepthNormalPass(context: IRenderContext3D): void {
        context.pipelineMode = this.depthNormalPipelineMode;
        //传入shader该传的值
        const viewport = this._viewPort;
        Viewport._tempViewport.set(viewport.x, viewport.y, viewport.width, viewport.height);
        Vector4.tempVec4.setValue(viewport.x, viewport.y, viewport.width, viewport.height);
        context.setViewPort(Viewport._tempViewport);
        context.setScissor(Vector4.tempVec4);
        context.setClearData(RenderClearFlag.Color | RenderClearFlag.Depth, this._defaultNormalDepthColor, 1, 0);
        context.setRenderTarget(this.depthNormalTarget, RenderClearFlag.Color | RenderClearFlag.Depth);
        this._opaqueList.renderQueue(context);
    }

    /**
     * 主渲染流程
     * @param context 
     */
    protected _mainPass(context: IRenderContext3D): void {
        context.pipelineMode = this.pipelineMode;
        RenderPassUtil.renderCmd(this.beforeForwardCmds, context);
        RenderPassUtil.recoverRenderContext3D(context, this.destTarget);
        context.setClearData(this.clearFlag, this.clearColor, 1, 0);
        this.enableOpaque && this._opaqueList.renderQueue(context);
        RenderPassUtil.renderCmd(this.beforeSkyboxCmds, context);

        if (this.skyRenderNode) {
            const skyRenderElement = this.skyRenderNode.renderelements[0];
            if (skyRenderElement.subShader)
                context.drawRenderElementOne(skyRenderElement);
        }
        if (this.enableOpaque)
            this._opaqueTexturePass();
        RenderPassUtil.renderCmd(this.beforeTransparentCmds, context);
        RenderPassUtil.recoverRenderContext3D(context, this.destTarget);
        this._transparent.renderQueue(context);
    }

    /**
     * 渲染不透明贴图流程
     */
    protected _opaqueTexturePass() {
        // const blit = BlitScreenQuadCMD.create(currentTarget, this._opaqueTexture);
        // blit.setContext(renderContext);
        // blit.run();
        // blit.recover();
    }
}