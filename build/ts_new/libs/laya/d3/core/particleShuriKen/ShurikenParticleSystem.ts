import { LayaGL } from "../../../layagl/LayaGL";
import { MathUtil } from "../../../maths/MathUtil";
import { Resource } from "../../../resource/Resource";
import { Stat } from "../../../utils/Stat";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexMesh } from "../../graphics/Vertex/VertexMesh";
import { VertexShurikenParticleBillboard } from "../../graphics/Vertex/VertexShurikenParticleBillboard";
import { VertexShurikenParticleMesh } from "../../graphics/Vertex/VertexShurikenParticleMesh";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { VertexDeclaration } from "../../graphics/VertexDeclaration";
import { VertexElement } from "../../graphics/VertexElement";
import { BoundBox } from "../../math/BoundBox";
import { BoundSphere } from "../../math/BoundSphere";
import { Rand } from "../../math/Rand";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { Mesh } from "../../resource/models/Mesh";
import { ShaderData } from "../../shader/ShaderData";
import { BufferState } from "../BufferState";
import { GeometryElement } from "../GeometryElement";
import { Gradient } from "../Gradient";
import { IClone } from "../IClone";
import { RenderContext3D } from "../render/RenderContext3D";
import { Scene3D } from "../scene/Scene3D";
import { Transform3D } from "../Transform3D";
import { Burst } from "./module/Burst";
import { ColorOverLifetime } from "./module/ColorOverLifetime";
import { Emission } from "./module/Emission";
import { FrameOverTime } from "./module/FrameOverTime";
import { GradientAngularVelocity } from "./module/GradientAngularVelocity";
import { GradientColor } from "./module/GradientColor";
import { GradientDataNumber } from "./module/GradientDataNumber";
import { GradientSize } from "./module/GradientSize";
import { GradientVelocity } from "./module/GradientVelocity";
import { RotationOverLifetime } from "./module/RotationOverLifetime";
import { BaseShape, ParticleSystemShapeType } from "./module/shape/BaseShape";
import { SizeOverLifetime } from "./module/SizeOverLifetime";
import { TextureSheetAnimation } from "./module/TextureSheetAnimation";
import { VelocityOverLifetime } from "./module/VelocityOverLifetime";
import { ShuriKenParticle3D } from "./ShuriKenParticle3D";
import { ShuriKenParticle3DShaderDeclaration } from "./ShuriKenParticle3DShaderDeclaration";
import { ShurikenParticleData } from "./ShurikenParticleData";
import { ShurikenParticleRenderer } from "./ShurikenParticleRenderer";
import { Quaternion } from "../../math/Quaternion";
import { IndexFormat } from "../../graphics/IndexFormat";
import { Bounds } from "../Bounds";
import { SphereShape } from "./module/shape/SphereShape";
import { HemisphereShape } from "./module/shape/HemisphereShape";
import { ConeShape } from "./module/shape/ConeShape";
import { CircleShape } from "./module/shape/CircleShape";
import { BoxShape } from "./module/shape/BoxShape";


/**
 * <code>ShurikenParticleSystem</code> 类用于创建3D粒子数据模板。
 */
export class ShurikenParticleSystem extends GeometryElement implements IClone {
	/** @internal 0:Burst,1:预留,2:StartDelay,3:StartColor,4:StartSize,5:StartRotation,6:randomizeRotationDirection,7:StartLifetime,8:StartSpeed,9:VelocityOverLifetime,10:ColorOverLifetime,11:SizeOverLifetime,12:RotationOverLifetime,13-15:TextureSheetAnimation,16-17:Shape*/
	static _RANDOMOFFSET: Uint32Array = new Uint32Array([0x23571a3e, 0xc34f56fe, 0x13371337, 0x12460f3b, 0x6aed452e, 0xdec4aea1, 0x96aa4de3, 0x8d2c8431, 0xf3857f6f, 0xe0fbd834, 0x13740583, 0x591bc05c, 0x40eb95e4, 0xbc524e5f, 0xaf502044, 0xa614b381, 0x1034e524, 0xfc524e5f]);

	/** @internal */
	private static halfKSqrtOf2: number = 1.42 * 0.5;

	/** @internal */
	private static g: number = 9.8;

	/** @internal */
	static _maxElapsedTime: number = 1.0 / 3.0;

	/**@internal */
	private static _tempVector30: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector31: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector32: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector33: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector34: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector35: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector36: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector37: Vector3 = new Vector3();
	/** @internal */
	private static _tempPosition: Vector3 = new Vector3();
	/** @internal */
	private static _tempDirection: Vector3 = new Vector3();

	/**@internal */
	private static _type: number = GeometryElement._typeCounter++;

	/** @internal */
	_boundingSphere: BoundSphere = null;
	/** @internal */
	_boundingBox: BoundBox = null;
	/** @internal */
	_boundingBoxCorners: Vector3[] = null;

	/** @internal */
	_bounds: Bounds = null;
	/** @internal 重力影响偏移, 用于计算世界包围盒 */
	_gravityOffset: Vector2 = new Vector2();

	/** @internal */
	_customBounds: Bounds = null;

	/** @internal */
	_useCustomBounds: boolean = false;

	/** @internal */
	private _owner: ShuriKenParticle3D = null;
	/** @internal */
	private _ownerRender: ShurikenParticleRenderer = null;
	/**@internal */
	private _vertices: Float32Array = null;
	/**@internal */
	private _floatCountPerVertex: number = 0;
	/**@internal */
	private _startLifeTimeIndex: number = 0;
	/**@internal */
	private _timeIndex: number = 0;
	/**@internal */
	private _simulateUpdate: boolean = false;


	/**@internal */
	private _firstActiveElement: number = 0;
	/**@internal */
	private _firstNewElement: number = 0;
	/**@internal */
	private _firstFreeElement: number = 0;
	/**@internal */
	private _firstRetiredElement: number = 0;
	/**@internal */
	private _drawCounter: number = 0;
	/**@internal 最大粒子数量*/
	private _bufferMaxParticles: number = 0;
	/**@internal */
	private _emission: Emission = null;
	/**@internal */
	private _shape: BaseShape = null;

	/**@internal */
	private _isEmitting: boolean = false;
	/**@internal */
	private _isPlaying: boolean = false;
	/**@internal */
	private _isPaused: boolean = false;
	/**@internal */
	private _playStartDelay: number = 0;
	/**@internal 发射的累计时间。*/
	private _frameRateTime: number = 0;
	/**@internal 一次循环内的累计时间。*/
	private _emissionTime: number = 0;
	/**@internal 用来计算时间是否超过发射延迟时间*/
	private _totalDelayTime: number = 0;
	/**@internal */
	private _burstsIndex: number = 0;
	///**@internal 发射粒子最小时间间隔。*/
	//private var _minEmissionTime:Number;
	/**@internal */
	private _velocityOverLifetime: VelocityOverLifetime = null;
	/**@internal */
	private _colorOverLifetime: ColorOverLifetime = null;
	/**@internal */
	private _sizeOverLifetime: SizeOverLifetime = null;
	/**@internal */
	private _rotationOverLifetime: RotationOverLifetime = null;
	/**@internal */
	private _textureSheetAnimation: TextureSheetAnimation = null;
	/**@internal */
	private _startLifetimeType: number = 0;
	/**@internal */
	private _startLifetimeConstant: number = 0;
	/**@internal */
	private _startLifeTimeGradient: GradientDataNumber = null;
	/**@internal */
	private _startLifetimeConstantMin: number = 0;
	/**@internal */
	private _startLifetimeConstantMax: number = 0;
	/**@internal */
	private _startLifeTimeGradientMin: GradientDataNumber = null;
	/**@internal */
	private _startLifeTimeGradientMax: GradientDataNumber = null;
	/**@internal */
	private _maxStartLifetime: number = 0;

	/** @internal */
	private _uvLength: Vector2 = new Vector2();//TODO:
	/** @internal */
	private _vertexStride: number = 0;
	/** @internal */
	private _indexStride: number = 0;
	/**@internal */
	private _vertexBuffer: VertexBuffer3D = null;
	/**@internal */
	private _indexBuffer: IndexBuffer3D = null;
	/** @internal */
	private _bufferState: BufferState = new BufferState();
	/**@internal */
	private _updateMask:number = 0;

	/**@internal */
	_currentTime: number = 0;
	/**@internal */
	_startUpdateLoopCount: number = 0;
	/**@internal */
	_rand: Rand = null;
	/**@internal */
	_randomSeeds: Uint32Array = null;

	/**粒子运行的总时长，单位为秒。*/
	duration: number = 0;
	/**是否循环。*/
	looping: boolean = false;
	/**是否预热。暂不支持*/
	prewarm: boolean = false;
	/**开始延迟类型，0为常量模式,1为随机随机双常量模式，不能和prewarm一起使用。*/
	startDelayType: number = 0;
	/**开始播放延迟，不能和prewarm一起使用。*/
	startDelay: number = 0;
	/**开始播放最小延迟，不能和prewarm一起使用。*/
	startDelayMin: number = 0;
	/**开始播放最大延迟，不能和prewarm一起使用。*/
	startDelayMax: number = 0;

	/**开始速度模式，0为恒定速度，2为两个恒定速度的随机插值。缺少1、3模式*/
	startSpeedType: number = 0;
	/**开始速度,0模式。*/
	startSpeedConstant: number = 0;
	/**最小开始速度,1模式。*/
	startSpeedConstantMin: number = 0;
	/**最大开始速度,1模式。*/
	startSpeedConstantMax: number = 0;

	/**开始尺寸是否为3D模式。*/
	threeDStartSize: boolean = false;
	/**开始尺寸模式,0为恒定尺寸，2为两个恒定尺寸的随机插值。缺少1、3模式和对应的二种3D模式*/
	startSizeType: number = 0;
	/**开始尺寸，0模式。*/
	startSizeConstant: number = 0;
	/**开始三维尺寸，0模式。*/
	startSizeConstantSeparate: Vector3 = null;
	/**最小开始尺寸，2模式。*/
	startSizeConstantMin: number = 0;
	/**最大开始尺寸，2模式。*/
	startSizeConstantMax: number = 0;
	/**最小三维开始尺寸，2模式。*/
	startSizeConstantMinSeparate: Vector3 = null;
	/**最大三维开始尺寸，2模式。*/
	startSizeConstantMaxSeparate: Vector3 = null;

