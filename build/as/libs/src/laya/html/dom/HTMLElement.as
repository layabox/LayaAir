/*[IF-FLASH]*/
package laya.html.dom {
	improt laya.display.Graphics;
	improt laya.html.utils.HTMLStyle;
	improt laya.net.URL;
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
		public static function formatURL1(url:String,basePath:String = null):String{}

		public function HTMLElement(){}
		protected function _creates():void{}
		public function reset():HTMLElement{}
		public var id:String;
		public function repaint(recreate:Boolean = null):void{}
		public function parentRepaint(recreate:Boolean = null):void{}
		public var innerTEXT:String;
		protected function _setParent(value:HTMLElement):void{}
		public function appendChild(c:HTMLElement):HTMLElement{}
		public function addChild(c:HTMLElement):HTMLElement{}
		public function removeChild(c:HTMLElement):HTMLElement{}
		public static function getClassName(tar:*):String{}
		public function destroy():void{}
		public function destroyChildren():void{}
		public function get style():HTMLStyle{};
		public var x:Number;
		public var y:Number;
		public var width:Number;
		public var height:Number;
		public var href:String;
		public function formatURL(url:String):String{}
		public var color:String;
		public var className:String;
		public function drawToGraphic(graphic:Graphics,gX:Number,gY:Number,recList:Array):void{}
		public function renderSelfToGraphic(graphic:Graphics,gX:Number,gY:Number,recList:Array):void{}
		private var workLines:*;
		private var createOneLine:*;
	}

}
