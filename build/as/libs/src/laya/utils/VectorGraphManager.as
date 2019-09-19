package laya.utils {

	/**
	 * @private TODO:
	 */
	public class VectorGraphManager {
		public static var instance:VectorGraphManager;
		public var useDic:*;
		public var shapeDic:*;
		public var shapeLineDic:*;
		private var _id:*;
		private var _checkKey:*;
		private var _freeIdArray:*;

		public function VectorGraphManager(){}
		public static function getInstance():VectorGraphManager{
			return null;
		}

		/**
		 * 得到个空闲的ID
		 * @return 
		 */
		public function getId():Number{
			return null;
		}

		/**
		 * 添加一个图形到列表中
		 * @param id 
		 * @param shape 
		 */
		public function addShape(id:Number,shape:*):void{}

		/**
		 * 添加一个线图形到列表中
		 * @param id 
		 * @param Line 
		 */
		public function addLine(id:Number,Line:*):void{}

		/**
		 * 检测一个对象是否在使用中
		 * @param id 
		 */
		public function getShape(id:Number):void{}

		/**
		 * 删除一个图形对象
		 * @param id 
		 */
		public function deleteShape(id:Number):void{}

		/**
		 * 得到缓存列表
		 * @return 
		 */
		public function getCacheList():Array{
			return null;
		}

		/**
		 * 开始清理状态，准备销毁
		 */
		public function startDispose(key:Boolean):void{}

		/**
		 * 确认销毁
		 */
		public function endDispose():void{}
	}

}
