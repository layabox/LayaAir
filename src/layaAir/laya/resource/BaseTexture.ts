import { LayaGL } from "../layagl/LayaGL";
import { CompareMode } from "../RenderEngine/RenderEnum/CompareMode";
import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { WarpMode } from "../RenderEngine/RenderEnum/WrapMode";
import { InternalTexture } from "../RenderEngine/RenderInterface/InternalTexture";
import { Bitmap } from "./Bitmap";


/**
 * <code>BaseTexture</code> 纹理的父类，抽象类，不允许实例。
 */
export class BaseTexture extends Bitmap {

	/**
	 * @internal
	 */
	_texture: InternalTexture;

	protected _dimension: TextureDimension;
	public get dimension(): TextureDimension {
		return this._dimension;
	}

	private _format: TextureFormat;
	public get format(): TextureFormat {
		return this._format;
	}

	public get mipmap(): boolean {
		return this._texture.mipmap;
	}

	public get mipmapCount(): number {
		return this._texture.mipmapCount;
	}

	public get anisoLevel(): number {
		return this._texture.anisoLevel;
	}
	public set anisoLevel(value: number) {
		this._texture.anisoLevel = value;
	}

	public get filterMode(): FilterMode {
		return this._texture.filterMode;
	}
	public set filterMode(value: FilterMode) {
		this._texture.filterMode = value;
	}

	public get wrapModeU(): WarpMode {
		return this._texture.wrapU;
	}
	public set wrapModeU(value: WarpMode) {
		this._texture.wrapU = value;
	}

	public get wrapModeV(): WarpMode {
		return this._texture.wrapV;
	}
	public set wrapModeV(value: WarpMode) {
		this._texture.wrapV = value;
	}

	public get wrapModeW(): WarpMode {
		return this._texture.wrapW;
	}
	public set wrapModeW(value: WarpMode) {
		this._texture.wrapW = value;
	}

	public get compareMode(): CompareMode {
		return this._texture.compareMode;
	}

	public set compareMode(value: CompareMode) {
		this._texture.compareMode = LayaGL.textureContext.setTextureCompareMode(this._texture, value);
	}

	public get gammaCorrection(): number {
		return this._texture.gammaCorrection;
	}

	protected _gammaSpace: boolean = false;
	// todo
	public get gammaSpace(): boolean {
		// return this._gammaSpace;

		return this._texture.useSRGBLoad || this._texture.gammaCorrection > 1;
	}

	constructor(width: number, height: number, format: number) {
		super();
		this._width = width;
		this._height = height;
		this._format = format;
	}

	/**
	 * 是否是gpu压缩纹理格式
	 * @returns 
	 */
	gpuCompressFormat(): boolean {
		let format = this._format;
		switch (format) {
			case TextureFormat.R8G8B8:
			case TextureFormat.R8G8B8A8:
				return false;
			case TextureFormat.ASTC4x4:
				return true;
			default:
				return false;
		}
	}

	/**
	 * 获取纹理格式的字节数
	 * @internal
	 */
	_getFormatByteCount(): number {
		switch (this._format) {
			case TextureFormat.R8G8B8:
				return 3;
			case TextureFormat.R8G8B8A8:
				return 4;
			case TextureFormat.R5G6B5:
				return 1;
			case TextureFormat.Alpha8:
				return 1;
			case TextureFormat.R16G16B16A16:
				return 2;
			case TextureFormat.R32G32B32A32:
				return 4;

			default:
				throw "Texture2D: unknown format.";
		}
	}

	_getSource(): InternalTexture {
		return this._texture.resource;
	}

	get defaulteTexture(): BaseTexture {
		throw "defaulte"
	}

	protected _disposeResource(): void {
		this._texture.dispose();
	}

}

