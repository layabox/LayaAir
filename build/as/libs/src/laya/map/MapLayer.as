/*[IF-FLASH]*/
package laya.map {
	improt laya.display.Sprite;
	improt laya.maths.Point;
	improt laya.map.GridSprite;
	improt laya.map.TiledMap;
	public class MapLayer extends laya.display.Sprite {
		private var _map:*;
		private var _tileWidthHalf:*;
		private var _tileHeightHalf:*;
		private var _mapWidthHalf:*;
		private var _mapHeightHalf:*;
		private var _objDic:*;
		private var _dataDic:*;
		private var _tempMapPos:*;
		private var _properties:*;
		public var tarLayer:MapLayer;
		public var layerName:String;
		public function init(layerData:*,map:TiledMap):void{}
		public function getObjectByName(objName:String):GridSprite{}
		public function getObjectDataByName(objName:String):GridSprite{}
		public function getLayerProperties(name:String):*{}
		public function getTileData(tileX:Number,tileY:Number):Number{}
		public function getScreenPositionByTilePos(tileX:Number,tileY:Number,screenPos:Point = null):void{}
		public function getTileDataByScreenPos(screenX:Number,screenY:Number):Number{}
		public function getTilePositionByScreenPos(screenX:Number,screenY:Number,result:Point = null):Boolean{}
		public function getDrawSprite(gridX:Number,gridY:Number):GridSprite{}
		public function updateGridPos():void{}
		public function drawTileTexture(gridSprite:GridSprite,tileX:Number,tileY:Number):Boolean{}
		public function clearAll():void{}
	}

}
