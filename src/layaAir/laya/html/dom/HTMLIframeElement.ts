import { HTMLDivElement } from "./HTMLDivElement";
import { Loader } from "../../net/Loader"
import { URL } from "../../net/URL"
import { ILaya } from "../../../ILaya";

/**
 * iframe标签类，目前用于加载外并解析数据
 */
export class HTMLIframeElement extends HTMLDivElement {

    constructor() {
        super();
        this._element._getCSSStyle().valign = "middle";
    }

    /**
     * 加载html文件，并解析数据
     * @param	url
     */
    set href(url: string) {
        url = URL.formatURL(url, this._element.URI ? this._element.URI.path : null);
        ILaya.loader.load(url, { type: Loader.TEXT, cache: false }).then((data: string) => {
            var pre: URL = this._element.URI;
            this._element.URI = new URL(url);
            this.innerHTML = data;
            !pre || (this._element.URI = pre);
        });
    }

}

