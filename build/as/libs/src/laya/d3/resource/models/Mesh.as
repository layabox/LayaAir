/*[IF-FLASH]*/
package laya.d3.resource.models {
	improt laya.resource.Resource;
	improt laya.utils.Handler;
	improt laya.d3.core.Bounds;
	improt laya.d3.core.IClone;
	improt laya.d3.graphics.VertexDeclaration;
	improt laya.d3.math.Color;
	improt laya.d3.math.Matrix4x4;
	improt laya.d3.math.Vector2;
	improt laya.d3.math.Vector3;
	improt laya.d3.math.Vector4;
	improt laya.d3.resource.models.SubMesh;
	public class Mesh extends laya.resource.Resource implements laya.d3.core.IClone {
		public static var MESH:String;
		public static function load(url:String,complete:Handler):void{}
		public function get inverseAbsoluteBindPoses():Array{};
		public function get vertexCount():Number{};
		public function get indexCount():Number{};
		public function get subMeshCount():Number{};
		public var bounds:Bounds;

		public function Mesh(isReadable:Boolean = null){}
		protected function _disposeResource():void{}
		public function getSubMesh(index:Number):SubMesh{}
		public function getPositions(positions:Array):void{}
		public function setPositions(positions:Array):void{}
		public function getColors(colors:Array):void{}
		public function setColors(colors:Array):void{}
		public function getUVs(uvs:Array,channel:Number = null):void{}
		public function setUVs(uvs:Array,channel:Number = null):void{}
		public function getNormals(normals:Array):void{}
		public function setNormals(normals:Array):void{}
		public function getTangents(tangents:Array):void{}
		public function setTangents(tangents:Array):void{}
		public function getBoneWeights(boneWeights:Array):void{}
		public function setBoneWeights(boneWeights:Array):void{}
		public function getBoneIndices(boneIndices:Array):void{}
		public function setBoneIndices(boneIndices:Array):void{}
		public function markAsUnreadbale():void{}
		public function getVertexDeclaration():VertexDeclaration{}
		public function getVertices():ArrayBuffer{}
		public function setVertices(vertices:ArrayBuffer):void{}
		public function getIndices():Uint16Array{}
		public function setIndices(indices:Uint16Array):void{}
		public function calculateBounds():void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
