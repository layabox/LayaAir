package laya.ui {
	import laya.display.Sprite;
	import laya.filters.IFilter;

	/**
	 * <code>UIUtils</code> 是文本工具集。
	 */
	public class UIUtils {
		private static var grayFilter:*;

		/**
		 * 需要替换的转义字符表
		 */
		public static var escapeSequence:*;

		/**
		 * 用字符串填充数组，并返回数组副本。
		 * @param arr 源数组对象。
		 * @param str 用逗号连接的字符串。如"p1,p2,p3,p4"。
		 * @param type 如果值不为null，则填充的是新增值得类型。
		 * @return 填充后的数组。
		 */
		public static function fillArray(arr:Array,str:String,type:* = null):Array{
			return null;
		}

		/**
		 * 转换uint类型颜色值为字符型颜色值。
		 * @param color uint颜色值。
		 * @return 字符型颜色值。
		 */
		public static function toColor(color:Number):String{
			return null;
		}

		/**
		 * 给指定的目标显示对象添加或移除灰度滤镜。
		 * @param traget 目标显示对象。
		 * @param isGray 如果值true，则添加灰度滤镜，否则移除灰度滤镜。
		 */
		public static function gray(traget:Sprite,isGray:Boolean = null):void{}

		/**
		 * 给指定的目标显示对象添加滤镜。
		 * @param target 目标显示对象。
		 * @param filter 滤镜对象。
		 */
		public static function addFilter(target:Sprite,filter:IFilter):void{}

		/**
		 * 移除目标显示对象的指定类型滤镜。
		 * @param target 目标显示对象。
		 * @param filterType 滤镜类型。
		 */
		public static function clearFilter(target:Sprite,filterType:Class):void{}

		/**
		 * 获取当前要替换的转移字符
		 * @param word 
		 * @return 
		 */
		private static var _getReplaceStr:*;

		/**
		 * 替换字符串中的转义字符
		 * @param str 
		 */
		public static function adptString(str:String):String{
			return null;
		}

		/**
		 * @private 
		 */
		private static var _funMap:*;

		/**
		 * @private 根据字符串，返回函数表达式
		 */
		public static function getBindFun(value:String):Function{
			return null;
		}
	}

}
