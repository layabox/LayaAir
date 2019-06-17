import { HTMLDivParser } from "../dom/HTMLDivParser";
import { HTMLElement } from "../dom/HTMLElement";
import { Pool } from "../../utils/Pool";
import { ClassUtils } from "../../utils/ClassUtils";
import { Utils } from "../../utils/Utils";
import { IHtml } from "./IHtml";
import { HTMLBrElement } from "../dom/HTMLBrElement";
import { HTMLStyleElement } from "../dom/HTMLStyleElement";
import { HTMLLinkElement } from "../dom/HTMLLinkElement";
/**
 * @private
 */
export class HTMLParse {
    /**
     * 根据类型获取对应的节点
     * @param type
     */
    static getInstance(type) {
        var rst = Pool.getItem(HTMLParse._htmlClassMapShort[type]);
        if (!rst) {
            rst = ClassUtils.getInstance(type);
        }
        return rst;
    }
    /**
     * 解析HTML
     * @param	ower
     * @param	xmlString
     * @param	url
     */
    static parse(ower, xmlString, url) {
        xmlString = xmlString.replace(/<br>/g, "<br/>");
        xmlString = "<root>" + xmlString + "</root>";
        xmlString = xmlString.replace(HTMLParse.spacePattern, HTMLParse.char255);
        var xml = Utils.parseXMLFromString(xmlString);
        /*if (xml.firstChild.innerHTML.indexOf("<parsererror ") == 0)
           {
           throw new Error("HTML parsererror:" + xmlString);
           return;
           }*/
        HTMLParse._parseXML(ower, xml.childNodes[0].childNodes, url);
    }
    /**
     * 解析xml节点 该函数会被递归调用
     * @param xml
     */
    static _parseXML(parent, xml, url, href = null) {
        var i, n;
        if (xml.join || xml.item) //判断xml是否是NodeList或AS中为Array
         {
            for (i = 0, n = xml.length; i < n; ++i) {
                HTMLParse._parseXML(parent, xml[i], url, href);
            }
        }
        else {
            var node;
            var nodeName;
            if (xml.nodeType == 3) //文本节点
             {
                var txt;
                if (parent instanceof IHtml.HTMLDivParser) {
                    if (xml.nodeName == null) {
                        xml.nodeName = "#text";
                    }
                    nodeName = xml.nodeName.toLowerCase();
                    txt = xml.textContent.replace(/^\s+|\s+$/g, ''); //去掉前后空格和\n\t
                    if (txt.length > 0) {
                        node = HTMLParse.getInstance(nodeName);
                        if (node) {
                            parent.addChild(node);
                            (node.innerTEXT = txt.replace(HTMLParse.char255AndOneSpacePattern, " ")); // decodeFromEntities(txt));
                        }
                    }
                }
                else {
                    txt = xml.textContent.replace(/^\s+|\s+$/g, ''); //去掉前后空格和\n\t
                    if (txt.length > 0) {
                        (parent.innerTEXT = txt.replace(HTMLParse.char255AndOneSpacePattern, " ")); // decodeFromEntities(txt));
                    }
                }
                return;
            }
            else {
                nodeName = xml.nodeName.toLowerCase();
                if (nodeName == "#comment")
                    return;
                node = HTMLParse.getInstance(nodeName);
                if (node) {
                    if (nodeName == "p") {
                        parent.addChild(HTMLParse.getInstance("br"));
                        node = parent.addChild(node);
                        parent.addChild(HTMLParse.getInstance("br"));
                    }
                    else {
                        node = parent.addChild(node);
                    }
                    node.URI = url;
                    node.href = href;
                    var attributes = xml.attributes;
                    if (attributes && attributes.length > 0) {
                        for (i = 0, n = attributes.length; i < n; ++i) {
                            var attribute = attributes[i];
                            var attrName = attribute.nodeName;
                            var value = attribute.value;
                            node._setAttributes(attrName, value);
                        }
                    }
                    HTMLParse._parseXML(node, xml.childNodes, url, node.href);
                }
                else {
                    HTMLParse._parseXML(parent, xml.childNodes, url, href);
                }
            }
        }
    }
}
HTMLParse.char255 = String.fromCharCode(255);
HTMLParse.spacePattern = /&nbsp;|&#160;/g;
HTMLParse.char255AndOneSpacePattern = new RegExp(String.fromCharCode(255) + "|(\\s+)", "g");
HTMLParse._htmlClassMapShort = {
    'div': HTMLDivParser,
    'p': HTMLElement,
    'img': HTMLImageElement,
    'span': HTMLElement,
    'br': HTMLBrElement,
    'style': HTMLStyleElement,
    'font': HTMLElement,
    'a': HTMLElement,
    '#text': HTMLElement,
    'link': HTMLLinkElement
};
IHtml.HTMLParse = HTMLParse;
