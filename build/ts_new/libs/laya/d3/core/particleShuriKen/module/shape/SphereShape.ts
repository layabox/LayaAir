import { BaseShape, ParticleSystemShapeType } from "./BaseShape";
import { ShapeUtils } from "./ShapeUtils";
import { BoundBox } from "../../../../math/BoundBox"
import { Rand } from "../../../../math/Rand"
import { Vector3 } from "../../../../math/Vector3"

/**
 * <code>SphereShape</code> 类用于创建球形粒子形状。
 */
export class SphereShape extends BaseShape {
	/**发射器半径。*/
	radius: number;
	/**从外壳发射。*/
	emitFromShell: boolean;

	/**
	 * 创建一个 <code>SphereShape</code> 实例。
	 */
	constructor() {
		super();
		this.shapeType = ParticleSystemShapeType.Sphere;
		this.radius = 1.0;
		this.emitFromShell = false;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _getShapeBoundBox(boundBox: BoundBox): void {
		var min: Vector3 = boundBox.min;
		min.x = min.y = min.z = -this.radius;
		var max: Vector3 = boundBox.max;
		max.x = max.y = max.z = this.radius;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _getSpeedBoundBox(boundBox: BoundBox): void {
		var min: Vector3 = boundBox.min;
		min.x = min.y = min.z = -1;
		var max: Vector3 = boundBox.max;
		max.x = max.y = max.z = 1;
	}

	/**
	 *  用于生成粒子初始位置和方向。
	 * @param	position 粒子位置。
	 * @param	direction 粒子方向。
	 * @override
	 */
	generatePositionAndDirection(position: Vector3, direction: Vector3, rand: Rand = null, randomSeeds: Uint32Array = null): void {
		if (rand) {
			rand.seed = randomSeeds[16];
			if (this.emitFromShell)
				ShapeUtils._randomPointUnitSphere(position, rand);
			else
				ShapeUtils._randomPointInsideUnitSphere(position, rand);
			randomSeeds[16] = rand.seed;
		} else {
			if (this.emitFromShell)
				ShapeUtils._randomPointUnitSphere(position);
			else
				ShapeUtils._randomPointInsideUnitSphere(position);
		}

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
	 */
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destShape: SphereShape = (<SphereShape>destObject);
		destShape.radius = this.radius;
		destShape.emitFromShell = this.emitFromShell;
		destShape.randomDirection = this.randomDirection;
	}

	/**
	 * @override
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destShape: SphereShape = new SphereShape();
		this.cloneTo(destShape);
		return destShape;
	}
}


