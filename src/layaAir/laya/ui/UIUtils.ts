import { Sprite } from "../display/Sprite"
import { ColorFilter } from "../filters/ColorFilter"
import { IFilter } from "../filters/IFilter"
import { Utils } from "../utils/Utils"
import { WeakObject } from "../utils/WeakObject"
import { ClassUtils } from "../utils/ClassUtils";

/**
 * <code>UIUtils</code> 是文本工具集。
 */
export class UIUtils {
    private static grayFilter: ColorFilter = new ColorFilter([0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0, 0, 0, 1, 0]);
    /**
     * 需要替换的转义字符表
     */
    static escapeSequence: any = { "\\n": "\n", "\\t": "\t" };

    /**
     * 用字符串填充数组，并返回数组副本。
     * @param	arr 源数组对象。
     * @param	str 用逗号连接的字符串。如"p1,p2,p3,p4"。
     * @param	type 如果值不为null，则填充的是新增值得类型。
     * @return 填充后的数组。
     */
    static fillArray(arr: any[], str: string, type: typeof Number | typeof String = null): any[] {
        var temp: any[] = arr.concat();
        if (str) {
            var a: any[] = str.split(",");
            for (var i: number = 0, n: number = Math.min(temp.length, a.length); i < n; i++) {
                var value: string = a[i];
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
     * @param	traget 目标显示对象。
     * @param	isGray 如果值true，则添加灰度滤镜，否则移除灰度滤镜。
     */
    //TODO:coverage
    static gray(traget: Sprite, isGray: boolean = true): void {
        if (isGray) {
            UIUtils.addFilter(traget, UIUtils.grayFilter);
        } else {
            UIUtils.clearFilter(traget, ColorFilter);
        }
    }

    /**
     * 给指定的目标显示对象添加滤镜。
     * @param	target 目标显示对象。
     * @param	filter 滤镜对象。
     */
    //TODO:coverage
    static addFilter(target: Sprite, filter: IFilter): void {
        var filters: any[] = target.filters || [];
        filters.push(filter);
        target.filters = filters;
    }

    /**
     * 移除目标显示对象的指定类型滤镜。
     * @param	target 目标显示对象。
     * @param	filterType 滤镜类型。
     */
    //TODO:coverage
    static clearFilter(target: Sprite, filterType: new () => any): void {
        var filters: any[] = target.filters;
        if (filters != null && filters.length > 0) {
            for (var i: number = filters.length - 1; i > -1; i--) {
                var filter: any = filters[i];
                if (filter instanceof filterType) filters.splice(i, 1);
            }
            target.filters = filters;
        }
    }

    /**
     * 获取当前要替换的转移字符
     * @param word
     * @return
     *
     */
    //TODO:coverage
    private static _getReplaceStr(word: string): string {
        return UIUtils.escapeSequence[word];
    }

    /**
     * 替换字符串中的转义字符
     * @param str
     */
    static adptString(str: string): string {
        return str.replace(/\\(\w)/g, UIUtils._getReplaceStr);
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

ClassUtils.regClass("laya.ui.UIUtils", UIUtils);
ClassUtils.regClass("Laya.UIUtils", UIUtils);