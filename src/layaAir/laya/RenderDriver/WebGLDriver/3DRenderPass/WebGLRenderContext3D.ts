import { Config } from "../../../../Config";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { RenderPassStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { FastSinglelist } from "../../../utils/SingletonList";
import { Stat } from "../../../utils/Stat";
import { IRenderContext3D, PipelineMode } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { WebCameraNodeData, WebSceneNodeData } from "../../RenderModuleData/WebModuleData/3D/WebModuleData";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebGLCommandUniformMap } from "../RenderDevice/WebGLCommandUniformMap";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { WebGLRenderElement3D } from "./WebGLRenderElement3D";


export class WebGLRenderContext3D implements IRenderContext3D {
    //单例
    static _instance:WebGLRenderContext3D;
    /**
     * @internal 
    */
    _preDrawUniformMaps: Set<string>;

    /** @internal */
    _cacheGlobalDefines: WebDefineDatas = new WebDefineDatas();

    _globalConfigShaderData: WebDefineDatas;

    private _globalShaderData: WebGLShaderData;
    /**@internal */
    private _sceneData: WebGLShaderData;
    /**@internal */
    private _sceneModuleData: WebSceneNodeData;
    private _cameraModuleData: WebCameraNodeData;
    /**@internal */
    private _cameraData: WebGLShaderData;
    /**@internal */
    private _renderTarget: InternalRenderTarget;
    /**@internal */
    private _viewPort: Viewport;
    /**@internal */
    private _scissor: Vector4;
    /**@internal */
    private _sceneUpdataMask: number;
    /**@internal */
    private _cameraUpdateMask: number;
    /**@internal */
    private _pipelineMode: PipelineMode;
    /**@internal */
    private _invertY: boolean;
    /**@internal */
    private _clearFlag: number;
    /**@internal */
    private _clearColor: Color;
    /**@internal */
    private _clearDepth: number;
    /**@internal */
    private _clearStencil: number;
    /**@internal */
    private _needStart: boolean = true;


    get sceneData(): WebGLShaderData {
        return this._sceneData;
    }

    set sceneData(value: WebGLShaderData) {
        this._sceneData = value;
        if (this.sceneData) {
            let sceneMap = <WebGLCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap("Scene3D");
            this.sceneData.createUniformBuffer("Scene3D", sceneMap._idata);
        }
    }

    get cameraData(): WebGLShaderData {
        return this._cameraData;
    }

    set cameraData(value: WebGLShaderData) {
        this._cameraData = value;

        if (this.cameraData) {
            let cameraMap = <WebGLCommandUniformMap>LayaGL.renderDeviceFactory.createGlobalUniformMap("BaseCamera");
            this.cameraData.createUniformBuffer("BaseCamera", cameraMap._idata);
        }
    }

    get sceneModuleData(): WebSceneNodeData {
        return this._sceneModuleData;
    }

    set sceneModuleData(value: WebSceneNodeData) {
        this._sceneModuleData = value;
    }


    get cameraModuleData(): WebCameraNodeData {
        return this._cameraModuleData;
    }

    set cameraModuleData(value: WebCameraNodeData) {
        this._cameraModuleData = value;
    }

    get globalShaderData(): WebGLShaderData {
        return this._globalShaderData;
    }

    set globalShaderData(value: WebGLShaderData) {
        this._globalShaderData = value;
    }

    /**
     * @internal
     * @returns 
     */
    _getContextShaderDefines(): WebDefineDatas {
        return this._cacheGlobalDefines;
    }

    /**
     * @internal
     * 1. 更新 context shader defines string
     * 2. upload context shader data
     */
    _prepareContext(): void {
        let contextDef = this._cacheGlobalDefines;

        if (this.sceneData) {
            this.sceneData._defineDatas.cloneTo(contextDef);

            for (let key of this._preDrawUniformMaps) {
                this.sceneData.updateUBOBuffer(key);
            }
        }
        else {
            this._globalConfigShaderData.cloneTo(contextDef);
        }

        if (this.cameraData) {
            contextDef.addDefineDatas(this.cameraData._defineDatas);

            this.cameraData.updateUBOBuffer("BaseCamera");
        }
    }

    setRenderTarget(value: InternalRenderTarget, clearFlag: RenderClearFlag) {
        this._clearFlag = clearFlag;
        if (value == this._renderTarget)
            return;
        this._renderTarget = value;
        this._needStart = true;
    }

    setViewPort(value: Viewport) {
        this._viewPort = value;
        this._needStart = true;
    }

    setScissor(value: Vector4) {
        this._scissor = value;
        this._needStart = true;
    }


    get sceneUpdataMask(): number {
        return this._sceneUpdataMask;
    }

    set sceneUpdataMask(value: number) {
        this._sceneUpdataMask = value;
    }


    get cameraUpdateMask(): number {
        return this._cameraUpdateMask;
    }

    set cameraUpdateMask(value: number) {
        this._cameraUpdateMask = value;
    }


    get pipelineMode(): PipelineMode {
        return this._pipelineMode;
    }

    set pipelineMode(value: PipelineMode) {
        this._pipelineMode = value;
    }


    get invertY(): boolean {
        return this._invertY;
    }

    set invertY(value: boolean) {
        this._invertY = value;
    }



