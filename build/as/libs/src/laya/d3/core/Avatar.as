package laya.d3.core {
	import laya.d3.core.IClone;
	import laya.d3.component.Animator;
	import laya.resource.Resource;
	import laya.utils.Handler;

	/**
	 * <code>Avatar</code> 类用于创建Avatar。
	 */
	public class Avatar extends Resource implements IClone {

		/**
		 * Avatar资源。
		 */
		public static var AVATAR:String;

		/**
		 * @inheritDoc 
		 */
		public static function _parse(data:*,propertyParams:* = null,constructParams:Array = null):Avatar{
			return null;
		}

		/**
		 * 加载Avatar文件。
		 * @param url Avatar文件。
		 * @param complete 完成回掉。
		 */
		public static function load(url:String,complete:Handler):void{}

		/**
		 * [NATIVE]
		 */
		private var _nativeNodeCount:*;

		/**
		 * 创建一个 <code>Avatar</code> 实例。
		 */

		public function Avatar(){}
		private var _initCloneToAnimator:*;
		private var _parseNode:*;

		/**
		 * 克隆数据到Avatr。
		 * @param destObject 克隆源。
		 */
		public function _cloneDatasToAnimator(destAnimator:Animator):void{}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
	}

}
