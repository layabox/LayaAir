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
 * @blueprintable
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

    /**
     * @en Parses a template string and returns a new string by replacing the placeholders with the specified values.
     * @param template The template string. 
     * @param vars The specified values. 
     * @returns The new string.
     * @zh 解析模板字符串，并返回一个新字符串，替换占位符为指定值。
     * @param template 模板字符串。
     * @param vars 指定值。
     * @return 新字符串。 
     */
    static parseTemplate(template: string, vars: Record<string, any>): string {
        let pos1: number = 0, pos2: number, pos3: number;
        let tag: string;
        let value: string;
        let result: string = "";
        while ((pos2 = template.indexOf("{", pos1)) != -1) {
            if (pos2 > 0 && template.charCodeAt(pos2 - 1) == 92)//\
            {
                result += template.substring(pos1, pos2 - 1);
                result += "{";
                pos1 = pos2 + 1;
                continue;
            }

            result += template.substring(pos1, pos2);
            pos1 = pos2;
            pos2 = template.indexOf("}", pos1);
            if (pos2 == -1)
                break;

            if (pos2 == pos1 + 1) {
                result += template.substring(pos1, pos1 + 2);
                pos1 = pos2 + 1;
                continue;
            }

            tag = template.substring(pos1 + 1, pos2);
            pos3 = tag.indexOf("=");
            if (pos3 != -1) {
                value = vars[tag.substring(0, pos3)];
                if (value == null)
                    result += tag.substring(pos3 + 1);
                else
                    result += value;
            }
            else {
                value = vars[tag];
                if (value != null)
                    result += value;
            }
            pos1 = pos2 + 1;
        }

        if (pos1 < template.length)
            result += template.substring(pos1);

        return result;
    }

    static sleep(ms: number): Promise<void> {
        if (ms < 1)
            return Promise.resolve();
        else
            return new Promise<void>((resolve) => setTimeout(resolve, ms));
    }

    static until(predicate: () => boolean, timeoutInMs?: number): Promise<void> {
        if (predicate())
            return Promise.resolve();

        return new Promise<void>((resolve) => {
            let start = performance.now();
            function timer() {
                if (predicate())
                    resolve();
                else if (timeoutInMs != null && performance.now() - start > timeoutInMs)
                    resolve();
                else
                    setTimeout(timer, 10);
            }
            setTimeout(timer, 10);
        });
    }

    static runTasks<T, T2>(datas: Array<T2>, numParallelTasks: number | ((numTasks: number) => boolean), taskFunc: (data: T2, index: number) => T | Promise<T>, abortToken?: { aborted: boolean }): Promise<T[]> {
        let limitFunc: (numTasks: number) => boolean;
        if (typeof (numParallelTasks) !== "number") {
            limitFunc = numParallelTasks;
            numParallelTasks = 0;
        }

        let total = datas.length;
        if (numParallelTasks >= total) {
            return Promise.all(datas.map((value, index) => {
                if (abortToken && abortToken.aborted)
                    return Promise.reject("aborted");
                else
                    return taskFunc(value, index);
            }));
        }

        const results: T[] = new Array(total);
        const executing: Promise<void>[] = [];
        let i = 0;

        // 递归处理任务队列
        function processNext(): Promise<void> {
            if (i >= total || (abortToken?.aborted)) {
                return Promise.resolve();
            }

            const j = i++;
            const item = datas[j];

            // 创建任务 Promise
            const p = Promise.resolve().then(() => {
                if (abortToken?.aborted) {
                    return Promise.reject("aborted");
                }
                return taskFunc(item, j);
            }).then((result) => {
                results[j] = result;
                executing.splice(executing.indexOf(p), 1);
            });

            executing.push(p);

            // 判断是否需要等待
            if (limitFunc ? limitFunc(executing.length) : executing.length >= <number>numParallelTasks) {
                return Promise.race(executing).then(processNext);
            } else {
                return processNext();
            }
        }

        // 启动初始并发任务
        const initialPromises: Promise<void>[] = [];
        const initialCount = Math.min(numParallelTasks, total);

        for (let i = 0; i < initialCount; i++) {
            initialPromises.push(processNext());
        }

        return Promise.all(initialPromises)
            .then(() => {
                if (executing.length > 0)
                    return Promise.all(executing);
                else
                    return null;
            }).then(() => results);
    }

    static runAllTasks<T, T2>(datas: Array<T2>, numParallelTasks: number | ((numTasks: number) => boolean), taskFunc: (data: T2, index: number) => T | Promise<T>, abortToken?: { aborted: boolean }): Promise<PromiseSettledResult<T>[]> {
        let limitFunc: (numTasks: number) => boolean;
        if (typeof (numParallelTasks) !== "number") {
            limitFunc = numParallelTasks;
            numParallelTasks = 0;
        }

        let total = datas.length;
        if (numParallelTasks >= total) {
            return Promise.allSettled(datas.map((value, index) => Promise.resolve().then(() => {
                if (abortToken && abortToken.aborted)
                    return Promise.reject("aborted");
                else
                    return taskFunc(value, index);
            })));
        }

        const results: PromiseSettledResult<T>[] = new Array(total);
        const executing: Promise<any>[] = [];
        let i = 0;

        // 递归处理任务队列
        function processNext(): Promise<void> {
            if (i >= total || (abortToken?.aborted)) {
                return Promise.resolve();
            }

            const j = i++;
            const item = datas[j];

            // 创建任务 Promise
            const p = Promise.resolve().then(() => {
                if (abortToken && abortToken.aborted)
                    return Promise.reject("aborted");
                else
                    return taskFunc(item, j);
            }).then((result) => {
                results[j] = { status: "fulfilled", value: result };
                executing.splice(executing.indexOf(p), 1);
            }).catch((reason) => {
                results[j] = { status: "rejected", reason };
                executing.splice(executing.indexOf(p), 1);
            });

            executing.push(p);

            // 判断是否需要等待
            if (limitFunc ? limitFunc(executing.length) : executing.length >= <number>numParallelTasks) {
                return Promise.race(executing).then(processNext);
            } else {
                return processNext();
            }
        }

        // 启动初始并发任务
        const initialPromises: Promise<void>[] = [];
        const initialCount = Math.min(numParallelTasks, total);

        for (let i = 0; i < initialCount; i++) {
            initialPromises.push(processNext());
        }

        return Promise.allSettled(initialPromises)
            .then(() => {
                if (executing.length > 0)
                    return Promise.allSettled(executing);
                else
                    return null;
            }).then(() => results);
    }

    /**
     * @en Compares two version strings.
     * @param ver1 The first version string.
     * @param ver2 The second version string.
     * @returns 1 if ver1 > ver2, -1 if ver1 < ver2, 0 if they are equal.
     * @zh 比较两个版本字符串。
     * @param ver1 第一个版本字符串。
     * @param ver2 第二个版本字符串。
     * @returns 如果 ver1 > ver2 返回 1，如果 ver1 < ver2 返回 -1，如果相等返回 0。
     */
    static compareVersion(ver1: string, ver2: string) {
        let v1 = ver1.split('.')
        let v2 = ver2.split('.')
        const len = Math.max(v1.length, v2.length)

        while (v1.length < len) {
            v1.push('0')
        }
        while (v2.length < len) {
            v2.push('0')
        }

        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i])
            const num2 = parseInt(v2[i])

            if (num1 > num2) {
                return 1
            } else if (num1 < num2) {
                return -1
            }
        }

        return 0;
    }
}

const objUidKey = Symbol();