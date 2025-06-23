import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { SetRendertarget2DCMD } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderTarget } from "../../../RenderDriver/DriverDesign/RenderDevice/IRenderTarget";
import { Pool } from "../../../utils/Pool";
import { RenderState2D } from "../../../webgl/utils/RenderState2D";
import { Command2D } from "./Command2D";

export class Set2DRTCMD extends Command2D {
    private static _pool = Pool.createPool(Set2DRTCMD);

    static create(renderTexture: IRenderTarget, clearColor: boolean, colorValue: Color, renderInvertY: boolean = true): Set2DRTCMD {
        let cmd = Set2DRTCMD._pool.take();
        cmd.renderTexture = renderTexture;
        cmd._setRenderTargetCMD.clearColor = clearColor;
        cmd._setRenderTargetCMD.clearColorValue = colorValue;
        cmd._setRenderTargetCMD.invertY = renderInvertY;
        return cmd;
    }

    private _renderTexture: IRenderTarget = null;
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
        if (value) {
            this._setRenderTargetCMD.rt = value._renderTarget;
            this._setRenderTargetCMD.size.setValue(value.width, value.height);
        } else {
            this._setRenderTargetCMD.rt = null;
            this._setRenderTargetCMD.size.setValue(RenderState2D.width, RenderState2D.height);
        }
    }

    constructor() {
        super();
        this._setRenderTargetCMD = LayaGL.render2DRenderPassFactory.createSetRendertarget2DCMD();
    }

    run(): void {
        // if (this._renderTexture)
        // this._commandBuffer._renderSize.setValue(this._renderTexture._renderTarget._textures[0].width, this._renderTexture._renderTarget._textures[0].height)
        // else {
        // this._commandBuffer._renderSize.setValue(RenderState2D.width, RenderState2D.height);
        // }
    }

    getRenderCMD(): SetRendertarget2DCMD {
        return this._setRenderTargetCMD;
    }

    recover(): void {
        Set2DRTCMD._pool.recover(this);
        this._renderTexture = null;
    }
}