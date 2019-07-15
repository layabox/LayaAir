/*[IF-FLASH]*/
package laya.particle {
	improt laya.particle.ParticleTemplateBase;
	public class ParticleEmitter {
		private var _templet:*;
		private var _timeBetweenParticles:*;
		private var _previousPosition:*;
		private var _timeLeftOver:*;
		private var _tempVelocity:*;
		private var _tempPosition:*;

		public function ParticleEmitter(templet:ParticleTemplateBase,particlesPerSecond:Number,initialPosition:Float32Array){}
		public function update(elapsedTime:Number,newPosition:Float32Array):void{}
	}

}
