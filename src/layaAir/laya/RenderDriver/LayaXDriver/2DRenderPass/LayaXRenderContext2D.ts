import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { IRenderCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { Shader2D } from "../../../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../../../webgl/shader/d2/ShaderDefines2D";
import { LayaXRenderElement2D } from "./LayaXRenderElement2D";

export class LayaXRenderContext2D implements IRenderContext2D {

    private static _stencilMaskTemplate: LayaXRenderElement2D = null;

    _nativeObj: any;

    private _dist: InternalRenderTarget;

    /** @internal Ctx2DProps 共享块：JS 写、C++(LayaXRender2DPass/共享基类) 读。槽 0=invertY(i32 0/1) 1=offW 2=offH(u32) 3=offX 4=offY(i32) */
    private _ctx2dBuf = new ArrayBuffer(5 * 4);
    private _ctx2dU32 = new Uint32Array(this._ctx2dBuf);
    private _ctx2dI32 = new Int32Array(this._ctx2dBuf);

    /** @internal pipelineMode 改 TS 纯缓存（LayaX C++ 不消费） */
    private _pipelineMode: string = "Forward";

    constructor() {
        this._nativeObj = new (window as any).conchLayaXRenderContext2D();
        this._nativeObj.bindContext2DBuffer(this._ctx2dBuf);
        this._nativeObj.setGlobalConfigShaderData(
            (Shader3D._configDefineValues as any)._nativeObj
        );
        this._nativeObj.setStencilMaskTemplate(LayaXRenderContext2D._getStencilMaskTemplate()._nativeObj);
    }

    private static _getStencilMaskTemplate(): LayaXRenderElement2D {
        if (LayaXRenderContext2D._stencilMaskTemplate)
            return LayaXRenderContext2D._stencilMaskTemplate;

        const element = new LayaXRenderElement2D();
        element.geometry = ShaderDefines2D._stencilGeo;
        element.subShader = Shader2D.stencilShader.getSubShaderAt(0);
        element.nodeCommonMap = ["BaseRender2D"];
        element.renderStateIsBySprite = true;

        LayaXRenderContext2D._stencilMaskTemplate = element;
        return element;
    }

    // ---- invertY (直写共享块槽 0，零跨界) ----
    get invertY(): boolean { return this._ctx2dI32[0] !== 0; }
    set invertY(value: boolean) { this._ctx2dI32[0] = value ? 1 : 0; }

    // ---- pipelineMode (TS 纯缓存) ----
    get pipelineMode(): string { return this._pipelineMode; }
    set pipelineMode(value: string) { this._pipelineMode = value; }

    // ---- passData ----
    private _passData: ShaderData;
    get passData(): ShaderData { return this._passData; }
    set passData(value: ShaderData) {
        this._passData = value;
        this._nativeObj.setPassData(value ? (value as any)._nativeObj : null);
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
    setOffscreenView(width: number, height: number, x: number = 0, y: number = 0): void {
        // 直写共享块（零跨界）；C++ LayaXRender2DPass 读块，共享基类 RTRender2DPass 经虚函数也写块。
        this._ctx2dU32[1] = width;
        this._ctx2dU32[2] = height;
        this._ctx2dI32[3] = x;
        this._ctx2dI32[4] = y;
    }

    getOffscreenView(out: Vector4): void {
        out.setValue(this._ctx2dI32[3], this._ctx2dI32[4], this._ctx2dU32[1], this._ctx2dU32[2]);
    }

    // ---- draw ----
    // LayaX: 不调 native，渲染由 Rust 回调 C++ doRender 驱动
    drawRenderElementOne(node: IRenderElement2D): void {
    }

    drawRenderElementList(list: SingletonList<IRenderElement2D>): number {
        return list.length;
    }

    // ---- CMD ----
    runOneCMD(cmd: IRenderCMD): void {
        if (cmd) {
            this._nativeObj.runOneCMD((cmd as any)._nativeObj);
        }
    }

    runCMDList(cmds: IRenderCMD[]): void {
        if (!cmds || cmds.length === 0) return;
        let nativeobCMDs: any[] = [];
        for (let i = 0, n = cmds.length; i < n; i++) {
            nativeobCMDs.push((cmds[i] as any)._nativeObj);
        }
        this._nativeObj.runCMDList(nativeobCMDs);
    }
}
