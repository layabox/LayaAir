/*[IF-FLASH]*/
package laya.particle {
	improt laya.display.Sprite;
	improt laya.particle.ParticleSetting;
	improt laya.resource.Context;
	improt laya.particle.emitter.EmitterBase;
	public class Particle2D extends laya.display.Sprite {
		private var _matrix4:*;
		private var _particleTemplate:*;
		private var _canvasTemplate:*;
		private var _emitter:*;
		public var autoPlay:Boolean;
		public var tempCmd:*;

		public function Particle2D(setting:ParticleSetting){}
		public var url:String;
		public function load(url:String):void{}
		public function setParticleSetting(setting:ParticleSetting):void{}
		public function get emitter():EmitterBase{};
		public function play():void{}
		public function stop():void{}
		private var _loop:*;
		public function advanceTime(passedTime:Number = null):void{}
		public function customRender(context:Context,x:Number,y:Number):void{}
		public function destroy(destroyChild:Boolean = null):void{}
	}

}
