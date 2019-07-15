/*[IF-FLASH]*/
package laya.d3.resource.models {
	improt laya.d3.core.GeometryElement;
	improt laya.d3.resource.models.Mesh;
	public class SubMesh extends laya.d3.core.GeometryElement {
		public function get indexCount():Number{};

		public function SubMesh(mesh:Mesh){}
		public function getIndices():Uint16Array{}
		public function setIndices(indices:Uint16Array):void{}
		public function destroy():void{}
	}

}
