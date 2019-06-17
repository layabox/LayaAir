import { HTMLDivParser } from "../dom/HTMLDivParser";
import { URL } from "../../net/URL";
/**
 * @private
 */
export declare class HTMLParse {
    private static char255;
    private static spacePattern;
    private static char255AndOneSpacePattern;
    private static _htmlClassMapShort;
    /**
     * 根据类型获取对应的节点
     * @param type
     */
    static getInstance(type: string): any;
    /**
     * 解析HTML
     * @param	ower
     * @param	xmlString
     * @param	url
     */
    static parse(ower: HTMLDivParser, xmlString: string, url: URL): void;
    /**
     * 解析xml节点 该函数会被递归调用
     * @param xml
     */
    private static _parseXML;
}
