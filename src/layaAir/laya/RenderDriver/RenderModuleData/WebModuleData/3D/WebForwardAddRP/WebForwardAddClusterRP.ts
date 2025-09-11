import { Camera } from "../../../../../d3/core/Camera";
import { CommandBuffer } from "../../../../../d3/core/render/command/CommandBuffer";
import { DepthPass } from "../../../../../d3/depthMap/DepthPass";
import { CameraCullInfo } from "../../../../../d3/shadowMap/ShadowSliceData";
import { LayaGL } from "../../../../../layagl/LayaGL";
import { StatElement } from "../../../../../layagl/StatisticsContext";
import { Color } from "../../../../../maths/Color";
import { Vector4 } from "../../../../../maths/Vector4";
import { Viewport } from "../../../../../maths/Viewport";
import { RenderClearFlag } from "../../../../../RenderEngine/RenderEnum/RenderClearFlag";
import { DepthTextureMode } from "../../../../../resource/RenderTexture";
import { Texture2D } from "../../../../../resource/Texture2D";
import { Browser } from "../../../../../utils/Browser";
import { FastSinglelist } from "../../../../../utils/SingletonList";
import { RenderCullUtil } from "../../../../DriverCommon/RenderCullUtil";
import { RenderListQueue } from "../../../../DriverCommon/RenderListQueue";
import { RenderPassUtil } from "../../../../DriverCommon/RenderPassUtil";
import { IMain3DRP, IRenderContext3D, PipelineMode } from "../../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { CullMode } from "../../../../DriverDesign/3DRenderPass/IBatchModuleAgent";
import { ISceneRenderManager } from "../../../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { InternalRenderTarget } from "../../../../DriverDesign/RenderDevice/InternalRenderTarget";
import { WebBaseRenderNode } from "../WebBaseRenderNode";

/**
 * render Main pass,Depth Pass
 */
export class WebForwardAddClusterRP implements IMain3DRP {

    protected _opaqueList: RenderListQueue;
    protected _transparent: RenderListQueue;
    protected _cameraCullInfo: CameraCullInfo;
    protected _zBufferParams: Vector4;
    protected _viewPort: Viewport;
    protected _scissor: Vector4;
    protected _defaultNormalDepthColor: Color;
    protected _camera: Camera;
    protected _clearColor: Color;


    private _beforeForwardCmds: CommandBuffer[];
    private _beforeSkyboxCmds: CommandBuffer[];
    private _beforeTransparentCmds: CommandBuffer[];

    pipelineMode: PipelineMode;
    depthPipelineMode: PipelineMode;
    depthNormalPipelineMode: PipelineMode
    depthTextureMode: DepthTextureMode;

    blitOpaqueBuffer: CommandBuffer;

    depthTarget: InternalRenderTarget;
    destTarget: InternalRenderTarget;
    depthNormalTarget: InternalRenderTarget;

    enableCMD: boolean;
    enableOpaque: boolean;
    enableTransparent: boolean;

    clearFlag: number;

    skyRenderNode: WebBaseRenderNode;

    public get camera(): Camera {
        return this._camera;
    }

    public set camera(value: Camera) {
        this._camera = value;
        this._setCameraCullInfo(this.camera);
    }


    public get clearColor(): Color {
        return this._clearColor;
    }

    public set clearColor(value: Color) {
        this._clearColor = value;
    }



    private _setCameraCullInfo(value: Camera): void {
        this._cameraCullInfo.position = value._transform.position;
        this._cameraCullInfo.cullingMask = value.cullingMask;
        this._cameraCullInfo.staticMask = value.staticMask;
        this._cameraCullInfo.boundFrustum = value.boundFrustum;
        this._cameraCullInfo.useOcclusionCulling = value.useOcclusionCulling;
    }

    protected _clearRenderList() {
        this._opaqueList.clear();
        this._transparent.clear();
    }

    setCameraCullInfo(sceneManager: ISceneRenderManager) {
        let agent = sceneManager.batchAgentList;
        for (var [key, value] of agent) {
            value.setCullCamera([this._cameraCullInfo])
        }
    }

