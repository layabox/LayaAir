/*[IF-FLASH]*/
package laya.ui {
	improt laya.display.Sprite;
	improt laya.filters.IFilter;
	public class UIUtils {
		private static var grayFilter:*;
		public static var escapeSequence:*;
		public static function fillArray(arr:Array,str:String,type:* = null):Array{}
		public static function toColor(color:Number):String{}
		public static function gray(traget:Sprite,isGray:Boolean = null):void{}
		public static function addFilter(target:Sprite,filter:IFilter):void{}
		public static function clearFilter(target:Sprite,filterType:Class):void{}
		private static var _getReplaceStr:*;
		public static function adptString(str:String):String{}
		private static var _funMap:*;
		public static function getBindFun(value:String):Function{}
	}

}
