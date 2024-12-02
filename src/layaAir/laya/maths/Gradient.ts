import { IClone } from "../utils/IClone";
import { Color } from "./Color";
import { GradientMode } from "./GradientMode";
import { Vector4 } from "./Vector4";


/**
 * @en The `Gradient` class is used to create color gradients.
 * @zh `Gradient` 类用于创建颜色渐变。
 */
export class Gradient implements IClone {
	private _mode: number = 0;
	private _maxColorRGBKeysCount: number = 0;
	private _maxColorAlphaKeysCount: number = 0;
	private _colorRGBKeysCount: number = 0;
	private _colorAlphaKeysCount: number = 0;

	/**
	 * @internal
	 * @en element key range
	 * x: colorkey min
	 * y: colorkey max
	 * z: alphakey min
	 * w: alphakey max
	 * @zh 元素键值范围
	 * x: 颜色最小值
	 * y: 颜色最大值
	 * z: 透明度最小值
	 * w: 透明度最大值
	 */
	_keyRanges: Vector4 = new Vector4(1, 0, 1, 0);

	/**@internal */
	_alphaElementDatas: Float32Array;

	/**
	 * @internal
	 * alpha 保存设置值
	 */
	get _alphaElements(): Float32Array {
		return this._alphaElementDatas;
	}

	/**
	 * @internal
	 * alpha 保存设置值
	 */
	set _alphaElements(value: Float32Array) {
		this._alphaElementDatas = value;

		let keyCount = value.length / 2;
		if (this.colorAlphaKeysCount < keyCount) {
			let maxKeyCount = keyCount > 4 ? 8 : 4;
			this._colorAlphaKeysCount = Math.ceil(Math.min(keyCount, 8));
			this._maxAlphaKeysCount = maxKeyCount;
		}

		if (this.colorAlphaKeysCount < 2) {
			// 只有一帧数据， 补全成首尾两帧
			let alpha = value[1];

			this._alphaDataBuffer[0] = 0;
			this._alphaDataBuffer[1] = alpha;
			this._alphaDataBuffer[2] = 1;
			this._alphaDataBuffer[3] = alpha;
		}
		else {
			this._alphaDataBuffer.set(value);
		}
	}

	/**@internal */
	_rgbElementDatas: Float32Array;

	/**
	 * @internal
	 * rgb 数据 保存设置值
	 */
	get _rgbElements(): Float32Array {
		return this._rgbElementDatas;
	}

	/**
	 * @internal
	 * rgb 数据 保存设置值
	 */
	set _rgbElements(value: Float32Array) {
		this._rgbElementDatas = value;

		let keyCount = value.length / 4;
		if (this.colorRGBKeysCount < keyCount) {
			let maxRGBCount = keyCount > 4 ? 8 : 4;
			this._colorRGBKeysCount = Math.ceil(Math.min(keyCount, 8));
			this._maxRGBKeysCount = maxRGBCount;
		}

		if (this.colorRGBKeysCount < 2) {
			// 只有一帧数据， 补全成首尾两帧
			let r = value[1];
			let g = value[2];
			let b = value[3];

			this._rgbDataBuffer[0] = 0;
			this._rgbDataBuffer[1] = r;
			this._rgbDataBuffer[2] = g;
			this._rgbDataBuffer[3] = b;

			this._rgbDataBuffer[4] = 1;
			this._rgbDataBuffer[5] = r;
			this._rgbDataBuffer[6] = g;
			this._rgbDataBuffer[7] = b;
		}
		else {
			this._rgbDataBuffer.set(value);
		}
	}

	/**
	 * @internal
	 * alpha 数据 uniform buffer value
	 */
	_alphaDataBuffer: Float32Array = null;
	/**
	 * @internal
	 * rgb 数据 uniform buffer value
	 */
	_rgbDataBuffer: Float32Array = null;

	/**
	 * 获取颜色数据。
	 * @return  颜色数据。
	 */
	get rgbElements(): Float32Array {
		return this._rgbDataBuffer;
	}

