import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { SetRendertarget2DCMD, Draw2DElementCMD, Blit2DQuadCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { RenderCMDType } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { WebGPUInternalRT } from "../RenderDevice/WebGPUInternalRT";
import { WebGPURenderContext2D } from "./WebGPURenderContext2D";
import { WebGPURenderElement2D } from "./WebGPURenderElement2D";

export class WebGPUSetRendertarget2DCMD extends SetRendertarget2DCMD {
    constructor() {
        super();
        this.type = RenderCMDType.ChangeRenderTarget;
        this._clearColorValue = new Color();
    }

    apply(context: IRenderContext2D): void {
        if (this.rt)
            context.invertY = this.invertY;
        else context.invertY = false;
        context.setRenderTarget(this.rt, this.clearColor, this.clearColorValue);
    }
}

export class WebGPUDraw2DElementCMD extends Draw2DElementCMD {
    private _elements: WebGPURenderElement2D[];

    constructor() {
        super();
        this.type = RenderCMDType.DrawElement;
    }

    setRenderelements(value: WebGPURenderElement2D[]): void {
        this._elements = value;
    }

    apply(context: IRenderContext2D): void {
        if (this._elements.length === 1) {
            context.drawRenderElementOne(this._elements[0]);
        } else {
            this._elements.forEach(element => {
                context.drawRenderElementOne(element);
            });
        }
    }
}

export class WebGPUBlit2DQuadCMD extends Blit2DQuadCMD {
    static SCREENTEXTURE_ID: number;
    static SCREENTEXTUREOFFSETSCALE_ID: number;
    static MAINTEXTURE_TEXELSIZE_ID: number;

    static __init__() {
        WebGPUBlit2DQuadCMD.SCREENTEXTURE_ID = Shader3D.propertyNameToID("u_MainTex");
        WebGPUBlit2DQuadCMD.SCREENTEXTUREOFFSETSCALE_ID = Shader3D.propertyNameToID("u_OffsetScale");
        WebGPUBlit2DQuadCMD.MAINTEXTURE_TEXELSIZE_ID = Shader3D.propertyNameToID("u_MainTex_TexelSize");
    }

    private _sourceTexelSize: Vector4;

    type: RenderCMDType;

    constructor() {
        super();
        if (!WebGPUBlit2DQuadCMD.SCREENTEXTURE_ID)
            WebGPUBlit2DQuadCMD.__init__();
        this.type = RenderCMDType.Blit;
        this._viewport = new Viewport();
        this._offsetScale = new Vector4();
        this._sourceTexelSize = new Vector4();
    }

    set source(value: InternalTexture) {
        this._source = value;
        if (this._source)
            this._sourceTexelSize.setValue(1 / this._source.width, 1 / this._source.height, this._source.width, this._source.height);
    }

    apply(context: WebGPURenderContext2D): void {
        this.element.materialShaderData._setInternalTexture(WebGPUBlit2DQuadCMD.SCREENTEXTURE_ID, this._source);
        this.element.materialShaderData.setVector(WebGPUBlit2DQuadCMD.SCREENTEXTUREOFFSETSCALE_ID, this._offsetScale);
        this.element.materialShaderData.setVector(WebGPUBlit2DQuadCMD.MAINTEXTURE_TEXELSIZE_ID, this._sourceTexelSize);
        context.setRenderTarget(this._dest as WebGPUInternalRT, false, Color.BLACK);
        context.drawRenderElementOne(this.element as WebGPURenderElement2D);
    }
}