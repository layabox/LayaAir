import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { SetRendertarget2DCMD } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderTarget } from "../../../RenderDriver/DriverDesign/RenderDevice/IRenderTarget";
import { Command2D } from "./Command2D";

export class Set2DRTCMD extends Command2D {
    /**@internal */
    private static _pool: any[] = [];

    static create(renderTexture: IRenderTarget, clearColor: boolean, colorValue: Color, renderInvertY = true): Set2DRTCMD {
        var cmd: Set2DRTCMD;
        cmd = Set2DRTCMD._pool.length > 0 ? Set2DRTCMD._pool.pop() : new Set2DRTCMD();
        cmd.renderTexture = renderTexture;
        cmd._setRenderTargetCMD.clearColor = clearColor;
        cmd._setRenderTargetCMD.clearColorValue = colorValue;
        cmd._setRenderTargetCMD.invertY = renderInvertY;
        return cmd;
    }

    /**@internal */
    private _renderTexture: IRenderTarget = null;

    /**@internal */
    _setRenderTargetCMD: SetRendertarget2DCMD;

    /**
     * @en The render texture.
     * @zh 渲染纹理。
     */
    public get renderTexture(): IRenderTarget {
        return this._renderTexture;
    }
    public set renderTexture(value: IRenderTarget) {
        this._renderTexture = value;
        this._setRenderTargetCMD.rt = value._renderTarget;
    }

    constructor() {
        super();
        this._setRenderTargetCMD = LayaGL.render2DRenderPassFactory.createSetRendertarget2DCMD();
    }

    run(): void {
        this._commandBuffer._renderSize.setValue(this._renderTexture._renderTarget._textures[0].width, this._renderTexture._renderTarget._textures[0].height)
    }

    getRenderCMD(): SetRendertarget2DCMD {
        return this._setRenderTargetCMD;
    }

    recover(): void {
        Set2DRTCMD._pool.push(this);
        this._renderTexture = null;
    }
}