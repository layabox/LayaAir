package laya.particle {
	import laya.particle.ParticleSetting;

	/**
	 * @private 
	 */
	public class ParticleData {
		private static var _tempVelocity:*;
		private static var _tempStartColor:*;
		private static var _tempEndColor:*;
		private static var _tempSizeRotation:*;
		private static var _tempRadius:*;
		private static var _tempRadian:*;
		public var position:Float32Array;
		public var velocity:Float32Array;
		public var startColor:Float32Array;
		public var endColor:Float32Array;
		public var sizeRotation:Float32Array;
		public var radius:Float32Array;
		public var radian:Float32Array;
		public var durationAddScale:Number;
		public var time:Number;

		public function ParticleData(){}
		public static function Create(settings:ParticleSetting,position:Float32Array,velocity:Float32Array,time:Number):ParticleData{
			return null;
		}
	}

}
