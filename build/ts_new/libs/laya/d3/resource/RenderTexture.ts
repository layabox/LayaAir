import { LayaGL } from "../../layagl/LayaGL";
import { Render } from "../../renders/Render";
import { BaseTexture } from "../../resource/BaseTexture";
import { RenderTextureDepthFormat, RenderTextureFormat } from "../../resource/RenderTextureFormat";
import { Texture2D } from "../../resource/Texture2D";
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
	static createFromPool(width: number, height: number, format: number = RenderTextureFormat.R8G8B8, depthStencilFormat: number = RenderTextureDepthFormat.DEPTH_16, filterMode: number = BaseTexture.FILTERMODE_BILINEAR): RenderTexture {
		var tex: RenderTexture;
		for (var i: number = 0, n: number = RenderTexture._pool.length; i < n; i++) {
			tex = RenderTexture._pool[i];
			if (tex._width == width && tex._height == height && tex._format == format && tex._depthStencilFormat == depthStencilFormat && tex._filterMode == filterMode) {
				tex._inPool = false;
				var end: RenderTexture = RenderTexture._pool[n - 1];
				RenderTexture._pool[i] = end;
				RenderTexture._pool.length -= 1;
				return tex;
			}
		}
		tex = new RenderTexture(width, height, format, depthStencilFormat);
		tex.filterMode = filterMode;
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

	/**
	 * @param width  宽度。
	 * @param height 高度。
	 * @param format 纹理格式。
	 * @param depthStencilFormat 深度格式。
	 * 创建一个 <code>RenderTexture</code> 实例。
	 */
	constructor(width: number, height: number, format: RenderTextureFormat = RenderTextureFormat.R8G8B8, depthStencilFormat: RenderTextureDepthFormat = RenderTextureDepthFormat.DEPTH_16) {

		super(format, false);
		this._glTextureType = LayaGL.instance.TEXTURE_2D;
		this._width = width;
		this._height = height;
		this._depthStencilFormat = depthStencilFormat;
		this._create(width, height);
	}

	/**
	 * @internal
	 */
	private _texImage2D(gl: WebGLRenderingContext, glTextureType: number, width: number, height: number): void {
		var glFormat: number;
		switch (this._format) {
			case RenderTextureFormat.R8G8B8:
				gl.texImage2D(glTextureType, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
				break;
			case RenderTextureFormat.R8G8B8A8:
				gl.texImage2D(glTextureType, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
				break;
			case RenderTextureFormat.Alpha8:
				gl.texImage2D(glTextureType, 0, gl.ALPHA, width, height, 0, gl.ALPHA, gl.UNSIGNED_BYTE, null);
				break;
			case RenderTextureFormat.R16G16B16A16:
				if (LayaGL.layaGPUInstance._isWebGL2)
					gl.texImage2D(this._glTextureType, 0, (<WebGL2RenderingContext>gl).RGBA16F, width, height, 0, gl.RGBA, (<WebGL2RenderingContext>gl).HALF_FLOAT, null);
				else
					gl.texImage2D(this._glTextureType, 0, gl.RGBA, width, height, 0, gl.RGBA, LayaGL.layaGPUInstance._oesTextureHalfFloat.HALF_FLOAT_OES, null);//内部格式仍为RGBA
				break;
			default:
				break;
		}
	}

	/**
	 * @internal
	 */
	private _create(width: number, height: number): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		this._frameBuffer = gl.createFramebuffer();
		WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);

		this._texImage2D(gl, this._glTextureType, width, height);

		this._setGPUMemory(width * height * 4);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._glTexture, 0);
		if (this._depthStencilFormat !== RenderTextureDepthFormat.DEPTHSTENCIL_NONE) {
			this._depthStencilBuffer = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthStencilBuffer);
			switch (this._depthStencilFormat) {
				case RenderTextureDepthFormat.DEPTH_16:
					gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
					gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
					break;
				case RenderTextureDepthFormat.STENCIL_8:
					gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, width, height);
					gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
					break;
				case RenderTextureDepthFormat.DEPTHSTENCIL_16_8:
					gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
					gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
					break;
				default:
					throw "RenderTexture: unkonw depth format.";
			}
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);

		this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);
		this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);
		this._setFilterMode(this._filterMode);
		this._setAnisotropy(this._anisoLevel);

		this._readyed = true;
		this._activeResource();
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
	getData(x: number, y: number, width: number, height: number, out: Uint8Array): Uint8Array {//TODO:检查长度
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
		gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, out);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return out;
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

}



