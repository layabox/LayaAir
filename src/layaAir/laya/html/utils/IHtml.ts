import { HTMLDivElement } from "../../html/dom/HTMLDivElement"
import { HTMLImageElement } from "../dom/HTMLImageElement";
import { HTMLBrElement } from "../dom/HTMLBrElement";
import { HTMLDivParser } from "../dom/HTMLDivParser";
import { HTMLParse } from "./HTMLParse";
import { HTMLElementType } from "../dom/HTMLElement";

/**
 * @internal
 */
export class IHtml {
    static HTMLDivElement: typeof HTMLDivElement = null;
    static HTMLImageElement: typeof HTMLImageElement = null;
    static HTMLBrElement: typeof HTMLBrElement = null;
    static HTMLDivParser: typeof HTMLDivParser = null;
    static HTMLParse: typeof HTMLParse = null;
    static HTMLElementType: typeof HTMLElementType = null;
}