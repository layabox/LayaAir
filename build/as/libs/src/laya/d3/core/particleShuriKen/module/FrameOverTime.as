package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.particleShuriKen.module.GradientDataInt;
	import laya.d3.core.IClone;

	/**
	 * <code>FrameOverTime</code> 类用于创建时间帧。
	 */
	public class FrameOverTime implements IClone {

		/**
		 * 通过固定帧创建一个 <code>FrameOverTime</code> 实例。
		 * @param constant 固定帧。
		 * @return 时间帧。
		 */
		public static function createByConstant(constant:Number = null):FrameOverTime{
			return null;
		}

		/**
		 * 通过时间帧创建一个 <code>FrameOverTime</code> 实例。
		 * @param overTime 时间帧。
		 * @return 时间帧。
		 */
		public static function createByOverTime(overTime:GradientDataInt):FrameOverTime{
			return null;
		}

		/**
		 * 通过随机双固定帧创建一个 <code>FrameOverTime</code> 实例。
		 * @param constantMin 最小固定帧。
		 * @param constantMax 最大固定帧。
		 * @return 时间帧。
		 */
		public static function createByRandomTwoConstant(constantMin:Number = null,constantMax:Number = null):FrameOverTime{
			return null;
		}

		/**
		 * 通过随机双时间帧创建一个 <code>FrameOverTime</code> 实例。
		 * @param gradientFrameMin 最小时间帧。
		 * @param gradientFrameMax 最大时间帧。
		 * @return 时间帧。
		 */
		public static function createByRandomTwoOverTime(gradientFrameMin:GradientDataInt,gradientFrameMax:GradientDataInt):FrameOverTime{
			return null;
		}
		private var _type:*;
		private var _constant:*;
		private var _overTime:*;
		private var _constantMin:*;
		private var _constantMax:*;
		private var _overTimeMin:*;
		private var _overTimeMax:*;

		/**
		 * 生命周期旋转类型,0常量模式，1曲线模式，2随机双常量模式，3随机双曲线模式。
		 */
		public function get type():Number{
				return null;
		}

		/**
		 * 固定帧。
		 */
		public function get constant():Number{
				return null;
		}

		/**
		 * 时间帧。
		 */
		public function get frameOverTimeData():GradientDataInt{
				return null;
		}

		/**
		 * 最小固定帧。
		 */
		public function get constantMin():Number{
				return null;
		}

		/**
		 * 最大固定帧。
		 */
		public function get constantMax():Number{
				return null;
		}

		/**
		 * 最小时间帧。
		 */
		public function get frameOverTimeDataMin():GradientDataInt{
				return null;
		}

		/**
		 * 最大时间帧。
		 */
		public function get frameOverTimeDataMax():GradientDataInt{
				return null;
		}

		/**
		 * 创建一个 <code>FrameOverTime,不允许new，请使用静态创建函数。</code> 实例。
		 */

		public function FrameOverTime(){}

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
