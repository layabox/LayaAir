//@ts-nocheck
import { IClone } from "../../../IClone"
import { BoundBox } from "../../../../math/BoundBox"
import { Rand } from "../../../../math/Rand"
import { Vector2 } from "../../../../math/Vector2"
import { Vector3 } from "../../../../math/Vector3"

export enum ParticleSystemShapeType {
	/**盒体 */
	Box = 0,
	/**环形 */
	Circle = 1,
	/**锥体 */
	Cone = 2,
	/**半球体 */
	Hemisphere = 3,
	/**球体 */
	Sphere = 4
}


/**
 * <code>BaseShape</code> 类用于粒子形状。
 */
export class BaseShape implements IClone {
	/**是否启用。*/
	enable: boolean=true;
	/**随机方向。*/
	randomDirection: number=0;

	/**粒子类型 */
	shapeType: ParticleSystemShapeType;

	/**
	 * 创建一个 <code>BaseShape</code> 实例。
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
	 * 用于生成粒子初始位置和方向。
	 * @param	position 粒子位置。
	 * @param	direction 粒子方向。
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
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destShape: BaseShape = (<BaseShape>destObject);
		destShape.enable = this.enable;

	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destShape: BaseShape = new BaseShape();
		this.cloneTo(destShape);
		return destShape;
	}

}


