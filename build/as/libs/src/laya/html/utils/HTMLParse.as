package laya.html.utils {
	import laya.html.dom.HTMLDivParser;
	import laya.net.URL;

	/**
	 * @private 
	 */
	public class HTMLParse {
		private static var char255:*;
		private static var spacePattern:*;
		private static var char255AndOneSpacePattern:*;
		private static var _htmlClassMapShort:*;

		/**
		 * 根据类型获取对应的节点
		 * @param type 
		 */
		public static function getInstance(type:String):*{}

		/**
		 * 解析HTML
		 * @param ower 
		 * @param xmlString 
		 * @param url 
		 */
		public static function parse(ower:HTMLDivParser,xmlString:String,url:URL):void{}

		/**
		 * 解析xml节点 该函数会被递归调用
		 * @param xml 
		 */
		private static var _parseXML:*;
	}

}
