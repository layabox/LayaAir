package laya.d3.core.render.command {
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.resource.RenderTexture;
	import laya.d3.shader.Shader3D;
	import laya.d3.shader.ShaderData;
	import laya.d3.core.render.command.Command;

	/**
	 * <code>BlitScreenQuadCMD</code> 类用于创建从一张渲染目标输出到另外一张渲染目标指令。
	 */
	public class BlitScreenQuadCMD extends Command {

		/**
		 */
		public static function create(source:BaseTexture,dest:RenderTexture,offsetScale:Vector4 = null,shader:Shader3D = null,shaderData:ShaderData = null,subShader:Number = null,screenType:Number = null):BlitScreenQuadCMD{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function run():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function recover():void{}
	}

}
