import { Color } from "../../maths/Color";
import { Gradient } from "../../maths/Gradient";
import { MathUtil } from "../../maths/MathUtil";
import { ClassUtils } from "../../utils/ClassUtils";
import { IClone } from "../../utils/IClone";

export enum ParticleMinMaxGradientMode {
    Color = 0,
    Gradient = 1,
    TwoColors = 2,
    TwoGradients = 3,
}

const color = new Color;
const color1 = new Color;

export class ParticleMinMaxGradient implements IClone {

    mode: ParticleMinMaxGradientMode = ParticleMinMaxGradientMode.Color;

    colorMin: Color = new Color(1, 1, 1, 1);

    colorMax: Color = new Color(1, 1, 1, 1);

    get color(): Color {
        return this.colorMin;
    }

    set color(value: Color) {
        this.colorMin = value;
    }

    gradientMin: Gradient = new Gradient();

    gradientMax: Gradient = new Gradient();

    get gradient(): Gradient {
        return this.gradientMin;
    }

    set gradient(value: Gradient) {
        this.gradientMin = value;
    }

    constructor() {

    }

    evaluate(time: number, lerp: number): Color {
        switch (this.mode) {
            case ParticleMinMaxGradientMode.Color:
                return this.color;
            case ParticleMinMaxGradientMode.Gradient:
                this.gradient.evaluateColorRGB(time, color);
                return color;
            case ParticleMinMaxGradientMode.TwoColors:
                color.a = MathUtil.lerp(this.colorMin.a, this.colorMax.a, lerp);
                color.r = MathUtil.lerp(this.colorMin.r, this.colorMax.r, lerp);
                color.g = MathUtil.lerp(this.colorMin.g, this.colorMax.g, lerp);
                color.b = MathUtil.lerp(this.colorMin.b, this.colorMax.b, lerp);
                return color;
            case ParticleMinMaxGradientMode.TwoGradients:
                this.gradientMin.evaluateColorRGB(time, color);
                this.gradientMax.evaluateColorRGB(time, color1);
                color.a = MathUtil.lerp(color.a, color1.a, lerp);
                color.r = MathUtil.lerp(color.r, color1.r, lerp);
                color.g = MathUtil.lerp(color.g, color1.g, lerp);
                color.b = MathUtil.lerp(color.b, color1.b, lerp);
                return color;
            default:
                return Color.WHITE;
        }
    }

    cloneTo(destObject: ParticleMinMaxGradient): void {
        destObject.mode = this.mode;
        this.colorMin.cloneTo(destObject.colorMin);
        this.colorMax.cloneTo(destObject.colorMax);
        this.gradientMin.cloneTo(destObject.gradientMin);
        this.gradientMax.cloneTo(destObject.gradientMax);
    }

    clone(): ParticleMinMaxGradient {
        let res = new ParticleMinMaxGradient();
        this.cloneTo(res);
        return res;
    }

}


