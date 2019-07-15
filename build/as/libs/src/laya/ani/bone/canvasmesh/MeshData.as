/*[IF-FLASH]*/
package laya.ani.bone.canvasmesh {
	improt laya.resource.Texture;
	improt laya.maths.Matrix;
	improt laya.maths.Rectangle;
	public class MeshData {
		public var texture:Texture;
		public var uvs:Float32Array;
		public var vertices:Float32Array;
		public var indexes:Uint16Array;
		public var uvTransform:Matrix;
		public var useUvTransform:Boolean;
		public var canvasPadding:Number;
		public function getBounds():Rectangle{}
	}

}
