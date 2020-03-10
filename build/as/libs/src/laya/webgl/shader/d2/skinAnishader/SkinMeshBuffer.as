package laya.webgl.shader.d2.skinAnishader {
	import laya.webgl.utils.IndexBuffer2D;
	import laya.webgl.utils.VertexBuffer2D;
	public class SkinMeshBuffer {
		public var ib:IndexBuffer2D;
		public var vb:VertexBuffer2D;
		public static var instance:SkinMeshBuffer;

		public function SkinMeshBuffer(){}
		public static function getInstance():SkinMeshBuffer{
			return null;
		}
		public function addSkinMesh(skinMesh:*):void{}
		public function reset():void{}
	}

}
