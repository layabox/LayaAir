import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";

const KTX1FileIdentifier = [
    0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A
];

const KTX2FileIdentifier = [
    0xAB, 0x4B, 0x54, 0x58, 0x20, 0x32, 0x30, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A
];

const IdentifierByteSize = 12;
const HeaderSize = 13;

/** etc1 */
const COMPRESSED_RGB_ETC1_WEBGL = 36196;

/** etc2 */
const COMPRESSED_R11_EAC = 37488;
const COMPRESSED_RG11_EAC = 37490;
const COMPRESSED_RGB8_ETC2 = 37492;
const COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 37494;
const COMPRESSED_RGBA8_ETC2_EAC = 37496;
const COMPRESSED_SIGNED_R11_EAC = 37489;
const COMPRESSED_SIGNED_RG11_EAC = 37491;
const COMPRESSED_SRGB8_ALPHA8_ETC2_EAC = 37497;
const COMPRESSED_SRGB8_ETC2 = 37493;
const COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 37495;

/** astc */
const COMPRESSED_RGBA_ASTC_4x4_KHR = 37808;
const COMPRESSED_RGBA_ASTC_5x4_KHR = 37809;
const COMPRESSED_RGBA_ASTC_5x5_KHR = 37810;
const COMPRESSED_RGBA_ASTC_6x5_KHR = 37811;
const COMPRESSED_RGBA_ASTC_6x6_KHR = 37812;
const COMPRESSED_RGBA_ASTC_8x5_KHR = 37813;
const COMPRESSED_RGBA_ASTC_8x6_KHR = 37814;
const COMPRESSED_RGBA_ASTC_8x8_KHR = 37815;
const COMPRESSED_RGBA_ASTC_10x5_KHR = 37816;
const COMPRESSED_RGBA_ASTC_10x6_KHR = 37817;
const COMPRESSED_RGBA_ASTC_10x8_KHR = 37818;
const COMPRESSED_RGBA_ASTC_10x10_KHR = 37819;
const COMPRESSED_RGBA_ASTC_12x10_KHR = 37820;
const COMPRESSED_RGBA_ASTC_12x12_KHR = 37821;
const COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR = 37840;
const COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR = 37841;
const COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR = 37842;
const COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR = 37843;
const COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR = 37844;
const COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR = 37845;
const COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR = 37846;
const COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR = 37847;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR = 37848;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR = 37849;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR = 37850;
const COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR = 37851;
const COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR = 37852;
const COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR = 37853;

/** pvr */
// todo


/** gl param for unCompressed image data*/
const GL_FORMAT_RGBA = 6408;
const GL_FORMAT_RGB = 6407;
const GL_FORMAT_RGBA32F = 0x8814;
const GL_FORMAT_RGB32F = 0x8815;
const GL_FORMAT_RGBA16F = 0x881A;
const GL_FORMAT_RGB16F = 0x881B;
const GL_FORMAT_SRGB8 = 0x8C41;

const GL_INTERNALFORMAT_RGBA8 = 0x8058;
const GL_INTERNALFORMAT_RGB8 = 0x8051;
const GL_INTERNALFORMAT_SRGB8_ALPHA8 = 0x8C43;
const GL_INTERNALFORMAT_R11F_G11F_B10F = 0x8C3A;

// gl data type
const GL_DATATYPE_BYTE = 0x1400;
const GL_DATATYPE_UNSIGNED_BYTE = 0x1401;
const GL_DATATYPE_SHORT = 0x1402;
const GL_DATATYPE_UNSIGNED_SHORT = 0x1403;
const GL_DATATYPE_INT = 0x1404;
const GL_DATATYPE_UNSIGNED_INT = 0x1405;
const GL_DATATYPE_FLOAT = 0x1406;
const GL_DATATYPE_HALF_FLOAT = 0x140b;

/**
 * https://www.khronos.org/registry/KTX/specs/1.0/ktxspec_v1.html
 * https://www.khronos.org/registry/KTX/specs/2.0/ktxspec_v2.html
 */
export class KTXTextureInfo {

