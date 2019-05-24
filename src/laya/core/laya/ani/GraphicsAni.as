package laya.ani {
	import laya.ani.bone.canvasmesh.SkinMeshForGraphic;
	import laya.display.Graphics;
	import laya.maths.Matrix;
	import laya.renders.Render;
	/**
	 * @private
	 */
	public class GraphicsAni extends Graphics {
			
		/**
		 * @private
		 * 画自定义蒙皮动画
		 * @param	skin
		 */
		//TODO:coverage
		public function drawSkin(skinA:SkinMeshForGraphic, alpha:Number):void {		
			drawTriangles(skinA.texture, 0, 0, skinA.vertices as Float32Array, skinA.uvs as Float32Array, skinA.indexes as Uint16Array, skinA.transform||Matrix.EMPTY, alpha);
		}
	
		private static var _caches:Array = [];
		//TODO:coverage
		public static function create():GraphicsAni
		{
			var rs:GraphicsAni = _caches.pop();
			return  rs||new GraphicsAni();
		}
		
		//TODO:coverage
		public static function recycle(graphics:GraphicsAni):void
		{
			graphics.clear();
			_caches.push(graphics);
		}
	}

}