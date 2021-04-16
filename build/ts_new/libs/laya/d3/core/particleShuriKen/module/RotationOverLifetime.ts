import { GradientAngularVelocity } from "./GradientAngularVelocity";
import { IClone } from "../../IClone"

/**
 * <code>RotationOverLifetime</code> 类用于粒子的生命周期旋转。
 */
export class RotationOverLifetime implements IClone {
	private _angularVelocity: GradientAngularVelocity;

	/**是否启用*/
	enable: boolean;

	/**
	 *获取角速度。
	 */
	get angularVelocity(): GradientAngularVelocity {
		return this._angularVelocity;
	}

	/**
	 * 创建一个 <code>RotationOverLifetime,不允许new，请使用静态创建函数。</code> 实例。
	 */
	constructor(angularVelocity: GradientAngularVelocity) {
		this._angularVelocity = angularVelocity;
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destRotationOverLifetime: RotationOverLifetime = (<RotationOverLifetime>destObject);
		this._angularVelocity.cloneTo(destRotationOverLifetime._angularVelocity);
		destRotationOverLifetime.enable = this.enable;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destAngularVelocity: GradientAngularVelocity;
		switch (this._angularVelocity.type) {
			case 0:
				if (this._angularVelocity.separateAxes)
					destAngularVelocity = GradientAngularVelocity.createByConstantSeparate(this._angularVelocity.constantSeparate.clone());
				else
					destAngularVelocity = GradientAngularVelocity.createByConstant(this._angularVelocity.constant);
				break;
			case 1:
				if (this._angularVelocity.separateAxes)
					destAngularVelocity = GradientAngularVelocity.createByGradientSeparate(this._angularVelocity.gradientX.clone(), this._angularVelocity.gradientY.clone(), this._angularVelocity.gradientZ.clone());
				else
					destAngularVelocity = GradientAngularVelocity.createByGradient(this._angularVelocity.gradient.clone());
				break;
			case 2:
				if (this._angularVelocity.separateAxes)
					destAngularVelocity = GradientAngularVelocity.createByRandomTwoConstantSeparate(this._angularVelocity.constantMinSeparate.clone(), this._angularVelocity.constantMaxSeparate.clone());
				else
					destAngularVelocity = GradientAngularVelocity.createByRandomTwoConstant(this._angularVelocity.constantMin, this._angularVelocity.constantMax);
				break;
			case 3:
				if (this._angularVelocity.separateAxes)
					destAngularVelocity = GradientAngularVelocity.createByRandomTwoGradientSeparate(this._angularVelocity.gradientXMin.clone(), this._angularVelocity.gradientYMin.clone(), this._angularVelocity.gradientZMin.clone(), this._angularVelocity.gradientWMin.clone(), this._angularVelocity.gradientXMax.clone(), this._angularVelocity.gradientYMax.clone(), this._angularVelocity.gradientZMax.clone(), this._angularVelocity.gradientWMax.clone());
				else
					destAngularVelocity = GradientAngularVelocity.createByRandomTwoGradient(this._angularVelocity.gradientMin.clone(), this._angularVelocity.gradientMax.clone());
				break;
		}

		var destRotationOverLifetime: RotationOverLifetime = new RotationOverLifetime(destAngularVelocity);
		destRotationOverLifetime.enable = this.enable;
		return destRotationOverLifetime;
	}

}


