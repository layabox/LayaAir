/*[IF-FLASH]*/
package laya.d3.core.trail {
	improt laya.d3.core.trail.TrailFilter;
	improt laya.d3.core.trail.TrailRenderer;
	improt laya.d3.core.RenderableSprite3D;
	improt laya.display.Node;
	public class TrailSprite3D extends laya.d3.core.RenderableSprite3D {
		public function get trailFilter():TrailFilter{};
		public function get trailRenderer():TrailRenderer{};

		public function TrailSprite3D(name:String = null){}
		public function _parse(data:*,spriteMap:*):void{}
		protected function _onActive():void{}
		public function _cloneTo(destObject:*,srcSprite:Node,dstSprite:Node):void{}
		public function destroy(destroyChild:Boolean = null):void{}
	}

}
