import { IClone } from "../../../../utils/IClone"

/**
 * @en The `GradientDataNumber` class is used to create floating-point gradients.
 * @zh `GradientDataNumber` 类用于创建浮点渐变。
 */
export class GradientDataNumber implements IClone {
	/**
	 * @internal
	 * @en Create a constant gradient curve data.
	 * @param constantValue The constant value for the gradient.
	 * @returns A new GradientDataNumber instance with constant value.
	 * @zh 创建一个常数渐变曲线数据。
	 * @param constantValue 常数值。
	 * @returns 包含常数值的 GradientDataNumber 实例。
	 */
	static createConstantData(constantValue: number) {
		let gradientData = new GradientDataNumber();
		gradientData.add(0, constantValue);
		gradientData.add(1, constantValue);
		return gradientData;
	}

	private _currentLength: number = 0;

	/**
	 * @internal
	 */
	_dataBuffer: Float32Array;

	/**
	 * @internal
	 */
	get _elements(): Float32Array {
		return this._dataBuffer;
	}

	/**
	 * @internal
	 */
	set _elements(value: Float32Array) {
		let currentLength = value.length;
		currentLength = currentLength > 8 ? 8 : currentLength;
		this._currentLength = currentLength;
		this._dataBuffer.set(value);
		this._formatData();
	}

	/**@internal 曲线编辑范围*/
	_curveMin: number;
	/**@internal 曲线编辑范围*/
	_curveMax: number;
	/**
	 * @en The number of gradient floats.
	 * @zh 渐变浮点数量。
	 */
	get gradientCount(): number {
		return this._currentLength / 2;
	}

	/**
	 * @ignore
	 * @en creates an instance of the GradientDataNumber class.
	 * @zh 创建一个 GradientDataNumber 类的实例。
	 */
	constructor() {
		// this._elements = new Float32Array(8);
		this._dataBuffer = new Float32Array(8);
	}

	/**
	 * @internal
	 * @en Format data, ensure the maximum value is 1.
	 * @zh 格式化数据，确保数据的最大值为 1。
	 */
	_formatData() {
		if (this._currentLength == 8) return;
		if (this._elements[this._currentLength - 2] !== 1) {
			this._elements[this._currentLength] = 1;
			this._elements[this._currentLength + 1] = this._elements[this._currentLength - 1];
		}
	}

	/**
	 * @en Add a floating-point gradient.
	 * @param key Lifecycle, ranging from 0 to 1.
	 * @param value The float value.
	 * @zh 增加浮点渐变。
	 * @param key 生命周期，范围为 0 到 1。
	 * @param value 浮点值。
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
	 * @en Get the key by index.
	 * @param index The index.
	 * @returns The key.
	 * @zh 通过索引获取键。
	 * @param index 索引。
	 * @returns 键。
	 */
	getKeyByIndex(index: number): number {
		return this._elements[index * 2];
	}

	/**
	 * @en Get the value by index.
	 * @param index The index.
	 * @returns The value.
	 * @zh 通过索引获取值。
	 * @param index 索引。
	 * @returns 值。
	 */
	getValueByIndex(index: number): number {
		return this._elements[index * 2 + 1];
	}

	/**
	 * @en Get the average value.
	 * @returns The average value of the gradient.
	 * @zh 获取平均值。
	 * @returns 渐变的平均值。
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
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
	 */
	cloneTo(destObject: any): void {
		var destGradientDataNumber: GradientDataNumber = <GradientDataNumber>destObject;
		destGradientDataNumber._currentLength = this._currentLength;
		var destElements: Float32Array = destGradientDataNumber._elements;
		for (var i: number = 0, n: number = this._elements.length; i < n; i++)
			destElements[i] = this._elements[i];
	}

	/**
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destGradientDataNumber: GradientDataNumber = new GradientDataNumber();
		this.cloneTo(destGradientDataNumber);
		return destGradientDataNumber;
	}

}


