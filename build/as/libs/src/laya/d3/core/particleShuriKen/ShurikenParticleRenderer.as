package laya.d3.core.particleShuriKen {
	import laya.d3.resource.models.Mesh;
	import laya.d3.core.Bounds;
	import laya.d3.core.render.BaseRender;
	import laya.d3.core.particleShuriKen.ShuriKenParticle3D;

	/**
	 * <code>ShurikenParticleRender</code> 类用于创建3D粒子渲染器。
	 */
	public class ShurikenParticleRenderer extends BaseRender {

		/**
		 * 拉伸广告牌模式摄像机速度缩放,暂不支持。
		 */
		public var stretchedBillboardCameraSpeedScale:Number;

		/**
		 * 拉伸广告牌模式速度缩放。
		 */
		public var stretchedBillboardSpeedScale:Number;

		/**
		 * 拉伸广告牌模式长度缩放。
		 */
		public var stretchedBillboardLengthScale:Number;

		/**
		 * 获取渲染模式,0为BILLBOARD、1为STRETCHEDBILLBOARD、2为HORIZONTALBILLBOARD、3为VERTICALBILLBOARD、4为MESH。
		 */
		public var renderMode:Number;

		/**
		 * 获取网格渲染模式所使用的Mesh,rendderMode为4时生效。
		 */
		public var mesh:Mesh;

		/**
		 * 创建一个 <code>ShurikenParticleRender</code> 实例。
		 */

		public function ShurikenParticleRenderer(owner:ShuriKenParticle3D = undefined){}
	}

}
