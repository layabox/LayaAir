/*[IF-FLASH]*/
package laya.ui {
	improt laya.display.Text;
	improt laya.ui.UIComponent;
	public class Label extends laya.ui.UIComponent {
		protected var _tf:Text;

		public function Label(text:String = null){}
		public function destroy(destroyChild:Boolean = null):void{}
		protected function createChildren():void{}
		public var text:String;
		public function changeText(text:String):void{}
		public var wordWrap:Boolean;
		public var color:String;
		public var font:String;
		public var align:String;
		public var valign:String;
		public var bold:Boolean;
		public var italic:Boolean;
		public var leading:Number;
		public var fontSize:Number;
		public var padding:String;
		public var bgColor:String;
		public var borderColor:String;
		public var stroke:Number;
		public var strokeColor:String;
		public function get textField():Text{};
		protected function measureWidth():Number{}
		protected function measureHeight():Number{}
		public var width:Number;
		public var height:Number;
		public var dataSource:*;
		public var overflow:String;
		public var underline:Boolean;
		public var underlineColor:String;
	}

}
