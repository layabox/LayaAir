package laya.d3.core.material {
	import laya.d3.core.IClone;
	import laya.d3.math.Vector4;

	/**
	 * <code>RenderState</code> 类用于控制渲染状态。
	 */
	public class RenderState implements IClone {

		/**
		 * 剔除枚举_不剔除。
		 */
		public static var CULL_NONE:Number;

		/**
		 * 剔除枚举_剔除正面。
		 */
		public static var CULL_FRONT:Number;

		/**
		 * 剔除枚举_剔除背面。
		 */
		public static var CULL_BACK:Number;

		/**
		 * 混合枚举_禁用。
		 */
		public static var BLEND_DISABLE:Number;

		/**
		 * 混合枚举_启用_RGB和Alpha统一混合。
		 */
		public static var BLEND_ENABLE_ALL:Number;

		/**
		 * 混合枚举_启用_RGB和Alpha单独混合。
		 */
		public static var BLEND_ENABLE_SEPERATE:Number;

		/**
		 * 混合参数枚举_零,例：RGB(0,0,0),Alpha:(1)。
		 */
		public static var BLENDPARAM_ZERO:Number;

		/**
		 * 混合参数枚举_一,例：RGB(1,1,1),Alpha:(1)。
		 */
		public static var BLENDPARAM_ONE:Number;

		/**
		 * 混合参数枚举_源颜色,例：RGB(Rs, Gs, Bs)，Alpha(As)。
		 */
		public static var BLENDPARAM_SRC_COLOR:Number;

		/**
		 * 混合参数枚举_一减源颜色,例：RGB(1-Rs, 1-Gs, 1-Bs)，Alpha(1-As)。
		 */
		public static var BLENDPARAM_ONE_MINUS_SRC_COLOR:Number;

		/**
		 * 混合参数枚举_目标颜色,例：RGB(Rd, Gd, Bd),Alpha(Ad)。
		 */
		public static var BLENDPARAM_DST_COLOR:Number;

		/**
		 * 混合参数枚举_一减目标颜色,例：RGB(1-Rd, 1-Gd, 1-Bd)，Alpha(1-Ad)。
		 */
		public static var BLENDPARAM_ONE_MINUS_DST_COLOR:Number;

		/**
		 * 混合参数枚举_源透明,例:RGB(As, As, As),Alpha(1-As)。
		 */
		public static var BLENDPARAM_SRC_ALPHA:Number;

		/**
		 * 混合参数枚举_一减源阿尔法,例:RGB(1-As, 1-As, 1-As),Alpha(1-As)。
		 */
		public static var BLENDPARAM_ONE_MINUS_SRC_ALPHA:Number;

		/**
		 * 混合参数枚举_目标阿尔法，例：RGB(Ad, Ad, Ad),Alpha(Ad)。
		 */
		public static var BLENDPARAM_DST_ALPHA:Number;

		/**
		 * 混合参数枚举_一减目标阿尔法,例：RGB(1-Ad, 1-Ad, 1-Ad),Alpha(Ad)。
		 */
		public static var BLENDPARAM_ONE_MINUS_DST_ALPHA:Number;

		/**
		 * 混合参数枚举_阿尔法饱和，例：RGB(min(As, 1 - Ad), min(As, 1 - Ad), min(As, 1 - Ad)),Alpha(1)。
		 */
		public static var BLENDPARAM_SRC_ALPHA_SATURATE:Number;

		/**
		 * 混合方程枚举_加法,例：source + destination
		 */
		public static var BLENDEQUATION_ADD:Number;

		/**
		 * 混合方程枚举_减法，例：source - destination
		 */
		public static var BLENDEQUATION_SUBTRACT:Number;

		/**
		 * 混合方程枚举_反序减法，例：destination - source
		 */
		public static var BLENDEQUATION_REVERSE_SUBTRACT:Number;

		/**
		 * 深度测试函数枚举_关闭深度测试。
		 */
		public static var DEPTHTEST_OFF:Number;

		/**
		 * 深度测试函数枚举_从不通过。
		 */
		public static var DEPTHTEST_NEVER:Number;

		/**
		 * 深度测试函数枚举_小于时通过。
		 */
		public static var DEPTHTEST_LESS:Number;

		/**
		 * 深度测试函数枚举_等于时通过。
		 */
		public static var DEPTHTEST_EQUAL:Number;

		/**
		 * 深度测试函数枚举_小于等于时通过。
		 */
		public static var DEPTHTEST_LEQUAL:Number;

		/**
		 * 深度测试函数枚举_大于时通过。
		 */
		public static var DEPTHTEST_GREATER:Number;

		/**
		 * 深度测试函数枚举_不等于时通过。
		 */
		public static var DEPTHTEST_NOTEQUAL:Number;

		/**
		 * 深度测试函数枚举_大于等于时通过。
		 */
		public static var DEPTHTEST_GEQUAL:Number;

		/**
		 * 深度测试函数枚举_总是通过。
		 */
		public static var DEPTHTEST_ALWAYS:Number;

		/**
		 * 渲染剔除状态。
		 */
		public var cull:Number;

		/**
		 * 透明混合。
		 */
		public var blend:Number;

		/**
		 * 源混合参数,在blend为BLEND_ENABLE_ALL时生效。
		 */
		public var srcBlend:Number;

		/**
		 * 目标混合参数,在blend为BLEND_ENABLE_ALL时生效。
		 */
		public var dstBlend:Number;

		/**
		 * RGB源混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。
		 */
		public var srcBlendRGB:Number;

		/**
		 * RGB目标混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。
		 */
		public var dstBlendRGB:Number;

		/**
		 * Alpha源混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。
		 */
		public var srcBlendAlpha:Number;

		/**
		 * Alpha目标混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。
		 */
		public var dstBlendAlpha:Number;

		/**
		 * 混合常量颜色。
		 */
		public var blendConstColor:Vector4;

		/**
		 * 混合方程。
		 */
		public var blendEquation:Number;

		/**
		 * RGB混合方程。
		 */
		public var blendEquationRGB:Number;

		/**
		 * Alpha混合方程。
		 */
		public var blendEquationAlpha:Number;

		/**
		 * 深度测试函数。
		 */
		public var depthTest:Number;

		/**
		 * 是否深度写入。
		 */
		public var depthWrite:Boolean;

		/**
		 * 创建一个 <code>RenderState</code> 实例。
		 */

		public function RenderState(){}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(dest:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
	}

}