	/**3D开始旋转。*/
	threeDStartRotation: boolean = false;
	/**开始旋转模式,0为恒定尺寸，2为两个恒定旋转的随机插值,缺少2种模式,和对应的四种3D模式。*/
	startRotationType: number = 0;
	/**开始旋转，0模式。*/
	startRotationConstant: number = 0;
	/**开始三维旋转，0模式。*/
	startRotationConstantSeparate: Vector3 = null;
	/**最小开始旋转，1模式。*/
	startRotationConstantMin: number = 0;
	/**最大开始旋转，1模式。*/
	startRotationConstantMax: number = 0;
	/**最小开始三维旋转，1模式。*/
	startRotationConstantMinSeparate: Vector3 = null;
	/**最大开始三维旋转，1模式。*/
	startRotationConstantMaxSeparate: Vector3 = null;

	/**随机旋转方向，范围为0.0到1.0*/
	randomizeRotationDirection: number = 0;

	/**开始颜色模式，0为恒定颜色，2为两个恒定颜色的随机插值,缺少2种模式。*/
	startColorType: number = 0;
	/**开始颜色，0模式。*/
	startColorConstant: Vector4 = new Vector4(1, 1, 1, 1);;
	/**最小开始颜色，1模式。*/
	startColorConstantMin: Vector4 = new Vector4(0, 0, 0, 0);
	/**最大开始颜色，1模式。*/
	startColorConstantMax: Vector4 = new Vector4(1, 1, 1, 1);

	/**重力敏感度。*/
	gravityModifier: number = 0;
	/**模拟器空间,0为World,1为Local。暂不支持Custom。*/
	simulationSpace: number = 0;
	/**粒子的播放速度。 */
	simulationSpeed: number = 1.0;
	/**缩放模式，0为Hiercachy,1为Local,2为World。*/
	scaleMode: number = 1;
	/**激活时是否自动播放。*/
	playOnAwake: boolean = false;

	/**随机种子,注:play()前设置有效。*/
	randomSeed: Uint32Array = null;
	/**是否使用随机种子。 */
	autoRandomSeed: boolean = false;

	/**是否为性能模式,性能模式下会延迟粒子释放。*/
	isPerformanceMode: boolean = false;

	/**最大粒子数。*/
	get maxParticles(): number {
		return this._bufferMaxParticles - 1;
	}

	set maxParticles(value: number) {//TODO:是否要重置其它参数
		var newMaxParticles: number = value + 1;
		if (newMaxParticles !== this._bufferMaxParticles) {
			this._bufferMaxParticles = newMaxParticles;
			this._initBufferDatas();
		}
	}

	/**
	 * 获取发射器。
	 */
	get emission(): Emission {
		return this._emission;
	}


	/**
	 * 粒子存活个数。
	 */
	get aliveParticleCount(): number {
		if (this._firstNewElement >= this._firstRetiredElement)
			return this._firstNewElement - this._firstRetiredElement;
		else
			return this._bufferMaxParticles - this._firstRetiredElement + this._firstNewElement;
	}

	/**
	 * 一次循环内的累计时间。
	 */
	get emissionTime(): number {
		return this._emissionTime > this.duration ? this.duration : this._emissionTime;
	}

	/**
	 * 形状。
	 */
	get shape(): BaseShape {
		return this._shape;
	}

