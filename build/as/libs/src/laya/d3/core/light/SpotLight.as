package laya.d3.core.light {
	import laya.d3.core.light.LightSprite;

	/**
	 * <code>SpotLight</code> 类用于创建聚光。
	 */
	public class SpotLight extends LightSprite {

		/**
		 * 聚光灯的锥形角度。
		 */
		public function get spotAngle():Number{return null;}
		public function set spotAngle(value:Number):void{}

		/**
		 * 聚光的范围。
		 */
		public function get range():Number{return null;}
		public function set range(value:Number):void{}

		/**
		 * 创建一个 <code>SpotLight</code> 实例。
		 */

		public function SpotLight(){}
	}

}
