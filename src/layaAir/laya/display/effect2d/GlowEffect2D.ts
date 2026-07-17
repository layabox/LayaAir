
import { LayaGL } from "../../layagl/LayaGL";
import { Color } from "../../maths/Color";
import { Matrix } from "../../maths/Matrix";
import { Vector2 } from "../../maths/Vector2";
import { Vector4 } from "../../maths/Vector4";
import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { RenderTargetFormat } from "../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Material } from "../../resource/Material";
import { RenderTexture2D } from "../../resource/RenderTexture2D";
import { ClassUtils } from "../../utils/ClassUtils";
import { ColorUtils } from "../../utils/ColorUtils";
import { PostProcess2D, PostProcessRenderContext2D } from "../PostProcess2D";
import { PostProcess2DEffect } from "../PostProcess2DEffect";
import { Blit2DCMD } from "../Scene2DSpecial/RenderCMD2D/Blit2DCMD";

export class GlowEffect2D extends PostProcess2DEffect {
    private _blitElement: IRenderElement2D;
    private _blitmat: Material;
    private _blitcenterScale: Vector2 = new Vector2();

    private _glowElement: IRenderElement2D;
    private _glowMat: Material;

    private _compositeElement: IRenderElement2D;
    private _compositeMat: Material;

    private _blitExtendRT: RenderTexture2D;
    private _destRT: RenderTexture2D;

    private _sv_blurInfo1: Vector4 = new Vector4();
    private _sv_blurInfo2: Vector4 = new Vector4(0, 0, 1, 0);
    private _color: string;
    private _colorVec: Vector4 = new Vector4();

    get sv_blurInfo1(): Vector4 {
        return this._sv_blurInfo1;
    }
    set sv_blurInfo1(value: Vector4) {
        if (value !== this._sv_blurInfo1) {
            value.cloneTo(this._sv_blurInfo1);
        }
        this._glowMat && (this._glowMat.setVector4("u_blurInfo1", this._sv_blurInfo1));
        this._owner && this._owner._onChangeRender();
    }

    get sv_blurInfo2(): Vector4 {
        return this._sv_blurInfo2;
    }
    set sv_blurInfo2(value: Vector4) {
        if (value !== this._sv_blurInfo2) {
            value.cloneTo(this._sv_blurInfo2);
        }
        this._glowMat && (this._glowMat.setVector4("u_blurInfo2", this._sv_blurInfo2));
        this._owner && this._owner._onChangeRender();

    }

    /**
     * @en color value
     * @zh 颜色值
     */
    get color(): string {
        return this._color;
    }
    set color(value: string) {
        this._color = value;
        this._colorVec.fromArray(ColorUtils.create(value).arrColor);
        this._glowMat && (this._glowMat.setVector4("u_color", this._colorVec));
        this._owner && this._owner._onChangeRender();
    }

    /**
     * @en Gest fuzzy value
     * @zh 获取模糊值
     */
    get blur(): number {
        return this._sv_blurInfo1.y;
    }

    /**
     * @en Sets fuzzy value
     * @zh 设置模糊值
     */
    set blur(value: number) {
        this._sv_blurInfo1.x = this._sv_blurInfo1.y = value;
        this.sv_blurInfo1 = this._sv_blurInfo1;
    }

    /**
     * @en Gets Y offset value
     * @zh 获取Y偏移值
     */
    get offsetY(): number {
        return this._sv_blurInfo1.w;
    }

    /**
     * @en Sets Y offset value
     * @zh 设置Y偏移值
     */
    set offsetY(value: number) {
        if (value !== this._sv_blurInfo1.w) {
            this._sv_blurInfo1.w = value;
            this.sv_blurInfo1 = this._sv_blurInfo1;
        }
    }

    /**
     * @en Gets X offset value
     * @zh 获取X偏移值
     */
    get offsetX(): number {
        return this._sv_blurInfo1.z;
    }

    /**
     * @en Sets X offset value
     * @zh 设置X偏移值
     */
    set offsetX(value: number) {
        if (value !== this._sv_blurInfo1.z) {
            this._sv_blurInfo1.z = value;
            this.sv_blurInfo1 = this._sv_blurInfo1;
        }
    }

    constructor(color?: string, blur?: number, offX?: number, offY?: number) {
        super();
        this.color = color || "#000";
        this.blur = blur ?? 4;
        this.offsetX = offX ?? 6;
        this.offsetY = offY ?? 6;
    }

