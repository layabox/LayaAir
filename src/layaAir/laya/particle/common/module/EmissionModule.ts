import { Vector3 } from "../../../maths/Vector3";
import { ClassUtils } from "../../../utils/ClassUtils";
import { IClone } from "../../../utils/IClone";
import { ParticleMinMaxCurve, ParticleMinMaxCurveMode } from "../ParticleMinMaxCurve";

export class EmissionBurst implements IClone {

    time: number = 0;

    count: number = 30;

    constructor() {

    }

    cloneTo(destObject: EmissionBurst): void {
        destObject.time = this.time;
        destObject.count = this.count;
    }

    clone() {
        var dest = new EmissionBurst();
        this.cloneTo(dest);
        return dest;
    }

}

export class EmissionModule implements IClone {

    enable: boolean = true;

    private _rateOverTime: ParticleMinMaxCurve = new ParticleMinMaxCurve();

    public get rateOverTime(): ParticleMinMaxCurve {
        return this._rateOverTime;
    }

    public set rateOverTime(value: number | ParticleMinMaxCurve) {
        if (typeof value === 'number') {
            this._rateOverTime.mode = ParticleMinMaxCurveMode.Constant;
            this._rateOverTime.constant = value;
        } else {
            this._rateOverTime = value;
        }
    }

    /** @internal */
    _lastPosition: Vector3 = new Vector3();

    rateOverDistance: number = 0;

    /** @internal */
    _emitAccumulator: number = 0;

    private _bursts: EmissionBurst[];
    public get bursts(): EmissionBurst[] {
        return this._bursts;
    }
    public set bursts(value: EmissionBurst[]) {
        this._bursts = value;

        if (value) {
            this._sortedBursts = value.slice().sort((a, b) => a.time - b.time);
        }
        else {
            this._sortedBursts = [];
        }
    }

    /** @internal */
    _sortedBursts: EmissionBurst[] = [];

    constructor() {
        this._rateOverTime.mode = ParticleMinMaxCurveMode.Constant;
        this._rateOverTime.constant = 10;
    }

    destroy() {
        this._sortedBursts = null;
        this._bursts = null;
    }

    cloneTo(destObject: EmissionModule): void {
        destObject.enable = this.enable;
        this.rateOverTime.cloneTo(destObject._rateOverTime);
        destObject.rateOverDistance = this.rateOverDistance;
        if (this.bursts) {
            let bursts: EmissionBurst[] = [];
            this.bursts.forEach(burst => {
                bursts.push(burst.clone());
            });
            destObject.bursts = bursts;
        }
    }

    clone() {
        let dest = new EmissionModule();
        this.cloneTo(dest);
        return dest;
    }

}
