package laya.layagl {
	import laya.layagl.CommandEncoder;
	import laya.layagl.LayaGL;

	/**
	 * @private 普通命令执行器
	 */
	public class LayaGLRunner {

		/**
		 * @private 批量上传ShaderUniforms。
		 */
		public static function uploadShaderUniforms(layaGL:LayaGL,commandEncoder:CommandEncoder,shaderData:*,uploadUnTexture:Boolean):Number{
			return null;
		}

		/**
		 * @private 上传ShaderUniform。
		 */
		public static function uploadCustomUniform(layaGL:LayaGL,custom:Array,index:Number,data:*):Number{
			return null;
		}

		/**
		 * @private 批量上传ShaderUniforms。
		 */
		public static function uploadShaderUniformsForNative(layaGL:*,commandEncoder:CommandEncoder,shaderData:*):Number{
			return null;
		}
	}

}
