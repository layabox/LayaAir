/*[IF-FLASH]*/
package laya.particle {
	improt laya.particle.ParticleSetting;
	improt laya.resource.Texture;
	public class ParticleTemplateBase {
		public var settings:ParticleSetting;
		protected var texture:Texture;

		public function ParticleTemplateBase(){}
		public function addParticleArray(position:Float32Array,velocity:Float32Array):void{}
	}

}
