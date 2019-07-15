/*[IF-FLASH]*/
package laya.media {
	improt laya.display.Sprite;
	improt laya.utils.Handler;
	public class SoundNode extends laya.display.Sprite {
		public var url:String;
		private var _channel:*;
		private var _tar:*;
		private var _playEvents:*;
		private var _stopEvents:*;

		public function SoundNode(){}
		private var _onParentChange:*;
		public function play(loops:Number = null,complete:Handler = null):void{}
		public function stop():void{}
		private var _setPlayAction:*;
		private var _setPlayActions:*;
		public var playEvent:String;
		public var target:Sprite;
		public var stopEvent:String;
	}

}
