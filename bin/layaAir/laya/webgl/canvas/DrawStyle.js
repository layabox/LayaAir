import { ColorUtils } from "../../utils/ColorUtils";
export class DrawStyle {
    constructor(value) {
        this.setValue(value);
    }
    static create(value) {
        if (value) {
            var color = (value instanceof ColorUtils) ? value : ColorUtils.create(value);
            return color._drawStyle || (color._drawStyle = new DrawStyle(value));
        }
        return DrawStyle.DEFAULT;
    }
    setValue(value) {
        if (value) {
            this._color = (value instanceof ColorUtils) ? value : ColorUtils.create(value);
        }
        else
            this._color = ColorUtils.create("#000000");
    }
    reset() {
        this._color = ColorUtils.create("#000000");
    }
    toInt() {
        return this._color.numColor;
    }
    equal(value) {
        if (typeof (value) == 'string')
            return this._color.strColor === value;
        if (value instanceof ColorUtils)
            return this._color.numColor === value.numColor;
        return false;
    }
    toColorStr() {
        return this._color.strColor;
    }
}
DrawStyle.DEFAULT = new DrawStyle("#000000");
