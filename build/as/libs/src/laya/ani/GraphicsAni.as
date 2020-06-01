package laya.ani {
	import laya.ani.bone.canvasmesh.SkinMeshForGraphic;
	import laya.display.Graphics;
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
		public static function recycle(graphics:GraphicsAni):void{}
	}

}
