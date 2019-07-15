/*[IF-FLASH]*/
package laya.webgl.utils {
	public class Buffer {
		public static var _bindedVertexBuffer:*;
		public static var _bindedIndexBuffer:*;
		protected var _glBuffer:*;
		protected var _buffer:*;
		protected var _bufferType:Number;
		protected var _bufferUsage:Number;
		public var _byteLength:Number;
		public function get bufferUsage():Number{};

		public function Buffer(){}
		public function _bindForVAO():void{}
		public function bind():Boolean{}
		public function destroy():void{}
	}

}
