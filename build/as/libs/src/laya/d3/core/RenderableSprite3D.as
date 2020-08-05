package laya.d3.core {
	import laya.d3.math.Vector4;
	import laya.d3.core.Sprite3D;
	import laya.d3.shader.ShaderDefine;

	/**
	 * <code>RenderableSprite3D</code> 类用于可渲染3D精灵的父类，抽象类不允许实例。
	 */
	public class RenderableSprite3D extends Sprite3D {

		/**
		 * 精灵级着色器宏定义,接收阴影。
		 */
		public static var SHADERDEFINE_RECEIVE_SHADOW:ShaderDefine;

		/**
		 * 精灵级着色器宏定义,光照贴图。
		 */
		public static var SAHDERDEFINE_LIGHTMAP:ShaderDefine;

		/**
		 * 精灵级着色器宏定义,光照贴图方向。
		 */
		public static var SHADERDEFINE_LIGHTMAP_DIRECTIONAL:ShaderDefine;

		/**
		 * 着色器变量名，光照贴图缩放和偏移。
		 */
		public static var LIGHTMAPSCALEOFFSET:Number;

		/**
		 * 着色器变量名，光照贴图。
		 */
		public static var LIGHTMAP:Number;

		/**
		 * 着色器变量名，光照贴图方向。
		 */
		public static var LIGHTMAP_DIRECTION:Number;

		/**
		 * 拾取颜色。
		 */
		public static var PICKCOLOR:Number;
		public var pickColor:Vector4;

		/**
		 * 创建一个 <code>RenderableSprite3D</code> 实例。
		 */

		public function RenderableSprite3D(name:String = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onInActive():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onActive():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onActiveInScene():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}
	}

}
