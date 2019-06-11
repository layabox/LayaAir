import { HTMLElement } from "./HTMLElement";
import { HTMLStyle } from "../utils/HTMLStyle";
import { ILaya } from "ILaya";
/**
 * @private
 */
export class HTMLStyleElement extends HTMLElement {
    /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
    /*override*/ _creates() {
    }
    /*override*/ drawToGraphic(graphic, gX, gY, recList) {
    }
    //TODO:coverage
    /*override*/ reset() {
        return this;
    }
    /**
     * 解析样式
     */
    /*override*/ set innerTEXT(value) {
        HTMLStyle.parseCSS(value, null);
    }
    get innerTEXT() {
        return super.innerTEXT;
    }
}
ILaya.regClass(HTMLStyleElement);
