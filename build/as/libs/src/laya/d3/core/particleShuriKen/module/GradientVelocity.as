package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.particleShuriKen.module.GradientDataNumber;
	import laya.d3.core.IClone;
	import laya.d3.math.Vector3;

	/**
	 * <code>GradientVelocity</code> 类用于创建渐变速度。
	 */
	public class GradientVelocity implements IClone {

		/**
		 * 通过固定速度创建一个 <code>GradientVelocity</code> 实例。
		 * @param constant 固定速度。
		 * @return 渐变速度。
		 */
		public static function createByConstant(constant:Vector3):GradientVelocity{
			return null;
		}

		/**
		 * 通过渐变速度创建一个 <code>GradientVelocity</code> 实例。
		 * @param gradientX 渐变速度X。
		 * @param gradientY 渐变速度Y。
		 * @param gradientZ 渐变速度Z。
		 * @return 渐变速度。
		 */
		public static function createByGradient(gradientX:GradientDataNumber,gradientY:GradientDataNumber,gradientZ:GradientDataNumber):GradientVelocity{
			return null;
		}

		/**
		 * 通过随机双固定速度创建一个 <code>GradientVelocity</code> 实例。
		 * @param constantMin 最小固定角速度。
		 * @param constantMax 最大固定角速度。
		 * @return 渐变速度。
		 */
		public static function createByRandomTwoConstant(constantMin:Vector3,constantMax:Vector3):GradientVelocity{
			return null;
		}

		/**
		 * 通过随机双渐变速度创建一个 <code>GradientVelocity</code> 实例。
		 * @param gradientXMin X轴最小渐变速度。
		 * @param gradientXMax X轴最大渐变速度。
		 * @param gradientYMin Y轴最小渐变速度。
		 * @param gradientYMax Y轴最大渐变速度。
		 * @param gradientZMin Z轴最小渐变速度。
		 * @param gradientZMax Z轴最大渐变速度。
		 * @return 渐变速度。
		 */
		public static function createByRandomTwoGradient(gradientXMin:GradientDataNumber,gradientXMax:GradientDataNumber,gradientYMin:GradientDataNumber,gradientYMax:GradientDataNumber,gradientZMin:GradientDataNumber,gradientZMax:GradientDataNumber):GradientVelocity{
			return null;
		}
		private var _type:*;
		private var _constant:*;
		private var _gradientX:*;
		private var _gradientY:*;
		private var _gradientZ:*;
		private var _constantMin:*;
		private var _constantMax:*;
		private var _gradientXMin:*;
		private var _gradientXMax:*;
		private var _gradientYMin:*;
		private var _gradientYMax:*;
		private var _gradientZMin:*;
		private var _gradientZMax:*;

		/**
		 * 生命周期速度类型，0常量模式，1曲线模式，2随机双常量模式，3随机双曲线模式。
		 */
		public function get type():Number{
				return null;
		}

		/**
		 * 固定速度。
		 */
		public function get constant():Vector3{
				return null;
		}

		/**
		 * 渐变速度X。
		 */
		public function get gradientX():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变速度Y。
		 */
		public function get gradientY():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变速度Z。
		 */
		public function get gradientZ():GradientDataNumber{
				return null;
		}

		/**
		 * 最小固定速度。
		 */
		public function get constantMin():Vector3{
				return null;
		}

		/**
		 * 最大固定速度。
		 */
		public function get constantMax():Vector3{
				return null;
		}

		/**
		 * 渐变最小速度X。
		 */
		public function get gradientXMin():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变最大速度X。
		 */
		public function get gradientXMax():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变最小速度Y。
		 */
		public function get gradientYMin():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变最大速度Y。
		 */
		public function get gradientYMax():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变最小速度Z。
		 */
		public function get gradientZMin():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变最大速度Z。
		 */
		public function get gradientZMax():GradientDataNumber{
				return null;
		}

		/**
		 * 创建一个 <code>GradientVelocity,不允许new，请使用静态创建函数。</code> 实例。
		 */

		public function GradientVelocity(){}

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
