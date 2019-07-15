/*[IF-FLASH]*/
package laya.webgl.utils {
	improt laya.webgl.utils.Buffer2D;
	public class VertexBuffer2D extends laya.webgl.utils.Buffer2D {
		public static var create:Function;
		public var _floatArray32:Float32Array;
		public var _uint32Array:Uint32Array;
		private var _vertexStride:*;
		public function get vertexStride():Number{};

		public function VertexBuffer2D(vertexStride:Number,bufferUsage:Number){}
		public function getFloat32Array():Float32Array{}
		public function appendArray(data:Array):void{}
		protected function _checkArrayUse():void{}
		public function deleteBuffer():void{}
		public function _bindForVAO():void{}
		public function bind():Boolean{}
		public function destroy():void{}
	}

}
