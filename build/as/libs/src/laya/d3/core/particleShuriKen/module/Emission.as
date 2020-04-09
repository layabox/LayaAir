package laya.d3.core.particleShuriKen.module {
	import laya.resource.IDestroy;
	import laya.d3.core.IClone;
	import laya.d3.core.particleShuriKen.module.Burst;

	/**
	 * <code>Emission</code> 类用于粒子发射器。
	 */
	public class Emission implements IClone,IDestroy {

		/**
		 * 是否启用。
		 */
		public var enable:Boolean;

		/**
		 * 设置粒子发射速率。
		 * @param emissionRate 粒子发射速率 (个/秒)。
		 */

		/**
		 * 获取粒子发射速率。
		 * @return 粒子发射速率 (个/秒)。
		 */
		public var emissionRate:Number;

		/**
		 * 获取是否已销毁。
		 * @return 是否已销毁。
		 */
		public function get destroyed():Boolean{
				return null;
		}

		/**
		 * 创建一个 <code>Emission</code> 实例。
		 */

		public function Emission(){}

		/**
		 * @private 
		 */
		public function destroy():void{}

		/**
		 * 获取粒子爆裂个数。
		 * @return 粒子爆裂个数。
		 */
		public function getBurstsCount():Number{
			return null;
		}

		/**
		 * 通过索引获取粒子爆裂。
		 * @param index 爆裂索引。
		 * @return 粒子爆裂。
		 */
		public function getBurstByIndex(index:Number):Burst{
			return null;
		}

		/**
		 * 增加粒子爆裂。
		 * @param burst 爆裂。
		 */
		public function addBurst(burst:Burst):void{}

		/**
		 * 移除粒子爆裂。
		 * @param burst 爆裂。
		 */
		public function removeBurst(burst:Burst):void{}

		/**
		 * 通过索引移除粒子爆裂。
		 * @param index 爆裂索引。
		 */
		public function removeBurstByIndex(index:Number):void{}

		/**
		 * 清空粒子爆裂。
		 */
		public function clearBurst():void{}

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
