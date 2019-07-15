/*[IF-FLASH]*/
package laya.d3.core.material {
	improt laya.d3.core.IClone;
	improt laya.d3.math.Vector4;
	public class RenderState implements laya.d3.core.IClone {
		public static var CULL_NONE:Number;
		public static var CULL_FRONT:Number;
		public static var CULL_BACK:Number;
		public static var BLEND_DISABLE:Number;
		public static var BLEND_ENABLE_ALL:Number;
		public static var BLEND_ENABLE_SEPERATE:Number;
		public static var BLENDPARAM_ZERO:Number;
		public static var BLENDPARAM_ONE:Number;
		public static var BLENDPARAM_SRC_COLOR:Number;
		public static var BLENDPARAM_ONE_MINUS_SRC_COLOR:Number;
		public static var BLENDPARAM_DST_COLOR:Number;
		public static var BLENDPARAM_ONE_MINUS_DST_COLOR:Number;
		public static var BLENDPARAM_SRC_ALPHA:Number;
		public static var BLENDPARAM_ONE_MINUS_SRC_ALPHA:Number;
		public static var BLENDPARAM_DST_ALPHA:Number;
		public static var BLENDPARAM_ONE_MINUS_DST_ALPHA:Number;
		public static var BLENDPARAM_SRC_ALPHA_SATURATE:Number;
		public static var BLENDEQUATION_ADD:Number;
		public static var BLENDEQUATION_SUBTRACT:Number;
		public static var BLENDEQUATION_REVERSE_SUBTRACT:Number;
		public static var DEPTHTEST_OFF:Number;
		public static var DEPTHTEST_NEVER:Number;
		public static var DEPTHTEST_LESS:Number;
		public static var DEPTHTEST_EQUAL:Number;
		public static var DEPTHTEST_LEQUAL:Number;
		public static var DEPTHTEST_GREATER:Number;
		public static var DEPTHTEST_NOTEQUAL:Number;
		public static var DEPTHTEST_GEQUAL:Number;
		public static var DEPTHTEST_ALWAYS:Number;
		public var cull:Number;
		public var blend:Number;
		public var srcBlend:Number;
		public var dstBlend:Number;
		public var srcBlendRGB:Number;
		public var dstBlendRGB:Number;
		public var srcBlendAlpha:Number;
		public var dstBlendAlpha:Number;
		public var blendConstColor:Vector4;
		public var blendEquation:Number;
		public var blendEquationRGB:Number;
		public var blendEquationAlpha:Number;
		public var depthTest:Number;
		public var depthWrite:Boolean;

		public function RenderState(){}
		public function cloneTo(dest:*):void{}
		public function clone():*{}
	}

}
