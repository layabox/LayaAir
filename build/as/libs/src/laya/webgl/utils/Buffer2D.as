package laya.webgl.utils {
	import laya.webgl.WebGLContext;
	import laya.webgl.utils.Buffer;
	public class Buffer2D extends Buffer {
		public static var FLOAT32:Number;
		public static var SHORT:Number;
		public static function __int__(gl:WebGLContext):void{}
		protected var _maxsize:Number;
		public var _upload:Boolean;
		protected var _uploadSize:Number;
		protected var _bufferSize:Number;
		protected var _u8Array:Uint8Array;
		public function get bufferLength():Number{
				return null;
		}
		public var byteLength:Number;
		public function setByteLength(value:Number):void{}

		/**
		 * 在当前的基础上需要多大空间，单位是byte
		 * @param sz 
		 * @return 增加大小之前的写位置。单位是byte
		 */
		public function needSize(sz:Number):Number{
			return null;
		}

		public function Buffer2D(){}
		protected function _bufferData():void{}
		protected function _bufferSubData(offset:Number = null,dataStart:Number = null,dataLength:Number = null):void{}

		/**
		 * buffer重新分配了，继承类根据需要做相应的处理。
		 */
		protected function _checkArrayUse():void{}

		/**
		 * 给vao使用的 _bind_upload函数。不要与已经绑定的判断是否相同
		 * @return 
		 */
		public function _bind_uploadForVAO():Boolean{
			return null;
		}
		public function _bind_upload():Boolean{
			return null;
		}
		public function _bind_subUpload(offset:Number = null,dataStart:Number = null,dataLength:Number = null):Boolean{
			return null;
		}

		/**
		 * 重新分配buffer大小，如果nsz比原来的小则什么都不做。
		 * @param nsz buffer大小，单位是byte。
		 * @param copy 是否拷贝原来的buffer的数据。
		 * @return 
		 */
		public function _resizeBuffer(nsz:Number,copy:Boolean):Buffer2D{
			return null;
		}
		public function append(data:*):void{}

		/**
		 * 附加Uint16Array的数据。数据长度是len。byte的话要*2
		 * @param data 
		 * @param len 
		 */
		public function appendU16Array(data:Uint16Array,len:Number):void{}
		public function appendEx(data:*,type:Class):void{}
		public function appendEx2(data:*,type:Class,dataLen:Number,perDataLen:Number = null):void{}
		public function getBuffer():ArrayBuffer{
			return null;
		}
		public function setNeedUpload():void{}
		public function getNeedUpload():Boolean{
			return null;
		}
		public function upload():Boolean{
			return null;
		}
		public function subUpload(offset:Number = null,dataStart:Number = null,dataLength:Number = null):Boolean{
			return null;
		}
		protected function _disposeResource():void{}

		/**
		 * 清理数据。保留ArrayBuffer
		 */
		public function clear():void{}
	}

}
