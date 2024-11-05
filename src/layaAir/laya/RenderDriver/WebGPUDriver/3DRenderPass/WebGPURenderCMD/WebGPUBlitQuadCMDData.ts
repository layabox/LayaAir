import { RenderClearFlag } from "../../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Command } from "../../../../d3/core/render/command/Command";
import { Vector4 } from "../../../../maths/Vector4";
import { Viewport } from "../../../../maths/Viewport";
import { BlitQuadCMDData } from "../../../DriverDesign/3DRenderPass/IRender3DCMD";
import { RenderCMDType } from "../../../DriverDesign/RenderDevice/IRenderCMD";
import { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { WebGPUInternalRT } from "../../RenderDevice/WebGPUInternalRT";
import { WebGPURenderContext3D } from "../WebGPURenderContext3D";
import { WebGPURenderElement3D } from "../WebGPURenderElement3D";

export class WebGPUBlitQuadCMDData extends BlitQuadCMDData {
    type: RenderCMDType;
    private _sourceTexelSize: Vector4;
    protected _dest: WebGPUInternalRT;
    protected _viewport: Viewport;
    protected _source: InternalTexture;
    protected _scissor: Vector4;
    protected _offsetScale: Vector4;
    protected _element: WebGPURenderElement3D;

    get dest(): WebGPUInternalRT {
        return this._dest;
    }
    set dest(value: WebGPUInternalRT) {
        this._dest = value;
    }

    get viewport(): Viewport {
        return this._viewport;
    }
    set viewport(value: Viewport) {
        value.cloneTo(this._viewport);
    }

    get scissor(): Vector4 {
        return this._scissor;
    }
    set scissor(value: Vector4) {
        value.cloneTo(this._scissor);
    }

    get source(): InternalTexture {
        return this._source;
    }
    set source(value: InternalTexture) {
        this._source = value;
        if (this._source)
            this._sourceTexelSize.setValue(1 / this._source.width, 1 / this._source.height, this._source.width, this._source.height);
    }

    get offsetScale(): Vector4 {
        return this._offsetScale;
    }
    set offsetScale(value: Vector4) {
        value.cloneTo(this._offsetScale);
    }

    get element(): WebGPURenderElement3D {
        return this._element;
    }
    set element(value: WebGPURenderElement3D) {
        this._element = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.Blit;
        this._viewport = new Viewport();
        this._scissor = new Vector4();
        this._offsetScale = new Vector4();
        this._sourceTexelSize = new Vector4();
    }

    apply(context: WebGPURenderContext3D) {
        this.element.materialShaderData._setInternalTexture(Command.SCREENTEXTURE_ID, this._source);
        this.element.materialShaderData.setVector(Command.SCREENTEXTUREOFFSETSCALE_ID, this._offsetScale);
        this.element.materialShaderData.setVector(Command.MAINTEXTURE_TEXELSIZE_ID, this._sourceTexelSize);
        context.setViewPort(this._viewport);
        context.setScissor(this._scissor);
        context.setRenderTarget(this.dest, RenderClearFlag.Nothing);
        context.drawRenderElementOne(this.element);
    }
}