package laya.resource {

	/**
	 * <code>IDestroy</code> 是对象销毁的接口。
	 */
	public interface IDestroy {
		function get destroyed():Boolean;
		function destroy():void;
	}

}
