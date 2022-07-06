import { LayaGL } from "../../layagl/LayaGL";
import { DDSTextureInfo } from "../../RenderEngine/DDSTextureInfo";
import { KTXTextureInfo } from "../../RenderEngine/KTXTextureInfo";
import { TextureDimension } from "../../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../../RenderEngine/RenderEnum/TextureFormat";
import { BaseTexture } from "../../resource/BaseTexture";


export enum TextureCubeFace {
	/**+x */
	PositiveX,
	/**-x */
	NegativeX,
	/**+y */
	PositiveY,
	/**-y */
	NegativeY,
	/**+z */
	PositiveZ,
	/**-z */
	NegativeZ
}

/**
 * <code>TextureCube</code> 类用于生成立方体纹理。
 */
export class TextureCube extends BaseTexture {

	/**TextureCube资源。*/
	static TEXTURECUBE: string = "TEXTURECUBE";
	static TEXTURECUBEBIN: string = "TEXTURECUBEBIN";

	/**@private*/
	private static _blackTexture: TextureCube;
	/**@private*/
	private static _grayTexture: TextureCube;

	/**
	 * 黑色纯色纹理。
	 */
	static get blackTexture() {
		return TextureCube._blackTexture;
	}

	/**
	 * 灰色纯色纹理。
	 */
	static get grayTexture() {
		return TextureCube._grayTexture;
	}

	/**
	 * @internal
	 */
	static __init__(): void {
		var blackTexture: TextureCube = new TextureCube(1, TextureFormat.R8G8B8, false);
		var grayTexture: TextureCube = new TextureCube(1, TextureFormat.R8G8B8, false);
		var pixels: Uint8Array = new Uint8Array(3);
		pixels[0] = 0, pixels[1] = 0, pixels[2] = 0;
		blackTexture.setPixelsData([pixels, pixels, pixels, pixels, pixels, pixels], false, false);
		blackTexture.lock = true;//锁住资源防止被资源管理释放
		pixels[0] = 128, pixels[1] = 128, pixels[2] = 128;
		grayTexture.setPixelsData([pixels, pixels, pixels, pixels, pixels, pixels], false, false);
		grayTexture.lock = true;//锁住资源防止被资源管理释放
		TextureCube._grayTexture = grayTexture;
		TextureCube._blackTexture = blackTexture;
	}

	/**
	 * @inheritDoc
	 */
	static _parse(data: any[], propertyParams: any = null, constructParams: any[] = null): TextureCube {

		let size = constructParams ? constructParams[0] : data[0].width;
		let format = constructParams ? constructParams[1] : TextureFormat.R8G8B8A8;
		let mipmap = constructParams ? constructParams[2] : false;
		let textureCube = new TextureCube(size, format, mipmap);

		textureCube.setImageData(data, false, false);

		return textureCube;
	}

	static _parseBin(data: any, propertyParams: any = null, constructParams: any[] = null) {
		let size = constructParams[0];
		let format = constructParams ? constructParams[1] : TextureFormat.R8G8B8A8;
		let mipmap = constructParams ? constructParams[2] : false;
		let textureCube = new TextureCube(size, format, mipmap);

		textureCube.setImageData(data, false, false);

		return textureCube;
	}

	constructor(size: number, format: TextureFormat, mipmap: boolean = true, sRGB: boolean = false) {
		super(size, size, format);

		this._dimension = TextureDimension.Cube;

		this._texture = LayaGL.textureContext.createTextureInternal(this._dimension, size, size, format, mipmap, sRGB);
		return;
	}

	// todo source数组 改为 CubeInfo 结构体?
	setImageData(source: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], premultiplyAlpha: boolean, invertY: boolean) {
		let texture = this._texture;
		LayaGL.textureContext.setCubeImageData(texture, source, premultiplyAlpha, invertY);
	}

	setPixelsData(source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean) {
		let texture = this._texture;
		LayaGL.textureContext.setCubePixelsData(texture, source, premultiplyAlpha, invertY);
	}

	updateSubPixelsData(source: ArrayBufferView[], xOffset: number, yOffset: number, width: number, height: number, mipmapLevel: number, generateMipmap: boolean, premultiplyAlpha: boolean, invertY: boolean) {
		let texture = this._texture;
		LayaGL.textureContext.setCubeSubPixelData(texture, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY);
	}

	setDDSData(ddsInfo: DDSTextureInfo) {
		let texture = this._texture;
		LayaGL.textureContext.setCubeDDSData(texture, ddsInfo);
	}

	setKTXData(ktxInfo: KTXTextureInfo) {
		let texture = this._texture;
		LayaGL.textureContext.setCubeKTXData(texture, ktxInfo);
	}

	get defaultTexture(): BaseTexture {
		return TextureCube.grayTexture;
	}

}

