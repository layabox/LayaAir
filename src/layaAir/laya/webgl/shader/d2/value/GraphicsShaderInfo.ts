import { Const } from "../../../../Const";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector4 } from "../../../../maths/Vector4";
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture2DArray } from "../../../../resource/Texture2DArray";
import { Texture } from "../../../../resource/Texture";
import { Texture2D } from "../../../../resource/Texture2D";
import { BlendModeHandler } from "../../../canvas/BlendMode";
import { ShaderDefines2D } from "../ShaderDefines2D";

const _TEMP_CLIPDIR: Vector4 = new Vector4(Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE);
export class GraphicsShaderInfo {

   shaderData: ShaderData;
   // 使用 Texture2DArray 时的层索引
   texArrayLayer: number = 0;

   constructor() {
      this.shaderData = LayaGL.renderDeviceFactory.createShaderData();
      this.toDefault();
   }

   toDefault() {
      this.clipMatDir = _TEMP_CLIPDIR;
      this.clipMatPos = Vector4.ZERO;
      this.vertexSize = Vector4.ZERO;
      BlendModeHandler.initBlendMode(this.shaderData);
      this.shaderData.addDefine(ShaderDefines2D.TEXTURESHADER);
      this.textureHost = null;
      this.enableVertexSize = false;
      this.materialClip = false;
      this.fillTexture = false;
   }

   private _textureHost: Texture | BaseTexture;

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

      if (!tex) {
         tex = Texture2D.whiteTexture;
      }
      // 切换到数组纹理路径: 传入 Texture2DArray 则启用 USE_TEX_ARRAY 宏与数组uniform
      if (tex instanceof Texture2DArray) {
         this.shaderData.addDefine(ShaderDefines2D.USE_TEX_ARRAY);
         this.shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE_ARRAY, tex);
      } else {
         this.shaderData.removeDefine(ShaderDefines2D.USE_TEX_ARRAY);
         this.shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, tex);
      }

   }

   set enableVertexSize(value: boolean) {
      if (value) {
         this.shaderData.addDefine(ShaderDefines2D.VERTEX_SIZE);
         this.shaderData.removeDefine(ShaderDefines2D.VERTEXALPHA);
      } else {
         this.shaderData.addDefine(ShaderDefines2D.VERTEXALPHA);
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

   public set fillTexture(value: boolean) {
      if (value) {
         this.shaderData.addDefine(ShaderDefines2D.FILLTEXTURE);
      } else {
         this.shaderData.removeDefine(ShaderDefines2D.FILLTEXTURE);
      }
   }

   public get fillTexture(): boolean {
      return this.shaderData.hasDefine(ShaderDefines2D.FILLTEXTURE);
   }

   cloneTo(shaderData: ShaderData) {

      if (this.enableVertexSize) {
         shaderData.addDefine(ShaderDefines2D.VERTEX_SIZE);
         shaderData.setVector(ShaderDefines2D.UNIFORM_VERTEX_SIZE, this.vertexSize);
      }

      if (this.materialClip) {
         shaderData.addDefine(ShaderDefines2D.MATERIALCLIP);
         shaderData.setVector(ShaderDefines2D.UNIFORM_MATERIAL_CLIPMATDIR, this.clipMatDir);
         shaderData.setVector(ShaderDefines2D.UNIFORM_MATERIAL_CLIPMATPOS, this.clipMatPos);
      }

      let textrueReadGamma = this.shaderData.hasDefine(ShaderDefines2D.GAMMATEXTURE);
      if (textrueReadGamma) {
         shaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
      } else {
         shaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
      }

      let tex = (this._textureHost as Texture).bitmap;
      if (!tex) {
         tex = this._textureHost as BaseTexture;
      }
      let fill = this.shaderData.hasDefine(ShaderDefines2D.FILLTEXTURE);
      if (fill) {
         shaderData.addDefine(ShaderDefines2D.FILLTEXTURE);
         shaderData.setVector(ShaderDefines2D.UNIFORM_TEXRANGE, this.u_TexRange);
      } else {
         shaderData.removeDefine(ShaderDefines2D.FILLTEXTURE);
      }
      if (tex instanceof Texture2DArray) {
         shaderData.addDefine(ShaderDefines2D.USE_TEX_ARRAY);
         shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE_ARRAY, tex);
      } else {
         shaderData.removeDefine(ShaderDefines2D.USE_TEX_ARRAY);
         shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, tex);
      }
   }

   clear() {
      this.toDefault();
   }

   destroy() {
      this.shaderData.destroy();
      this._textureHost = null;
   }
}