package laya.d3.resource.models {
	import laya.d3.resource.models.SkyMesh;

	/**
	 * <code>SkyDome</code> 类用于创建天空盒。
	 */
	public class SkyDome extends SkyMesh {
		public static var instance:SkyDome;

		/**
		 * 获取堆数。
		 */
		public function get stacks():Number{
				return null;
		}

		/**
		 * 获取层数。
		 */
		public function get slices():Number{
				return null;
		}

		/**
		 * 创建一个 <code>SkyDome</code> 实例。
		 * @param stacks 堆数。
		 * @param slices 层数。
		 */

		public function SkyDome(stacks:Number = undefined,slices:Number = undefined){}
	}

}