    /** @ignore */
    effectInit(postprocess: PostProcess2D): void {
        this._owner = postprocess;
        //blitmat
        (!this._blitmat) && (this._blitmat = new Material());
        this._blitmat.setShaderName("ColorEffect2D");
        this._blitmat.lock = true;
        if (!this._blitElement) {
            this._blitElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
            this._blitElement.geometry = Blit2DCMD.InvertQuadGeometry;
            this._blitElement.nodeCommonMap = null;
            this._blitElement.renderStateIsBySprite = false;
            this._blitElement.materialShaderData = this._blitmat.shaderData;
            this._blitElement.subShader = this._blitmat.shader.getSubShaderAt(0);
        }

        //glowmat
        (!this._glowMat) && (this._glowMat = new Material());
        this._glowMat.setShaderName("glow2D");
        this._glowMat.setVector4("u_color", this._colorVec);
        this._glowMat.setVector4("u_blurInfo1", this.sv_blurInfo1);
        this._glowMat.lock = true;
        if (!this._glowElement) {
            this._glowElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
            this._glowElement.geometry = Blit2DCMD.InvertQuadGeometry;
            this._glowElement.nodeCommonMap = null;
            this._glowElement.renderStateIsBySprite = false;
            this._glowElement.materialShaderData = this._glowMat.shaderData;
            this._glowElement.subShader = this._glowMat.shader.getSubShaderAt(0);
        }


        //compositemat
        (!this._compositeMat) && (this._compositeMat = new Material());
        this._compositeMat.setShaderName("ColorEffect2D");
        this._compositeMat.lock = true;
        if (!this._compositeElement) {
            this._compositeElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
            this._compositeElement.geometry = Blit2DCMD.InvertQuadGeometry;
            this._compositeElement.nodeCommonMap = null;
            this._compositeElement.renderStateIsBySprite = false;
            this._compositeElement.materialShaderData = this._compositeMat.shaderData;
            this._compositeElement.subShader = this._compositeMat.shader.getSubShaderAt(0);
        }
    }

    /** @ignore */
    render(context: PostProcessRenderContext2D): void {
        let marginLeft = 50;
        let marginTop = 50;
        let width = context.indirectTarget.width;
        let height = context.indirectTarget.height;
        let texwidth = width + 2 * marginLeft;
        let texheight = height + 2 * marginTop;

        this._checkRenderTarget(texwidth, texheight, context);

        //extend rt
        this._blitmat.setTexture("u_MainTex", context.indirectTarget);
        this._blitcenterScale.setValue(width / texwidth, height / texheight);
        this._blitmat.setVector2("u_centerScale", this._blitcenterScale);
        context.command.setRenderTarget(this._blitExtendRT, true, Color.CLEAR);
        context.command.drawRenderElement(this._blitElement, Matrix.EMPTY);

        //glow rt
        this._glowMat.setVector2("u_centerScale", Vector2.ONE);
        this._glowMat.setTexture("u_MainTex", this._blitExtendRT);
        this._sv_blurInfo2.x = width;
        this._sv_blurInfo2.y = height;
        this._glowMat.setVector4("u_blurInfo2", this._sv_blurInfo2);
        context.command.setRenderTarget(this._destRT, true, Color.CLEAR);
        context.command.drawRenderElement(this._glowElement, Matrix.EMPTY);

        //composite
        this._compositeMat.setTexture("u_MainTex", this._blitExtendRT);
        this._compositeMat.setVector2("u_centerScale", Vector2.ONE);
        context.command.drawRenderElement(this._compositeElement, Matrix.EMPTY);
        context.destination = this._destRT;
    }
    
    private _checkRenderTarget(width: number, height: number , context: PostProcessRenderContext2D) {
        
        if (this._destRT && (this._destRT._inPool || this._destRT.destroyed || this._destRT.width !== width || this._destRT.height !== height)) {
            RenderTexture2D.recoverToPool(this._destRT);
            this._destRT = null;
        }

        if (this._blitExtendRT && (this._blitExtendRT._inPool || this._blitExtendRT.destroyed || this._blitExtendRT.width !== width || this._blitExtendRT.height !== height)) {
            // 回收旧纹理到对象池
            RenderTexture2D.recoverToPool(this._blitExtendRT);
            this._blitExtendRT = null;
        }

        if (!this._destRT) {
            this._destRT = context.getRenderTexture(width, height, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
        }

        if (!this._blitExtendRT) {
            this._blitExtendRT = context.getRenderTexture(width, height, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
        }
    }

    /** @ignore */
    clearRT(context: PostProcessRenderContext2D): void {
        if (this._blitExtendRT && this._blitExtendRT !== context.destination) {
            RenderTexture2D.recoverToPool(this._blitExtendRT);
            this._blitExtendRT = null;
        }

        if (this._destRT && this._destRT !== context.destination) {
            RenderTexture2D.recoverToPool(this._destRT);
            this._destRT = null;
        }
    }
    
    /** @ignore */
    destroy() {
        super.destroy();

        if (this._destRT) {
            // 回收纹理到对象池
            RenderTexture2D.recoverToPool(this._destRT);
        }
        this._destRT = null;
        
        if (this._blitExtendRT) {
            // 回收纹理到对象池
            RenderTexture2D.recoverToPool(this._blitExtendRT);
        }
        this._blitExtendRT = null;

        this._blitmat && (this._blitmat.destroy());
        this._blitmat = null;
        this._blitElement && (this._blitElement.destroy());
        this._blitElement = null;

        this._glowMat && (this._glowMat.destroy());
        this._glowMat = null;
        this._glowElement && (this._glowElement.destroy());
        this._glowElement = null;

        this._compositeMat && (this._compositeMat.destroy());
        this._compositeMat = null;
        this._compositeElement && (this._compositeElement.destroy());
        this._compositeElement = null;
    }
}

ClassUtils.regClass("GlowEffect2D", GlowEffect2D);