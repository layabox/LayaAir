import { RenderClearFlag } from "../../../../RenderEngine/RenderEnum/RenderClearFlag";
import { InternalRenderTarget } from "../../../../RenderEngine/RenderInterface/InternalRenderTarget";
import { Color } from "../../../../maths/Color";
import { Vector4 } from "../../../../maths/Vector4";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { PipelineMode } from "../../../RenderDriverLayer/IRenderContext3D";
import { IBaseRenderNode } from "../../../RenderDriverLayer/Render3DNode/IBaseRenderNode";
import { DepthTextureMode, IForwardAddClusterRP } from "../../../RenderDriverLayer/Render3DProcess/IForwardAddClusterRP";
import { Camera } from "../../../core/Camera";
import { CommandBuffer } from "../../../core/render/command/CommandBuffer";
import { DepthPass } from "../../../depthMap/DepthPass";
import { Viewport } from "../../../math/Viewport";
import { CameraCullInfo } from "../../../shadowMap/ShadowSliceData";
import { GLESRenderContext3D } from "../GLESRenderContext3D";
import { GLESBaseRenderNode } from "../Render3DNode/GLESBaseRenderNode";
import { GLESCameraNodeData } from "../RenderModuleData/GLESModuleData";
import { GLESCullUtil } from "./GLESRenderUtil.ts/GLESCullUtil";
import { GLESRenderQueueList } from "./GLESRenderUtil.ts/GLESRenderListQueue";

export class GLESForwardAddClusterRP implements IForwardAddClusterRP {

    /** @internal*/
    static _context3DViewPortCatch: Viewport = new Viewport(0, 0, 0, 0);
    /** @internal*/
    static _contextScissorPortCatch: Vector4 = new Vector4(0, 0, 0, 0);
    /**@internal */
    cameraCullInfo: CameraCullInfo;
    /**@internal */
    beforeForwardCmds: Array<CommandBuffer>;
    /**@internal */
    beforeSkyboxCmds: Array<CommandBuffer>;
    /**@internal */
    beforeTransparentCmds: Array<CommandBuffer>;

    /**enable */
    enableOpaque: boolean;
    enableCMD: boolean;
    enableTransparent: boolean;

    /**@internal */
    destTarget: InternalRenderTarget;
    /**@internal */
    pipelineMode: PipelineMode;

    /**@internal */
    depthTarget: InternalRenderTarget;
    /**@internal */
    depthPipelineMode: PipelineMode;

    /**@internal */
    depthNormalTarget: InternalRenderTarget;
    /**@internal */
    depthNormalPipelineMode: PipelineMode

    /**@internal sky TODO*/
    skyRenderNode: IBaseRenderNode;
    /**@internal */
    depthTextureMode: DepthTextureMode;

    opaqueTexture: InternalRenderTarget;
    enableOpaqueTexture: boolean;

    clearColor: Color;
    clearFlag: number;

    /**@internal */
    camera: GLESCameraNodeData;

    private _viewPort: Viewport;
    setViewPort(value: Viewport) {
        value.cloneTo(this._viewPort);
    };

    private _scissor: Vector4;
    setScissor(value: Vector4) {
        value.cloneTo(this._scissor);
    }


    private opaqueList: GLESRenderQueueList;
    private transparent: GLESRenderQueueList;

    private _zBufferParams: Vector4;
    private _defaultNormalDepthColor;

    constructor() {
        this.opaqueList = new GLESRenderQueueList(false);
        this.transparent = new GLESRenderQueueList(true);
        this.cameraCullInfo = new CameraCullInfo();
        this._zBufferParams = new Vector4();
        this._scissor = new Vector4();
        this._viewPort = new Viewport();
        this._defaultNormalDepthColor = new Color(0.5, 0.5, 1.0, 0.0);
        this.clearColor = new Color();
    }

    setCameraCullInfo(value: Camera): void {
        this.cameraCullInfo.position = value._transform.position;
        this.cameraCullInfo.cullingMask = value.cullingMask;
        this.cameraCullInfo.staticMask = value.staticMask;
        this.cameraCullInfo.boundFrustum = value.boundFrustum;
        this.cameraCullInfo.useOcclusionCulling = value.useOcclusionCulling;
    }
    setBeforeForwardCmds(value: CommandBuffer[]): void {
        this.beforeForwardCmds = value;
    }
    setBeforeSkyboxCmds(value: CommandBuffer[]): void {
        this.beforeSkyboxCmds = value;
    }
    setBeforeTransparentCmds(value: CommandBuffer[]): void {
        this.beforeTransparentCmds = value;
    }

