import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { InternalRenderTarget } from "../../../RenderEngine/RenderInterface/InternalRenderTarget";
import { PipelineMode } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { RenderTexture } from "../../../resource/RenderTexture";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderContext3D } from "../../RenderDriverLayer/IRenderContext3D";
import { Viewport } from "../../math/Viewport";
import { RenderElementOBJ } from "../RenderObj/RenderElementOBJ";
import { GLESCameraNodeData, GLESSceneNodeData } from "./RenderModuleData/GLESOtherModuleData";


export class GLESRenderContext3D implements IRenderContext3D {
    private _globalShaderData: ShaderData;
    /**@internal */
    private _sceneData: ShaderData;
    /**@internal */
    private _sceneModuleData: GLESSceneNodeData;
    private _cameraModuleData: GLESCameraNodeData;
    /**@internal */
    private _cameraData: ShaderData;
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


    get sceneData(): ShaderData {
        return this._sceneData;
    }

    set sceneData(value: ShaderData) {
        this._sceneData = value;
    }


    get cameraData(): ShaderData {
        return this._cameraData;
    }

    set cameraData(value: ShaderData) {
        this._cameraData = value;
    }

    get sceneModuleData(): GLESSceneNodeData {
        return this._sceneModuleData;
    }

    set sceneModuleData(value: GLESSceneNodeData) {
        this._sceneModuleData = value;
    }


    get cameraModuleData(): GLESCameraNodeData {
        return this._cameraModuleData;
    }

    set cameraModuleData(value: GLESCameraNodeData) {
        this._cameraModuleData = value;
    }

    get globalShaderData(): ShaderData {
        return this._globalShaderData;
    }

    set globalShaderData(value: ShaderData) {
        this._globalShaderData = value;
    }

    setRenderTarget(value: InternalRenderTarget) {
        this._clearFlag = RenderClearFlag.Nothing;
        this._renderTarget = value;
    }

    set nativeRenderTarget(value: RenderTexture) {
        let nativecontext3D: any;
        nativecontext3D.set_renderTarget(value._renderTarget)
    }



    setViewPort(value: Viewport) {
        this._viewPort = value;
    }

    setScissor(value: Vector4) {
        this._scissor = value;
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
    }

    setClearData(clearFlag: number, color: Color, depth: number, stencil: number): number {
        this._clearFlag = clearFlag;
        color.cloneTo(this._clearColor);
        this._clearDepth = depth;
        this._clearStencil = stencil;
        return 0;
    }

    drawRenderElementList(list: SingletonList<RenderElementOBJ>): number {
        this._bindRenderTarget();
        this._start();
        let elements = list.elements;
        for (var i: number = 0, n: number = list.length; i < n; i++) {
            elements[i]._preUpdatePre(this);//render
        }
        for (var i: number = 0, n: number = list.length; i < n; i++) {
            elements[i]._render(this);//render
        }
        this._end();
        return 0;
    }

    drawRenderElementOne(node: RenderElementOBJ): number {
        this._bindRenderTarget();
        this._start();
        node._preUpdatePre(this);
        node._render(this);
        this._end();
        return 0;
    }

    private _bindRenderTarget() {
        this._renderTarget && LayaGL.textureContext.bindRenderTarget(this._renderTarget);;
    }

    private _start() {
        LayaGL.renderEngine.viewport(this._viewPort.x, this._viewPort.y, this._viewPort.width, this._viewPort.height);
        LayaGL.renderEngine.scissor(this._scissor.x, this._scissor.y, this._scissor.z, this._scissor.w);
        if (this._clearFlag != RenderClearFlag.Nothing)
            LayaGL.renderEngine.clearRenderTexture(this._clearFlag, this._clearColor, this._clearDepth, this._clearStencil);
    }

    private _end() {
        //TODO
    }
}