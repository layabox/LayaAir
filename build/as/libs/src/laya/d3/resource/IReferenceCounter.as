package laya.d3.resource {

	/**
	 * <code>IReferenceCounter</code> 引用计数器接口。
	 */
	public interface IReferenceCounter {

		/**
		 * 获得引用计数
		 */
		function _getReferenceCount():Number;

		/**
		 * 增加引用计数
		 */
		function _addReference(count:Number):void;

		/**
		 * 删除引用计数
		 */
		function _removeReference(count:Number):void;

		/**
		 * 清除引用计数
		 */
		function _clearReference():void;
	}

}