    /**
     * 渲染主流程（TODO:其他两个pass合并MulTargetRT）
     * @param context 
     * @param list 
     */
    render(context: GLESRenderContext3D, list: GLESBaseRenderNode[], count: number): void {
        Camera._updateMark++;
        this.opaqueList.clear();
        this.transparent.clear();
        //裁剪cull TODO 自定义
        GLESCullUtil.cullByCameraCullInfo(this.cameraCullInfo, list, count, this.opaqueList, this.transparent, context)
        //更新数据 TODO
        if ((this.depthTextureMode & DepthTextureMode.Depth) != 0) {
            this._renderDepthPass(context);
        }
        if ((this.depthTextureMode & DepthTextureMode.DepthNormals) != 0) {
            this._renderDepthNormalPass(context);
        }
        this._viewPort.cloneTo(GLESForwardAddClusterRP._context3DViewPortCatch);
        this._scissor.cloneTo(GLESForwardAddClusterRP._contextScissorPortCatch);
        this._mainPass(context);
    }

    /**
     * 渲染深度Pass
     * @param context 
     * @param list 
     */
    private _renderDepthPass(context: GLESRenderContext3D): void {
        context.pipelineMode = this.depthPipelineMode;
        var viewport = this._viewPort;
        var shadervalue = context.sceneData;
        shadervalue.addDefine(DepthPass.DEPTHPASS);
        shadervalue.setVector(DepthPass.DEFINE_SHADOW_BIAS, Vector4.ZERO);
        Viewport._tempViewport.set(viewport.x, viewport.y, viewport.width, viewport.height);
        Vector4.tempVec4.setValue(viewport.x, viewport.y, viewport.width, viewport.height);
        context.setViewPort(Viewport._tempViewport);
        context.setScissor(Vector4.tempVec4);
        context.setClearData(RenderClearFlag.Depth, Color.BLACK, 1, 0);
        context.setRenderTarget(this.depthTarget._renderTarget);
        this.opaqueList.renderQueue(context);
        //渲染完后传入使用的参数
        var far = this.camera.farplane;
        var near = this.camera.nearplane;
        this._zBufferParams.setValue(1.0 - far / near, far / near, (near - far) / (near * far), 1 / near);
        context.cameraData.setVector(DepthPass.DEFINE_SHADOW_BIAS, DepthPass.SHADOW_BIAS);
        context.cameraData.setTexture(DepthPass.DEPTHTEXTURE, this.depthTarget);
        context.cameraData.setVector(DepthPass.DEPTHZBUFFERPARAMS, this._zBufferParams);
        shadervalue.removeDefine(DepthPass.DEPTHPASS);
    }

    /**
     * 渲染法线深度Pass
     * @param context 
     * @param list 
     */
    private _renderDepthNormalPass(context: GLESRenderContext3D): void {
        context.pipelineMode = this.depthNormalPipelineMode;
        //传入shader该传的值
        var viewport = this._viewPort;
        Viewport._tempViewport.set(viewport.x, viewport.y, viewport.width, viewport.height);
        Vector4.tempVec4.setValue(viewport.x, viewport.y, viewport.width, viewport.height);
        context.setViewPort(Viewport._tempViewport);
        context.setScissor(Vector4.tempVec4);
        context.setClearData(RenderClearFlag.Color | RenderClearFlag.Depth, this._defaultNormalDepthColor, 1, 0);
        context.setRenderTarget(this.depthNormalTarget._renderTarget);
        this.opaqueList.renderQueue(context);
        context.cameraData.setTexture(DepthPass.DEPTHNORMALSTEXTURE, this.depthNormalTarget);
    }


    private opaqueTexturePass() {
        //TODO
        // var blit: BlitScreenQuadCMD = BlitScreenQuadCMD.create(currentTarget, this._opaqueTexture);
        // blit.setContext(renderContext);
        // blit.run();
        // blit.recover();
    }

    private _mainPass(context: GLESRenderContext3D): void {
        context.pipelineMode = this.pipelineMode;
        this._rendercmd(this.beforeForwardCmds, context);
        this._recoverRenderContext3D(context);
        context.setClearData(this.clearFlag, this.clearColor, 1, 0);
        this.enableOpaque && this.opaqueList.renderQueue(context);
        this._rendercmd(this.beforeSkyboxCmds, context);
        //context.drawRenderElementOne(this.skyRenderNode);
        if (this.enableOpaque) {
            this.opaqueTexturePass();
        }
        this._rendercmd(this.beforeTransparentCmds, context);
        this._recoverRenderContext3D(context);
        //this.transparent &&this.transparent.render;
    }

    private _rendercmd(cmds: Array<CommandBuffer>, context: GLESRenderContext3D) {
        if (!cmds || cmds.length == 0)
            return;
        cmds.forEach(function (value) {
            //value._context = context; cmd TODO
            value._apply();
        });
    }

    private _recoverRenderContext3D(context: GLESRenderContext3D) {
        const cacheViewPor = GLESForwardAddClusterRP._context3DViewPortCatch;
        const cacheScissor = GLESForwardAddClusterRP._contextScissorPortCatch;
        context.setViewPort(cacheViewPor);
        context.setScissor(cacheScissor);
        context.setRenderTarget(this.destTarget._renderTarget);
    }
}