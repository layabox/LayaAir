/*[IF-FLASH]*/
package laya.particle {
	public class ParticleSetting {
		public var textureName:String;
		public var textureCount:Number;
		public var maxPartices:Number;
		public var duration:Number;
		public var ageAddScale:Number;
		public var emitterVelocitySensitivity:Number;
		public var minStartSize:Number;
		public var maxStartSize:Number;
		public var minEndSize:Number;
		public var maxEndSize:Number;
		public var minHorizontalVelocity:Number;
		public var maxHorizontalVelocity:Number;
		public var minVerticalVelocity:Number;
		public var maxVerticalVelocity:Number;
		public var endVelocity:Number;
		public var gravity:Float32Array;
		public var minRotateSpeed:Number;
		public var maxRotateSpeed:Number;
		public var minStartRadius:Number;
		public var maxStartRadius:Number;
		public var minEndRadius:Number;
		public var maxEndRadius:Number;
		public var minHorizontalStartRadian:Number;
		public var maxHorizontalStartRadian:Number;
		public var minVerticalStartRadian:Number;
		public var maxVerticalStartRadian:Number;
		public var useEndRadian:Boolean;
		public var minHorizontalEndRadian:Number;
		public var maxHorizontalEndRadian:Number;
		public var minVerticalEndRadian:Number;
		public var maxVerticalEndRadian:Number;
		public var minStartColor:Float32Array;
		public var maxStartColor:Float32Array;
		public var minEndColor:Float32Array;
		public var maxEndColor:Float32Array;
		public var colorComponentInter:Boolean;
		public var disableColor:Boolean;
		public var blendState:Number;
		public var emitterType:String;
		public var emissionRate:Number;
		public var pointEmitterPosition:Float32Array;
		public var pointEmitterPositionVariance:Float32Array;
		public var pointEmitterVelocity:Float32Array;
		public var pointEmitterVelocityAddVariance:Float32Array;
		public var boxEmitterCenterPosition:Float32Array;
		public var boxEmitterSize:Float32Array;
		public var boxEmitterVelocity:Float32Array;
		public var boxEmitterVelocityAddVariance:Float32Array;
		public var sphereEmitterCenterPosition:Float32Array;
		public var sphereEmitterRadius:Number;
		public var sphereEmitterVelocity:Number;
		public var sphereEmitterVelocityAddVariance:Number;
		public var ringEmitterCenterPosition:Float32Array;
		public var ringEmitterRadius:Number;
		public var ringEmitterVelocity:Number;
		public var ringEmitterVelocityAddVariance:Number;
		public var ringEmitterUp:Number;
		public var positionVariance:Float32Array;

		public function ParticleSetting(){}
		private static var _defaultSetting:*;
		public static function checkSetting(setting:*):void{}
	}

}
