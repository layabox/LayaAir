import { LayaGL } from "../../layagl/LayaGL";
import { Render } from "../../renders/Render";
import { BaseTexture } from "../../resource/BaseTexture";
import { FilterMode } from "../../resource/FilterMode";
import { RenderTextureDepthFormat, RenderTextureFormat } from "../../resource/RenderTextureFormat";
import { Texture2D } from "../../resource/Texture2D";
import { LayaGPU } from "../../webgl/LayaGPU";
import { WebGLContext } from "../../webgl/WebGLContext";
import { RenderContext3D } from "../core/render/RenderContext3D";

/**
 * <code>RenderTexture</code> 类用于创建渲染目标。
 */
export class RenderTexture extends BaseTexture {
	/** @internal */
	private static _pool: any[] = [];
	/** @internal */
	private static _currentActive: RenderTexture;

	/**
	 * 获取当前激活的Rendertexture。
	 */
	static get currentActive(): RenderTexture {
		return RenderTexture._currentActive;
	}

	/**
	 *从对象池获取临时渲染目标。
	 */
	 static createFromPool(width: number, height: number, format: number = RenderTextureFormat.R8G8B8, depthStencilFormat: number = RenderTextureDepthFormat.DEPTH_16, mulSamples: number = 1): RenderTexture {
		var tex: RenderTexture;
		for (var i: number = 0, n: number = RenderTexture._pool.length; i < n; i++) {
			tex = RenderTexture._pool[i];
			if (tex._width == width && tex._height == height && tex._format == format && tex._depthStencilFormat == depthStencilFormat && tex._mulSampler == mulSamples) {
				tex._inPool = false;
				var end: RenderTexture = RenderTexture._pool[n - 1];
				RenderTexture._pool[i] = end;
				RenderTexture._pool.length -= 1;
				return tex;
			}
		}
		tex = new RenderTexture(width, height, format, depthStencilFormat,mulSamples);
		tex.lock = true;//TODO:资源不加锁会被GC掉,或GC时对象池清空
		return tex;
	}



	/**
	 * 回收渲染目标到对象池,释放后可通过createFromPool复用。
	 */
	static recoverToPool(renderTexture: RenderTexture): void {
		if (renderTexture._inPool)
			return;
		RenderTexture._pool.push(renderTexture);
		renderTexture._inPool = true;
	}
      
	/** @internal */
	private _frameBuffer: any;
	/** @internal */
	private _depthStencilBuffer: any;
	/** @internal */
	private _depthStencilFormat: number;
	/** @internal */
	private _inPool: boolean = false;

	/** @internal webGL2.0多重采样开启时*/
	private _mulSampler: number = 1;
	/** @internal RenderBuffer*/
	private _mulRenderBuffer: any;
	/** @internal 用来拷贝的frameBuffer*/
	private _mulFrameBuffer: any;
	/** @inrernal 是否使用多重采样*/
	private _mulSamplerRT:boolean = false;


	/** @internal */
	_isCameraTarget: boolean = false;

	/**
	 * 深度格式。
	 */
	get depthStencilFormat(): number {
		return this._depthStencilFormat;
	}
	/**
	 * @override
	 */
	get defaulteTexture(): BaseTexture {
		return Texture2D.grayTexture;
	}

	get mulSampler():number{
		return this._mulSampler;
	}

	/**
	 * @param width  宽度。
	 * @param height 高度。
	 * @param format 纹理格式。
	 * @param depthStencilFormat 深度格式。
	 * 创建一个 <code>RenderTexture</code> 实例。
	 */
	constructor(width: number, height: number, format: RenderTextureFormat = RenderTextureFormat.R8G8B8, depthStencilFormat: RenderTextureDepthFormat = RenderTextureDepthFormat.DEPTH_16,mulSampler:number = 1) {
		super(format, false);
		this._glTextureType = LayaGL.instance.TEXTURE_2D;
		this._width = width;
		this._height = height;
		this._depthStencilFormat = depthStencilFormat;
		this._mipmapCount = 1;//TODO:
		this._mulSampler = mulSampler; 
		this._create(width, height);
	}

	/**
	 * @internal
	 */
	private _create(width: number, height: number): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		var gl2: WebGL2RenderingContext = <WebGL2RenderingContext>gl;
		var glTextureType: number = this._glTextureType;
		var layaGPU: LayaGPU = LayaGL.layaGPUInstance;
		var isWebGL2: Boolean = layaGPU._isWebGL2;
		var format: number = this._format;

