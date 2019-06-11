import { UIComponent } from "./UIComponent";
import { IBox } from "./IBox";
/**
 * <code>Box</code> 类是一个控件容器类。
 */
export declare class Box extends UIComponent implements IBox {
    private _bgColor;
    /**@inheritDoc */
    dataSource: any;
    /**背景颜色*/
    bgColor: string;
    private _onResize;
}
