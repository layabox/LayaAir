import { LayaEnv } from "../../LayaEnv";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { HTMLCanvas } from "../resource/HTMLCanvas";
import { RenderTexture } from "../resource/RenderTexture";
import { RenderTexture2D } from "../resource/RenderTexture2D";

var _gid: number = 1;
const _pi: number = 180 / Math.PI;
const _pi2: number = Math.PI / 180;

/**
 * <code>Utils</code> 是工具类。
 */
export class Utils {

    /**
     * 角度转弧度。
     * @param	angle 角度值。
     * @return	返回弧度值。
     */
    static toRadian(angle: number): number {
        return angle * _pi2;
    }

    /**
     * 弧度转换为角度。
     * @param	radian 弧度值。
     * @return	返回角度值。
     */
    static toAngle(radian: number): number {
        return radian * _pi;
    }

    /**
     * 将传入的 uint 类型颜色值转换为字符串型颜色值。
     * @param color 颜色值。
     * @return 字符串型颜色值。
     */
    static toHexColor(color: number): string {
        if (color < 0 || isNaN(color)) return null;
        var str: string = color.toString(16);
        while (str.length < 6) str = "0" + str;
        return "#" + str;
    }

    static fromStringColor(value: string): number {
        if (!value)
            return 0;

        if (value.indexOf("rgba(") >= 0 || value.indexOf("rgb(") >= 0) {
            let p1 = value.indexOf("(");
            let p2 = value.indexOf(")");
            if (p1 == -1 || p2 == -1)
                return 0;

            value = value.substring(p1 + 1, p2);
            let arr: any[] = value.split(",");
            let len = arr.length;
            for (let i = 0; i < len; i++) {
                arr[i] = parseFloat(arr[i]);
                if (isNaN(arr[i]))
                    arr[i] = 0;
            }
            if (arr.length == 4)
                return (arr[0] << 24) + (arr[1] << 16) + (arr[2] << 8) + Math.round(arr[3] * 255);
            else
                return (arr[0] << 16) + (arr[1] << 8) + arr[2];
        } else {
            value.charAt(0) === '#' && (value = value.substring(1));
            let len = value.length;
            if (len === 3 || len === 4) {
                let temp: string = "";
                for (let i = 0; i < len; i++) {
                    temp += (value[i] + value[i]);
                }
                value = temp;
            }
            return parseInt(value, 16);
        }
    }

    /**获取一个全局唯一ID。*/
    static getGID(): number {
        return _gid++;
    }

    /**
     * @private
     * 清空source数组，复制array数组的值。
     * @param	source 需要赋值的数组。
     * @param	array 新的数组值。
     * @return 	复制后的数据 source 。
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
     * @private
     * 批量移动点坐标。
     * @param points 坐标列表。
     * @param x x轴偏移量。
     * @param y y轴偏移量。
     */
    static transPointList(points: any[], x: number, y: number): void {
        var i: number, len: number = points.length;
        for (i = 0; i < len; i += 2) {
            points[i] += x;
            points[i + 1] += y;
        }
    }

    /**
     * 解析一个字符串，并返回一个整数。和JS原生的parseInt不同：如果str为空或者非数字，原生返回NaN，这里返回0。
     * @param	str		要被解析的字符串。
     * @param	radix	表示要解析的数字的基数。默认值为0，表示10进制，其他值介于 2 ~ 36 之间。如果它以 “0x” 或 “0X” 开头，将以 16 为基数。如果该参数不在上述范围内，则此方法返回 0。
     * @return	返回解析后的数字。
     */
    static parseInt(str: string, radix: number = 0): number {
        var result: any = parseInt(str, radix);
        if (isNaN(result)) return 0;
        return result;
    }

    /**
     * 获得路径中的文件名（包含扩展名）
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
     * 获取文件名的扩展名，并转换为小写字母。例如"1.abc"将返回abc。
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
     * 更改文件名的扩展名。
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
     * 将RenderTexture转换为Base64
     * @param rendertexture 渲染Buffer
     * @returns 
     */
    static uint8ArrayToArrayBuffer(rendertexture: RenderTexture | RenderTexture2D) {
        let pixelArray: Uint8Array | Float32Array;
        let width = rendertexture.width;
        let height = rendertexture.height;
        let colorformat = (rendertexture instanceof RenderTexture) ? rendertexture.colorFormat : rendertexture._colorFormat;
        switch (colorformat) {
            case RenderTargetFormat.R8G8B8:
                pixelArray = new Uint8Array(width * height * 4);
                break;
            case RenderTargetFormat.R8G8B8A8:
                pixelArray = new Uint8Array(width * height * 4);
                break;
            case RenderTargetFormat.R16G16B16A16:
                pixelArray = new Float32Array(width * height * 4);
                break;
            default:
                throw "this function is not surpprt " + rendertexture.format.toString() + "format Material";
        }
        rendertexture.getData(0, 0, rendertexture.width, rendertexture.height, pixelArray);
        //tranceTo
        //throw " rt get Data";
        switch (colorformat) {
            case RenderTargetFormat.R16G16B16A16:
                let ori = pixelArray;
                let trans = new Uint8Array(width * height * 4);
                for (let i = 0, n = ori.length; i < n; i++) {
                    trans[i] = Math.min(Math.floor(ori[i] * 255), 255);
                }
                pixelArray = trans;
                break;
        }

        let pixels = pixelArray;
        var bs: String;
        if (LayaEnv.isConch) {
            //TODO:
            //var base64img=__JS__("conchToBase64('image/png',1,pixels,canvasWidth,canvasHeight)");
            //var l = base64img.split(",");
            //if (isBase64)
            //	return base64img;
            //return base.utils.DBUtils.decodeArrayBuffer(l[1]);
        }
        else {
            var canv: HTMLCanvas = new HTMLCanvas(true);
            canv.lock = true;
            canv.size(width, height);
            var ctx2d = canv.getContext('2d');
            //@ts-ignore
            var imgdata: ImageData = ctx2d.createImageData(width, height);
            //@ts-ignore
            imgdata.data.set(new Uint8ClampedArray(pixels));
            //@ts-ignore
            ctx2d.putImageData(imgdata, 0, 0);;
            bs = canv.source.toDataURL();
            canv.destroy();
        }
        return bs;
    }

}

