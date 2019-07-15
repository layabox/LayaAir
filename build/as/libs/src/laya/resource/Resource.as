/*[IF-FLASH]*/
package laya.resource {
	improt laya.events.EventDispatcher;
	improt laya.resource.ICreateResource;
	improt laya.resource.IDestroy;
	public class Resource extends laya.events.EventDispatcher implements laya.resource.ICreateResource,laya.resource.IDestroy {
		private static var _uniqueIDCounter:*;
		private static var _idResourcesMap:*;
		private static var _urlResourcesMap:*;
		private static var _cpuMemory:*;
		private static var _gpuMemory:*;
		public static function get cpuMemory():Number{};
		public static function get gpuMemory():Number{};
		public static function getResourceByID(id:Number):Resource{}
		public static function getResourceByURL(url:String,index:Number = null):Resource{}
		public static function destroyUnusedResources():void{}
		protected var _id:Number;
		private var _url:*;
		private var _cpuMemory:*;
		private var _gpuMemory:*;
		private var _destroyed:*;
		protected var _referenceCount:Number;
		public var lock:Boolean;
		public var name:String;
		public function get id():Number{};
		public function get url():String{};
		public function get cpuMemory():Number{};
		public function get gpuMemory():Number{};
		public function get destroyed():Boolean{};
		public function get referenceCount():Number{};

		public function Resource(){}
		public function _setCreateURL(url:String):void{}
		protected function _recoverResource():void{}
		protected function _disposeResource():void{}
		protected function _activeResource():void{}
		public function destroy():void{}
	}

}
