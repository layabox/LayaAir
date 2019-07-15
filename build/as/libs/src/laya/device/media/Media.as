/*[IF-FLASH]*/
package laya.device.media {
	improt laya.utils.Handler;
	public class Media {

		public function Media(){}
		public static function supported():Boolean{}
		public static function getMedia(options:*,onSuccess:Handler,onError:Handler):void{}
	}

}
