/*[IF-FLASH]*/
package laya.d3.core {
	improt laya.d3.math.Vector2;
	improt laya.d3.resource.models.Mesh;
	improt laya.resource.Texture2D;
	public class HeightMap {
		private static var _tempRay:*;
		public static function creatFromMesh(mesh:Mesh,width:Number,height:Number,outCellSize:Vector2):HeightMap{}
		public static function createFromImage(texture:Texture2D,minHeight:Number,maxHeight:Number):HeightMap{}
		private static var _getPosition:*;
		private var _datas:*;
		private var _w:*;
		private var _h:*;
		private var _minHeight:*;
		private var _maxHeight:*;
		public function get width():Number{};
		public function get height():Number{};
		public function get maxHeight():Number{};
		public function get minHeight():Number{};

		public function HeightMap(width:Number,height:Number,minHeight:Number,maxHeight:Number){}
		public function getHeight(row:Number,col:Number):Number{}
	}

}
