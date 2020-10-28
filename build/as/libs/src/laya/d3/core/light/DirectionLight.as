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
		public function get shadowCascadesMode():ShadowCascadesMode{return null;}
		public function set shadowCascadesMode(value:ShadowCascadesMode):void{}

		/**
		 * 二级级联阴影分割比例。
		 */
		public function get shadowTwoCascadeSplits():Number{return null;}
		public function set shadowTwoCascadeSplits(value:Number):void{}

		/**
		 * 四级级联阴影分割比例,X、Y、Z依次为其分割比例,Z必须大于Y,Y必须大于X。
		 */
		public function get shadowFourCascadeSplits():Vector3{return null;}
		public function set shadowFourCascadeSplits(value:Vector3):void{}

		/**
		 * 创建一个 <code>DirectionLight</code> 实例。
		 */

		public function DirectionLight(){}
	}

}
