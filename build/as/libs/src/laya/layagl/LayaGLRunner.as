/*[IF-FLASH]*/
package laya.layagl {
	improt laya.layagl.CommandEncoder;
	improt laya.layagl.LayaGL;
	public class LayaGLRunner {
		public static function uploadShaderUniforms(layaGL:LayaGL,commandEncoder:CommandEncoder,shaderData:*,uploadUnTexture:Boolean):Number{}
		public static function uploadCustomUniform(layaGL:LayaGL,custom:Array,index:Number,data:*):Number{}
		public static function uploadShaderUniformsForNative(layaGL:*,commandEncoder:CommandEncoder,shaderData:*):Number{}
	}

}
