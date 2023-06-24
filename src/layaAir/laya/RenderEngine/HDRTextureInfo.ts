/**
 * https://en.wikipedia.org/wiki/Radiance_(software)#HDR_image_format
 * 
 * 文件第一行为 "#?RADIANCE"
 * 
 * 以 "#" 开始为 注释行
 * 
 * 后面有 key=value 形式声明信息
 * 包括 "FORMAT=32-bit_rle_rgbe" 格式声明
 * 
 * 空行代表 header 结束， 
 * 
 * header 信息下一行 描述 图像分辨率和像素数据
 * 由 Radiance tools 生成, 一般为 "-Y height +X width"
 * 
 * 之后为 图像 二进制像素数据
 *  
 */

import { Vector4 } from "../maths/Vector4";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { Texture2D } from "../resource/Texture2D";

/**
 * https://floyd.lbl.gov/radiance/framer.html
 */
export class HDRTextureInfo {

    static HDRTEXTURE: string = "HDRTEXTURE";

    static _parseHDRTexture(data: ArrayBuffer, propertyParams: any = null, constructParams: any[] = null) {

        let hdrInfo = HDRTextureInfo.getHDRInfo(data);

        let texture = new Texture2D(hdrInfo.width, hdrInfo.height, hdrInfo.format, false, false, false);

        texture.setHDRData(hdrInfo);

        return texture;
    }

    /**
     * 
     * @param source 
     */
    static getHDRInfo(source: ArrayBuffer) {

        let data = new Uint8Array(source);
        let readByteOffset = 0;

        const readLine = () => {
            let lineStr = HDRTextureInfo.getLineString(data, readByteOffset);
            // string 带着 '\n' 就不用 +1
            readByteOffset += lineStr.length + 1;
            return lineStr;
        }

        // header
        let identifier = readLine();
        // todo  非 Radiance tools 生成文件 identifier 是否还是 RADIANCE
        if (identifier != "#?RADIANCE") {
            throw "HDR image: identifier wrong.";
        }

        let commandsMap = new Map();

        let line = "";
        do {
            line = readLine();
            if (line[0] != "#") {
                let commands = line.split("=");
                commandsMap.set(commands[0], commands[1]);
            }

        } while (line != "");
        // header end

        /**
         * FORMAT
         * EXPOSURE
         * COLORCORR
         * SOFTWARE
         * PIXASPECT
         * VIEW
         * PRIMARIES
         */
        let hdrFormat = commandsMap.get("FORMAT");
        /**
         * 32-bit_rle_rgbe
         * 32-bit_rle_xyze
         */
        if (hdrFormat != "32-bit_rle_rgbe") {
            throw "HDR image: unsupported format.";
        }

        let resolutionStr = readLine();
        let resolutions = resolutionStr.split(" ");

        let decreaseY = resolutions[0] == "-Y";
        let decreaseX = resolutions[2] == "-X";

        let height = parseInt(resolutions[1]);
        let width = parseInt(resolutions[3]);

        // format 固定?
        let hdrInfo = new HDRTextureInfo(source, readByteOffset, decreaseX, decreaseY, width, height, TextureFormat.R32G32B32A32);

        /**
         * Scanline Records
         * 1. Uncompressed 每像素 4 字节
         * 2. Old run-length encoded
         * 3. New run-length encoded *✓
         */


        return hdrInfo;
    }

    private static getLineString(data: Uint8Array, readByteOffset: number) {

        let dataLength = data.length;

        let index = readByteOffset;

        let res = "";
        let char = "";
        // do {
        //     char = String.fromCharCode(data[index]);
        //     res = `${res}${char}`;
        //     index++;
        // } while (index < dataLength && char != "\n");

        while (index < dataLength && char != "\n") {
            res = `${res}${char}`;
            char = String.fromCharCode(data[index]);
            index++;
        }

        return res;

    }



    constructor(public source: ArrayBuffer, public byteOffset: number, public decreaseX: boolean, public decreaseY: boolean, public width: number, public height: number, public format: TextureFormat) {

    }

