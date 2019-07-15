/*[IF-FLASH]*/
package laya.particle.emitter {
	improt laya.particle.ParticleTemplateBase;
	public class EmitterBase {
		protected var _frameTime:Number;
		protected var _emissionRate:Number;
		protected var _emissionTime:Number;
		public var minEmissionTime:Number;
		public var particleTemplate:ParticleTemplateBase;
		public var emissionRate:Number;
		public function start(duration:Number = null):void{}
		public function stop():void{}
		public function clear():void{}
		public function emit():void{}
		public function advanceTime(passedTime:Number = null):void{}
	}

}
