/*[IF-FLASH]*/
package laya.ui {
	improt laya.resource.Texture;
	improt laya.ui.UIComponent;
	public class Image extends laya.ui.UIComponent {
		protected var _skin:String;
		protected var _group:String;

		public function Image(skin:String = null){}
		public function destroy(destroyChild:Boolean = null):void{}
		public function dispose():void{}
		protected function createChildren():void{}
		public var skin:String;
		public var source:Texture;
		public var group:String;
		protected function setSource(url:String,img:* = null):void{}
		protected function measureWidth():Number{}
		protected function measureHeight():Number{}
		public var width:Number;
		public var height:Number;
		public var sizeGrid:String;
		public var dataSource:*;
	}

}
