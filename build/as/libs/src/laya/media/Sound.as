/*[IF-FLASH]*/
package laya.media {
	improt laya.media.SoundChannel;
	improt laya.events.EventDispatcher;
	public class Sound extends laya.events.EventDispatcher {
		public function load(url:String):void{}
		public function play(startTime:Number = null,loops:Number = null):SoundChannel{}
		public function get duration():Number{};
		public function dispose():void{}
	}

}
