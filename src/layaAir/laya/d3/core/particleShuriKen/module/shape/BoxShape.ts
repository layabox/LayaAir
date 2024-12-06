import { BaseShape, ParticleSystemShapeType } from "./BaseShape";
import { ShapeUtils } from "./ShapeUtils";
import { BoundBox } from "../../../../math/BoundBox"
import { Rand } from "../../../../math/Rand"
import { Vector3 } from "../../../../../maths/Vector3";

/**
 * @en BoxShape class for creating box-shaped particle emitters.
 * @zh BoxShape 类用于创建盒形粒子发射器。
 */
export class BoxShape extends BaseShape {
	/**
	 * @en Length of the emitter along the X-axis.
	 * @zh 发射器X轴长度。
	 */
	x: number;
	/**
	 * @en Length of the emitter along the Y-axis.
	 * @zh 发射器Y轴长度。
	 */
	y: number;
	/**
	 * @en Length of the emitter along the Z-axis.
	 * @zh 发射器Z轴长度。
	 */
	z: number;

	/**
	 * @ignore
	 * @en Creates an instance of the BoxShape class.
	 * @zh 创建一个BoxShape实例。
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
	 * @override
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
	 */
	cloneTo(destObject: BoxShape): void {
		super.cloneTo(destObject);
		destObject.x = this.x;
		destObject.y = this.y;
		destObject.z = this.z;
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
		var destShape: BoxShape = new BoxShape();
		this.cloneTo(destShape);
		return destShape;
	}

}


