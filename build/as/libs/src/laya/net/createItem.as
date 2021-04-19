package laya.net {
	public interface createItem {
		var url:String;

		/**
		 * 资源类型
		 */
		var type:String;
		var priority:Number;
		var group:String;

		/**
		 * 资源属性参数。
		 */
		var propertyParams:Array;

		/**
		 * 资源构造函数参数。
		 */
		var constructParams:Array;
		var progress:Number;
	}

}