    static getLayaFormat(glFormat: number, glInternalFormat: number, glType: number, glTypeSize: number): { format: TextureFormat, sRGB: boolean } {

        if (glFormat == 0) {
            switch (glInternalFormat) {
                /** etc1 */
                case COMPRESSED_RGB_ETC1_WEBGL:
                    return { format: TextureFormat.ETC1RGB, sRGB: false };
                /** etc2 */
                // todo etc2 其他格式
                case COMPRESSED_RGBA8_ETC2_EAC:
                    return { format: TextureFormat.ETC2RGBA, sRGB: false };
                case COMPRESSED_RGB8_ETC2:
                    return { format: TextureFormat.ETC2RGB, sRGB: false };
                case COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:
                    return { format: TextureFormat.ETC2SRGB_Alpha8, sRGB: true };
                case COMPRESSED_SRGB8_ETC2:
                    return { format: TextureFormat.ETC2SRGB, sRGB: true };

                /** astc */
                // todo astc 其他格式
                case COMPRESSED_RGBA_ASTC_4x4_KHR:
                    return { format: TextureFormat.ASTC4x4, sRGB: false };
                case COMPRESSED_RGBA_ASTC_6x6_KHR:
                    return { format: TextureFormat.ASTC6x6, sRGB: false };
                case COMPRESSED_RGBA_ASTC_8x8_KHR:
                    return { format: TextureFormat.ASTC8x8, sRGB: false };
                case COMPRESSED_RGBA_ASTC_10x10_KHR:
                    return { format: TextureFormat.ASTC10x10, sRGB: false };
                case COMPRESSED_RGBA_ASTC_12x12_KHR:
                    return { format: TextureFormat.ASTC12x12, sRGB: false };
                case COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:
                    return { format: TextureFormat.ASTC4x4SRGB, sRGB: true };
                case COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:
                    return { format: TextureFormat.ASTC6x6SRGB, sRGB: true };
                case COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:
                    return { format: TextureFormat.ASTC8x8SRGB, sRGB: true };
                case COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:
                    return { format: TextureFormat.ASTC10x10SRGB, sRGB: true };
                case COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:
                    return { format: TextureFormat.ASTC12x12SRGB, sRGB: true };
                default:
                    throw "KTX: UnSupported Compressed format.";
            }
        }
        else {
            if (glFormat == GL_FORMAT_RGBA && glInternalFormat == GL_INTERNALFORMAT_RGBA8 && glType == GL_DATATYPE_UNSIGNED_BYTE) {
                return { format: TextureFormat.R8G8B8A8, sRGB: false };
            }
            else if (glFormat == GL_FORMAT_RGBA && glInternalFormat == GL_INTERNALFORMAT_SRGB8_ALPHA8 && glType == GL_DATATYPE_UNSIGNED_BYTE) {
                return { format: TextureFormat.R8G8B8A8, sRGB: true };
            }
            else if (glFormat == GL_FORMAT_RGBA && glInternalFormat == GL_FORMAT_RGBA32F && glType == GL_DATATYPE_FLOAT) {
                return { format: TextureFormat.R32G32B32A32, sRGB: false };
            }
            else if (glFormat == GL_FORMAT_RGBA && glInternalFormat == GL_FORMAT_RGBA16F && glType == GL_DATATYPE_HALF_FLOAT) {
                return { format: TextureFormat.R16G16B16A16, sRGB: false };
            }
            else if (glFormat == GL_FORMAT_RGB && glInternalFormat == GL_FORMAT_RGB32F && glType == GL_DATATYPE_FLOAT) {
                return { format: TextureFormat.R32G32B32, sRGB: false };
            }
            else if (glFormat == GL_FORMAT_RGB && glInternalFormat == GL_FORMAT_RGB16F && glType == GL_DATATYPE_HALF_FLOAT) {
                return { format: TextureFormat.R16G16B16, sRGB: false };
            }
            else if (glFormat == GL_FORMAT_RGB && glInternalFormat == GL_FORMAT_SRGB8 && glType == GL_DATATYPE_UNSIGNED_BYTE) {
                return { format: TextureFormat.R8G8B8, sRGB: true };
            }
            else if (glFormat == GL_FORMAT_RGB && glInternalFormat == GL_INTERNALFORMAT_RGB8 && glType == GL_DATATYPE_UNSIGNED_BYTE) {
                return { format: TextureFormat.R8G8B8, sRGB: false };
            }
            else {
                throw "ktx: Unsupported UnCompressed image data.";
            }
        }
    }

