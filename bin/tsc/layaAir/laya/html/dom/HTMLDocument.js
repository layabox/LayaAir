import { HTMLStyle } from "../utils/HTMLStyle";
/**
 * @private
 */
export class HTMLDocument {
    constructor() {
        this.all = [];
        this.styleSheets = HTMLStyle.styleSheets;
    }
    //TODO:coverage
    getElementById(id) {
        return this.all[id];
    }
    //TODO:coverage
    setElementById(id, e) {
        this.all[id] = e;
    }
}
HTMLDocument.document = new HTMLDocument();
