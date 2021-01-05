import { GradientSize } from "./GradientSize";
import { IClone } from "../../IClone"

/**
 * <code>SizeOverLifetime</code> 类用于粒子的生命周期尺寸。
 */
export class SizeOverLifetime implements IClone {
	private _size: GradientSize;

	/**是否启用*/
	enable: boolean;

	/**
	 *获取尺寸。
	 */
	get size(): GradientSize {
		return this._size;
	}

	/**
	 * 创建一个 <code>SizeOverLifetime</code> 实例。
	 */
	constructor(size: GradientSize) {
		this._size = size;
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destSizeOverLifetime: SizeOverLifetime = (<SizeOverLifetime>destObject);
		this._size.cloneTo(destSizeOverLifetime._size);
		destSizeOverLifetime.enable = this.enable;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
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


