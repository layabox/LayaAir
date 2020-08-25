import { IClone } from "../../IClone"

/**
 * <code>GradientDataNumber</code> 类用于创建浮点渐变。
 */
export class GradientDataNumber implements IClone {
	private _currentLength: number = 0;
	/**@internal 开发者禁止修改。*/
	_elements: Float32Array;

	/**渐变浮点数量。*/
	get gradientCount(): number {
		return this._currentLength / 2;
	}

	/**
	 * 创建一个 <code>GradientDataNumber</code> 实例。
	 */
	constructor() {
		this._elements = new Float32Array(8);
	}

	/**
	 * 增加浮点渐变。
	 * @param	key 生命周期，范围为0到1。
	 * @param	value 浮点值。
	 */
	add(key: number, value: number): void {
		if (this._currentLength < 8) {

			if ((this._currentLength === 6) && ((key !== 1))) {
				key = 1;
				console.log("GradientDataNumber warning:the forth key is  be force set to 1.");
			}

			this._elements[this._currentLength++] = key;
			this._elements[this._currentLength++] = value;
		} else {
			console.log("GradientDataNumber warning:data count must lessEqual than 4");
		}
	}

	/**
	 * 通过索引获取键。
	 * @param	index 索引。
	 * @return	value 键。
	 */
	getKeyByIndex(index: number): number {
		return this._elements[index * 2];
	}

	/**
	 * 通过索引获取值。
	 * @param	index 索引。
	 * @return	value 值。
	 */
	getValueByIndex(index: number): number {
		return this._elements[index * 2 + 1];
	}

	/**
	 * 获取平均值。
	 */
	getAverageValue(): number {
		var total: number = 0;
		var count: number = 0;
		for (var i: number = 0, n: number = this._currentLength - 2; i < n; i += 2) {
			var subValue: number = this._elements[i + 1];
			subValue += this._elements[i + 3];
			subValue = subValue * (this._elements[i + 2] - this._elements[i]);
			total += subValue;
			count++;
		}
		return total / count;
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destGradientDataNumber: GradientDataNumber = <GradientDataNumber>destObject;
		destGradientDataNumber._currentLength = this._currentLength;
		var destElements: Float32Array = destGradientDataNumber._elements;
		for (var i: number = 0, n: number = this._elements.length; i < n; i++)
			destElements[i] = this._elements[i];
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destGradientDataNumber: GradientDataNumber = new GradientDataNumber();
		this.cloneTo(destGradientDataNumber);
		return destGradientDataNumber;
	}

}


