package laya.d3.core.light {
	import laya.d3.math.Vector3;
	import laya.d3.core.Sprite3D;
	import laya.d3.core.light.ShadowMode;

	/**
	 * <code>LightSprite</code> 类用于创建灯光的父类。
	 */
	public class LightSprite extends Sprite3D {

		/**
		 * 灯光烘培类型-实时。
		 */
		public static var LIGHTMAPBAKEDTYPE_REALTIME:Number;

		/**
		 * 灯光烘培类型-混合。
		 */
		public static var LIGHTMAPBAKEDTYPE_MIXED:Number;

		/**
		 * 灯光烘培类型-烘焙。
		 */
		public static var LIGHTMAPBAKEDTYPE_BAKED:Number;

		/**
		 * 灯光颜色。
		 */
		public var color:Vector3;

		/**
		 * 灯光强度。
		 */
		public var intensity:Number;

		/**
		 * 阴影模式。
		 */
		public var shadowMode:ShadowMode;

		/**
		 * 最大阴影距离。
		 */
		public var shadowDistance:Number;

		/**
		 * 阴影贴图分辨率。
		 */
		public var shadowResolution:Number;

		/**
		 * 阴影深度偏差。
		 */
		public var shadowDepthBias:Number;

		/**
		 * 阴影法线偏差。
		 */
		public var shadowNormalBias:Number;

		/**
		 * 阴影强度。
		 */
		public var shadowStrength:Number;

		/**
		 * 阴影视锥的近裁面。
		 */
		public var shadowNearPlane:Number;

		/**
		 * 灯光烘培类型。
		 */
		public var lightmapBakedType:Number;

		/**
		 * 创建一个 <code>LightSprite</code> 实例。
		 */

		public function LightSprite(){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onActive():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onInActive():void{}

		/**
		 * @deprecated please use color property instead.
		 */
		public var diffuseColor:Vector3;
	}

}
