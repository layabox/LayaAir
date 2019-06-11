import { HTMLDivElement } from "./HTMLDivElement";
/**
 * iframe标签类，目前用于加载外并解析数据
 */
export declare class HTMLIframeElement extends HTMLDivElement {
    constructor();
    /**
     * 加载html文件，并解析数据
     * @param	url
     */
    href: string;
}
