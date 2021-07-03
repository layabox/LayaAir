import { VertexShuriKenParticle } from "./VertexShuriKenParticle";
import { VertexDeclaration } from "../VertexDeclaration"
import { VertexElement } from "../VertexElement"
import { VertexElementFormat } from "../VertexElementFormat"
import { Vector3 } from "../../math/Vector3"
import { Vector4 } from "../../math/Vector4"

/**
 * @internal
 * <code>VertexShurikenParticle</code> 类用于创建粒子顶点结构。
 */
export class VertexShurikenParticleMesh extends VertexShuriKenParticle {
	/**@internal */
	private static _vertexDeclaration: VertexDeclaration;

	/**
  * @internal
  */
	static __init__(): void {
		VertexShurikenParticleMesh._vertexDeclaration = new VertexDeclaration(172, [new VertexElement(0, VertexElementFormat.Vector3, VertexShuriKenParticle.PARTICLE_POSITION0),
		new VertexElement(12, VertexElementFormat.Vector4, VertexShuriKenParticle.PARTICLE_COLOR0),
		new VertexElement(28, VertexElementFormat.Vector2, VertexShuriKenParticle.PARTICLE_TEXTURECOORDINATE0),
		new VertexElement(36, VertexElementFormat.Vector4, VertexShuriKenParticle.PARTICLE_SHAPEPOSITIONSTARTLIFETIME),
		new VertexElement(52, VertexElementFormat.Vector4, VertexShuriKenParticle.PARTICLE_DIRECTIONTIME),
		new VertexElement(68, VertexElementFormat.Vector4, VertexShuriKenParticle.PARTICLE_STARTCOLOR0),
		new VertexElement(84, VertexElementFormat.Vector3, VertexShuriKenParticle.PARTICLE_STARTSIZE),
		new VertexElement(96, VertexElementFormat.Vector3, VertexShuriKenParticle.PARTICLE_STARTROTATION),
		new VertexElement(108, VertexElementFormat.Single, VertexShuriKenParticle.PARTICLE_STARTSPEED),
		new VertexElement(112, VertexElementFormat.Vector4, VertexShuriKenParticle.PARTICLE_RANDOM0),
		new VertexElement(128, VertexElementFormat.Vector4, VertexShuriKenParticle.PARTICLE_RANDOM1),
		new VertexElement(144, VertexElementFormat.Vector3, VertexShuriKenParticle.PARTICLE_SIMULATIONWORLDPOSTION),//TODO:local模式下可省去内存
		new VertexElement(156, VertexElementFormat.Vector4, VertexShuriKenParticle.PARTICLE_SIMULATIONWORLDROTATION)]);
	}

	static get vertexDeclaration(): VertexDeclaration {
		return VertexShurikenParticleMesh._vertexDeclaration;
	}

	/**@internal */
	private _cornerTextureCoordinate: Vector4;
	/**@internal */
	private _positionStartLifeTime: Vector4;
	/**@internal */
	private _velocity: Vector3;
	/**@internal */
	private _startColor: Vector4;
	/**@internal */
	private _startSize: Vector3;
	/**@internal */
	private _startRotation0: Vector3;
	/**@internal */
	private _startRotation1: Vector3;
	/**@internal */
	private _startRotation2: Vector3;
	/**@internal */
	private _startLifeTime: number;
	/**@internal */
	private _time: number;
	/**@internal */
	private _startSpeed: number;
	/**@internal */
	private _randoms0: Vector4;
	/**@internal */
	private _randoms1: Vector4;
	/**@internal */
	private _simulationWorldPostion: Vector3;

	get cornerTextureCoordinate(): Vector4 {
		return this._cornerTextureCoordinate;
	}

	get position(): Vector4 {
		return this._positionStartLifeTime;
	}

	get velocity(): Vector3 {
		return this._velocity;
	}

	get startColor(): Vector4 {
		return this._startColor;
	}

	get startSize(): Vector3 {
		return this._startSize;
	}

	get startRotation0(): Vector3 {
		return this._startRotation0;
	}

	get startRotation1(): Vector3 {
		return this._startRotation1;
	}

	get startRotation2(): Vector3 {
		return this._startRotation2;
	}

	get startLifeTime(): number {
		return this._startLifeTime;
	}

	get time(): number {
		return this._time;
	}

	get startSpeed(): number {
		return this._startSpeed;
	}

	get random0(): Vector4 {
		return this._randoms0;
	}

	get random1(): Vector4 {
		return this._randoms1;
	}

	get simulationWorldPostion(): Vector3 {
		return this._simulationWorldPostion;
	}

	constructor(cornerTextureCoordinate: Vector4, positionStartLifeTime: Vector4, velocity: Vector3, startColor: Vector4, startSize: Vector3, startRotation0: Vector3, startRotation1: Vector3, startRotation2: Vector3, ageAddScale: number, time: number, startSpeed: number, randoms0: Vector4, randoms1: Vector4, simulationWorldPostion: Vector3) {
		super();
		this._cornerTextureCoordinate = cornerTextureCoordinate;
		this._positionStartLifeTime = positionStartLifeTime;
		this._velocity = velocity;
		this._startColor = startColor;
		this._startSize = startSize;
		this._startRotation0 = startRotation0;
		this._startRotation1 = startRotation1;
		this._startRotation2 = startRotation2;
		this._startLifeTime = ageAddScale;
		this._time = time;
		this._startSpeed = startSpeed;
		this._randoms0 = randoms0;
		this._randoms1 = randoms1;
		this._simulationWorldPostion = simulationWorldPostion;
	}

}