    constructor() {
        this._opaqueList = new RenderListQueue(false);
        this._transparent = new RenderListQueue(true);
        this._cameraCullInfo = new CameraCullInfo();
        this._zBufferParams = new Vector4();
        this._scissor = new Vector4();
        this._viewPort = new Viewport();
        this._defaultNormalDepthColor = new Color(0.5, 0.5, 1.0, 0.0);
        this._clearColor = new Color();
        this.blitOpaqueBuffer = new CommandBuffer();
        this.depthPipelineMode = "ShadowCaster";
        this.depthNormalPipelineMode = "DepthNormal";
    }

    setViewPort(value: Viewport) {
        value.cloneTo(this._viewPort);
    }

    setScissor(value: Vector4) {
        value.cloneTo(this._scissor);
    }

    /**
     * 设置渲染命令（前向渲染之前）
     * @param value 
     */
    setBeforeForwardCmds(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this._beforeForwardCmds = value;
            value.forEach(element => element._apply(false));
        }
    }

    /**
     * 设置渲染命令（天空渲染之前）
     * @param value 
     */
    setBeforeSkyboxCmds(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this._beforeSkyboxCmds = value;
            value.forEach(element => element._apply(false));
        }
    }

    /**
     * 设置渲染命令（透明物体渲染之前）
     * @param value 
     */
    setBeforeTransparentCmds(value: CommandBuffer[]): void {
        if (value && value.length > 0) {
            this._beforeTransparentCmds = value;
            value.forEach(element => element._apply(false));
        }
    }

    render(context: IRenderContext3D, renderManager: ISceneRenderManager): void {
        context.cameraUpdateMask++;
        this._clearRenderList();

        var time = Browser.now();//T_CameraMainCull Stat
        let _list = renderManager.baseRenderList as FastSinglelist<WebBaseRenderNode>;
        RenderCullUtil.cullByCameraCullInfo(this._cameraCullInfo, _list.elements, _list.length, this._opaqueList, this._transparent, context)

        let agent = renderManager.batchAgentList;
        for (var [key, agentModule] of agent) {
            let agentrenderList = agentModule.appendRenderElement(CullMode.Camera, 0, context);
            let opaqueList = agentrenderList.opaqueList;
            let translist = agentrenderList.transparentList;
            let element = opaqueList.elements;
            for (var jj = 0; jj < opaqueList.length; jj++) {
                this._opaqueList.addRenderElement(element[jj]);
            }
            element = translist.elements;
            for (var jj = 0; jj < translist.length; jj++) {
                this._transparent.addRenderElement(element[jj]);
            }
        }
        LayaGL.statAgent.recordTimeData(StatElement.T_CullMain, Browser.now() - time);

        time = Browser.now();
        if ((this.depthTextureMode & DepthTextureMode.Depth) != 0)
            this._renderDepthPass(context);
        if ((this.depthTextureMode & DepthTextureMode.DepthNormals) != 0)
            this._renderDepthNormalPass(context);
        LayaGL.statAgent.recordTimeData(StatElement.T_DepthPass, Browser.now() - time);

        time = Browser.now();
        this._mainPass(context);
        LayaGL.statAgent.recordTimeData(StatElement.T_3DMainPass, Browser.now() - time);
    }


    /**
     * 渲染法线深度流程
     * @param context 
     */
    protected _renderDepthNormalPass(context: IRenderContext3D): void {
        context.pipelineMode = this.depthNormalPipelineMode;

        this.camera._shaderValues.setTexture(DepthPass.DEPTHNORMALSTEXTURE, Texture2D.blackTexture);

        //传入shader该传的值
        const viewport = this._viewPort;
        Viewport.TEMP.set(viewport.x, viewport.y, viewport.width, viewport.height);
        Vector4.TEMP.setValue(viewport.x, viewport.y, viewport.width, viewport.height);
        context.setViewPort(Viewport.TEMP);
        context.setScissor(Vector4.TEMP);
        context.setClearData(RenderClearFlag.Color | RenderClearFlag.Depth, this._defaultNormalDepthColor, 1, 0);
        context.setRenderTarget(this.depthNormalTarget, RenderClearFlag.Color | RenderClearFlag.Depth);
        this._opaqueList.renderQueue(context);
        LayaGL.statAgent.recordCTData(StatElement.CT_DepthCastDrawCall, this._opaqueList.elements.length);
        Camera.depthPass._setupDepthModeShaderValue(DepthTextureMode.DepthNormals, this.camera);
    }

    /**
    * 渲染深度流程
    * @param context 
    */
    protected _renderDepthPass(context: IRenderContext3D): void {
        context.pipelineMode = this.depthPipelineMode;

        const viewport = this._viewPort;
        const shadervalue = context.sceneData;
        shadervalue.addDefine(DepthPass.DEPTHPASS);
        shadervalue.setVector(DepthPass.DEFINE_SHADOW_BIAS, Vector4.ZERO);
        Viewport.TEMP.set(viewport.x, viewport.y, viewport.width, viewport.height);
        Vector4.TEMP.setValue(viewport.x, viewport.y, viewport.width, viewport.height);
        context.setViewPort(Viewport.TEMP);
        context.setScissor(Vector4.TEMP);
        context.setRenderTarget(this.depthTarget, RenderClearFlag.Depth);
        context.setClearData(RenderClearFlag.Depth, Color.BLACK, 1, 0);
        this._opaqueList.renderQueue(context);
        LayaGL.statAgent.recordCTData(StatElement.CT_DepthCastDrawCall, this._opaqueList.elements.length);
        //渲染完后传入使用的参数
        const far = this.camera.farPlane;
        const near = this.camera.nearPlane;
        this._zBufferParams.setValue(1.0 - far / near, far / near, (near - far) / (near * far), 1 / near);
        context.cameraData.setVector(DepthPass.DEFINE_SHADOW_BIAS, DepthPass.SHADOW_BIAS);
        context.cameraData.setVector(DepthPass.DEPTHZBUFFERPARAMS, this._zBufferParams);

        Camera.depthPass._setupDepthModeShaderValue(DepthTextureMode.Depth, this.camera);

        shadervalue.removeDefine(DepthPass.DEPTHPASS);
    }

    protected _mainPass(context: IRenderContext3D) {
        context.pipelineMode = this.pipelineMode;
        RenderPassUtil.renderCmd(this._beforeForwardCmds, context);
        this._recoverRenderContext3D(context, this.destTarget);
        context.setClearData(this.clearFlag, this.clearColor, 1, 0);

        var time = Browser.now();//T_Render_OpaqueRender Stat
        this._opaqueList.renderQueue(context);
        LayaGL.statAgent.recordTimeData(StatElement.T_3DMainPass_Opaque, Browser.now() - time);//Stat

        RenderPassUtil.renderCmd(this._beforeSkyboxCmds, context);

        if (this.skyRenderNode) {
            const skyRenderElement = this.skyRenderNode.renderelements[0];
            if (skyRenderElement.subShader)
                context.drawRenderElementOne(skyRenderElement);
        }
        if (this.enableOpaque)
            this._opaqueTexturePass(context);

        RenderPassUtil.renderCmd(this._beforeTransparentCmds, context);
        this._recoverRenderContext3D(context, this.destTarget);
        time = Browser.now()//T_Render_TransparentRender Stat
        this._transparent.renderQueue(context);
        LayaGL.statAgent.recordTimeData(StatElement.T_3DMainPass_Trans, Browser.now() - time);//Stat
    }

    /**
    * 渲染不透明贴图流程
    */
    protected _opaqueTexturePass(context: IRenderContext3D) {
        let commanbuffer = this.blitOpaqueBuffer;
        commanbuffer._apply(false);
        context.runCMDList(commanbuffer._renderCMDs);
    }

    protected _recoverRenderContext3D(context: IRenderContext3D, renderTarget: InternalRenderTarget) {
        context.setViewPort(this._viewPort);
        context.setScissor(this._scissor);
        context.setRenderTarget(renderTarget, RenderClearFlag.Nothing);
    }


    destory() {

    }
}