package laya.d3.core.light {
	import laya.d3.math.Vector3;
	import laya.d3.core.Sprite3D;

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
		 * 是否产生阴影。
		 */
		public var shadow:Boolean;

		/**
		 * 阴影最远范围。
		 */
		public var shadowDistance:Number;

		/**
		 * 阴影贴图尺寸。
		 */
		public var shadowResolution:Number;

		/**
		 * 阴影分段数。
		 */
		public var shadowPSSMCount:Number;

		/**
		 * 阴影PCF类型。
		 */
		public var shadowPCFType:Number;

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
		 * 灯光的漫反射颜色。
		 * @return 灯光的漫反射颜色。
		 */
		public var diffuseColor:Vector3;
	}

}
