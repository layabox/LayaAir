/*[IF-FLASH]*/
package laya.d3.graphics {
	improt laya.webgl.utils.Buffer;
	improt laya.d3.graphics.VertexDeclaration;
	public class VertexBuffer3D extends laya.webgl.utils.Buffer {
		public static var DATATYPE_FLOAT32ARRAY:Number;
		public static var DATATYPE_UINT8ARRAY:Number;
		public var vertexDeclaration:VertexDeclaration;
		public function get vertexCount():Number{};
		public function get canRead():Boolean{};

		public function VertexBuffer3D(byteLength:Number,bufferUsage:Number,canRead:Boolean = null){}
		public function bind():Boolean{}
		public function setData(buffer:ArrayBuffer,bufferOffset:Number = null,dataStartIndex:Number = null,dataCount:Number = null):void{}
		public function getUint8Data():Uint8Array{}
		public function getFloat32Data():Float32Array{}
		public function markAsUnreadbale():void{}
		public function destroy():void{}
	}

}
