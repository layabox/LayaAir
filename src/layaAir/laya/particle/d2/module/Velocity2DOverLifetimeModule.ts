import { ClassUtils } from "../../../utils/ClassUtils";
import { IClone } from "../../../utils/IClone";
import { ParticleMinMaxCurve } from "../../common/ParticleMinMaxCurve";

export enum Velocity2DSimulateSpace {
    Local,
    World
}

export class Velocity2DOverLifetimeModule implements IClone {

    enable: boolean = true;

    space: Velocity2DSimulateSpace = Velocity2DSimulateSpace.Local;

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

    constructor() {

    }

    cloneTo(destObject: Velocity2DOverLifetimeModule): void {
        destObject.enable = this.enable;
        destObject.space = this.space;
        this.x.cloneTo(destObject.x);
        this.y.cloneTo(destObject.y);
    }

    clone() {
        let dest = new Velocity2DOverLifetimeModule();
        this.cloneTo(dest);
        return dest;
    }

}
