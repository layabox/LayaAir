import { LayaGL } from "laya/layagl/LayaGL"
	import { Render } from "laya/renders/Render"
	import { BaseTexture } from "laya/resource/BaseTexture"
	import { Texture2D } from "laya/resource/Texture2D"
	import { WebGLContext } from "laya/webgl/WebGLContext"
	
	/**
	   //* <code>RenderTexture</code> 类用于创建渲染目标。
	 */
	export class RenderTexture extends BaseTexture {
		/** @private */
		private static _pool:any[] = [];
		/** @private */
		private static _currentActive:RenderTexture;
		
		/**
		 * 获取当前激活的Rendertexture。
		 */
		 static get currentActive():RenderTexture {
			return RenderTexture._currentActive;
		}
		
		/**
		 *从对象池获取临时渲染目标。
		 */
		 static createFromPool(width:number, height:number, format:number = BaseTexture.FORMAT_R8G8B8, depthStencilFormat:number = BaseTexture.FORMAT_DEPTH_16, filterMode:number = BaseTexture.FILTERMODE_BILINEAR):RenderTexture {
			var tex:RenderTexture;
			for (var i:number = 0, n:number = RenderTexture._pool.length; i < n; i++) {
				tex = RenderTexture._pool[i];
				if (tex._width == width && tex._height == height && tex._format == format && tex._depthStencilFormat == depthStencilFormat && tex._filterMode == filterMode) {
					tex._inPool = false;
					var end:RenderTexture = RenderTexture._pool[n - 1];
					RenderTexture._pool[i] = end;
					RenderTexture._pool.length -= 1;
					return tex;
				}
			}
			tex = new RenderTexture(width, height, format, depthStencilFormat);
			tex.filterMode = filterMode;
			return tex;
		}
		
		/**
		 * 回收渲染目标到对象池,释放后可通过createFromPool复用。
		 */
		 static recoverToPool(renderTexture:RenderTexture):void {
			if (renderTexture._inPool)
				return;
			RenderTexture._pool.push(renderTexture);
			renderTexture._inPool = true;
		}
		
		/** @private */
		private _frameBuffer:any;
		/** @private */
		private _depthStencilBuffer:any;
		/** @private */
		private _depthStencilFormat:number;
		/** @private */
		private _inPool:boolean = false;
		
		/**
		 * 获取深度格式。
		 *@return 深度格式。
		 */
		 get depthStencilFormat():number {
			return this._depthStencilFormat;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  get defaulteTexture():BaseTexture {
			return Texture2D.grayTexture;
		}
		
		/**
		 * @param width  宽度。
		 * @param height 高度。
		 * @param format 纹理格式。
		 * @param depthStencilFormat 深度格式。
		 * 创建一个 <code>RenderTexture</code> 实例。
		 */
		constructor(width:number, height:number, format:number = BaseTexture.FORMAT_R8G8B8, depthStencilFormat:number = BaseTexture.FORMAT_DEPTH_16){
			/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
			super(format, false);
			this._glTextureType = WebGLContext.TEXTURE_2D;
			this._width = width;
			this._height = height;
			this._depthStencilFormat = depthStencilFormat;
			this._create(width, height);
		}
		
		/**
		 * @private
		 */
		private _texImage2D(gl:any, glTextureType:number, width:number, height:number):void {
			var glFormat:number;
			switch (this._format) {
			case BaseTexture.FORMAT_R8G8B8: 
				gl.texImage2D(glTextureType, 0, WebGLContext.RGB, width, height, 0, WebGLContext.RGB, WebGLContext.UNSIGNED_BYTE, null);
				break;
			case BaseTexture.FORMAT_R8G8B8A8: 
				gl.texImage2D(glTextureType, 0, WebGLContext.RGBA, width, height, 0, WebGLContext.RGBA, WebGLContext.UNSIGNED_BYTE, null);
				break;
			case BaseTexture.FORMAT_ALPHA8: 
				gl.texImage2D(glTextureType, 0, WebGLContext.ALPHA, width, height, 0, WebGLContext.ALPHA, WebGLContext.UNSIGNED_BYTE, null);
				break;
			case BaseTexture.RENDERTEXTURE_FORMAT_RGBA_HALF_FLOAT: 
				if (LayaGL.layaGPUInstance._isWebGL2)
					gl.texImage2D(this._glTextureType, 0, WebGLContext.RGBA16F, width, height, 0, WebGLContext.RGBA, WebGLContext.HALF_FLOAT, null);
				else
					gl.texImage2D(this._glTextureType, 0, WebGLContext.RGBA, width, height, 0, WebGLContext.RGBA, LayaGL.layaGPUInstance._oesTextureHalfFloat.HALF_FLOAT_OES, null);//内部格式仍为RGBA
				break;
			default: 
				break;
			}
		}
		
		/**
		 * @private
		 */
		private _create(width:number, height:number):void {
			var gl:WebGLContext = LayaGL.instance;
			this._frameBuffer = gl.createFramebuffer();
			WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
			
			this._texImage2D(gl, this._glTextureType, width, height);
			
			this._setGPUMemory(width * height * 4);
			gl.bindFramebuffer(WebGLContext.FRAMEBUFFER, this._frameBuffer);
			gl.framebufferTexture2D(WebGLContext.FRAMEBUFFER, WebGLContext.COLOR_ATTACHMENT0, WebGLContext.TEXTURE_2D, this._glTexture, 0);
			if (this._depthStencilFormat !== BaseTexture.FORMAT_DEPTHSTENCIL_NONE) {
				this._depthStencilBuffer = gl.createRenderbuffer();
				gl.bindRenderbuffer(WebGLContext.RENDERBUFFER, this._depthStencilBuffer);
				switch (this._depthStencilFormat) {
				case BaseTexture.FORMAT_DEPTH_16: 
					gl.renderbufferStorage(WebGLContext.RENDERBUFFER, WebGLContext.DEPTH_COMPONENT16, width, height);
					gl.framebufferRenderbuffer(WebGLContext.FRAMEBUFFER, WebGLContext.DEPTH_ATTACHMENT, WebGLContext.RENDERBUFFER, this._depthStencilBuffer);
					break;
				case BaseTexture.FORMAT_STENCIL_8: 
					gl.renderbufferStorage(WebGLContext.RENDERBUFFER, WebGLContext.STENCIL_INDEX8, width, height);
					gl.framebufferRenderbuffer(WebGLContext.FRAMEBUFFER, WebGLContext.STENCIL_ATTACHMENT, WebGLContext.RENDERBUFFER, this._depthStencilBuffer);
					break;
				case BaseTexture.FORMAT_DEPTHSTENCIL_16_8: 
					gl.renderbufferStorage(WebGLContext.RENDERBUFFER, WebGLContext.DEPTH_STENCIL, width, height);
					gl.framebufferRenderbuffer(WebGLContext.FRAMEBUFFER, WebGLContext.DEPTH_STENCIL_ATTACHMENT, WebGLContext.RENDERBUFFER, this._depthStencilBuffer);
					break;
				default: 
					throw "RenderTexture: unkonw depth format.";
				}
			}
			
			gl.bindFramebuffer(WebGLContext.FRAMEBUFFER, null);
			gl.bindRenderbuffer(WebGLContext.RENDERBUFFER, null);
			
			this._setWarpMode(WebGLContext.TEXTURE_WRAP_S, this._wrapModeU);
			this._setWarpMode(WebGLContext.TEXTURE_WRAP_T, this._wrapModeV);
			this._setFilterMode(this._filterMode);
			this._setAnisotropy(this._anisoLevel);
			
			this._readyed = true;
			this._activeResource();
		}
		
		/**
		 * @private
		 */
		 _start():void {
			LayaGL.instance.bindFramebuffer(WebGLContext.FRAMEBUFFER, this._frameBuffer);
			RenderTexture._currentActive = this;
			this._readyed = false;
		}
		
		/**
		 * @private
		 */
		 _end():void {
			LayaGL.instance.bindFramebuffer(WebGLContext.FRAMEBUFFER, null);
			RenderTexture._currentActive = null;
			this._readyed = true;
		}
		
		/**
		 * 获得像素数据。
		 * @param x X像素坐标。
		 * @param y Y像素坐标。
		 * @param width 宽度。
		 * @param height 高度。
		 * @return 像素数据。
		 */
		 getData(x:number, y:number, width:number, height:number, out:Uint8Array):Uint8Array {//TODO:检查长度
			if (Render.isConchApp && (<any>window).conchConfig.threadMode == 2) {
				throw "native 2 thread mode use getDataAsync";
			}
			var gl:WebGLContext = LayaGL.instance;
			gl.bindFramebuffer(WebGLContext.FRAMEBUFFER, this._frameBuffer);
			var canRead:boolean = (gl.checkFramebufferStatus(WebGLContext.FRAMEBUFFER) === WebGLContext.FRAMEBUFFER_COMPLETE);
			
			if (!canRead) {
				gl.bindFramebuffer(WebGLContext.FRAMEBUFFER, null);
				return null;
			}
			gl.readPixels(x, y, width, height, WebGLContext.RGBA, WebGLContext.UNSIGNED_BYTE, out);
			gl.bindFramebuffer(WebGLContext.FRAMEBUFFER, null);
			return out;
		}
		
		/**
		 * native多线程
		 */
		 getDataAsync(x:number, y:number, width:number, height:number, callBack:Function):void {
			var gl:any = LayaGL.instance;
			gl.bindFramebuffer(WebGLContext.FRAMEBUFFER, this._frameBuffer);
			gl.readPixelsAsync(x, y, width, height, WebGLContext.RGBA, WebGLContext.UNSIGNED_BYTE, function(data:ArrayBuffer):void {
				callBack(new Uint8Array(data));
			});
			gl.bindFramebuffer(WebGLContext.FRAMEBUFFER, null);
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/ protected _disposeResource():void {
			if (this._frameBuffer) {
				var gl:WebGLContext = LayaGL.instance;
				gl.deleteTexture(this._glTexture);
				gl.deleteFramebuffer(this._frameBuffer);
				gl.deleteRenderbuffer(this._depthStencilBuffer);
				this._glTexture = null;
				this._frameBuffer = null;
				this._depthStencilBuffer = null;
				this._setGPUMemory(0);
			}
		}
	
	}



