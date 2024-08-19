import { IClone } from "../../../../utils/IClone"

/**
 * @en The GradientDataInt class is used to create integer gradients.
 * @zh GradientDataInt 类用于创建整形渐变。
 */
export class GradientDataInt implements IClone {
	private _currentLength: number = 0;
    /**
     * @internal
     * @en Developers are prohibited from modifying this.
     * @zh 开发者禁止修改。
     */
	_elements: Float32Array;//TODO:是否用int

    /**
     * @internal
     * @en Curve editing range (minimum).
     * @zh 曲线编辑范围（最小值）。
     */
	_curveMin: number = 0;
    /**
     * @internal
     * @en Curve editing range (maximum).
     * @zh 曲线编辑范围（最大值）。
     */
	_curveMax: number = 1;

    /**
     * @en The number of integer gradients.
     * @zh 整形渐变数量。
     */
	get gradientCount(): number {
		return this._currentLength / 2;
	}

	/**
	 * @ignore
	 * @en creates an instance of the GradientDataInt class.
	 * @zh 创建一个 GradientDataInt 类的实例。
	 */
	constructor() {
		this._elements = new Float32Array(8);
	}


    /**
     * @internal
     * @en Format the data to ensure the maximum value is 1.
     * @zh 格式化数据；保证数据的最大值为1。
     */
	_formatData() {
		if (this._currentLength == 8) return;
		if (this._elements[this._currentLength - 2] !== 1) {
			this._elements[this._currentLength] = 1;
			this._elements[this._currentLength + 1] = this._elements[this._currentLength - 1];
		}
	}

    /**
     * @en Add an integer gradient.
     * @param key - The lifecycle key, ranging from 0 to 1.
     * @param value - The integer value.
	 * @zh 增加整形渐变。
     * @param key - 生命周期，范围为0到1。
     * @param value - 整形值。
     */
	add(key: number, value: number): void {
		if (this._currentLength < 8) {
			if ((this._currentLength === 6) && ((key !== 1))) {
				key = 1;
				console.log("Warning:the forth key is  be force set to 1.");
			}

			this._elements[this._currentLength++] = key;
			this._elements[this._currentLength++] = value;
		} else {
			console.log("Warning:data count must lessEqual than 4");
		}
	}

	/**
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
	 */
	cloneTo(destObject: any): void {
		var destGradientDataInt: GradientDataInt = <GradientDataInt>destObject;
		destGradientDataInt._currentLength = this._currentLength;
		var destElements: Float32Array = destGradientDataInt._elements;
		for (var i: number = 0, n: number = this._elements.length; i < n; i++) {
			destElements[i] = this._elements[i];
		}
	}

	/**
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destGradientDataInt: GradientDataInt = new GradientDataInt();
		this.cloneTo(destGradientDataInt);
		return destGradientDataInt;
	}

}