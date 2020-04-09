package laya.webgl.utils {
	public class Buffer {
		public static var _bindedVertexBuffer:*;
		public static var _bindedIndexBuffer:*;
		protected var _glBuffer:*;
		protected var _buffer:*;
		protected var _bufferType:Number;
		protected var _bufferUsage:Number;
		public var _byteLength:Number;
		public function get bufferUsage():Number{
				return null;
		}

		public function Buffer(){}

		/**
		 * @private 绕过全局状态判断,例如VAO局部状态设置
		 */
		public function _bindForVAO():void{}

		/**
		 * @private 
		 */
		public function bind():Boolean{
			return null;
		}

		/**
		 * @private 
		 */
		public function destroy():void{}
	}

}