	/**
	 * 获取 alpha数据。
	 * @return  alpha数据。
	 */
	get alphaElements(): Float32Array {
		return this._alphaDataBuffer;
	}


	/**
	 * @en Get the gradient mode.
	 * @returns The gradient mode.
	 * @zh 获取梯度模式。
	 * @returns 梯度模式。
	 */
	get mode(): number {
		return this._mode;
	}

	/**
	 * @en Set the gradient mode.
	 * @param value The gradient mode.
	 * @zh 设置梯度模式。
	 * @param value 梯度模式。
	 */
	set mode(value: number) {
		this._mode = value;
	}

	/**
	 * @en Get the count of color RGB keys.
	 * @returns The count of color RGB keys.
	 * @zh 获取颜色 RGB 数量。
	 * @returns 颜色 RGB 数量。
	 */
	get colorRGBKeysCount(): number {
		return this._colorRGBKeysCount;
	}

	/**
	 * @internal
	 * 设置最大颜色Alpha帧数量。
	 */
	set _maxAlphaKeysCount(value: number) {
		this._maxColorAlphaKeysCount = value;

		value = Math.max(value, 2);
		this._alphaDataBuffer = new Float32Array(Math.ceil(value / 2) * 4);
	}

	/**
	 * @internal
	 * 设置最大颜色RGB帧数量。
	 */
	set _maxRGBKeysCount(value: number) {
		this._maxColorRGBKeysCount = value;

		value = Math.max(value, 2);
		this._rgbDataBuffer = new Float32Array(value * 4);
	}

	/**
	 * 获取颜色Alpha数量。
	 * @return 颜色Alpha数量。
	 */
	get colorAlphaKeysCount(): number {
		return this._colorAlphaKeysCount;
	}

	/**
	 * @en Get the maximum count of color RGB keys.
	 * @returns The maximum count of RGB keys.
	 * @zh 获取最大颜色 RGB 帧数量。
	 * @returns 最大 RGB 帧数量。
	 */
	get maxColorRGBKeysCount(): number {
		return this._maxColorRGBKeysCount;
	}

	/**
	 * @en Get the maximum count of color Alpha keys.
	 * @returns The maximum count of Alpha keys.
	 * @zh 获取最大颜色 Alpha 帧数量。
	 * @returns 最大 Alpha 帧数量。
	 */
	get maxColorAlphaKeysCount(): number {
		return this._maxColorAlphaKeysCount;
	}

	/**
	 * @en Constructor function.
	 * @param maxColorRGBKeyCount The maximum count of RGB keys.
	 * @param maxColorAlphaKeyCount The maximum count of Alpha keys.
	 * @zh 构造函数。
	 * @param maxColorRGBKeyCount 最大 RGB 帧个数。
	 * @param maxColorAlphaKeyCount 最大 Alpha 帧个数。
	 */
	constructor() {
		// 加载 decodeObj 赋值 _rgbElements/ _alphaElements, 初始化buffer
		// 手动创建对象，调用 setMaxKeyCount 初始化buffer
	}

	setMaxKeyCount(maxRGBCount: number, maxAlphaCount: number) {
		this._maxAlphaKeysCount = maxAlphaCount;
		this._maxRGBKeysCount = maxRGBCount;

		this._rgbElements = new Float32Array(maxRGBCount * 4);
		this._alphaElements = new Float32Array(maxAlphaCount * 2);
	}

	/**
	 * @en Add a color RGB key.
	 * @param key The lifetime, ranging from 0 to 1.
	 * @param value The RGB value.
	 * @zh 增加颜色 RGB 帧。
	 * @param key 生命周期，范围为 0 到 1。
	 * @param value RGB 值。
	 */
	addColorRGB(key: number, value: Color): void {
		if (this._colorRGBKeysCount < this._maxColorRGBKeysCount) {
			var offset: number = this._colorRGBKeysCount * 4;
			this._rgbElements[offset] = key;
			this._rgbElements[offset + 1] = value.r;
			this._rgbElements[offset + 2] = value.g;
			this._rgbElements[offset + 3] = value.b;
			this._colorRGBKeysCount++;

			this._rgbElements = this._rgbElements;
		} else {
			console.warn("Gradient:warning:data count must lessEqual than " + this._maxColorRGBKeysCount);
		}
	}

