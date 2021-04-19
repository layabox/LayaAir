import { BaseShape, ParticleSystemShapeType } from "./BaseShape";
import { ShapeUtils } from "./ShapeUtils";
import { BoundBox } from "../../../../math/BoundBox"
import { Rand } from "../../../../math/Rand"
import { Vector2 } from "../../../../math/Vector2"
import { Vector3 } from "../../../../math/Vector3"

/**
 * <code>ConeShape</code> 类用于创建锥形粒子形状。
 */
export class ConeShape extends BaseShape {
	/** @internal */
	protected static _tempPositionPoint: Vector2 = new Vector2();
	/** @internal */
	protected static _tempDirectionPoint: Vector2 = new Vector2();

	/**发射角度。*/
	angle: number;
	/**发射器半径。*/
	radius: number;
	/**椎体长度。*/
	length: number;
	/**发射类型,0为Base,1为BaseShell,2为Volume,3为VolumeShell。*/
	emitType: number;

	/**
	 * 创建一个 <code>ConeShape</code> 实例。
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
	 *  用于生成粒子初始位置和方向。
	 * @param	position 粒子位置。
	 * @param	direction 粒子方向。
	 * @override
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
	 */
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destShape: ConeShape = (<ConeShape>destObject);
		destShape.angle = this.angle;
		destShape.radius = this.radius;
		destShape.length = this.length;
		destShape.emitType = this.emitType;
		destShape.randomDirection = this.randomDirection;
	}

	/**
	 * @override
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destShape: ConeShape = new ConeShape();
		this.cloneTo(destShape);
		return destShape;
	}

}


