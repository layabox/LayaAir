
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
import { PostProcess2D, PostProcessRenderContext2D } from "../PostProcess2D";
import { PostProcess2DEffect } from "../PostProcess2DEffect";
import { Blit2DCMD } from "../Scene2DSpecial/RenderCMD2D/Blit2DCMD";

/**
 * @en Integral result cache
 * @zh 积分结果缓存
 */
var _definiteIntegralMap: { [key: number]: number } = {};

export class BlurEffect2D extends PostProcess2DEffect {

   private _renderElement: IRenderElement2D;
   private _mat: Material;
   private _centerScale: Vector2 = new Vector2();
   private _destRT: RenderTexture2D;
   private _shaderV1 = new Vector4();
   private _blurInfo: Vector2 = new Vector2();
   /**
     * @en The intensity of the blur filter. The higher the value, the more indistinct the image becomes.
     * @zh 模糊滤镜的强度。值越大，图像越不清晰。
     */
   private _strength: number;

   get shaderV1() {
      return this._shaderV1;
   }

   set shaderV1(value: Vector4) {
      if (value != this._shaderV1) {
         value.cloneTo(this._shaderV1);
      }
      this._mat && this._mat.setVector4("u_strength_sig2_2sig2_gauss1", this._shaderV1);
      this._owner && this._owner._onChangeRender();
   }

   constructor(strength?: number) {
      super();
      this._shaderV1 = new Vector4();
      this.strength = strength ?? 4;
   }

   /** @ignore */
   effectInit(postprocess: PostProcess2D): void {
      this._owner = postprocess;
      (!this._mat) && (this._mat = new Material());
      this._mat.setShaderName("BlurEffect2D");
      if (!this._renderElement) {
         this._renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
         this._renderElement.geometry = Blit2DCMD.InvertQuadGeometry;
         this._renderElement.nodeCommonMap = null;
         this._renderElement.renderStateIsBySprite = false;
         this._renderElement.materialShaderData = this._mat.shaderData;
         this._renderElement.subShader = this._mat.shader.getSubShaderAt(0);
      }
      this._mat.setVector4("u_strength_sig2_2sig2_gauss1", this._shaderV1);
      this._mat.setVector2("u_centerScale", this._centerScale);
      this._mat.lock = true;
   }

   /** @ignore */
   render(context: PostProcessRenderContext2D): void {
      let marginLeft = 50;
      let marginTop = 50;
      let width = context.indirectTarget.width;
      let height = context.indirectTarget.height;
      let texwidth = width + 2 * marginLeft;
      let texheight = height + 2 * marginTop;
      this._blurInfo.setValue(texwidth, texheight);
      this._checkRenderTarget(texwidth, texheight, context);
      this._centerScale.setValue(width / texwidth, height / texheight);
      this._mat.setVector2("u_centerScale", this._centerScale);
      this._mat.setVector2("u_blurInfo", this._blurInfo);
      this._mat.setTexture("u_MainTex", context.indirectTarget);
      context.command.setRenderTarget(this._destRT, true, Color.CLEAR);
      context.command.drawRenderElement(this._renderElement, Matrix.EMPTY);
      context.destination = this._destRT;
   }

   private _checkRenderTarget(width: number, height: number, context: PostProcessRenderContext2D) {
      if (this._destRT && (this._destRT._inPool || this._destRT.destroyed || this._destRT.width !== width || this._destRT.height !== height)) {
         // 回收旧纹理到对象池
         RenderTexture2D.recoverToPool(this._destRT);
         this._destRT = null;
      }

      if (!this._destRT) {
         this._destRT = context.getRenderTexture(width, height, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
      }
   }

   clearRT(context: PostProcessRenderContext2D): void {
      if (this._destRT && this._destRT !== context.destination) {
         RenderTexture2D.recoverToPool(this._destRT);
         this._destRT = null;
      }
   }
  
   /**
     * @en The strength of the blur filter.
     * @zh 模糊滤镜的强度。
     */
   get strength() {
      return this._strength;
   }

   set strength(v: number) {
      if (v == this._strength) return;

      this._strength = Math.max(Math.abs(v), 2);//<2的话，函数太细太高不适合下面的方法
      var sigma = this._strength / 3.0;//3σ以外影响很小。即当σ=1的时候，半径为3;
      var sigma2 = sigma * sigma;
      let v1 = this._shaderV1.setValue(this.strength, sigma2,
         2.0 * sigma2,
         1.0 / (2.0 * Math.PI * sigma2));

      //由于目前shader中写死了blur宽度是9，相当于希望3σ是4，可是实际使用的时候经常会strength超过4，
      //这时候blur范围内的积分<1会导致变暗变透明，所以需要计算实际积分值进行放大
      //使用公式计算误差较大，直接累加把
      let s = 0;
      let key = Math.floor(this.strength * 10);
      if (_definiteIntegralMap[key] != undefined) {
         s = _definiteIntegralMap[key];
      } else {
         for (let y = -4; y <= 4; ++y) {
            for (let x = -4; x <= 4; ++x) {
               s += v1.w * Math.exp(-(x * x + y * y) / v1.z);
            }
         }
         _definiteIntegralMap[key] = s;
      }
      v1.w /= s;

      this.shaderV1 = v1;
   }

   /** @ignore */
   destroy() {
      super.destroy();

      if (this._destRT) {
         // 回收纹理到对象池
         RenderTexture2D.recoverToPool(this._destRT);
      }
      this._destRT = null;
      this._mat.destroy();
      this._mat = null;
      this._renderElement?.destroy();
      this._renderElement = null;
   }

}

ClassUtils.regClass("BlurEffect2D", BlurEffect2D);