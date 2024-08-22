import { Filter } from "./Filter";
import { IFilter } from "./IFilter";
import { ColorUtils } from "../utils/ColorUtils"
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { ShaderDefine } from "../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { RenderTexture2D } from "../resource/RenderTexture2D";

/**
 * @en An array representing a list of contrast values.
 * @zh 表示对比度值列表的数组。
 */
const DELTA_INDEX: any[] = [0, 0.01, 0.02, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1, 0.11, 0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.20, 0.21, 0.22, 0.24, 0.25, 0.27, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42, 0.44, 0.46, 0.48, 0.5, 0.53, 0.56, 0.59, 0.62, 0.65, 0.68, 0.71, 0.74, 0.77, 0.80, 0.83, 0.86, 0.89, 0.92, 0.95, 0.98, 1.0, 1.06, 1.12, 1.18, 1.24, 1.30, 1.36, 1.42, 1.48, 1.54, 1.60, 1.66, 1.72, 1.78, 1.84, 1.90, 1.96, 2.0, 2.12, 2.25, 2.37, 2.50, 2.62, 2.75, 2.87, 3.0, 3.2, 3.4, 3.6, 3.8, 4.0, 4.3, 4.7, 4.9, 5.0, 5.5, 6.0, 6.5, 6.8, 7.0, 7.3, 7.5, 7.8, 8.0, 8.4, 8.7, 9.0, 9.4, 9.6, 9.8, 10.0];
/**
 * @en An array representing a gray matrix.
 * @zh 表示灰色矩阵的数组。
 */
const GRAY_MATRIX: any[] = [0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0.3086, 0.6094, 0.082, 0, 0, 0, 0, 0, 1, 0];
/**
 * @en An array representing an identity matrix, which signifies no effect or change.
 * @zh 表示单位矩阵的数组，它表示没有效果或变化。
 */
const IDENTITY_MATRIX: any[] = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1];
/**
 * @en Standard matrix length
 * @zh 标准矩阵长度。
 */
const LENGTH: number = 25;

/**
 * @en The `ColorFilter` class represents a color filter that applies a 4x5 matrix transformation to the RGBA color and Alpha values of each pixel of the input image to produce a result with a new set of RGBA colors and Alpha values. This class allows for saturation adjustments, hue rotation, brightness to Alpha, and various other effects. You can apply the filter to any display object (i.e., an object that inherits from the `Sprite` class).
 * For RGBA values, the most significant byte represents the red channel value, followed by the green, blue, and Alpha channel values respectively.
 * @zh `ColorFilter` 类是一个颜色滤镜，它将 4x5 矩阵转换应用于输入图像上的每个像素的 RGBA 颜色和 Alpha 值，以生成具有一组新的 RGBA 颜色和 Alpha 值的结果。此类允许饱和度更改、色相旋转、亮度转 Alpha 以及各种其他效果。您可以将滤镜应用于任何显示对象（即从 `Sprite` 类继承的对象）。
 * 注意：对于 RGBA 值，最高有效字节代表红色通道值，其后的有效字节分别代表绿色、蓝色和 Alpha 通道值。
 */
export class ColorFilter extends Filter implements IFilter {

    /** @internal */
    _mat: Float32Array;
    /** @internal */
    _alpha: Float32Array;
    /**@internal 
     * @en Represents the current matrix being applied by the filter.
     * @zh 当前使用的矩阵
     */
    _matrix: any[];

    /**
     * @en Creates an instance of the ColorFilter class with an optional 4x5 matrix for color transformation.
     * @param mat An array with 20 elements arranged in a 4x5 matrix for color transformation.
     * @zh 创建 `ColorFilter` 类的实例，可选择传入用于颜色转换的 4x5 矩阵。
     * @param mat 用于颜色转换的由 20 个元素组成的数组（排列成 4x5 矩阵）。
     */
    constructor(mat: any[] = null) {
        super();
        if (!mat) mat = this._copyMatrix(IDENTITY_MATRIX);
        this._mat = new Float32Array(16);
        this._alpha = new Float32Array(4);
        this.setByMatrix(mat);
    }
    /** @ignore */
    render(texture: RenderTexture2D, width: number, height: number): void {
    }

    /**
     * @en Sets the filter to a grayscale filter.
     * @zh 将滤镜设置为灰度滤镜。
     */
    gray(): ColorFilter {
        return this.setByMatrix(GRAY_MATRIX);
    }

    /**
     * @en Sets the filter to a color transformation filter with the specified red, green, blue, and alpha coefficients.
     * @param red The red coefficient, range: 0 to 1.
     * @param green The green coefficient, range: 0 to 1.
     * @param blue The blue coefficient, range: 0 to 1.
     * @param alpha The alpha coefficient, range: 0 to 1.
     * @zh 将滤镜设置为具有指定红色、绿色、蓝色和 Alpha 系数的颜色转换滤镜。
     * @param red 红色系数,范围:0~1
     * @param green 绿色系数,范围:0~1
     * @param blue 蓝色系数,范围:0~1
     * @param alpha alpha系数,范围:0~1
     */
    color(red: number = 0, green: number = 0, blue: number = 0, alpha: number = 1): ColorFilter {
        return this.setByMatrix([red, 0, 0, 0, 1, 0, green, 0, 0, 1, 0, 0, blue, 0, 1, 0, 0, 0, alpha, 0]);
    }

    /**
     * @en Sets the filter color using a color value.
     * @param color The color value in string format.
     * @zh 使用颜色值设置滤镜颜色。
     * @param  color 颜色值
     */
    setColor(color: string): ColorFilter {
        var arr: any[] = ColorUtils.create(color).arrColor;
        var mt: any[] = [0, 0, 0, 0, 256 * arr[0], 0, 0, 0, 0, 256 * arr[1], 0, 0, 0, 0, 256 * arr[2], 0, 0, 0, 1, 0];
        return this.setByMatrix(mt);
    }

