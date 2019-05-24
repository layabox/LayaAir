package laya.html.utils {
	import laya.html.dom.HTMLDivParser;
	import laya.html.dom.HTMLElement;
	import laya.net.URL;
	import laya.utils.ClassUtils;
	import laya.utils.Pool;
	import laya.utils.Utils;
	
	/**
	 * @private
	 */
	public class HTMLParse {
		private static var char255:String = /*[STATIC SAFE]*/ String.fromCharCode(255);
		private static var spacePattern:RegExp = /*[STATIC SAFE]*/ /&nbsp;|&#160;/g;
		private static var char255AndOneSpacePattern:RegExp = /*[STATIC SAFE]*/ new RegExp(String.fromCharCode(255) + "|(\\s+)", "g");
		private static var _htmlClassMapShort:Object = /*[STATIC SAFE]*/ {'div': 'HTMLDivParser', 'p': 'HTMLElement', 'img': 'HTMLImageElement', 'span': 'HTMLElement', 'br': 'HTMLBrElement', 'style': 'HTMLStyleElement', 'font': 'HTMLElement', 'a': 'HTMLElement', '#text': 'HTMLElement', 'link': 'HTMLLinkElement'};
		
		/**
		 * 根据类型获取对应的节点
		 * @param type
		 */
		public static function getInstance(type:String):* {
			var rst:* = Pool.getItem(_htmlClassMapShort[type]);
			if (!rst) {
				rst =ClassUtils.getInstance(type);
			}
			return rst;
		}
		
		/**
		 * 解析HTML
		 * @param	ower
		 * @param	xmlString
		 * @param	url
		 */
		public static function parse(ower:HTMLDivParser, xmlString:String, url:URL):void {
			xmlString = xmlString.replace(/<br>/g, "<br/>");
			xmlString = "<root>" + xmlString + "</root>";
			xmlString = xmlString.replace(spacePattern, char255);
			var xml:* = Utils.parseXMLFromString(xmlString);
			/*if (xml.firstChild.innerHTML.indexOf("<parsererror ") == 0)
			   {
			   throw new Error("HTML parsererror:" + xmlString);
			   return;
			   }*/
			_parseXML(ower, xml.childNodes[0].childNodes, url);
		}
		
		/**
		 * 解析xml节点 该函数会被递归调用
		 * @param xml
		 */
		private static function _parseXML(parent:HTMLElement, xml:*, url:URL, href:String = null):void {
			var i:int, n:int;
			if (xml.join || xml.item)	//判断xml是否是NodeList或AS中为Array
			{
				for (i = 0, n = xml.length; i < n; ++i) {
					_parseXML(parent, xml[i], url, href);
				}
			} else {
				var node:HTMLElement;
				var nodeName:String;
				if (xml.nodeType == 3)	//文本节点
				{
					var txt:String;
					if (parent is HTMLDivParser) {
						if (xml.nodeName == null) {
							xml.nodeName = "#text";
						}
						nodeName = xml.nodeName.toLowerCase();
						txt = xml.textContent.replace(/^\s+|\s+$/g, '');//去掉前后空格和\n\t
						if (txt.length > 0) {
							node = getInstance(nodeName) as HTMLElement;
							if (node) {
								parent.addChild(node);
								((node as HTMLElement).innerTEXT = txt.replace(char255AndOneSpacePattern, " "));// decodeFromEntities(txt));
							}
						}
					} else {
						txt = xml.textContent.replace(/^\s+|\s+$/g, '');//去掉前后空格和\n\t
						if (txt.length > 0) {
							((parent as HTMLElement).innerTEXT = txt.replace(char255AndOneSpacePattern, " "));// decodeFromEntities(txt));
						}
					}
					return;
				} else {
					nodeName = xml.nodeName.toLowerCase();
					
					if (nodeName == "#comment") return;
					node = getInstance(nodeName) as HTMLElement;
					if (node) {
						if (nodeName == "p")
						{
							parent.addChild(getInstance("br"));
							node = parent.addChild(node) as HTMLElement;
							parent.addChild(getInstance("br"));
						}else
						{
							node = parent.addChild(node) as HTMLElement;
						}
						
						(node as Object).URI = url;
						(node as HTMLElement).href = href;
						var attributes:Array = xml.attributes;
						if (attributes && attributes.length > 0) {
							for (i = 0, n = attributes.length; i < n; ++i) {
								var attribute:* = attributes[i];
								var attrName:String = attribute.nodeName;
								var value:String = attribute.value;
								node._setAttributes(attrName, value);
							}
						}
						_parseXML(node, xml.childNodes, url, (node as HTMLElement).href);
					} else {
						_parseXML(parent, xml.childNodes, url, href);
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
}