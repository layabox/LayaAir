/*[IF-FLASH]*/
package laya.map {
	improt laya.map.MapLayer;
	improt laya.maths.Rectangle;
	improt laya.display.Sprite;
	improt laya.utils.Handler;
	improt laya.maths.Point;
	improt laya.map.TileTexSet;
	improt laya.map.GridSprite;
	public class TiledMap {
		public static var ORIENTATION_ORTHOGONAL:String;
		public static var ORIENTATION_ISOMETRIC:String;
		public static var ORIENTATION_STAGGERED:String;
		public static var ORIENTATION_HEXAGONAL:String;
		public static var RENDERORDER_RIGHTDOWN:String;
		public static var RENDERORDER_RIGHTUP:String;
		public static var RENDERORDER_LEFTDOWN:String;
		public static var RENDERORDER_LEFTUP:String;
		private var _jsonData:*;
		private var _tileTexSetArr:*;
		private var _texArray:*;
		private var _x:*;
		private var _y:*;
		private var _width:*;
		private var _height:*;
		private var _mapW:*;
		private var _mapH:*;
		private var _mapTileW:*;
		private var _mapTileH:*;
		private var _rect:*;
		private var _paddingRect:*;
		private var _mapSprite:*;
		private var _layerArray:*;
		private var _renderLayerArray:*;
		private var _gridArray:*;
		private var _showGridKey:*;
		private var _totalGridNum:*;
		private var _gridW:*;
		private var _gridH:*;
		private var _gridWidth:*;
		private var _gridHeight:*;
		private var _jsonLoader:*;
		private var _loader:*;
		private var _tileSetArray:*;
		private var _currTileSet:*;
		private var _completeHandler:*;
		private var _mapRect:*;
		private var _mapLastRect:*;
		private var _index:*;
		private var _animationDic:*;
		private var _properties:*;
		private var _tileProperties:*;
		private var _tileProperties2:*;
		private var _orientation:*;
		private var _renderOrder:*;
		private var _colorArray:*;
		private var _scale:*;
		private var _pivotScaleX:*;
		private var _pivotScaleY:*;
		private var _centerX:*;
		private var _centerY:*;
		private var _viewPortWidth:*;
		private var _viewPortHeight:*;
		private var _enableLinear:*;
		private var _resPath:*;
		private var _pathArray:*;
		private var _limitRange:*;
		public var autoCache:Boolean;
		public var autoCacheType:String;
		public var enableMergeLayer:Boolean;
		public var removeCoveredTile:Boolean;
		public var showGridTextureCount:Boolean;
		public var antiCrack:Boolean;
		public var cacheAllAfterInit:Boolean;

		public function TiledMap(){}
		public function createMap(mapName:String,viewRect:Rectangle,completeHandler:Handler,viewRectPadding:Rectangle = null,gridSize:Point = null,enableLinear:Boolean = null,limitRange:Boolean = null):void{}
		private var onJsonComplete:*;
		private var mergePath:*;
		private var _texutreStartDic:*;
		private var onTextureComplete:*;
		private var adptTexture:*;
		private var initMap:*;
		private var addTileProperties:*;
		public function getTileUserData(id:Number,sign:String,defaultV:* = null):*{}
		private var adptTiledMapData:*;
		private var removeCoverd:*;
		private var collectCovers:*;
		public function getTexture(index:Number):TileTexSet{}
		public function getMapProperties(name:String):*{}
		public function getTileProperties(index:Number,id:Number,name:String):*{}
		public function getSprite(index:Number,width:Number,height:Number):GridSprite{}
		public function setViewPortPivotByScale(scaleX:Number,scaleY:Number):void{}
		public var scale:Number;
		public function moveViewPort(moveX:Number,moveY:Number):void{}
		public function changeViewPort(moveX:Number,moveY:Number,width:Number,height:Number):void{}
		public function changeViewPortBySize(width:Number,height:Number,rect:Rectangle = null):Rectangle{}
		private var updateViewPort:*;
		private var clipViewPort:*;
		private var showGrid:*;
		private var cacheAllGrid:*;
		private static var _tempCanvas:*;
		private var cacheGridsArray:*;
		private var getGridArray:*;
		private var hideGrid:*;
		public function getLayerObject(layerName:String,objectName:String):GridSprite{}
		public function destroy():void{}
		public function get tileWidth():Number{};
		public function get tileHeight():Number{};
		public function get width():Number{};
		public function get height():Number{};
		public function get numColumnsTile():Number{};
		public function get numRowsTile():Number{};
		public function get viewPortX():Number{};
		public function get viewPortY():Number{};
		public function get viewPortWidth():Number{};
		public function get viewPortHeight():Number{};
		public function get x():Number{};
		public function get y():Number{};
		public function get gridWidth():Number{};
		public function get gridHeight():Number{};
		public function get numColumnsGrid():Number{};
		public function get numRowsGrid():Number{};
		public function get orientation():String{};
		public function get renderOrder():String{};
		public function mapSprite():Sprite{}
		public function getLayerByName(layerName:String):MapLayer{}
		public function getLayerByIndex(index:Number):MapLayer{}
	}

}
