import { ColorUtils } from "../../utils/ColorUtils"

export class DrawStyle {
    static DEFAULT: DrawStyle = new DrawStyle("#000000")

    _color: ColorUtils;

    static create(value: any): DrawStyle {
        if (value) {
            var color: ColorUtils = (value instanceof ColorUtils) ? ((<ColorUtils>value)) : ColorUtils.create(value);
            return color._drawStyle || (color._drawStyle = new DrawStyle(value));
        }
        return DrawStyle.DEFAULT;
    }

    constructor(value: any) {
        this.setValue(value);
    }

    setValue(value: any): void {
        if (value) {
            this._color = (value instanceof ColorUtils) ? ((<ColorUtils>value)) : ColorUtils.create(value);
        }
        else this._color = ColorUtils.create("#000000");
    }

    reset(): void {
        this._color = ColorUtils.create("#000000");
    }

    toInt(): number {
        return this._color.numColor;
    }

    equal(value: any): boolean {
        if (typeof (value) == 'string') return this._color.strColor === (<string>value);
        if (value instanceof ColorUtils) return this._color.numColor === ((<ColorUtils>value)).numColor;
        return false;
    }

    toColorStr(): string {
        return this._color.strColor;
    }
}


