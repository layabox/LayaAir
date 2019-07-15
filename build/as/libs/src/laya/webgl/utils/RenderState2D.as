/*[IF-FLASH]*/
package laya.webgl.utils {
	improt laya.maths.Matrix;
	improt laya.webgl.shader.d2.ShaderDefines2D;
	public class RenderState2D {
		public static var _MAXSIZE:Number;
		public static var EMPTYMAT4_ARRAY:Array;
		public static var TEMPMAT4_ARRAY:Array;
		public static var worldMatrix4:Array;
		public static var worldMatrix:Matrix;
		public static var matWVP:*;
		public static var worldAlpha:Number;
		public static var worldScissorTest:Boolean;
		public static var worldShaderDefines:ShaderDefines2D;
		public static var worldFilters:Array;
		public static var width:Number;
		public static var height:Number;
		public static function mat2MatArray(mat:Matrix,matArray:Array):Array{}
		public static function restoreTempArray():void{}
		public static function clear():void{}
	}

}
