/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen {
	improt laya.d3.core.particleShuriKen.ShuriKenParticle3D;
	improt laya.d3.core.GeometryElement;
	improt laya.d3.core.IClone;
	improt laya.d3.core.particleShuriKen.module.ColorOverLifetime;
	improt laya.d3.core.particleShuriKen.module.Emission;
	improt laya.d3.core.particleShuriKen.module.GradientDataNumber;
	improt laya.d3.core.particleShuriKen.module.RotationOverLifetime;
	improt laya.d3.core.particleShuriKen.module.SizeOverLifetime;
	improt laya.d3.core.particleShuriKen.module.TextureSheetAnimation;
	improt laya.d3.core.particleShuriKen.module.VelocityOverLifetime;
	improt laya.d3.core.particleShuriKen.module.shape.BaseShape;
	improt laya.d3.core.render.RenderContext3D;
	improt laya.d3.graphics.IndexBuffer3D;
	improt laya.d3.graphics.VertexBuffer3D;
	improt laya.d3.math.Vector3;
	improt laya.d3.math.Vector4;
	public class ShurikenParticleSystem extends laya.d3.core.GeometryElement implements laya.d3.core.IClone {
		public var duration:Number;
		public var looping:Boolean;
		public var prewarm:Boolean;
		public var startDelayType:Number;
		public var startDelay:Number;
		public var startDelayMin:Number;
		public var startDelayMax:Number;
		public var startSpeedType:Number;
		public var startSpeedConstant:Number;
		public var startSpeedConstantMin:Number;
		public var startSpeedConstantMax:Number;
		public var threeDStartSize:Boolean;
		public var startSizeType:Number;
		public var startSizeConstant:Number;
		public var startSizeConstantSeparate:Vector3;
		public var startSizeConstantMin:Number;
		public var startSizeConstantMax:Number;
		public var startSizeConstantMinSeparate:Vector3;
		public var startSizeConstantMaxSeparate:Vector3;
		public var threeDStartRotation:Boolean;
		public var startRotationType:Number;
		public var startRotationConstant:Number;
		public var startRotationConstantSeparate:Vector3;
		public var startRotationConstantMin:Number;
		public var startRotationConstantMax:Number;
		public var startRotationConstantMinSeparate:Vector3;
		public var startRotationConstantMaxSeparate:Vector3;
		public var randomizeRotationDirection:Number;
		public var startColorType:Number;
		public var startColorConstant:Vector4;
		public var startColorConstantMin:Vector4;
		public var startColorConstantMax:Vector4;
		public var gravityModifier:Number;
		public var simulationSpace:Number;
		public var scaleMode:Number;
		public var playOnAwake:Boolean;
		public var randomSeed:Uint32Array;
		public var autoRandomSeed:Boolean;
		public var isPerformanceMode:Boolean;
		public var maxParticles:Number;
		public function get emission():Emission{};
		public function get aliveParticleCount():Number{};
		public function get emissionTime():Number{};
		public var shape:BaseShape;
		public function get isAlive():Boolean{};
		public function get isEmitting():Boolean{};
		public function get isPlaying():Boolean{};
		public function get isPaused():Boolean{};
		public var startLifetimeType:Number;
		public var startLifetimeConstant:Number;
		public var startLifeTimeGradient:GradientDataNumber;
		public var startLifetimeConstantMin:Number;
		public var startLifetimeConstantMax:Number;
		public var startLifeTimeGradientMin:GradientDataNumber;
		public var startLifeTimeGradientMax:GradientDataNumber;
		public var velocityOverLifetime:VelocityOverLifetime;
		public var colorOverLifetime:ColorOverLifetime;
		public var sizeOverLifetime:SizeOverLifetime;
		public var rotationOverLifetime:RotationOverLifetime;
		public var textureSheetAnimation:TextureSheetAnimation;
		public function _getVertexBuffer(index:Number = null):VertexBuffer3D{}
		public function _getIndexBuffer():IndexBuffer3D{}

		public function ShurikenParticleSystem(owner:ShuriKenParticle3D){}
		public function emit(time:Number):Boolean{}
		public function addParticle(position:Vector3,direction:Vector3,time:Number):Boolean{}
		public function addNewParticlesToVertexBuffer():void{}
		public function _getType():Number{}
		public function _prepareRender(state:RenderContext3D):Boolean{}
		public function play():void{}
		public function pause():void{}
		public function simulate(time:Number,restart:Boolean = null):void{}
		public function stop():void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