    static getKTXTextureInfo(source: ArrayBuffer): KTXTextureInfo {


        let FileIdentifier = new Uint8Array(source, 0, 12);

        // ktx2
        if (FileIdentifier[0] === 0xAB && FileIdentifier[1] === 0x4B && FileIdentifier[2] === 0x54 && FileIdentifier[3] === 0x58 && FileIdentifier[4] === 0x20 && FileIdentifier[5] === 0x32 && FileIdentifier[6] === 0x30 && FileIdentifier[7] === 0xBB && FileIdentifier[8] === 0x0D && FileIdentifier[9] === 0x0A && FileIdentifier[10] === 0x1A && FileIdentifier[11] === 0x0A) {
            throw "ktx2 !"
        }
        // ktx1
        else if (FileIdentifier[0] === 0xAB && FileIdentifier[1] === 0x4B && FileIdentifier[2] === 0x54 && FileIdentifier[3] === 0x58 && FileIdentifier[4] === 0x20 && FileIdentifier[5] === 0x31 && FileIdentifier[6] === 0x31 && FileIdentifier[7] === 0xBB && FileIdentifier[8] === 0x0D && FileIdentifier[9] === 0x0A && FileIdentifier[10] === 0x1A && FileIdentifier[11] === 0x0A) {
            return KTXTextureInfo.createKTX1Info(source);
        }
        else {
            throw "ktx data wrong, not ktx1 or ktx2 buffer!";
        }
    }

    static createKTX1Info(source: ArrayBuffer): KTXTextureInfo {

        let dataSize = Uint32Array.BYTES_PER_ELEMENT;

        let headerDataView = new DataView(source, IdentifierByteSize, dataSize * HeaderSize);

        let endianness = headerDataView.getUint32(0, true);
        let littleEndian = endianness == 0x04030201;

        // header
        let glType = headerDataView.getUint32(1 * dataSize, littleEndian);
        let glTypeSize = headerDataView.getUint32(2 * dataSize, littleEndian);
        let glFormat = headerDataView.getUint32(3 * dataSize, littleEndian);
        let glInternalFormat = headerDataView.getUint32(4 * dataSize, littleEndian);
        let glBaseInternalFormat = headerDataView.getUint32(5 * dataSize, littleEndian);
        let pixelWidth = headerDataView.getUint32(6 * dataSize, littleEndian);
        let pixelHeight = headerDataView.getUint32(7 * dataSize, littleEndian);
        let pixelDepth = headerDataView.getUint32(8 * dataSize, littleEndian);
        let numberOfArrayElements = headerDataView.getUint32(9 * dataSize, littleEndian);
        let numberOfFaces = headerDataView.getUint32(10 * dataSize, littleEndian);
        let numberOfMipmapLevels = headerDataView.getUint32(11 * dataSize, littleEndian);
        let bytesOfKeyValueData = headerDataView.getUint32(12 * dataSize, littleEndian);
        let compressed = glType == 0;

        let formatInfo = KTXTextureInfo.getLayaFormat(glFormat, glInternalFormat, glType, glTypeSize);
        let layaFormat = formatInfo.format;
        let sRGBData = formatInfo.sRGB;

        // todo  3d texture
        let layaDemision = TextureDimension.Tex2D;
        if (numberOfFaces > 1 && numberOfArrayElements > 1) {
            layaDemision = TextureDimension.CubeArray;
        }
        else if (numberOfFaces > 1 && numberOfArrayElements <= 1) {
            layaDemision = TextureDimension.Cube;
        }
        else if (numberOfFaces <= 1 && numberOfArrayElements > 1) {
            layaDemision = TextureDimension.Texture2DArray;
        }

        let headerOffset = IdentifierByteSize + HeaderSize * 4;

        return new KTXTextureInfo(source, glFormat == 0, sRGBData, layaDemision, pixelWidth, pixelHeight, layaFormat, numberOfMipmapLevels || 1, bytesOfKeyValueData, headerOffset);

    }


    constructor(public source: ArrayBuffer, public compress: boolean, public sRGB: boolean, public dimension: TextureDimension, public width: number, public height: number, public format: TextureFormat, public mipmapCount: number, public bytesOfKeyValueData: number, public headerOffset: number) {

    }

}