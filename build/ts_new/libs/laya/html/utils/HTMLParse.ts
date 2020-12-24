import { HTMLDivParser } from "../dom/HTMLDivParser"
import { HTMLElement } from "../dom/HTMLElement"
import { Pool } from "../../utils/Pool";
import { ClassUtils } from "../../utils/ClassUtils";
import { Utils } from "../../utils/Utils";
import { URL } from "../../net/URL";
import { IHtml } from "./IHtml";
import { HTMLBrElement } from "../dom/HTMLBrElement";
import { HTMLStyleElement } from "../dom/HTMLStyleElement";
import { HTMLLinkElement } from "../dom/HTMLLinkElement";
import { HTMLImageElement } from "../dom/HTMLImageElement";
/**
 * @private
 */
export class HTMLParse {
    private static char255: string = String.fromCharCode(255);
    private static spacePattern: RegExp = /&nbsp;|&#160;/g;
    private static char255AndOneSpacePattern: RegExp = new RegExp(String.fromCharCode(255) + "|(\\s+)", "g");
    private static _htmlClassMapShort: any = {
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

    /**
     * 根据类型获取对应的节点
     * @param type
     */
    static getInstance(type: string): any {
        var rst: any = Pool.getItem(HTMLParse._htmlClassMapShort[type]);
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
    static parse(ower: HTMLDivParser, xmlString: string, url: URL): void {
        xmlString = xmlString.replace(/<br>/g, "<br/>");
        xmlString = "<root>" + xmlString + "</root>";
        xmlString = xmlString.replace(HTMLParse.spacePattern, HTMLParse.char255);
        var xml: any = Utils.parseXMLFromString(xmlString);
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
    private static _parseXML(parent: HTMLElement, xml: any, url: URL, href: string = null): void {
        var i: number, n: number;
        if (xml.join || xml.item)	//判断xml是否是NodeList或AS中为Array
        {
            for (i = 0, n = xml.length; i < n; ++i) {
                HTMLParse._parseXML(parent, xml[i], url, href);
            }
        } else {
            var node: HTMLElement;
            var nodeName: string;
            if (xml.nodeType == 3)	//文本节点
            {
                var txt: string;
                if (parent instanceof IHtml.HTMLDivParser) {
                    if (xml.nodeName == null) {
                        xml.nodeName = "#text";
                    }
                    nodeName = xml.nodeName.toLowerCase();
                    txt = xml.textContent.replace(/^\s+|\s+$/g, '');//去掉前后空格和\n\t
                    if (txt.length > 0) {
                        node = (<HTMLElement>HTMLParse.getInstance(nodeName));
                        if (node) {
                            parent.addChild(node);
                            (((<HTMLElement>node)).innerTEXT = txt.replace(HTMLParse.char255AndOneSpacePattern, " "));// decodeFromEntities(txt));
                        }
                    }
                } else {
                    txt = xml.textContent.replace(/^\s+|\s+$/g, '');//去掉前后空格和\n\t
                    if (txt.length > 0) {
                        var containNode = parent;
                        if (parent instanceof HTMLElement && parent.innerTEXT && parent.innerTEXT.length > 0) {
                            // 如果已经有 innerText了，只能创建子节点，不能冲掉原来的
                            let cnode = (<HTMLElement>HTMLParse.getInstance('p'));
                            if (cnode) {
                                parent.addChild(cnode);
                                containNode = cnode;
                            }

                        }
                        containNode.innerTEXT = txt.replace(HTMLParse.char255AndOneSpacePattern, " ");// decodeFromEntities(txt));
                    }
                }
                return;
            } else {
                nodeName = xml.nodeName.toLowerCase();

                if (nodeName == "#comment") return;
                node = (<HTMLElement>HTMLParse.getInstance(nodeName));
                if (node) {
                    if (nodeName == "p") {
                        parent.addChild(HTMLParse.getInstance("br"));
                        node = (<HTMLElement>parent.addChild(node));
                        parent.addChild(HTMLParse.getInstance("br"));
                    } else {
                        node = (<HTMLElement>parent.addChild(node));
                    }

                    ((<any>node)).URI = url;
                    ((<HTMLElement>node)).href = href;
                    var attributes: any[] = xml.attributes;
                    if (attributes && attributes.length > 0) {
                        for (i = 0, n = attributes.length; i < n; ++i) {
                            var attribute: any = attributes[i];
                            var attrName: string = attribute.nodeName;
                            var value: string = attribute.value;
                            node._setAttributes(attrName, value);
                        }
                    }
                    HTMLParse._parseXML(node, xml.childNodes, url, ((<HTMLElement>node)).href);
                } else {
                    HTMLParse._parseXML(parent, xml.childNodes, url, href);
                }
            }
        }
    }
	/*
	   //实体字符替换
	   private static const Entities:Object =
	   {
	   "&nbsp;"  : " ",
	   "&#160;"  : " ",
	   "&lt;"    : "<",
	   "&#60;"   : "<",
	   "&gt;"    : ">",
	   "&#62;"   : ">",
	   "&amp;"   : "&",
	   "&amp;"   : "&",
	   "&quot;"  : "\"",
	   "&#34;"   : "\"",
	   "&apos;"  : "'",
	   "&#39;"   : "'",
	   "&cent;"  : "￠",
	   "&#162;"  : "￠",
	   "&pound;" : "£",
	   "&#163;"  : "£",
	   "&yen;"   : "¥",
	   "&#165;"  : "¥",
	   "&euro;"  : "€",
	   "&#8364;" : "€",
	   "&sect;"  : "§",
	   "&#167;"  : "§",
	   "&copy;"  : "©",
	   "&#169;"  : "©",
	   "&reg;"   : "®",
	   "&#174;"  : "®",
	   "&trade;" : "™",
	   "&#8482;" : "™",
	   "&times;" : "×",
	   "&#215;"  : "×",
	   "&divide;": "÷",
	   "&#247;"  : "÷"
	   };
	
	   public static function decodeFromEntities(str:String):String
	   {
	   return str.replace(/\&#?\w{2,6};/g, function(... args):String
	   {
	   return Entities[args[0]];
	   });
	   }*/
}

IHtml.HTMLParse = HTMLParse;
ClassUtils.regClass('div', HTMLDivParser);
ClassUtils.regClass('p', HTMLElement);
ClassUtils.regClass('img', HTMLImageElement);
ClassUtils.regClass('span', HTMLElement);
ClassUtils.regClass('br', HTMLBrElement);
ClassUtils.regClass('style', HTMLStyleElement);
ClassUtils.regClass('font', HTMLElement);
ClassUtils.regClass('a', HTMLElement);
ClassUtils.regClass('#text', HTMLElement);
ClassUtils.regClass('link', HTMLLinkElement);
ClassUtils.regClass("laya.html.utils.HTMLParse", HTMLParse);
ClassUtils.regClass("Laya.HTMLParse", HTMLParse);
