/*[IF-FLASH]*/
package laya.net {
	improt laya.events.EventDispatcher;
	public class Socket extends laya.events.EventDispatcher {
		public static var LITTLE_ENDIAN:String;
		public static var BIG_ENDIAN:String;
		protected var _socket:*;
		private var _connected:*;
		private var _addInputPosition:*;
		private var _input:*;
		private var _output:*;
		public var disableInput:Boolean;
		private var _byteClass:*;
		public var protocols:*;
		public function get input():*{};
		public function get output():*{};
		public function get connected():Boolean{};
		public var endian:String;

		public function Socket(host:String = null,port:Number = null,byteClass:Class = null,protocols:Array = null){}
		public function connect(host:String,port:Number):void{}
		public function connectByUrl(url:String):void{}
		public function cleanSocket():void{}
		public function close():void{}
		protected function _onOpen(e:*):void{}
		protected function _onMessage(msg:*):void{}
		protected function _onClose(e:*):void{}
		protected function _onError(e:*):void{}
		public function send(data:*):void{}
		public function flush():void{}
	}

}
