package laya.d3.core.light {
	import laya.d3.math.Vector3;
	import laya.d3.core.light.LightSprite;

	/**
	 * <code>DirectionLight</code> 类用于创建平行光。
	 */
	public class DirectionLight extends LightSprite {

		/**
		 * @iternal 
		 */
		public var _direction:Vector3;

		/**
		 * 创建一个 <code>DirectionLight</code> 实例。
		 */

		public function DirectionLight(){}
	}

}
