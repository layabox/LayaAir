/*[IF-FLASH]*/
package laya.effect {
	improt laya.utils.Handler;
	improt laya.display.Sprite;
	improt laya.utils.Tween;
	improt laya.components.Component;
	public class EffectBase extends laya.components.Component {
		public var duration:Number;
		public var delay:Number;
		public var repeat:Number;
		public var ease:String;
		public var eventName:String;
		public var target:Sprite;
		public var autoDestroyAtComplete:Boolean;
		protected var _comlete:Handler;
		protected var _tween:Tween;
		protected function _onAwake():void{}
		protected function _exeTween():void{}
		protected function _doTween():Tween{}
		public function onReset():void{}
	}

}
