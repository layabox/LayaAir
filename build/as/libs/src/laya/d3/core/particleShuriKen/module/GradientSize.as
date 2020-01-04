package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.particleShuriKen.module.GradientDataNumber;
	import laya.d3.core.IClone;
	import laya.d3.math.Vector3;

	/**
	 * <code>GradientSize</code> 类用于创建渐变尺寸。
	 */
	public class GradientSize implements IClone {

		/**
		 * 通过渐变尺寸创建一个 <code>GradientSize</code> 实例。
		 * @param gradient 渐变尺寸。
		 * @return 渐变尺寸。
		 */
		public static function createByGradient(gradient:GradientDataNumber):GradientSize{
			return null;
		}

		/**
		 * 通过分轴渐变尺寸创建一个 <code>GradientSize</code> 实例。
		 * @param gradientX 渐变尺寸X。
		 * @param gradientY 渐变尺寸Y。
		 * @param gradientZ 渐变尺寸Z。
		 * @return 渐变尺寸。
		 */
		public static function createByGradientSeparate(gradientX:GradientDataNumber,gradientY:GradientDataNumber,gradientZ:GradientDataNumber):GradientSize{
			return null;
		}

		/**
		 * 通过随机双固定尺寸创建一个 <code>GradientSize</code> 实例。
		 * @param constantMin 最小固定尺寸。
		 * @param constantMax 最大固定尺寸。
		 * @return 渐变尺寸。
		 */
		public static function createByRandomTwoConstant(constantMin:Number,constantMax:Number):GradientSize{
			return null;
		}

		/**
		 * 通过分轴随机双固定尺寸创建一个 <code>GradientSize</code> 实例。
		 * @param constantMinSeparate 分轴最小固定尺寸.
		 * @param constantMaxSeparate 分轴最大固定尺寸。
		 * @return 渐变尺寸。
		 */
		public static function createByRandomTwoConstantSeparate(constantMinSeparate:Vector3,constantMaxSeparate:Vector3):GradientSize{
			return null;
		}

		/**
		 * 通过随机双渐变尺寸创建一个 <code>GradientSize</code> 实例。
		 * @param gradientMin 最小渐变尺寸。
		 * @param gradientMax 最大渐变尺寸。
		 * @return 渐变尺寸。
		 */
		public static function createByRandomTwoGradient(gradientMin:GradientDataNumber,gradientMax:GradientDataNumber):GradientSize{
			return null;
		}

		/**
		 * 通过分轴随机双渐变尺寸创建一个 <code>GradientSize</code> 实例。
		 * @param gradientXMin X轴最小渐变尺寸。
		 * @param gradientXMax X轴最大渐变尺寸。
		 * @param gradientYMin Y轴最小渐变尺寸。
		 * @param gradientYMax Y轴最大渐变尺寸。
		 * @param gradientZMin Z轴最小渐变尺寸。
		 * @param gradientZMax Z轴最大渐变尺寸。
		 * @return 渐变尺寸。
		 */
		public static function createByRandomTwoGradientSeparate(gradientXMin:GradientDataNumber,gradientXMax:GradientDataNumber,gradientYMin:GradientDataNumber,gradientYMax:GradientDataNumber,gradientZMin:GradientDataNumber,gradientZMax:GradientDataNumber):GradientSize{
			return null;
		}
		private var _type:*;
		private var _separateAxes:*;
		private var _gradient:*;
		private var _gradientX:*;
		private var _gradientY:*;
		private var _gradientZ:*;
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

		/**
		 * 生命周期尺寸类型，0曲线模式，1随机双常量模式，2随机双曲线模式。
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
		 * 渐变尺寸。
		 */
		public function get gradient():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变尺寸X。
		 */
		public function get gradientX():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变尺寸Y。
		 */
		public function get gradientY():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变尺寸Z。
		 */
		public function get gradientZ():GradientDataNumber{
				return null;
		}

		/**
		 * 最小随机双固定尺寸。
		 */
		public function get constantMin():Number{
				return null;
		}

		/**
		 * 最大随机双固定尺寸。
		 */
		public function get constantMax():Number{
				return null;
		}

		/**
		 * 最小分轴随机双固定尺寸。
		 */
		public function get constantMinSeparate():Vector3{
				return null;
		}

		/**
		 * 最小分轴随机双固定尺寸。
		 */
		public function get constantMaxSeparate():Vector3{
				return null;
		}

		/**
		 * 渐变最小尺寸。
		 */
		public function get gradientMin():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变最大尺寸。
		 */
		public function get gradientMax():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变最小尺寸X。
		 */
		public function get gradientXMin():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变最大尺寸X。
		 */
		public function get gradientXMax():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变最小尺寸Y。
		 */
		public function get gradientYMin():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变最大尺寸Y。
		 */
		public function get gradientYMax():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变最小尺寸Z。
		 */
		public function get gradientZMin():GradientDataNumber{
				return null;
		}

		/**
		 * 渐变最大尺寸Z。
		 */
		public function get gradientZMax():GradientDataNumber{
				return null;
		}

		/**
		 * 创建一个 <code>GradientSize,不允许new，请使用静态创建函数。</code> 实例。
		 */

		public function GradientSize(){}

		/**
		 * 获取最大尺寸。
		 */
		public function getMaxSizeInGradient():Number{
			return null;
		}

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
