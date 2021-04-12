package laya.d3.core.light {
	import laya.d3.core.light.LightSprite;

	/**
	 * <code>PointLight</code> 类用于创建点光。
	 */
	public class PointLight extends LightSprite {

		/**
		 * 点光的范围。
		 * @return 点光的范围。
		 */
		public function get range():Number{return null;}
		public function set range(value:Number):void{}

		/**
		 * 创建一个 <code>PointLight</code> 实例。
		 */

		public function PointLight(){}
	}

}
