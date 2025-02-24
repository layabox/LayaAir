import { ColorUtils } from "../../utils/ColorUtils"

export class DrawStyle {
    static readonly DEFAULT: Readonly<DrawStyle> = DrawStyle.create(0);

    _color: ColorUtils;

    static create(value: ColorUtils | string | number): DrawStyle {
        if (value != null) {
            let color = (value instanceof ColorUtils) ? value : ColorUtils.create(value);
            return color._drawStyle || (color._drawStyle = new DrawStyle(value));
        }
        else
            return DrawStyle.DEFAULT;
    }

    constructor(value: string | number | ColorUtils) {
        if (value != null)
            this._color = (value instanceof ColorUtils) ? value : ColorUtils.create(value);
        else
            this._color = ColorUtils.create(0);
    }

    equal(value: string | ColorUtils): boolean {
        if (typeof (value) == 'string') return this._color.strColor === value;
        if (value instanceof ColorUtils) return this._color.numColor === value.numColor;
        return false;
    }
}


