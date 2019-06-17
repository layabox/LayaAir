import { HTMLElement } from "./HTMLElement";
import { Graphics } from "../../display/Graphics";
/**
 * @private
 */
export declare class HTMLStyleElement extends HTMLElement {
    protected _creates(): void;
    drawToGraphic(graphic: Graphics, gX: number, gY: number, recList: any[]): void;
    reset(): HTMLElement;
    /**
     * 解析样式
     */
    innerTEXT: string;
}
