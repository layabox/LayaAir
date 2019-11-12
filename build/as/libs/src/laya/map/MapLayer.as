package laya.map {
	import laya.map.GridSprite;
	import laya.map.TiledMap;
	import laya.display.Sprite;
	import laya.maths.Point;

	/**
	 * 地图支持多层渲染（例如，地表层，植被层，建筑层等）
	 * 本类就是层级类
	 * @author ...
	 */
	public class MapLayer extends Sprite {
		private var _map:*;
		private var _tileWidthHalf:*;
		private var _tileHeightHalf:*;
		private var _mapWidthHalf:*;
		private var _mapHeightHalf:*;
		private var _objDic:*;
		private var _dataDic:*;
		private var _tempMapPos:*;
		private var _properties:*;

		/**
		 * 被合到的层
		 */
		public var tarLayer:MapLayer;

		/**
		 * 当前Layer的名称
		 */
		public var layerName:String;

		/**
		 * 解析LAYER数据，以及初始化一些数据
		 * @param layerData 地图数据中，layer数据的引用
		 * @param map 地图的引用
		 */
		public function init(layerData:*,map:TiledMap):void{}

		/**
		 * ****************************************对外接口********************************************
		 */

		/**
		 * 通过名字获取控制对象，如果找不到返回为null
		 * @param objName 所要获取对象的名字
		 * @return 
		 */
		public function getObjectByName(objName:String):GridSprite{
			return null;
		}

		/**
		 * 通过名字获取数据，如果找不到返回为null
		 * @param objName 所要获取对象的名字
		 * @return 
		 */
		public function getObjectDataByName(objName:String):*{}

		/**
		 * 得到地图层的自定义属性
		 * @param name 
		 * @return 
		 */
		public function getLayerProperties(name:String):*{}

		/**
		 * 得到指定格子的数据
		 * @param tileX 格子坐标X
		 * @param tileY 格子坐标Y
		 * @return 
		 */
		public function getTileData(tileX:Number,tileY:Number):Number{
			return null;
		}

		/**
		 * 通过地图坐标得到屏幕坐标
		 * @param tileX 格子坐标X
		 * @param tileY 格子坐标Y
		 * @param screenPos 把计算好的屏幕坐标数据，放到此对象中
		 */
		public function getScreenPositionByTilePos(tileX:Number,tileY:Number,screenPos:Point = null):void{}

		/**
		 * 通过屏幕坐标来获取选中格子的数据
		 * @param screenX 屏幕坐标x
		 * @param screenY 屏幕坐标y
		 * @return 
		 */
		public function getTileDataByScreenPos(screenX:Number,screenY:Number):Number{
			return null;
		}

		/**
		 * 通过屏幕坐标来获取选中格子的索引
		 * @param screenX 屏幕坐标x
		 * @param screenY 屏幕坐标y
		 * @param result 把计算好的格子坐标，放到此对象中
		 * @return 
		 */
		public function getTilePositionByScreenPos(screenX:Number,screenY:Number,result:Point = null):Boolean{
			return null;
		}

		/**
		 * ********************************************************************************************
		 */

		/**
		 * 得到一个GridSprite
		 * @param gridX 当前Grid的X轴索引
		 * @param gridY 当前Grid的Y轴索引
		 * @return 一个GridSprite对象
		 */
		public function getDrawSprite(gridX:Number,gridY:Number):GridSprite{
			return null;
		}

		/**
		 * 更新此层中块的坐标
		 * 手动刷新的目的是，保持层级的宽和高保持最小，加快渲染
		 */
		public function updateGridPos():void{}

		/**
		 * @private 把tile画到指定的显示对象上
		 * @param gridSprite 被指定显示的目标
		 * @param tileX 格子的X轴坐标
		 * @param tileY 格子的Y轴坐标
		 * @return 
		 */
		public function drawTileTexture(gridSprite:GridSprite,tileX:Number,tileY:Number):Boolean{
			return null;
		}

		/**
		 * @private 清理当前对象
		 */
		public function clearAll():void{}
	}

}
