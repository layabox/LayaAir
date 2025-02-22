import { Sprite } from "../display/Sprite"
import { ColorFilter } from "../filters/ColorFilter"
import { Utils } from "../utils/Utils"
import { WeakObject } from "../utils/WeakObject"

/**
 * <code>UIUtils</code> 是文本工具集。
 */
export class UIUtils {
    private static grayFilter: ColorFilter = new ColorFilter([0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0, 0, 0, 1, 0]);

    /**
     * 用字符串填充数组，并返回数组副本。
     * @param arr 源数组对象。
     * @param str 用逗号连接的字符串。如"p1,p2,p3,p4"。
     * @param type 如果值不为null，则填充的是新增值得类型。
     * @return 填充后的数组。
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
     * 转换uint类型颜色值为字符型颜色值。
     * @param color uint颜色值。
     * @return 字符型颜色值。
     */
    static toColor(color: number): string {
        return Utils.toHexColor(color);
    }

    /**
     * 给指定的目标显示对象添加或移除灰度滤镜。
     * @param target 目标显示对象。
     * @param isGray 如果值true，则添加灰度滤镜，否则移除灰度滤镜。
     */
    //TODO:coverage
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

    /**@private */
    private static _funMap: WeakObject = null;//new WeakObject();

    /**
     * @private 根据字符串，返回函数表达式
     */
    //TODO:coverage
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