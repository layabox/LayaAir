import { ClassUtils } from "../../../utils/ClassUtils";
import { IClone } from "../../../utils/IClone";
import { ParticleMinMaxCurve, ParticleMinMaxCurveMode } from "../../common/ParticleMinMaxCurve";

export class Size2DOverLifetimeModule implements IClone {

    enable: boolean = true;

    separateAxes: boolean = false;

    private _x: ParticleMinMaxCurve = new ParticleMinMaxCurve();
    public get x(): ParticleMinMaxCurve {
        return this._x;
    }
    public set x(value: ParticleMinMaxCurve) {
        this._x = value;
        this._y.mode = value.mode;
    }

    private _y: ParticleMinMaxCurve = new ParticleMinMaxCurve();
    public get y(): ParticleMinMaxCurve {
        return this._y;
    }
    public set y(value: ParticleMinMaxCurve) {
        this._y = value;
        this._x.mode = value.mode;
    }

    public get size(): ParticleMinMaxCurve {
        return this.x;
    }
    public set size(value: ParticleMinMaxCurve) {
        this.x = value;
    }

    constructor() {
        this.x.mode = ParticleMinMaxCurveMode.Constant;
        this.x.constantMin = 1;
        this.x.constantMax = 1;
        this.x.curveMin.add(0, 0);
        this.x.curveMin.add(1, 1);
        this.x.curveMax.add(0, 0);
        this.x.curveMax.add(1, 1,);

        this.y.mode = ParticleMinMaxCurveMode.Constant;
        this.y.constantMin = 1;
        this.y.constantMax = 1;
        this.y.curveMin.add(0, 0);
        this.y.curveMin.add(1, 1);
        this.y.curveMax.add(0, 0);
        this.y.curveMax.add(1, 1);
    }

    cloneTo(destObject: Size2DOverLifetimeModule): void {
        destObject.enable = this.enable;
        destObject.separateAxes = this.separateAxes;
        this.x.cloneTo(destObject.x);
        this.y.cloneTo(destObject.y);
    }

    clone(): Size2DOverLifetimeModule {
        let dest = new Size2DOverLifetimeModule();
        this.cloneTo(dest);
        return dest;
    }

}
