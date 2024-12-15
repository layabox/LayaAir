import { LayaGL } from "../layagl/LayaGL";
import { Color } from "../maths/Color";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { RenderTexture } from "../resource/RenderTexture";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { Browser } from "./Browser";

var _gid: number = 1;
const _pi: number = 180 / Math.PI;
const _pi2: number = Math.PI / 180;

/**
 * @en Utils is a utility class.
 * @zh Utils 是工具类。
 */
export class Utils {

    /**
     * @en Converts an angle to radians.
     * @param angle The angle value.
     * @returns The radian value.
     * @zh 将角度转换为弧度。
     * @param angle 角度值。
     * @return 返回弧度值。
     */
    static toRadian(angle: number): number {
        return angle * _pi2;
    }

    /**
     * @en Converts radians to an angle.
     * @param radian The radian value.
     * @returns The angle value in degrees.
     * @zh 将弧度转换为角度。
     * @param radian 弧度值。
     * @return 返回角度值。
     */
    static toAngle(radian: number): number {
        return radian * _pi;
    }

    /**
     * @deprecated Please use Color.hexToString instead.
     */
    static toHexColor(color: number): string {
        return Color.hexToString(color);
    }

    /**
     * @deprecated Please use Color.stringToHex instead.
     */
    static fromStringColor(value: string): number {
        return Color.stringToHex(value);
    }

    /**
     * @en Assigns a global unique ID for the given target-method pair.
     * @param method The method, it can be a function or a function name.
     * @param target The target. It's optional. 
     * @returns A unique ID for the given target-method pair. 
     * @zh 为一个target-method对分配一个全局唯一ID。
     * @param method 方法，可以是一个函数或者函数名。
     * @param target 目标对象，可选。
     * @return 分配到的唯一ID。
     */
    static getGID(target: Object | null, method?: Function | string): string {
        let cid: number = target ? ((target as any)[objUidKey] || ((target as any)[objUidKey] = _gid++)) : 0;
        let mid: number | string = method ? (typeof (method) === "string" ? method : ((method as any)[objUidKey] || ((method as any)[objUidKey] = _gid++))) : 0;
        return cid + "_" + mid;
    }

    /**
     * @private
     * @en Clears the source array and copies the values from the array parameter.
     * @param source The array to be assigned values.
     * @param array The new values to be copied into the source array.
     * @returns The copied source array.
     * @zh 清空 source 数组，并复制 array 数组的值。
     * @param source 需要赋值的数组。
     * @param array 新的数组值。
     * @return  复制后的数据 source 。
     */
    static copyArray(source: any[], array: any[]): any[] {
        source || (source = []);
        if (!array) return source;
        source.length = array.length;
        var len: number = array.length;
        for (let i = 0; i < len; i++) {
            source[i] = array[i];
        }
        return source;
    }

    /**
     * @en Parses a string and returns an integer. Unlike the native JavaScript parseInt, if the string is empty or not a number, this method returns 0 instead of NaN.
     * @param str The string to be parsed.
     * @param radix The radix for parsing the number (between 2 and 36). Defaults to 0, which means decimal. The other values range from 2 to 36. If it starts with "0xX" or "0X", it will be based on 16. If the parameter is not within the above range, this method returns 0.
     * @returns The parsed number.
     * @zh 解析字符串并返回一个整数。与 JavaScript 原生的 parseInt 不同，如果字符串为空或非数字，这里返回 0 而不是 NaN。
     * @param str 要被解析的字符串。
     * @param radix 表示要解析的数字的基数。默认值为0，表示10进制，其他值介于 2 ~ 36 之间。如果它以 “0x” 或 “0X” 开头，将以 16 为基数。如果该参数不在上述范围内，则此方法返回 0。
     * @return 返回解析后的数字。
     */
    static parseInt(str: string, radix: number = 0): number {
        var result: any = parseInt(str, radix);
        if (isNaN(result)) return 0;
        return result;
    }

    /**
     * @en Gets the base name of the file from the specified path, including the extension.
     * @zh 从指定路径中获取文件名（包含扩展名）。
     */
    static getBaseName(path: string): string {
        let i = path.lastIndexOf("/");
        if (i != -1)
            path = path.substring(i + 1);
        i = path.indexOf("?");
        if (i != -1)
            path = path.substring(0, i);
        return path;
    }

    /**
     * @en Gets the file extension from the specified path and converts it to lowercase. For example, "1. abc" will return abc.
     * @zh 从指定路径获取文件扩展名，并转换为小写字母。例如"1.abc"将返回abc。
     */
    static getFileExtension(path: string): string {
        let i = path.lastIndexOf(".");

        if (i != -1) {
            let ext = path.substring(i + 1).toLowerCase();
            let j = ext.indexOf("?");
            if (j != -1)
                ext = ext.substring(0, j);
            if (ext === "ls") { //lanit.ls ltcb.ls 这类特殊扩展名的支持
                let k = path.lastIndexOf(".", i - 1);
                if (k != -1) {
                    let ext2 = path.substring(k + 1, i + 1) + ext;
                    if (ext2 === "lanit.ls" || ext2 === "ltcb.ls")
                        return ext2;
                }
            }
            return ext;
        }
        else
            return "";
    }

