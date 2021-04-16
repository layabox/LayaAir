import { HTMLDivElement } from "./HTMLDivElement";
import { Loader } from "../../net/Loader"
import { URL } from "../../net/URL"
import { Event } from "../../events/Event"
import { ClassUtils } from "../../utils/ClassUtils";

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
        url = this._element.formatURL(url);
        var l: Loader = new Loader();
        l.once(Event.COMPLETE, null, (data: string)=> {
            var pre: URL = this._element.URI;
            this._element.URI = new URL(url);
            this.innerHTML = data;
            !pre || (this._element.URI = pre);
        });
        l.load(url, Loader.TEXT);
    }

}

ClassUtils.regClass("laya.html.dom.HTMLIframeElement", HTMLIframeElement);
ClassUtils.regClass("Laya.HTMLIframeElement", HTMLIframeElement);

