/*[IF-FLASH]*/
package laya.utils {
	public class Byte {
		public static var BIG_ENDIAN:String;
		public static var LITTLE_ENDIAN:String;
		private static var _sysEndian:*;
		protected var _xd_:Boolean;
		private var _allocated_:*;
		protected var _d_:*;
		protected var _u8d_:*;
		protected var _pos_:Number;
		protected var _length:Number;
		public static function getSystemEndian():String{}

		public function Byte(data:* = null){}
		public function get buffer():ArrayBuffer{};
		public var endian:String;
		public var length:Number;
		private var _resizeBuffer:*;
		public function getString():String{}
		public function readString():String{}
		public function getFloat32Array(start:Number,len:Number):*{}
		public function readFloat32Array(start:Number,len:Number):*{}
		public function getUint8Array(start:Number,len:Number):Uint8Array{}
		public function readUint8Array(start:Number,len:Number):Uint8Array{}
		public function getInt16Array(start:Number,len:Number):*{}
		public function readInt16Array(start:Number,len:Number):*{}
		public function getFloat32():Number{}
		public function readFloat32():Number{}
		public function getFloat64():Number{}
		public function readFloat64():Number{}
		public function writeFloat32(value:Number):void{}
		public function writeFloat64(value:Number):void{}
		public function getInt32():Number{}
		public function readInt32():Number{}
		public function getUint32():Number{}
		public function readUint32():Number{}
		public function writeInt32(value:Number):void{}
		public function writeUint32(value:Number):void{}
		public function getInt16():Number{}
		public function readInt16():Number{}
		public function getUint16():Number{}
		public function readUint16():Number{}
		public function writeUint16(value:Number):void{}
		public function writeInt16(value:Number):void{}
		public function getUint8():Number{}
		public function readUint8():Number{}
		public function writeUint8(value:Number):void{}
		private var _rUTF:*;
		public function getCustomString(len:Number):String{}
		public function readCustomString(len:Number):String{}
		public var pos:Number;
		public function get bytesAvailable():Number{};
		public function clear():void{}
		public function writeUTFBytes(value:String):void{}
		public function writeUTFString(value:String):void{}
		public function readUTFString():String{}
		public function getUTFString():String{}
		public function readUTFBytes(len:Number = null):String{}
		public function getUTFBytes(len:Number = null):String{}
		public function writeByte(value:Number):void{}
		public function readByte():Number{}
		public function getByte():Number{}
		public function writeArrayBuffer(arraybuffer:*,offset:Number = null,length:Number = null):void{}
		public function readArrayBuffer(length:Number):ArrayBuffer{}
	}

}
