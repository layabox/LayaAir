/*[IF-FLASH]*/
package laya.particle.emitter {
	improt laya.particle.emitter.EmitterBase;
	improt laya.particle.ParticleSetting;
	improt laya.particle.ParticleTemplateBase;
	public class Emitter2D extends laya.particle.emitter.EmitterBase {
		public var setting:ParticleSetting;
		private var _posRange:*;
		private var _canvasTemplate:*;
		private var _emitFun:*;

		public function Emitter2D(_template:ParticleTemplateBase){}
		public var template:ParticleTemplateBase;
		public function emit():void{}
		public function getRandom(value:Number):Number{}
		public function webGLEmit():void{}
		public function canvasEmit():void{}
	}

}
