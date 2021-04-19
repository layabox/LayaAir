package laya.d3.core {
	import laya.d3.resource.models.Mesh;
	import laya.d3.core.SkinnedMeshRenderer;
	import laya.d3.core.MeshFilter;
	import laya.d3.resource.models.Mesh;
	import laya.d3.core.MeshFilter;
	import laya.d3.core.RenderableSprite3D;
	import laya.d3.core.SkinnedMeshRenderer;

	/**
	 * <code>SkinnedMeshSprite3D</code> 类用于绑点骨骼节点精灵。
	 */
	public class SkinnedMeshSprite3D extends RenderableSprite3D {

		/**
		 * 着色器变量名，蒙皮动画。
		 */
		public static var BONES:Number;

		/**
		 * 简单动画变量名，贴图蒙皮动画
		 */
		public static var SIMPLE_SIMPLEANIMATORTEXTURE:Number;
		public static var SIMPLE_SIMPLEANIMATORPARAMS:Number;
		public static var SIMPLE_SIMPLEANIMATORTEXTURESIZE:Number;

		/**
		 * 网格过滤器。
		 */
		public function get meshFilter():MeshFilter{return null;}

		/**
		 * 网格渲染器。
		 */
		public function get skinnedMeshRenderer():SkinnedMeshRenderer{return null;}

		/**
		 * 创建一个 <code>MeshSprite3D</code> 实例。
		 * @param mesh 网格,同时会加载网格所用默认材质。
		 * @param name 名字。
		 */

		public function SkinnedMeshSprite3D(mesh:Mesh = undefined,name:String = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}
	}

}
