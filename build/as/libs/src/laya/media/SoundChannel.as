/*[IF-FLASH]*/
package laya.media {
	improt laya.events.EventDispatcher;
	improt laya.utils.Handler;
	public class SoundChannel extends laya.events.EventDispatcher {
		public var url:String;
		public var loops:Number;
		public var startTime:Number;
		public var isStopped:Boolean;
		public var completeHandler:Handler;
		public var volume:Number;
		public function get position():Number{};
		public function get duration():Number{};
		public function play():void{}
		public function stop():void{}
		public function pause():void{}
		public function resume():void{}
		protected function __runComplete(handler:Handler):void{}
	}

}
