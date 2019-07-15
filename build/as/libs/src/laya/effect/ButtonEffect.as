/*[IF-FLASH]*/
package laya.effect {
	improt laya.display.Sprite;
	public class ButtonEffect {
		private var _tar:*;
		private var _curState:*;
		private var _curTween:*;
		public var effectScale:Number;
		public var tweenTime:Number;
		public var effectEase:String;
		public var backEase:String;
		public var target:Sprite;
		private var toChangedState:*;
		private var toInitState:*;
		private var tweenComplete:*;
	}

}
