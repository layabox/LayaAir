import { LayaGL } from "../../layagl/LayaGL";
import { Render } from "../../renders/Render";
import { BaseTexture } from "../../resource/BaseTexture";
import { FilterMode } from "../../resource/FilterMode";
import { RenderTextureDepthFormat, RenderTextureFormat, RTDEPTHATTACHMODE } from "../../resource/RenderTextureFormat";
import { Texture2D } from "../../resource/Texture2D";
import { WarpMode } from "../../resource/WrapMode";
import { LayaGPU } from "../../webgl/LayaGPU";
import { WebGLContext } from "../../webgl/WebGLContext";
import { RenderContext3D } from "../core/render/RenderContext3D";

/**
 * <code>RenderTexture</code> 类用于创建渲染目标。
 */
export class RenderTexture extends BaseTexture {
	/** @internal */
	protected static _pool: any[] = [];
	/** @internal */
	protected static _currentActive: RenderTexture;

	/**
	 * 获取当前激活的Rendertexture。
	 */
	static get currentActive(): RenderTexture {
		return RenderTexture._currentActive;
	}

	/**
	 *从对象池获取临时渲染目标。
	 */
	static createFromPool(width: number, height: number, format: number = RenderTextureFormat.R8G8B8, depthStencilFormat: RenderTextureDepthFormat = RenderTextureDepthFormat.DEPTH_16, mulSamples: number = 1, mipmap: boolean = false): RenderTexture {
		var tex: RenderTexture;
		
		// todo mipmap 判断
		mipmap = mipmap && (width & (width -1)) === 0 && (height & (height -1)) === 0;

		for (var i: number = 0, n: number = RenderTexture._pool.length; i < n; i++) {
			tex = RenderTexture._pool[i];
			if (tex._width == width && tex._height == height && tex._format == format && tex._depthStencilFormat == depthStencilFormat && tex._mulSampler == mulSamples && tex._mipmap == mipmap) {
				tex._inPool = false;
				var end: RenderTexture = RenderTexture._pool[n - 1];
				RenderTexture._pool[i] = end;
				RenderTexture._pool.length -= 1;
				return tex;
			}
		}
		// if (LayaGL.layaGPUInstance._isWebGL2 && mulSamples != 1) {

		// }
		tex = new RenderTexture(width, height, format, depthStencilFormat);
		tex.lock = true;//TODO:资源不加锁会被GC掉,或GC时对象池清空
		return tex;
	}



	/**
	 * 回收渲染目标到对象池,释放后可通过createFromPool复用。
	 */
	static recoverToPool(renderTexture: RenderTexture): void {
		if (renderTexture._inPool||renderTexture.destroyed)
			return;
		RenderTexture._pool.push(renderTexture);
		renderTexture._inPool = true;
	}

	/** @internal 最后绑定到主画布上的结果 此值可能为null*/
	private static _bindCanvasRender: RenderTexture;
	/**
	 * 绑定到主画布上的RenderTexture
	 */
	static get bindCanvasRender(): RenderTexture {
		return RenderTexture._bindCanvasRender;
	}

	static set bindCanvasRender(value: RenderTexture) {
		if (value != this._bindCanvasRender)
			(this._bindCanvasRender) && RenderTexture.recoverToPool(this._bindCanvasRender);
		this._bindCanvasRender = value;
	}



	/** @internal */
	protected _frameBuffer: any;
	/** @internal */
	protected _depthStencilTexture: BaseTexture;
	/** @internal */
	protected _depthStencilBuffer: any;
	/** @internal */
	protected _depthStencilFormat: number;
	/** @internal */
	protected _inPool: boolean = false;


	protected _mulSampler: number = 1;

	/** @inrernal 是否使用多重采样*/
	protected _mulSamplerRT: boolean = false;

	protected _depthAttachMode: RTDEPTHATTACHMODE = RTDEPTHATTACHMODE.RENDERBUFFER;

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

	get mulSampler(): number {
		return this._mulSampler;
	}

	get depthStencilTexture(): BaseTexture {
		return this._depthStencilTexture;
	}

	/**
	 * FramBuffer的DepthAttach绑定模式
	 */
	set depthAttachMode(value: RTDEPTHATTACHMODE) {
		if (this._depthAttachMode != value) {
			this._depthAttachMode = value;
			switch (value) {
				case RTDEPTHATTACHMODE.RENDERBUFFER:
					this._createGLDepthRenderbuffer(this.width, this.height);
					if (this._depthStencilTexture) {
						var gl: WebGLRenderingContext = LayaGL.instance;
						gl.deleteTexture(this._glTexture);
						this._depthStencilTexture = null;
					}

					break;
				case RTDEPTHATTACHMODE.TEXTURE:
					this._createGLDepthTexture(this.width, this.height);
					if (this._depthStencilBuffer) {
						var gl: WebGLRenderingContext = LayaGL.instance;
						gl.deleteRenderbuffer(this._depthStencilBuffer);
						this._depthStencilBuffer = null;
					}
					break;
			}
		}
	}

