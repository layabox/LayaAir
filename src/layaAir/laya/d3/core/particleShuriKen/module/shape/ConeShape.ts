import { BaseShape, ParticleSystemShapeType } from "./BaseShape";
import { ShapeUtils } from "./ShapeUtils";
import { BoundBox } from "../../../../math/BoundBox"
import { Rand } from "../../../../math/Rand"
import { Vector2 } from "../../../../../maths/Vector2";
import { Vector3 } from "../../../../../maths/Vector3";

/**
 * @en ConeShape class is used to create cone-shaped particle emitters.
 * @zh ConeShape类用于创建锥形粒子发射器。
 */
export class ConeShape extends BaseShape {
	/** @internal */
	protected static _tempPositionPoint: Vector2 = new Vector2();
	/** @internal */
	protected static _tempDirectionPoint: Vector2 = new Vector2();

	/**
	 * @en The emission angle in radians.
	 * @zh 发射角度，单位为弧度。
	 */
	angle: number;
	/**
	 * @en The radius of the emitter.
	 * @zh 发射器的半径。
	 */
	radius: number;
	/**
	 * @en The length of the cone.
	 * @zh 锥体的长度。
	 */
	length: number;
	/**
	 * @en The emission type. 0 for Base, 1 for BaseShell, 2 for Volume, 3 for VolumeShell.
	 * @zh 发射类型：0 表示基础发射，1 表示基础外壳发射，2 表示体积发射，3 表示体积外壳发射。
	 */
	emitType: number;

	/**
	 * @ignore
	 * @en Creates an instance of the ConeShape class.
	 * @zh 创建一个ConeShape实例。
	 */
	constructor() {
		super();
		this.shapeType = ParticleSystemShapeType.Cone;
		this.angle = 25.0 / 180.0 * Math.PI;
		this.radius = 1.0;
		this.length = 5.0;
		this.emitType = 0;

	}

	/**
	 * @en Emission angle 0-360
	 * @zh 发射角度0-360
	 */
	get angleDEG() {
		return this.angle * 180 / Math.PI;
	}

