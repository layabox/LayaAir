import { LayaGL } from "../layagl/LayaGL";
import { WebGLContext } from "../webgl/WebGLContext";
import { Bitmap } from "./Bitmap";
import { TextureFormat } from "./TextureFormat";


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


	/** @internal */
	protected _readyed: boolean;
	/** @internal */
	protected _glTextureType: number;
	/** @internal */
	protected _glTexture: any;
	/** @internal */
	protected _format: number;
	/** @internal */
	protected _mipmap: boolean;
	/** @internal */
	protected _wrapModeU: number;
	/** @internal */
	protected _wrapModeV: number;
	/** @internal */
	protected _filterMode: number;
	/** @internal */
	protected _anisoLevel: number;
	/** @internal */
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
	 * 纹理横向循环模式。
	 */
	get wrapModeU(): number {
		return this._wrapModeU;
	}

	set wrapModeU(value: number) {
		if (this._wrapModeU !== value) {
			this._wrapModeU = value;
			(this._width !== -1) && (this._setWarpMode(LayaGL.instance.TEXTURE_WRAP_S, value));
		}
	}

	/**
	 * 纹理纵向循环模式。
	 */
	get wrapModeV(): number {
		return this._wrapModeV;
	}

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
	 * @internal
	 */
	protected _getFormatByteCount(): number {
		switch (this._format) {
			case TextureFormat.R8G8B8:
				return 3;
			case TextureFormat.R8G8B8A8:
				return 4;
			case TextureFormat.Alpha8:
				return 1;
			case TextureFormat.R32G32B32A32:
				return 4;
			default:
				throw "Texture2D: unknown format.";
		}
	}

	/**
	 * @internal
	 */
	protected _isPot(size: number): boolean {
		return (size & (size - 1)) === 0;
	}

	/**
	 * @internal
	 */
	protected _getGLFormat(): number {
		var glFormat: number;
		var gl = LayaGL.instance;
		var gpu = LayaGL.layaGPUInstance;
		switch (this._format) {
			case TextureFormat.R8G8B8:
				glFormat = gl.RGB;
				break;
			case TextureFormat.R8G8B8A8:
				glFormat = gl.RGBA;
				break;
			case TextureFormat.Alpha8:
				glFormat = gl.ALPHA;
				break;
			case TextureFormat.R32G32B32A32:
				glFormat = gl.RGBA;
				break;
			case TextureFormat.DXT1:
				if (gpu._compressedTextureS3tc)
					glFormat = gpu._compressedTextureS3tc.COMPRESSED_RGB_S3TC_DXT1_EXT;
				else
					throw "BaseTexture: not support DXT1 format.";
				break;
			case TextureFormat.DXT5:
				if (gpu._compressedTextureS3tc)
					glFormat = gpu._compressedTextureS3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT;
				else
					throw "BaseTexture: not support DXT5 format.";
				break;
			case TextureFormat.ETC1RGB:
				if (gpu._compressedTextureEtc1)
					glFormat = gpu._compressedTextureEtc1.COMPRESSED_RGB_ETC1_WEBGL;
				else
					throw "BaseTexture: not support ETC1RGB format.";
				break;
			case TextureFormat.PVRTCRGB_2BPPV:
				if (gpu._compressedTexturePvrtc)
					glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
				else
					throw "BaseTexture: not support PVRTCRGB_2BPPV format.";
				break;
			case TextureFormat.PVRTCRGBA_2BPPV:
				if (gpu._compressedTexturePvrtc)
					glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
				else
					throw "BaseTexture: not support PVRTCRGBA_2BPPV format.";
				break;
			case TextureFormat.PVRTCRGB_4BPPV:
				if (gpu._compressedTexturePvrtc)
					glFormat = gpu._compressedTexturePvrtc.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
				else
					throw "BaseTexture: not support PVRTCRGB_4BPPV format.";
				break;
			case TextureFormat.PVRTCRGBA_4BPPV:
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
	 * @internal
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
	 * @internal
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
	 * @internal
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
	 * @override
	 */
	protected _disposeResource(): void {
		if (this._glTexture) {
			LayaGL.instance.deleteTexture(this._glTexture);
			this._glTexture = null;
			this._setGPUMemory(0);
		}
	}

	/**
	 * @internal
	 * 获取纹理资源。
	 * @override
	 */
	_getSource(): any {
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


	/** @deprecated use TextureFormat.FORMAT_R8G8B8 instead.*/
	static FORMAT_R8G8B8: number = 0;
	/** @deprecated use TextureFormat.FORMAT_R8G8B8A8 instead.*/
	static FORMAT_R8G8B8A8: number = 1;
	/** @deprecated use TextureFormat.FORMAT_ALPHA8 instead.*/
	static FORMAT_ALPHA8: number = 2;
	/** @deprecated use TextureFormat.FORMAT_DXT1 instead.*/
	static FORMAT_DXT1: number = 3;
	/** @deprecated use TextureFormat.FORMAT_DXT5 instead.*/
	static FORMAT_DXT5: number = 4;
	/** @deprecated use TextureFormat.FORMAT_ETC1RGB instead.*/
	static FORMAT_ETC1RGB: number = 5;
	/** @deprecated use TextureFormat.FORMAT_PVRTCRGB_2BPPV instead.*/
	static FORMAT_PVRTCRGB_2BPPV: number = 9;
	/** @deprecated use TextureFormat.FORMAT_PVRTCRGBA_2BPPV instead.*/
	static FORMAT_PVRTCRGBA_2BPPV: number = 10;
	/** @deprecated use TextureFormat.FORMAT_PVRTCRGB_4BPPV instead.*/
	static FORMAT_PVRTCRGB_4BPPV: number = 11;
	/** @deprecated use TextureFormat.FORMAT_PVRTCRGBA_4BPPV instead.*/
	static FORMAT_PVRTCRGBA_4BPPV: number = 12;

	/** @deprecated use RenderTextureFormat.R16G16B16A16 instead.*/
	static RENDERTEXTURE_FORMAT_RGBA_HALF_FLOAT: number = 14;
	/** @deprecated use TextureFormat.R32G32B32A32 instead.*/
	static FORMAT_R32G32B32A32: number = 15;

	/** @deprecated use RenderTextureDepthFormat.DEPTH_16 instead.*/
	static FORMAT_DEPTH_16: number = 0;
	/** @deprecated use RenderTextureDepthFormat.STENCIL_8 instead.*/
	static FORMAT_STENCIL_8: number = 1;
	/** @deprecated use RenderTextureDepthFormat.DEPTHSTENCIL_16_8 instead.*/
	static FORMAT_DEPTHSTENCIL_16_8: number = 2;
	/** @deprecated use RenderTextureDepthFormat.DEPTHSTENCIL_NONE instead.*/
	static FORMAT_DEPTHSTENCIL_NONE: number = 3;
}

