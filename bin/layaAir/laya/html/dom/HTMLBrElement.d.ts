import { HTMLElement } from "./HTMLElement";
import { Graphics } from "laya/display/Graphics";
import { HTMLStyle } from "../utils/HTMLStyle";
import { ILayout } from "../utils/ILayout";
/**
 * @private
 */
export declare class HTMLBrElement {
    static brStyle: HTMLStyle;
    /**@private */
    _addToLayout(out: ILayout[]): void;
    reset(): HTMLBrElement;
    destroy(): void;
    protected _setParent(value: HTMLElement): void;
    parent: any;
    URI: any;
    href: any;
    /**@private */
    _getCSSStyle(): HTMLStyle;
    renderSelfToGraphic(graphic: Graphics, gX: number, gY: number, recList: any[]): void;
}
