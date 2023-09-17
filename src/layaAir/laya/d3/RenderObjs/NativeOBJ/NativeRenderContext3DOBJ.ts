
import { LayaGL } from "../../../layagl/LayaGL";
import { Vector4 } from "../../../maths/Vector4";
import { UploadMemoryManager } from "../../../RenderEngine/RenderEngine/NativeGLEngine/CommonMemory/UploadMemoryManager";
import { IRenderTarget } from "../../../RenderEngine/RenderInterface/IRenderTarget";
import { IRenderContext3D, PipelineMode } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { Viewport } from "../../math/Viewport";
import { NativeRenderElementOBJ } from "./NativeRenderElementOBJ";

export class NativeRenderContext3DOBJ implements IRenderContext3D {

    //dest Texture
    private _destTarget: IRenderTarget;

    //viewPort
    private _viewPort: Viewport;
    //scissor
    private _scissor: Vector4;

    private _confifShaderData: ShaderData;
    //Camera Shader Data
    private _cameraShaderData: ShaderData;
    //scene Shader Data
    private _sceneShaderData: ShaderData;
    //Global ShaderData
    private _globalShaderData: ShaderData;
	
    private _nativeObj: any;

    constructor() {
        this._viewPort = new Viewport(0, 0, 0, 0);
        this._scissor = new Vector4();
        this._nativeObj = new (window as any).conchRenderContext3D((LayaGL.renderEngine as any)._nativeObj);
		this.pipelineMode = "Forward";
    }
    end(): void {
        //TODO
    }
    drawRenderElement(renderelemt: NativeRenderElementOBJ): void {
        renderelemt._render(this);
    }

    /**设置IRenderContext */
    applyContext(cameraUpdateMark: number): void {
        this._nativeObj.changeViewport(this._viewPort.x, this._viewPort.y, this._viewPort.width, this._viewPort.height);
        this._nativeObj.changeScissor(this._scissor.x, this._scissor.y, this._scissor.z, this._scissor.w);
        this.destTarget && this.destTarget._start();
        this._nativeObj.applyContext(cameraUpdateMark);
    }
    set destTarget(destTarget: IRenderTarget) {
        this._destTarget = destTarget;
        this._nativeObj.destTarget = destTarget ? destTarget._renderTarget : null;
    }

    get destTarget(): IRenderTarget {
        return this._destTarget;
    }

    set viewPort(viewPort: Viewport) {
        this._viewPort = viewPort;
        this._nativeObj.changeViewport(viewPort.x, viewPort.y, viewPort.width, viewPort.height)
    }

    get viewPort(): Viewport {
        return this._viewPort;
    }

    set scissor(scissor: Vector4) {
        this._scissor = scissor;
        this._nativeObj.changeScissor(scissor.x, scissor.y, scissor.z, scissor.w)
    }

    get scissor(): Vector4 {
        return this._scissor;
    }

    set invertY(invertY: boolean) {
        this._nativeObj.invertY = invertY;
    }

    get invertY(): boolean {
        return this._nativeObj.invertY;
    }

    set pipelineMode(pipelineMode: PipelineMode) {
        this._nativeObj.pipelineMode = pipelineMode;
    }

    get pipelineMode(): PipelineMode {
        return this._nativeObj.pipelineMode;
    }

    get configShaderData(): ShaderData {
        return this._confifShaderData;
    }

    set configShaderData(value: ShaderData) {
        this._confifShaderData = value;
        this._nativeObj.configShaderData = value ? (value as any)._nativeObj : null;
    }

    set globalShaderData(globalShaderData: ShaderData) {
        this._globalShaderData = globalShaderData;
        this._nativeObj.globalShaderData = globalShaderData ? (globalShaderData as any)._nativeObj : null;
    }

    get globalShaderData(): ShaderData {
        return this._globalShaderData;
    }

    set sceneShaderData(sceneShaderData: ShaderData) {
        this._sceneShaderData = sceneShaderData;
        this._nativeObj.sceneShaderData = sceneShaderData ? (sceneShaderData as any)._nativeObj : null;
    }

    get sceneShaderData(): ShaderData {
        return this._sceneShaderData;
    }

    set cameraShaderData(cameraShaderData: ShaderData) {
        this._cameraShaderData = cameraShaderData;
        this._nativeObj.cameraShaderData = cameraShaderData ? (cameraShaderData as any)._nativeObj : null;
    }

    get cameraShaderData(): ShaderData {
        return this._cameraShaderData;
    }

    set sceneID(sceneID: number) {
        this._nativeObj.sceneID = sceneID;
    }

    get sceneID(): number {
        return this._nativeObj.sceneID;
    }

    set cameraUpdateMark(cameraUpdateMark: number) {
        this._nativeObj.cameraUpdateMark = cameraUpdateMark;
    }

    get cameraUpdateMark(): number {
        return this._nativeObj.cameraUpdateMark;
    }


}