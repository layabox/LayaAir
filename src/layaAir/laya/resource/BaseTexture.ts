import { LayaGL } from "../layagl/LayaGL"
import { Bitmap } from "./Bitmap"
import { WebGLContext } from "../webgl/WebGLContext"
import { ILaya } from "../../ILaya";


/**
 * <code>BaseTexture</code> 纹理的父类，抽象类，不允许实例。
 */
export class BaseTexture extends Bitmap {
	static WARPMODE_REPEAT: number = 0;
	static WARPMODE_CLAMP: number = 1;

	/**寻址模式_重复。*/
	static FILTERMODE_POINT: number = 0;
	/**寻址模式_不循环。*/
	static FILTERMODE_BILINEAR: number = 1;
	/**寻址模式_不循环。*/
	static FILTERMODE_TRILINEAR: number = 2;

	/**纹理格式_R8G8B8。*/
	static FORMAT_R8G8B8: number = 0;
	/**纹理格式_R8G8B8A8。*/
	static FORMAT_R8G8B8A8: number = 1;
	/**纹理格式_ALPHA8。*/
	static FORMAT_ALPHA8: number = 2;
	/**纹理格式_DXT1。*/
	static FORMAT_DXT1: number = 3;
	/**纹理格式_DXT5。*/
	static FORMAT_DXT5: number = 4;
	/**纹理格式_ETC2RGB。*/
	static FORMAT_ETC1RGB: number = 5;
	///**纹理格式_ETC2RGB。*/
	//public static const FORMAT_ETC2RGB:int = 6;
	///**纹理格式_ETC2RGBA。*/
	//public static const FORMAT_ETC2RGBA:int = 7;
	/**纹理格式_ETC2RGB_PUNCHTHROUGHALPHA。*/
	//public static const FORMAT_ETC2RGB_PUNCHTHROUGHALPHA:int = 8;
	/**纹理格式_PVRTCRGB_2BPPV。*/
	static FORMAT_PVRTCRGB_2BPPV: number = 9;
	/**纹理格式_PVRTCRGBA_2BPPV。*/
	static FORMAT_PVRTCRGBA_2BPPV: number = 10;
	/**纹理格式_PVRTCRGB_4BPPV。*/
	static FORMAT_PVRTCRGB_4BPPV: number = 11;
	/**纹理格式_PVRTCRGBA_4BPPV。*/
	static FORMAT_PVRTCRGBA_4BPPV: number = 12;

	/**渲染纹理格式_16位半精度RGBA浮点格式。*/
	static RENDERTEXTURE_FORMAT_RGBA_HALF_FLOAT: number = 14;

	/**深度格式_DEPTH_16。*/
	static FORMAT_DEPTH_16: number = 0;
	/**深度格式_STENCIL_8。*/
	static FORMAT_STENCIL_8: number = 1;
	/**深度格式_DEPTHSTENCIL_16_8。*/
	static FORMAT_DEPTHSTENCIL_16_8: number = 2;
	/**深度格式_DEPTHSTENCIL_NONE。*/
	static FORMAT_DEPTHSTENCIL_NONE: number = 3;

	/** @private */
	protected _readyed: boolean;
	/** @private */
	protected _glTextureType: number;
	/** @private */
	protected _glTexture: any;
	/** @private */
	protected _format: number;
	/** @private */
	protected _mipmap: boolean;
	/** @private */
	protected _wrapModeU: number;
	/** @private */
	protected _wrapModeV: number;
	/** @private */
	protected _filterMode: number;
	/** @private */
	protected _anisoLevel: number;
	/** @private */
	protected _mipmapCount: number;

	/**
	 * 是否使用mipLevel
	 */
	get mipmap(): boolean {
		return this._mipmap;
	}

	/**
	 * 纹理格式
	 */
	get format(): number {
		return this._format;
	}

	/**
	 * 获取纹理横向循环模式。
	 */
	get wrapModeU(): number {
		return this._wrapModeU;
	}

