/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.UIComponent;
	improt laya.ui.Image;
	improt laya.utils.Handler;
	public class ProgressBar extends laya.ui.UIComponent {
		public var changeHandler:Handler;
		protected var _bg:Image;
		protected var _bar:Image;
		protected var _skin:String;
		protected var _value:Number;

		public function ProgressBar(skin:String = null){}
		public function destroy(destroyChild:Boolean = null):void{}
		protected function createChildren():void{}
		public var skin:String;
		protected function _skinLoaded():void{}
		protected function measureWidth():Number{}
		protected function measureHeight():Number{}
		public var value:Number;
		protected function changeValue():void{}
		public function get bar():Image{};
		public function get bg():Image{};
		public var sizeGrid:String;
		public var width:Number;
		public var height:Number;
		public var dataSource:*;
	}

}
