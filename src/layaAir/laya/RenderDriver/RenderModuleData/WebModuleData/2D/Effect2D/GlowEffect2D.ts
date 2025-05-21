import { Blit2DCMD } from "../../../../../display/Scene2DSpecial/RenderCMD2D/Blit2DCMD";
import { LayaGL } from "../../../../../layagl/LayaGL";
import { Matrix } from "../../../../../maths/Matrix";
import { Vector2 } from "../../../../../maths/Vector2";
import { Vector4 } from "../../../../../maths/Vector4";
import { RenderTargetFormat } from "../../../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Material } from "../../../../../resource/Material";
import { RenderTexture2D } from "../../../../../resource/RenderTexture2D";
import { IRenderElement2D } from "../../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { PostProcess2D, PostProcessRenderContext2D } from "../PostProcess2D";
import { PostProcess2DEffect } from "../PostProcess2DEffect";

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
    public get sv_blurInfo1(): Vector4 {
        return this._sv_blurInfo1;
    }
    public set sv_blurInfo1(value: Vector4) {
        this._sv_blurInfo1 = value;
        this._glowMat && (this._glowMat.setVector4("u_blurInfo1", this._sv_blurInfo1));
        this._owner && this._owner._onChangeRender();
    }
    private _sv_blurInfo2: Vector4 = new Vector4(0, 0, 1, 0);
    public get sv_blurInfo2(): Vector4 {
        return this._sv_blurInfo2;
    }
    public set sv_blurInfo2(value: Vector4) {
        this._sv_blurInfo2 = value;
        this._glowMat && (this._glowMat.setVector4("u_blurInfo2", this._sv_blurInfo2));
        this._owner && this._owner._onChangeRender();

    }
    private _color: Vector4 = new Vector4();
    public get color(): Vector4 {
        return this._color;
    }
    public set color(value: Vector4) {
        this._color = value;
        this._glowMat && (this._glowMat.setVector4("u_color", this._color));
        this._owner && this._owner._onChangeRender();

    }

    effectInit(postprocess: PostProcess2D): void {
        this._owner = postprocess;
        //blitmat
        (!this._blitmat) && (this._blitmat = new Material());
        this._blitmat.setShaderName("ColorEffect2D");
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
        this._glowMat.setVector4("u_color", this._color);
        this._glowMat.setVector4("u_blurInfo1", this.sv_blurInfo1);
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
        if (!this._compositeElement) {
            this._compositeElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
            this._compositeElement.geometry = Blit2DCMD.InvertQuadGeometry;
            this._compositeElement.nodeCommonMap = null;
            this._compositeElement.renderStateIsBySprite = false;
            this._compositeElement.materialShaderData = this._compositeMat.shaderData;
            this._compositeElement.subShader = this._compositeMat.shader.getSubShaderAt(0);
        }
    }


    render(context: PostProcessRenderContext2D): void {
        let marginLeft = 50;
        let marginTop = 50;
        let width = context.indirectTarget.width;
        let height = context.indirectTarget.height;
        let texwidth = width + 2 * marginLeft;
        let texheight = height + 2 * marginTop;
        if (!this._destRT || this._destRT.width != texwidth || texheight != this._destRT.height) {
            if (this._destRT)
                this._destRT.destroy();
            this._destRT = new RenderTexture2D(texwidth, texheight, RenderTargetFormat.R8G8B8A8);
        }

        if (!this._blitExtendRT || this._blitExtendRT.width != texwidth || texheight != this._blitExtendRT.height) {
            if (this._blitExtendRT)
                this._blitExtendRT.destroy();
            this._blitExtendRT = new RenderTexture2D(texwidth, texheight, RenderTargetFormat.R8G8B8A8);
        }

        //extend rt
        this._blitmat.setTexture("u_MainTex", context.indirectTarget);
        this._blitcenterScale.setValue(width / texwidth, height / texheight);
        this._blitmat.setVector2("u_centerScale", this._blitcenterScale);
        context.command.setRenderTarget(this._blitExtendRT, true, PostProcess2DEffect.nullColor);
        context.command.drawRenderElement(this._blitElement, Matrix.EMPTY);

        //glow rt
        this._glowMat.setVector2("u_centerScale", Vector2.ONE);
        this._glowMat.setTexture("u_MainTex", this._blitExtendRT);
        this._sv_blurInfo2.x = width;
        this._sv_blurInfo2.y = height;
        this._glowMat.setVector4("u_blurInfo2", this._sv_blurInfo2);
        context.command.setRenderTarget(this._destRT, true, PostProcess2DEffect.nullColor);
        context.command.drawRenderElement(this._glowElement, Matrix.EMPTY);

        //composite
        this._compositeMat.setTexture("u_MainTex", this._blitExtendRT);
        this._compositeMat.setVector2("u_centerScale", Vector2.ONE);
        context.command.drawRenderElement(this._compositeElement, Matrix.EMPTY);
        context.destination = this._destRT;
    }


    destroy() {
        this._destRT && this._destRT.destroy();
        this._blitExtendRT && this._blitExtendRT.destroy();

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