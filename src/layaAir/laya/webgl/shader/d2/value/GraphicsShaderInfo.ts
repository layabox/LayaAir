import { Const } from "../../../../Const";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector2 } from "../../../../maths/Vector2";
import { Vector4 } from "../../../../maths/Vector4";
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../../../RenderDriver/RenderModuleData/Design/RenderState";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Material } from "../../../../resource/Material";
import { Texture } from "../../../../resource/Texture";
import { ShaderDefines2D } from "../ShaderDefines2D";
import { RenderSpriteData } from "./Value2D";

const _TEMP_CLIPDIR: Vector4 = new Vector4(Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE);
export class GraphicsShaderInfo{

   shaderData: ShaderData;
   _defaultShader: Shader3D;

   constructor() {
      this.shaderData = LayaGL.renderDeviceFactory.createShaderData();

      this.toDefault();
   }

   toDefault(){
      this.clipMatDir = _TEMP_CLIPDIR;
      this.clipMatPos = Vector4.ZERO;
      this.shaderData.setBool(Shader3D.DEPTH_WRITE, false);
      this.shaderData.setInt(Shader3D.DEPTH_TEST, RenderState.DEPTHTEST_OFF);
      this.shaderData.setInt(Shader3D.BLEND, RenderState.BLEND_ENABLE_ALL);
      this.shaderData.setInt(Shader3D.BLEND_EQUATION, RenderState.BLENDEQUATION_ADD);
      this.shaderData.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
      this.shaderData.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
      this.shaderData.setNumber(ShaderDefines2D.UNIFORM_VERTALPHA, 1.0);
      this.shaderData.setInt(Shader3D.CULL, RenderState.CULL_NONE);
   }

   private _data: RenderSpriteData = RenderSpriteData.Zero;
   public get data() {
      return this._data;
   }
   
   public set data(value) {
      if (value === RenderSpriteData.Zero) {
         this.shaderData.removeDefine(ShaderDefines2D.TEXTURESHADER);
         this.shaderData.removeDefine(ShaderDefines2D.PRIMITIVESHADER);
      } else if (value === RenderSpriteData.Texture2D) {
         this.shaderData.addDefine(ShaderDefines2D.TEXTURESHADER);
         this.shaderData.removeDefine(ShaderDefines2D.PRIMITIVESHADER);
         this._defaultShader = Shader3D.find("Sprite2DTexture");
      }
      else if (value === RenderSpriteData.Primitive) {
         this.shaderData.removeDefine(ShaderDefines2D.TEXTURESHADER);
         this.shaderData.addDefine(ShaderDefines2D.PRIMITIVESHADER);
         this._defaultShader = Shader3D.find("Sprite2DPrimitive");
      }
      this._data = value;
   }

   private _textureHost: Texture | BaseTexture;

   /**@internal */
   set size(value: Vector2) {
      this.shaderData.setVector2(ShaderDefines2D.UNIFORM_SIZE, value);
   }

   get size() {
      return this.shaderData.getVector2(ShaderDefines2D.UNIFORM_SIZE);
   }

   set vertAlpha(value: number) {
      this.shaderData.setNumber(ShaderDefines2D.UNIFORM_VERTALPHA, value);
   }

   get vertAlpha() {
      return this.shaderData.getNumber(ShaderDefines2D.UNIFORM_VERTALPHA);
   }

   /**@internal */
   set mmat(value: Matrix4x4) {
      this.shaderData.setMatrix4x4(ShaderDefines2D.UNIFORM_MMAT, value);
   }

   /**@internal */
   get mmat() {
      return this.shaderData.getMatrix4x4(ShaderDefines2D.UNIFORM_MMAT);
   }

   /**@internal */
   set u_MvpMatrix(value: Matrix4x4) {
      this.shaderData.setMatrix4x4(ShaderDefines2D.UNIFORM_MVPMatrix, value);
   }

   get u_MvpMatrix() {
      return this.shaderData.getMatrix4x4(ShaderDefines2D.UNIFORM_MVPMatrix);
   }