    get_32_bit_rle_rgbe(): ArrayBufferView {

        let width = this.width;
        let height = this.height;
        let decreaseX = this.decreaseX;
        let decreaseY = this.decreaseY;

        let data = new Uint8Array(this.source, this.byteOffset);
        let dataIndex = 0;

        let rgbeBuffer = new ArrayBuffer(width * 4);
        let rgbeArray = new Uint8Array(rgbeBuffer);

        let pixelBuffer = new ArrayBuffer(width * height * 4 * 3);
        let pixelArray = new Float32Array(pixelBuffer);

        // todo decreaseX and decreaseY
        for (let y = height; y > 0; y--) {

            // begin unnormalized pixel
            let a2 = data[dataIndex++]; // equal to 2
            let b2 = data[dataIndex++]; // equal to 2
            let c = data[dataIndex++]; // upper byte
            let d = data[dataIndex++]; // lower byte

            let scanlineLength = (c << 8) | d;

            if (scanlineLength != width) {
                throw "HDR info: scanlineLength wrong.";
            }

            let index = 0;
            for (let i = 0; i < 4; i++) {
                let endIndex = (i + 1) * scanlineLength;

                while (index < endIndex) {
                    let a = data[dataIndex++];
                    let b = data[dataIndex++];
                    if (a > 128) {
                        let count = a - 128;
                        if (count > endIndex - index) {
                            throw "HDR info: ??";
                        }
                        while (count-- > 0) {
                            rgbeArray[index++] = b;
                        }
                    }
                    else {
                        let count = a;
                        if (count == 0 || count > endIndex - index) {
                            throw "HDR info: ??";
                        }
                        rgbeArray[index++] = b;
                        if (--count > 0) {
                            for (let j = 0; j < count; j++) {
                                rgbeArray[index++] = data[dataIndex++];
                            }
                        }
                    }

                }
            }

            for (let i = 0; i < scanlineLength; i++) {
                let r = rgbeArray[i];
                let g = rgbeArray[i + scanlineLength];
                let b = rgbeArray[i + 2 * scanlineLength];
                let e = rgbeArray[i + 3 * scanlineLength];

                // /// test data
                // /**
                //  * (R,G,B)=(1.,.5,.25) would be represented by the bytes (128,64,32,129).
                //  */
                // r = 128;
                // g = 64;
                // b = 32;
                // e = 129;

                let index = (height - y) * scanlineLength * 3 + i * 3;

                const Ldexp = (mantissa: number, exponent: number) => {
                    if (exponent > 1023) {
                        return mantissa * Math.pow(2, 1023) * Math.pow(2, exponent - 1023);
                    }

                    if (exponent < -1074) {
                        return mantissa * Math.pow(2, -1074) * Math.pow(2, exponent + 1074);
                    }

                    return mantissa * Math.pow(2, exponent);
                }

                if (e > 0) {
                    let exponent = Ldexp(1.0, e - (128 + 8));
                    pixelArray[index] = r * exponent;
                    pixelArray[index + 1] = g * exponent;
                    pixelArray[index + 2] = b * exponent;
                }
                else {
                    pixelArray[index] = 0;
                    pixelArray[index + 1] = 0;
                    pixelArray[index + 2] = 0;
                }
            }

        }

        return pixelArray;
    }


    /**
     * https://www.radiance-online.org/archived/radsite/radiance/refer/Notes/picture_format.html
     */
    readScanLine(): ArrayBufferView {

        let width = this.width;
        let height = this.height;
        let decreaseX = this.decreaseX;
        let decreaseY = this.decreaseY;

        let n = 3;
        if (this.format == TextureFormat.R32G32B32A32) {
            n = 4;
        }

        let pixelArray = new Float32Array(width * height * n);

        let scanlineArray = new Uint8Array(width * 4);

        let data = new Uint8Array(this.source, this.byteOffset);
        let dataLength = data.length;
        let dataIndex = 0;

        const getc = () => {
            // todo  check
            if (dataIndex >= dataLength) {
                throw "HDR info: data wrong.";
            }

            return data[dataIndex++];
        };

        const wrong = () => {
            throw "HDR info: data wrong.";
        }

        for (let y = (height - 1); y >= 0; y--) {

            this.readcolors(scanlineArray, getc, wrong);

            for (let i = 0; i < width; i++) {

                // color_color func
                let index = 4 * i;
                let byter = scanlineArray[index];
                let byteg = scanlineArray[index + 1];
                let byteb = scanlineArray[index + 2];
                let bytee = scanlineArray[index + 3];

                // /// test data
                // /**
                //  * (R,G,B)=(1.,.5,.25) would be represented by the bytes (128,64,32,129)
                //  */
                // byter = 128;
                // byteg = 64;
                // byteb = 32;
                // bytee = 129;

                let offsetY = y;
                let offsetX = i;
                if (decreaseY) {
                    offsetY = height - 1 - y;
                }
                if (decreaseX) {
                    offsetX = width - 1 - i;
                }

                let pixelIndex = offsetY * width * n + offsetX * n;

                if (bytee == 0) {
                    pixelArray[pixelIndex] = 0;
                    pixelArray[pixelIndex + 1] = 0;
                    pixelArray[pixelIndex + 2] = 0;
                    if (n == 4) {
                        pixelArray[pixelIndex + 3] = 1;
                    }
                }
                else {
                    let f = ldexp(1.0, bytee - (128 + 8));
                    pixelArray[pixelIndex] = (byter + 0.5) * f;
                    pixelArray[pixelIndex + 1] = (byteg + 0.5) * f;
                    pixelArray[pixelIndex + 2] = (byteb + 0.5) * f;
                    if (n == 4) {
                        pixelArray[pixelIndex + 3] = 1;
                    }
                }
            }

        }
        return pixelArray;
    }

