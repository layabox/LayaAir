package laya.utils {

	/**
	 * @private 场景辅助类
	 */
	public class SceneUtils {

		/**
		 * @private 
		 */
		private static var _funMap:*;

		/**
		 * @private 
		 */
		private static var _parseWatchData:*;

		/**
		 * @private 
		 */
		private static var _parseKeyWord:*;
		public static function __init():void{}

		/**
		 * @private 根据字符串，返回函数表达式
		 */
		public static function getBindFun(value:String):Function{
			return null;
		}

		/**
		 * @private 通过视图数据创建视图。
		 * @param uiView 视图数据信息。
		 */
		public static function createByData(root:*,uiView:*):*{}
		public static function createInitTool():InitTool{
			return null;
		}

		/**
		 * 根据UI数据实例化组件。
		 * @param uiView UI数据。
		 * @param comp 组件本体，如果为空，会新创建一个。
		 * @param view 组件所在的视图实例，用来注册var全局变量，如果值为空则不注册。
		 * @return 一个 Component 对象。
		 */
		public static function createComp(uiView:*,comp:* = null,view:* = null,dataMap:Array = null,initTool:InitTool = null):*{}

		/**
		 * @private 设置组件的属性值。
		 * @param comp 组件实例。
		 * @param prop 属性名称。
		 * @param value 属性值。
		 * @param view 组件所在的视图实例，用来注册var全局变量，如果值为空则不注册。
		 */
		private static var setCompValue:*;

		/**
		 * @private 通过组建UI数据，获取组件实例。
		 * @param json UI数据。
		 * @return Component 对象。
		 */
		public static function getCompInstance(json:*):*{}
	}

}
