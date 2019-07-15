/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.d3.core.MeshSprite3D;
	improt laya.d3.core.HeightMap;
	improt laya.d3.resource.models.Mesh;
	improt laya.resource.Texture2D;
	public class MeshTerrainSprite3D extends laya.d3.core.MeshSprite3D {
		private static var _tempVector3:*;
		private static var _tempMatrix4x4:*;
		public static function createFromMesh(mesh:Mesh,heightMapWidth:Number,heightMapHeight:Number,name:String = null):MeshTerrainSprite3D{}
		public static function createFromMeshAndHeightMap(mesh:Mesh,texture:Texture2D,minHeight:Number,maxHeight:Number,name:String = null):MeshTerrainSprite3D{}
		private var _minX:*;
		private var _minZ:*;
		private var _cellSize:*;
		private var _heightMap:*;
		public function get minX():Number{};
		public function get minZ():Number{};
		public function get width():Number{};
		public function get depth():Number{};

		public function MeshTerrainSprite3D(mesh:Mesh,heightMap:HeightMap,name:String = null){}
		private var _disableRotation:*;
		private var _getScaleX:*;
		private var _getScaleZ:*;
		private var _initCreateFromMesh:*;
		private var _initCreateFromMeshHeightMap:*;
		private var _computeCellSize:*;
		public function getHeight(x:Number,z:Number):Number{}
	}

}
