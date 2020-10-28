import { GradientMode } from "./GradientMode";
import { IClone } from "./IClone"
import { Color } from "../math/Color"


/**
 * <code>Gradient</code> 类用于创建颜色渐变。
 */
export class Gradient implements IClone {
	private _mode: number = 0;
	private _maxColorRGBKeysCount: number = 0;
	private _maxColorAlphaKeysCount: number = 0;
	private _colorRGBKeysCount: number = 0;
	private _colorAlphaKeysCount: number = 0;

	/**@internal */
	_alphaElements: Float32Array = null;
	/**@internal */
	_rgbElements: Float32Array = null;

	/**
	 * 获取梯度模式。
	 * @return  梯度模式。
	 */
	get mode(): number {
		return this._mode;
	}

	/**
	 * 设置梯度模式。
	 * @param value 梯度模式。
	 */
	set mode(value: number) {
		this._mode = value;
	}

	/**
	 * 获取颜色RGB数量。
	 * @return 颜色RGB数量。
	 */
	get colorRGBKeysCount(): number {
		return this._colorRGBKeysCount;
	}

	/**
	 * 获取颜色Alpha数量。
	 * @return 颜色Alpha数量。
	 */
	get colorAlphaKeysCount(): number {
		return this._colorAlphaKeysCount;
	}

	/**
	 * 获取最大颜色RGB帧数量。
	 * @return 最大RGB帧数量。
	 */
	get maxColorRGBKeysCount(): number {
		return this._maxColorRGBKeysCount;
	}

	/**
	 * 获取最大颜色Alpha帧数量。
	 * @return 最大Alpha帧数量。
	 */
	get maxColorAlphaKeysCount(): number {
		return this._maxColorAlphaKeysCount;
	}

	/**
	 * 创建一个 <code>Gradient</code> 实例。
	 * @param maxColorRGBKeyCount 最大RGB帧个数。
	 * @param maxColorAlphaKeyCount 最大Alpha帧个数。
	 */
	constructor(maxColorRGBKeyCount: number, maxColorAlphaKeyCount: number) {
		this._maxColorRGBKeysCount = maxColorRGBKeyCount;
		this._maxColorAlphaKeysCount = maxColorAlphaKeyCount;
		this._rgbElements = new Float32Array(maxColorRGBKeyCount * 4);
		this._alphaElements = new Float32Array(maxColorAlphaKeyCount * 2);
	}

	/**
	 * 增加颜色RGB帧。
	 * @param	key 生命周期，范围为0到1。
	 * @param	value RGB值。
	 */
	addColorRGB(key: number, value: Color): void {
		if (this._colorRGBKeysCount < this._maxColorRGBKeysCount) {
			var offset: number = this._colorRGBKeysCount * 4;
			this._rgbElements[offset] = key;
			this._rgbElements[offset + 1] = value.r;
			this._rgbElements[offset + 2] = value.g;
			this._rgbElements[offset + 3] = value.b;
			this._colorRGBKeysCount++;
		} else {
			console.warn("Gradient:warning:data count must lessEqual than " + this._maxColorRGBKeysCount);
		}
	}

	/**
	 * 增加颜色Alpha帧。
	 * @param	key 生命周期，范围为0到1。
	 * @param	value Alpha值。
	 */
	addColorAlpha(key: number, value: number): void {
		if (this._colorAlphaKeysCount < this._maxColorAlphaKeysCount) {
			var offset: number = this._colorAlphaKeysCount * 2;
			this._alphaElements[offset] = key;
			this._alphaElements[offset + 1] = value;
			this._colorAlphaKeysCount++;
		} else {
			console.warn("Gradient:warning:data count must lessEqual than " + this._maxColorAlphaKeysCount);
		}
	}

	/**
	 * 更新颜色RGB帧。
	 * @param   index 索引。
	 * @param	key 生命周期，范围为0到1。
	 * @param	value RGB值。
	 */
	updateColorRGB(index: number, key: number, value: Color): void {//TODO:以key为键自动排序
		if (index < this._colorRGBKeysCount) {
			var offset: number = index * 4;
			this._rgbElements[offset] = key;
			this._rgbElements[offset + 1] = value.r;
			this._rgbElements[offset + 2] = value.g;
			this._rgbElements[offset + 3] = value.b;
		} else {
			console.warn("Gradient:warning:index must lessEqual than colorRGBKeysCount:" + this._colorRGBKeysCount);
		}
	}

	/**
	 * 更新颜色Alpha帧。
	 * @param   index 索引。
	 * @param	key 生命周期，范围为0到1。
	 * @param	value Alpha值。
	 */
	updateColorAlpha(index: number, key: number, value: number): void {
		if (index < this._colorAlphaKeysCount) {
			var offset: number = index * 2;
			this._alphaElements[offset] = key;
			this._alphaElements[offset + 1] = value;
		} else {
			console.warn("Gradient:warning:index must lessEqual than colorAlphaKeysCount:" + this._colorAlphaKeysCount);
		}
	}

	/**
	 * 通过插值获取RGB颜色。
	 * @param  lerpFactor 插值因子。
	 * @param  out 颜色结果。
	 * @param  开始查找索引。
	 * @return 结果索引。
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

				switch (this._mode) {
					case GradientMode.Blend:
						if (lerpFactor > left) {
							var right: number = rgbElements[offset + 4];
							if (lerpFactor > right)
								throw "Gradient:wrong startSearchIndex.";
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
	 * 通过插值获取透明值。
	 * @param  lerpFactor 插值因子。
	 * @param  out 颜色结果。
	 * @param  开始查找索引。
	 * @return 结果索引 。
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

				switch (this._mode) {
					case GradientMode.Blend:
						if (lerpFactor > left) {
							var right: number = alphaElements[offset + 2];
							if (lerpFactor > right)
								throw "Gradient:wrong startSearchIndex.";

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
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destGradientDataColor: Gradient = (<Gradient>destObject);
		var i: number, n: number;
		destGradientDataColor._colorAlphaKeysCount = this._colorAlphaKeysCount;
		var destAlphaElements: Float32Array = destGradientDataColor._alphaElements;
		for (i = 0, n = this._alphaElements.length; i < n; i++)
			destAlphaElements[i] = this._alphaElements[i];

		destGradientDataColor._colorRGBKeysCount = this._colorRGBKeysCount;
		var destRGBElements: Float32Array = destGradientDataColor._rgbElements;
		for (i = 0, n = this._rgbElements.length; i < n; i++)
			destRGBElements[i] = this._rgbElements[i];

	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var destGradientDataColor: Gradient = new Gradient(this._maxColorRGBKeysCount, this._maxColorAlphaKeysCount);
		this.cloneTo(destGradientDataColor);
		return destGradientDataColor;
	}

}


