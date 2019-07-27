import { IClone } from "../../IClone"
import { Vector2 } from "../../../math/Vector2"

/**
 * <code>GradientDataVector2</code> 类用于创建二维向量渐变。
 */
export class GradientDataVector2 implements IClone {
	private _currentLength: number = 0;
	/**@internal 开发者禁止修改。*/
	_elements: Float32Array;

	/**二维向量渐变数量。*/
	get gradientCount(): number {
		return this._currentLength / 3;
	}

	/**
	 * 创建一个 <code>GradientDataVector2</code> 实例。
	 */
	constructor() {
		this._elements = new Float32Array(12);
	}

	/**
	 * 增加二维向量渐变。
	 * @param	key 生命周期，范围为0到1。
	 * @param	value 二维向量值。
	 */
	add(key: number, value: Vector2): void {
		if (this._currentLength < 8) {

			if ((this._currentLength === 6) && ((key !== 1))) {
				key = 1;
				console.log("GradientDataVector2 warning:the forth key is  be force set to 1.");
			}

			this._elements[this._currentLength++] = key;
			this._elements[this._currentLength++] = value.x;
			this._elements[this._currentLength++] = value.y;
		} else {
			console.log("GradientDataVector2 warning:data count must lessEqual than 4");
		}
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destGradientDataVector2: GradientDataVector2 = <GradientDataVector2>destObject;
		destGradientDataVector2._currentLength = this._currentLength;
		var destElements: Float32Array = destGradientDataVector2._elements;
		for (var i: number = 0, n: number = this._elements.length; i < n; i++) {
			destElements[i] = this._elements[i];
		}
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destGradientDataVector2: GradientDataVector2 = new GradientDataVector2();
		this.cloneTo(destGradientDataVector2);
		return destGradientDataVector2;
	}

}


