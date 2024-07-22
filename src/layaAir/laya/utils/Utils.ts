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
     * @param	angle 角度值。
     * @return	返回弧度值。
     */
    static toRadian(angle: number): number {
        return angle * _pi2;
    }

    /**
     * @en Converts radians to an angle.
     * @param radian The radian value.
     * @returns The angle value in degrees.
     * @zh 将弧度转换为角度。
     * @param	radian 弧度值。
     * @return	返回角度值。
     */
    static toAngle(radian: number): number {
        return radian * _pi;
    }

    /**
     * @en Converts an unsigned integer color value to a string representation.
     * @param color The color value.
     * @returns A string representation of the color value.
     * @zh 将 uint 类型的颜色值转换为字符串型颜色值。
     * @param color 颜色值。
     * @return 字符串型颜色值。
     */
    static toHexColor(color: number): string {
        if (color < 0 || isNaN(color)) return null;
        var str: string = color.toString(16);
        while (str.length < 6) str = "0" + str;
        return "#" + str;
    }

    /**
     * @en Converts a string color value to a number color.
     * @param value The string color value.
     * @returns The color value as a number.
     * @zh 将字符串型颜色值转换为数字型颜色值。
     * @param value 字符串颜色值
     * @returns 作为数字的颜色值
     */
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

    /**
     * @en Gets a globally unique ID.
     * @zh 获取一个全局唯一ID。
     */
    static getGID(): number {
        return _gid++;
    }

    /**
     * @private
     * @en Clears the source array and copies the values from the array parameter.
     * @param source The array to be assigned values.
     * @param array The new values to be copied into the source array.
     * @returns The copied source array.
     * @zh 清空 source 数组，并复制 array 数组的值。
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
     * @en Batch translates point coordinates by the specified offsets.
     * @param points The list of point coordinates.
     * @param x The offset to translate along the x-axis.
     * @param y The offset to translate along the y-axis.
     * @zh 批量移动点坐标，按照指定的偏移量。
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
     * @en Parses a string and returns an integer. Unlike the native JavaScript parseInt, if the string is empty or not a number, this method returns 0 instead of NaN.
     * @param str The string to be parsed.
     * @param radix The radix for parsing the number (between 2 and 36). Defaults to 0, which means decimal. The other values range from 2 to 36. If it starts with "0xX" or "0X", it will be based on 16. If the parameter is not within the above range, this method returns 0.
     * @returns The parsed number.
     * @zh 解析字符串并返回一个整数。与 JavaScript 原生的 parseInt 不同，如果字符串为空或非数字，这里返回 0 而不是 NaN。
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
}

