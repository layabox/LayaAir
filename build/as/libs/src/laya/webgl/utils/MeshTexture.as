/*[IF-FLASH]*/
package laya.webgl.utils {
	improt laya.webgl.utils.Mesh2D;
	improt laya.maths.Matrix;
	public class MeshTexture extends laya.webgl.utils.Mesh2D {
		public static var const_stride:Number;
		private static var _fixattriInfo:*;
		private static var _POOL:*;
		public static function __init__():void{}

		public function MeshTexture(){}
		public static function getAMesh(mainctx:Boolean):MeshTexture{}
		public function addData(vertices:Float32Array,uvs:Float32Array,idx:Uint16Array,matrix:Matrix,rgba:Number):void{}
		public function releaseMesh():void{}
		public function destroy():void{}
	}

}
