package laya.d3.resource.models {
	import laya.d3.core.GeometryElement;
	import laya.d3.resource.models.Mesh;

	/**
	 * <code>SubMesh</code> 类用于创建子网格数据模板。
	 */
	public class SubMesh extends GeometryElement {

		/**
		 * 获取索引数量。
		 */
		public function get indexCount():Number{
				return null;
		}

		/**
		 * 创建一个 <code>SubMesh</code> 实例。
		 * @param mesh 网格数据模板。
		 */

		public function SubMesh(mesh:Mesh = undefined){}

		/**
		 * 拷贝并获取子网格索引数据的副本。
		 */
		public function getIndices():Uint16Array{
			return null;
		}

		/**
		 * 设置子网格索引。
		 * @param indices 
		 */
		public function setIndices(indices:Uint16Array):void{}

		/**
		 * {@inheritDoc GeometryElement.destroy}
		 * @override 
		 */
		override public function destroy():void{}
	}

}
