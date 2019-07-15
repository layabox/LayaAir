/*[IF-FLASH]*/
package laya.webgl {
	public class WebGL {
		public static var shaderHighPrecision:Boolean;
		public static var _isWebGL2:Boolean;
		public static var isNativeRender_enable:Boolean;
		private static var _uint8ArraySlice:*;
		private static var _float32ArraySlice:*;
		private static var _uint16ArraySlice:*;
		public static function _nativeRender_enable():void{}
		public static function enable():Boolean{}
		public static function inner_enable():Boolean{}
		public static function onStageResize(width:Number,height:Number):void{}
	}

}
