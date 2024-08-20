import { Vector2 } from "../../../../maths/Vector2";
import { IClone } from "../../../../utils/IClone"

/**
 * @en The `GradientDataVector2` class is used to create two-dimensional vector gradients.
 * @zh `GradientDataVector2` 类用于创建二维向量渐变。
 */
export class GradientDataVector2 implements IClone {
	private _currentLength: number = 0;
	/**
	 * @internal
	 * @en Developers are prohibited from modifying this.
	 * @zh 开发者禁止修改。
	 */
	_elements: Float32Array;

	/**
	 * @en The number of two-dimensional vector gradients.
	 * @zh 二维向量渐变数量。
	 */
	get gradientCount(): number {
		return this._currentLength / 3;
	}

	/**
	 * @ignore
	 * @en creates an instance of the `GradientDataVector2` class.
	 * @zh 创建一个 `GradientDataVector2` 实例。
	 */
	constructor() {
		this._elements = new Float32Array(12);
	}

	/**
	 * @en Add a two-dimensional vector gradient.
	 * @param key Lifecycle, ranging from 0 to 1.
	 * @param value The two-dimensional vector value.
	 * @zh 增加二维向量渐变。
	 * @param key 生命周期，范围为 0 到 1。
	 * @param value 二维向量值。
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
	 * @en Clones to a target object.
	 * @param destObject The target object to clone to.
	 * @zh 克隆到目标对象。
	 * @param destObject 要克隆到的目标对象。
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
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var destGradientDataVector2: GradientDataVector2 = new GradientDataVector2();
		this.cloneTo(destGradientDataVector2);
		return destGradientDataVector2;
	}

}


