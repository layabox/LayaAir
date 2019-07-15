/*[IF-FLASH]*/
package laya.ani {
	improt laya.ani.bone.canvasmesh.SkinMeshForGraphic;
	improt laya.display.Graphics;
	public class GraphicsAni extends laya.display.Graphics {
		public function drawSkin(skinA:SkinMeshForGraphic,alpha:Number):void{}
		private static var _caches:*;
		public static function create():GraphicsAni{}
		public static function recycle(graphics:GraphicsAni):void{}
	}

}
