import { FilterSetterBase } from "./FilterSetterBase";
import { ColorFilter } from "../filters/ColorFilter";
import { ColorUtils } from "../utils/ColorUtils";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * ...
 * @author ww
 */
export class ColorFilterSetter extends FilterSetterBase {
    /**
     * brightness 亮度,范围:-100~100
     */
    private _brightness: number = 0;
    /**
     * contrast 对比度,范围:-100~100
     */
    private _contrast: number = 0;
    /**
     * saturation 饱和度,范围:-100~100
     */
    private _saturation: number = 0;
    /**
     * hue 色调,范围:-180~180
     */
    private _hue: number = 0;

    /**
     * red red增量,范围:0~255
     */
    private _red: number = 0;

    /**
     * green green增量,范围:0~255
     */
    private _green: number = 0;

    /**
     * blue blue增量,范围:0~255
     */
    private _blue: number = 0;

    /**
     * alpha alpha增量,范围:0~255
     */
    private _alpha: number = 0;


    constructor() {
        super();
        this._filter = new ColorFilter();
    }
    /**
     * @override
     */
    protected buildFilter(): void {
        this._filter.reset();
        //_filter = new ColorFilter();

        this._filter.color(this.red, this.green, this.blue, this.alpha);

        this._filter.adjustHue(this.hue);
        this._filter.adjustContrast(this.contrast);
        this._filter.adjustBrightness(this.brightness);
        this._filter.adjustSaturation(this.saturation);
        super.buildFilter();
    }




    get brightness(): number {
        return this._brightness;
    }

    set brightness(value: number) {
        this._brightness = value;
        this.paramChanged();
    }

    get contrast(): number {
        return this._contrast;
    }

    set contrast(value: number) {
        this._contrast = value;
        this.paramChanged();
    }

    get saturation(): number {
        return this._saturation;
    }

    set saturation(value: number) {
        this._saturation = value;
        this.paramChanged();
    }

    get hue(): number {
        return this._hue;
    }

    set hue(value: number) {
        this._hue = value;
        this.paramChanged();
    }

    get red(): number {
        return this._red;
    }

    set red(value: number) {
        this._red = value;
        this.paramChanged();
    }

    get green(): number {
        return this._green;
    }

    set green(value: number) {
        this._green = value;
        this.paramChanged();
    }

    get blue(): number {
        return this._blue;
    }

    set blue(value: number) {
        this._blue = value;
        this.paramChanged();
    }


    private _color: string;
    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this._color = value;
        var colorO: ColorUtils;
        colorO = ColorUtils.create(value);
        this._red = colorO.arrColor[0] * 255;
        this._green = colorO.arrColor[1] * 255;
        this._blue = colorO.arrColor[2] * 255;
        this.paramChanged();
    }

    get alpha(): number {
        return this._alpha;
    }

    set alpha(value: number) {
        this._alpha = value;
        this.paramChanged();
    }

}


ClassUtils.regClass("laya.effect.ColorFilterSetter", ColorFilterSetter);
ClassUtils.regClass("Laya.ColorFilterSetter", ColorFilterSetter);