	get depthAttachMode() {
		return this._depthAttachMode;
	}

	/**
	 * 创建一个 <code>RenderTexture</code> 实例。
	 * @param width  宽度。
	 * @param height 高度。
	 * @param format 纹理格式。
	 * @param depthStencilFormat 深度格式。
	 * @param mipmap 是否生成mipmap。
	 */
	constructor(width: number, height: number, format: RenderTextureFormat = RenderTextureFormat.R8G8B8, depthStencilFormat: RenderTextureDepthFormat = RenderTextureDepthFormat.DEPTH_16, mipmap: boolean = false) {
		super(format, false);
		this._glTextureType = LayaGL.instance.TEXTURE_2D;
		this._width = width;
		this._height = height;
		this._depthStencilFormat = depthStencilFormat;
		this._mipmapCount = 1;
		if (mipmap && this._isPot(width) && this._isPot(height)) {
			this._mipmap = mipmap;
			let mipmapCount = Math.max(Math.ceil(Math.log2(width)) + 1, Math.ceil(Math.log2(height)) + 1);
			this._mipmapCount = mipmapCount;
		}

		this._create(width, height);
	}

	/**
	 * @internal
	 */
	protected _create(width: number, height: number): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		var gl2: WebGL2RenderingContext = <WebGL2RenderingContext>gl;

		var layaGPU: LayaGPU = LayaGL.layaGPUInstance;
		var isWebGL2: Boolean = layaGPU._isWebGL2;
		var format: number = this._format;

