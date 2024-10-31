import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Blit2DQuadCMD, Draw2DElementCMD, SetRendertarget2DCMD } from "../../DriverDesign/2DRenderPass/IRender2DCMD";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { RenderCMDType } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { WebGLInternalRT } from "../RenderDevice/WebGLInternalRT";
import { WebglRenderContext2D } from "./WebGLRenderContext2D";
import { WebGLRenderelement2D } from "./WebGLRenderElement2D";

export class WebGLSetRendertarget2DCMD extends SetRendertarget2DCMD {

    constructor() {
        super();
        this.type = RenderCMDType.ChangeRenderTarget;
        this._clearColorValue = new Color();

    }

    apply(context: IRenderContext2D): void {
        if (this.rt) context.invertY = this.invertY;
        else context.invertY = false;
        context.setRenderTarget(this.rt, this.clearColor, this.clearColorValue);
    }
}

export class WebGLDraw2DElementCMD extends Draw2DElementCMD {

    private _elemets: WebGLRenderelement2D[];

    constructor() {
        super();
        this.type = RenderCMDType.DrawElement;
    }

    setRenderelements(value: WebGLRenderelement2D[]): void {
        this._elemets = value;
    }

    apply(context: IRenderContext2D): void {
        if (this._elemets.length == 1) {
            context.drawRenderElementOne(this._elemets[0]);
        } else {
            this._elemets.forEach(element => {
                context.drawRenderElementOne(element);
            });
        }
    }
}

export class WebGLBlit2DQuadCMD extends Blit2DQuadCMD {

    static SCREENTEXTURE_ID: number;

    static SCREENTEXTUREOFFSETSCALE_ID: number;

    static MAINTEXTURE_TEXELSIZE_ID: number;

    static _init_() {
        WebGLBlit2DQuadCMD.SCREENTEXTURE_ID = Shader3D.propertyNameToID("u_MainTex");
        WebGLBlit2DQuadCMD.SCREENTEXTUREOFFSETSCALE_ID = Shader3D.propertyNameToID("u_OffsetScale");
        WebGLBlit2DQuadCMD.MAINTEXTURE_TEXELSIZE_ID = Shader3D.propertyNameToID("u_MainTex_TexelSize");
    }

    private _sourceTexelSize: Vector4;

    type: RenderCMDType;

    constructor() {
        super();
        if (!WebGLBlit2DQuadCMD.SCREENTEXTURE_ID) {
            WebGLBlit2DQuadCMD._init_();
        }
        this.type = RenderCMDType.Blit;
        this._viewport = new Viewport();
        this._offsetScale = new Vector4();
        this._sourceTexelSize = new Vector4();
    }

    set source(value: InternalTexture) {
        this._source = value;
        if (this._source) {
            this._sourceTexelSize.setValue(1.0 / this._source.width, 1.0 / this._source.height, this._source.width, this._source.height);
        }
    }

    apply(context: WebglRenderContext2D): void {
        this.element.materialShaderData._setInternalTexture(WebGLBlit2DQuadCMD.SCREENTEXTURE_ID, this._source);
        this.element.materialShaderData.setVector(WebGLBlit2DQuadCMD.SCREENTEXTUREOFFSETSCALE_ID, this._offsetScale);
        this.element.materialShaderData.setVector(WebGLBlit2DQuadCMD.MAINTEXTURE_TEXELSIZE_ID, this._sourceTexelSize);
        context.setRenderTarget(this._dest as WebGLInternalRT, false, Color.BLACK);
        context.drawRenderElementOne(this.element as WebGLRenderelement2D);
    }
}