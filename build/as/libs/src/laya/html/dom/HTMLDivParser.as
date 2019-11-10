package laya.html.dom {
	import laya.html.dom.HTMLElement;
	import laya.maths.Rectangle;
	import laya.utils.Handler;

	/**
	 * @private 
	 */
	public class HTMLDivParser extends HTMLElement {

		/**
		 * 实际内容的高
		 */
		public var contextHeight:Number;

		/**
		 * 实际内容的宽
		 */
		public var contextWidth:Number;

		/**
		 * @private 
		 */
		private var _htmlBounds:*;

		/**
		 * @private 
		 */
		private var _boundsRec:*;

		/**
		 * 重绘回调
		 */
		public var repaintHandler:Handler;

		/**
		 * @override 
		 */
		override public function reset():HTMLElement{
			return null;
		}

		/**
		 * 设置标签内容
		 */
		public var innerHTML:String;

		/**
		 * 追加内容，解析并对显示对象排版
		 * @param text 
		 */
		public function appendHTML(text:String):void{}

		/**
		 * 获取bounds
		 * @return 
		 */
		public function getBounds():Rectangle{
			return null;
		}

		/**
		 * @override 
		 */
		override public function parentRepaint(recreate:Boolean = null):void{}

		/**
		 * @private 对显示内容进行排版
		 */
		public function layout():void{}
	}

}
