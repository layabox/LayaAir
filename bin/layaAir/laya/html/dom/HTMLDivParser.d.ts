import { HTMLElement } from "./HTMLElement";
import { ILayout } from "../utils/ILayout";
import { Rectangle } from "laya/maths/Rectangle";
import { Handler } from "laya/utils/Handler";
/**
 * @private
 */
export declare class HTMLDivParser extends HTMLElement {
    /** 实际内容的高 */
    contextHeight: number;
    /** 实际内容的宽 */
    contextWidth: number;
    /** @private */
    private _htmlBounds;
    /** @private */
    private _boundsRec;
    /** 重绘回调 */
    repaintHandler: Handler;
    reset(): HTMLElement;
    /**
     * 设置标签内容
     */
    innerHTML: string;
    /**
    * 获取对象的宽
    */
    /*override*/ width: number;
    /**
     * 追加内容，解析并对显示对象排版
     * @param	text
     */
    appendHTML(text: string): void;
    /**
     * @private
     * @param	out
     * @return
     */
    _addChildsToLayout(out: ILayout[]): boolean;
    /**
     * @private
     * @param	out
     */
    _addToLayout(out: ILayout[]): void;
    /**
     * 获取bounds
     * @return
     */
    getBounds(): Rectangle;
    parentRepaint(recreate?: boolean): void;
    /**
     * @private
     * 对显示内容进行排版
     */
    layout(): void;
    /**
     * 获取对象的高
     */
    height: number;
}
