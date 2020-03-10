package laya.d3.core {

	/**
	 * @private <code>IClone</code> 资源克隆接口。
	 */
	public interface IClone {
		function clone():*;
		function cloneTo(destObject:*):void;
	}

}
