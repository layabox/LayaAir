/*[IF-FLASH]*/
package laya.layagl {
	improt laya.resource.Context;
	public class QuickTestTool {
		private static var showedDic:*;
		private static var _rendertypeToStrDic:*;
		private static var _typeToNameDic:*;
		public static function getMCDName(type:Number):String{}
		public static function showRenderTypeInfo(type:*,force:Boolean = null):void{}
		public static function __init__():void{}
		public var _renderType:Number;
		public var _repaint:Number;
		public var _x:Number;
		public var _y:Number;

		public function QuickTestTool(){}
		public function render(context:Context,x:Number,y:Number):void{}
		private static var _PreStageRender:*;
		private static var _countDic:*;
		private static var _countStart:*;
		private static var _i:*;
		private static var _countEnd:*;
		public static function showCountInfo():void{}
		public static function enableQuickTest():void{}
	}

}