	/**
	 * 设置纹理横向循环模式。
	 */
	set wrapModeU(value: number) {
		if (this._wrapModeU !== value) {
			this._wrapModeU = value;
			(this._width !== -1) && (this._setWarpMode(LayaGL.instance.TEXTURE_WRAP_S, value));
		}
	}

	/**
	 * 获取纹理纵向循环模式。
	 */
	get wrapModeV(): number {
		return this._wrapModeV;
	}

	/**
	 * 设置纹理纵向循环模式。
	 */
	set wrapModeV(value: number) {
		if (this._wrapModeV !== value) {
			this._wrapModeV = value;
			(this._height !== -1) && (this._setWarpMode(LayaGL.instance.TEXTURE_WRAP_T, value));
		}
	}

	/**
	 * 缩小过滤器
	 */
	get filterMode(): number {
		return this._filterMode;
	}

	/**
	 * 缩小过滤器
	 */
	set filterMode(value: number) {
		if (value !== this._filterMode) {
			this._filterMode = value;
			((this._width !== -1) && (this._height !== -1)) && (this._setFilterMode(value));
		}
	}

	/**
	 * 各向异性等级
	 */
	get anisoLevel(): number {
		return this._anisoLevel;
	}

	/**
	 * 各向异性等级
	 */
	set anisoLevel(value: number) {
		if (value !== this._anisoLevel) {
			this._anisoLevel = Math.max(1, Math.min(16, value));
			((this._width !== -1) && (this._height !== -1)) && (this._setAnisotropy(value));
		}
	}


	/**
	 * 获取mipmap数量。
	 */
	get mipmapCount(): number {
		return this._mipmapCount;
	}

	/**
	 * 获取默认纹理资源。
	 */
	get defaulteTexture(): BaseTexture {
		throw "BaseTexture:must override it."
	}

	/**
	 * 创建一个 <code>BaseTexture</code> 实例。
	 */
	constructor(format: number, mipMap: boolean) {

		super();
		this._wrapModeU = BaseTexture.WARPMODE_REPEAT;
		this._wrapModeV = BaseTexture.WARPMODE_REPEAT;
		this._filterMode = BaseTexture.FILTERMODE_BILINEAR;

		this._readyed = false;
		this._width = -1;
		this._height = -1;
		this._format = format;
		this._mipmap = mipMap;
		this._anisoLevel = 1;
		this._glTexture = LayaGL.instance.createTexture();
	}

	/**
	 * @private
	 */
	protected _getFormatByteCount(): number {
		switch (this._format) {
			case BaseTexture.FORMAT_R8G8B8:
				return 3;
			case BaseTexture.FORMAT_R8G8B8A8:
				return 4;
			case BaseTexture.FORMAT_ALPHA8:
				return 1;
			default:
				throw "Texture2D: unknown format.";
		}
	}

	/**
	 * @private
	 */
	protected _isPot(size: number): boolean {
		return (size & (size - 1)) === 0;
	}

