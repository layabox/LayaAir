package laya.ani.bone.canvasmesh {
	import laya.ani.bone.canvasmesh.MeshData;
	import laya.maths.Matrix;
	import laya.resource.Texture;
	public class SkinMeshForGraphic extends MeshData {

		public function SkinMeshForGraphic(){}

		/**
		 * 矩阵
		 */
		public var transform:Matrix;
		public function init2(texture:Texture,ps:Array,verticles:Array,uvs:Array):void{}
	}

}
