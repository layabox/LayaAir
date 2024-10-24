import { Vector2 } from "../../../../../maths/Vector2";
import { Vector3 } from "../../../../../maths/Vector3";
import { IClone } from "../../../../../utils/IClone"
import { BoundBox } from "../../../../math/BoundBox"
import { Rand } from "../../../../math/Rand"

/**
 * @en Enumeration of particle system shape types.
 * @zh 粒子系统形状类型枚举。
 */
export enum ParticleSystemShapeType {
	/**
	 * @en Box shape.
	 * @zh 盒子形状。
	 */
	Box = 0,
	/**
	 * @en Circle shape.
	 * @zh 环形形状。
	 */
	Circle = 1,
	/**
	 * @en Cone shape.
	 * @zh 锥体形状。
	 */
	Cone = 2,
	/**
	 * @en Hemisphere shape.
	 * @zh 半球体形状。
	 */
	Hemisphere = 3,
	/**
	 * @en Sphere shape.
	 * @zh 球体形状。
	 */
	Sphere = 4
}


/**
 * @en BaseShape class for particle shapes.
 * @zh BaseShape类用于粒子形状。
 */
export class BaseShape implements IClone {
	/**
	 * @en Whether the shape is enabled.
	 * @zh 是否启用。
	 */
	enable: boolean = true;
	/**
	 * @en Random direction.
	 * @zh 随机方向，默认0为不随机。
	 */
	randomDirection: number = 0;

	/**
	 * @en Particle shape type.
	 * @zh 粒子形状类型。
	 */
	shapeType: ParticleSystemShapeType;

	/**
	 * @ignore
	 * @en Creates an instance of the BaseShape class.
	 * @zh 创建一个BaseShape实例。
	 */
	constructor() {
	}

	/**@internal */
	protected _getShapeBoundBox(boundBox: BoundBox): void {
		throw new Error("BaseShape: must override it.");
	}

	/**@internal */
	protected _getSpeedBoundBox(boundBox: BoundBox): void {
		throw new Error("BaseShape: must override it.");
	}

	/**
	 * @en Generates initial position and direction for particles.
	 * @param position The particle position.
	 * @param direction The particle direction.
	 * @param rand Random number.
	 * @param randomSeeds Random seeds.
	 * @zh 用于生成粒子初始位置和方向。
	 * @param position 粒子位置。
	 * @param direction 粒子方向。
	 * @param rand 随机数。
	 * @param randomSeeds 随机种子。
	 */
	generatePositionAndDirection(position: Vector3, direction: Vector3, rand: Rand = null, randomSeeds: Uint32Array = null): void {
		throw new Error("BaseShape: must override it.");
	}

	/** 
	 * @internal 
	 */
	_calculateProceduralBounds(boundBox: BoundBox, emitterPosScale: Vector3, minMaxBounds: Vector2): void {
		this._getShapeBoundBox(boundBox);

		var min: Vector3 = boundBox.min;
		var max: Vector3 = boundBox.max;
		Vector3.multiply(min, emitterPosScale, min);
		Vector3.multiply(max, emitterPosScale, max);

		var speedBounds: BoundBox = new BoundBox(new Vector3(), new Vector3());
		if (this.randomDirection/* && (m_Type != kCone) && (m_Type != kConeShell)*/)//TODO:randomDirection应换成0到1
		{
			speedBounds.min = new Vector3(-1, -1, -1);
			speedBounds.max = new Vector3(1, 1, 1);
			//minMaxBounds = Abs(minMaxBounds);
		}
		else {
			this._getSpeedBoundBox(speedBounds);
		}


		var maxSpeedBound: BoundBox = new BoundBox(new Vector3(), new Vector3());
		var maxSpeedMin: Vector3 = maxSpeedBound.min;
		var maxSpeedMax: Vector3 = maxSpeedBound.max;
		Vector3.scale(speedBounds.min, minMaxBounds.y, maxSpeedMin);
		Vector3.scale(speedBounds.max, minMaxBounds.y, maxSpeedMax);
		Vector3.add(boundBox.min, maxSpeedMin, maxSpeedMin);
		Vector3.add(boundBox.max, maxSpeedMax, maxSpeedMax);

		Vector3.min(boundBox.min, maxSpeedMin, boundBox.min);
		Vector3.max(boundBox.max, maxSpeedMin, boundBox.max);


		var minSpeedBound: BoundBox = new BoundBox(new Vector3(), new Vector3());
		var minSpeedMin: Vector3 = minSpeedBound.min;
		var minSpeedMax: Vector3 = minSpeedBound.max;
		Vector3.scale(speedBounds.min, minMaxBounds.x, minSpeedMin);
		Vector3.scale(speedBounds.max, minMaxBounds.x, minSpeedMax);

		Vector3.min(minSpeedBound.min, minSpeedMax, maxSpeedMin);
		Vector3.max(minSpeedBound.min, minSpeedMax, maxSpeedMax);

		Vector3.min(boundBox.min, maxSpeedMin, boundBox.min);
		Vector3.max(boundBox.max, maxSpeedMin, boundBox.max);
	}

	/**
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
	 */
	cloneTo(destObject: BaseShape): void {
		destObject.enable = this.enable;

	}

	/**
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destShape: BaseShape = new BaseShape();
		this.cloneTo(destShape);
		return destShape;
	}

}