	/**
	 * @private
	 */
	protected _getGLFormat(): number {
		var glFormat: number;
		var gl = LayaGL.instance;
		var gpu = LayaGL.layaGPUInstance;
		switch (this._format) {
			case BaseTexture.FORMAT_R8G8B8:
				glFormat = gl.RGB;
				break;
			case BaseTexture.FORMAT_R8G8B8A8:
				glFormat = gl.RGBA;
				break;
			case BaseTexture.FORMAT_ALPHA8:
				glFormat = gl.ALPHA;
				break;
			case BaseTexture.FORMAT_DXT1:
				if (gpu._compressedTextureS3tc)
					glFormat = gpu._compressedTextureS3tc.COMPRESSED_RGB_S3TC_DXT1_EXT;
				else
					throw "BaseTexture: not support DXT1 format.";
				break;
			case BaseTexture.FORMAT_DXT5:
				if (gpu._compressedTextureS3tc)
					glFormat = gpu._compressedTextureS3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT;
				else
					throw "BaseTexture: not support DXT5 format.";
				break;
			case BaseTexture.FORMAT_ETC1RGB:
				if (gpu._compressedTextureEtc1)
					glFormat = gpu._compressedTextureEtc1.COMPRESSED_RGB_ETC1_WEBGL;
				else
					throw "BaseTexture: not support ETC1RGB format.";
				break;
			case BaseTexture.FORMAT_PVRTCRGB_2BPPV:
				if (gpu._compressedTexturePvrtc)
					glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
				else
					throw "BaseTexture: not support PVRTCRGB_2BPPV format.";
				break;
			case BaseTexture.FORMAT_PVRTCRGBA_2BPPV:
				if (gpu._compressedTexturePvrtc)
					glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
				else
					throw "BaseTexture: not support PVRTCRGBA_2BPPV format.";
				break;
			case BaseTexture.FORMAT_PVRTCRGB_4BPPV:
				if (gpu._compressedTexturePvrtc)
					glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
				else
					throw "BaseTexture: not support PVRTCRGB_4BPPV format.";
				break;
			case BaseTexture.FORMAT_PVRTCRGBA_4BPPV:
				if (gpu._compressedTexturePvrtc)
					glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
				else
					throw "BaseTexture: not support PVRTCRGBA_4BPPV format.";
				break;
			default:
				throw "BaseTexture: unknown texture format.";
		}
		return glFormat;
	}

	/**
	 * @private
	 */
	protected _setFilterMode(value: number): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
		switch (value) {
			case BaseTexture.FILTERMODE_POINT:
				if (this._mipmap)
					gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
				else
					gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				gl.texParameteri(this._glTextureType, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				break;
			case BaseTexture.FILTERMODE_BILINEAR:
				if (this._mipmap)
					gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
				else
					gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(this._glTextureType, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				break;
			case BaseTexture.FILTERMODE_TRILINEAR:
				if (this._mipmap)
					gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
				else
					gl.texParameteri(this._glTextureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(this._glTextureType, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				break;
			default:
				throw new Error("BaseTexture:unknown filterMode value.");
		}
	}

	/**
	 * @private
	 */
	protected _setWarpMode(orientation: number, mode: number): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
		if (this._isPot(this._width) && this._isPot(this._height)) {
			switch (mode) {
				case BaseTexture.WARPMODE_REPEAT:
					gl.texParameteri(this._glTextureType, orientation, gl.REPEAT);
					break;
				case BaseTexture.WARPMODE_CLAMP:
					gl.texParameteri(this._glTextureType, orientation, gl.CLAMP_TO_EDGE);
					break;
			}
		} else {
			gl.texParameteri(this._glTextureType, orientation, gl.CLAMP_TO_EDGE);
		}
	}

	/**
	 * @private
	 */
	protected _setAnisotropy(value: number): void {
		var anisotropic: any = LayaGL.layaGPUInstance._extTextureFilterAnisotropic;
		if (anisotropic) {
			value = Math.max(value, 1);
			var gl: WebGLRenderingContext = LayaGL.instance;
			WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
			value = Math.min(gl.getParameter(anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT), value);
			gl.texParameterf(this._glTextureType, anisotropic.TEXTURE_MAX_ANISOTROPY_EXT, value);
		}
	}

		/**
		 * @inheritDoc
		 */
		/*override*/ protected _disposeResource(): void {
		if (this._glTexture) {
			LayaGL.instance.deleteTexture(this._glTexture);
			this._glTexture = null;
			this._setGPUMemory(0);
		}
	}

		/**
		 * @internal
		 * 获取纹理资源。
		 */
		/*override*/  _getSource(): any {
		if (this._readyed)
			return this._glTexture;
		else
			return null;
	}

	/**
	 * 通过基础数据生成mipMap。
	 */
	generateMipmap(): void {
		if (this._isPot(this.width) && this._isPot(this.height))
			LayaGL.instance.generateMipmap(this._glTextureType);
	}
}

