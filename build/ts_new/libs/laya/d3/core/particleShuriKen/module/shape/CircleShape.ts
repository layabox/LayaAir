import { BaseShape, ParticleSystemShapeType } from "./BaseShape";
import { ShapeUtils } from "./ShapeUtils";
import { BoundBox } from "../../../../math/BoundBox"
import { Rand } from "../../../../math/Rand"
import { Vector2 } from "../../../../math/Vector2"
import { Vector3 } from "../../../../math/Vector3"

/**
 * <code>CircleShape</code> 类用于创建环形粒子形状。
 */
export class CircleShape extends BaseShape {
	/** @internal */
	protected static _tempPositionPoint: Vector2 = new Vector2();

	/**发射器半径。*/
	radius: number;
	/**环形弧度。*/
	arc: number;
	/**从边缘发射。*/
	emitFromEdge: boolean;

	/**
	 * 创建一个 <code>CircleShape</code> 实例。
	 */
	constructor() {
		super();
		this.shapeType = ParticleSystemShapeType.Circle;
		this.radius = 1.0;
		this.arc = 360.0 / 180.0 * Math.PI;
		this.emitFromEdge = false;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _getShapeBoundBox(boundBox: BoundBox): void {
		var min: Vector3 = boundBox.min;
		min.x = min.z = -this.radius;
		min.y = 0;
		var max: Vector3 = boundBox.max;
		max.x = max.z = this.radius;
		max.y = 0;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _getSpeedBoundBox(boundBox: BoundBox): void {
		var min: Vector3 = boundBox.min;
		min.x = min.y = -1;
		min.z = 0;
		var max: Vector3 = boundBox.max;
		max.x = max.y = 1;
		max.z = 0;
	}

	/**
	 *  用于生成粒子初始位置和方向。
	 * @param	position 粒子位置。
	 * @param	direction 粒子方向。
	 * @override
	 */
	generatePositionAndDirection(position: Vector3, direction: Vector3, rand: Rand = null, randomSeeds: Uint32Array = null): void {
		var positionPoint: Vector2 = CircleShape._tempPositionPoint;
		if (rand) {
			rand.seed = randomSeeds[16];
			if (this.emitFromEdge)
				ShapeUtils._randomPointUnitArcCircle(this.arc, CircleShape._tempPositionPoint, rand);
			else
				ShapeUtils._randomPointInsideUnitArcCircle(this.arc, CircleShape._tempPositionPoint, rand);
			randomSeeds[16] = rand.seed;
		} else {
			if (this.emitFromEdge)
				ShapeUtils._randomPointUnitArcCircle(this.arc, CircleShape._tempPositionPoint);
			else
				ShapeUtils._randomPointInsideUnitArcCircle(this.arc, CircleShape._tempPositionPoint);
		}

		position.x = -positionPoint.x;
		position.y = positionPoint.y;
		position.z = 0;

		Vector3.scale(position, this.radius, position);

		if (this.randomDirection) {
			if (rand) {
				rand.seed = randomSeeds[17];
				ShapeUtils._randomPointUnitSphere(direction, rand);
				randomSeeds[17] = rand.seed;
			} else {
				ShapeUtils._randomPointUnitSphere(direction);
			}
		} else {
			position.cloneTo(direction);
		}
	}

	/**
	 * @param destObject 
	 * @override
	 */
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destShape: CircleShape = (<CircleShape>destObject);
		destShape.radius = this.radius;
		destShape.arc = this.arc;
		destShape.emitFromEdge = this.emitFromEdge;
		destShape.randomDirection = this.randomDirection;
	}

	/**
	 * @override
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destShape: CircleShape = new CircleShape();
		this.cloneTo(destShape);
		return destShape;
	}

}


