package laya.webgl.canvas.save {
	import laya.webgl.canvas.save.ISaveData;
	import laya.resource.Context;
	public class SaveBase implements ISaveData {
		public static var TYPE_ALPHA:Number;
		public static var TYPE_FILESTYLE:Number;
		public static var TYPE_FONT:Number;
		public static var TYPE_LINEWIDTH:Number;
		public static var TYPE_STROKESTYLE:Number;
		public static var TYPE_MARK:Number;
		public static var TYPE_TRANSFORM:Number;
		public static var TYPE_TRANSLATE:Number;
		public static var TYPE_ENABLEMERGE:Number;
		public static var TYPE_TEXTBASELINE:Number;
		public static var TYPE_TEXTALIGN:Number;
		public static var TYPE_GLOBALCOMPOSITEOPERATION:Number;
		public static var TYPE_CLIPRECT:Number;
		public static var TYPE_CLIPRECT_STENCIL:Number;
		public static var TYPE_IBVB:Number;
		public static var TYPE_SHADER:Number;
		public static var TYPE_FILTERS:Number;
		public static var TYPE_FILTERS_TYPE:Number;
		public static var TYPE_COLORFILTER:Number;
		private static var POOL:*;
		private static var _namemap:*;
		private var _valueName:*;
		private var _value:*;
		private var _dataObj:*;
		private var _newSubmit:*;

		public function SaveBase(){}
		public function isSaveMark():Boolean{
			return null;
		}
		public function restore(context:Context):void{}
		public static function save(context:Context,type:Number,dataObj:*,newSubmit:Boolean):void{}
	}

}
