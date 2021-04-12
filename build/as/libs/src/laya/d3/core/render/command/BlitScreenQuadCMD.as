package laya.d3.core.render.command {
	import laya.d3.core.render.command.CommandBuffer;
	import laya.d3.shader.ShaderData;
	import laya.d3.shader.Shader3D;
	import laya.d3.math.Vector4;
	import laya.d3.resource.RenderTexture;
	import laya.resource.BaseTexture;
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;
	import laya.d3.resource.RenderTexture;
	import laya.d3.shader.Shader3D;
	import laya.d3.shader.ShaderData;
	import laya.d3.core.render.command.Command;
	import laya.d3.core.render.command.CommandBuffer;

	/**
	 * <code>BlitScreenQuadCMD</code> 类用于创建从一张渲染目标输出到另外一张渲染目标指令。
	 */
	public class BlitScreenQuadCMD extends Command {

		/**
		 * 创建命令流
		 * @param source 原始贴图 如果设置为null  将会使用默认的Camera流程中的原RenderTexture
		 * @param dest 目标贴图 如果设置为null，将会使用默认的camera渲染目标
		 * @param offsetScale 偏移缩放
		 * @param shader 渲染shader
		 * @param shaderData 渲染数据
		 * @param subShader subshader的节点
		 * @param screenType 
		 */
		public static function create(source:BaseTexture,dest:RenderTexture,offsetScale:Vector4 = null,shader:Shader3D = null,shaderData:ShaderData = null,subShader:Number = null,screenType:Number = null,commandbuffer:CommandBuffer = null,definedCanvas:Boolean = null):BlitScreenQuadCMD{
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