   public get textureHost(): Texture | BaseTexture {
      return this._textureHost
   }
   public set textureHost(value: Texture | BaseTexture) {
      this._textureHost = value;
      let textrueReadGamma: boolean = false;
      if (this.textureHost) {
         if (this.textureHost instanceof BaseTexture) {
            textrueReadGamma = (this.textureHost as BaseTexture).gammaCorrection != 1;
         } else if (this.textureHost instanceof Texture && (this.textureHost as Texture).bitmap) {
            textrueReadGamma = (this.textureHost as Texture).bitmap.gammaCorrection != 1;
         }
      }

      if (textrueReadGamma) {
         this.shaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
      } else {
         this.shaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
      }
      let tex;
      if (value instanceof Texture) {
         tex = value.bitmap;
      } else {
         tex = value;
      }
      this.shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, tex);

   }

   set color(value: Vector4) {
      value && this.shaderData.setVector(ShaderDefines2D.UNIFORM_COLOR, value);
   }

   get color() {
      return this.shaderData.getVector(ShaderDefines2D.UNIFORM_COLOR);
   }

   set materialClip(value:boolean){
      if (value) {
         this.shaderData.addDefine(ShaderDefines2D.MATERIALCLIP);
      } else {
         this.shaderData.removeDefine(ShaderDefines2D.MATERIALCLIP);
      }
   }

   get materialClip():boolean{
      return this.shaderData.hasDefine(ShaderDefines2D.MATERIALCLIP);
   }

   set clipMatDir(value: Vector4) {
      this.shaderData.setVector(ShaderDefines2D.UNIFORM_MATERIAL_CLIPMATDIR, value);
   }

   get clipMatDir() {
      return this.shaderData.getVector(ShaderDefines2D.UNIFORM_MATERIAL_CLIPMATDIR);
   }

   set clipMatPos(value: Vector4) {
      this.shaderData.setVector(ShaderDefines2D.UNIFORM_MATERIAL_CLIPMATPOS, value);
   }

   get clipMatPos() {
      return this.shaderData.getVector(ShaderDefines2D.UNIFORM_MATERIAL_CLIPMATPOS);
   }

   set colorAdd(value: Vector4) {
      this.shaderData.setVector(ShaderDefines2D.UNIFORM_COLORADD, value);
   }

   get colorAdd() {
      return this.shaderData.getVector(ShaderDefines2D.UNIFORM_COLORADD);
   }

   public get blurInfo(): Vector2 {
      return this.shaderData.getVector2(ShaderDefines2D.UNIFORM_BLURINFO);
   }
   public set blurInfo(value: Vector2) {
      this.shaderData.setVector2(ShaderDefines2D.UNIFORM_BLURINFO, value);
   }

   public get u_blurInfo1(): Vector4 {
      return this.shaderData.getVector(ShaderDefines2D.UNIFORM_BLURINFO1);
   }
   public set u_blurInfo1(value: Vector4) {
      this.shaderData.setVector(ShaderDefines2D.UNIFORM_BLURINFO1, value);
   }

   public get u_blurInfo2(): Vector4 {
      return this.shaderData.getVector(ShaderDefines2D.UNIFORM_BLURINFO2);
   }
   public set u_blurInfo2(value: Vector4) {
      this.shaderData.setVector(ShaderDefines2D.UNIFORM_BLURINFO2, value);
   }

   public get u_TexRange(): Vector4 {
      return this.shaderData.getVector(ShaderDefines2D.UNIFORM_TEXRANGE)
   }
   public set u_TexRange(value: Vector4) {
      this.shaderData.setVector(ShaderDefines2D.UNIFORM_TEXRANGE, value);
   }

   public get colorMat(): Matrix4x4 {
      return this.shaderData.getMatrix4x4(ShaderDefines2D.UNIFORM_COLORMAT);
   }
   public set colorMat(value: Matrix4x4) {
      this.shaderData.setMatrix4x4(ShaderDefines2D.UNIFORM_COLORMAT, value);
   }

   public get colorAlpha(): Vector4 {
      return this.shaderData.getVector(ShaderDefines2D.UNIFORM_COLORALPHA);
   }
   public set colorAlpha(value: Vector4) {
      this.shaderData.setVector(ShaderDefines2D.UNIFORM_COLORALPHA, value);
   }

   public get strength_sig2_2sig2_gauss1(): Vector4 {
      return this.shaderData.getVector(ShaderDefines2D.UNIFORM_STRENGTH_SIG2_2SIG2_GAUSS1);
   }
   public set strength_sig2_2sig2_gauss1(value: Vector4) {
      this.shaderData.setVector(ShaderDefines2D.UNIFORM_STRENGTH_SIG2_2SIG2_GAUSS1, value);
   }

   clear() {
      this.shaderData.clearData();
      this.shaderData.clearDefine();
      this.toDefault();
      this.data = this._data;
   }

   destroy() {
      this.shaderData.destroy();
      this._defaultShader = null;
      this._textureHost = null;
   }
}