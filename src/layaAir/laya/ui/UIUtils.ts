import { Sprite } from "../display/Sprite"
import { ColorFilter } from "../filters/ColorFilter"
import { Utils } from "../utils/Utils"
import { WeakObject } from "../utils/WeakObject"

/**
 * @en The `UIUtils` class is a collection of text utility functions.
 * @zh `UIUtils` 是文本工具集。
 */
export class UIUtils {

    /**@internal */
    private static grayFilter: ColorFilter = new ColorFilter([0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0, 0, 0, 1, 0]);

    /**@internal */
    private static _funMap: WeakObject = null;//new WeakObject();

    /**
     * @en Fill an array with a string and return a copy of the array.
     * @param arr The source array.
     * @param str A string of comma-separated values, such as "p1,p2,p3,p4".
     * @param type If the value is not null, it indicates the type of the newly added value.
     * @returns The filled array.
     * @zh 用字符串填充数组，并返回数组副本。
     * @param arr 源数组对象。
     * @param str 用逗号连接的字符串。如"p1,p2,p3,p4"。
     * @param type 如果值不为null，则填充的是新增值得类型。
     * @returns 填充后的数组。
     */
    static fillArray(arr: any[], str: string, type: typeof Number | typeof String = null): any[] {
        let temp = arr.concat();
        if (str) {
            let a = str.split(",");
            for (let i = 0, n = Math.min(temp.length, a.length); i < n; i++) {
                let value = a[i];
                temp[i] = (value == "true" ? true : (value == "false" ? false : value));
                if (type != null) temp[i] = type(value);
            }
        }
        return temp;
    }

    /**
     * @en Convert a uint color value to a string color value.
     * @param color The uint color value.
     * @returns The string color value.
     * @zh 转换 uint 类型颜色值为字符型颜色值。
     * @param color uint颜色值。
     * @return 字符型颜色值。
     */
    static toColor(color: number): string {
        return Utils.toHexColor(color);
    }

    /**
     * @en Add or remove a grayscale filter to the specified target display object.
     * @param target The target display object.
     * @param isGray If true, add a grayscale filter, otherwise remove the grayscale filter.
     * @zh 给指定的目标显示对象添加或移除灰度滤镜。
     * @param target 目标显示对象。
     * @param isGray 如果值true，则添加灰度滤镜，否则移除灰度滤镜。
     */
    static gray(target: Sprite, isGray: boolean = true): void {
        let filters: any[] = target.filters || [];
        let i = filters.indexOf(UIUtils.grayFilter);
        if (isGray) {
            if (i == -1) {
                filters.push(UIUtils.grayFilter);
                target.filters = filters;
            }
        }
        else if (i != -1) {
            filters.splice(i, 1);
            target.filters = filters;
        }
    }

    /**
     * @internal
     * @en Get the function expression based on the string.
     * @param value The string value.
     * @returns The function expression.
     * @zh 根据字符串，返回函数表达式。
     * @param value 字符串值。
     * @return 函数表达式。
     */
    static getBindFun(value: string): Function {
        if (!UIUtils._funMap) {
            UIUtils._funMap = new WeakObject();
        }
        var fun: Function = UIUtils._funMap.get(value);
        if (fun == null) {
            var temp: string = "\"" + value + "\"";
            temp = temp.replace(/^"\${|}"$/g, "").replace(/\${/g, "\"+").replace(/}/g, "+\"");
            var str: string = "(function(data){if(data==null)return;with(data){try{\nreturn " + temp + "\n}catch(e){}}})";
            fun = (window as any).Laya._runScript(str);
            UIUtils._funMap.set(value, fun);
        }
        return fun;
    }
}