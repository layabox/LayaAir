package laya.net {
	import laya.events.EventDispatcher;

	/**
	 * @private 场景资源加载器
	 */
	public class SceneLoader extends EventDispatcher {
		public static var LoadableExtensions:*;
		public static var No3dLoadTypes:*;
		public var totalCount:Number;
		private var _completeHandler:*;
		private var _toLoadList:*;
		private var _isLoading:*;
		private var _curUrl:*;

		public function SceneLoader(){}
		public function reset():void{}
		public function get leftCount():Number{
				return null;
		}
		public function get loadedCount():Number{
				return null;
		}
		public function load(url:*,is3D:Boolean = null,ifCheck:Boolean = null):void{}
		private var _addToLoadList:*;
		private var _checkNext:*;
		private var loadOne:*;
		private var onOneLoadComplete:*;
		public function getProgress():Number{
			return null;
		}
	}

}
