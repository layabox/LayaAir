package laya.particle.emitter {
	import laya.particle.emitter.EmitterBase;
	import laya.particle.ParticleSetting;
	import laya.particle.ParticleTemplateBase;

	/**
	 * @private 
	 */
	public class Emitter2D extends EmitterBase {
		public var setting:ParticleSetting;
		private var _posRange:*;
		private var _canvasTemplate:*;
		private var _emitFun:*;

		public function Emitter2D(_template:ParticleTemplateBase = undefined){}
		public var template:ParticleTemplateBase;

		/**
		 * @override 
		 */
		override public function emit():void{}
		public function getRandom(value:Number):Number{
			return null;
		}
		public function webGLEmit():void{}
		public function canvasEmit():void{}
	}

}
