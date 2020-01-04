package laya.html.dom {
	import laya.display.Graphics;
	import laya.html.utils.HTMLStyle;
	import laya.net.URL;

	/**
	 * @private 
	 */
	public class HTMLElement {
		private static var _EMPTYTEXT:*;
		public var eletype:*;
		public var URI:URL;
		public var parent:HTMLElement;
		public var _style:HTMLStyle;
		protected var _text:*;
		protected var _children:Array;
		protected var _x:Number;
		protected var _y:Number;
		protected var _width:Number;
		protected var _height:Number;

		/**
		 * 格式化指定的地址并返回。
		 * @param url 地址。
		 * @param base 基础路径，如果没有，则使用basePath。
		 * @return 格式化处理后的地址。
		 */
		public static function formatURL1(url:String,basePath:String = null):String{
			return null;
		}

		public function HTMLElement(){}
		protected function _creates():void{}

		/**
		 * 重置
		 */
		public function reset():HTMLElement{
			return null;
		}
		public var id:String;
		public function repaint(recreate:Boolean = null):void{}
		public function parentRepaint(recreate:Boolean = null):void{}
		public var innerTEXT:String;
		protected function _setParent(value:HTMLElement):void{}
		public function appendChild(c:HTMLElement):HTMLElement{
			return null;
		}
		public function addChild(c:HTMLElement):HTMLElement{
			return null;
		}
		public function removeChild(c:HTMLElement):HTMLElement{
			return null;
		}
		public static function getClassName(tar:*):String{
			return null;
		}

		/**
		 * <p>销毁此对象。destroy对象默认会把自己从父节点移除，并且清理自身引用关系，等待js自动垃圾回收机制回收。destroy后不能再使用。</p>
		 * <p>destroy时会移除自身的事情监听，自身的timer监听，移除子对象及从父节点移除自己。</p>
		 * @param destroyChild （可选）是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
		 */
		public function destroy():void{}

		/**
		 * 销毁所有子对象，不销毁自己本身。
		 */
		public function destroyChildren():void{}
		public function get style():HTMLStyle{
				return null;
		}
		public var x:Number;
		public var y:Number;
		public var width:Number;
		public var height:Number;
		public var href:String;
		public function formatURL(url:String):String{
			return null;
		}
		public var color:String;
		public var className:String;
		public function drawToGraphic(graphic:Graphics,gX:Number,gY:Number,recList:Array):void{}
		public function renderSelfToGraphic(graphic:Graphics,gX:Number,gY:Number,recList:Array):void{}
		private var workLines:*;
		private var createOneLine:*;
	}

}