    /**
     * @en Sets the matrix data.
     * @param matrix An array with 20 elements arranged in a 4x5 matrix.
     * @zh 设置矩阵数据
     * @param matrix 由 20 个项目（排列成 4 x 5 矩阵）组成的数组
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
     * @en Gets the type of the filter.
     * @zh 获取滤镜类型。
     */
    get type(): number {
        return Filter.COLOR;
    }

    /**
     * @internal
     * @en Gets the shader definition used for the color filter.
     * @zh 获取颜色滤镜使用的着色器定义。
     */
    get typeDefine(): ShaderDefine {
        return ShaderDefines2D.FILTERCOLOR;
    }

    /**
     * @en Adjusts color properties including brightness, contrast, saturation, and hue.
     * @param brightness Brightness value, range: -100 to 100.
     * @param contrast Contrast value, range: -100 to 100.
     * @param saturation Saturation value, range: -100 to 100.
     * @param hue Hue value, range: -180 to 180.
     * @zh 调整颜色属性，包括亮度、对比度、饱和度和色调。
     * @param brightness 亮度,范围:-100~100
     * @param contrast 对比度,范围:-100~100
     * @param saturation 饱和度,范围:-100~100
     * @param hue 色调,范围:-180~180
     */
    adjustColor(brightness: number, contrast: number, saturation: number, hue: number): ColorFilter {
        this.adjustHue(hue);
        this.adjustContrast(contrast);
        this.adjustBrightness(brightness);
        this.adjustSaturation(saturation);
        return this;
    }

    /**
     * @en Adjusts the brightness of the filter.
     * @param brightness Brightness value, range: -100 to 100.
     * @zh 调整滤镜的亮度。
     * @param brightness 亮度,范围:-100~100
     */
    adjustBrightness(brightness: number): ColorFilter {
        brightness = this._clampValue(brightness, 100);
        if (brightness == 0 || isNaN(brightness)) return this;
        return this._multiplyMatrix([1, 0, 0, 0, brightness, 0, 1, 0, 0, brightness, 0, 0, 1, 0, brightness, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
    }

    /**
     * @en Adjusts the contrast of the image. 
     * @param contrast The contrast value. The contrast value should be between -100 and 100.
     * @zh 调整图像的对比度。
     * @param contrast 对比度值。对比度值应在 -100 到 100 之间。
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
                x = DELTA_INDEX[contrast];
            } else {
                x = DELTA_INDEX[(contrast << 0)] * (1 - x) + DELTA_INDEX[(contrast << 0) + 1] * x;
            }
            x = x * 127 + 127;
        }
        var x1: number = x / 127;
        var x2: number = (127 - x) * 0.5;
        return this._multiplyMatrix([x1, 0, 0, 0, x2, 0, x1, 0, 0, x2, 0, 0, x1, 0, x2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
    }

    /**
     * @en Adjusts the saturation of the image.
     * @param saturation The saturation value. The saturation value should be between -100 and 100.
     * @zh 调整图像的饱和度。
     * @param saturation 饱和度值。饱和度值应在 -100 到 100 之间。
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
     * @en Adjusts the hue of the image.
     * @param hue The hue value.The hue value should be between -180 and 180.
     * @zh 调整图像的色调。
     * @param hue 色调值。色调值应在 -180 到 180 之间。
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
     * @en Resets the filter to the identity matrix, removing any filter effects.
     * @zh 将滤镜重置为单位矩阵，移除所有滤镜效果。
     */
    reset(): ColorFilter {
        return this.setByMatrix(this._copyMatrix(IDENTITY_MATRIX));
    }

    /**
     * @en Multiplication.
     * @param matrix The matrix to multiply with the current one.
     * @zh 矩阵乘法
     * @param matrix 要与当前矩阵相乘的矩阵。
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
     * @en Clamps the value to a specified range.
     * @param val The current value to be clamped.
     * @param limit The limit range for the value.
     * @zh 规范值的范围。
     * @param val 当前值。
     * @param limit 值的范围限制。
     */
    private _clampValue(val: number, limit: number): number {
        return Math.min(limit, Math.max(-limit, val));
    }

    /**
     * @en Adjusts the matrix to the correct size.
     * @param matrix The matrix to be adjusted.
     * @zh 规范矩阵，确保矩阵大小正确。
     * @param matrix 需要调整的矩阵。
     */
    private _fixMatrix(matrix: any[] = null): any[] {
        if (matrix == null) return IDENTITY_MATRIX;
        if (matrix.length < LENGTH) matrix = matrix.slice(0, matrix.length).concat(IDENTITY_MATRIX.slice(matrix.length, LENGTH));
        else if (matrix.length > LENGTH) matrix = matrix.slice(0, LENGTH);
        return matrix;
    }

    /**
     * @en Copies the matrix
     * @zh 复制矩阵
     */
    private _copyMatrix(matrix: any[]): any[] {
        var len: number = LENGTH;
        if (!this._matrix) this._matrix = [];
        for (var i: number = 0; i < len; i++) {
            this._matrix[i] = matrix[i];
        }
        return this._matrix;
    }

    /**
     * @en Called after deserialization.
     * @zh 反序列化后调用。
     */
    onAfterDeserialize() {
        let arr: any[] = ColorUtils.create((<any>this)._color || "#FFFFFF").arrColor;
        this.color(arr[0], arr[1], arr[2], arr[3]);
        this.adjustColor((<any>this)._brightness || 0, (<any>this)._contrast || 0, (<any>this)._saturation || 0, (<any>this)._hue || 0);
    }
}

