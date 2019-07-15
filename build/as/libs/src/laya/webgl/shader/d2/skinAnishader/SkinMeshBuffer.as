/*[IF-FLASH]*/
package laya.webgl.shader.d2.skinAnishader {
	improt laya.webgl.utils.IndexBuffer2D;
	improt laya.webgl.utils.VertexBuffer2D;
	public class SkinMeshBuffer {
		public var ib:IndexBuffer2D;
		public var vb:VertexBuffer2D;
		public static var instance:SkinMeshBuffer;

		public function SkinMeshBuffer(){}
		public static function getInstance():SkinMeshBuffer{}
		public function addSkinMesh(skinMesh:*):void{}
		public function reset():void{}
	}

}
