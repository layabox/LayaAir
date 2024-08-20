import { BaseShape, ParticleSystemShapeType } from "./BaseShape";
import { ShapeUtils } from "./ShapeUtils";
import { BoundBox } from "../../../../math/BoundBox"
import { Rand } from "../../../../math/Rand"
import { Vector3 } from "../../../../../maths/Vector3";


/**
 * @en The HemisphereShape class is used to create hemispherical particle shapes emitters.
 * @zh HemisphereShape 类用于创建半球形粒子形状发射器。
 */
export class HemisphereShape extends BaseShape {
	/**
	 * @en The radius of the hemisphere.
	 * @zh 发射器半径。
	 */
	radius: number;
	/**
	 * @en Whether to emit from the shell.
	 * @zh 是否从外壳发射。
	 */
	emitFromShell: boolean;

	/**
	 * @ignore
	 * @en Creats an instance of the HemisphereShape class.
	 * @zh 创建一个HemisphereShape实例。
	 */
	constructor() {
		super();
		this.shapeType = ParticleSystemShapeType.Hemisphere;
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
		max.x = max.y = this.radius;
		max.z = 0;
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
		max.x = max.y = max.z = 1;
	}

	/** 
	 * @override
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

		var z: number = position.z;
		(z < 0.0) && (position.z = z * -1.0);

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
		var destShape: HemisphereShape = (<HemisphereShape>destObject);
		destShape.radius = this.radius;
		destShape.emitFromShell = this.emitFromShell;
		destShape.randomDirection = this.randomDirection;
	}

	/**
	 * @override
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destShape: HemisphereShape = new HemisphereShape();
		this.cloneTo(destShape);
		return destShape;
	}

}