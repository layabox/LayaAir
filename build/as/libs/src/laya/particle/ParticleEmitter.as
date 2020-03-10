package laya.particle {
	import laya.particle.ParticleTemplateBase;

	/**
	 * @private 
	 */
	public class ParticleEmitter {
		private var _templet:*;
		private var _timeBetweenParticles:*;
		private var _previousPosition:*;
		private var _timeLeftOver:*;
		private var _tempVelocity:*;
		private var _tempPosition:*;

		public function ParticleEmitter(templet:ParticleTemplateBase = undefined,particlesPerSecond:Number = undefined,initialPosition:Float32Array = undefined){}
		public function update(elapsedTime:Number,newPosition:Float32Array):void{}
	}

}
