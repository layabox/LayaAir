package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.IClone;

	/**
	 * <code>StartFrame</code> 类用于创建开始帧。
	 */
	public class StartFrame implements IClone {

		/**
		 * 通过随机常量旋转创建一个 <code>StartFrame</code> 实例。
		 * @param constant 固定帧。
		 * @return 开始帧。
		 */
		public static function createByConstant(constant:Number = null):StartFrame{
			return null;
		}

		/**
		 * 通过随机双常量旋转创建一个 <code>StartFrame</code> 实例。
		 * @param constantMin 最小固定帧。
		 * @param constantMax 最大固定帧。
		 * @return 开始帧。
		 */
		public static function createByRandomTwoConstant(constantMin:Number = null,constantMax:Number = null):StartFrame{
			return null;
		}
		private var _type:*;
		private var _constant:*;
		private var _constantMin:*;
		private var _constantMax:*;

		/**
		 * 开始帧类型,0常量模式，1随机双常量模式。
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
		 * 创建一个 <code>StartFrame,不允许new，请使用静态创建函数。</code> 实例。
		 */

		public function StartFrame(){}

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
