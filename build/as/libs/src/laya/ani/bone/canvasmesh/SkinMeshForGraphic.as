/*[IF-FLASH]*/
package laya.ani.bone.canvasmesh {
	improt laya.ani.bone.canvasmesh.MeshData;
	improt laya.maths.Matrix;
	improt laya.resource.Texture;
	public class SkinMeshForGraphic extends laya.ani.bone.canvasmesh.MeshData {

		public function SkinMeshForGraphic(){}
		public var transform:Matrix;
		public function init2(texture:Texture,ps:Array,verticles:Array,uvs:Array):void{}
	}

}
