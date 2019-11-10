package laya.utils {
	import laya.utils.Handler;
	import laya.display.Node;

	/**
	 * <code>ClassUtils</code> 是一个类工具类。
	 */
	public class ClassUtils {

		/**
		 * @private 
		 */
		private static var DrawTypeDic:*;

		/**
		 * @private 
		 */
		private static var _temParam:*;

		/**
		 * @private 
		 */
		private static var _classMap:*;

		/**
		 * @private 
		 */
		private static var _tM:*;

		/**
		 * @private 
		 */
		private static var _alpha:*;

		/**
		 * 注册 Class 映射，方便在class反射时获取。
		 * @param className 映射的名字或者别名。
		 * @param classDef 类的全名或者类的引用，全名比如:"laya.display.Sprite"。
		 */
		public static function regClass(className:String,classDef:*):void{}

		/**
		 * 根据类名短名字注册类，比如传入[Sprite]，功能同regClass("Sprite",Sprite);
		 * @param classes 类数组
		 */
		public static function regShortClassName(classes:Array):void{}

		/**
		 * 返回注册的 Class 映射。
		 * @param className 映射的名字。
		 */
		public static function getRegClass(className:String):*{}

		/**
		 * 根据名字返回类对象。
		 * @param className 类名(比如laya.display.Sprite)或者注册的别名(比如Sprite)。
		 * @return 类对象
		 */
		public static function getClass(className:String):*{}

		/**
		 * 根据名称创建 Class 实例。
		 * @param className 类名(比如laya.display.Sprite)或者注册的别名(比如Sprite)。
		 * @return 返回类的实例。
		 */
		public static function getInstance(className:String):*{}

		/**
		 * 根据指定的 json 数据创建节点对象。
		 * 比如:
		 * {
		 *  	"type":"Sprite",
		 *  	"props":{
		 *  		"x":100,
		 *  		"y":50,
		 *  		"name":"item1",
		 *  		"scale":[2,2]
		 *  	},
		 *  	"customProps":{
		 *  		"x":100,
		 *  		"y":50,
		 *  		"name":"item1",
		 *  		"scale":[2,2]
		 *  	},
		 *  	"child":[
		 *  		{
		 *  			"type":"Text",
		 *  			"props":{
		 *  				"text":"this is a test",
		 *  				"var":"label",
		 *  				"rumtime":""
		 *  			}
		 *  		}
		 *  	]
		 * }
		 * @param json json字符串或者Object对象。
		 * @param node node节点，如果为空，则新创建一个。
		 * @param root 根节点，用来设置var定义。
		 * @return 生成的节点。
		 */
		public static function createByJson(json:*,node:* = null,root:Node = null,customHandler:Handler = null,instanceHandler:Handler = null):*{}

		/**
		 * @private 
		 */
		private static var _getGraphicsFromSprite:*;

		/**
		 * @private 
		 */
		private static var _getTransformData:*;

		/**
		 * @private 
		 */
		private static var _addGraphicToGraphics:*;

		/**
		 * @private 
		 */
		private static var _adptLineData:*;

		/**
		 * @private 
		 */
		private static var _adptTextureData:*;

		/**
		 * @private 
		 */
		private static var _adptLinesData:*;

		/**
		 * @private 
		 */
		private static var _getParams:*;

		/**
		 * @private 
		 */
		private static var _getObjVar:*;
	}

}
