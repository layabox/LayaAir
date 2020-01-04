package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.IClone;

	/**
	 * <code>Burst</code> 类用于粒子的爆裂描述。
	 */
	public class Burst implements IClone {

		/**
		 * 爆裂时间,单位为秒。
		 */
		private var _time:*;

		/**
		 * 爆裂的最小数量。
		 */
		private var _minCount:*;

		/**
		 * 爆裂的最大数量。
		 */
		private var _maxCount:*;

		/**
		 * 获取爆裂时间,单位为秒。
		 * @return 爆裂时间,单位为秒。
		 */
		public function get time():Number{
				return null;
		}

		/**
		 * 获取爆裂的最小数量。
		 * @return 爆裂的最小数量。
		 */
		public function get minCount():Number{
				return null;
		}

		/**
		 * 获取爆裂的最大数量。
		 * @return 爆裂的最大数量。
		 */
		public function get maxCount():Number{
				return null;
		}

		/**
		 * 创建一个 <code>Burst</code> 实例。
		 * @param time 爆裂时间,单位为秒。
		 * @param minCount 爆裂的最小数量。
		 * @param time 爆裂的最大数量。
		 */

		public function Burst(time:Number = undefined,minCount:Number = undefined,maxCount:Number = undefined){}

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
