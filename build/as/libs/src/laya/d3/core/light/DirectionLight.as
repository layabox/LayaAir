package laya.d3.core.light {
	import laya.d3.math.Vector3;
	import laya.d3.core.light.LightSprite;
	import laya.d3.core.light.ShadowCascadesMode;

	/**
	 * <code>DirectionLight</code> 类用于创建平行光。
	 */
	public class DirectionLight extends LightSprite {

		/**
		 * 阴影级联数量。
		 */
		public var shadowCascadesMode:ShadowCascadesMode;

		/**
		 * 二级级联阴影分割比例。
		 */
		public var shadowTwoCascadeSplits:Number;

		/**
		 * 四级级联阴影分割比例,X、Y、Z依次为其分割比例,Z必须大于Y,Y必须大于X。
		 */
		public var shadowFourCascadeSplits:Vector3;

		/**
		 * 创建一个 <code>DirectionLight</code> 实例。
		 */

		public function DirectionLight(){}
	}

}
