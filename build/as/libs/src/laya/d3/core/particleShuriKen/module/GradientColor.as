package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.Gradient;
	import laya.d3.core.IClone;
	import laya.d3.math.Vector4;

	/**
	 * <code>GradientColor</code> 类用于创建渐变颜色。
	 */
	public class GradientColor implements IClone {

		/**
		 * 通过固定颜色创建一个 <code>GradientColor</code> 实例。
		 * @param constant 固定颜色。
		 */
		public static function createByConstant(constant:Vector4):GradientColor{
			return null;
		}

		/**
		 * 通过渐变颜色创建一个 <code>GradientColor</code> 实例。
		 * @param gradient 渐变色。
		 */
		public static function createByGradient(gradient:Gradient):GradientColor{
			return null;
		}

		/**
		 * 通过随机双固定颜色创建一个 <code>GradientColor</code> 实例。
		 * @param minConstant 最小固定颜色。
		 * @param maxConstant 最大固定颜色。
		 */
		public static function createByRandomTwoConstant(minConstant:Vector4,maxConstant:Vector4):GradientColor{
			return null;
		}

		/**
		 * 通过随机双渐变颜色创建一个 <code>GradientColor</code> 实例。
		 * @param minGradient 最小渐变颜色。
		 * @param maxGradient 最大渐变颜色。
		 */
		public static function createByRandomTwoGradient(minGradient:Gradient,maxGradient:Gradient):GradientColor{
			return null;
		}
		private var _type:*;
		private var _constant:*;
		private var _constantMin:*;
		private var _constantMax:*;
		private var _gradient:*;
		private var _gradientMin:*;
		private var _gradientMax:*;

		/**
		 * 生命周期颜色类型,0为固定颜色模式,1渐变模式,2为随机双固定颜色模式,3随机双渐变模式。
		 */
		public function get type():Number{
				return null;
		}

		/**
		 * 固定颜色。
		 */
		public function get constant():Vector4{
				return null;
		}

		/**
		 * 最小固定颜色。
		 */
		public function get constantMin():Vector4{
				return null;
		}

		/**
		 * 最大固定颜色。
		 */
		public function get constantMax():Vector4{
				return null;
		}

		/**
		 * 渐变颜色。
		 */
		public function get gradient():Gradient{
				return null;
		}

		/**
		 * 最小渐变颜色。
		 */
		public function get gradientMin():Gradient{
				return null;
		}

		/**
		 * 最大渐变颜色。
		 */
		public function get gradientMax():Gradient{
				return null;
		}

		/**
		 * 创建一个 <code>GradientColor,不允许new，请使用静态创建函数。</code> 实例。
		 */

		public function GradientColor(){}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
	}

}
