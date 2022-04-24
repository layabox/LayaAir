import { Vector4 } from "../../../../d3/math/Vector4";
import { Viewport } from "../../../../d3/math/Viewport";
import { IRenderTarget } from "../../../RenderInterface/IRenderTarget";
import { IRenderContext3D } from "../../../RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { ShaderData } from "../../../RenderShader/ShaderData";

export class NativeRenderContext3DOBJ implements IRenderContext3D {

    //viewPort
    _viewPort: Viewport;
    //scissor
    _scissor: Vector4;

    private _nativeObj: any;
    
    constructor() {
        this._viewPort = new Viewport(0, 0, 0, 0);
        this._scissor = new Vector4();
        this._nativeObj = new (window as any).conchRenderContext3D();
    }

    /**设置IRenderContext */
    applyContext(cameraUpdateMark:number): void {
        this._nativeObj.applyContext(cameraUpdateMark);
    }
    set destTarget(destTarget: IRenderTarget) {
        this._nativeObj.destTarget = destTarget;
    }

    get destTarget(): IRenderTarget {
        return this._nativeObj.destTarget;
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

    set pipelineMode(pipelineMode: string) {
        this._nativeObj.pipelineMode = pipelineMode;
    }

    get pipelineMode(): string {
        return this._nativeObj.pipelineMode;
    }

    set globalShaderData(globalShaderData: ShaderData) {
        this._nativeObj.globalShaderData = globalShaderData;
    }

    get globalShaderData(): ShaderData {
        return this._nativeObj.globalShaderData;
    }

    set sceneShaderData(sceneShaderData: ShaderData) {
        this._nativeObj.sceneShaderData = sceneShaderData;
    }

    get sceneShaderData(): ShaderData {
        return this._nativeObj.sceneShaderData;
    }

    set cameraShaderData(cameraShaderData: ShaderData) {
        this._nativeObj.cameraShaderData = cameraShaderData;
    }

    get cameraShaderData(): ShaderData {
        return this._nativeObj.cameraShaderData;
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