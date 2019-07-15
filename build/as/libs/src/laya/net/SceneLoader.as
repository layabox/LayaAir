/*[IF-FLASH]*/
package laya.net {
	improt laya.events.EventDispatcher;
	public class SceneLoader extends laya.events.EventDispatcher {
		public static var LoadableExtensions:*;
		public static var No3dLoadTypes:*;
		public var totalCount:Number;
		private var _completeHandler:*;
		private var _toLoadList:*;
		private var _isLoading:*;
		private var _curUrl:*;

		public function SceneLoader(){}
		public function reset():void{}
		public function get leftCount():Number{};
		public function get loadedCount():Number{};
		public function load(url:*,is3D:Boolean = null,ifCheck:Boolean = null):void{}
		private var _addToLoadList:*;
		private var _checkNext:*;
		private var loadOne:*;
		private var onOneLoadComplete:*;
		public function getProgress():Number{}
	}

}
