import { Filter } from "./Filter";
import { ColorUtils } from "../../utils/ColorUtils"
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { ColorEffect2D } from "../../display/effect2d/ColorEffect2D";

/**
 * @deprecated use post2DProcess
 * @en The `ColorFilter` class represents a color filter that applies a 4x5 matrix transformation to the RGBA color and Alpha values of each pixel of the input image to produce a result with a new set of RGBA colors and Alpha values. This class allows for saturation adjustments, hue rotation, brightness to Alpha, and various other effects. You can apply the filter to any display object (i.e., an object that inherits from the `Sprite` class).
 * For RGBA values, the most significant byte represents the red channel value, followed by the green, blue, and Alpha channel values respectively.
 * @zh `ColorFilter` 类是一个颜色滤镜，它将 4x5 矩阵转换应用于输入图像上的每个像素的 RGBA 颜色和 Alpha 值，以生成具有一组新的 RGBA 颜色和 Alpha 值的结果。此类允许饱和度更改、色相旋转、亮度转 Alpha 以及各种其他效果。您可以将滤镜应用于任何显示对象（即从 `Sprite` 类继承的对象）。
 * 注意：对于 RGBA 值，最高有效字节代表红色通道值，其后的有效字节分别代表绿色、蓝色和 Alpha 通道值。
 */
export class ColorFilter extends Filter {

    /**
     * @internal 
     */
    _effect2D: ColorEffect2D;
    
    /**
     * @en Gets the effect2d instance.
     * @zh 获取 effect2d 实例。
     */
    getEffect() {
        return this._effect2D;
    }

    /**
     * @en Creates an instance of the ColorFilter class with an optional 4x5 matrix for color transformation.
     * @param mat An array with 20 elements arranged in a 4x5 matrix for color transformation.
     * @zh 创建 `ColorFilter` 类的实例，可选择传入用于颜色转换的 4x5 矩阵。
     * @param mat 用于颜色转换的由 20 个元素组成的数组（排列成 4x5 矩阵）。
     */
    constructor(mat: any[] = null) {
        super();
        this._effect2D = new ColorEffect2D(mat);
    }

    /**
     * @en Sets the filter to a grayscale filter.
     * @zh 将滤镜设置为灰度滤镜。
     */
    gray(): ColorFilter {
        this._effect2D.gray();
        return this;
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
        this._effect2D.color(red, green, blue, alpha);
        return this;
    }

    /**
     * @en Sets the filter color using a color value.
     * @param color The color value in string format.
     * @zh 使用颜色值设置滤镜颜色。
     * @param  color 颜色值
     */
    setColor(color: string): ColorFilter {
        this._effect2D.setColor(color);
        return this;
    }

    /**
     * @en Sets the matrix data.
     * @param matrix An array with 20 elements arranged in a 4x5 matrix.
     * @zh 设置矩阵数据
     * @param matrix 由 20 个项目（排列成 4 x 5 矩阵）组成的数组
     */
    setByMatrix(matrix: any[]): ColorFilter {
        this._effect2D.setByMatrix(matrix);
        this.onChange();
        return this;
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
        this._effect2D.adjustColor(brightness, contrast, saturation, hue);
        return this;
    }

    /**
     * @en Adjusts the brightness of the filter.
     * @param brightness Brightness value, range: -100 to 100.
     * @zh 调整滤镜的亮度。
     * @param brightness 亮度,范围:-100~100
     */
    adjustBrightness(brightness: number): ColorFilter {
        this._effect2D.adjustBrightness(brightness);
        return this;
    }

    /**
     * @en Adjusts the contrast of the image. 
     * @param contrast The contrast value. The contrast value should be between -100 and 100.
     * @zh 调整图像的对比度。
     * @param contrast 对比度值。对比度值应在 -100 到 100 之间。
     */
    adjustContrast(contrast: number): ColorFilter {
        this._effect2D.adjustContrast(contrast);
        return this;
    }

    /**
     * @en Adjusts the saturation of the image.
     * @param saturation The saturation value. The saturation value should be between -100 and 100.
     * @zh 调整图像的饱和度。
     * @param saturation 饱和度值。饱和度值应在 -100 到 100 之间。
     */
    adjustSaturation(saturation: number): ColorFilter {
        this._effect2D.adjustSaturation(saturation);
        return this;
    }

    /**
     * @en Adjusts the hue of the image.
     * @param hue The hue value.The hue value should be between -180 and 180.
     * @zh 调整图像的色调。
     * @param hue 色调值。色调值应在 -180 到 180 之间。
     */
    adjustHue(hue: number): ColorFilter {
        this._effect2D.adjustHue(hue);
        return this;
    }

    /**
     * @en Resets the filter to the identity matrix, removing any filter effects.
     * @zh 将滤镜重置为单位矩阵，移除所有滤镜效果。
     */
    reset(): ColorFilter {
        this._effect2D.reset();
        return this;
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

