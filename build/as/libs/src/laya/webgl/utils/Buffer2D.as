/*[IF-FLASH]*/
package laya.webgl.utils {
	improt laya.webgl.WebGLContext;
	improt laya.webgl.utils.Buffer;
	public class Buffer2D extends laya.webgl.utils.Buffer {
		public static var FLOAT32:Number;
		public static var SHORT:Number;
		public static function __int__(gl:WebGLContext):void{}
		protected var _maxsize:Number;
		public var _upload:Boolean;
		protected var _uploadSize:Number;
		protected var _bufferSize:Number;
		protected var _u8Array:Uint8Array;
		public function get bufferLength():Number{};
		public var byteLength:Number;
		public function setByteLength(value:Number):void{}
		public function needSize(sz:Number):Number{}

		public function Buffer2D(){}
		protected function _bufferData():void{}
		protected function _bufferSubData(offset:Number = null,dataStart:Number = null,dataLength:Number = null):void{}
		protected function _checkArrayUse():void{}
		public function _bind_uploadForVAO():Boolean{}
		public function _bind_upload():Boolean{}
		public function _bind_subUpload(offset:Number = null,dataStart:Number = null,dataLength:Number = null):Boolean{}
		public function _resizeBuffer(nsz:Number,copy:Boolean):Buffer2D{}
		public function append(data:*):void{}
		public function appendU16Array(data:Uint16Array,len:Number):void{}
		public function appendEx(data:*,type:Class):void{}
		public function appendEx2(data:*,type:Class,dataLen:Number,perDataLen:Number = null):void{}
		public function getBuffer():ArrayBuffer{}
		public function setNeedUpload():void{}
		public function getNeedUpload():Boolean{}
		public function upload():Boolean{}
		public function subUpload(offset:Number = null,dataStart:Number = null,dataLength:Number = null):Boolean{}
		protected function _disposeResource():void{}
		public function clear():void{}
	}

}
