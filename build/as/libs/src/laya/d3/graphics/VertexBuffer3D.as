package laya.d3.graphics {
	import laya.webgl.utils.Buffer;
	import laya.d3.graphics.VertexDeclaration;

	/**
	 * <code>VertexBuffer3D</code> 类用于创建顶点缓冲。
	 */
	public class VertexBuffer3D extends Buffer {

		/**
		 * 数据类型_Float32Array类型。
		 */
		public static var DATATYPE_FLOAT32ARRAY:Number;

		/**
		 * 数据类型_Uint8Array类型。
		 */
		public static var DATATYPE_UINT8ARRAY:Number;

		/**
		 * 获取顶点声明。
		 */
		public var vertexDeclaration:VertexDeclaration;

		/**
		 * 是否可读。
		 */
		public function get canRead():Boolean{
				return null;
		}

		/**
		 * 创建一个 <code>VertexBuffer3D</code> 实例。
		 * @param byteLength 字节长度。
		 * @param bufferUsage VertexBuffer3D用途类型。
		 * @param canRead 是否可读。
		 */

		public function VertexBuffer3D(byteLength:Number = undefined,bufferUsage:Number = undefined,canRead:Boolean = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function bind():Boolean{
			return null;
		}

		/**
		 * 剥离内存块存储。
		 */
		public function orphanStorage():void{}

		/**
		 * 设置数据。
		 * @param data 顶点数据。
		 * @param bufferOffset 顶点缓冲中的偏移,以字节为单位。
		 * @param dataStartIndex 顶点数据的偏移,以字节为单位。
		 * @param dataCount 顶点数据的长度,以字节为单位。
		 */
		public function setData(buffer:ArrayBuffer,bufferOffset:Number = null,dataStartIndex:Number = null,dataCount:Number = null):void{}

		/**
		 * 获取顶点数据。
		 * @return 顶点数据。
		 */
		public function getUint8Data():Uint8Array{
			return null;
		}

		/**
		 * @ignore 
		 */
		public function getFloat32Data():Float32Array{
			return null;
		}

		/**
		 * @ignore 
		 */
		public function markAsUnreadbale():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy():void{}
	}

}
