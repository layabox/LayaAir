package laya.webgl.utils {
	import laya.webgl.utils.Mesh2D;
	import laya.maths.Matrix;

	/*
	 * 与MeshQuadTexture基本相同。不过index不是固定的
	 */
	public class MeshTexture extends laya.webgl.utils.Mesh2D {
		public static var const_stride:Number;
		private static var _fixattriInfo:*;
		private static var _POOL:*;
		public static function __init__():void{}

		public function MeshTexture(){}

		/*
		 */
		public static function getAMesh(mainctx:Boolean):MeshTexture{
			return null;
		}
		public function addData(vertices:Float32Array,uvs:Float32Array,idx:Uint16Array,matrix:Matrix,rgba:Number):void{}

		/*
		 * 把本对象放到回收池中，以便getMesh能用。
		 * @override 
		 */
		override public function releaseMesh():void{}

		/*
		 * @override 
		 */
		override public function destroy():void{}
	}

}
