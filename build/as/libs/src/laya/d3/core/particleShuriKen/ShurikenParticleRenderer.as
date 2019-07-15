/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen {
	improt laya.d3.math.BoundFrustum;
	improt laya.d3.resource.models.Mesh;
	improt laya.d3.core.Bounds;
	improt laya.d3.core.render.BaseRender;
	improt laya.d3.core.render.RenderContext3D;
	improt laya.d3.core.Transform3D;
	improt laya.d3.core.particleShuriKen.ShuriKenParticle3D;
	public class ShurikenParticleRenderer extends laya.d3.core.render.BaseRender {
		public var stretchedBillboardCameraSpeedScale:Number;
		public var stretchedBillboardSpeedScale:Number;
		public var stretchedBillboardLengthScale:Number;
		public var renderMode:Number;
		public var mesh:Mesh;

		public function ShurikenParticleRenderer(owner:ShuriKenParticle3D){}
		protected function _calculateBoundingBox():void{}
		public function _needRender(boundFrustum:BoundFrustum):Boolean{}
		public function _renderUpdate(context:RenderContext3D,transfrom:Transform3D):void{}
		public function get bounds():Bounds{};
		public function _destroy():void{}
	}

}
