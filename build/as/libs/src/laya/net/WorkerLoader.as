/*[IF-FLASH]*/
package laya.net {
	improt laya.events.EventDispatcher;
	public class WorkerLoader extends laya.events.EventDispatcher {
		public static var I:WorkerLoader;
		public static var workerPath:String;
		private static var _preLoadFun:*;
		private static var _enable:*;
		private static var _tryEnabled:*;
		public var worker:Worker;
		protected var _useWorkerLoader:Boolean;

		public function WorkerLoader(){}
		public static function workerSupported():Boolean{}
		public static function enableWorkerLoader():void{}
		public static var enable:Boolean;
		private var workerMessage:*;
		private var imageLoaded:*;
		public function loadImage(url:String):void{}
		protected function _loadImage(url:String):void{}
	}

}