    readcolors(scanlineArray: Uint8Array, getc: () => number, wrong: () => void) {

        const setScanLineData = (w: number, channel: number, value: number) => {
            scanlineArray[w * 4 + channel] = value;
        }

        let width = this.width;

        // 第一个数据
        let unnormalizedr = getc();
        let unnormalizedg = getc();
        let unnormalizedb = getc();
        let unnormalizede = getc();

        if (width < 8 || width > 32767) {
            this.olddreadcolors(scanlineArray, getc, unnormalizedr, unnormalizedg, unnormalizedb, unnormalizede);
            return;
        }

        if (unnormalizedr != 2 || unnormalizedg != 2 || unnormalizedb & 128) {
            this.olddreadcolors(scanlineArray, getc, unnormalizedr, unnormalizedg, unnormalizedb, unnormalizede);
            return;
        }

        if ((unnormalizedb << 8 | unnormalizede) != width) {
            wrong()
        }
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < width;) {
                let code = getc();
                if (code > 128) {
                    code &= 127;
                    let val = getc();
                    if (j + code > width) {
                        wrong();
                    }
                    while (code--) {
                        setScanLineData(j++, i, val);
                    }
                }
                else {
                    if (j + code > width) {
                        wrong();
                    }
                    while (code--) {
                        let val = getc();
                        setScanLineData(j++, i, val);
                    }
                }
            }
        }

    }

    olddreadcolors(scanlineArray: Uint8Array, getc: () => number, r: number, g: number, b: number, e: number) {

        let rshift = 0;

        let len = this.width;

        scanlineArray[0] = r;
        scanlineArray[1] = g;
        scanlineArray[2] = b;
        scanlineArray[3] = e;

        for (let w = 1; w < len; w++) {
            let unnormalizedr = getc();
            let unnormalizedg = getc();
            let unnormalizedb = getc();
            let unnormalizede = getc();

            let scanIndex = w * 4;
            scanlineArray[scanIndex] = unnormalizedr;
            scanlineArray[scanIndex + 1] = unnormalizedg;
            scanlineArray[scanIndex + 2] = unnormalizedb;
            scanlineArray[scanIndex + 3] = unnormalizede;

            if (unnormalizedr == 1 && unnormalizedg == 1 && unnormalizedb == 1) {
                let lastIndex = scanIndex - 4;
                for (let i = unnormalizede << rshift; i > 0; i--) {
                    scanlineArray[scanIndex] = scanlineArray[lastIndex];
                    scanlineArray[scanIndex + 1] = scanlineArray[lastIndex + 1];
                    scanlineArray[scanIndex + 2] = scanlineArray[lastIndex + 2];
                    scanlineArray[scanIndex + 3] = scanlineArray[lastIndex + 3];
                    // len--;
                }
                rshift += 8;
            }
            else {
                // len--;
                rshift = 0;
            }
        }


    }

    color_color(col: Vector4, clr: Vector4) {
        let f = 0;
        if (clr.w == 0) {
            col.x = col.y = col.z = 0;
        }
        else {
            f = ldexp(1.0, clr.w - (128 + 8));
            // todo   + 0.5 值会变
            col.x = (clr.x) * f;
            col.y = (clr.y) * f;
            col.z = (clr.z) * f;
        }
    }



}

function ldexp(value: number, exponent: number): number {
    return value * Math.pow(2, exponent);
}