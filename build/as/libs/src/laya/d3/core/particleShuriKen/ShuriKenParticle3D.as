/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen {
	improt laya.d3.core.RenderableSprite3D;
	improt laya.d3.core.particleShuriKen.ShurikenParticleRenderer;
	improt laya.d3.core.particleShuriKen.ShurikenParticleSystem;
	public class ShuriKenParticle3D extends laya.d3.core.RenderableSprite3D {
		public function get particleSystem():ShurikenParticleSystem{};
		public function get particleRenderer():ShurikenParticleRenderer{};

		public function ShuriKenParticle3D(){}
		public function _parse(data:*,spriteMap:*):void{}
		public function _activeHierarchy(activeChangeComponents:Array):void{}
		public function _inActiveHierarchy(activeChangeComponents:Array):void{}
		public function destroy(destroyChild:Boolean = null):void{}
	}

}
