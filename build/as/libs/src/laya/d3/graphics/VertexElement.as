package laya.d3.graphics {

	/**
	 * <code>VertexElement</code> 类用于创建顶点结构分配。
	 */
	public class VertexElement {

		/**
		 * 顶点偏移
		 */
		public function get offset():Number{return null;}

		/**
		 * 顶点信息名称
		 */
		public function get elementFormat():String{return null;}

		/**
		 * 顶点宏标记
		 */
		public function get elementUsage():Number{return null;}

		/**
		 * 创建顶点结构分配实例
		 * @param offset 顶点偏移
		 * @param elementFormat 顶点数据格式名称
		 * @param elementUsage 顶点宏标记
		 */

		public function VertexElement(offset:Number = undefined,elementFormat:String = undefined,elementUsage:Number = undefined){}
	}

}
