package laya.d3.shader {
	import laya.d3.shader.Shader3D;

	/**
	 * 着色器变种。
	 */
	public class ShaderVariant {

		/**
		 * 着色器。
		 */
		public function get shader():Shader3D{
				return null;
		}

		/**
		 * 子着色器索引。
		 */
		public function get subShaderIndex():Number{
				return null;
		}

		/**
		 * 通道索引。
		 */
		public function get passIndex():Number{
				return null;
		}

		/**
		 * 宏定义集合。
		 */
		public function get defineNames():Array{
				return null;
		}

		/**
		 * 创建着色器变种。
		 * @param shader 着色器
		 * @param subShaderIndex 子着色器索引
		 * @param passIndex 通道索引
		 * @param defines 宏定义集合
		 */

		public function ShaderVariant(shader:Shader3D = undefined,subShaderIndex:Number = undefined,passIndex:Number = undefined,defines:Array = undefined){}

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
		public function equal(other:ShaderVariant):Boolean{
			return null;
		}

		/**
		 * 克隆。
		 * @return 着色器变种。
		 */
		public function clone():ShaderVariant{
			return null;
		}
	}

}

	import ShaderVariant;

	/**
	 * 着色器变种集合。
	 */
	class ShaderVariantCollection {

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
