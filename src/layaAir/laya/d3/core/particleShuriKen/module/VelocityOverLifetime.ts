import { IClone } from "../../../../utils/IClone";
import { GradientVelocity } from "./GradientVelocity";

/**
 * @en The `VelocityOverLifetime` class is used for particle velocity over its lifetime.
 * @zh `VelocityOverLifetime` 类用于控制粒子在生命周期内的速度变化。
 */
export class VelocityOverLifetime implements IClone {
	/**@internal */
	private _velocity: GradientVelocity;

	/**
	 * @en Whether to enable.
	 * @zh 是否启用*/
	enable: boolean = false;
	/**
	 * @en Velocity space, 0 for local, 1 for world.
	 * @zh 速度空间，0 表示局部空间，1 表示世界空间。
	 */
	space: number = 0;

	/**
	 * @en The gradient velocity.
	 * @zh 渐变速度。
	 */
	get velocity(): GradientVelocity {
		return this._velocity;
	}

	/**
	 * @ignore
	 * @en Creates an instance of `VelocityOverLifetime` class.
	 * @param velocity gradient velocity.
	 * @zh 创建一个 `VelocityOverLifetime` 类的实例。
	 * @param velocity 渐变速度。
	 */
	constructor(velocity: GradientVelocity) {
		this._velocity = velocity;
	}

	/**
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
	 */
	cloneTo(destObject: any): void {
		var destVelocityOverLifetime: VelocityOverLifetime = (<VelocityOverLifetime>destObject);
		this._velocity.cloneTo(destVelocityOverLifetime._velocity);
		destVelocityOverLifetime.enable = this.enable;
		destVelocityOverLifetime.space = this.space;
	}

	/**
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destVelocity: GradientVelocity;
		switch (this._velocity.type) {
			case 0:
				destVelocity = GradientVelocity.createByConstant(this._velocity.constant.clone());
				break;
			case 1:
				destVelocity = GradientVelocity.createByGradient(this._velocity.gradientX.clone(), this._velocity.gradientY.clone(), this._velocity.gradientZ.clone());
				break;
			case 2:
				destVelocity = GradientVelocity.createByRandomTwoConstant(this._velocity.constantMin.clone(), this._velocity.constantMax.clone());
				break;
			case 3:
				destVelocity = GradientVelocity.createByRandomTwoGradient(this._velocity.gradientXMin.clone(), this._velocity.gradientXMax.clone(), this._velocity.gradientYMin.clone(), this._velocity.gradientYMax.clone(), this._velocity.gradientZMin.clone(), this._velocity.gradientZMax.clone());
				break;
		}
		var destVelocityOverLifetime: VelocityOverLifetime = new VelocityOverLifetime(destVelocity);
		destVelocityOverLifetime.enable = this.enable;
		destVelocityOverLifetime.space = this.space;
		return destVelocityOverLifetime;
	}

}


