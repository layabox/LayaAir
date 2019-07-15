/*[IF-FLASH]*/
package laya.webgl.utils {
	improt laya.webgl.utils.Mesh2D;
	public class MeshQuadTexture extends laya.webgl.utils.Mesh2D {
		public static var const_stride:Number;
		private static var _fixib:*;
		private static var _maxIB:*;
		private static var _fixattriInfo:*;
		private static var _POOL:*;
		public static function __int__():void{}

		public function MeshQuadTexture(){}
		public static function getAMesh(mainctx:Boolean):MeshQuadTexture{}
		public function releaseMesh():void{}
		public function destroy():void{}
		public function addQuad(pos:Array,uv:Array,color:Number,useTex:Boolean):void{}
	}

}
