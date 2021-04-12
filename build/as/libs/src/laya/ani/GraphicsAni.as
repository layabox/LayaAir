package laya.ani {
	import laya.ani.bone.canvasmesh.SkinMeshForGraphic;
	import laya.ani.bone.canvasmesh.SkinMeshForGraphic;
	import laya.display.Graphics;

	/**
	 * 动画
	 */
	public class GraphicsAni extends Graphics {

		/**
		 * @private 画自定义蒙皮动画
		 * @param skin 
		 */
		public function drawSkin(skinA:SkinMeshForGraphic,alpha:Number):void{}
		private static var _caches:*;
		public static function create():GraphicsAni{
			return null;
		}

		/**
		 * 回收清理
		 * @param graphics 
		 */
		public static function recycle(graphics:GraphicsAni):void{}
	}

}
