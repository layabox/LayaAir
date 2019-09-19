package laya.d3.resource {

	/**
	 * <code>IReferenceCounter</code> 引用计数器接口。
	 */
	public interface IReferenceCounter {
		function _getReferenceCount():Number;
		function _addReference(count:Number):void;
		function _removeReference(count:Number):void;
		function _clearReference():void;
	}

}
