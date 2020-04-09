package laya.utils {
	import laya.display.Scene;
	import laya.display.Scene;

	/**
	 * @private 场景辅助类
	 */
	public class InitTool {

		/**
		 * @private 
		 */
		private var _nodeRefList:*;

		/**
		 * @private 
		 */
		private var _initList:*;
		private var _loadList:*;
		public function reset():void{}
		public function recover():void{}
		public static function create():InitTool{
			return null;
		}
		public function addLoadRes(url:String,type:String = null):void{}

		/**
		 * @private 
		 */
		public function addNodeRef(node:*,prop:String,referStr:String):void{}

		/**
		 * @private 
		 */
		public function setNodeRef():void{}

		/**
		 * @private 
		 */
		public function getReferData(referStr:String):*{}

		/**
		 * @private 
		 */
		public function addInitItem(item:*):void{}

		/**
		 * @private 
		 */
		public function doInits():void{}

		/**
		 * @private 
		 */
		public function finish():void{}

		/**
		 * @private 
		 */
		public function beginLoad(scene:Scene):void{}
	}

}