	/**
	 * @en Add a color Alpha key.
	 * @param key The lifetime, ranging from 0 to 1.
	 * @param value The Alpha value.
	 * @zh 增加颜色 Alpha 帧。
	 * @param key 生命周期，范围为 0 到 1。
	 * @param value Alpha 值。
	 */
	addColorAlpha(key: number, value: number): void {
		if (this._colorAlphaKeysCount < this._maxColorAlphaKeysCount) {
			var offset: number = this._colorAlphaKeysCount * 2;
			this._alphaElements[offset] = key;
			this._alphaElements[offset + 1] = value;
			this._colorAlphaKeysCount++;

			this._alphaElements = this._alphaElements;
		} else {
			console.warn("Gradient:warning:data count must lessEqual than " + this._maxColorAlphaKeysCount);
		}
	}

	/**
	 * @en Update a color RGB key.
	 * @param index The index.
	 * @param key The lifetime, ranging from 0 to 1.
	 * @param value The RGB value.
	 * @zh 更新颜色 RGB 帧。
	 * @param index 索引。
	 * @param key 生命周期，范围为 0 到 1。
	 * @param value RGB 值。
	 */
	updateColorRGB(index: number, key: number, value: Color): void {//TODO:以key为键自动排序
		if (index < this._colorRGBKeysCount) {
			var offset: number = index * 4;
			this._rgbElements[offset] = key;
			this._rgbElements[offset + 1] = value.r;
			this._rgbElements[offset + 2] = value.g;
			this._rgbElements[offset + 3] = value.b;

			this._rgbElements = this._rgbElements;
		} else {
			console.warn("Gradient:warning:index must lessEqual than colorRGBKeysCount:" + this._colorRGBKeysCount);
		}
	}

	/**
	 * @en Update a color Alpha key.
	 * @param index The index.
	 * @param key The lifetime, ranging from 0 to 1.
	 * @param value The Alpha value.
	 * @zh 更新颜色 Alpha 帧。
	 * @param index 索引。
	 * @param key 生命周期，范围为 0 到 1。
	 * @param value Alpha 值。
	 */
	updateColorAlpha(index: number, key: number, value: number): void {
		if (index < this._colorAlphaKeysCount) {
			var offset: number = index * 2;
			this._alphaElements[offset] = key;
			this._alphaElements[offset + 1] = value;

			this._alphaElements = this._alphaElements;
		} else {
			console.warn("Gradient:warning:index must lessEqual than colorAlphaKeysCount:" + this._colorAlphaKeysCount);
		}
	}

