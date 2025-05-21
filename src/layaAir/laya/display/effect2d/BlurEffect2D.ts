
import { LayaGL } from "../../layagl/LayaGL";
import { Matrix } from "../../maths/Matrix";
import { Vector2 } from "../../maths/Vector2";
import { Vector4 } from "../../maths/Vector4";
import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { RenderTargetFormat } from "../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Material } from "../../resource/Material";
import { RenderTexture2D } from "../../resource/RenderTexture2D";
import { PostProcess2D, PostProcessRenderContext2D } from "../PostProcess2D";
import { PostProcess2DEffect } from "../PostProcess2DEffect";
import { Blit2DCMD } from "../Scene2DSpecial/RenderCMD2D/Blit2DCMD";

export class BlurEffect2D extends PostProcess2DEffect {
   private _renderElement: IRenderElement2D;
   private mat: Material;
   private _centerScale: Vector2 = new Vector2();
   private _destRT: RenderTexture2D;
   private _shaderV1 = new Vector4();
   private _blurInfo: Vector2 = new Vector2();
   public get shaderV1() {
      return this._shaderV1;
   }
   public set shaderV1(value) {
      this._shaderV1 = value;
      this.mat && this.mat.setVector4("u_strength_sig2_2sig2_gauss1", this._shaderV1);
      this._owner && this._owner._onChangeRender();
   }

   effectInit(postprocess: PostProcess2D): void {
      this._owner = postprocess;
      (!this.mat) && (this.mat = new Material());
      this.mat.setShaderName("BlurEffect2D");
      if (!this._renderElement) {
         this._renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
         this._renderElement.geometry = Blit2DCMD.InvertQuadGeometry;
         this._renderElement.nodeCommonMap = null;
         this._renderElement.renderStateIsBySprite = false;
         this._renderElement.materialShaderData = this.mat.shaderData;
         this._renderElement.subShader = this.mat.shader.getSubShaderAt(0);
      }
      this.mat.setVector4("u_strength_sig2_2sig2_gauss1", this._shaderV1);
      this.mat.setVector2("u_centerScale", this._centerScale);
   }

   render(context: PostProcessRenderContext2D): void {
      let marginLeft = 50;
      let marginTop = 50;
      let width = context.indirectTarget.width;
      let height = context.indirectTarget.height;
      let texwidth = width + 2 * marginLeft;
      let texheight = height + 2 * marginTop;
      this._blurInfo.setValue(texwidth, texheight);
      if (!this._destRT || this._destRT.width != texwidth || this._destRT.height != texheight) {
         if (this._destRT)
            this._destRT.destroy();
         this._destRT = new RenderTexture2D(texwidth, texheight, RenderTargetFormat.R8G8B8A8);
      }
      this._centerScale.setValue(width / texwidth, height / texheight);
      this.mat.setVector2("u_centerScale", this._centerScale);
      this.mat.setVector2("u_blurInfo", this._blurInfo);
      this.mat.setTexture("u_MainTex", context.indirectTarget);
      context.command.setRenderTarget(this._destRT, true, PostProcess2DEffect.nullColor);
      context.command.drawRenderElement(this._renderElement, Matrix.EMPTY);
      context.destination = this._destRT;
   }

   destroy() {
      this._destRT && this._destRT.destroy();
      this.mat.destroy();
      this.mat = null;
      this._renderElement?.destroy();
      this._renderElement = null;
   }

}