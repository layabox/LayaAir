package laya.d3.core.render.command {
	import laya.d3.core.render.command.Command;
	import laya.d3.math.Matrix4x4;

	/**
	 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
	 */
	public class DrawMeshInstancedCMD extends Command {

		/**
		 * 设置最大DrawInstance数
		 */
		public static var maxInstanceCount:Number;

		public function DrawMeshInstancedCMD(){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function run():void{}

		/**
		 * 重置DrawInstance的世界矩阵数组
		 * @param worldMatrixArray 
		 */
		public function setWorldMatrix(worldMatrixArray:Array):void{}

		/**
		 * 重置渲染个数
		 * @param drawNums 
		 */
		public function setDrawNums(drawNums:Number):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function recover():void{}
	}

}
