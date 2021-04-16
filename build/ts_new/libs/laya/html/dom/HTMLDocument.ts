import { HTMLElement } from "./HTMLElement";
import { HTMLStyle } from "../utils/HTMLStyle"
import { ClassUtils } from "../../utils/ClassUtils";

/**
 * @private
 */
export class HTMLDocument {
    static document: HTMLDocument = new HTMLDocument();
    all: {[key:string]:HTMLElement}= {};
    styleSheets: any = HTMLStyle.styleSheets;

    //TODO:coverage
    getElementById(id: string): HTMLElement {
        return this.all[id];
    }

    //TODO:coverage
    setElementById(id: string, e: HTMLElement): void {
        this.all[id] = e;
    }
}

ClassUtils.regClass("laya.html.dom.HTMLDocument", HTMLDocument);
ClassUtils.regClass("Laya.HTMLDocument", HTMLDocument);