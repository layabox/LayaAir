import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Color } from "../../../maths/Color";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";

export class LayaXRenderContext2D implements IRenderContext2D {

    _nativeObj: any;

    private _dist: InternalRenderTarget;

    constructor() {
        this._nativeObj = new (window as any).conchLayaXRenderContext2D();
        this._nativeObj.setGlobalConfigShaderData(
            (Shader3D._configDefineValues as any)._nativeObj
        );
        this._nativeObj.pipelineMode = "Forward";
    }

    // ---- invertY ----
    get invertY(): boolean { return this._nativeObj.invertY; }
    set invertY(value: boolean) { this._nativeObj.invertY = value; }

    // ---- pipelineMode ----
    get pipelineMode(): string { return this._nativeObj.pipelineMode; }
    set pipelineMode(value: string) { this._nativeObj.pipelineMode = value; }

    // ---- passData ----
    private _passData: ShaderData;
    get passData(): ShaderData { return this._passData; }
    set passData(value: ShaderData) {
        this._passData = value;
        this._nativeObj.passData = value ? (value as any)._nativeObj : null;
    }

    // ---- setRenderTarget ----
    setRenderTarget(value: InternalRenderTarget, clear: boolean, clearColor: Color): void {
        this._dist = value;
        this._nativeObj.setRenderTarget(
            value ? (value as any)._nativeObj : null,
            clear,
            clearColor
        );
    }

    getRenderTarget(): InternalRenderTarget {
        return this._dist;
    }

    // ---- setOffscreenView ----
    setOffscreenView(width: number, height: number): void {
        this._nativeObj.setOffscreenView(width, height);
    }

    // ---- draw ----
    // LayaX: 不调 native，渲染由 Rust 回调 C++ doRender 驱动
    drawRenderElementOne(node: IRenderElement2D): void {
    }

    drawRenderElementList(list: SingletonList<IRenderElement2D>): number {
        return list.length;
    }

    // ---- CMD ----
    // LayaX: CMD 在 C++ forwardRender 中直接处理
    runOneCMD(cmd: IRenderCMD): void {
    }

    runCMDList(cmds: IRenderCMD[]): void {
    }
}
