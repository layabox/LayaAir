import { BaseShape, ParticleSystemShapeType } from "./BaseShape";
import { ShapeUtils } from "./ShapeUtils";
import { BoundBox } from "../../../../math/BoundBox"
import { Rand } from "../../../../math/Rand"
import { Vector2 } from "../../../../../maths/Vector2";
import { Vector3 } from "../../../../../maths/Vector3";

/**
 * @en CircleShape class for creating circular particle emitters.
 * @zh CircleShape 类用于创建环形粒子发射器。
 */
export class CircleShape extends BaseShape {
	/** @internal */
	protected static _tempPositionPoint: Vector2 = new Vector2();

	/**
	 * @en Emitter radius.
	 * @zh 发射器半径。
	 */
	radius: number;
	/**
	 * @en Arc angle.
	 * @zh 环形弧度。
	 */
	arc: number;
	/**
	 * @en Whether to emit from the edge.
	 * @zh 是否从边缘发射。
	 */
	emitFromEdge: boolean;

	/**
	 * @ignore
	 * @en Creates an instance of the CircleShape class.
	 * @zh 创建一个CircleShape实例。
	 */
	constructor() {
		super();
		this.shapeType = ParticleSystemShapeType.Circle;
		this.radius = 1.0;
		this.arc = 360.0 / 180.0 * Math.PI;
		this.emitFromEdge = false;
	}

	/**
	 * @en Emission angle 0-360
	 * @zh 发射角度 0-360
	 */
	get arcDEG() {
		return this.arc * 180 / Math.PI;
	}

	set arcDEG(deg: number) {
		this.arc = deg / 180 * Math.PI;
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
	 * @override
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
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
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destShape: CircleShape = new CircleShape();
		this.cloneTo(destShape);
		return destShape;
	}

}