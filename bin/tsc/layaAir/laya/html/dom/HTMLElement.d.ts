import { Graphics } from "../../display/Graphics";
import { HTMLStyle } from "../utils/HTMLStyle";
import { ILayout } from "../utils/ILayout";
import { URL } from "../../net/URL";
import { HTMLChar } from "../../utils/HTMLChar";
export declare enum HTMLElementType {
    BASE = 0,
    IMAGE = 1
}
/**
 * @private
 */
export declare class HTMLElement {
    private static _EMPTYTEXT;
    eletype: HTMLElementType;
    URI: URL;
    parent: HTMLElement;
    _style: HTMLStyle;
    protected _text: any;
    protected _children: any[];
    protected _x: number;
    protected _y: number;
    protected _width: number;
    protected _height: number;
    /**
     * 格式化指定的地址并返回。
     * @param	url 地址。
     * @param	base 基础路径，如果没有，则使用basePath。
     * @return	格式化处理后的地址。
     */
    static formatURL1(url: string, basePath?: string): string;
    constructor();
    protected _creates(): void;
    /**
     * 重置
     */
    reset(): HTMLElement;
    /**@private */
    _getCSSStyle(): HTMLStyle;
    /**@private */
    _addChildsToLayout(out: ILayout[]): boolean;
    /**@private */
    _addToLayout(out: ILayout[]): void;
    id: string;
    repaint(recreate?: boolean): void;
    parentRepaint(recreate?: boolean): void;
    innerTEXT: string;
    protected _setParent(value: HTMLElement): void;
    appendChild(c: HTMLElement): HTMLElement;
    addChild(c: HTMLElement): HTMLElement;
    removeChild(c: HTMLElement): HTMLElement;
    static getClassName(tar: any): string;
    /**
     * <p>销毁此对象。destroy对象默认会把自己从父节点移除，并且清理自身引用关系，等待js自动垃圾回收机制回收。destroy后不能再使用。</p>
     * <p>destroy时会移除自身的事情监听，自身的timer监听，移除子对象及从父节点移除自己。</p>
     * @param destroyChild	（可选）是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
     */
    destroy(): void;
    /**
     * 销毁所有子对象，不销毁自己本身。
     */
    destroyChildren(): void;
    readonly style: HTMLStyle;
    _getWords(): HTMLChar[];
    _isChar(): boolean;
    _layoutLater(): void;
    x: number;
    y: number;
    width: number;
    height: number;
    _setAttributes(name: string, value: string): void;
    href: string;
    formatURL(url: string): string;
    color: string;
    className: string;
    drawToGraphic(graphic: Graphics, gX: number, gY: number, recList: any[]): void;
    renderSelfToGraphic(graphic: Graphics, gX: number, gY: number, recList: any[]): void;
    private workLines;
    private createOneLine;
}
