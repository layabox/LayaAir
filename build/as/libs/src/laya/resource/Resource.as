package laya.resource {
	import laya.events.EventDispatcher;
	import laya.resource.ICreateResource;
	import laya.resource.IDestroy;

	/**
	 * <code>Resource</code> 资源存取类。
	 */
	public class Resource extends EventDispatcher implements ICreateResource,IDestroy {

		/**
		 * @private 
		 */
		private static var _uniqueIDCounter:*;

		/**
		 * @private 
		 */
		private static var _idResourcesMap:*;

		/**
		 * @private 
		 */
		private static var _urlResourcesMap:*;

		/**
		 * @private 以字节为单位。
		 */
		private static var _cpuMemory:*;

		/**
		 * @private 以字节为单位。
		 */
		private static var _gpuMemory:*;

		/**
		 * 当前内存，以字节为单位。
		 */
		public static function get cpuMemory():Number{
				return null;
		}

		/**
		 * 当前显存，以字节为单位。
		 */
		public static function get gpuMemory():Number{
				return null;
		}

		/**
		 * 通过资源ID返回已载入资源。
		 * @param id 资源ID
		 * @return 资源 <code>Resource</code> 对象。
		 */
		public static function getResourceByID(id:Number):Resource{
			return null;
		}

		/**
		 * 通过url返回已载入资源。
		 * @param url 资源URL
		 * @param index 索引
		 * @return 资源 <code>Resource</code> 对象。
		 */
		public static function getResourceByURL(url:String,index:Number = null):Resource{
			return null;
		}

		/**
		 * 销毁当前没有被使用的资源,该函数会忽略lock=true的资源。
		 * @param group 指定分组。
		 */
		public static function destroyUnusedResources():void{}

		/**
		 * @private 
		 */
		protected var _id:Number;

		/**
		 * @private 
		 */
		private var _url:*;

		/**
		 * @private 
		 */
		private var _cpuMemory:*;

		/**
		 * @private 
		 */
		private var _gpuMemory:*;

		/**
		 * @private 
		 */
		private var _destroyed:*;

		/**
		 * @private 
		 */
		protected var _referenceCount:Number;

		/**
		 * 是否加锁，如果true为不能使用自动释放机制。
		 */
		public var lock:Boolean;

		/**
		 * 名称。
		 */
		public var name:String;

		/**
		 * 获取唯一标识ID,通常用于识别。
		 */
		public function get id():Number{
				return null;
		}

		/**
		 * 获取资源的URL地址。
		 * @return URL地址。
		 */
		public function get url():String{
				return null;
		}

		/**
		 * 内存大小。
		 */
		public function get cpuMemory():Number{
				return null;
		}

		/**
		 * 显存大小。
		 */
		public function get gpuMemory():Number{
				return null;
		}

		/**
		 * 是否已处理。
		 */
		public function get destroyed():Boolean{
				return null;
		}

		/**
		 * 获取资源的引用计数。
		 */
		public function get referenceCount():Number{
				return null;
		}

		/**
		 * 创建一个 <code>Resource</code> 实例。
		 */

		public function Resource(){}

		/**
		 * @private 
		 */
		public function _setCreateURL(url:String):void{}

		/**
		 * @private 
		 */
		protected function _recoverResource():void{}

		/**
		 * @private 
		 */
		protected function _disposeResource():void{}

		/**
		 * @private 
		 */
		protected function _activeResource():void{}

		/**
		 * 销毁资源,销毁后资源不能恢复。
		 */
		public function destroy():void{}
	}

}
