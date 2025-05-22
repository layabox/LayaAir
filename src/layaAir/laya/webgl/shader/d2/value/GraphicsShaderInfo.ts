import { Const } from "../../../../Const";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector4 } from "../../../../maths/Vector4";
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture } from "../../../../resource/Texture";
import { Texture2D } from "../../../../resource/Texture2D";
import { BlendMode } from "../../../canvas/BlendMode";
import { ShaderDefines2D } from "../ShaderDefines2D";

const _TEMP_CLIPDIR: Vector4 = new Vector4(Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE);
export class GraphicsShaderInfo {

   shaderData: ShaderData;

   constructor() {
      this.shaderData = LayaGL.renderDeviceFactory.createShaderData();
      this.toDefault();
   }

   toDefault() {
      this.clipMatDir = _TEMP_CLIPDIR;
      this.clipMatPos = Vector4.ZERO;
      this.vertexSize = Vector4.ZERO;
      BlendMode.initBlendMode(this.shaderData);
      this.shaderData.addDefine(ShaderDefines2D.TEXTURESHADER);
      this.textureHost = Texture2D.whiteTexture;
   }

   private _textureHost: Texture | BaseTexture;

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

   set enableVertexSize(value: boolean) {
      if (value) {
         this.shaderData.addDefine(ShaderDefines2D.VERTEX_SIZE);
      } else {
         this.shaderData.removeDefine(ShaderDefines2D.VERTEX_SIZE);
      }
   }

   get enableVertexSize(): boolean {
      return this.shaderData.hasDefine(ShaderDefines2D.VERTEX_SIZE);
   }

   set vertexSize(value: Vector4) {
      this.shaderData.setVector(ShaderDefines2D.UNIFORM_VERTEX_SIZE, value);
   }

   get vertexSize(): Vector4 {
      return this.shaderData.getVector(ShaderDefines2D.UNIFORM_VERTEX_SIZE);
   }

   set materialClip(value: boolean) {
      if (value) {
         this.shaderData.addDefine(ShaderDefines2D.MATERIALCLIP);
      } else {
         this.shaderData.removeDefine(ShaderDefines2D.MATERIALCLIP);
      }
   }

   get materialClip(): boolean {
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

   public get u_TexRange(): Vector4 {
      return this.shaderData.getVector(ShaderDefines2D.UNIFORM_TEXRANGE)
   }
   public set u_TexRange(value: Vector4) {
      this.shaderData.setVector(ShaderDefines2D.UNIFORM_TEXRANGE, value);
   }

   clear() {
      this.shaderData.clearData();
      this.shaderData.clearDefine();
      this.toDefault();
   }

   destroy() {
      this.shaderData.destroy();
      this._textureHost = null;
   }
}