		this._frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);

		//color
		this._mulSamplerRT = isWebGL2&&(this._mulSampler>1);

		
		if (format !== RenderTextureFormat.Depth && format !== RenderTextureFormat.ShadowMap) {
			if(this._mulSamplerRT){
				//创建RenderBuffer
				this._mulRenderBuffer = gl2.createRenderbuffer();
				gl2.bindRenderbuffer(gl2.RENDERBUFFER,this._mulRenderBuffer);
				switch(format){
					case RenderTextureFormat.R8G8B8:
						gl2.renderbufferStorageMultisample(gl2.RENDERBUFFER,this._mulSampler,gl2.RGB8,width,height);
						break;
					case RenderTextureFormat.R8G8B8A8:
						gl2.renderbufferStorageMultisample(gl2.RENDERBUFFER,this._mulSampler,gl2.RGBA8,width,height);
						break;
					case RenderTextureFormat.Alpha8:
						gl2.renderbufferStorageMultisample(gl2.RENDERBUFFER,this._mulSampler,gl2.ALPHA,width,height);
						break;
					case RenderTextureFormat.R16G16B16A16:
						gl2.renderbufferStorageMultisample(gl2.RENDERBUFFER,this._mulSampler,gl2.RGBA16F,width,height);
						break;
				}
				//创建绑定RenderBuffer的FrameBuffer
				gl2.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,this._mulRenderBuffer);
			}
			
			WebGLContext.bindTexture(gl, glTextureType, this._glTexture);
			switch (format) {
				case RenderTextureFormat.R8G8B8:
					if (isWebGL2)
						gl2.texStorage2D(glTextureType, this._mipmapCount, gl2.RGB8, width, height);
					else
						gl.texImage2D(glTextureType, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
					break;
				case RenderTextureFormat.R8G8B8A8:
					if (isWebGL2)
						gl2.texStorage2D(glTextureType, this._mipmapCount, gl2.RGBA8, width, height);
					else
						gl.texImage2D(glTextureType, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
					break;
				case RenderTextureFormat.Alpha8:
					if (isWebGL2)
						gl2.texStorage2D(glTextureType, this.mipmapCount, gl2.R8, width, height);
					else
						gl.texImage2D(glTextureType, 0, gl.ALPHA, width, height, 0, gl.ALPHA, gl.UNSIGNED_BYTE, null);
					break;
				case RenderTextureFormat.R16G16B16A16:
					if (isWebGL2)
						gl2.texStorage2D(glTextureType, this._mipmapCount, gl2.RGBA16F, width, height);
					else
						gl.texImage2D(glTextureType, 0, gl.RGBA, width, height, 0, gl.RGBA, layaGPU._oesTextureHalfFloat.HALF_FLOAT_OES, null);//内部格式仍为RGBA
					break;
			}
			if(this._mulSamplerRT){//texture绑到另外的地方
				this._mulFrameBuffer = gl2.createFramebuffer();
				gl.bindFramebuffer(gl.FRAMEBUFFER,this._mulFrameBuffer);
				gl.framebufferTexture2D(gl2.FRAMEBUFFER,gl2.COLOR_ATTACHMENT0,gl2.TEXTURE_2D,this._glTexture,0);
			}else
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._glTexture, 0);
		}

		//depth
		if (format == RenderTextureFormat.Depth || format == RenderTextureFormat.ShadowMap) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
			WebGLContext.bindTexture(gl, glTextureType, this._glTexture);
			this.filterMode = FilterMode.Point;
			switch (this._depthStencilFormat) {
				case RenderTextureDepthFormat.DEPTH_16:
					if (isWebGL2){
						gl2.texStorage2D(glTextureType, this._mipmapCount, gl2.DEPTH_COMPONENT16, width, height);
						//gl2.texImage2D(glTextureType, 0, gl2.DEPTH_COMPONENT16, width, height,0,gl2.DEPTH_COMPONENT,gl2.UNSIGNED_SHORT,null);
					}
					else
						gl.texImage2D(glTextureType, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
					gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._glTexture, 0);
					break;
				case RenderTextureDepthFormat.DEPTHSTENCIL_24_8:
					if (isWebGL2)
						gl2.texStorage2D(glTextureType, this._mipmapCount, gl2.DEPTH24_STENCIL8, width, height);
					else
						gl.texImage2D(glTextureType, 0, gl.DEPTH_STENCIL, width, height, 0, gl.DEPTH_STENCIL, layaGPU._webgl_depth_texture.UNSIGNED_INT_24_8_WEBGL, null);
					gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, this._glTexture, 0);
					break;
				default:
					throw "RenderTexture: depth format RenderTexture must use depthFormat with DEPTH_16 and DEPTHSTENCIL_16_8.";
			}
			if (isWebGL2 && format == RenderTextureFormat.ShadowMap)
				gl2.texParameteri(glTextureType, gl2.TEXTURE_COMPARE_MODE, gl2.COMPARE_REF_TO_TEXTURE);
		}
		else {
			gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
			if (this._depthStencilFormat !== RenderTextureDepthFormat.DEPTHSTENCIL_NONE) {
				this._depthStencilBuffer = gl.createRenderbuffer();
				gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthStencilBuffer);
				if(this._mulSamplerRT){
					switch (this._depthStencilFormat) {
						case RenderTextureDepthFormat.DEPTH_16:
							gl2.renderbufferStorageMultisample(gl.RENDERBUFFER,this._mulSampler,gl2.DEPTH_COMPONENT16,width,height);
							gl2.framebufferRenderbuffer(gl.FRAMEBUFFER,gl2.DEPTH_ATTACHMENT,gl.RENDERBUFFER,this._depthStencilBuffer);
							break;
						case RenderTextureDepthFormat.STENCIL_8:
							gl2.renderbufferStorageMultisample(gl.RENDERBUFFER,this._mulSampler,gl2.STENCIL_INDEX8,width,height);
							gl2.framebufferRenderbuffer(gl.FRAMEBUFFER,gl2.STENCIL_ATTACHMENT,gl.RENDERBUFFER,this._depthStencilBuffer);
							break;
						case RenderTextureDepthFormat.DEPTHSTENCIL_24_8:
							gl2.renderbufferStorageMultisample(gl.RENDERBUFFER,this._mulSampler,gl2.DEPTH_STENCIL,width,height);
							gl2.framebufferRenderbuffer(gl.FRAMEBUFFER,gl2.DEPTH_STENCIL_ATTACHMENT,gl.RENDERBUFFER,this._depthStencilBuffer);
							break;
						default:
							throw "RenderTexture: unkonw depth format.";
					}
				}
				else{
					switch (this._depthStencilFormat) {
						case RenderTextureDepthFormat.DEPTH_16:
							gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
							gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl2.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
							break;
						case RenderTextureDepthFormat.STENCIL_8:
							gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, width, height);
							gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
							break;
						case RenderTextureDepthFormat.DEPTHSTENCIL_24_8:
							gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
							gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
							break;
						default:
							throw "RenderTexture: unkonw depth format.";
					}
				}
				gl.bindRenderbuffer(gl.RENDERBUFFER, null);
			}
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);
		this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);
		this._setFilterMode(this._filterMode);
		this._setAnisotropy(this._anisoLevel);

		this._readyed = true;
		this._activeResource();
		this._setGPUMemory(width * height * 4);
	}

	/**
	 * @internal
	 */
	_start(): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
		RenderTexture._currentActive = this;
		(this._isCameraTarget) && (RenderContext3D._instance.invertY = true);//if this is offScreenRenderTexture need invertY
		this._readyed = false;
	}

	/**
	 * @internal
	 */
	_end(): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		var gl2: WebGL2RenderingContext = <WebGL2RenderingContext>gl;
		if(this._mulSamplerRT){
			gl2.bindFramebuffer(gl2.READ_FRAMEBUFFER,this._frameBuffer);
			gl2.bindFramebuffer(gl2.DRAW_FRAMEBUFFER,this._mulFrameBuffer);
			gl2.clearBufferfv(gl2.COLOR,0,[0.0,0.0,0.0,0.0]);
			
			gl2.blitFramebuffer(0,0,this.width,this.height,0,0,this._width,this._height,gl2.COLOR_BUFFER_BIT,gl.NEAREST);
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
		RenderTexture._currentActive = null;
		(this._isCameraTarget) && (RenderContext3D._instance.invertY = false);
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
	getData(x: number, y: number, width: number, height: number, out: Uint8Array|Float32Array): Uint8Array|Float32Array {//TODO:检查长度
		if (Render.isConchApp && (<any>window).conchConfig.threadMode == 2) {
			throw "native 2 thread mode use getDataAsync";
		}
		var gl: WebGLRenderingContext = LayaGL.instance;
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
		var canRead: boolean = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE);

		if (!canRead) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			return null;
		}
		switch(this.format){
			case RenderTextureFormat.R8G8B8:
				gl.readPixels(x,y,width,height, gl.RGBA,gl.UNSIGNED_BYTE,out);
				break;
			case RenderTextureFormat.R8G8B8A8:
				gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, out);
				break;
			case RenderTextureFormat.R16G16B16A16:
				gl.readPixels(x,y,width,height,gl.RGBA,gl.FLOAT,out);
				debugger;
				break;
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return out;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _disposeResource(): void {
		if (this._frameBuffer) {
			var gl: WebGLRenderingContext = LayaGL.instance;
			gl.deleteTexture(this._glTexture);
			gl.deleteFramebuffer(this._frameBuffer);
			gl.deleteRenderbuffer(this._depthStencilBuffer);
			this._glTexture = null;
			this._frameBuffer = null;
			this._depthStencilBuffer = null;
			this._setGPUMemory(0);
		}
	}

	/**
	 * @internal
	 * native多线程
	 */
	getDataAsync(x: number, y: number, width: number, height: number, callBack: Function): void {
		var gl: any = LayaGL.instance;
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
		gl.readPixelsAsync(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, function (data: ArrayBuffer): void {
			callBack(new Uint8Array(data));
		});
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

}



