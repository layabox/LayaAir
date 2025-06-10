import { Sprite } from "../display/Sprite"
import { WeakObject } from "../utils/WeakObject"

/**
 * @en The `UIUtils` class is a collection of text utility functions.
 * @zh `UIUtils` 是文本工具集。
 */
export class UIUtils {
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