import { HTMLElement } from "../dom/HTMLElement";
/**
 * @private
 * HTML的布局类
 * 对HTML的显示对象进行排版
 */
export declare class Layout {
    private static DIV_ELEMENT_PADDING;
    private static _will;
    static later(element: HTMLElement): void;
    static layout(element: HTMLElement): any[];
    static _multiLineLayout(element: HTMLElement): any[];
}