	/**
	 * @en Get RGB color through interpolation.
	 * @param lerpFactor Interpolation factor, clamped between 0 and 1.
	 * @param out The resulting color.
	 * @param startSearchIndex The starting search index. Default is 0.
	 * @param reverseSearch Whether to perform reverse interpolation. Default is false.
	 * @returns The current index after interpolation.
	 * @zh 通过插值获取RGB颜色。
	 * @param lerpFactor 插值因子，取值范围在0到1之间。
	 * @param out 颜色结果。
	 * @param startSearchIndex 开始查找索引。默认为0。
	 * @param reverseSearch 是否进行反向插值。默认为false。
	 * @returns 插值后的当前索引。
	 */
	evaluateColorRGB(lerpFactor: number, out: Color, startSearchIndex: number = 0, reverseSearch: boolean = false): number {
		lerpFactor = Math.min(Math.max(lerpFactor, 0.0), 1.0);

		var rgbElements: Float32Array = this._rgbElements;
		var curIndex: number = startSearchIndex;

		if (reverseSearch) {
			for (var i: number = curIndex; i >= 0; i--) {
				var offset: number = i * 4;
				var left: number = rgbElements[offset];
				if (lerpFactor === left) {
					out.r = rgbElements[offset + 1];
					out.g = rgbElements[offset + 2];
					out.b = rgbElements[offset + 3];
					return curIndex;
				}
				var right: number = rgbElements[offset + 4];
				switch (this._mode) {
					case GradientMode.Blend:
						if (lerpFactor > left && right) {
							if (lerpFactor > right)
								continue;
							var diff: number = right - left;
							var y1: number = right - lerpFactor;
							var y2: number = lerpFactor - left;
							out.r = (y1 * rgbElements[offset + 1] + y2 * rgbElements[offset + 5]) / diff;
							out.g = (y1 * rgbElements[offset + 2] + y2 * rgbElements[offset + 6]) / diff;
							out.b = (y1 * rgbElements[offset + 3] + y2 * rgbElements[offset + 7]) / diff;
							return curIndex;
						} else {
							curIndex--;
							continue;
						}
					case GradientMode.Fixed:
						if (lerpFactor > left) {
							if (lerpFactor > rgbElements[offset + 4])
								throw "Gradient:wrong startSearchIndex.";
							out.r = rgbElements[offset + 5];
							out.g = rgbElements[offset + 6];
							out.b = rgbElements[offset + 7];
							return curIndex;
						} else {
							curIndex--;
							continue;
						}
					default:
						throw "Gradient:unknown mode.";
				}
			}
		} else {
			for (var i: number = 0, n: number = this._rgbElements.length; i < n; i++) {
				offset = i * 4;
				var right: number = rgbElements[offset];
				if (lerpFactor === right) {
					out.r = rgbElements[offset + 1];
					out.g = rgbElements[offset + 2];
					out.b = rgbElements[offset + 3];
					return curIndex;
				}

				switch (this._mode) {
					case GradientMode.Blend:
						if (lerpFactor < right) {
							var left: number = rgbElements[offset - 4];
							if (lerpFactor < left)
								throw "Gradient:wrong startSearchIndex.";
							var diff: number = right - left;
							var y1: number = right - lerpFactor;
							var y2: number = lerpFactor - left;
							out.r = (y1 * rgbElements[offset - 3] + y2 * rgbElements[offset + 1]) / diff;
							out.g = (y1 * rgbElements[offset - 2] + y2 * rgbElements[offset + 2]) / diff;
							out.b = (y1 * rgbElements[offset - 1] + y2 * rgbElements[offset + 3]) / diff;
							return curIndex;
						} else {
							curIndex++;
							continue;
						}
					case GradientMode.Fixed:
						if (lerpFactor < right) {
							if (lerpFactor < rgbElements[offset - 4])
								throw "Gradient:wrong startSearchIndex.";
							out.r = rgbElements[offset + 1];
							out.g = rgbElements[offset + 2];
							out.b = rgbElements[offset + 3];
							return curIndex;
						} else {
							curIndex++;
							continue;
						}
					default:
						throw "Gradient:unknown mode.";
				}
			}
		}

		return curIndex;
	}

