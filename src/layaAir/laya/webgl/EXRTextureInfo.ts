
/**
 * https://openexr.readthedocs.io/en/latest/OpenEXRFileLayout.html
 */

import { HalfFloatUtils } from "../utils/HalfFloatUtils";

// todo
export enum AttributeType {
    box2i = "box2i",
    box2f = "box2f",
    chlist = "chlist",
    chromaticities = "chromaticities",
    compression = "compression",
    double = "double",
    envmap = "envmap",
    float = "float",
    int = "int",
    keycode = "keycode",
    lineOrder = "lineOrder",
    m33f = "m33f",
    m44f = "m44f",
    preview = "preview",
    rational = "rational",
    string = "string",
    stringvector = "stringvector",
    titledesc = "titledesc",
    timecode = "timecode",
    v2i = "v2i",
    v2f = "v2f",
    v3i = "v3i",
    v3f = "v3f"
}

export class EXRTextureInfo {

    static getEXRInfo(buffer: ArrayBuffer) {

        const wrong = () => {
            throw "EXR info: data wrong.";
        }

        // temp todo
        const todo = () => {
            console.log("EXR info: todo");
        }

        // let uint8Data = new Uint8Array(buffer);

        /**
         * 
         * Integers, Floating-Point Numbers: little-endian
         * Text: 1 byte字节字符, null: 0x00
         * 
         */
        let littleEndian = true;
        let dataView = new DataView(buffer);
        let viewOffset = 0;

        const getString = (length: number = 0) => {
            let res = "";
            let charCode;
            let charCount = 0;
            while ((charCode = dataView.getUint8(viewOffset++)) != 0x00) {
                res = `${res}${String.fromCharCode(charCode)}`;
                charCount++;
                if (charCount == length) {
                    // todo
                    viewOffset++; // 0x00
                    break;
                }
            }
            return res;
        }

        const getUnsignedChar = () => {
            return dataView.getUint8(viewOffset++);
        }

        const getShort = () => {
            let short = dataView.getInt16(viewOffset, littleEndian);
            viewOffset += 2;
            return short;
        }

        const getunSignedShort = () => {
            let short = dataView.getUint16(viewOffset, littleEndian);
            viewOffset += 2;
            return short;
        }

        const getInt = () => {
            let res = dataView.getInt32(viewOffset, littleEndian);
            viewOffset += 4;
            return res;
        }

        const getUnsignedInt = () => {
            let int = dataView.getUint32(viewOffset, littleEndian);
            viewOffset += 4;
            return int;
        }

        const getUnsignedlong = () => {
            let long = dataView.getBigUint64(viewOffset, littleEndian);
            viewOffset += 8;
            return long;
        }

        const getHalf = () => {
            let halfBits = dataView.getUint16(viewOffset, littleEndian);
            viewOffset += 2;
            // todo  half float 
            let half = HalfFloatUtils.convertToNumber(halfBits);

            return half;
        }

        const getFloat = () => {
            let res = dataView.getFloat32(viewOffset, littleEndian);
            viewOffset += 4;
            return res;
        }

        const getDouble = () => {
            let double = dataView.getFloat64(viewOffset, littleEndian);
            viewOffset += 8;
            return double;
        }


        // read attributes


        const readBox2i = (size: number) => {
            let xMin = getInt();
            let yMin = getInt();
            let xMax = getInt();
            let yMax = getInt();

            return {
                xMin: xMin,
                yMin: yMin,
                xMax: xMax,
                yMax: yMax
            }
        }

        const readBox2f = (size: number) => {
            let xMin = getFloat();
            let yMin = getFloat();
            let xMax = getFloat();
            let yMax = getFloat();

            return {
                xMin: xMin,
                yMin: yMin,
                xMax: xMax,
                yMax: yMax
            }
        }

        const readChlist = (size: number) => {
            let res = [];
            let endOffset = viewOffset + size;
            while (viewOffset < endOffset - 1) {
                // channel
                let name = getString();
                let pixelType = getInt();
                let pLinear = getUnsignedChar();
                let reserved = `${getUnsignedChar()}${getUnsignedChar()}${getUnsignedChar()}`;
                let xSampling = getInt();
                let ySampling = getInt();

                let channel = {
                    name: name,
                    pixelType: pixelType,
                    pLinear: pLinear,
                    reserved: reserved,
                    xSampling: xSampling,
                    ySampling: ySampling
                }
                res.push(channel);
            }
            let nullByte = getUnsignedChar();
            if (nullByte != 0x00) {
                wrong();
            }
            return res;
        }

        const readChromaticities = (size: number) => {
            let redX = getFloat();
            let redY = getFloat();
            let greenX = getFloat();
            let greenY = getFloat();
            let blueX = getFloat();
            let blueY = getFloat();
            let whiteX = getFloat();
            let whiteY = getFloat();

            return {
                redX: redX,
                redY: redY,
                greenX: greenX,
                greenY: greenY,
                blueX: blueX,
                blueY: blueY,
                whiteX: whiteX,
                whiteY: whiteY,
            }
        }

        const readCompression = (size: number) => {
            return getUnsignedChar();
        }

        const readLineOrder = (size: number) => {
            return getUnsignedChar();
        }

        const readKeycode = (size: number) => {
            let filmMfcCode = getInt();
            let filmType = getInt();
            let prefix = getInt();
            let count = getInt();
            let perfOffset = getInt();
            let perfsPerFrame = getInt();
            let perfsPerCount = getInt();

            return {
                filmMfcCode: filmMfcCode,
                filmType: filmType,
                prefix: prefix,
                count: count,
                perfOffset: perfOffset,
                perfsPerFrame: perfsPerFrame,
                perfsPerCount: perfsPerCount,
            }
        }

        const readv2i = (size: number) => {
            let num0 = getInt();
            let num1 = getInt();
            return [num0, num1];
        }

        const readv2f = (size: number) => {
            let num0 = getFloat();
            let num1 = getFloat();
            return [num0, num1];
        }

        const readv3i = (size: number) => {
            let num0 = getInt();
            let num1 = getInt();
            let num2 = getInt();
            return [num0, num1, num2];
        }

        const readv3f = (size: number) => {
            let num0 = getFloat();
            let num1 = getFloat();
            let num2 = getFloat();
            return [num0, num1, num2];
        }

        // 0x76, 0x2f, 0x31, 0x01
        let magicNumber = dataView.getInt32(viewOffset, littleEndian);
        viewOffset += 4;


        if (magicNumber != 20000630) {
            wrong();
        }

        /**
         * version field
         */
        let version = getInt();
        let versionNumber = version &= 0xff;
        // singleTileBit
        let bit9 = version &= 0x200;
        // longNameBit
        let bit10 = version &= 0x400;
        // nonImageBit
        let bit11 = version &= 0x800;
        // multipartBit
        let bit12 = version &= 0x1000;

        if (bit9 == 0 && bit11 == 0 && bit12 == 0) {
            // Single-part scan line. One normal scan line image.
        }
        else if (bit9 == 1 && bit11 == 0 && bit12 == 0) {
            // Single-part tile.
            todo();
            wrong();
        }
        else if (bit9 == 0 && bit11 == 0 && bit12 == 1) {
            // Multi-part (new in 2.0). Multiple normal images (scan line and/or tiled).
            // OpenEXR 2.0.
            todo();
            wrong();
        }
        else if (bit9 == 0 && bit11 == 1 && bit12 == 0) {
            // Single-part deep data (new in 2.0). One deep tile or deep scan line part.
            // OpenEXR 2.0.
            todo();
            wrong();
        }
        else if (bit9 == 0 && bit11 == 1 && bit12 == 1) {
            // Multi-part deep data (new in 2.0). Multiple parts (any combination of: tiles, scan lines, deep tiles and/or deep scan lines).
            // OpenEXR 2.0.
            todo();
            wrong();
        }

        let maxNameLength = bit10 ? 255 : 31;
        /**
         * Header
         */
        // single part

        // read attributes
        let attributeName;
        while (attributeName = getString()) {

            if (attributeName == " ") {
                break;
            }

            let attribute: { name: string, value: any } = { name: attributeName, value: null };

            let attributeType = getString();
            let attributeSize = getInt();

            // let attributeReadFunc;
            // switch (attributeType) {
            //     case AttributeType.chlist:
            //         attributeReadFunc = readChlist;
            //         break;
            //     case AttributeType.compression:
            //         attributeReadFunc = readCompression;
            //         break;
            //     case AttributeType.box2i:
            //         attributeReadFunc = readBox2i
            //         break;
            //     case AttributeType.box2f:
            //         attributeReadFunc = readBox2f
            //         break;
            //     default:
            //         wrong();
            // }

            let attributeValue;

            switch (attributeType) {
                case AttributeType.chlist:
                    let chlist = readChlist(attributeSize);
                    attribute.value = chlist;
                    break;
                case AttributeType.compression:
                    let compression = readCompression(attributeSize);
                    attribute.value = compression;
                    break;
                case AttributeType.box2i:
                    let box2i = readBox2i(attributeSize);
                    attribute.value = box2i;
                    break;
                case AttributeType.lineOrder:
                    let lineorder = readLineOrder(attributeSize);
                    attribute.value = lineorder;
                    break;
                case AttributeType.float:
                    attribute.value = getFloat();
                    break;
                case AttributeType.v2f:
                    attribute.value = readv2f(attributeSize);
                    break;
                default:
                    wrong();
            }
            console.log(attribute);

        }




        /**
         * offset tables
         */

        debugger;
    }

}