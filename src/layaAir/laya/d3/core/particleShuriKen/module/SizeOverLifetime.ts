import { GradientSize } from "./GradientSize";
import { IClone } from "../../../../utils/IClone"

/**
 * @en The `SizeOverLifetime` class is used to control the size of particles over their lifetime.
 * @zh `SizeOverLifetime` 类用于控制粒子在其生命周期内的尺寸变化。
 */
export class SizeOverLifetime implements IClone {
	private _size: GradientSize;

	/**
     * @en Whether to enable.
     * @zh 是否启用
     */
	enable: boolean;

    /**
     * @en The size.
     * @zh 尺寸。
     */
	get size(): GradientSize {
		return this._size;
	}

	/**
	 * @ignore
	 * @en Creates an instance of the `SizeOverLifetime` class.
	 * @param size gradient size.
	 * @zh 创建一个 `SizeOverLifetime` 实例。
	 * @param size 渐变尺寸
	 */
	constructor(size: GradientSize) {
		this._size = size;
	}

	/**
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
	 */
	cloneTo(destObject: SizeOverLifetime): void {
		this._size.cloneTo(destObject._size);
		destObject.enable = this.enable;
	}

	/**
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destSize: GradientSize;
		switch (this._size.type) {
			case 0:
				if (this._size.separateAxes)
					destSize = GradientSize.createByGradientSeparate(this._size.gradientX.clone(), this._size.gradientY.clone(), this._size.gradientZ.clone());
				else
					destSize = GradientSize.createByGradient(this._size.gradient.clone());
				break;
			case 1:
				if (this._size.separateAxes)
					destSize = GradientSize.createByRandomTwoConstantSeparate(this._size.constantMinSeparate.clone(), this._size.constantMaxSeparate.clone());
				else
					destSize = GradientSize.createByRandomTwoConstant(this._size.constantMin, this._size.constantMax);
				break;
			case 2:
				if (this._size.separateAxes)
					destSize = GradientSize.createByRandomTwoGradientSeparate(this._size.gradientXMin.clone(), this._size.gradientYMin.clone(), this._size.gradientZMin.clone(), this._size.gradientXMax.clone(), this._size.gradientYMax.clone(), this._size.gradientZMax.clone());
				else
					destSize = GradientSize.createByRandomTwoGradient(this._size.gradientMin.clone(), this._size.gradientMax.clone());
				break;
		}

		var destSizeOverLifetime: SizeOverLifetime = new SizeOverLifetime(destSize);
		destSizeOverLifetime.enable = this.enable;
		return destSizeOverLifetime;
	}

}


