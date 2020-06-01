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
		public function get intensity():Number{return null;}
		public function set intensity(value:Number):void{}

		/**
		 * 阴影模式。
		 */
		public function get shadowMode():ShadowMode{return null;}
		public function set shadowMode(value:ShadowMode):void{}

		/**
		 * 最大阴影距离。
		 */
		public function get shadowDistance():Number{return null;}
		public function set shadowDistance(value:Number):void{}

		/**
		 * 阴影贴图分辨率。
		 */
		public function get shadowResolution():Number{return null;}
		public function set shadowResolution(value:Number):void{}

		/**
		 * 阴影深度偏差。
		 */
		public function get shadowDepthBias():Number{return null;}
		public function set shadowDepthBias(value:Number):void{}

		/**
		 * 阴影法线偏差。
		 */
		public function get shadowNormalBias():Number{return null;}
		public function set shadowNormalBias(value:Number):void{}

		/**
		 * 阴影强度。
		 */
		public function get shadowStrength():Number{return null;}
		public function set shadowStrength(value:Number):void{}

		/**
		 * 阴影视锥的近裁面。
		 */
		public function get shadowNearPlane():Number{return null;}
		public function set shadowNearPlane(value:Number):void{}

		/**
		 * 灯光烘培类型。
		 */
		public function get lightmapBakedType():Number{return null;}
		public function set lightmapBakedType(value:Number):void{}

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
		public function get diffuseColor():Vector3{return null;}
		public function set diffuseColor(value:Vector3):void{}
	}

}
