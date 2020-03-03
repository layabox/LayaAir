package laya.d3.core.particleShuriKen {
	import laya.d3.math.Vector3;
	import laya.d3.math.Vector4;
	import laya.d3.core.GeometryElement;
	import laya.d3.core.IClone;
	import laya.d3.core.particleShuriKen.module.ColorOverLifetime;
	import laya.d3.core.particleShuriKen.module.Emission;
	import laya.d3.core.particleShuriKen.module.GradientDataNumber;
	import laya.d3.core.particleShuriKen.module.RotationOverLifetime;
	import laya.d3.core.particleShuriKen.module.shape.BaseShape;
	import laya.d3.core.particleShuriKen.module.SizeOverLifetime;
	import laya.d3.core.particleShuriKen.module.TextureSheetAnimation;
	import laya.d3.core.particleShuriKen.module.VelocityOverLifetime;
	import laya.d3.core.particleShuriKen.ShuriKenParticle3D;

	/**
	 * <code>ShurikenParticleSystem</code> 类用于创建3D粒子数据模板。
	 */
	public class ShurikenParticleSystem extends GeometryElement implements IClone {

		/**
		 * 粒子运行的总时长，单位为秒。
		 */
		public var duration:Number;

		/**
		 * 是否循环。
		 */
		public var looping:Boolean;

		/**
		 * 是否预热。暂不支持
		 */
		public var prewarm:Boolean;

		/**
		 * 开始延迟类型，0为常量模式,1为随机随机双常量模式，不能和prewarm一起使用。
		 */
		public var startDelayType:Number;

		/**
		 * 开始播放延迟，不能和prewarm一起使用。
		 */
		public var startDelay:Number;

		/**
		 * 开始播放最小延迟，不能和prewarm一起使用。
		 */
		public var startDelayMin:Number;

		/**
		 * 开始播放最大延迟，不能和prewarm一起使用。
		 */
		public var startDelayMax:Number;

		/**
		 * 开始速度模式，0为恒定速度，2为两个恒定速度的随机插值。缺少1、3模式
		 */
		public var startSpeedType:Number;

		/**
		 * 开始速度,0模式。
		 */
		public var startSpeedConstant:Number;

		/**
		 * 最小开始速度,1模式。
		 */
		public var startSpeedConstantMin:Number;

		/**
		 * 最大开始速度,1模式。
		 */
		public var startSpeedConstantMax:Number;

		/**
		 * 开始尺寸是否为3D模式。
		 */
		public var threeDStartSize:Boolean;

		/**
		 * 开始尺寸模式,0为恒定尺寸，2为两个恒定尺寸的随机插值。缺少1、3模式和对应的二种3D模式
		 */
		public var startSizeType:Number;

		/**
		 * 开始尺寸，0模式。
		 */
		public var startSizeConstant:Number;

		/**
		 * 开始三维尺寸，0模式。
		 */
		public var startSizeConstantSeparate:Vector3;

		/**
		 * 最小开始尺寸，2模式。
		 */
		public var startSizeConstantMin:Number;

		/**
		 * 最大开始尺寸，2模式。
		 */
		public var startSizeConstantMax:Number;

		/**
		 * 最小三维开始尺寸，2模式。
		 */
		public var startSizeConstantMinSeparate:Vector3;

		/**
		 * 最大三维开始尺寸，2模式。
		 */
		public var startSizeConstantMaxSeparate:Vector3;

		/**
		 * 3D开始旋转。
		 */
		public var threeDStartRotation:Boolean;

		/**
		 * 开始旋转模式,0为恒定尺寸，2为两个恒定旋转的随机插值,缺少2种模式,和对应的四种3D模式。
		 */
		public var startRotationType:Number;

		/**
		 * 开始旋转，0模式。
		 */
		public var startRotationConstant:Number;

		/**
		 * 开始三维旋转，0模式。
		 */
		public var startRotationConstantSeparate:Vector3;

		/**
		 * 最小开始旋转，1模式。
		 */
		public var startRotationConstantMin:Number;

		/**
		 * 最大开始旋转，1模式。
		 */
		public var startRotationConstantMax:Number;

		/**
		 * 最小开始三维旋转，1模式。
		 */
		public var startRotationConstantMinSeparate:Vector3;

		/**
		 * 最大开始三维旋转，1模式。
		 */
		public var startRotationConstantMaxSeparate:Vector3;

		/**
		 * 随机旋转方向，范围为0.0到1.0
		 */
		public var randomizeRotationDirection:Number;

		/**
		 * 开始颜色模式，0为恒定颜色，2为两个恒定颜色的随机插值,缺少2种模式。
		 */
		public var startColorType:Number;

		/**
		 * 开始颜色，0模式。
		 */
		public var startColorConstant:Vector4;

		/**
		 * 最小开始颜色，1模式。
		 */
		public var startColorConstantMin:Vector4;

		/**
		 * 最大开始颜色，1模式。
		 */
		public var startColorConstantMax:Vector4;

		/**
		 * 重力敏感度。
		 */
		public var gravityModifier:Number;

		/**
		 * 模拟器空间,0为World,1为Local。暂不支持Custom。
		 */
		public var simulationSpace:Number;

		/**
		 * 粒子的播放速度。
		 */
		public var simulationSpeed:Number;

		/**
		 * 缩放模式，0为Hiercachy,1为Local,2为World。
		 */
		public var scaleMode:Number;

		/**
		 * 激活时是否自动播放。
		 */
		public var playOnAwake:Boolean;

		/**
		 * 随机种子,注:play()前设置有效。
		 */
		public var randomSeed:Uint32Array;

		/**
		 * 是否使用随机种子。
		 */
		public var autoRandomSeed:Boolean;

		/**
		 * 是否为性能模式,性能模式下会延迟粒子释放。
		 */
		public var isPerformanceMode:Boolean;

		/**
		 * 最大粒子数。
		 */
		public var maxParticles:Number;

		/**
		 * 获取发射器。
		 */
		public function get emission():Emission{
				return null;
		}

		/**
		 * 粒子存活个数。
		 */
		public function get aliveParticleCount():Number{
				return null;
		}

		/**
		 * 一次循环内的累计时间。
		 */
		public function get emissionTime():Number{
				return null;
		}

		/**
		 * 形状。
		 */
		public var shape:BaseShape;

		/**
		 * 是否存活。
		 */
		public function get isAlive():Boolean{
				return null;
		}

		/**
		 * 是否正在发射。
		 */
		public function get isEmitting():Boolean{
				return null;
		}

		/**
		 * 是否正在播放。
		 */
		public function get isPlaying():Boolean{
				return null;
		}

		/**
		 * 是否已暂停。
		 */
		public function get isPaused():Boolean{
				return null;
		}

		/**
		 * 开始生命周期模式,0为固定时间，1为渐变时间，2为两个固定之间的随机插值,3为两个渐变时间的随机插值。
		 */
		public var startLifetimeType:Number;

		/**
		 * 开始生命周期，0模式,单位为秒。
		 */
		public var startLifetimeConstant:Number;

		/**
		 * 开始渐变生命周期，1模式,单位为秒。
		 */
		public var startLifeTimeGradient:GradientDataNumber;

		/**
		 * 最小开始生命周期，2模式,单位为秒。
		 */
		public var startLifetimeConstantMin:Number;

		/**
		 * 最大开始生命周期，2模式,单位为秒。
		 */
		public var startLifetimeConstantMax:Number;

		/**
		 * 开始渐变最小生命周期，3模式,单位为秒。
		 */
		public var startLifeTimeGradientMin:GradientDataNumber;

		/**
		 * 开始渐变最大生命周期，3模式,单位为秒。
		 */
		public var startLifeTimeGradientMax:GradientDataNumber;

		/**
		 * 生命周期速度,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 */
		public var velocityOverLifetime:VelocityOverLifetime;

		/**
		 * 生命周期颜色,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 */
		public var colorOverLifetime:ColorOverLifetime;

		/**
		 * 生命周期尺寸,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 */
		public var sizeOverLifetime:SizeOverLifetime;

		/**
		 * 生命周期旋转,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 */
		public var rotationOverLifetime:RotationOverLifetime;

		/**
		 * 生命周期纹理动画,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
		 */
		public var textureSheetAnimation:TextureSheetAnimation;

		public function ShurikenParticleSystem(owner:ShuriKenParticle3D = undefined){}

		/**
		 * 发射一个粒子。
		 */
		public function emit(time:Number):Boolean{
			return null;
		}
		public function addParticle(position:Vector3,direction:Vector3,time:Number):Boolean{
			return null;
		}
		public function addNewParticlesToVertexBuffer():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function _getType():Number{
			return null;
		}

		/**
		 * 开始发射粒子。
		 */
		public function play():void{}

		/**
		 * 暂停发射粒子。
		 */
		public function pause():void{}

		/**
		 * 通过指定时间增加粒子播放进度，并暂停播放。
		 * @param time 进度时间.如果restart为true,粒子播放时间会归零后再更新进度。
		 * @param restart 是否重置播放状态。
		 */
		public function simulate(time:Number,restart:Boolean = null):void{}

		/**
		 * 停止发射粒子。
		 */
		public function stop():void{}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
	}

}
