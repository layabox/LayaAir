import { HTMLElement } from "./HTMLElement";
import { Graphics } from "laya/display/Graphics";
import { ILayout } from "../utils/ILayout";
/**
 * @private
 */
export declare class HTMLImageElement extends HTMLElement {
    private _tex;
    private _url;
    constructor();
    reset(): HTMLElement;
    src: string;
    private onloaded;
    _addToLayout(out: ILayout[]): void;
    renderSelfToGraphic(graphic: Graphics, gX: number, gY: number, recList: any[]): void;
}
