
import { LayaGL } from "../../layagl/LayaGL";
import { Matrix } from "../../maths/Matrix";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector2 } from "../../maths/Vector2";
import { Vector4 } from "../../maths/Vector4";
import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { RenderTargetFormat } from "../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Material } from "../../resource/Material";
import { RenderTexture2D } from "../../resource/RenderTexture2D";
import { ColorUtils } from "../../utils/ColorUtils";
import { PostProcess2D, PostProcessRenderContext2D } from "../PostProcess2D";
import { PostProcess2DEffect } from "../PostProcess2DEffect";
import { Blit2DCMD } from "../Scene2DSpecial/RenderCMD2D/Blit2DCMD";

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


export class ColorEffect2D extends PostProcess2DEffect {
    private _colorMat: Matrix4x4 = new Matrix4x4();
    private mat: Material;
    private _renderElement: IRenderElement2D;
    private _destRT: RenderTexture2D;
    private _centerScale: Vector2 = new Vector2();
    private _alpha: Vector4 = new Vector4();
    private _colorArray: Float32Array = new Float32Array(16);
    private _alphaArray: Float32Array = new Float32Array(4);

    /**
     * @internal 
     * @en Represents the current matrix being applied by the filter.
     * @zh 当前使用的矩阵
     */
    _matrix: any[];

    constructor(matrix: any[] = null) {
        super();
        if (!matrix) this._matrix = this._copyMatrix(matrix);
        this.setByMatrix(matrix);
    }

    public get colorMat(): Matrix4x4 {
        return this._colorMat;
    }

    public set colorMat(value: Matrix4x4) {
        if (value != this._colorMat) {
            value.cloneTo(this._colorMat);
        }
        this.mat && this.mat.setMatrix4x4("u_colorMat", this.colorMat);
        this._owner && this._owner._onChangeRender();
    }

    gray(): ColorEffect2D {
        return this.setByMatrix(GRAY_MATRIX);
    }

    public get alpha(): Vector4 {
        return this._alpha;
    }

    public set alpha(value: Vector4) {
        if (value != this._alpha) {
            value.cloneTo(this._alpha);
        }
        this.mat && this.mat.setVector4("u_colorAlpha", this.alpha);
        this._owner && this._owner._onChangeRender();

    }

    effectInit(postprocess: PostProcess2D): void {
        this._owner = postprocess;
        (!this.mat) && (this.mat = new Material());
        this.mat.setShaderName("ColorEffect2D");
        this.mat.setMatrix4x4("u_colorMat", this._colorMat);
        this.mat.setVector4("u_colorAlpha", this._alpha);
        this.mat.addDefine(Shader3D.getDefineByName("COLORFILTER"));
        this._centerScale.setValue(1, 1);
        this.mat.setVector2("u_centerScale", this._centerScale);
        if (!this._renderElement) {
            this._renderElement = LayaGL.render2DRenderPassFactory.createRenderElement2D();
            this._renderElement.geometry = Blit2DCMD.InvertQuadGeometry;
            this._renderElement.nodeCommonMap = null;
            this._renderElement.renderStateIsBySprite = false;
            this._renderElement.materialShaderData = this.mat.shaderData;
            this._renderElement.subShader = this.mat.shader.getSubShaderAt(0);
        }
    }

    /**
     * @en Sets the matrix data.
     * @param matrix An array with 20 elements arranged in a 4x5 matrix.
     * @zh 设置矩阵数据
     * @param matrix 由 20 个项目（排列成 4 x 5 矩阵）组成的数组
     */
    setByMatrix(matrix: any[]): ColorEffect2D {
        if (this._matrix != matrix) this._copyMatrix(matrix);
        var j: number = 0;
        var z: number = 0;
        for (var i: number = 0; i < 20; i++) {
            if (i % 5 != 4) {
                this._colorArray[j++] = matrix[i];
            } else {
                this._alphaArray[z++] = matrix[i];

            }
        }
        
        this.alpha.setValue(this._alphaArray[0], this._alphaArray[1], this._alphaArray[2], this._alphaArray[3]);
        this.alpha = this.alpha;
        Matrix4x4.TEMP.cloneByArray(this._colorArray);
        this.colorMat = Matrix4x4.TEMP;
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
    color(red: number = 0, green: number = 0, blue: number = 0, alpha: number = 1): ColorEffect2D {
        return this.setByMatrix([red, 0, 0, 0, 1, 0, green, 0, 0, 1, 0, 0, blue, 0, 1, 0, 0, 0, alpha, 0]);
    }

    /**
     * @en Sets the filter color using a color value.
     * @param color The color value in string format.
     * @zh 使用颜色值设置滤镜颜色。
     * @param  color 颜色值
     */
    setColor(color: string): ColorEffect2D {
        var arr: any[] = ColorUtils.create(color).arrColor;
        var mt: any[] = [0, 0, 0, 0, 256 * arr[0], 0, 0, 0, 0, 256 * arr[1], 0, 0, 0, 0, 256 * arr[2], 0, 0, 0, 1, 0];
        return this.setByMatrix(mt);
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
    adjustColor(brightness: number, contrast: number, saturation: number, hue: number): ColorEffect2D {
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
    adjustBrightness(brightness: number): ColorEffect2D {
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
    adjustContrast(contrast: number): ColorEffect2D {
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
    adjustSaturation(saturation: number): ColorEffect2D {
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
    adjustHue(hue: number): ColorEffect2D {
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
    reset(): ColorEffect2D {
        return this.setByMatrix(this._copyMatrix(IDENTITY_MATRIX));
    }

    /**
     * @en Multiplication.
     * @param matrix The matrix to multiply with the current one.
     * @zh 矩阵乘法
     * @param matrix 要与当前矩阵相乘的矩阵。
     */
    private _multiplyMatrix(matrix: any[]): ColorEffect2D {
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

    render(context: PostProcessRenderContext2D): void {
        if (!this._destRT || this._destRT.width != context.indirectTarget.width || context.indirectTarget.height != this._destRT.height) {
            if (this._destRT)
                this._destRT.destroy();
            this._destRT = new RenderTexture2D(context.indirectTarget.width, context.indirectTarget.height, RenderTargetFormat.R8G8B8A8);
        }
        this.mat.setTexture("u_MainTex", context.indirectTarget);
        context.command.setRenderTarget(this._destRT, true, PostProcess2DEffect.nullColor);
        context.command.drawRenderElement(this._renderElement, Matrix.EMPTY);
        context.destination = this._destRT;
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

    destroy() {
        this._destRT && (this._destRT.destroy());
        this.mat && (this.mat.destroy());
        this._renderElement && (this._renderElement.destroy());
    }
}