    /**
     * <code>GLESRenderContext3D<code/>
     */
    constructor() {
        this._clearColor = new Color();
        this._globalConfigShaderData = Shader3D._configDefineValues;
        this._preDrawUniformMaps = new Set<string>();
        this.cameraUpdateMask = 0;
        WebGLRenderContext3D._instance = this;
    }

    runOneCMD(cmd: IRenderCMD): void {
        cmd.apply(this);
    }

    runCMDList(cmds: IRenderCMD[]): void {
        cmds.forEach(element => {
            element.apply(this);
        });
    }

    setClearData(clearFlag: number, color: Color, depth: number, stencil: number): number {
        this._clearFlag = clearFlag;
        color.cloneTo(this._clearColor);
        this._clearDepth = depth;
        this._clearStencil = stencil;
        return 0;
    }

    drawRenderElementList(list: FastSinglelist<WebGLRenderElement3D>): number {
        if (this._needStart) {
            this._bindRenderTarget();
            this._start();
            this._needStart = false;
        }

        this._prepareContext();

        let elements = list.elements;
        for (var i: number = 0, n: number = list.length; i < n; i++) {
            elements[i]._preUpdatePre(this);//render
        }

        let bufferMgr = WebGLEngine.instance.bufferMgr;
        if (bufferMgr) {
            bufferMgr.upload();
        }

        for (var i: number = 0, n: number = list.length; i < n; i++) {
            elements[i]._render(this);//render
        }
        return 0;
    }

    drawRenderElementOne(node: WebGLRenderElement3D): number {
        if (this._needStart) {
            this._bindRenderTarget();
            this._start();
            this._needStart = false;
        }

        this._prepareContext();

        node._preUpdatePre(this);

        let bufferMgr = WebGLEngine.instance.bufferMgr;
        if (bufferMgr) {
            bufferMgr.upload();
        }
        node._render(this);
        return 0;
    }


    drawRenderElementList_StatUse(list: FastSinglelist<WebGLRenderElement3D>): number {
        if (this._needStart) {
            this._bindRenderTarget();
            this._start();
            this._needStart = false;
        }
        let elements = list.elements;
        for (var i: number = 0, n: number = list.length; i < n; i++) {
            elements[i]._preUpdatePre(this);//render
        }
        let bufferMgr = WebGLEngine.instance.bufferMgr;
        if (bufferMgr) {
            bufferMgr.upload();
        }
        for (var i: number = 0, n: number = list.length; i < n; i++) {
            var time = performance.now();//T_Render_CameraOtherDest Stat
            elements[i]._render(this);//render
            if (elements[i].owner) {
                switch (elements[i].owner.renderNodeType) {
                    case 0:
                        Stat.renderPassStatArray[RenderPassStatisticsInfo.T_OtherRender] += (performance.now() - time);//Stat
                        break;
                    case 1:
                        Stat.renderPassStatArray[RenderPassStatisticsInfo.T_OnlyMeshRender] += (performance.now() - time);//Stat
                        break;
                    case 2:
                        Stat.renderPassStatArray[RenderPassStatisticsInfo.T_OnlyShurikenParticleRender] += (performance.now() - time);//Stat
                        break;
                    case 9:
                        Stat.renderPassStatArray[RenderPassStatisticsInfo.T_OnlySkinnedMeshRender] += (performance.now() - time);//Stat
                        break;
                }
            }
        }
        return 0;
    }

    drawRenderElementOne_StatUse(node: WebGLRenderElement3D): number {
        if (this._needStart) {
            this._bindRenderTarget();
            this._start();
            this._needStart = false;
        }

        node._preUpdatePre(this);
        let bufferMgr = WebGLEngine.instance.bufferMgr;
        if (bufferMgr) {
            bufferMgr.upload();
        }
        var time = performance.now();//T_Render_CameraOtherDest Stat
        node._render(this);
        if (node.owner) {
            switch (node.owner.renderNodeType) {
                case 0:
                    Stat.renderPassStatArray[RenderPassStatisticsInfo.T_OtherRender] += (performance.now() - time);//Stat
                    break;
                case 1:
                    Stat.renderPassStatArray[RenderPassStatisticsInfo.T_OnlyMeshRender] += (performance.now() - time);//Stat
                    break;
                case 2:
                    Stat.renderPassStatArray[RenderPassStatisticsInfo.T_OnlyShurikenParticleRender] += (performance.now() - time);//Stat
                    break;
                case 9:
                    Stat.renderPassStatArray[RenderPassStatisticsInfo.T_OnlySkinnedMeshRender] += (performance.now() - time);//Stat
                    break;
            }
        }
        return 0;
    }

    private _bindRenderTarget() {
        if (this._renderTarget) {
            LayaGL.textureContext.bindRenderTarget(this._renderTarget);
        } else {
            LayaGL.textureContext.bindoutScreenTarget();
        }
    }

    private _start() {
        WebGLEngine.instance.scissorTest(true);
        WebGLEngine.instance.viewport(this._viewPort.x, this._viewPort.y, this._viewPort.width, this._viewPort.height);
        WebGLEngine.instance.scissor(this._viewPort.x, this._viewPort.y, this._viewPort.width, this._viewPort.height);
        if (this._clearFlag != RenderClearFlag.Nothing)
            WebGLEngine.instance.clearRenderTexture(this._clearFlag, this._clearColor, this._clearDepth, this._clearStencil);
        WebGLEngine.instance.scissor(this._scissor.x, this._scissor.y, this._scissor.z, this._scissor.w);
    }

}