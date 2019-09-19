package laya.html.dom {
	import laya.html.dom.HTMLDivElement;

	/**
	 * iframe标签类，目前用于加载外并解析数据
	 */
	public class HTMLIframeElement extends HTMLDivElement {

		public function HTMLIframeElement(){}

		/**
		 * 加载html文件，并解析数据
		 * @param url 
		 */
		public var href:String;
	}

}
