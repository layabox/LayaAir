/*[IF-FLASH]*/
package laya.ui {
	improt laya.events.Event;
	improt laya.ui.Button;
	public class Radio extends laya.ui.Button {
		protected var _value:*;

		public function Radio(skin:String = null,label:String = null){}
		public function destroy(destroyChild:Boolean = null):void{}
		protected function preinitialize():void{}
		protected function initialize():void{}
		protected function onClick(e:Event):void{}
		public var value:*;
	}

}
