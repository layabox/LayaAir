package laya.webgl.utils {
	import laya.webgl.utils.Buffer2D;
	public class VertexBuffer2D extends Buffer2D {
		public static var create:Function;
		public var _floatArray32:Float32Array;
		public var _uint32Array:Uint32Array;
		private var _vertexStride:*;
		public function get vertexStride():Number{
				return null;
		}

		public function VertexBuffer2D(vertexStride:Number = undefined,bufferUsage:Number = undefined){}
		public function getFloat32Array():Float32Array{
			return null;
		}

		/**
		 * 在当前位置插入float数组。
		 * @param data 
		 * @param pos 
		 */
		public function appendArray(data:Array):void{}

		/**
		 * @override 
		 */
		override protected function _checkArrayUse():void{}
		public function deleteBuffer():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function _bindForVAO():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function bind():Boolean{
			return null;
		}

		/**
		 * @override 
		 */
		override public function destroy():void{}
	}

}