    /**
     * @en Changes the file extension of the specified path.
     * @param path The file path.
     * @param newExt The new file extension.
     * @param excludeDot Whether to exclude the dot prefix in the new extension. Default is false.
     * @returns The path with the new file extension.
     * @zh 更改指定路径的文件扩展名。
     * @param path 文件路径。
     * @param newExt 新的文件扩展名。
     * @param excludeDot 是否在新扩展中排除点前缀。默认值为false。
     * @returns 具有新文件扩展名的路径。
     */
    static replaceFileExtension(path: string, newExt: string, excludeDot?: boolean): string {
        if (!path)
            return path;
        let i = path.lastIndexOf(".");
        if (newExt.length > 0 && !excludeDot)
            newExt = "." + newExt;
        if (i != -1) {
            let j = path.indexOf("?", i);
            if (j != -1)
                return path.substring(0, i) + newExt + path.substring(j);
            else
                return path.substring(0, i) + newExt;
        }
        else
            return path + newExt;
    }

    /**
     * 
     * @param str 判断一个字符串是否UUID格式
     * @returns 
     */
    static isUUID(str: string): boolean {
        //uuid xxxxxxxx-xxxx-...
        return str && str.length >= 36 && str.charCodeAt(8) === 45 && str.charCodeAt(13) === 45
    }

    /**
     * @deprecated 请使用uint8ArrayToArrayBufferAsync函数代替
     * @en Converts a RenderTexture to a Base64 encoded string.
     * @param rendertexture The RenderTexture to convert.
     * @returns The converted Base64 string
     * @zh 将RenderTexture转换为Base64
     * @param rendertexture 要转换的RenderTexture
     * @returns 转换后的Base64字符串
     */
    static uint8ArrayToArrayBuffer(rendertexture: RenderTexture | RenderTexture2D): string {
        let pixelArray: Uint8Array | Float32Array;
        const width = rendertexture.width;
        const height = rendertexture.height;
        const pixelCount = width * height * 4;
        const colorFormat = (rendertexture instanceof RenderTexture) ? rendertexture.colorFormat : rendertexture.getColorFormat();
        switch (colorFormat) {
            case RenderTargetFormat.R8G8B8:
            case RenderTargetFormat.R8G8B8A8:
                pixelArray = new Uint8Array(pixelCount);
                break;
            case RenderTargetFormat.R16G16B16A16:
                pixelArray = new Float32Array(pixelCount);
                break;
            default:
                throw "this function is not surpprt " + rendertexture.format.toString() + "format Material";
        }
        LayaGL.textureContext.readRenderTargetPixelData(rendertexture._renderTarget, 0, 0, width, height, pixelArray);
        if (colorFormat === RenderTargetFormat.R16G16B16A16) {
            const ori = pixelArray;
            const trans = new Uint8Array(pixelCount);
            for (let i = 0, n = ori.length; i < n; i++) {
                trans[i] = Math.min(Math.floor(ori[i] * 255), 255);
            }
            pixelArray = trans;
        }

        const pixels = pixelArray;
        const canvas = Browser.createElement("canvas");
        canvas.height = height;
        canvas.width = width;
        const ctx2d = canvas.getContext('2d')
        const imgdata: ImageData = ctx2d.createImageData(width, height);
        imgdata.data.set(new Uint8ClampedArray(pixels));
        ctx2d.putImageData(imgdata, 0, 0);
        const base64String = canvas.toDataURL();
        canvas.remove();
        return base64String;
    }


    /**
    * @en Converts a RenderTexture to a Base64 encoded string.
    * @param rendertexture The RenderTexture to convert.
    * @returns A promise that resolves to a Base64 string representing the RenderTexture.
    * @zh 将 RenderTexture 转换为 Base64 编码的字符串。
    * @param rendertexture 要转换的 RenderTexture。
    * @returns 一个 Promise，该 Promise 将解析为表示 RenderTexture 的 Base64 字符串。
    */
    static uint8ArrayToArrayBufferAsync(rendertexture: RenderTexture | RenderTexture2D): Promise<string> {
        let pixelArray: Uint8Array | Float32Array;
        const width = rendertexture.width;
        const height = rendertexture.height;
        const pixelCount = width * height * 4;
        const colorFormat = (rendertexture instanceof RenderTexture) ? rendertexture.colorFormat : rendertexture.getColorFormat();
        switch (colorFormat) {
            case RenderTargetFormat.R8G8B8:
            case RenderTargetFormat.R8G8B8A8:
                pixelArray = new Uint8Array(pixelCount);
                break;
            case RenderTargetFormat.R16G16B16A16:
                pixelArray = new Float32Array(pixelCount);
                break;
            default:
                throw "this function is not surpprt " + rendertexture.format.toString() + "format Material";
        }
        return rendertexture.getDataAsync(0, 0, width, height, pixelArray).then(() => {
            //tranceTo
            //throw " rt get Data";
            if (colorFormat === RenderTargetFormat.R16G16B16A16) {
                const ori = pixelArray;
                const trans = new Uint8Array(pixelCount);
                for (let i = 0, n = ori.length; i < n; i++) {
                    trans[i] = Math.min(Math.floor(ori[i] * 255), 255);
                }
                pixelArray = trans;
            }

            const pixels = pixelArray;
            // if (LayaEnv.isConch) {
            //TODO:
            //var base64img=__JS__("conchToBase64('image/png',1,pixels,canvasWidth,canvasHeight)");
            //var l = base64img.split(",");
            //if (isBase64)
            // return base64img;
            //return base.utils.DBUtils.decodeArrayBuffer(l[1]);
            // }
            // else {
            const canvas = Browser.createElement("canvas");
            canvas.height = height;
            canvas.width = width;
            const ctx2d = canvas.getContext('2d')
            const imgdata: ImageData = ctx2d.createImageData(width, height);
            imgdata.data.set(new Uint8ClampedArray(pixels));
            ctx2d.putImageData(imgdata, 0, 0);
            const base64String = canvas.toDataURL();
            canvas.remove();
            // }
            return Promise.resolve(base64String);
        });
    }
}

const objUidKey = Symbol();