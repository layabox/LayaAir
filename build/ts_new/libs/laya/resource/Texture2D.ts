import { ILaya } from "../../ILaya";
import { LayaGL } from "../layagl/LayaGL";
import { Handler } from "../utils/Handler";
import { WebGLContext } from "../webgl/WebGLContext";
import { BaseTexture } from "./BaseTexture";
import { TextureFormat } from "./TextureFormat";
import { Byte } from "../utils/Byte";
import { FilterMode } from "./FilterMode";
import { SystemUtils } from "../webgl/SystemUtils";
import { HalfFloatUtils } from "../utils/HalfFloatUtils";
import { Browser } from "../utils/Browser";

/**
 * <code>Texture2D</code> 类用于生成2D纹理。
 */
export class Texture2D extends BaseTexture {
	/**Texture2D资源。*/
	static TEXTURE2D: string = "TEXTURE2D";

	/**纯灰色纹理。*/
	static grayTexture: Texture2D = null;
	/**纯白色纹理。*/
	static whiteTexture: Texture2D = null;
	/**纯黑色纹理。*/
	static blackTexture: Texture2D = null;
	/**错误纹理 */
	static erroTextur:Texture2D = null;

	/**
	 * @internal
	 */
	static __init__(): void {
		var pixels: Uint8Array = new Uint8Array(3);
		pixels[0] = 128;
		pixels[1] = 128;
		pixels[2] = 128;
		Texture2D.grayTexture = new Texture2D(1, 1, TextureFormat.R8G8B8, false, false);
		Texture2D.grayTexture.setPixels(pixels);
		Texture2D.grayTexture.lock = true;//锁住资源防止被资源管理释放
		pixels[0] = 255;
		pixels[1] = 255;
		pixels[2] = 255;
		Texture2D.whiteTexture = new Texture2D(1, 1, TextureFormat.R8G8B8, false, false);
		Texture2D.whiteTexture.setPixels(pixels);
		Texture2D.whiteTexture.lock = true;//锁住资源防止被资源管理释放
		pixels[0] = 0;
		pixels[1] = 0;
		pixels[2] = 0;
		Texture2D.blackTexture = new Texture2D(1, 1, TextureFormat.R8G8B8, false, false);
		Texture2D.blackTexture.setPixels(pixels);
		Texture2D.blackTexture.lock = true;//锁住资源防止被资源管理释放
		
		Texture2D.erroTextur = Texture2D.whiteTexture;
	}

	/**
	 * @internal
	 */
	static _parse(data: any, propertyParams: any = null, constructParams: any[] = null): Texture2D {
		var texture: Texture2D = constructParams ? new Texture2D(constructParams[0], constructParams[1], constructParams[2], constructParams[3], constructParams[4]) : new Texture2D(0, 0);
		if (propertyParams) {
			texture.wrapModeU = propertyParams.wrapModeU;
			texture.wrapModeV = propertyParams.wrapModeV;
			texture.filterMode = propertyParams.filterMode;
			texture.anisoLevel = propertyParams.anisoLevel;
		}
		switch (texture._format) {
			case TextureFormat.R8G8B8:
			case TextureFormat.R8G8B8A8:
				texture.loadImageSource(data);
				break;
			case TextureFormat.DXT1:
			case TextureFormat.DXT5:
			case TextureFormat.ETC1RGB:
			case TextureFormat.PVRTCRGB_2BPPV:
			case TextureFormat.PVRTCRGBA_2BPPV:
			case TextureFormat.PVRTCRGB_4BPPV:
			case TextureFormat.PVRTCRGBA_4BPPV:
			case TextureFormat.ETC2RGB:
			case TextureFormat.ETC2RGBA:
			case TextureFormat.ETC2SRGB:
			case TextureFormat.ASTC4x4:
			case TextureFormat.ASTC6x6:
			case TextureFormat.ASTC8x8:
			case TextureFormat.ASTC10x10:
			case TextureFormat.ASTC12x12:
			case TextureFormat.KTXTEXTURE:
			case TextureFormat.PVRTEXTURE:
				texture.setCompressData(data);
				break;
			default:
				throw "Texture2D:unkonwn format.";
		}
		return texture;
	}

