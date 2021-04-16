import { BaseShape, ParticleSystemShapeType } from "./BaseShape";
import { ShapeUtils } from "./ShapeUtils";
import { BoundBox } from "../../../../math/BoundBox"
import { Rand } from "../../../../math/Rand"
import { Vector3 } from "../../../../math/Vector3"

/**
 * <code>BoxShape</code> 类用于创建球形粒子形状。
 */
export class BoxShape extends BaseShape {
	/**发射器X轴长度。*/
	x: number;
	/**发射器Y轴长度。*/
	y: number;
	/**发射器Z轴长度。*/
	z: number;

	/**
	 * 创建一个 <code>BoxShape</code> 实例。
	 */
	constructor() {
		super();
		this.shapeType = ParticleSystemShapeType.Box;
		this.x = 1.0;
		this.y = 1.0;
		this.z = 1.0;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _getShapeBoundBox(boundBox: BoundBox): void {
		var min: Vector3 = boundBox.min;
		min.x = -this.x * 0.5;
		min.y = -this.y * 0.5;
		min.z = -this.z * 0.5;
		var max: Vector3 = boundBox.max;
		max.x = this.x * 0.5;
		max.y = this.y * 0.5;
		max.z = this.z * 0.5;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _getSpeedBoundBox(boundBox: BoundBox): void {
		var min: Vector3 = boundBox.min;
		min.x = 0.0;
		min.y = 0.0;
		min.z = 0.0;
		var max: Vector3 = boundBox.max;
		max.x = 0.0;
		max.y = 1.0;
		max.z = 0.0;
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
			ShapeUtils._randomPointInsideHalfUnitBox(position, rand);
			randomSeeds[16] = rand.seed;
		} else {
			ShapeUtils._randomPointInsideHalfUnitBox(position);
		}
		position.x = this.x * position.x;
		position.y = this.y * position.y;
		position.z = this.z * position.z;
		if (this.randomDirection) {
			if (rand) {
				rand.seed = randomSeeds[17];
				ShapeUtils._randomPointUnitSphere(direction, rand);
				randomSeeds[17] = rand.seed;
			} else {
				ShapeUtils._randomPointUnitSphere(direction);
			}
		} else {
			direction.x = 0.0;
			direction.y = 0.0;
			direction.z = 1.0;
		}
	}

	/**
	 * @param destObject 
	 * @override
	 */
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destShape: BoxShape = (<BoxShape>destObject);
		destShape.x = this.x;
		destShape.y = this.y;
		destShape.z = this.z;
		destShape.randomDirection = this.randomDirection;
	}

	/**
	 * @override
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destShape: BoxShape = new BoxShape();
		this.cloneTo(destShape);
		return destShape;
	}

}


