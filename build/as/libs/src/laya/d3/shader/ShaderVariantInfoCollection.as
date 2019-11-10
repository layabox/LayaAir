package laya.d3.shader {
	import laya.d3.shader.Shader3D;

	/**
	 * 着色器变种。
	 */
	public class ShaderVariantInfo {

		/**
		 * 创建着色器变种。
		 * @param shader 着色器
		 * @param subShaderIndex 子着色器索引
		 * @param passIndex 通道索引
		 * @param defines 宏定义集合
		 */

		public function ShaderVariantInfo(shader:Shader3D = undefined,subShaderIndex:Number = undefined,passIndex:Number = undefined,defines:Array = undefined){}

		/**
		 * 给着色器变种赋值。
		 * @param shader 着色器
		 * @param subShaderIndex 子着色器索引
		 * @param passIndex 通道索引
		 * @param defineNames 宏定义集合
		 */
		public function setValue(shader:Shader3D,subShaderIndex:Number,passIndex:Number,defineNames:Array):void{}

		/**
		 * 是否相等。
		 * @param other 其它着色器变种
		 * @return 是否相等。
		 */
		public function equal(other:ShaderVariantInfo):Boolean{
			return null;
		}

		/**
		 * 克隆。
		 * @return 着色器变种。
		 */
		public function clone():ShaderVariantInfo{
			return null;
		}
	}

}

	import ShaderVariantInfo;

	/**
	 * 着色器变种集合。
	 */
	class ShaderVariantInfoCollection {

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
		public function add(variant:ShaderVariantInfo):Boolean{
			return null;
		}

		/**
		 * 移除着色器变种。
		 * @param variant 着色器变种。
		 * @return 是否移除成功。
		 */
		public function remove(variant:ShaderVariantInfo):Boolean{
			return null;
		}

		/**
		 * 是否包含着色器变种。
		 * @param variant 着色器变种。
		 */
		public function contatins(variant:ShaderVariantInfo):Boolean{
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
