import { Render } from "../../renders/Render"
import { Handler } from "../../utils/Handler"
import { WebGLContext } from "../../webgl/WebGLContext"
import { BaseTexture } from "../../resource/BaseTexture"
import { LayaGL } from "../../layagl/LayaGL";
import { ILaya } from "../../../ILaya";
	
	/**
	 * <code>TextureCube</code> 类用于生成立方体纹理。
	 */
	export class TextureCube extends BaseTexture {
		/**TextureCube资源。*/
		static TEXTURECUBE:string = "TEXTURECUBE";
		
		/**灰色纯色纹理。*/
		 static grayTexture:TextureCube;
		
		/**
		 * @internal
		 */
		 static __init__():void {
			var pixels:Uint8Array = new Uint8Array(3);
			pixels[0] = 128;
			pixels[1] = 128;
			pixels[2] = 128;
			TextureCube.grayTexture = new TextureCube(BaseTexture.FORMAT_R8G8B8, false);
			TextureCube.grayTexture.setSixSidePixels(1, 1, [pixels, pixels, pixels, pixels, pixels, pixels]);
			TextureCube.grayTexture.lock = true;//锁住资源防止被资源管理释放
		}
		
		/**
		 * @inheritDoc
		 */
		 static _parse(data:any, propertyParams:any = null, constructParams:any[] = null):TextureCube {
			var texture:TextureCube = constructParams ? new TextureCube(constructParams[0], constructParams[1]) : new TextureCube();
			texture.setSixSideImageSources(data);
			return texture;
		}
		
		/**
		 * 加载TextureCube。
		 * @param url TextureCube地址。
		 * @param complete 完成回调。
		 */
		 static load(url:string, complete:Handler):void {
			ILaya.loader.create(url, complete, null, TextureCube.TEXTURECUBE);
		}
		
		/** @internal */
		private _premultiplyAlpha:number;
		
		/**
		 * @inheritDoc
		 */
		/*override*/  get defaulteTexture():BaseTexture {
			return TextureCube.grayTexture;
		}
		
		/**
		 * 创建一个 <code>TextureCube</code> 实例。
		 * @param	format 贴图格式。
		 * @param	mipmap 是否生成mipmap。
		 */
		constructor(format:number = BaseTexture.FORMAT_R8G8B8, mipmap:boolean = false){
			
			super(format, mipmap);
			this._glTextureType = WebGL2RenderingContext.TEXTURE_CUBE_MAP;
		}
		
		/**
		 * 通过六张图片源填充纹理。
		 * @param 图片源数组。
		 */
		 setSixSideImageSources(source:any[], premultiplyAlpha:boolean = false):void {
			var width:number;
			var height:number;
			for (var i:number = 0; i < 6; i++) {
				var img:any= source[i];
				if (!img){//TODO:
					console.log("TextureCube: image Source can't be null.");
					return;
				}
				
				var nextWidth:number = img.width;
				var nextHeight:number = img.height;
				if (i > 0) {
					if (width !== nextWidth){
						console.log("TextureCube: each side image's width and height must same.");
						return;
					}
				}
				
				width = nextWidth;
				height = nextHeight;
				if (width !== height){
					console.log("TextureCube: each side image's width and height must same.");
					return;
				}
			}
			this._width = width;
			this._height = height;
			
			var gl:WebGL2RenderingContext = LayaGL.instance;
			WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
			var glFormat:number = this._getGLFormat();
			
			if (!Render.isConchApp) {
				(premultiplyAlpha) && (gl.pixelStorei(WebGL2RenderingContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true));
				gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFormat, glFormat, WebGL2RenderingContext.UNSIGNED_BYTE, source[0]);//back
				gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFormat, glFormat, WebGL2RenderingContext.UNSIGNED_BYTE, source[1]);//front
				gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFormat, glFormat, WebGL2RenderingContext.UNSIGNED_BYTE, source[2]);//right
				gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFormat, glFormat, WebGL2RenderingContext.UNSIGNED_BYTE, source[3]);//left
				gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFormat, glFormat, WebGL2RenderingContext.UNSIGNED_BYTE, source[4]);//up
				gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFormat, glFormat, WebGL2RenderingContext.UNSIGNED_BYTE, source[5]);//down
				(premultiplyAlpha) && (gl.pixelStorei(WebGL2RenderingContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false));
			} else {
				if (premultiplyAlpha == true) {
					for (var j:number = 0; j < 6; j++)
						source[j].setPremultiplyAlpha(premultiplyAlpha);
				}
				gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, source[0]);//back
				gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, source[1]);//front
				gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, source[2]);//right
				gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, source[3]);//left
				gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, source[4]);//up
				gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, source[5]);//down
			}
			if (this._mipmap && this._isPot(width) && this._isPot(height)) {
				gl.generateMipmap(this._glTextureType);
				this._setGPUMemory(width * height * 4 * (1 + 1 / 3) * 6);
			} else {
				this._setGPUMemory(width * height * 4 * 6);
			}
			
			this._setWarpMode(WebGL2RenderingContext.TEXTURE_WRAP_S, this._wrapModeU);
			this._setWarpMode(WebGL2RenderingContext.TEXTURE_WRAP_T, this._wrapModeV);
			this._setFilterMode(this._filterMode);
			this._readyed = true;
			this._activeResource();
		}
		
		/**
		 * 通过六张图片源填充纹理。
		 * @param 图片源数组。
		 */
		 setSixSidePixels(width:number, height:number, pixels:any[]):void {
			if (width <= 0 || height <= 0)
				throw new Error("TextureCube:width or height must large than 0.");
			
			if (!pixels)
				throw new Error("TextureCube:pixels can't be null.");
			this._width = width;
			this._height = height;
			
			var gl:WebGL2RenderingContext = LayaGL.instance;
			WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
			var glFormat:number = this._getGLFormat();
			gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFormat, width, height, 0, glFormat, WebGL2RenderingContext.UNSIGNED_BYTE, pixels[0]);//back
			gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFormat, width, height, 0, glFormat, WebGL2RenderingContext.UNSIGNED_BYTE, pixels[1]);//front
			gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFormat, width, height, 0, glFormat, WebGL2RenderingContext.UNSIGNED_BYTE, pixels[2]);//right
			gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFormat, width, height, 0, glFormat, WebGL2RenderingContext.UNSIGNED_BYTE, pixels[3]);//left
			gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFormat, width, height, 0, glFormat, WebGL2RenderingContext.UNSIGNED_BYTE, pixels[4]);//up
			gl.texImage2D(WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFormat, width, height, 0, glFormat, WebGL2RenderingContext.UNSIGNED_BYTE, pixels[5]);//down
			if (this._mipmap && this._isPot(width) && this._isPot(height)) {
				gl.generateMipmap(this._glTextureType);
				this._setGPUMemory(width * height * 4 * (1 + 1 / 3) * 6);
			} else {
				this._setGPUMemory(width * height * 4 * 6);
			}
			
			this._setWarpMode(WebGL2RenderingContext.TEXTURE_WRAP_S, this._wrapModeU);
			this._setWarpMode(WebGL2RenderingContext.TEXTURE_WRAP_T, this._wrapModeV);
			this._setFilterMode(this._filterMode);
			this._readyed = true;
			this._activeResource();
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/ protected _recoverResource():void {
			//TODO:补充
		}
	
	}


