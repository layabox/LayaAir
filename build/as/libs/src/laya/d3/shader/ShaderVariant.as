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
