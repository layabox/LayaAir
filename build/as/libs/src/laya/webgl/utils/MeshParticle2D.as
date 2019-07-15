/*[IF-FLASH]*/
package laya.webgl.utils {
	improt laya.webgl.utils.Mesh2D;
	public class MeshParticle2D extends laya.webgl.utils.Mesh2D {
		public static var const_stride:Number;
		private static var _fixattriInfo:*;
		private static var _POOL:*;
		public static function __init__():void{}

		public function MeshParticle2D(maxNum:Number){}
		public function setMaxParticleNum(maxNum:Number):void{}
		public static function getAMesh(maxNum:Number):MeshParticle2D{}
		public function releaseMesh():void{}
		public function destroy():void{}
	}

}