	/**
	 * @internal
	 */
	static _SimpleAnimatorTextureParse(data: any, propertyParams: any = null, constructParams: any[] = null):Texture2D{
		var byte:Byte = new Byte(data);
		var version:String = byte.readUTFString();
		var texture: Texture2D;
		var pixelDataArrays:Float32Array|Uint16Array;
		var usePixelData:Float32Array |Uint16Array;
		switch(version){
			case "LAYAANIMATORTEXTURE:0000":
				var textureWidth:number = byte.readInt32();
				var pixelDataLength:number = byte.readInt32();
				pixelDataArrays = new Float32Array(textureWidth*textureWidth*4); 
				usePixelData=new Float32Array(byte.readArrayBuffer(pixelDataLength*4));
				pixelDataArrays.set(usePixelData,0);
				var texture: Texture2D = new Texture2D(textureWidth,textureWidth,TextureFormat.R32G32B32A32,false,false);
				texture.setPixels(pixelDataArrays,0);
				texture.filterMode = FilterMode.Point;
				break;
			case "LAYACOMPRESSANIMATORTEXTURE:0000":
				var textureWidth:number = byte.readInt32();
				var pixelDataLength:number = byte.readInt32();
				pixelDataArrays = new Uint16Array(byte.readArrayBuffer(pixelDataLength*2));
				if(!SystemUtils.supportTextureFormat(TextureFormat.R16G16B16A16)){
						console.log( "The platform does not support 16-bit floating-point textures");
					if(!SystemUtils.supportTextureFormat(TextureFormat.R32G32B32A32))
						console.error( "The platform does not support 32-bit floating-point textures");
						usePixelData =new Float32Array(textureWidth*textureWidth*4);
					for(var i = 0,n = pixelDataArrays.length;i<n;i++){
						usePixelData[i] = HalfFloatUtils.convertToNumber(pixelDataArrays[i]);
					}
					texture = new Texture2D(textureWidth,textureWidth,TextureFormat.R32G32B32A32,false,false);
					texture.setPixels(usePixelData,0);
					texture.filterMode = FilterMode.Point;
					
				}else{
					usePixelData =new Uint16Array(textureWidth*textureWidth*4);
					usePixelData.set(pixelDataArrays,0);
					texture = new Texture2D(textureWidth,textureWidth,TextureFormat.R16G16B16A16,false,false);
					texture.setPixels(usePixelData,0);
					texture.filterMode = FilterMode.Point;
				}
				break;
			default:
				throw "Laya3D:unknow version.";
		}
		
		return texture;
	}

	/**
	 * 加载Texture2D。
	 * @param url Texture2D地址。
	 * @param complete 完成回掉。
	 */
	static load(url: string, complete: Handler): void {
		ILaya.loader.create(url, complete, null, ILaya.Loader.TEXTURE2D);
	}

	/** @internal */
	private _canRead: boolean;
	/** @internal */
	private _pixels: Uint8Array | Uint16Array | Float32Array;//TODO:是否合并格式



	/**
	 * @inheritDoc
	 * @override
	 */
	get defaulteTexture(): BaseTexture {
		return Texture2D.grayTexture;
	}