		this._frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
		//set gl_Texture
		this._creatGlTexture(width, height);
		if (format !== RenderTextureFormat.Depth && format !== RenderTextureFormat.ShadowMap) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._glTexture, 0);
			//set Depth_Gl
			this._createGLDepthRenderbuffer(width, height);
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);
		this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);
		this._setFilterMode(this._filterMode);
		this._setAnisotropy(this._anisoLevel);

		this._readyed = true;
		this._activeResource();
		// todo ?
		let gpuMemory = width * height * 4;
		if (this._mipmap) {
			gpuMemory *= 4 / 3;
		}
		this._setGPUMemory(gpuMemory);
	}

	/**
	 * 创建gl_Texture的类型，当渲染器拿到此RT时，会将gl_texture的值传给渲染
	 * @param width 
	 * @param height 
	 */
	protected _creatGlTexture(width: number, height: number) {
		var glTextureType: number = this._glTextureType;
		var gl: WebGLRenderingContext = LayaGL.instance;
		var gl2: WebGL2RenderingContext = <WebGL2RenderingContext>gl;
		var layaGPU: LayaGPU = LayaGL.layaGPUInstance;
		var isWebGL2: Boolean = layaGPU._isWebGL2;
		var format: number = this._format;
		WebGLContext.bindTexture(gl, glTextureType, this._glTexture);
		if (format !== RenderTextureFormat.Depth && format !== RenderTextureFormat.ShadowMap) {
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
		}
		else if (format == RenderTextureFormat.Depth || format == RenderTextureFormat.ShadowMap) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
			this.filterMode = FilterMode.Point;
			WebGLContext.bindTexture(gl, glTextureType, this._glTexture);
			switch (this._depthStencilFormat) {
				case RenderTextureDepthFormat.DEPTH_16:
					if (isWebGL2) {
						gl2.texStorage2D(glTextureType, this._mipmapCount, gl2.DEPTH_COMPONENT16, width, height);
					}
					else
						gl.texImage2D(glTextureType, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
					gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._glTexture, 0);
					break;
				case RenderTextureDepthFormat.DEPTH_32:
					if (isWebGL2) {
						gl2.texStorage2D(glTextureType, this._mipmapCount, gl2.DEPTH_COMPONENT32F, width, height);
					}
					else
						gl.texImage2D(glTextureType, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
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
			if (isWebGL2 && format == RenderTextureFormat.ShadowMap) {
				gl2.texParameteri(glTextureType, gl2.TEXTURE_COMPARE_MODE, gl2.COMPARE_REF_TO_TEXTURE);
				gl2.texParameteri(glTextureType, gl2.TEXTURE_COMPARE_FUNC, gl2.LESS);
			}

		}
		WebGLContext.bindTexture(gl, glTextureType, null)
	}


	/**
	 * 创建gl_DepthTexture的类型，用来存储深度信息，可以拷贝出来当贴图用
	 * @param width 
	 * @param height 
	 */
	protected _createGLDepthTexture(width: number, height: number) {
		var glTextureType: number = this._glTextureType;
		var layaGPU: LayaGPU = LayaGL.layaGPUInstance;
		var isWebGL2: Boolean = layaGPU._isWebGL2;
		var gl: WebGLRenderingContext = LayaGL.instance;
		var gl2: WebGL2RenderingContext = <WebGL2RenderingContext>gl;
		if (this._depthStencilFormat !== RenderTextureDepthFormat.DEPTHSTENCIL_NONE) {
			//creat depth_gl_Texture
			this._depthStencilTexture = new BaseTexture(RenderTextureFormat.Depth, false);
			this._depthStencilTexture.lock = true;
			this._depthStencilTexture.width = width;
			this._depthStencilTexture.height = height;
			this._depthStencilTexture.mipmapCount = 1;
			this._depthStencilTexture._glTextureType = LayaGL.instance.TEXTURE_2D;
			this._depthStencilTexture._readyed = true;

			gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
			this._depthStencilTexture.filterMode = FilterMode.Point;
			this._depthStencilTexture.wrapModeU = WarpMode.Clamp;
			this._depthStencilTexture.wrapModeV = WarpMode.Clamp;

			WebGLContext.bindTexture(gl, this._depthStencilTexture._glTextureType, this._depthStencilTexture._getSource());
			switch (this._depthStencilFormat) {
				case RenderTextureDepthFormat.DEPTH_16:
					if (isWebGL2) {
						gl2.texStorage2D(glTextureType, this._mipmapCount, gl2.DEPTH_COMPONENT16, width, height);
					}
					else {
						gl.texImage2D(glTextureType, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
					}
					gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._depthStencilTexture._getSource(), 0);
					break;
				case RenderTextureDepthFormat.DEPTHSTENCIL_24_8:
					if (isWebGL2) {
						gl2.texStorage2D(glTextureType, this._mipmapCount, gl2.DEPTH24_STENCIL8, width, height);
					}
					else {
						gl.texImage2D(glTextureType, 0, gl.DEPTH_STENCIL, width, height, 0, gl.DEPTH_STENCIL, layaGPU._webgl_depth_texture.UNSIGNED_INT_24_8_WEBGL, null);
					}
					gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, this._depthStencilTexture._getSource(), 0);
					break;
				case RenderTextureDepthFormat.DEPTH_32:
					if (isWebGL2) {
						gl2.texStorage2D(glTextureType, this._mipmapCount, gl2.DEPTH_COMPONENT32F, width, height);
					}
					else {
						gl.texImage2D(glTextureType, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
					}
					gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._depthStencilTexture._getSource(), 0);
					break;
				default:
					break;
			}
		}
	}

	/**
	 * 创建gl_DepthRender的类型，用来存储深度信息
	 * @param width 
	 * @param height 
	 */
	protected _createGLDepthRenderbuffer(width: number, height: number) {
		var gl: WebGLRenderingContext = LayaGL.instance;
		var gl2: WebGL2RenderingContext = <WebGL2RenderingContext>gl;
		if (this._depthStencilFormat !== RenderTextureDepthFormat.DEPTHSTENCIL_NONE) {
			this._depthStencilBuffer = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthStencilBuffer);
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
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		}
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

		if (this.mipmap) {
			WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
			gl.generateMipmap(this._glTextureType);
			WebGLContext.bindTexture(gl, this._glTextureType, null);
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
	getData(x: number, y: number, width: number, height: number, out: Uint8Array | Float32Array): Uint8Array | Float32Array {//TODO:检查长度
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
		switch (this.format) {
			case RenderTextureFormat.R8G8B8:
				gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, out);
				break;
			case RenderTextureFormat.R8G8B8A8:
				gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, out);
				break;
			case RenderTextureFormat.R16G16B16A16:
				gl.readPixels(x, y, width, height, gl.RGBA, gl.FLOAT, out);
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
			this._glTexture && gl.deleteTexture(this._glTexture);
			this._frameBuffer && gl.deleteFramebuffer(this._frameBuffer);
			this._depthStencilBuffer && gl.deleteRenderbuffer(this._depthStencilBuffer);
			this._depthStencilTexture && this._depthStencilTexture.destroy();
			this._glTexture = null;
			this._frameBuffer = null;
			this._depthStencilBuffer = null;
			this._depthStencilTexture = null;
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