	set shape(value: BaseShape) {
		if (this._shape !== value) {
			if (value && value.enable)
				this._owner._render._shaderValues.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SHAPE);
			else
				this._owner._render._shaderValues.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SHAPE);
			this._shape = value;
		}
	}

	/**
	 * 是否存活。
	 */
	get isAlive(): boolean {
		if (this._isPlaying || this.aliveParticleCount > 0)//TODO:暂时忽略retired
			return true;

		return false;
	}

	/**
	 * 是否正在发射。
	 */
	get isEmitting(): boolean {
		return this._isEmitting;
	}

	/**
	 * 是否正在播放。
	 */
	get isPlaying(): boolean {
		return this._isPlaying;
	}

	/**
	 * 是否已暂停。
	 */
	get isPaused(): boolean {
		return this._isPaused;
	}

	/**
	 * 开始生命周期模式,0为固定时间，1为渐变时间，2为两个固定之间的随机插值,3为两个渐变时间的随机插值。
	 */
	get startLifetimeType(): number {
		return this._startLifetimeType;
	}

	set startLifetimeType(value: number) {
		//if (value !== _startLifetimeType){
		var i: number, n: number;
		switch (this.startLifetimeType) {
			case 0:
				this._maxStartLifetime = this.startLifetimeConstant;
				break;
			case 1:
				this._maxStartLifetime = -Number.MAX_VALUE;
				var startLifeTimeGradient: GradientDataNumber = startLifeTimeGradient;
				for (i = 0, n = startLifeTimeGradient.gradientCount; i < n; i++)
					this._maxStartLifetime = Math.max(this._maxStartLifetime, startLifeTimeGradient.getValueByIndex(i));
				break;
			case 2:
				this._maxStartLifetime = Math.max(this.startLifetimeConstantMin, this.startLifetimeConstantMax);
				break;
			case 3:
				this._maxStartLifetime = -Number.MAX_VALUE;
				var startLifeTimeGradientMin: GradientDataNumber = startLifeTimeGradientMin;
				for (i = 0, n = startLifeTimeGradientMin.gradientCount; i < n; i++)
					this._maxStartLifetime = Math.max(this._maxStartLifetime, startLifeTimeGradientMin.getValueByIndex(i));
				var startLifeTimeGradientMax: GradientDataNumber = startLifeTimeGradientMax;
				for (i = 0, n = startLifeTimeGradientMax.gradientCount; i < n; i++)
					this._maxStartLifetime = Math.max(this._maxStartLifetime, startLifeTimeGradientMax.getValueByIndex(i));
				break;
		}
		this._startLifetimeType = value;
		//}
	}

	/**
	 * 开始生命周期，0模式,单位为秒。
	 */
	get startLifetimeConstant(): number {
		return this._startLifetimeConstant;
	}

	set startLifetimeConstant(value: number) {
		if (this._startLifetimeType === 0)
			this._maxStartLifetime = value;
		this._startLifetimeConstant = value;
	}

	/**
	 * 开始渐变生命周期，1模式,单位为秒。
	 */
	get startLifeTimeGradient(): GradientDataNumber {
		return this._startLifeTimeGradient;
	}

	set startLifeTimeGradient(value: GradientDataNumber) {//无法使用if (_startLifeTimeGradient !== value)过滤，同一个GradientDataNumber可能修改了值,因此所有startLifeTime属性都统一处理
		if (this._startLifetimeType === 1) {
			this._maxStartLifetime = -Number.MAX_VALUE;
			for (var i: number = 0, n: number = value.gradientCount; i < n; i++)
				this._maxStartLifetime = Math.max(this._maxStartLifetime, value.getValueByIndex(i));
		}
		this._startLifeTimeGradient = value;
	}

	/**
	 * 最小开始生命周期，2模式,单位为秒。
	 */
	get startLifetimeConstantMin(): number {
		return this._startLifetimeConstantMin;
	}

	set startLifetimeConstantMin(value: number) {
		if (this._startLifetimeType === 2)
			this._maxStartLifetime = Math.max(value, this._startLifetimeConstantMax);
		this._startLifetimeConstantMin = value;
	}


	/**
	 * 最大开始生命周期，2模式,单位为秒。
	 */
	get startLifetimeConstantMax(): number {
		return this._startLifetimeConstantMax;
	}

	set startLifetimeConstantMax(value: number) {
		if (this._startLifetimeType === 2)
			this._maxStartLifetime = Math.max(this._startLifetimeConstantMin, value);
		this._startLifetimeConstantMax = value;
	}



	/**
	 * 开始渐变最小生命周期，3模式,单位为秒。
	 */
	get startLifeTimeGradientMin(): GradientDataNumber {
		return this._startLifeTimeGradientMin;
	}

	set startLifeTimeGradientMin(value: GradientDataNumber) {
		if (this._startLifetimeType === 3) {
			var i: number, n: number;
			this._maxStartLifetime = -Number.MAX_VALUE;
			for (i = 0, n = value.gradientCount; i < n; i++)
				this._maxStartLifetime = Math.max(this._maxStartLifetime, value.getValueByIndex(i));
			for (i = 0, n = this._startLifeTimeGradientMax.gradientCount; i < n; i++)
				this._maxStartLifetime = Math.max(this._maxStartLifetime, this._startLifeTimeGradientMax.getValueByIndex(i));
		}
		this._startLifeTimeGradientMin = value;
	}

	/**
	 * 开始渐变最大生命周期，3模式,单位为秒。
	 */
	get startLifeTimeGradientMax(): GradientDataNumber {
		return this._startLifeTimeGradientMax;
	}

	set startLifeTimeGradientMax(value: GradientDataNumber) {
		if (this._startLifetimeType === 3) {
			var i: number, n: number;
			this._maxStartLifetime = -Number.MAX_VALUE;
			for (i = 0, n = this._startLifeTimeGradientMin.gradientCount; i < n; i++)
				this._maxStartLifetime = Math.max(this._maxStartLifetime, this._startLifeTimeGradientMin.getValueByIndex(i));
			for (i = 0, n = value.gradientCount; i < n; i++)
				this._maxStartLifetime = Math.max(this._maxStartLifetime, value.getValueByIndex(i));
		}
		this._startLifeTimeGradientMax = value;
	}

	/**
	 * 生命周期速度,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
	 */
	get velocityOverLifetime(): VelocityOverLifetime {
		return this._velocityOverLifetime;
	}

	set velocityOverLifetime(value: VelocityOverLifetime) {
		var shaDat: ShaderData = this._owner._render._shaderValues;
		if (value) {
			var velocity: GradientVelocity = value.velocity;
			var velocityType: number = velocity.type;
			if (value.enable) {
				switch (velocityType) {
					case 0:
						shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMECONSTANT);
						break;
					case 1:
						shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMECURVE);
						break;
					case 2:
						shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCONSTANT);
						break;
					case 3:
						shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCURVE);
						break;
				}

			} else {
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMECONSTANT);
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMECURVE);
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCONSTANT);
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCURVE);
			}

			switch (velocityType) {
				case 0:
					shaDat.setVector3(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYCONST, velocity.constant);
					break;
				case 1:
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTX, velocity.gradientX._elements);
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTY, velocity.gradientY._elements);
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTZ, velocity.gradientZ._elements);
					break;
				case 2:
					shaDat.setVector3(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYCONST, velocity.constantMin);
					shaDat.setVector3(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYCONSTMAX, velocity.constantMax);
					break;
				case 3:
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTX, velocity.gradientXMin._elements);
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTXMAX, velocity.gradientXMax._elements);
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTY, velocity.gradientYMin._elements);
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTYMAX, velocity.gradientYMax._elements);
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTZ, velocity.gradientZMin._elements);
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTZMAX, velocity.gradientZMax._elements);
					break;
			}
			shaDat.setInt(ShuriKenParticle3DShaderDeclaration.VOLSPACETYPE, value.space);
		} else {
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMECONSTANT);
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMECURVE);
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCONSTANT);
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCURVE);
		}
		this._velocityOverLifetime = value;
	}

	/**
	 * 生命周期颜色,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
	 */
	get colorOverLifetime(): ColorOverLifetime {
		return this._colorOverLifetime;
	}

	set colorOverLifetime(value: ColorOverLifetime) {
		var shaDat: ShaderData = this._owner._render._shaderValues;
		if (value) {
			var color: GradientColor = value.color;
			if (value.enable) {
				switch (color.type) {
					case 1:
						shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_COLOROVERLIFETIME);
						break;
					case 3:
						shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RANDOMCOLOROVERLIFETIME);
						break;
				}
			} else {
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_COLOROVERLIFETIME);
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RANDOMCOLOROVERLIFETIME);
			}

			switch (color.type) {
				case 1:
					var gradientColor: Gradient = color.gradient;
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.COLOROVERLIFEGRADIENTALPHAS, gradientColor._alphaElements);
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.COLOROVERLIFEGRADIENTCOLORS, gradientColor._rgbElements);
					break;
				case 3:
					var minGradientColor: Gradient = color.gradientMin;
					var maxGradientColor: Gradient = color.gradientMax;
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.COLOROVERLIFEGRADIENTALPHAS, minGradientColor._alphaElements);
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.COLOROVERLIFEGRADIENTCOLORS, minGradientColor._rgbElements);
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.MAXCOLOROVERLIFEGRADIENTALPHAS, maxGradientColor._alphaElements);
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.MAXCOLOROVERLIFEGRADIENTCOLORS, maxGradientColor._rgbElements);
					break;
			}
		} else {
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_COLOROVERLIFETIME);
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RANDOMCOLOROVERLIFETIME);

			shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.COLOROVERLIFEGRADIENTALPHAS, gradientColor._alphaElements);
			shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.COLOROVERLIFEGRADIENTCOLORS, gradientColor._rgbElements);
			shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.COLOROVERLIFEGRADIENTALPHAS, minGradientColor._alphaElements);
			shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.COLOROVERLIFEGRADIENTCOLORS, minGradientColor._rgbElements);
			shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.MAXCOLOROVERLIFEGRADIENTALPHAS, maxGradientColor._alphaElements);
			shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.MAXCOLOROVERLIFEGRADIENTCOLORS, maxGradientColor._rgbElements);
		}
		this._colorOverLifetime = value;
	}

	/**
	 * 生命周期尺寸,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
	 */
	get sizeOverLifetime(): SizeOverLifetime {
		return this._sizeOverLifetime;
	}

	set sizeOverLifetime(value: SizeOverLifetime) {
		var shaDat: ShaderData = this._owner._render._shaderValues;
		if (value) {
			var size: GradientSize = value.size;
			var sizeSeparate: boolean = size.separateAxes;
			var sizeType: number = size.type;
			if (value.enable) {
				switch (sizeType) {
					case 0:
						if (sizeSeparate)
							shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMECURVESEPERATE);
						else
							shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMECURVE);
						break;
					case 2:
						if (sizeSeparate)
							shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVESSEPERATE);
						else
							shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVES);
						break;
				}

			} else {
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMECURVE);
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMECURVESEPERATE);
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVES);
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVESSEPERATE);
			}

			switch (sizeType) {
				case 0:
					if (sizeSeparate) {
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENTX, size.gradientX._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENTY, size.gradientY._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.SOLSizeGradientZ, size.gradientZ._elements);
					} else {
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENT, size.gradient._elements);
					}
					break;
				case 2:
					if (sizeSeparate) {
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENTX, size.gradientXMin._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENTXMAX, size.gradientXMax._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENTY, size.gradientYMin._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENTYMAX, size.gradientYMax._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.SOLSizeGradientZ, size.gradientZMin._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.SOLSizeGradientZMAX, size.gradientZMax._elements);
					} else {
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENT, size.gradientMin._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.SOLSizeGradientMax, size.gradientMax._elements);
					}
					break;
			}
		} else {
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMECURVE);
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMECURVESEPERATE);
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVES);
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVESSEPERATE);
		}
		this._sizeOverLifetime = value;
	}

	/**
	 * 生命周期旋转,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
	 */
	get rotationOverLifetime(): RotationOverLifetime {
		return this._rotationOverLifetime;
	}

	set rotationOverLifetime(value: RotationOverLifetime) {
		var shaDat: ShaderData = this._owner._render._shaderValues;
		if (value) {
			var rotation: GradientAngularVelocity = value.angularVelocity;

			if (!rotation)//TODO:兼容代码，RotationOverLifetime未支持全可能为空
				return

			var rotationSeparate: boolean = rotation.separateAxes;
			var rotationType: number = rotation.type;
			if (value.enable) {
				if (rotationSeparate)
					shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMESEPERATE);
				else
					shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIME);
				switch (rotationType) {
					case 0:
						shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMECONSTANT);
						break;
					case 1:
						shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMECURVE);
						break;
					case 2:
						shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMERANDOMCONSTANTS);
						break;
					case 3:
						shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMERANDOMCURVES);
						break;
				}
			} else {
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIME);
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMESEPERATE);
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMECONSTANT);
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMECURVE);
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMERANDOMCONSTANTS);
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMERANDOMCURVES);
			}

			switch (rotationType) {
				case 0:
					if (rotationSeparate) {
						shaDat.setVector3(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYCONSTSEPRARATE, rotation.constantSeparate);
					} else {
						shaDat.setNumber(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYCONST, rotation.constant);
					}
					break;
				case 1:
					if (rotationSeparate) {
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTX, rotation.gradientX._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTY, rotation.gradientY._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTZ, rotation.gradientZ._elements);
					} else {
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENT, rotation.gradient._elements);
					}
					break;
				case 2:
					if (rotationSeparate) {
						shaDat.setVector3(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYCONSTSEPRARATE, rotation.constantMinSeparate);
						shaDat.setVector3(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYCONSTMAXSEPRARATE, rotation.constantMaxSeparate);
					} else {
						shaDat.setNumber(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYCONST, rotation.constantMin);
						shaDat.setNumber(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYCONSTMAX, rotation.constantMax);
					}
					break;
				case 3:
					if (rotationSeparate) {
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTX, rotation.gradientXMin._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTXMAX, rotation.gradientXMax._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTY, rotation.gradientYMin._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTYMAX, rotation.gradientYMax._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTZ, rotation.gradientZMin._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTZMAX, rotation.gradientZMax._elements);
						//shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTW, rotation.gradientWMin._elements);
						//shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTWMAX, rotation.gradientWMax._elements);
					} else {
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENT, rotation.gradientMin._elements);
						shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTMAX, rotation.gradientMax._elements);
					}
					break;
			}
		} else {
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIME);
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMESEPERATE);
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMECONSTANT);
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMECURVE);
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMERANDOMCONSTANTS);
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMERANDOMCURVES);
		}
		this._rotationOverLifetime = value;
	}

	/**
	 * 生命周期纹理动画,注意:如修改该值的某些属性,需重新赋值此属性才可生效。
	 */
	get textureSheetAnimation(): TextureSheetAnimation {
		return this._textureSheetAnimation;
	}

	set textureSheetAnimation(value: TextureSheetAnimation) {
		var shaDat: ShaderData = this._owner._render._shaderValues;
		if (value) {
			var frameOverTime: FrameOverTime = value.frame;
			var textureAniType: number = frameOverTime.type;
			if (value.enable) {
				switch (textureAniType) {
					case 1:
						shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_TEXTURESHEETANIMATIONCURVE);
						break;
					case 3:
						shaDat.addDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_TEXTURESHEETANIMATIONRANDOMCURVE);
						break;

				}
			} else {
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_TEXTURESHEETANIMATIONCURVE);
				shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_TEXTURESHEETANIMATIONRANDOMCURVE);
			}

			if (textureAniType === 1 || textureAniType === 3) {
				shaDat.setNumber(ShuriKenParticle3DShaderDeclaration.TEXTURESHEETANIMATIONCYCLES, value.cycles);
				var title: Vector2 = value.tiles;
				var _uvLengthE: Vector2 = this._uvLength;
				_uvLengthE.x = 1.0 / title.x;
				_uvLengthE.y = 1.0 / title.y;
				shaDat.setVector2(ShuriKenParticle3DShaderDeclaration.TEXTURESHEETANIMATIONSUBUVLENGTH, this._uvLength);
			}
			switch (textureAniType) {
				case 1:
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.TEXTURESHEETANIMATIONGRADIENTUVS, frameOverTime.frameOverTimeData._elements);
					break;
				case 3:
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.TEXTURESHEETANIMATIONGRADIENTUVS, frameOverTime.frameOverTimeDataMin._elements);
					shaDat.setBuffer(ShuriKenParticle3DShaderDeclaration.TEXTURESHEETANIMATIONGRADIENTMAXUVS, frameOverTime.frameOverTimeDataMax._elements);
					break;
			}

		} else {
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_TEXTURESHEETANIMATIONCURVE);
			shaDat.removeDefine(ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_TEXTURESHEETANIMATIONRANDOMCURVE);
		}
		this._textureSheetAnimation = value;
	}



	constructor(owner: ShuriKenParticle3D) {
		super();
		this._firstActiveElement = 0;
		this._firstNewElement = 0;
		this._firstFreeElement = 0;
		this._firstRetiredElement = 0;

		this._owner = owner;
		this._ownerRender = owner.particleRenderer;
		this._boundingBoxCorners = [];
		this._boundingSphere = new BoundSphere(new Vector3(), Number.MAX_VALUE);//TODO:
		this._boundingBox = new BoundBox(new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE), new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE));//TODO:
		this._bounds = new Bounds(this._boundingBox.min, this._boundingBox.max);
		this._useCustomBounds = false;

		this._currentTime = 0;

		this._isEmitting = false;
		this._isPlaying = false;
		this._isPaused = false;
		this._burstsIndex = 0;
		this._frameRateTime = 0;
		this._emissionTime = 0;
		this._totalDelayTime = 0;
		this._simulateUpdate = false;

		this._bufferMaxParticles = 1;
		this.duration = 5.0;
		this.looping = true;
		this.prewarm = false;
		this.startDelayType = 0;
		this.startDelay = 0.0;
		this.startDelayMin = 0.0;
		this.startDelayMax = 0.0;

		this._startLifetimeType = 0;
		this._startLifetimeConstant = 5.0;
		this._startLifeTimeGradient = new GradientDataNumber();
		this._startLifetimeConstantMin = 0.0;
		this._startLifetimeConstantMax = 5.0;
		this._startLifeTimeGradientMin = new GradientDataNumber();
		this._startLifeTimeGradientMax = new GradientDataNumber();
		this._maxStartLifetime = 5.0;//_startLifetimeType默认为0，_startLifetimeConstant为5.0,因此该值为5.0

		this.startSpeedType = 0;
		this.startSpeedConstant = 5.0;
		this.startSpeedConstantMin = 0.0;
		this.startSpeedConstantMax = 5.0;
		this.threeDStartSize = false;
		this.startSizeType = 0;
		this.startSizeConstant = 1;
		this.startSizeConstantSeparate = new Vector3(1, 1, 1);
		this.startSizeConstantMin = 0;
		this.startSizeConstantMax = 1;
		this.startSizeConstantMinSeparate = new Vector3(0, 0, 0);
		this.startSizeConstantMaxSeparate = new Vector3(1, 1, 1);

		this.threeDStartRotation = false;
		this.startRotationType = 0;
		this.startRotationConstant = 0;
		this.startRotationConstantSeparate = new Vector3(0, 0, 0);
		this.startRotationConstantMin = 0.0;
		this.startRotationConstantMax = 0.0;
		this.startRotationConstantMinSeparate = new Vector3(0, 0, 0);
		this.startRotationConstantMaxSeparate = new Vector3(0, 0, 0);

		this.gravityModifier = 0.0;
		this.simulationSpace = 1;
		this.scaleMode = 1;
		this.playOnAwake = true;
		this._rand = new Rand(0);
		this.autoRandomSeed = true;
		this.randomSeed = new Uint32Array(1);
		this._randomSeeds = new Uint32Array(ShurikenParticleSystem._RANDOMOFFSET.length);
		this.isPerformanceMode = true;

		this._emission = new Emission();
		this._emission.enable = true;
	}

	/**
	 * @internal
	 */
	_getVertexBuffer(index: number = 0): VertexBuffer3D {
		if (index === 0)
			return this._vertexBuffer;
		else
			return null;
	}

	/**
	 * @internal
	 */
	_getIndexBuffer(): IndexBuffer3D {
		return this._indexBuffer;
	}

	/**
	 * @internal
	 */
	_generateBoundingSphere(): void {//TODO：应在本类内部处理。
		var centerE: Vector3 = this._boundingSphere.center;
		centerE.x = 0;
		centerE.y = 0;
		centerE.z = 0;
		this._boundingSphere.radius = Number.MAX_VALUE;
	}

	/**
	 * @internal
	 */
	_generateBounds(): void {
		var particle: ShuriKenParticle3D = (<ShuriKenParticle3D>this._owner);
		var particleRender: ShurikenParticleRenderer = particle.particleRenderer;
		var boundsMin: Vector3 = this._bounds.getMin();
		var boundsMax: Vector3 = this._bounds.getMax();

		// lifeTime
		var time: number = 0;
		switch (this.startLifetimeType) {
			case 0: // 固定时间
				time = this._startLifetimeConstant;
				break;
			case 2: // 两个固定时间随机值
				time = this._startLifetimeConstantMax;
				break;
			case 1: // 渐变时间
			case 3: // 两个渐变时间随机值
			default:
				// todo 不支持模式
				break;
		}

		// speed
		var speedOrigan: number = 0;
		switch (this.startSpeedType) {
			case 0: // 恒定速度
				speedOrigan = this.startSpeedConstant;
				break;
			case 2: // 两个固定值间
				speedOrigan = this.startSpeedConstantMax;
				break;
			case 1:
			case 3:
			default:
				// todo 不支持模式
				break;
		}

		// size
		var maxSizeScale = 0;
		if (this.threeDStartSize) {
			switch (this.startSizeType) {
				case 0: // 恒定尺寸
					maxSizeScale = Math.max(this.startSizeConstantSeparate.x, this.startSizeConstantSeparate.y, this.startSizeConstantSeparate.z);
					break;
				case 2: // 两个固定尺寸之间
					maxSizeScale = Math.max(this.startSizeConstantMaxSeparate.x, this.startSizeConstantMaxSeparate.y, this.startSizeConstantMaxSeparate.z);
					break;
				case 1:
				case 3:
				default:
					// todo 不支持模式
					break;
			}
		}
		else {
			switch (this.startSizeType) {
				case 0: // 恒定尺寸
					maxSizeScale = this.startSizeConstant;
					break;
				case 2: // 两个固定尺寸之间
					maxSizeScale = this.startSizeConstantMax;
					break;
				case 1:
				case 3:
				default:
					// todo 不支持模式
					break;
			}
		}

		// shape
		var zDirectionSpeed: Vector3 = ShurikenParticleSystem._tempVector30;
		var fDirectionSpeed: Vector3 = ShurikenParticleSystem._tempVector31;
		var zEmisionOffsetXYZ: Vector3 = ShurikenParticleSystem._tempVector32;
		var fEmisionOffsetXYZ: Vector3 = ShurikenParticleSystem._tempVector33;

		zDirectionSpeed.setValue(0, 0, 1);
		fDirectionSpeed.setValue(0, 0, 0);
		zEmisionOffsetXYZ.setValue(0, 0, 0);
		fEmisionOffsetXYZ.setValue(0, 0, 0);

		if (this.shape && this.shape.enable) {
			switch (this.shape.shapeType) {
				case ParticleSystemShapeType.Sphere:
					var sphere: SphereShape = <SphereShape>this.shape;
					zDirectionSpeed.setValue(1, 1, 1);
					fDirectionSpeed.setValue(1, 1, 1);
					zEmisionOffsetXYZ.setValue(sphere.radius, sphere.radius, sphere.radius);
					fEmisionOffsetXYZ.setValue(sphere.radius, sphere.radius, sphere.radius);
					break;
				case ParticleSystemShapeType.Hemisphere:
					var hemiShpere: HemisphereShape = <HemisphereShape>this.shape;
					zDirectionSpeed.setValue(1, 1, 1);
					fDirectionSpeed.setValue(1, 1, 1);
					zEmisionOffsetXYZ.setValue(hemiShpere.radius, hemiShpere.radius, hemiShpere.radius);
					fEmisionOffsetXYZ.setValue(hemiShpere.radius, hemiShpere.radius, 0.0);
					break;
				case ParticleSystemShapeType.Cone:
					var cone: ConeShape = <ConeShape>this.shape;
					// Base || BaseShell
					if (cone.emitType == 0 || cone.emitType == 1) {
						// todo angle define
						// var angle: number = cone.angle * Math.PI / 180;
						var angle: number = cone.angle;
						var sinAngle: number = Math.sin(angle);
						zDirectionSpeed.setValue(sinAngle, sinAngle, 1.0);
						fDirectionSpeed.setValue(sinAngle, sinAngle, 0.0);
						zEmisionOffsetXYZ.setValue(cone.radius, cone.radius, 0.0);
						fEmisionOffsetXYZ.setValue(cone.radius, cone.radius, 0.0);
						break;
					}
					// Volume || VolumeShell
					else if (cone.emitType == 2 || cone.emitType == 3) {
						// var angle: number = cone.angle * Math.PI / 180;
						var angle: number = cone.angle;
						var sinAngle: number = Math.sin(angle);
						var coneLength: number = cone.length;
						zDirectionSpeed.setValue(sinAngle, sinAngle, 1.0);
						fDirectionSpeed.setValue(sinAngle, sinAngle, 0.0);
						var tanAngle: number = Math.tan(angle);
						var rPLCT: number = cone.radius + coneLength * tanAngle;
						zEmisionOffsetXYZ.setValue(rPLCT, rPLCT, coneLength);
						fEmisionOffsetXYZ.setValue(rPLCT, rPLCT, 0.0);
					}
					break;
				case ParticleSystemShapeType.Box:
					var box: BoxShape = <BoxShape>this.shape;
					if (this.shape.randomDirection != 0) {
						zDirectionSpeed.setValue(1, 1, 1);
						fDirectionSpeed.setValue(1, 1, 1);
					}
					zEmisionOffsetXYZ.setValue(box.x / 2, box.y / 2, box.z / 2);
					fEmisionOffsetXYZ.setValue(box.x / 2, box.y / 2, box.z / 2);
					break;
				case ParticleSystemShapeType.Circle:
					var circle: CircleShape = <CircleShape>this.shape;
					zDirectionSpeed.setValue(1, 1, 1);
					fDirectionSpeed.setValue(1, 1, 1);
					zEmisionOffsetXYZ.setValue(circle.radius, circle.radius, 0);
					fEmisionOffsetXYZ.setValue(circle.radius, circle.radius, 0);
					break;
				default:
					break;
			}
		}

		// size
		var meshSize: number = 0;
		// 是否是 mesh 模式
		var meshMode: boolean = particleRender.renderMode == 4;
		switch (particleRender.renderMode) {
			case 0: // billboard
			case 1:
			case 2:
			case 3:
				meshSize = ShurikenParticleSystem.halfKSqrtOf2;// Math.sqrt(2) / 2.0;
				break;
			case 4: // mesh
				var meshBounds: Bounds = particleRender.mesh.bounds;
				meshSize = Math.sqrt(Math.pow(meshBounds.getExtent().x, 2.0) + Math.pow(meshBounds.getExtent().y, 2.0) + Math.pow(meshBounds.getExtent().z, 2.0));
				break;
			default:
				break;
		}

		var endSizeOffset: Vector3 = ShurikenParticleSystem._tempVector36;
		endSizeOffset.setValue(1, 1, 1);
		if (this.sizeOverLifetime && this.sizeOverLifetime.enable) {
			var gradientSize: GradientSize = this.sizeOverLifetime.size;
			var maxSize: number = gradientSize.getMaxSizeInGradient(meshMode);

			endSizeOffset.setValue(maxSize, maxSize, maxSize);
		}

		var offsetSize: number = meshSize * maxSizeScale;
		Vector3.scale(endSizeOffset, offsetSize, endSizeOffset);

		// var distance: number = speedOrigan * time;
		var speedZOffset: Vector3 = ShurikenParticleSystem._tempVector34;
		var speedFOffset: Vector3 = ShurikenParticleSystem._tempVector35;

		if (speedOrigan > 0) {
			Vector3.scale(zDirectionSpeed, speedOrigan, speedZOffset);
			Vector3.scale(fDirectionSpeed, speedOrigan, speedFOffset);
		}
		else {
			Vector3.scale(zDirectionSpeed, -speedOrigan, speedFOffset);
			Vector3.scale(fDirectionSpeed, -speedOrigan, speedZOffset);
		}

		if (this.velocityOverLifetime && this.velocityOverLifetime.enable) {
			var gradientVelocity: GradientVelocity = this.velocityOverLifetime.velocity;
			var velocitySpeedOffset: Vector3 = ShurikenParticleSystem._tempVector37;
			velocitySpeedOffset.setValue(0, 0, 0);
			switch (gradientVelocity.type) {
				case 0: // 常量模式
					gradientVelocity.constant.cloneTo(velocitySpeedOffset);
					break;
				case 2: // 随机双常量模式
					gradientVelocity.constantMax.cloneTo(velocitySpeedOffset);
					break;
				case 1: // 曲线模式
					// todo 获取 曲线最大值
					var curveX: number = gradientVelocity.gradientX.getAverageValue();
					var curveY: number = gradientVelocity.gradientY.getAverageValue();
					var curveZ: number = gradientVelocity.gradientZ.getAverageValue();
					velocitySpeedOffset.setValue(curveX, curveY, curveZ);
					break;
				case 3: // 随机双曲线模式
					var xMax: number = gradientVelocity.gradientXMax.getAverageValue();
					var yMax: number = gradientVelocity.gradientYMax.getAverageValue();
					var zMax: number = gradientVelocity.gradientZMax.getAverageValue();
					velocitySpeedOffset.setValue(xMax, yMax, zMax);
					break;
				default:
					break;
			}

			// 速度空间 world
			if (this.velocityOverLifetime.space == 1) {
				Vector3.transformV3ToV3(velocitySpeedOffset, this._owner.transform.worldMatrix, velocitySpeedOffset);
			}

			Vector3.add(speedZOffset, velocitySpeedOffset, speedZOffset);
			Vector3.subtract(speedFOffset, velocitySpeedOffset, speedFOffset);

			Vector3.max(speedZOffset, Vector3._ZERO, speedZOffset);
			Vector3.max(speedFOffset, Vector3._ZERO, speedFOffset);
		}

		Vector3.scale(speedZOffset, time, speedZOffset);
		Vector3.scale(speedFOffset, time, speedFOffset);

		//gravity重力值
		var gravity: number = this.gravityModifier;
		if (gravity != 0) {
			// 记录重力影响偏移
			var gravityOffset: number = 0.5 * ShurikenParticleSystem.g * gravity * time * time;

			var speedZOffsetY = speedZOffset.y - gravityOffset;
			var speedFOffsetY = speedFOffset.y + gravityOffset;

			speedZOffsetY = speedZOffsetY > 0 ? speedZOffsetY: 0;
			speedFOffsetY = speedFOffsetY > 0 ? speedFOffsetY: 0;

			this._gravityOffset.setValue(speedZOffset.y - speedZOffsetY, speedFOffsetY - speedFOffset.y);
		}

		// speedOrigan * directionSpeed * time + directionoffset + size * maxsizeScale
		Vector3.add(speedZOffset, endSizeOffset, boundsMax);
		Vector3.add(boundsMax, zEmisionOffsetXYZ, boundsMax);

		Vector3.add(speedFOffset, endSizeOffset, boundsMin);
		Vector3.add(boundsMin, fEmisionOffsetXYZ, boundsMin);
		Vector3.scale(boundsMin, -1, boundsMin);

		this._bounds.setMin(boundsMin);
		this._bounds.setMax(boundsMax);
	}

	/**
	 * 设置 自定义 包围盒
	 */
	get customBounds(): Bounds {
		return this._customBounds;
	}

	set customBounds(value: Bounds) {
		if (value) {
			this._useCustomBounds = true;
		}
		else {
			this._useCustomBounds = false;
		}
		this._customBounds = value;
	}

	/**
	 * @internal
	 */
	_simulationSupported(): boolean {

		if (this.simulationSpace == 0) {
			return false;
		}

		// todo other propertys break procedural 

		return true;
	}

	/**
	 * @internal
	 * 计算粒子更新时间
	 */
	private _updateEmission(): void {
		if (!this.isAlive)
			return;
		if (this._simulateUpdate) {
			this._simulateUpdate = false;
		}
		else {
			var elapsedTime: number = (this._startUpdateLoopCount !== Stat.loopCount && !this._isPaused) ? ((<Scene3D>this._owner._scene)).timer._delta / 1000.0 : 0;
			elapsedTime = Math.min(ShurikenParticleSystem._maxElapsedTime, elapsedTime * this.simulationSpeed);
			this._updateParticles(elapsedTime);
		}
	}

	/**
	 * @internal
	 * 传入粒子间隔时间，更新粒子状态
	 */
	private _updateParticles(elapsedTime: number): void {
		if (this._ownerRender.renderMode === 4 && !this._ownerRender.mesh)//renderMode=4且mesh为空时不更新
			return;

		this._currentTime += elapsedTime;//计算目前粒子播放时间啊
		this._retireActiveParticles();
		this._freeRetiredParticles();

		//if (_firstActiveElement === _firstFreeElement){
		//_frameRateTime = 0//TODO:是否一起置零
		//_currentTime = 0;
		//}
		//if (_firstRetiredElement === _firstActiveElement)
		//_drawCounter = 0;

		this._totalDelayTime += elapsedTime;
		if (this._totalDelayTime < this._playStartDelay) {
			return;
		}


		if (this._emission.enable && this._isEmitting && !this._isPaused)
			this._advanceTime(elapsedTime, this._currentTime);
	}

	/**
	 * @internal
	 */
	private _updateParticlesSimulationRestart(time: number): void {
		this._firstActiveElement = 0;
		this._firstNewElement = 0;
		this._firstFreeElement = 0;
		this._firstRetiredElement = 0;

		this._burstsIndex = 0;
		this._frameRateTime = time;//TOD0:零还是time待 验证
		this._emissionTime = 0;
		this._totalDelayTime = 0;
		this._currentTime = time;


		var delayTime: number = time;
		if (delayTime < this._playStartDelay) {
			this._totalDelayTime = delayTime;
			return;
		}

		if (this._emission.enable)
			this._advanceTime(time, time);//TODO:如果time，time均为零brust无效
	}


	/**
	 * @internal
	 */
	private _retireActiveParticles(): void {
		const epsilon: number = 0.0001;
		while (this._firstActiveElement != this._firstNewElement) {
			var index: number = this._firstActiveElement * this._floatCountPerVertex * this._vertexStride;
			var timeIndex: number = index + this._timeIndex;//11为Time

			var particleAge: number = this._currentTime - this._vertices[timeIndex];
			if (particleAge + epsilon < this._vertices[index + this._startLifeTimeIndex]/*_maxLifeTime*/)//7为真实lifeTime,particleAge>0为生命周期为负时
				break;

			this._vertices[timeIndex] = this._drawCounter;
			this._firstActiveElement++;
			if (this._firstActiveElement >= this._bufferMaxParticles)
				this._firstActiveElement = 0;
		}
	}

	/**
	 * @internal
	 */
	private _freeRetiredParticles(): void {
		while (this._firstRetiredElement != this._firstActiveElement) {
			var age: number = this._drawCounter - this._vertices[this._firstRetiredElement * this._floatCountPerVertex * this._vertexStride + this._timeIndex];//11为Time
			//TODO这里会有什么bug
			if (false)
				if (age < 3)//GPU从不滞后于CPU两帧，出于显卡驱动BUG等安全因素考虑滞后三帧
					break;

			this._firstRetiredElement++;
			if (this._firstRetiredElement >= this._bufferMaxParticles)
				this._firstRetiredElement = 0;
		}
	}

	/**
	 * @internal5
	 * 增加爆炸粒子数量
	 */
	private _burst(fromTime: number, toTime: number): number {
		var totalEmitCount: number = 0;
		var bursts: Burst[] = this._emission._bursts;
		for (var n: number = bursts.length; this._burstsIndex < n; this._burstsIndex++) {//TODO:_burstsIndex问题
			var burst: Burst = bursts[this._burstsIndex];
			var burstTime: number = burst.time;
			if (fromTime <= burstTime && burstTime < toTime) {
				var emitCount: number;
				if (this.autoRandomSeed) {
					emitCount = MathUtil.lerp(burst.minCount, burst.maxCount, Math.random());
				} else {
					this._rand.seed = this._randomSeeds[0];
					emitCount = MathUtil.lerp(burst.minCount, burst.maxCount, this._rand.getFloat());
					this._randomSeeds[0] = this._rand.seed;
				}
				totalEmitCount += emitCount;
			} else {
				break;
			}
		}
		return totalEmitCount;
	}

	/**
	 * @internal
	 */
	private _advanceTime(elapsedTime: number, emitTime: number): void {
		var i: number;
		var lastEmissionTime: number = this._emissionTime;
		this._emissionTime += elapsedTime;
		var totalEmitCount: number = 0;
		if (this._emissionTime > this.duration) {
			if (this.looping) {//TODO:有while
				totalEmitCount += this._burst(lastEmissionTime, this._emissionTime);//使用_emissionTime代替duration，否则无法触发time等于duration的burst //爆裂剩余未触发的//TODO:是否可以用_playbackTime代替计算，不必结束再爆裂一次。//TODO:待确认是否累计爆裂
				this._emissionTime -= this.duration;
				this._burstsIndex = 0;
				totalEmitCount += this._burst(0, this._emissionTime);
			} else {
				totalEmitCount = Math.min(this.maxParticles - this.aliveParticleCount, totalEmitCount);
				for (i = 0; i < totalEmitCount; i++)
					this.emit(emitTime);

				this._isPlaying = false;
				this.stop();
				return;
			}
		} else {
			totalEmitCount += this._burst(lastEmissionTime, this._emissionTime);
		}
		//粒子的增加数量，不能超过maxParticles
		totalEmitCount = Math.min(this.maxParticles - this.aliveParticleCount, totalEmitCount);
		for (i = 0; i < totalEmitCount; i++)
			this.emit(emitTime);
		//粒子发射速率
		var emissionRate: number = this.emission.emissionRate;
		if (emissionRate > 0) {
			//每多少秒发射一个粒子
			var minEmissionTime: number = 1 / emissionRate;
			this._frameRateTime += minEmissionTime;
			this._frameRateTime = this._currentTime - (this._currentTime - this._frameRateTime) % this._maxStartLifetime;//大于最大声明周期的粒子一定会死亡，所以直接略过,TODO:是否更换机制
			while (this._frameRateTime <= emitTime) {
				if (this.emit(this._frameRateTime))
					this._frameRateTime += minEmissionTime;
				else
					break;
			}
			this._frameRateTime = Math.floor(emitTime / minEmissionTime) * minEmissionTime;
		}
	}

	/**
	 * @internal
	 */
	_initBufferDatas(): void {
		if (this._vertexBuffer) {//修改了maxCount以及renderMode以及Mesh等需要清空
			var memorySize: number = this._vertexBuffer._byteLength + this._indexBuffer.indexCount * 2;
			this._vertexBuffer.destroy();
			this._indexBuffer.destroy();		
			Resource._addMemory(-memorySize, -memorySize);
			//TODO:some time use clone will cause this call twice(from 'maxParticleCount' and 'renderMode'),this should optimization rewrite with special clone fun.
		}
		var gl: WebGLRenderingContext = LayaGL.instance;
		var render: ShurikenParticleRenderer = this._ownerRender;
		var renderMode: number = render.renderMode;
		if (renderMode !== -1 && this.maxParticles > 0) {
			var indices: Uint16Array, i: number, j: number, m: number, indexOffset: number, perPartOffset: number, vertexDeclaration: VertexDeclaration;
			var vbMemorySize: number = 0, memorySize: number = 0;
			var mesh: Mesh = render.mesh;
			if (renderMode === 4) {
				if (mesh) {
					// var vertexBufferCount: number = mesh._vertexBuffers.length;
					// if (vertexBufferCount > 1) {
					// 	throw new Error("ShurikenParticleSystem: submesh Count mesh be One or all subMeshes have the same vertexDeclaration.");
					// } else {
					vertexDeclaration = VertexShurikenParticleMesh.vertexDeclaration;
					this._floatCountPerVertex = vertexDeclaration.vertexStride / 4;
					this._startLifeTimeIndex = 12;
					this._timeIndex = 16;
					this._vertexStride = mesh._vertexCount;
					var totalVertexCount: number = this._bufferMaxParticles * this._vertexStride;
					var vbCount: number = Math.floor(totalVertexCount / 65535) + 1;
					var lastVBVertexCount: number = totalVertexCount % 65535;
					if (vbCount > 1) {//TODO:随后支持
						throw new Error("ShurikenParticleSystem:the maxParticleCount multiply mesh vertexCount is large than 65535.");
					}

					vbMemorySize = vertexDeclaration.vertexStride * lastVBVertexCount;
					this._vertexBuffer = new VertexBuffer3D(vbMemorySize, gl.DYNAMIC_DRAW);
					this._vertexBuffer.vertexDeclaration = vertexDeclaration;
					this._vertices = new Float32Array(this._floatCountPerVertex * lastVBVertexCount);


					this._indexStride = mesh._indexBuffer.indexCount;
					var indexDatas: Uint16Array = mesh._indexBuffer.getData();
					var indexCount: number = this._bufferMaxParticles * this._indexStride;
					this._indexBuffer = new IndexBuffer3D(IndexFormat.UInt16, indexCount, gl.STATIC_DRAW);
					indices = new Uint16Array(indexCount);

					memorySize = vbMemorySize + indexCount * 2;

					indexOffset = 0;
					for (i = 0; i < this._bufferMaxParticles; i++) {
						var indexValueOffset: number = i * this._vertexStride;
						for (j = 0, m = indexDatas.length; j < m; j++)
							indices[indexOffset++] = indexValueOffset + indexDatas[j];
					}
					this._indexBuffer.setData(indices);

					this._bufferState.bind();
					this._bufferState.applyVertexBuffer(this._vertexBuffer);
					this._bufferState.applyIndexBuffer(this._indexBuffer);
					this._bufferState.unBind();
					// }
				}
			} else {
				vertexDeclaration = VertexShurikenParticleBillboard.vertexDeclaration;
				this._floatCountPerVertex = vertexDeclaration.vertexStride / 4;
				this._startLifeTimeIndex = 7;
				this._timeIndex = 11;
				this._vertexStride = 4;
				vbMemorySize = vertexDeclaration.vertexStride * this._bufferMaxParticles * this._vertexStride;
				this._vertexBuffer = new VertexBuffer3D(vbMemorySize, gl.DYNAMIC_DRAW);
				this._vertexBuffer.vertexDeclaration = vertexDeclaration;
				this._vertices = new Float32Array(this._floatCountPerVertex * this._bufferMaxParticles * this._vertexStride);


				for (i = 0; i < this._bufferMaxParticles; i++) {
					perPartOffset = i * this._floatCountPerVertex * this._vertexStride;
					this._vertices[perPartOffset] = -0.5;
					this._vertices[perPartOffset + 1] = -0.5;
					this._vertices[perPartOffset + 2] = 0;
					this._vertices[perPartOffset + 3] = 1;

					perPartOffset += this._floatCountPerVertex;
					this._vertices[perPartOffset] = 0.5;
					this._vertices[perPartOffset + 1] = -0.5;
					this._vertices[perPartOffset + 2] = 1;
					this._vertices[perPartOffset + 3] = 1;

					perPartOffset += this._floatCountPerVertex
					this._vertices[perPartOffset] = 0.5;
					this._vertices[perPartOffset + 1] = 0.5;
					this._vertices[perPartOffset + 2] = 1;
					this._vertices[perPartOffset + 3] = 0;

					perPartOffset += this._floatCountPerVertex
					this._vertices[perPartOffset] = -0.5;
					this._vertices[perPartOffset + 1] = 0.5;
					this._vertices[perPartOffset + 2] = 0;
					this._vertices[perPartOffset + 3] = 0;
				}

				this._indexStride = 6;
				this._indexBuffer = new IndexBuffer3D(IndexFormat.UInt16, this._bufferMaxParticles * 6, gl.STATIC_DRAW);
				indices = new Uint16Array(this._bufferMaxParticles * 6);
				for (i = 0; i < this._bufferMaxParticles; i++) {
					indexOffset = i * 6;
					var firstVertex: number = i * this._vertexStride, secondVertex: number = firstVertex + 2;
					indices[indexOffset++] = firstVertex;
					indices[indexOffset++] = secondVertex;
					indices[indexOffset++] = firstVertex + 1;
					indices[indexOffset++] = firstVertex;
					indices[indexOffset++] = firstVertex + 3;
					indices[indexOffset++] = secondVertex;
				}
				this._indexBuffer.setData(indices);

				memorySize = vbMemorySize + this._bufferMaxParticles * 6 * 2;

				this._bufferState.bind();
				this._bufferState.applyVertexBuffer(this._vertexBuffer);
				this._bufferState.applyIndexBuffer(this._indexBuffer);
				this._bufferState.unBind();
			}

			Resource._addMemory(memorySize, memorySize);
		}
	}

	/**
	 * @internal
	 * @override
	 */
	destroy(): void {
		super.destroy();
		var memorySize: number = this._vertexBuffer._byteLength + this._indexBuffer.indexCount * 2;
		Resource._addMemory(-memorySize, -memorySize);
		this._bufferState.destroy();
		this._vertexBuffer.destroy();
		this._indexBuffer.destroy();
		this._emission.destroy();
		this._boundingBox = null;
		this._boundingSphere = null;
		this._boundingBoxCorners = null;
		this._bounds = null;
		this._customBounds = null;
		this._bufferState = null;
		this._vertexBuffer = null;
		this._indexBuffer = null;
		this._owner = null;
		this._vertices = null;
		this._indexBuffer = null;
		this._emission = null;
		this._shape = null;
		this.startLifeTimeGradient = null;
		this.startLifeTimeGradientMin = null;
		this.startLifeTimeGradientMax = null;
		this.startSizeConstantSeparate = null;
		this.startSizeConstantMinSeparate = null;
		this.startSizeConstantMaxSeparate = null;
		this.startRotationConstantSeparate = null;
		this.startRotationConstantMinSeparate = null;
		this.startRotationConstantMaxSeparate = null;
		this.startColorConstant = null;
		this.startColorConstantMin = null;
		this.startColorConstantMax = null;
		this._velocityOverLifetime = null;
		this._colorOverLifetime = null;
		this._sizeOverLifetime = null;
		this._rotationOverLifetime = null;
		this._textureSheetAnimation = null;
	}

	/**
	 * 发射一个粒子。
	 */
	emit(time: number): boolean {
		var position: Vector3 = ShurikenParticleSystem._tempPosition;
		var direction: Vector3 = ShurikenParticleSystem._tempDirection;
		if (this._shape && this._shape.enable) {
			if (this.autoRandomSeed)
				this._shape.generatePositionAndDirection(position, direction);
			else
				this._shape.generatePositionAndDirection(position, direction, this._rand, this._randomSeeds);
		} else {
			position.x = position.y = position.z = 0;
			direction.x = direction.y = 0;
			direction.z = 1;
		}

		return this.addParticle(position, direction, time);//TODO:提前判断优化
	}

	//增加一个粒子
	addParticle(position: Vector3, direction: Vector3, time: number): boolean {//TODO:还需优化
		Vector3.normalize(direction, direction);
		//下一个粒子
		var nextFreeParticle: number = this._firstFreeElement + 1;
		if (nextFreeParticle >= this._bufferMaxParticles)
			nextFreeParticle = 0;

		if (nextFreeParticle === this._firstRetiredElement)
			return false;

		var transform: Transform3D = this._owner.transform;
		ShurikenParticleData.create(this, this._ownerRender);

		var particleAge: number = this._currentTime - time;
		if (particleAge >= ShurikenParticleData.startLifeTime)//如果时间已大于声明周期，则直接跳过,TODO:提前优化
			return true;

		var pos: Vector3, rot: Quaternion;
		if (this.simulationSpace == 0) {
			pos = transform.position;
			rot = transform.rotation;
		}

		//StartSpeed
		var startSpeed: number;
		switch (this.startSpeedType) {
			case 0:
				startSpeed = this.startSpeedConstant;
				break;
			case 2:
				if (this.autoRandomSeed) {
					startSpeed = MathUtil.lerp(this.startSpeedConstantMin, this.startSpeedConstantMax, Math.random());
				} else {
					this._rand.seed = this._randomSeeds[8];
					startSpeed = MathUtil.lerp(this.startSpeedConstantMin, this.startSpeedConstantMax, this._rand.getFloat());
					this._randomSeeds[8] = this._rand.seed;
				}
				break;
		}


		var randomVelocityX: number, randomVelocityY: number, randomVelocityZ: number, randomColor: number, randomSize: number, randomRotation: number, randomTextureAnimation: number;
		var needRandomVelocity: boolean = this._velocityOverLifetime && this._velocityOverLifetime.enable;
		if (needRandomVelocity) {
			var velocityType: number = this._velocityOverLifetime.velocity.type;
			if (velocityType === 2 || velocityType === 3) {
				if (this.autoRandomSeed) {
					randomVelocityX = Math.random();
					randomVelocityY = Math.random();
					randomVelocityZ = Math.random();
				} else {
					this._rand.seed = this._randomSeeds[9];
					randomVelocityX = this._rand.getFloat();
					randomVelocityY = this._rand.getFloat();
					randomVelocityZ = this._rand.getFloat();
					this._randomSeeds[9] = this._rand.seed;
				}
			} else {
				needRandomVelocity = false;
			}
		} else {
			needRandomVelocity = false;
		}
		var needRandomColor: boolean = this._colorOverLifetime && this._colorOverLifetime.enable;
		if (needRandomColor) {
			var colorType: number = this._colorOverLifetime.color.type;
			if (colorType === 3) {
				if (this.autoRandomSeed) {
					randomColor = Math.random();
				} else {
					this._rand.seed = this._randomSeeds[10];
					randomColor = this._rand.getFloat();
					this._randomSeeds[10] = this._rand.seed;
				}
			} else {
				needRandomColor = false;
			}
		} else {
			needRandomColor = false;
		}
		var needRandomSize: boolean = this._sizeOverLifetime && this._sizeOverLifetime.enable;
		if (needRandomSize) {
			var sizeType: number = this._sizeOverLifetime.size.type;
			if (sizeType === 3) {
				if (this.autoRandomSeed) {
					randomSize = Math.random();
				} else {
					this._rand.seed = this._randomSeeds[11];
					randomSize = this._rand.getFloat();
					this._randomSeeds[11] = this._rand.seed;
				}
			} else {
				needRandomSize = false;
			}
		} else {
			needRandomSize = false;
		}
		var needRandomRotation: boolean = this._rotationOverLifetime && this._rotationOverLifetime.enable;
		if (needRandomRotation) {
			var rotationType: number = this._rotationOverLifetime.angularVelocity.type;
			if (rotationType === 2 || rotationType === 3) {
				if (this.autoRandomSeed) {
					randomRotation = Math.random();
				} else {
					this._rand.seed = this._randomSeeds[12];
					randomRotation = this._rand.getFloat();
					this._randomSeeds[12] = this._rand.seed;
				}
			} else {
				needRandomRotation = false;
			}
		} else {
			needRandomRotation = false;
		}
		var needRandomTextureAnimation: boolean = this._textureSheetAnimation && this._textureSheetAnimation.enable;
		if (needRandomTextureAnimation) {
			var textureAnimationType: number = this._textureSheetAnimation.frame.type;
			if (textureAnimationType === 3) {
				if (this.autoRandomSeed) {
					randomTextureAnimation = Math.random();
				} else {
					this._rand.seed = this._randomSeeds[15];
					randomTextureAnimation = this._rand.getFloat();
					this._randomSeeds[15] = this._rand.seed;
				}
			} else {
				needRandomTextureAnimation = false;
			}
		} else {
			needRandomTextureAnimation = false;
		}

		var startIndex: number = this._firstFreeElement * this._floatCountPerVertex * this._vertexStride;
		var subU: number = ShurikenParticleData.startUVInfo[0];
		var subV: number = ShurikenParticleData.startUVInfo[1];
		var startU: number = ShurikenParticleData.startUVInfo[2];
		var startV: number = ShurikenParticleData.startUVInfo[3];

		var meshVertices: Float32Array, meshVertexStride: number, meshPosOffset: number, meshCorOffset: number, meshUVOffset: number, meshVertexIndex: number;
		var render: ShurikenParticleRenderer = this._ownerRender;
		if (render.renderMode === 4) {
			var meshVB: VertexBuffer3D = render.mesh._vertexBuffer;
			meshVertices = meshVB.getFloat32Data();
			var meshVertexDeclaration: VertexDeclaration = meshVB.vertexDeclaration;
			meshPosOffset = meshVertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_POSITION0)._offset / 4;
			var colorElement: VertexElement = meshVertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_COLOR0);
			meshCorOffset = colorElement ? colorElement._offset / 4 : -1;
			var uvElement: VertexElement = meshVertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TEXTURECOORDINATE0);
			meshUVOffset = uvElement ? uvElement._offset / 4 : -1;
			meshVertexStride = meshVertexDeclaration.vertexStride / 4;
			meshVertexIndex = 0;
		} else {
			this._vertices[startIndex + 2] = startU;
			this._vertices[startIndex + 3] = startV + subV;
			var secondOffset: number = startIndex + this._floatCountPerVertex;
			this._vertices[secondOffset + 2] = startU + subU;
			this._vertices[secondOffset + 3] = startV + subV;
			var thirdOffset: number = secondOffset + this._floatCountPerVertex;
			this._vertices[thirdOffset + 2] = startU + subU;
			this._vertices[thirdOffset + 3] = startV;
			var fourthOffset: number = thirdOffset + this._floatCountPerVertex;
			this._vertices[fourthOffset + 2] = startU;
			this._vertices[fourthOffset + 3] = startV;
		}

		for (var i: number = startIndex, n: number = startIndex + this._floatCountPerVertex * this._vertexStride; i < n; i += this._floatCountPerVertex) {
			var offset: number;
			if (render.renderMode === 4) {
				offset = i;
				var vertexOffset: number = meshVertexStride * (meshVertexIndex++);
				var meshOffset: number = vertexOffset + meshPosOffset;
				this._vertices[offset++] = meshVertices[meshOffset++];
				this._vertices[offset++] = meshVertices[meshOffset++];
				this._vertices[offset++] = meshVertices[meshOffset];
				if (meshCorOffset === -1) {
					this._vertices[offset++] = 1.0;
					this._vertices[offset++] = 1.0;
					this._vertices[offset++] = 1.0;
					this._vertices[offset++] = 1.0;
				}
				else {
					meshOffset = vertexOffset + meshCorOffset;
					this._vertices[offset++] = meshVertices[meshOffset++];
					this._vertices[offset++] = meshVertices[meshOffset++];
					this._vertices[offset++] = meshVertices[meshOffset++];
					this._vertices[offset++] = meshVertices[meshOffset];
				}
				if (meshUVOffset === -1) {
					this._vertices[offset++] = 0.0;
					this._vertices[offset++] = 0.0;
				}
				else {
					meshOffset = vertexOffset + meshUVOffset;
					this._vertices[offset++] = startU + meshVertices[meshOffset++] * subU;
					this._vertices[offset++] = startV + meshVertices[meshOffset] * subV;
				}
			} else {
				offset = i + 4;
			}

			this._vertices[offset++] = position.x;
			this._vertices[offset++] = position.y;
			this._vertices[offset++] = position.z;

			this._vertices[offset++] = ShurikenParticleData.startLifeTime;

			this._vertices[offset++] = direction.x;
			this._vertices[offset++] = direction.y;
			this._vertices[offset++] = direction.z;
			this._vertices[offset++] = time;

			this._vertices[offset++] = ShurikenParticleData.startColor.x;
			this._vertices[offset++] = ShurikenParticleData.startColor.y;
			this._vertices[offset++] = ShurikenParticleData.startColor.z;
			this._vertices[offset++] = ShurikenParticleData.startColor.w;

			this._vertices[offset++] = ShurikenParticleData.startSize[0];
			this._vertices[offset++] = ShurikenParticleData.startSize[1];
			this._vertices[offset++] = ShurikenParticleData.startSize[2];

			this._vertices[offset++] = ShurikenParticleData.startRotation[0];
			this._vertices[offset++] = ShurikenParticleData.startRotation[1];
			this._vertices[offset++] = ShurikenParticleData.startRotation[2];

			//StartSpeed
			this._vertices[offset++] = startSpeed;

			// (_vertices[offset] = XX);TODO:29预留
			needRandomColor && (this._vertices[offset + 1] = randomColor);
			needRandomSize && (this._vertices[offset + 2] = randomSize);
			needRandomRotation && (this._vertices[offset + 3] = randomRotation);
			needRandomTextureAnimation && (this._vertices[offset + 4] = randomTextureAnimation);
			if (needRandomVelocity) {
				this._vertices[offset + 5] = randomVelocityX;
				this._vertices[offset + 6] = randomVelocityY;
				this._vertices[offset + 7] = randomVelocityZ;
			}

			switch (this.simulationSpace) {
				case 0:
					offset += 8;
					this._vertices[offset++] = pos.x;
					this._vertices[offset++] = pos.y;
					this._vertices[offset++] = pos.z;
					this._vertices[offset++] = rot.x;
					this._vertices[offset++] = rot.y;
					this._vertices[offset++] = rot.z;
					this._vertices[offset++] = rot.w;
					break;
				case 1:
					break;
				default:
					throw new Error("ShurikenParticleMaterial: SimulationSpace value is invalid.");
			}
		}

		this._firstFreeElement = nextFreeParticle;
		return true;
	}

	addNewParticlesToVertexBuffer(): void {
		var start: number;
		var byteStride: number = this._vertexStride * this._floatCountPerVertex * 4;
		if (this._firstNewElement < this._firstFreeElement) {
			start = this._firstNewElement * byteStride;
			this._vertexBuffer.setData(this._vertices.buffer, start, start, (this._firstFreeElement - this._firstNewElement) * byteStride);

		} else {
			start = this._firstNewElement * byteStride;
			this._vertexBuffer.setData(this._vertices.buffer, start, start, (this._bufferMaxParticles - this._firstNewElement) * byteStride);

			if (this._firstFreeElement > 0) {
				this._vertexBuffer.setData(this._vertices.buffer, 0, 0, this._firstFreeElement * byteStride);

			}
		}
		this._firstNewElement = this._firstFreeElement;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_getType(): number {
		return ShurikenParticleSystem._type;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_prepareRender(state: RenderContext3D): boolean {
		if(this._updateMask!=Stat.loopCount){
			this._updateMask = Stat.loopCount;
			this._updateEmission();
			//设备丢失时, setData  here
			if (this._firstNewElement != this._firstFreeElement)
				this.addNewParticlesToVertexBuffer();
			this._drawCounter++;
		}
			
		if (this._firstActiveElement != this._firstFreeElement)
			return true;
		else
			return false;
	}

	/**
	 * @internal
	 * @override
	 */
	_render(state: RenderContext3D): void {
		this._bufferState.bind();
		var indexCount: number;
		var gl: WebGLRenderingContext = LayaGL.instance;
		if (this._firstActiveElement < this._firstFreeElement) {
			indexCount = (this._firstFreeElement - this._firstActiveElement) * this._indexStride;
			gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 2 * this._firstActiveElement * this._indexStride);
			Stat.trianglesFaces += indexCount / 3;
			Stat.renderBatches++;
		} else {
			indexCount = (this._bufferMaxParticles - this._firstActiveElement) * this._indexStride;
			gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 2 * this._firstActiveElement * this._indexStride);
			Stat.trianglesFaces += indexCount / 3;
			Stat.renderBatches++;
			if (this._firstFreeElement > 0) {
				indexCount = this._firstFreeElement * this._indexStride;
				gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
				Stat.trianglesFaces += indexCount / 3;
				Stat.renderBatches++;
			}
		}
	}

	/**
	 * 开始发射粒子。
	 */
	play(): void {
		this._burstsIndex = 0;
		this._isEmitting = true;
		this._isPlaying = true;
		this._isPaused = false;
		this._emissionTime = 0;
		this._totalDelayTime = 0;

		if (!this.autoRandomSeed) {
			for (var i: number = 0, n: number = this._randomSeeds.length; i < n; i++)
				this._randomSeeds[i] = this.randomSeed[0] + ShurikenParticleSystem._RANDOMOFFSET[i];
		}

		switch (this.startDelayType) {
			case 0:
				this._playStartDelay = this.startDelay;
				break;
			case 1:
				if (this.autoRandomSeed) {
					this._playStartDelay = MathUtil.lerp(this.startDelayMin, this.startDelayMax, Math.random());
				} else {
					this._rand.seed = this._randomSeeds[2];
					this._playStartDelay = MathUtil.lerp(this.startDelayMin, this.startDelayMax, this._rand.getFloat());
					this._randomSeeds[2] = this._rand.seed;
				}
				break;
			default:
				throw new Error("Utils3D: startDelayType is invalid.");
		}
		this._frameRateTime = this._currentTime + this._playStartDelay;//同步频率模式发射时间,更新函数中小于延迟时间不会更新此时间。

		this._startUpdateLoopCount = Stat.loopCount;
	}

	/**
	 * 暂停发射粒子。
	 */
	pause(): void {
		this._isPaused = true;
	}

	/**
	 * 通过指定时间增加粒子播放进度，并暂停播放。
	 * @param time 进度时间.如果restart为true,粒子播放时间会归零后再更新进度。
	 * @param restart 是否重置播放状态。
	 */
	simulate(time: number, restart: boolean = true): void {
		this._simulateUpdate = true;

		if (restart) {
			this._updateParticlesSimulationRestart(time);
		}
		else {
			this._isPaused = false;//如果当前状态为暂停则无法发射粒子
			this._updateParticles(time);
		}

		this.pause();
	}

	/**
	 * 停止发射粒子。
	 */
	stop(): void {
		this._burstsIndex = 0;
		this._isEmitting = false;
		this._emissionTime = 0;
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var dest: ShurikenParticleSystem = (<ShurikenParticleSystem>destObject);

		dest._useCustomBounds = this._useCustomBounds;
		(this._customBounds) && (this._customBounds.cloneTo(dest._customBounds));		

		dest.duration = this.duration;
		dest.looping = this.looping;
		dest.prewarm = this.prewarm;
		dest.startDelayType = this.startDelayType;
		dest.startDelay = this.startDelay;
		dest.startDelayMin = this.startDelayMin;
		dest.startDelayMax = this.startDelayMax;

		dest._maxStartLifetime = this._maxStartLifetime;
		dest.startLifetimeType = this.startLifetimeType;
		dest.startLifetimeConstant = this.startLifetimeConstant;
		this.startLifeTimeGradient.cloneTo(dest.startLifeTimeGradient);
		dest.startLifetimeConstantMin = this.startLifetimeConstantMin;
		dest.startLifetimeConstantMax = this.startLifetimeConstantMax;
		this.startLifeTimeGradientMin.cloneTo(dest.startLifeTimeGradientMin);
		this.startLifeTimeGradientMax.cloneTo(dest.startLifeTimeGradientMax);

		dest.startSpeedType = this.startSpeedType;
		dest.startSpeedConstant = this.startSpeedConstant;
		dest.startSpeedConstantMin = this.startSpeedConstantMin;
		dest.startSpeedConstantMax = this.startSpeedConstantMax;

		dest.threeDStartSize = this.threeDStartSize;
		dest.startSizeType = this.startSizeType;
		dest.startSizeConstant = this.startSizeConstant;
		this.startSizeConstantSeparate.cloneTo(dest.startSizeConstantSeparate);
		dest.startSizeConstantMin = this.startSizeConstantMin;
		dest.startSizeConstantMax = this.startSizeConstantMax;
		this.startSizeConstantMinSeparate.cloneTo(dest.startSizeConstantMinSeparate);
		this.startSizeConstantMaxSeparate.cloneTo(dest.startSizeConstantMaxSeparate);

		dest.threeDStartRotation = this.threeDStartRotation;
		dest.startRotationType = this.startRotationType;
		dest.startRotationConstant = this.startRotationConstant;
		this.startRotationConstantSeparate.cloneTo(dest.startRotationConstantSeparate);
		dest.startRotationConstantMin = this.startRotationConstantMin;
		dest.startRotationConstantMax = this.startRotationConstantMax;
		this.startRotationConstantMinSeparate.cloneTo(dest.startRotationConstantMinSeparate);
		this.startRotationConstantMaxSeparate.cloneTo(dest.startRotationConstantMaxSeparate);

		dest.randomizeRotationDirection = this.randomizeRotationDirection;

		dest.startColorType = this.startColorType;
		this.startColorConstant.cloneTo(dest.startColorConstant);
		this.startColorConstantMin.cloneTo(dest.startColorConstantMin);
		this.startColorConstantMax.cloneTo(dest.startColorConstantMax);

		dest.gravityModifier = this.gravityModifier;
		dest.simulationSpace = this.simulationSpace;
		dest.scaleMode = this.scaleMode;
		dest.playOnAwake = this.playOnAwake;
		dest.autoRandomSeed = this.autoRandomSeed;
		dest.randomSeed[0] = this.randomSeed[0];

		dest.maxParticles = this.maxParticles;

		//TODO:可做更优判断
		(this._emission) && (dest._emission = this._emission.clone());
		(this.shape) && (dest.shape = this.shape.clone());
		(this.velocityOverLifetime) && (dest.velocityOverLifetime = this.velocityOverLifetime.clone());
		(this.colorOverLifetime) && (dest.colorOverLifetime = this.colorOverLifetime.clone());
		(this.sizeOverLifetime) && (dest.sizeOverLifetime = this.sizeOverLifetime.clone());
		(this.rotationOverLifetime) && (dest.rotationOverLifetime = this.rotationOverLifetime.clone());
		(this.textureSheetAnimation) && (dest.textureSheetAnimation = this.textureSheetAnimation.clone());
		//

		dest.isPerformanceMode = this.isPerformanceMode;

		dest._isEmitting = this._isEmitting;
		dest._isPlaying = this._isPlaying;
		dest._isPaused = this._isPaused;
		dest._playStartDelay = this._playStartDelay;
		dest._frameRateTime = this._frameRateTime;
		dest._emissionTime = this._emissionTime;
		dest._totalDelayTime = this._totalDelayTime;
		dest._burstsIndex = this._burstsIndex;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: ShurikenParticleSystem = new ShurikenParticleSystem(null);
		this.cloneTo(dest);
		return dest;
	}
}


