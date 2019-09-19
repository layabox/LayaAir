package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.particleShuriKen.module.GradientDataNumber;
	import laya.d3.core.IClone;
	import laya.d3.math.Vector3;

	/**
	 * <code>GradientRotation</code> 类用于创建渐变角速度。
	 */
	public class GradientAngularVelocity implements IClone {

		/**
		 * 通过固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param constant 固定角速度。
		 * @return 渐变角速度。
		 */
		public static function createByConstant(constant:Number):GradientAngularVelocity{
			return null;
		}

		/**
		 * 通过分轴固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param separateConstant 分轴固定角速度。
		 * @return 渐变角速度。
		 */
		public static function createByConstantSeparate(separateConstant:Vector3):GradientAngularVelocity{
			return null;
		}

		/**
		 * 通过渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param gradient 渐变角速度。
		 * @return 渐变角速度。
		 */
		public static function createByGradient(gradient:GradientDataNumber):GradientAngularVelocity{
			return null;
		}

		/**
		 * 通过分轴渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param gradientX X轴渐变角速度。
		 * @param gradientY Y轴渐变角速度。
		 * @param gradientZ Z轴渐变角速度。
		 * @return 渐变角速度。
		 */
		public static function createByGradientSeparate(gradientX:GradientDataNumber,gradientY:GradientDataNumber,gradientZ:GradientDataNumber):GradientAngularVelocity{
			return null;
		}

		/**
		 * 通过随机双固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param constantMin 最小固定角速度。
		 * @param constantMax 最大固定角速度。
		 * @return 渐变角速度。
		 */
		public static function createByRandomTwoConstant(constantMin:Number,constantMax:Number):GradientAngularVelocity{
			return null;
		}

		/**
		 * 通过随机分轴双固定角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param separateConstantMin 最小分轴固定角速度。
		 * @param separateConstantMax 最大分轴固定角速度。
		 * @return 渐变角速度。
		 */
		public static function createByRandomTwoConstantSeparate(separateConstantMin:Vector3,separateConstantMax:Vector3):GradientAngularVelocity{
			return null;
		}

		/**
		 * 通过随机双渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param gradientMin 最小渐变角速度。
		 * @param gradientMax 最大渐变角速度。
		 * @return 渐变角速度。
		 */
		public static function createByRandomTwoGradient(gradientMin:GradientDataNumber,gradientMax:GradientDataNumber):GradientAngularVelocity{
			return null;
		}

		/**
		 * 通过分轴随机双渐变角速度创建一个 <code>GradientAngularVelocity</code> 实例。
		 * @param gradientXMin 最小X轴渐变角速度。
		 * @param gradientXMax 最大X轴渐变角速度。
		 * @param gradientYMin 最小Y轴渐变角速度。
		 * @param gradientYMax 最大Y轴渐变角速度。
		 * @param gradientZMin 最小Z轴渐变角速度。
		 * @param gradientZMax 最大Z轴渐变角速度。
		 * @return 渐变角速度。
		 */
		public static function createByRandomTwoGradientSeparate(gradientXMin:GradientDataNumber,gradientXMax:GradientDataNumber,gradientYMin:GradientDataNumber,gradientYMax:GradientDataNumber,gradientZMin:GradientDataNumber,gradientZMax:GradientDataNumber,gradientWMin:GradientDataNumber,gradientWMax:GradientDataNumber):GradientAngularVelocity{
			return null;
		}
		private var _type:*;
		private var _separateAxes:*;
		private var _constant:*;
		private var _constantSeparate:*;
		private var _gradient:*;
		private var _gradientX:*;
		private var _gradientY:*;
		private var _gradientZ:*;
		private var _gradientW:*;
		private var _constantMin:*;
		private var _constantMax:*;
		private var _constantMinSeparate:*;
		private var _constantMaxSeparate:*;
		private var _gradientMin:*;
		private var _gradientMax:*;
		private var _gradientXMin:*;
		private var _gradientXMax:*;
		private var _gradientYMin:*;
		private var _gradientYMax:*;
		private var _gradientZMin:*;
		private var _gradientZMax:*;
		private var _gradientWMin:*;
		private var _gradientWMax:*;

		/**
		 * 生命周期角速度类型,0常量模式，1曲线模式，2随机双常量模式，3随机双曲线模式。
		 */
		public function get type():Number{
				return null;
		}

		/**
		 * 是否分轴。
		 */
		public function get separateAxes():Boolean{
				return null;
		}

		/**
		 * 固定角速度。
		 */
		public function get constant():Number{
				return null;
		}

		/**
		 * 分轴固定角速度。
		 */
		public function get constantSeparate():Vector3{
				return null;
		}

		/**
		 * 渐变角速度。
		 */
		public function get gradient():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变角角速度X。
		 */
		public function get gradientX():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变角速度Y。
		 */
		public function get gradientY():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变角速度Z。
		 */
		public function get gradientZ():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变角速度Z。
		 */
		public function get gradientW():GradientDataNumber{
				return null;
		}

		/**
		 * 最小随机双固定角速度。
		 */
		public function get constantMin():Number{
				return null;
		}

		/**
		 * 最大随机双固定角速度。
		 */
		public function get constantMax():Number{
				return null;
		}

		/**
		 * 最小分轴随机双固定角速度。
		 */
		public function get constantMinSeparate():Vector3{
				return null;
		}

		/**
		 * 最大分轴随机双固定角速度。
		 */
		public function get constantMaxSeparate():Vector3{
				return null;
		}

		/**
		 * 最小渐变角速度。
		 */
		public function get gradientMin():GradientDataNumber{
				return null;
		}

		/**
		 * 最大渐变角速度。
		 */
		public function get gradientMax():GradientDataNumber{
				return null;
		}

		/**
		 * 最小渐变角速度X。
		 */
		public function get gradientXMin():GradientDataNumber{
				return null;
		}

		/**
		 * 最大渐变角速度X。
		 */
		public function get gradientXMax():GradientDataNumber{
				return null;
		}

		/**
		 * 最小渐变角速度Y。
		 */
		public function get gradientYMin():GradientDataNumber{
				return null;
		}

		/**
		 * 最大渐变角速度Y。
		 */
		public function get gradientYMax():GradientDataNumber{
				return null;
		}

		/**
		 * 最小渐变角速度Z。
		 */
		public function get gradientZMin():GradientDataNumber{
				return null;
		}

		/**
		 * 最大渐变角速度Z。
		 */
		public function get gradientZMax():GradientDataNumber{
				return null;
		}

		/**
		 * 最小渐变角速度Z。
		 */
		public function get gradientWMin():GradientDataNumber{
				return null;
		}

		/**
		 * 最大渐变角速度Z。
		 */
		public function get gradientWMax():GradientDataNumber{
				return null;
		}

		/**
		 * 创建一个 <code>GradientAngularVelocity,不允许new，请使用静态创建函数。</code> 实例。
		 */

		public function GradientAngularVelocity(){}

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
