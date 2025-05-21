import { Blit2DCMD } from "../../../../../display/Scene2DSpecial/RenderCMD2D/Blit2DCMD";
import { LayaGL } from "../../../../../layagl/LayaGL";
import { Color } from "../../../../../maths/Color";
import { Matrix } from "../../../../../maths/Matrix";
import { Matrix4x4 } from "../../../../../maths/Matrix4x4";
import { Vector2 } from "../../../../../maths/Vector2";
import { Vector4 } from "../../../../../maths/Vector4";
import { RenderTargetFormat } from "../../../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D } from "../../../../../RenderEngine/RenderShader/Shader3D";
import { Material } from "../../../../../resource/Material";
import { RenderTexture2D } from "../../../../../resource/RenderTexture2D";
import { IRenderElement2D } from "../../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { PostProcess2D, PostProcessRenderContext2D } from "../PostProcess2D";
import { PostProcess2DEffect } from "../PostProcess2DEffect";



export class ColorEffect2D extends PostProcess2DEffect {
    private _colorMat: Matrix4x4 = new Matrix4x4();
    private mat: Material;
    private _renderElement: IRenderElement2D;
    private _destRT: RenderTexture2D;
    private _centerScale: Vector2 = new Vector2();
    private _alpha: Vector4 = new Vector4();
    public get colorMat(): Matrix4x4 {
        return this._colorMat;
    }
    public set colorMat(value: Matrix4x4) {
        this._colorMat = value;
        this.mat && this.mat.setMatrix4x4("u_colorMat", this.colorMat);
        this._owner && this._owner._onChangeRender();
    }



    public get alpha(): Vector4 {
        return this._alpha;
    }

    public set alpha(value: Vector4) {
        this._alpha = value;
        this.mat && this.mat.setVector4("u_colorAlpha", this.alpha);
        this._owner && this._owner._onChangeRender();

    }

    effectInit(postprocess: PostProcess2D): void {
        this._owner = postprocess;
        (!this.mat) && (this.mat = new Material());
        this.mat.setShaderName("ColorEffect2D");
        this.mat.setMatrix4x4("u_colorMat", this.colorMat);
        this.mat.setVector4("u_colorAlpha", this.alpha);
        this.mat.addDefine(Shader3D.getDefineByName("COLORFILTER"));
        this._centerScale.setValue(1, 1);
        this.mat.setVector2("u_centerScale", this._centerScale);
        if (!this._renderElement) {
            this._renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
            this._renderElement.geometry = Blit2DCMD.InvertQuadGeometry;
            this._renderElement.nodeCommonMap = null;
            this._renderElement.renderStateIsBySprite = false;
            this._renderElement.materialShaderData = this.mat.shaderData;
            this._renderElement.subShader = this.mat.shader.getSubShaderAt(0);
        }

    }

    render(context: PostProcessRenderContext2D): void {
        if (!this._destRT || this._destRT.width != context.indirectTarget.width || context.indirectTarget.height != this._destRT.height) {
            if (this._destRT)
                this._destRT.destroy();
            this._destRT = new RenderTexture2D(context.indirectTarget.width, context.indirectTarget.height, RenderTargetFormat.R8G8B8A8);
        }
        this.mat.setTexture("u_MainTex", context.indirectTarget);
        context.command.setRenderTarget(this._destRT, true, PostProcess2DEffect.nullColor);
        context.command.drawRenderElement(this._renderElement, Matrix.EMPTY);
        context.destination = this._destRT;
    }

    destroy() {
        this._destRT && (this._destRT.destroy());
        this.mat && (this.mat.destroy());
        this._renderElement && (this._renderElement.destroy());
    }
}