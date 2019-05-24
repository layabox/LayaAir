package laya.ani.bone.canvasmesh {
	import laya.maths.Matrix;
	import laya.renders.Render;
	import laya.resource.Texture;
	
	/**
	 * ...
	 * @author ww
	 */
	public class SkinMeshForGraphic extends MeshData {
		
		//TODO:coverage
		public function SkinMeshForGraphic() {
		
		}
		/**
		 * 矩阵
		 */
		public var transform:Matrix;
		
		public function init2(texture:Texture, ps:Array, verticles:Array, uvs:Array):void {
			if (transform) {
				transform = null;
			}
			var _ps:Array = ps || [0, 1, 3, 3, 1, 2];
			this.texture = texture;
			
			this.indexes = new Uint16Array(_ps);
			this.vertices = new Float32Array(verticles);
			this.uvs = new Float32Array(uvs);
		}
	}

}