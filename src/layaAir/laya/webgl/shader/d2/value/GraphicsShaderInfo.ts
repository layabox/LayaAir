import { Config } from "../../../../../Config";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector4 } from "../../../../maths/Vector4";
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture } from "../../../../resource/Texture";
import { Texture2D } from "../../../../resource/Texture2D";
import { TextureDimension } from "../../../../RenderEngine/RenderEnum/TextureDimension";
import { BlendMode, BlendModeHandler } from "../../../canvas/BlendMode";
import { ShaderDefines2D } from "../ShaderDefines2D";

export class GraphicsShaderInfo {

   shaderData: ShaderData;
   private _enableVertexSize: boolean = false;
   private _fillTexture: boolean = false;
   private _texRange: Vector4 = null;
   private _vertexSize: Vector4 = null;
   private _isTextrueReadGamma: boolean = false;
   private _bitmap: BaseTexture;
   /** @internal */
   defineBits: number = 0;
   // 使用 Texture2DArray 时的层索引
   texArrayLayer: number = 0;

   _blend: BlendMode | null = null;

   constructor() {
      this.shaderData = LayaGL.renderDeviceFactory.createShaderData();
      this.shaderData.addDefine(ShaderDefines2D.TEXTURESHADER);
      this.defineBits |= ShaderDefines2D.DEFINE_BIT_TEXTURESHADER;
      this.shaderData.addDefine(ShaderDefines2D.VERTEXALPHA);
      this.defineBits |= ShaderDefines2D.DEFINE_BIT_VERTEXALPHA;
      if (Config.uvClipMode === "gpu") {
         this.shaderData.addDefine(ShaderDefines2D.UV_CLIP_GPU);
         this.defineBits |= ShaderDefines2D.DEFINE_BIT_UV_CLIP_GPU;
      }
      this.toDefault();
      BlendModeHandler.initBlendMode(this.shaderData);
   }

   private _setDefineBit(bit: number, enabled: boolean): void {
      if (enabled) {
         this.defineBits |= bit;
      } else {
         this.defineBits &= ~bit;
      }
   }

   toDefault() {
      // 待测试,没销毁的sprite会导致使用过的资源释放不掉
      this._textureHost = null;
      this.enableVertexSize = false;
      this.fillTexture = false;
   }

   private _textureHost: Texture | BaseTexture;

   public get textureHost(): Texture | BaseTexture {
      return this._textureHost
   }
   public set textureHost(value: Texture | BaseTexture) {
      this._textureHost = value;
      let textrueReadGamma: boolean = false;
      if (value) {
         if (value instanceof BaseTexture) {
            textrueReadGamma = (this.textureHost as BaseTexture).gammaCorrection != 1;
         } else if (value instanceof Texture && (value as Texture).bitmap) {
            textrueReadGamma = (value as Texture).bitmap.gammaCorrection != 1;
         }
      }

      if (textrueReadGamma != this._isTextrueReadGamma) {
         this._isTextrueReadGamma = textrueReadGamma;
         if (textrueReadGamma) {
            this.shaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
            this._setDefineBit(ShaderDefines2D.DEFINE_BIT_GAMMATEXTURE, true);
         } else {
            this.shaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
            this._setDefineBit(ShaderDefines2D.DEFINE_BIT_GAMMATEXTURE, false);
         }
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

      if (this._bitmap != tex) { 
         this._bitmap = tex as BaseTexture;
         // 切换到数组纹理路径: 传入 Texture2DArray 则启用 USE_TEX_ARRAY 宏与数组uniform
         if (this.isTextureArray(tex)) {
            this.shaderData.addDefine(ShaderDefines2D.USE_TEX_ARRAY);
            this._setDefineBit(ShaderDefines2D.DEFINE_BIT_USE_TEX_ARRAY, true);
            this.shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE_ARRAY, tex);
         } else {
            this.shaderData.removeDefine(ShaderDefines2D.USE_TEX_ARRAY);
            this._setDefineBit(ShaderDefines2D.DEFINE_BIT_USE_TEX_ARRAY, false);
            this.shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, tex);
         }
      }
   }

   set enableVertexSize(value: boolean) {
      if (value == this._enableVertexSize) return;
      this._enableVertexSize = value;

      if (value) {
         this.shaderData.addDefine(ShaderDefines2D.VERTEX_SIZE);
         this.shaderData.removeDefine(ShaderDefines2D.VERTEXALPHA);
         this._setDefineBit(ShaderDefines2D.DEFINE_BIT_VERTEX_SIZE, true);
         this._setDefineBit(ShaderDefines2D.DEFINE_BIT_VERTEXALPHA, false);
      } else {
         this.shaderData.addDefine(ShaderDefines2D.VERTEXALPHA);
         this.shaderData.removeDefine(ShaderDefines2D.VERTEX_SIZE);
         this._setDefineBit(ShaderDefines2D.DEFINE_BIT_VERTEXALPHA, true);
         this._setDefineBit(ShaderDefines2D.DEFINE_BIT_VERTEX_SIZE, false);
      }
   }

   get enableVertexSize(): boolean {
      return this._enableVertexSize;
   }

   set vertexSize(value: Vector4) {
      // if (value == this._vertexSize) return;
      this._vertexSize = value;
      this.shaderData.setVector(ShaderDefines2D.UNIFORM_VERTEX_SIZE, value);
   }

   get vertexSize(): Vector4 {
      return this._vertexSize;
   }
   public get u_TexRange(): Vector4 {
      return this._texRange;
   }
   public set u_TexRange(value: Vector4) {
      // if (value == this._texRange) return;
      this._texRange = value;
      this.shaderData.setVector(ShaderDefines2D.UNIFORM_TEXRANGE, value);
   }
   public set fillTexture(value: boolean) {
      if (value == this._fillTexture) return;
      this._fillTexture = value;
      if (value) {
         this.shaderData.addDefine(ShaderDefines2D.FILLTEXTURE);
         this._setDefineBit(ShaderDefines2D.DEFINE_BIT_FILLTEXTURE, true);
      } else {
         this.shaderData.removeDefine(ShaderDefines2D.FILLTEXTURE);
         this._setDefineBit(ShaderDefines2D.DEFINE_BIT_FILLTEXTURE, false);
      }
   }

   public get fillTexture(): boolean {
      return this._fillTexture;
   }

   cloneTo(shaderData: ShaderData) {

      if (this.enableVertexSize) {
         shaderData.addDefine(ShaderDefines2D.VERTEX_SIZE);
         shaderData.setVector(ShaderDefines2D.UNIFORM_VERTEX_SIZE, this.vertexSize);
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
      if (this.isTextureArray(tex)) {
         shaderData.addDefine(ShaderDefines2D.USE_TEX_ARRAY);
         shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE_ARRAY, tex);
      } else {
         shaderData.removeDefine(ShaderDefines2D.USE_TEX_ARRAY);
         shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, tex);
      }
   }

   clear() {
      if (this._blend) {
         BlendModeHandler.initBlendMode(this.shaderData);
         this._blend = null;
      }
      this.toDefault();
   }

   destroy() {
      this.shaderData.destroy();
      this._textureHost = null;
   }

   private isTextureArray(tex: BaseTexture): boolean {
      return tex && tex.dimension === TextureDimension.Texture2DArray;
   }
}
