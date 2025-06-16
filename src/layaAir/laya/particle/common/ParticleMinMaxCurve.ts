import { MathUtil } from "../../maths/MathUtil";
import { IClone } from "../../utils/IClone";
import { GradientDataNumber } from "./GradientDataNumber";

export enum ParticleMinMaxCurveMode {
    Constant = 0,
    Curve = 1,
    TwoConstants = 2,
    TwoCurves = 3,
}

export class ParticleMinMaxCurve implements IClone {

    mode: ParticleMinMaxCurveMode = ParticleMinMaxCurveMode.Constant;

    private _constantMin: number = 0;
    private _constantMax: number = 0;

    public get constant(): number {
        return this._constantMax;
    }
    public set constant(value: number) {
        this._constantMax = value;
    }

    public get constantMin(): number {
        return this._constantMin;
    }

    public set constantMin(value: number) {
        this._constantMin = value;
    }

    public get constantMax(): number {
        return this._constantMax;
    }

    public set constantMax(value: number) {
        this._constantMax = value;
    }

    private _curveMin: GradientDataNumber = new GradientDataNumber();
    private _curveMax: GradientDataNumber = new GradientDataNumber();

    public get curve(): GradientDataNumber {
        return this._curveMax;
    }

    public set curve(value: GradientDataNumber) {
        this._curveMax = value;
    }

    public get curveMin(): GradientDataNumber {
        return this._curveMin;
    }

    public set curveMin(value: GradientDataNumber) {
        this._curveMin = value;
    }

    public get curveMax(): GradientDataNumber {
        return this._curveMax;
    }

    public set curveMax(value: GradientDataNumber) {
        this._curveMax = value;
    }

    constructor() {

    }

    evaluate(time: number, lerp: number): number {
        switch (this.mode) {
            case ParticleMinMaxCurveMode.Constant:
                return this.constant;
            case ParticleMinMaxCurveMode.TwoConstants:
                return MathUtil.lerp(this.constantMin, this.constantMax, lerp);
            case ParticleMinMaxCurveMode.Curve:
            // todo
            // return this.curve.
            case ParticleMinMaxCurveMode.TwoCurves:
            // return MathUtil.lerp(this.curveMin.evaluate(time), this.curveMax.evaluate(time), lerp);
            default:
                return 0;
        }

    }

    destroy() {

    }

    cloneTo(dest: ParticleMinMaxCurve): void {
        dest.mode = this.mode;
        dest.constantMin = this.constantMin;
        dest.constantMax = this.constantMax;
        dest.curveMin = this.curveMin.clone();
        dest.curveMax = this.curveMax.clone();
    }

    clone() {
        let dest = new ParticleMinMaxCurve();
        this.cloneTo(dest);
        return dest;
    }

}