	/**
	 * @en Get the alpha value through interpolation.
	 * @param lerpFactor The interpolation factor.
	 * @param outColor The resulting color.
	 * @param startSearchIndex The starting search index. Default is 0.
	 * @param reverseSearch Whether to perform reverse interpolation. Default is false.
	 * @returns The resulting index.
	 * @zh 通过插值获取透明值。
	 * @param lerpFactor 插值因子。
	 * @param outColor 颜色结果。
	 * @param startSearchIndex 开始查找索引。默认为0。
	 * @param reverseSearch 是否反向插值。默认为false。
	 * @returns 结果索引。
	 */
	evaluateColorAlpha(lerpFactor: number, outColor: Color, startSearchIndex: number = 0, reverseSearch: boolean = false): number {
		lerpFactor = Math.min(Math.max(lerpFactor, 0.0), 1.0);
		var alphaElements: Float32Array = this._alphaElements;
		var curIndex: number = startSearchIndex;

		if (reverseSearch) {
			for (var i: number = curIndex; i >= 0; i--) {
				var offset: number = i * 2;
				var left: number = alphaElements[offset];
				if (lerpFactor === left) {
					outColor.a = alphaElements[offset + 1];
					return curIndex;
				}
				var right: number = alphaElements[offset + 2];
				switch (this._mode) {
					case GradientMode.Blend:
						if (lerpFactor > left && right) {
							if (lerpFactor > right)
								continue;
							var diff: number = right - left;
							var x1: number = right - lerpFactor;
							var x2: number = lerpFactor - left;
							outColor.a = (x1 * alphaElements[offset + 1] + x2 * alphaElements[offset + 3]) / diff;
							return curIndex;
						} else {
							curIndex--;
							continue;
						}
					case GradientMode.Fixed:
						if (lerpFactor > left) {
							if (lerpFactor > alphaElements[offset + 2])
								throw "Gradient:wrong startSearchIndex.";
							outColor.a = alphaElements[offset + 3];
							return curIndex;
						} else {
							curIndex--;
							continue;
						}
					default:
						throw "Gradient:unknown mode.";
				}
			}
		} else {
			for (var i: number = curIndex, n: number = this._alphaElements.length; i < n; i++) {
				var offset: number = i * 2;
				var right: number = alphaElements[offset];
				if (lerpFactor === right) {
					outColor.a = alphaElements[offset + 1];
					return curIndex;
				}

				switch (this._mode) {
					case GradientMode.Blend:
						if (lerpFactor < right) {
							var left: number = alphaElements[offset - 2];
							if (lerpFactor < left)
								throw "Gradient:wrong startSearchIndex.";
							var diff: number = right - left;
							var x1: number = right - lerpFactor;
							var x2: number = lerpFactor - left;
							outColor.a = (x1 * alphaElements[offset - 1] + x2 * alphaElements[offset + 1]) / diff;
							return curIndex;
						} else {
							curIndex++;
							continue;
						}
					case GradientMode.Fixed:
						if (lerpFactor < right) {
							if (lerpFactor < alphaElements[offset - 2])
								throw "Gradient:wrong startSearchIndex.";
							outColor.a = alphaElements[offset + 1];
							return curIndex;
						} else {
							curIndex++;
							continue;
						}
					default:
						throw "Gradient:unknown mode.";
				}
			}
		}

		return curIndex;
	}

	/**
	 * @en Clone.
	 * @param destObject The destination object to clone to.
	 * @zh 克隆。
	 * @param destObject 克隆的目标对象。
	 */
	cloneTo(destObject: any): void {
		var destGradientDataColor: Gradient = (<Gradient>destObject);
		var i: number, n: number;
		destGradientDataColor._colorAlphaKeysCount = this._colorAlphaKeysCount;
		let destAlphaElements = destGradientDataColor._alphaElements = new Float32Array(this._alphaElements.length);

		for (i = 0, n = this._alphaElements.length; i < n; i++)
			destAlphaElements[i] = this._alphaElements[i];

		destGradientDataColor._colorRGBKeysCount = this._colorRGBKeysCount;
		var destRGBElements: Float32Array = destGradientDataColor._rgbElements = new Float32Array(this._rgbElements.length);
		for (i = 0, n = this._rgbElements.length; i < n; i++)
			destRGBElements[i] = this._rgbElements[i];
	}

	/**
	 * @en Clone the gradient.
	 * @returns A clone of the gradient.
	 * @zh 克隆渐变。
	 * @returns 克隆的副本。
	 */
	clone(): any {
		var destGradientDataColor: Gradient = new Gradient();
		destGradientDataColor.setMaxKeyCount(this.maxColorRGBKeysCount, this.maxColorAlphaKeysCount);
		this.cloneTo(destGradientDataColor);
		return destGradientDataColor;
	}

}


