import { Filter } from "./Filter";
import { IFilter } from "./IFilter";
import { ColorUtils } from "../utils/ColorUtils"

/**
 * <p><code>ColorFilter</code> 是颜色滤镜。使用 ColorFilter 类可以将 4 x 5 矩阵转换应用于输入图像上的每个像素的 RGBA 颜色和 Alpha 值，以生成具有一组新的 RGBA 颜色和 Alpha 值的结果。该类允许饱和度更改、色相旋转、亮度转 Alpha 以及各种其他效果。您可以将滤镜应用于任何显示对象（即，从 Sprite 类继承的对象）。</p>
 * <p>注意：对于 RGBA 值，最高有效字节代表红色通道值，其后的有效字节分别代表绿色、蓝色和 Alpha 通道值。</p>
 */
export class ColorFilter extends Filter implements IFilter {
    /**对比度列表*/
    private static DELTA_INDEX: any[] = [0, 0.01, 0.02, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1, 0.11, 0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.20, 0.21, 0.22, 0.24, 0.25, 0.27, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42, 0.44, 0.46, 0.48, 0.5, 0.53, 0.56, 0.59, 0.62, 0.65, 0.68, 0.71, 0.74, 0.77, 0.80, 0.83, 0.86, 0.89, 0.92, 0.95, 0.98, 1.0, 1.06, 1.12, 1.18, 1.24, 1.30, 1.36, 1.42, 1.48, 1.54, 1.60, 1.66, 1.72, 1.78, 1.84, 1.90, 1.96, 2.0, 2.12, 2.25, 2.37, 2.50, 2.62, 2.75, 2.87, 3.0, 3.2, 3.4, 3.6, 3.8, 4.0, 4.3, 4.7, 4.9, 5.0, 5.5, 6.0, 6.5, 6.8, 7.0, 7.3, 7.5, 7.8, 8.0, 8.4, 8.7, 9.0, 9.4, 9.6, 9.8, 10.0];
    /**灰色矩阵*/
    private static GRAY_MATRIX: any[] = [0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0, 0, 0, 1, 0];
    /**单位矩阵,表示什么效果都没有*/
    private static IDENTITY_MATRIX: any[] = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1];
    /**标准矩阵长度*/
    private static LENGTH: number = 25;

    /** @internal */
    _mat: Float32Array;
    /** @internal */
    _alpha: Float32Array;
    /**当前使用的矩阵*/
    private _matrix: any[];

    /**
     * 创建一个 <code>ColorFilter</code> 实例。
     * @param mat	（可选）由 20 个项目（排列成 4 x 5 矩阵）组成的数组，用于颜色转换。
     */
    constructor(mat: any[] = null) {
        super();
        if (!mat) mat = this._copyMatrix(ColorFilter.IDENTITY_MATRIX);
        this._mat = new Float32Array(16);
        this._alpha = new Float32Array(4);
        this.setByMatrix(mat);
    }

    /**
     * 设置为灰色滤镜
     */
    gray(): ColorFilter {
        return this.setByMatrix(ColorFilter.GRAY_MATRIX);
    }

    /**
     * 设置为变色滤镜
     * @param red 红色增量,范围:0~255
     * @param green 绿色增量,范围:0~255
     * @param blue 蓝色增量,范围:0~255
     * @param alpha alpha,范围:0~1
     */
    color(red: number = 0, green: number = 0, blue: number = 0, alpha: number = 1): ColorFilter {
        return this.setByMatrix([1, 0, 0, 0, red, 0, 1, 0, 0, green, 0, 0, 1, 0, blue, 0, 0, 0, 1, alpha]);
    }

    /**
     * 设置滤镜色
     * @param	color 颜色值
     */
    setColor(color: string): ColorFilter {
        var arr: any[] = ColorUtils.create(color).arrColor;
        var mt: any[] = [0, 0, 0, 0, 256 * arr[0], 0, 0, 0, 0, 256 * arr[1], 0, 0, 0, 0, 256 * arr[2], 0, 0, 0, 1, 0];
        return this.setByMatrix(mt);
    }

    /**
     * 设置矩阵数据
     * @param matrix 由 20 个项目（排列成 4 x 5 矩阵）组成的数组
     * @return this
     */
    setByMatrix(matrix: any[]): ColorFilter {
        if (this._matrix != matrix) this._copyMatrix(matrix);
        var j: number = 0;
        var z: number = 0;
        for (var i: number = 0; i < 20; i++) {
            if (i % 5 != 4) {
                this._mat[j++] = matrix[i];
            } else {
                this._alpha[z++] = matrix[i];
            }
        }
        return this;
    }

    /**
     * @private 
     * @override
    */
    get type(): number {
        return Filter.COLOR;
    }

    /**
     * 调整颜色，包括亮度，对比度，饱和度和色调
     * @param brightness 亮度,范围:-100~100
     * @param contrast 对比度,范围:-100~100
     * @param saturation 饱和度,范围:-100~100
     * @param hue 色调,范围:-180~180
     * @return this
     */
    adjustColor(brightness: number, contrast: number, saturation: number, hue: number): ColorFilter {
        this.adjustHue(hue);
        this.adjustContrast(contrast);
        this.adjustBrightness(brightness);
        this.adjustSaturation(saturation);
        return this;
    }

    /**
     * 调整亮度
     * @param brightness 亮度,范围:-100~100
     * @return this
     */
    adjustBrightness(brightness: number): ColorFilter {
        brightness = this._clampValue(brightness, 100);
        if (brightness == 0 || isNaN(brightness)) return this;
        return this._multiplyMatrix([1, 0, 0, 0, brightness, 0, 1, 0, 0, brightness, 0, 0, 1, 0, brightness, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
    }

    /**
     * 调整对比度
     * @param contrast 对比度,范围:-100~100
     * @return this
     */
    adjustContrast(contrast: number): ColorFilter {
        contrast = this._clampValue(contrast, 100);
        if (contrast == 0 || isNaN(contrast)) return this;
        var x: number;
        if (contrast < 0) {
            x = 127 + contrast / 100 * 127
        } else {
            x = contrast % 1;
            if (x == 0) {
                x = ColorFilter.DELTA_INDEX[contrast];
            } else {
                x = ColorFilter.DELTA_INDEX[(contrast << 0)] * (1 - x) + ColorFilter.DELTA_INDEX[(contrast << 0) + 1] * x;
            }
            x = x * 127 + 127;
        }
        var x1: number = x / 127;
        var x2: number = (127 - x) * 0.5;
        return this._multiplyMatrix([x1, 0, 0, 0, x2, 0, x1, 0, 0, x2, 0, 0, x1, 0, x2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
    }

    /**
     * 调整饱和度
     * @param saturation 饱和度,范围:-100~100
     * @return this
     */
    adjustSaturation(saturation: number): ColorFilter {
        saturation = this._clampValue(saturation, 100);
        if (saturation == 0 || isNaN(saturation)) return this;
        var x: number = 1 + ((saturation > 0) ? 3 * saturation / 100 : saturation / 100);
        var dx: number = 1 - x;
        var r: number = 0.3086 * dx;
        var g: number = 0.6094 * dx;
        var b: number = 0.0820 * dx;

        return this._multiplyMatrix([r + x, g, b, 0, 0, r, g + x, b, 0, 0, r, g, b + x, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
    }

    /**
     * 调整色调
     * @param hue 色调,范围:-180~180
     * @return this
     */
    adjustHue(hue: number): ColorFilter {
        hue = this._clampValue(hue, 180) / 180 * Math.PI;
        if (hue == 0 || isNaN(hue)) return this;
        var cos: number = Math.cos(hue);
        var sin: number = Math.sin(hue);
        var r: number = 0.213;
        var g: number = 0.715;
        var b: number = 0.072;
        return this._multiplyMatrix([r + cos * (1 - r) + sin * (-r), g + cos * (-g) + sin * (-g), b + cos * (-b) + sin * (1 - b), 0, 0, r + cos * (-r) + sin * (0.143), g + cos * (1 - g) + sin * (0.140), b + cos * (-b) + sin * (-0.283), 0, 0, r + cos * (-r) + sin * (-(1 - r)), g + cos * (-g) + sin * (g), b + cos * (1 - b) + sin * (b), 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
    }

    /**
     * 重置成单位矩阵，去除滤镜效果
     */
    reset(): ColorFilter {
        return this.setByMatrix(this._copyMatrix(ColorFilter.IDENTITY_MATRIX));
    }

    /**
     * 矩阵乘法
     * @param matrix
     * @return this
     */
    private _multiplyMatrix(matrix: any[]): ColorFilter {
        var col: any[] = [];
        this._matrix = this._fixMatrix(this._matrix);
        for (var i: number = 0; i < 5; i++) {
            for (var j: number = 0; j < 5; j++) {
                col[j] = this._matrix[j + i * 5];
            }
            for (j = 0; j < 5; j++) {
                var val: number = 0;
                for (var k: number = 0; k < 5; k++) {
                    val += matrix[j + k * 5] * col[k];
                }
                this._matrix[j + i * 5] = val;
            }
        }
        return this.setByMatrix(this._matrix);
    }

    /**
     * 规范值的范围
     * @param val 当前值
     * @param limit 值的范围-limit~limit
     */
    private _clampValue(val: number, limit: number): number {
        return Math.min(limit, Math.max(-limit, val));
    }

    /**
     * 规范矩阵,将矩阵调整到正确的大小
     * @param matrix 需要调整的矩阵
     */
    private _fixMatrix(matrix: any[] = null): any[] {
        if (matrix == null) return ColorFilter.IDENTITY_MATRIX;
        if (matrix.length < ColorFilter.LENGTH) matrix = matrix.slice(0, matrix.length).concat(ColorFilter.IDENTITY_MATRIX.slice(matrix.length, ColorFilter.LENGTH));
        else if (matrix.length > ColorFilter.LENGTH) matrix = matrix.slice(0, ColorFilter.LENGTH);
        return matrix;
    }

    /**
     * 复制矩阵
     */
    private _copyMatrix(matrix: any[]): any[] {
        var len: number = ColorFilter.LENGTH;
        if (!this._matrix) this._matrix = [];
        for (var i: number = 0; i < len; i++) {
            this._matrix[i] = matrix[i];
        }
        return this._matrix;
    }
}

