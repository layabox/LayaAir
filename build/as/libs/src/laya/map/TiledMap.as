package laya.map {
	import laya.map.MapLayer;
	import laya.map.TileTexSet;
	import laya.map.GridSprite;
	import laya.maths.Rectangle;
	import laya.display.Sprite;
	import laya.utils.Handler;
	import laya.maths.Point;

	/**
	 * tiledMap是整个地图的核心
	 * 地图以层级来划分地图（例如：地表层，植被层，建筑层）
	 * 每层又以分块（GridSprite)来处理显示对象，只显示在视口区域的区
	 * 每块又包括N*N个格子（tile)
	 * 格子类型又分为动画格子跟图片格子两种
	 * @author ...
	 */
	public class TiledMap {

		/**
		 * 四边形地图
		 */
		public static var ORIENTATION_ORTHOGONAL:String;

		/**
		 * 菱形地图
		 */
		public static var ORIENTATION_ISOMETRIC:String;

		/**
		 * 45度交错地图
		 */
		public static var ORIENTATION_STAGGERED:String;

		/**
		 * 六边形地图
		 */
		public static var ORIENTATION_HEXAGONAL:String;

		/**
		 * 地图格子从左上角开始渲染
		 */
		public static var RENDERORDER_RIGHTDOWN:String;

		/**
		 * 地图格子从左下角开始渲染
		 */
		public static var RENDERORDER_RIGHTUP:String;

		/**
		 * 地图格子从右上角开始渲染
		 */
		public static var RENDERORDER_LEFTDOWN:String;

		/**
		 * 地图格子右下角开始渲染
		 */
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

		/**
		 * 是否自动缓存没有动画的地块
		 */
		public var autoCache:Boolean;

		/**
		 * 自动缓存类型,地图较大时建议使用normal
		 */
		public var autoCacheType:String;

		/**
		 * 是否合并图层,开启合并图层时，图层属性内可添加layer属性，运行时将会将相邻的layer属性相同的图层进行合并以提高性能
		 */
		public var enableMergeLayer:Boolean;

		/**
		 * 是否移除被覆盖的格子,地块可添加type属性，type不为0时表示不透明，被不透明地块遮挡的地块将会被剔除以提高性能
		 */
		public var removeCoveredTile:Boolean;

		/**
		 * 是否显示大格子里显示的贴图数量
		 */
		public var showGridTextureCount:Boolean;

		/**
		 * 是否调整地块边缘消除缩放导致的缝隙
		 */
		public var antiCrack:Boolean;

		/**
		 * 是否在加载完成之后cache所有大格子
		 */
		public var cacheAllAfterInit:Boolean;

		public function TiledMap(){}

		/**
		 * 创建地图
		 * @param mapName JSON文件名字
		 * @param viewRect 视口区域
		 * @param completeHandler 地图创建完成的回调函数
		 * @param viewRectPadding 视口扩充区域，把视口区域上、下、左、右扩充一下，防止视口移动时的穿帮
		 * @param gridSize grid大小
		 * @param enableLinear 是否开启线性取样（为false时，可以解决地图黑线的问题，但画质会锐化）
		 * @param limitRange 把地图限制在显示区域
		 */
		public function createMap(mapName:String,viewRect:Rectangle,completeHandler:Handler,viewRectPadding:Rectangle = null,gridSize:Point = null,enableLinear:Boolean = null,limitRange:Boolean = null):void{}

		/**
		 * json文件读取成功后，解析里面的纹理数据，进行加载
		 * @param e JSON数据
		 */
		private var onJsonComplete:*;

		/**
		 * 合并路径
		 * @param resPath 
		 * @param relativePath 
		 * @return 
		 */
		private var mergePath:*;
		private var _texutreStartDic:*;

		/**
		 * 纹理加载完成，如果所有的纹理加载，开始初始化地图
		 * @param e 纹理数据
		 */
		private var onTextureComplete:*;
		private var adptTexture:*;

		/**
		 * 初始化地图
		 */
		private var initMap:*;
		private var addTileProperties:*;
		public function getTileUserData(id:Number,sign:String,defaultV:* = null):*{}
		private var adptTiledMapData:*;
		private var removeCoverd:*;
		private var collectCovers:*;

		/**
		 * 得到一块指定的地图纹理
		 * @param index 纹理的索引值，默认从1开始
		 * @return 
		 */
		public function getTexture(index:Number):TileTexSet{
			return null;
		}

		/**
		 * 得到地图的自定义属性
		 * @param name 属性名称
		 * @return 
		 */
		public function getMapProperties(name:String):*{}

		/**
		 * 得到tile自定义属性
		 * @param index 地图块索引
		 * @param id 具体的TileSetID
		 * @param name 属性名称
		 * @return 
		 */
		public function getTileProperties(index:Number,id:Number,name:String):*{}

		/**
		 * 通过纹理索引，生成一个可控制物件
		 * @param index 纹理的索引值，默认从1开始
		 * @return 
		 */
		public function getSprite(index:Number,width:Number,height:Number):GridSprite{
			return null;
		}

		/**
		 * 设置视口的缩放中心点（例如：scaleX= scaleY= 0.5,就是以视口中心缩放）
		 * @param scaleX 
		 * @param scaleY 
		 */
		public function setViewPortPivotByScale(scaleX:Number,scaleY:Number):void{}

		/**
		 * 设置地图缩放
		 * @param scale 
		 */

		/**
		 * 得到当前地图的缩放
		 */
		public var scale:Number;

		/**
		 * 移动视口
		 * @param moveX 视口的坐标x
		 * @param moveY 视口的坐标y
		 */
		public function moveViewPort(moveX:Number,moveY:Number):void{}

		/**
		 * 改变视口大小
		 * @param moveX 视口的坐标x
		 * @param moveY 视口的坐标y
		 * @param width 视口的宽
		 * @param height 视口的高
		 */
		public function changeViewPort(moveX:Number,moveY:Number,width:Number,height:Number):void{}

		/**
		 * 在锚点的基础上计算，通过宽和高，重新计算视口
		 * @param width 新视口宽
		 * @param height 新视口高
		 * @param rect 返回的结果
		 * @return 
		 */
		public function changeViewPortBySize(width:Number,height:Number,rect:Rectangle = null):Rectangle{
			return null;
		}

		/**
		 * 刷新视口
		 */
		private var updateViewPort:*;

		/**
		 * GRID裁剪
		 */
		private var clipViewPort:*;

		/**
		 * 显示指定的GRID
		 * @param gridX 
		 * @param gridY 
		 */
		private var showGrid:*;
		private var cacheAllGrid:*;
		private static var _tempCanvas:*;
		private var cacheGridsArray:*;
		private var getGridArray:*;

		/**
		 * 隐藏指定的GRID
		 * @param gridX 
		 * @param gridY 
		 */
		private var hideGrid:*;

		/**
		 * 得到对象层上的某一个物品
		 * @param layerName 层的名称
		 * @param objectName 所找物品的名称
		 * @return 
		 */
		public function getLayerObject(layerName:String,objectName:String):GridSprite{
			return null;
		}

		/**
		 * 销毁地图
		 */
		public function destroy():void{}

		/**
		 * **************************地图的基本数据**************************
		 */

		/**
		 * 格子的宽度
		 */
		public function get tileWidth():Number{
				return null;
		}

		/**
		 * 格子的高度
		 */
		public function get tileHeight():Number{
				return null;
		}

		/**
		 * 地图的宽度
		 */
		public function get width():Number{
				return null;
		}

		/**
		 * 地图的高度
		 */
		public function get height():Number{
				return null;
		}

		/**
		 * 地图横向的格子数
		 */
		public function get numColumnsTile():Number{
				return null;
		}

		/**
		 * 地图竖向的格子数
		 */
		public function get numRowsTile():Number{
				return null;
		}

		/**
		 * @private 视口x坐标
		 */
		public function get viewPortX():Number{
				return null;
		}

		/**
		 * @private 视口的y坐标
		 */
		public function get viewPortY():Number{
				return null;
		}

		/**
		 * @private 视口的宽度
		 */
		public function get viewPortWidth():Number{
				return null;
		}

		/**
		 * @private 视口的高度
		 */
		public function get viewPortHeight():Number{
				return null;
		}

		/**
		 * 地图的x坐标
		 */
		public function get x():Number{
				return null;
		}

		/**
		 * 地图的y坐标
		 */
		public function get y():Number{
				return null;
		}

		/**
		 * 块的宽度
		 */
		public function get gridWidth():Number{
				return null;
		}

		/**
		 * 块的高度
		 */
		public function get gridHeight():Number{
				return null;
		}

		/**
		 * 地图的横向块数
		 */
		public function get numColumnsGrid():Number{
				return null;
		}

		/**
		 * 地图的坚向块数
		 */
		public function get numRowsGrid():Number{
				return null;
		}

		/**
		 * 当前地图类型
		 */
		public function get orientation():String{
				return null;
		}

		/**
		 * tile渲染顺序
		 */
		public function get renderOrder():String{
				return null;
		}

		/**
		 * ***************************************对外接口*********************************************
		 */

		/**
		 * 整个地图的显示容器
		 * @return 地图的显示容器
		 */
		public function mapSprite():Sprite{
			return null;
		}

		/**
		 * 得到指定的MapLayer
		 * @param layerName 要找的层名称
		 * @return 
		 */
		public function getLayerByName(layerName:String):MapLayer{
			return null;
		}

		/**
		 * 通过索引得MapLayer
		 * @param index 要找的层索引
		 * @return 
		 */
		public function getLayerByIndex(index:Number):MapLayer{
			return null;
		}
	}

}
