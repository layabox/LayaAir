package laya.d3.graphics {
	import laya.d3.graphics.VertexElement;

	/**
	 * <code>VertexDeclaration</code> 类用于生成顶点声明。
	 */
	public class VertexDeclaration {

		/**
		 * 获取唯一标识ID(通常用于优化或识别)。
		 * @return 唯一标识ID
		 */
		public function get id():Number{
				return null;
		}

		/**
		 * 顶点跨度，以字节为单位。
		 */
		public function get vertexStride():Number{
				return null;
		}

		/**
		 * 顶点元素的数量。
		 */
		public function get vertexElementCount():Number{
				return null;
		}

		/**
		 * 创建一个 <code>VertexDeclaration</code> 实例。
		 * @param vertexStride 顶点跨度。
		 * @param vertexElements 顶点元素集合。
		 */

		public function VertexDeclaration(vertexStride:Number = undefined,vertexElements:Array = undefined){}

		/**
		 * 通过索引获取顶点元素。
		 * @param index 索引。
		 */
		public function getVertexElementByIndex(index:Number):VertexElement{
			return null;
		}
	}

}
