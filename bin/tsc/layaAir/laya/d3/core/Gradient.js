import { GradientMode } from "./GradientMode";
/**
 * <code>Gradient</code> 类用于创建颜色渐变。
 */
export class Gradient {
    /**
     * 创建一个 <code>Gradient</code> 实例。
     * @param maxColorRGBKeyCount 最大RGB帧个数。
     * @param maxColorAlphaKeyCount 最大Alpha帧个数。
     */
    constructor(maxColorRGBKeyCount, maxColorAlphaKeyCount) {
        this._mode = 0;
        this._maxColorRGBKeysCount = 0;
        this._maxColorAlphaKeysCount = 0;
        this._colorRGBKeysCount = 0;
        this._colorAlphaKeysCount = 0;
        /**@internal */
        this._alphaElements = null;
        /**@internal */
        this._rgbElements = null;
        this._maxColorRGBKeysCount = maxColorRGBKeyCount;
        this._maxColorAlphaKeysCount = maxColorAlphaKeyCount;
        this._rgbElements = new Float32Array(maxColorRGBKeyCount * 4);
        this._alphaElements = new Float32Array(maxColorAlphaKeyCount * 2);
    }
    /**
     * 获取梯度模式。
     * @return  梯度模式。
     */
    get mode() {
        return this._mode;
    }
    /**
     * 设置梯度模式。
     * @param value 梯度模式。
     */
    set mode(value) {
        this._mode = value;
    }
    /**
     * 获取颜色RGB数量。
     * @return 颜色RGB数量。
     */
    get colorRGBKeysCount() {
        return this._colorRGBKeysCount;
    }
    /**
     * 获取颜色Alpha数量。
     * @return 颜色Alpha数量。
     */
    get colorAlphaKeysCount() {
        return this._colorAlphaKeysCount;
    }
    /**
     * 获取最大颜色RGB帧数量。
     * @return 最大RGB帧数量。
     */
    get maxColorRGBKeysCount() {
        return this._maxColorRGBKeysCount;
    }
    /**
     * 获取最大颜色Alpha帧数量。
     * @return 最大Alpha帧数量。
     */
    get maxColorAlphaKeysCount() {
        return this._maxColorAlphaKeysCount;
    }
    /**
     * 增加颜色RGB帧。
     * @param	key 生命周期，范围为0到1。
     * @param	value RGB值。
     */
    addColorRGB(key, value) {
        if (this._colorRGBKeysCount < this._maxColorRGBKeysCount) {
            var offset = this._colorRGBKeysCount * 4;
            this._rgbElements[offset] = key;
            this._rgbElements[offset + 1] = value.r;
            this._rgbElements[offset + 2] = value.g;
            this._rgbElements[offset + 3] = value.b;
            this._colorRGBKeysCount++;
        }
        else {
            console.warn("Gradient:warning:data count must lessEqual than " + this._maxColorRGBKeysCount);
        }
    }
    /**
     * 增加颜色Alpha帧。
     * @param	key 生命周期，范围为0到1。
     * @param	value Alpha值。
     */
    addColorAlpha(key, value) {
        if (this._colorAlphaKeysCount < this._maxColorAlphaKeysCount) {
            var offset = this._colorAlphaKeysCount * 2;
            this._alphaElements[offset] = key;
            this._alphaElements[offset + 1] = value;
            this._colorAlphaKeysCount++;
        }
        else {
            console.warn("Gradient:warning:data count must lessEqual than " + this._maxColorAlphaKeysCount);
        }
    }
    /**
     * 更新颜色RGB帧。
     * @param   index 索引。
     * @param	key 生命周期，范围为0到1。
     * @param	value RGB值。
     */
    updateColorRGB(index, key, value) {
        if (index < this._colorRGBKeysCount) {
            var offset = index * 4;
            this._rgbElements[offset] = key;
            this._rgbElements[offset + 1] = value.r;
            this._rgbElements[offset + 2] = value.g;
            this._rgbElements[offset + 3] = value.b;
        }
        else {
            console.warn("Gradient:warning:index must lessEqual than colorRGBKeysCount:" + this._colorRGBKeysCount);
        }
    }
    /**
     * 更新颜色Alpha帧。
     * @param   index 索引。
     * @param	key 生命周期，范围为0到1。
     * @param	value Alpha值。
     */
    updateColorAlpha(index, key, value) {
        if (index < this._colorAlphaKeysCount) {
            var offset = index * 2;
            this._alphaElements[offset] = key;
            this._alphaElements[offset + 1] = value;
        }
        else {
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
    evaluateColorRGB(lerpFactor, out, startSearchIndex = 0, reverseSearch = false) {
        lerpFactor = Math.min(Math.max(lerpFactor, 0.0), 1.0);
        var rgbElements = this._rgbElements;
        var curIndex = startSearchIndex;
        if (reverseSearch) {
            for (var i = curIndex; i >= 0; i--) {
                var offset = i * 4;
                var left = rgbElements[offset];
                if (lerpFactor === left) {
                    out.r = rgbElements[offset + 1];
                    out.g = rgbElements[offset + 2];
                    out.b = rgbElements[offset + 3];
                    return curIndex;
                }
                switch (this._mode) {
                    case GradientMode.Blend:
                        if (lerpFactor > left) {
                            var right = rgbElements[offset + 4];
                            if (lerpFactor > right)
                                throw "Gradient:wrong startSearchIndex.";
                            var diff = right - left;
                            var y1 = right - lerpFactor;
                            var y2 = lerpFactor - left;
                            out.r = (y1 * rgbElements[offset + 1] + y2 * rgbElements[offset + 5]) / diff;
                            out.g = (y1 * rgbElements[offset + 2] + y2 * rgbElements[offset + 6]) / diff;
                            out.b = (y1 * rgbElements[offset + 3] + y2 * rgbElements[offset + 7]) / diff;
                            return curIndex;
                        }
                        else {
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
                        }
                        else {
                            curIndex--;
                            continue;
                        }
                    default:
                        throw "Gradient:unknown mode.";
                }
            }
        }
        else {
            for (var i = 0, n = this._rgbElements.length; i < n; i++) {
                offset = i * 4;
                var right = rgbElements[offset];
                if (lerpFactor === right) {
                    out.r = rgbElements[offset + 1];
                    out.g = rgbElements[offset + 2];
                    out.b = rgbElements[offset + 3];
                    return curIndex;
                }
                switch (this._mode) {
                    case GradientMode.Blend:
                        if (lerpFactor < right) {
                            var left = rgbElements[offset - 4];
                            if (lerpFactor < left)
                                throw "Gradient:wrong startSearchIndex.";
                            var diff = right - left;
                            var y1 = right - lerpFactor;
                            var y2 = lerpFactor - left;
                            out.r = (y1 * rgbElements[offset - 3] + y2 * rgbElements[offset + 1]) / diff;
                            out.g = (y1 * rgbElements[offset - 2] + y2 * rgbElements[offset + 2]) / diff;
                            out.b = (y1 * rgbElements[offset - 1] + y2 * rgbElements[offset + 3]) / diff;
                            return curIndex;
                        }
                        else {
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
                        }
                        else {
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
    evaluateColorAlpha(lerpFactor, outColor, startSearchIndex = 0, reverseSearch = false) {
        lerpFactor = Math.min(Math.max(lerpFactor, 0.0), 1.0);
        var alphaElements = this._alphaElements;
        var curIndex = startSearchIndex;
        if (reverseSearch) {
            for (var i = curIndex; i >= 0; i--) {
                var offset = i * 2;
                var left = alphaElements[offset];
                if (lerpFactor === left) {
                    outColor.a = alphaElements[offset + 1];
                    return curIndex;
                }
                switch (this._mode) {
                    case GradientMode.Blend:
                        if (lerpFactor > left) {
                            var right = alphaElements[offset + 2];
                            if (lerpFactor > right)
                                throw "Gradient:wrong startSearchIndex.";
                            var diff = right - left;
                            var x1 = right - lerpFactor;
                            var x2 = lerpFactor - left;
                            outColor.a = (x1 * alphaElements[offset + 1] + x2 * alphaElements[offset + 3]) / diff;
                            return curIndex;
                        }
                        else {
                            curIndex--;
                            continue;
                        }
                    case GradientMode.Fixed:
                        if (lerpFactor > left) {
                            if (lerpFactor > alphaElements[offset + 2])
                                throw "Gradient:wrong startSearchIndex.";
                            outColor.a = alphaElements[offset + 3];
                            return curIndex;
                        }
                        else {
                            curIndex--;
                            continue;
                        }
                    default:
                        throw "Gradient:unknown mode.";
                }
            }
        }
        else {
            for (var i = curIndex, n = this._alphaElements.length; i < n; i++) {
                var offset = i * 2;
                var right = alphaElements[offset];
                if (lerpFactor === right) {
                    outColor.a = alphaElements[offset + 1];
                    return curIndex;
                }
                switch (this._mode) {
                    case GradientMode.Blend:
                        if (lerpFactor < right) {
                            var left = alphaElements[offset - 2];
                            if (lerpFactor < left)
                                throw "Gradient:wrong startSearchIndex.";
                            var diff = right - left;
                            var x1 = right - lerpFactor;
                            var x2 = lerpFactor - left;
                            outColor.a = (x1 * alphaElements[offset - 1] + x2 * alphaElements[offset + 1]) / diff;
                            return curIndex;
                        }
                        else {
                            curIndex++;
                            continue;
                        }
                    case GradientMode.Fixed:
                        if (lerpFactor < right) {
                            if (lerpFactor < alphaElements[offset - 2])
                                throw "Gradient:wrong startSearchIndex.";
                            outColor.a = alphaElements[offset + 1];
                            return curIndex;
                        }
                        else {
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
    cloneTo(destObject) {
        var destGradientDataColor = destObject;
        var i, n;
        destGradientDataColor._colorAlphaKeysCount = this._colorAlphaKeysCount;
        var destAlphaElements = destGradientDataColor._alphaElements;
        for (i = 0, n = this._alphaElements.length; i < n; i++)
            destAlphaElements[i] = this._alphaElements[i];
        destGradientDataColor._colorRGBKeysCount = this._colorRGBKeysCount;
        var destRGBElements = destGradientDataColor._rgbElements;
        for (i = 0, n = this._rgbElements.length; i < n; i++)
            destRGBElements[i] = this._rgbElements[i];
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var destGradientDataColor = new Gradient(this._maxColorRGBKeysCount, this._maxColorAlphaKeysCount);
        this.cloneTo(destGradientDataColor);
        return destGradientDataColor;
    }
}