	set angleDEG(deg: number) {
		this.angle = deg / 180 * Math.PI;
	}


	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _getShapeBoundBox(boundBox: BoundBox): void {
		const coneRadius2: number = this.radius + this.length * Math.sin(this.angle);
		const coneLength: number = this.length * Math.cos(this.angle);

		var min: Vector3 = boundBox.min;
		min.x = min.y = -coneRadius2;
		min.z = 0;

		var max: Vector3 = boundBox.max;
		max.x = max.y = coneRadius2;
		max.z = coneLength;//TODO:是否为负
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _getSpeedBoundBox(boundBox: BoundBox): void {
		const sinA: number = Math.sin(this.angle);
		var min: Vector3 = boundBox.min;
		min.x = min.y = -sinA;
		min.z = 0;
		var max: Vector3 = boundBox.max;
		max.x = max.y = sinA;
		max.z = 1;
	}

	/** 
	 * @en Generates initial position and direction for particles.
	 * @param position The particle position.
	 * @param direction The particle direction.
	 * @param rand Random number.
	 * @param randomSeeds Array of random seeds.
	 * @zh 用于生成粒子初始位置和方向。
	 * @param position 粒子位置。
	 * @param direction 粒子方向。
	 * @param rand 随机数。
	 * @param randomSeeds 随机种子数组。
	 */
	generatePositionAndDirection(position: Vector3, direction: Vector3, rand: Rand = null, randomSeeds: Uint32Array = null): void {
		var positionPointE: Vector2 = ConeShape._tempPositionPoint;
		var positionX: number;
		var positionY: number;
		var directionPointE: Vector2;

		var dirCosA: number = Math.cos(this.angle);
		var dirSinA: number = Math.sin(this.angle);
		switch (this.emitType) {
			case 0:
				if (rand) {
					rand.seed = randomSeeds[16];
					ShapeUtils._randomPointInsideUnitCircle(ConeShape._tempPositionPoint, rand);
					randomSeeds[16] = rand.seed;
				} else {
					ShapeUtils._randomPointInsideUnitCircle(ConeShape._tempPositionPoint);
				}
				positionX = positionPointE.x;
				positionY = positionPointE.y;
				position.x = positionX * this.radius;
				position.y = positionY * this.radius;
				position.z = 0;

				if (this.randomDirection) {
					if (rand) {
						rand.seed = randomSeeds[17];
						ShapeUtils._randomPointInsideUnitCircle(ConeShape._tempDirectionPoint, rand);
						randomSeeds[17] = rand.seed;
					} else {
						ShapeUtils._randomPointInsideUnitCircle(ConeShape._tempDirectionPoint);
					}
					directionPointE = ConeShape._tempDirectionPoint;
					direction.x = directionPointE.x * dirSinA;
					direction.y = directionPointE.y * dirSinA;
				} else {
					direction.x = positionX * dirSinA;
					direction.y = positionY * dirSinA;
				}
				direction.z = dirCosA;
				break;
			case 1:
				if (rand) {
					rand.seed = randomSeeds[16];
					ShapeUtils._randomPointUnitCircle(ConeShape._tempPositionPoint, rand);
					randomSeeds[16] = rand.seed;
				} else {
					ShapeUtils._randomPointUnitCircle(ConeShape._tempPositionPoint);
				}
				positionX = positionPointE.x;
				positionY = positionPointE.y;
				position.x = positionX * this.radius;
				position.y = positionY * this.radius;
				position.z = 0;

				if (this.randomDirection) {
					if (rand) {
						rand.seed = randomSeeds[17];
						ShapeUtils._randomPointInsideUnitCircle(ConeShape._tempDirectionPoint, rand);
						randomSeeds[17] = rand.seed;
					} else {
						ShapeUtils._randomPointInsideUnitCircle(ConeShape._tempDirectionPoint);
					}
					directionPointE = ConeShape._tempDirectionPoint;
					direction.x = directionPointE.x * dirSinA;
					direction.y = directionPointE.y * dirSinA;
				} else {
					direction.x = positionX * dirSinA;
					direction.y = positionY * dirSinA;
				}
				direction.z = dirCosA;
				break;
			case 2:
				if (rand) {
					rand.seed = randomSeeds[16];
					ShapeUtils._randomPointInsideUnitCircle(ConeShape._tempPositionPoint, rand);

				} else {
					ShapeUtils._randomPointInsideUnitCircle(ConeShape._tempPositionPoint);
				}
				positionX = positionPointE.x;
				positionY = positionPointE.y;
				position.x = positionX * this.radius;
				position.y = positionY * this.radius;
				position.z = 0;

				direction.x = positionX * dirSinA;
				direction.y = positionY * dirSinA;
				direction.z = dirCosA;

				Vector3.normalize(direction, direction);
				if (rand) {
					Vector3.scale(direction, this.length * rand.getFloat(), direction);
					randomSeeds[16] = rand.seed;
				} else {
					Vector3.scale(direction, this.length * Math.random(), direction);
				}
				Vector3.add(position, direction, position);

				if (this.randomDirection) {
					if (rand) {
						rand.seed = randomSeeds[17];
						ShapeUtils._randomPointUnitSphere(direction, rand);
						randomSeeds[17] = rand.seed;
					} else {
						ShapeUtils._randomPointUnitSphere(direction);
					}
				}

				break;
			case 3:
				if (rand) {
					rand.seed = randomSeeds[16];
					ShapeUtils._randomPointUnitCircle(ConeShape._tempPositionPoint, rand);
				} else {
					ShapeUtils._randomPointUnitCircle(ConeShape._tempPositionPoint);
				}

				positionX = positionPointE.x;
				positionY = positionPointE.y;
				position.x = positionX * this.radius;
				position.y = positionY * this.radius;
				position.z = 0;

				direction.x = positionX * dirSinA;
				direction.y = positionY * dirSinA;
				direction.z = dirCosA;

				Vector3.normalize(direction, direction);
				if (rand) {
					Vector3.scale(direction, this.length * rand.getFloat(), direction);
					randomSeeds[16] = rand.seed;
				} else {
					Vector3.scale(direction, this.length * Math.random(), direction);
				}

				Vector3.add(position, direction, position);

				if (this.randomDirection) {
					if (rand) {
						rand.seed = randomSeeds[17];
						ShapeUtils._randomPointUnitSphere(direction, rand);
						randomSeeds[17] = rand.seed;
					} else {
						ShapeUtils._randomPointUnitSphere(direction);
					}
				}

				break;
			default:
				throw new Error("ConeShape:emitType is invalid.");
		}
	}

	/**
	 * @override
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
	 */
	cloneTo(destObject: ConeShape): void {
		super.cloneTo(destObject);
		destObject.angle = this.angle;
		destObject.radius = this.radius;
		destObject.length = this.length;
		destObject.emitType = this.emitType;
		destObject.randomDirection = this.randomDirection;
	}

	/**
	 * @override
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destShape: ConeShape = new ConeShape();
		this.cloneTo(destShape);
		return destShape;
	}

}