	/**
	 * 创建一个 <code>Texture2D</code> 实例。
	 * @param	width 宽。
	 * @param	height 高。
	 * @param	format 贴图格式。
	 * @param	mipmap 是否生成mipmap。
	 * @param	canRead 是否可读像素,如果为true,会在内存保留像素数据。
	 */
	constructor(width: number = 0, height: number = 0, format: TextureFormat = TextureFormat.R8G8B8A8, mipmap: boolean = true, canRead: boolean = false) {
		super(format, mipmap);
		var gl: WebGLRenderingContext = LayaGL.instance;
		this._glTextureType = gl.TEXTURE_2D;
		this._width = width;
		this._height = height;
		this._canRead = canRead;

		this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);//TODO:重置宽高需要调整
		this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);//TODO:重置宽高需要调整
		this._setFilterMode(this._filterMode);//TODO:重置宽高需要调整
		this._setAnisotropy(this._anisoLevel);

		var compress: boolean = this._gpuCompressFormat();//if the format is compress,_setPixels() will cause webgl error
		if (mipmap) {
			var mipCount: number = Math.max(Math.ceil(Math.log2(width)) + 1, Math.ceil(Math.log2(height)) + 1);
			if (!compress) {
				for (var i: number = 0; i < mipCount; i++)
					this._setPixels(null, i, Math.max(width >> i, 1), Math.max(height >> i, 1));//init all level
			}
			this._mipmapCount = mipCount;
			this._setGPUMemory(width * height * 4 * (1 + 1 / 3));
		} else {
			if (!compress)
				this._setPixels(null, 0, width, height);//init 0 level
			this._mipmapCount = 1;
			this._setGPUMemory(width * height * 4);
		}
	}

	/**
	 * @internal
	 */
	private _gpuCompressFormat(): boolean {
		return (this._format != TextureFormat.R8G8B8A8 && this._format != TextureFormat.R8G8B8 &&
			this._format != TextureFormat.R16G16B16A16 &&
			this._format != TextureFormat.R32G32B32A32 && this._format != TextureFormat.R5G6B5 && this._format != TextureFormat.Alpha8);
	}


	/**
	 * @internal
	 */
	private _setPixels(pixels: Uint8Array | Uint16Array | Float32Array, miplevel: number, width: number, height: number): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		var textureType: number = this._glTextureType;
		var glFormat: number = this._getGLFormat();
		WebGLContext.bindTexture(gl, textureType, this._glTexture);
		switch (this.format) {
			case TextureFormat.R8G8B8:
				gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);//字节对齐
				gl.texImage2D(textureType, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels);
				gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
				break;
			case TextureFormat.R5G6B5:
				gl.pixelStorei(gl.UNPACK_ALIGNMENT, 2);//字节对齐
				gl.texImage2D(textureType, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_SHORT_5_6_5, pixels);
				gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
				break;
			case TextureFormat.R32G32B32A32:
				if (LayaGL.layaGPUInstance._isWebGL2)
					gl.texImage2D(textureType, miplevel, (<WebGL2RenderingContext>gl).RGBA32F, width, height, 0, glFormat, gl.FLOAT, pixels);
				else
					gl.texImage2D(textureType, miplevel, gl.RGBA, width, height, 0, glFormat, gl.FLOAT, pixels);
				break;
			case TextureFormat.R16G16B16A16://todo miner
				if(LayaGL.layaGPUInstance._isWebGL2)
					gl.texImage2D(textureType,miplevel,(<WebGL2RenderingContext>gl).RGBA16F,width,height,0,glFormat,(<WebGL2RenderingContext>gl).HALF_FLOAT,pixels);
				else	
					gl.texImage2D(textureType,miplevel,gl.RGBA,width,height,0,glFormat,LayaGL.layaGPUInstance._oesTextureHalfFloat.HALF_FLOAT_OES,pixels);	
				break;
			default:
				gl.texImage2D(textureType, miplevel, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, pixels);
		}
	}

	/**
	 * @internal
	 */
	private _calcualatesCompressedDataSize(format: number, width: number, height: number): number {
		switch (format) {
			case TextureFormat.DXT1:
				return ((width + 3) >> 2) * ((height + 3) >> 2) * 8;
			case TextureFormat.DXT5:
				return ((width + 3) >> 2) * ((height + 3) >> 2) * 16;
			case TextureFormat.PVRTCRGB_4BPPV:
			case TextureFormat.PVRTCRGBA_4BPPV:
				return Math.floor((Math.max(width, 8) * Math.max(height, 8) * 4 + 7) / 8);
			case TextureFormat.PVRTCRGB_2BPPV:
			case TextureFormat.PVRTCRGBA_2BPPV:
				return Math.floor((Math.max(width, 16) * Math.max(height, 8) * 2 + 7) / 8);
			default:
				return 0;
		}
	}

	/**
	 * @internal
	 */
	private _pharseDDS(arrayBuffer: ArrayBuffer): void {
		const FOURCC_DXT1: number = 827611204;
		const FOURCC_DXT5: number = 894720068;
		const DDPF_FOURCC: number = 0x4;
		const DDSD_MIPMAPCOUNT: number = 0x20000;
		const DDS_MAGIC: number = 0x20534444;
		const DDS_HEADER_LENGTH: number = 31;
		const DDS_HEADER_MAGIC: number = 0;
		const DDS_HEADER_SIZE: number = 1;
		const DDS_HEADER_FLAGS: number = 2;
		const DDS_HEADER_HEIGHT: number = 3;
		const DDS_HEADER_WIDTH: number = 4;
		const DDS_HEADER_MIPMAPCOUNT: number = 7;
		const DDS_HEADER_PF_FLAGS: number = 20;
		const DDS_HEADER_PF_FOURCC: number = 21;

		var header: Int32Array = new Int32Array(arrayBuffer, 0, DDS_HEADER_LENGTH);

		if (header[DDS_HEADER_MAGIC] != DDS_MAGIC)
			throw "Invalid magic number in DDS header";

		if (!(header[DDS_HEADER_PF_FLAGS] & DDPF_FOURCC))
			throw "Unsupported format, must contain a FourCC code";

		var compressedFormat: number = header[DDS_HEADER_PF_FOURCC];
		switch (this._format) {
			case TextureFormat.DXT1:
				if (compressedFormat !== FOURCC_DXT1)
					throw "the FourCC code is not same with texture format.";
				break;
			case TextureFormat.DXT5:
				if (compressedFormat !== FOURCC_DXT5)
					throw "the FourCC code is not same with texture format.";
				break;
			default:
				throw "unknown texture format.";
		}

		var mipLevels: number = 1;
		if (header[DDS_HEADER_FLAGS] & DDSD_MIPMAPCOUNT) {
			mipLevels = Math.max(1, header[DDS_HEADER_MIPMAPCOUNT]);
			if (!this._mipmap)
				throw "the mipmap is not same with Texture2D.";
		} else {
			if (this._mipmap)
				throw "the mipmap is not same with Texture2D.";
		}

		var width: number = header[DDS_HEADER_WIDTH];
		var height: number = header[DDS_HEADER_HEIGHT];
		this._width = width;
		this._height = height;

		var dataOffset: number = header[DDS_HEADER_SIZE] + 4;
		this._upLoadCompressedTexImage2D(arrayBuffer, width, height, mipLevels, dataOffset, 0);
	}

	/**
	 * @internal
	 */
	private _pharseKTX(arrayBuffer: ArrayBuffer): void {
		const ETC_HEADER_LENGTH: number = 13;
		const ETC_HEADER_FORMAT: number = 4;
		const ETC_HEADER_HEIGHT: number = 7;
		const ETC_HEADER_WIDTH: number = 6;
		const ETC_HEADER_MIPMAPCOUNT: number = 11;
		const ETC_HEADER_METADATA: number = 12;

		var id: Uint8Array = new Uint8Array(arrayBuffer, 0, 12);
		if (id[0] != 0xAB || id[1] != 0x4B || id[2] != 0x54 || id[3] != 0x58 || id[4] != 0x20 || id[5] != 0x31 || id[6] != 0x31 || id[7] != 0xBB || id[8] != 0x0D || id[9] != 0x0A || id[10] != 0x1A || id[11] != 0x0A)
			throw ("Invalid fileIdentifier in KTX header");
		var header: Int32Array = new Int32Array(id.buffer, id.length, ETC_HEADER_LENGTH);
		var compressedFormat: number = header[ETC_HEADER_FORMAT];
		this._format = -1;
		if(LayaGL.layaGPUInstance._compressedTextureASTC){
			switch (compressedFormat) {
				case LayaGL.layaGPUInstance._compressedTextureASTC.COMPRESSED_RGBA_ASTC_4x4_KHR:
					this._format = TextureFormat.ASTC4x4;
					break;
				case LayaGL.layaGPUInstance._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:
					this._format = TextureFormat.ASTC4x4SRGB;
					break;
				case LayaGL.layaGPUInstance._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:
					this._format = TextureFormat.ASTC6x6SRGB;
					break;
				case LayaGL.layaGPUInstance._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:
					this._format = TextureFormat.ASTC8x8SRGB;	
					break;
				case LayaGL.layaGPUInstance._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:
					this._format = TextureFormat.ASTC10x10SRGB;	
					break;
				case LayaGL.layaGPUInstance._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:
					this._format = TextureFormat.ASTC12x12SRGB;	
					break;
				case LayaGL.layaGPUInstance._compressedTextureASTC.COMPRESSED_RGBA_ASTC_6x6_KHR:
					this._format = TextureFormat.ASTC6x6;
					break;
				case LayaGL.layaGPUInstance._compressedTextureASTC.COMPRESSED_RGBA_ASTC_8x8_KHR:
					this._format = TextureFormat.ASTC8x8;
					break;
				case LayaGL.layaGPUInstance._compressedTextureASTC.COMPRESSED_RGBA_ASTC_10x10_KHR:
					this._format = TextureFormat.ASTC10x10;
					break;
				case LayaGL.layaGPUInstance._compressedTextureASTC.COMPRESSED_RGBA_ASTC_12x12_KHR:
					this._format = TextureFormat.ASTC12x12;
					break;
			}
		}
		if(LayaGL.layaGPUInstance._compressedTextureEtc1){
			switch (compressedFormat) {
				case LayaGL.layaGPUInstance._compressedTextureEtc1.COMPRESSED_RGB_ETC1_WEBGL:
					this._format = TextureFormat.ETC1RGB;
					break;
			}
		}
		if(LayaGL.layaGPUInstance._compressedTextureETC){
			switch (compressedFormat) {
				case LayaGL.layaGPUInstance._compressedTextureETC.COMPRESSED_RGBA8_ETC2_EAC:
					this._format = TextureFormat.ETC2RGBA;
					break;
				case LayaGL.layaGPUInstance._compressedTextureETC.COMPRESSED_RGB8_ETC2:
					this._format = TextureFormat.ETC2RGB;
					break;
				case LayaGL.layaGPUInstance._compressedTextureETC.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:
					this._format = TextureFormat.ETC2RGB_Alpha8;
					break;
				case LayaGL.layaGPUInstance._compressedTextureETC.COMPRESSED_SRGB8_ETC2:
					this._format = TextureFormat.ETC2SRGB;
					break;
			}
		}

		if(this._format==-1){
			throw "unknown texture format.";
		}
	
		var mipLevels: number = header[ETC_HEADER_MIPMAPCOUNT];
		var width: number = header[ETC_HEADER_WIDTH];
		var height: number = header[ETC_HEADER_HEIGHT];
		this._width = width;
		this._height = height;

		var dataOffset: number = 64 + header[ETC_HEADER_METADATA];
		this._upLoadKTXCompressedTexImage2D(arrayBuffer, width, height, mipLevels, dataOffset, 4);
	}

	/**
	 * @internal
	 */
	private _pharsePVR(arrayBuffer: ArrayBuffer): void {
		const PVR_FORMAT_2BPP_RGB: number = 0;
		const PVR_FORMAT_2BPP_RGBA: number = 1;
		const PVR_FORMAT_4BPP_RGB: number = 2;
		const PVR_FORMAT_4BPP_RGBA: number = 3;
		const PVR_MAGIC: number = 0x03525650;
		const PVR_HEADER_LENGTH: number = 13;
		const PVR_HEADER_MAGIC: number = 0;
		const PVR_HEADER_FORMAT: number = 2;
		const PVR_HEADER_HEIGHT: number = 6;
		const PVR_HEADER_WIDTH: number = 7;
		const PVR_HEADER_MIPMAPCOUNT: number = 11;
		const PVR_HEADER_METADATA: number = 12;
		var header: Int32Array = new Int32Array(arrayBuffer, 0, PVR_HEADER_LENGTH);

		if (header[PVR_HEADER_MAGIC] != PVR_MAGIC)
			throw ("Invalid magic number in PVR header");
		var compressedFormat: number = header[PVR_HEADER_FORMAT];
		switch (compressedFormat) {
			case PVR_FORMAT_2BPP_RGB:
				this._format = TextureFormat.PVRTCRGB_2BPPV;
				break;
			case PVR_FORMAT_4BPP_RGB:
				this._format = TextureFormat.PVRTCRGB_4BPPV;
				break;
			case PVR_FORMAT_2BPP_RGBA:
				this._format = TextureFormat.PVRTCRGBA_2BPPV;
				break;
			case PVR_FORMAT_4BPP_RGBA:
				this._format = TextureFormat.PVRTCRGBA_4BPPV;
				break;
			default:
				throw "Texture2D:unknown PVR format.";
		}

		var mipLevels: number = header[PVR_HEADER_MIPMAPCOUNT];
		var width: number = header[PVR_HEADER_WIDTH];
		var height: number = header[PVR_HEADER_HEIGHT];
		this._width = width;
		this._height = height;

		var dataOffset: number = header[PVR_HEADER_METADATA] + 52;
		this._upLoadCompressedTexImage2D(arrayBuffer, width, height, mipLevels, dataOffset, 0);
	}

		/**
	 * @internal
	 */
		 _upLoadCompressedTexImage2D(data: ArrayBuffer, width: number, height: number, miplevelCount: number, dataOffset: number, imageSizeOffset: number): void {
			var gl: WebGLRenderingContext = LayaGL.instance;
			var textureType: number = this._glTextureType;
			WebGLContext.bindTexture(gl, textureType, this._glTexture);
			var glFormat: number = this._getGLFormat();
			var offset: number = dataOffset;
			for (var i: number = 0; i < miplevelCount; i++) {
				offset += imageSizeOffset;
				var mipDataSize: number = this._calcualatesCompressedDataSize(this._format, width, height);
				var mipData: Uint8Array = new Uint8Array(data, offset, mipDataSize);
				gl.compressedTexImage2D(textureType, i, glFormat, width, height, 0, mipData);
				width = Math.max(width >> 1, 1.0);
				height = Math.max(height >> 1, 1.0);
				offset += mipDataSize;
			}
			var memory: number = offset;
			this._setGPUMemory(memory);
	
			//if (_canRead)
			//_pixels = pixels;
			this._readyed = true;
			this._activeResource();
		}


	/**
	 * @internal
	 */
	_upLoadKTXCompressedTexImage2D(data: ArrayBuffer, width: number, height: number, miplevelCount: number, dataOffset: number, imageSizeOffset: number): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		var textureType: number = this._glTextureType;
		WebGLContext.bindTexture(gl, textureType, this._glTexture);
		var glFormat: number = this._getGLFormat();
		var offset: number = dataOffset;
		for (var i: number = 0; i < miplevelCount; i++) {
			var mipDataSize: number = new Int32Array(data, offset, 1 )[ 0 ];//this._calcualatesCompressedDataSize(this._format, width, height);
			offset += imageSizeOffset;
			var mipData: Uint8Array = new Uint8Array(data, offset, mipDataSize);
			gl.compressedTexImage2D(textureType, i, glFormat, width, height, 0, mipData);
			width = Math.max(width >> 1, 1.0);
			height = Math.max(height >> 1, 1.0);
			offset += mipDataSize;
			offset += 3 - (( mipDataSize + 3 ) % 4 ); 
		}
		var memory: number = offset;
		this._setGPUMemory(memory);

		this._readyed = true;
		this._activeResource();
	}

	/**
	 * 通过图片源填充纹理,可为HTMLImageElement、HTMLCanvasElement、HTMLVideoElement、ImageBitmap、ImageData,
	 * 设置之后纹理宽高可能会发生变化。
	 */
	loadImageSource(source: any, premultiplyAlpha: boolean = false): void {
		var gl = LayaGL.instance;
		var width = source.width;
		var height = source.height;
		this._width = width;
		this._height = height;
		if (!(this._isPot(width) && this._isPot(height)))
			this._mipmap = false;
		this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);//宽高变化后需要重新设置
		this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);//宽高变化后需要重新设置
		this._setFilterMode(this._filterMode);//宽高变化后需要重新设置



		WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
		var glFormat = this._getGLFormat();

		if (ILaya.Render.isConchApp) {//[NATIVE]临时
			if (source.setPremultiplyAlpha) {
				source.setPremultiplyAlpha(premultiplyAlpha);
			}
			gl.texImage2D(this._glTextureType, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
		} else {
			(premultiplyAlpha) && (gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true));
			if (this.format == TextureFormat.R5G6B5)
				gl.texImage2D(this._glTextureType, 0, gl.RGB, gl.RGB, gl.UNSIGNED_SHORT_5_6_5, source);
			else
				gl.texImage2D(this._glTextureType, 0, glFormat, glFormat, gl.UNSIGNED_BYTE, source);
			(premultiplyAlpha) && (gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false));
		}
		if (this._mipmap) {
			gl.generateMipmap(this._glTextureType);
			this._setGPUMemory(width * height * 4 * (1 + 1 / 3));
		} else {
			this._setGPUMemory(width * height * 4);
		}

		if (this._canRead) {//TODO:是否所有图源都可以
			if (ILaya.Render.isConchApp) {
				this._pixels = new Uint8Array(source._nativeObj.getImageData(0, 0, width, height));//TODO:如果为RGB,会错误
			} else {
				ILaya.Browser.canvas.size(width, height);
				ILaya.Browser.canvas.clear();
				ILaya.Browser.context.drawImage(source, 0, 0, width, height);
				this._pixels = new Uint8Array(ILaya.Browser.context.getImageData(0, 0, width, height).data.buffer);//TODO:如果为RGB,会错误
			}
		}
		this._readyed = true;
		this._activeResource();
	}

	/**
	 * 通过像素填充纹理。
	 * @param	pixels 像素。
	 * @param   miplevel 层级。
	 */
	setPixels(pixels: Uint8Array | Uint16Array | Float32Array, miplevel: number = 0): void {
		if (this._gpuCompressFormat())
			throw "Texture2D:the format is GPU compression format.";
		if (!pixels)
			throw "Texture2D:pixels can't be null.";
		var width: number = Math.max(this._width >> miplevel, 1);
		var height: number = Math.max(this._height >> miplevel, 1);
		var pixelsCount: number = width * height * this._getFormatByteCount();
		if (pixels.length < pixelsCount)
			throw "Texture2D:pixels length should at least " + pixelsCount + ".";
		this._setPixels(pixels, miplevel, width, height);

		if (this._canRead)
			this._pixels = pixels;

		this._readyed = true;
		this._activeResource();
	}

	/**
	 * 通过像素填充部分纹理。
	 * @param  x X轴像素起点。
	 * @param  y Y轴像素起点。
	 * @param  width 像素宽度。
	 * @param  height 像素高度。
	 * @param  pixels 像素数组。
	 * @param  miplevel 层级。
	 */
	setSubPixels(x: number, y: number, width: number, height: number, pixels: Uint8Array | Uint16Array | Float32Array, miplevel: number = 0): void {
		if (this._gpuCompressFormat())
			throw "Texture2D:the format is GPU compression format.";
		if (!pixels)
			throw "Texture2D:pixels can't be null.";

		var gl: WebGLRenderingContext = LayaGL.instance;
		var textureType: number = this._glTextureType;
		WebGLContext.bindTexture(gl, textureType, this._glTexture);
		var glFormat: number = this._getGLFormat();

		switch (this.format) {
			case TextureFormat.R8G8B8:
				gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);//字节对齐
				gl.texSubImage2D(textureType, miplevel, x, y, width, height, glFormat, gl.UNSIGNED_BYTE, pixels);
				gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
				break;
			case TextureFormat.R5G6B5:
				gl.pixelStorei(gl.UNPACK_ALIGNMENT, 2);//字节对齐
				gl.texSubImage2D(textureType, miplevel, x, y, width, height, glFormat, gl.UNSIGNED_SHORT_5_6_5, pixels);
				gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
				break;
			case TextureFormat.R32G32B32A32:
				gl.texSubImage2D(textureType, miplevel, x, y, width, height, glFormat, gl.FLOAT, pixels);
				break;
			default:
				gl.texSubImage2D(textureType, miplevel, x, y, width, height, glFormat, gl.UNSIGNED_BYTE, pixels);
		}

		//if (_canRead)
		//_pixels = pixels;//TODO:

		this._readyed = true;
		this._activeResource();
	}
	/**
	 * 通过压缩数据填充纹理。
	 * @param	data 压缩数据。
	 * @param   miplevel 层级。
	 */
	setCompressData(data: ArrayBuffer): void {
		switch (this._format) {
			case TextureFormat.DXT1:
			case TextureFormat.DXT5:
				this._pharseDDS(data);
				break;
			case TextureFormat.ETC1RGB:
			case TextureFormat.ETC2RGB:
			case TextureFormat.ETC2RGBA:
			case TextureFormat.ETC2RGB_Alpha8:
			case TextureFormat.ETC2SRGB:
			case TextureFormat.ASTC4x4:
			case TextureFormat.ASTC4x4SRGB:	
			case TextureFormat.ASTC6x6:
			case TextureFormat.ASTC6x6SRGB:
			case TextureFormat.ASTC8x8:
			case TextureFormat.ASTC8x8SRGB:
			case TextureFormat.ASTC10x10:
			case TextureFormat.ASTC10x10SRGB:
			case TextureFormat.ASTC12x12:
			case TextureFormat.ASTC12x12SRGB:
			case TextureFormat.KTXTEXTURE:
				this._pharseKTX(data);
				break;
			case TextureFormat.PVRTCRGB_2BPPV:
			case TextureFormat.PVRTCRGBA_2BPPV:
			case TextureFormat.PVRTCRGB_4BPPV:
			case TextureFormat.PVRTCRGBA_4BPPV:
			case TextureFormat.PVRTEXTURE:
				this._pharsePVR(data);
				break;
			default:
				throw "Texture2D:unkonwn format.";
		}
		//健壮纹理压缩mipmap
		if((this.mipmapCount!=1)&&(this.width==(1<<this.mipmapCount-1)||this.height==(1<<(this.mipmapCount)))){
			this._mipmap = true;
		}
		else
			this._mipmap = false;
		let gl = LayaGL.instance;
		this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);//宽高变化后需要重新设置
		this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);//宽高变化后需要重新设置
		this._setFilterMode(this._filterMode);//宽高变化后需要重新设置



	}
	/**
	 * 返回图片像素。
	 * @return 图片像素。
	 */
	getPixels(): Uint8Array | Uint16Array | Float32Array {
		if (this._canRead)
			return this._pixels;
		else
			throw new Error("Texture2D: must set texture canRead is true.");
	}
}


