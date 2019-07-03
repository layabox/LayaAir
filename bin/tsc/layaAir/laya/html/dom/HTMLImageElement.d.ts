import { HTMLElement } from "./HTMLElement";
import { Graphics } from "../../display/Graphics";
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
    renderSelfToGraphic(graphic: Graphics, gX: number, gY: number, recList: any[]): void;
}
