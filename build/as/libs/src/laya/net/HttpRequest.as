/*[IF-FLASH]*/
package laya.net {
	improt laya.events.EventDispatcher;
	public class HttpRequest extends laya.events.EventDispatcher {
		protected var _http:*;
		protected var _responseType:String;
		protected var _data:*;
		protected var _url:String;
		public function send(url:String,data:* = null,method:String = null,responseType:String = null,headers:Array = null):void{}
		protected function _onProgress(e:*):void{}
		protected function _onAbort(e:*):void{}
		protected function _onError(e:*):void{}
		protected function _onLoad(e:*):void{}
		protected function error(message:String):void{}
		protected function complete():void{}
		protected function clear():void{}
		public function get url():String{};
		public function get data():*{};
		public function get http():*{};
	}

}
