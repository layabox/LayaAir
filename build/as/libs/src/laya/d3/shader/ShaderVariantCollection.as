package laya.d3.shader {

	/**
	 * 着色器变种集合。
	 */
	public class ShaderVariantCollection {

		/**
		 * 是否已经全部编译。
		 */
		public function get allCompiled():Boolean{
				return null;
		}

		/**
		 * 包含的变种数量。
		 */
		public function get variantCount():Number{
				return null;
		}

		/**
		 * 添加着色器变种。
		 * @param variant 着色器变种。
		 * @param 是否添加成功 。
		 */
		public function add(variant:ShaderVariant):Boolean{
			return null;
		}

		/**
		 * 移除着色器变种。
		 * @param variant 着色器变种。
		 * @return 是否移除成功。
		 */
		public function remove(variant:ShaderVariant):Boolean{
			return null;
		}

		/**
		 * 是否包含着色器变种。
		 * @param variant 着色器变种。
		 */
		public function contatins(variant:ShaderVariant):Boolean{
			return null;
		}

		/**
		 * 通过索引获取着色器变种。
		 * @param index 索引。
		 * @returns 着色器变种。
		 */
		public function getByIndex(index:Number):ShaderVariant{
			return null;
		}

		/**
		 * 清空。
		 */
		public function clear():void{}

		/**
		 * 执行编译。
		 */
		public function compile():void{}
	}

}
