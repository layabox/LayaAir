import { ClassUtils } from "../../../utils/ClassUtils";
import { IClone } from "../../../utils/IClone";
import { ParticleMinMaxCurve, ParticleMinMaxCurveMode } from "../../common/ParticleMinMaxCurve";

export class Rotation2DOverLifetimeModule implements IClone {

    enable: boolean = true;

    angularVelocity: ParticleMinMaxCurve = new ParticleMinMaxCurve();

    constructor() {
        this.angularVelocity.mode = ParticleMinMaxCurveMode.Constant;
        this.angularVelocity.constantMin = 45;
        this.angularVelocity.constantMax = 45;
        this.angularVelocity.curveMin.add(0, 45);
        this.angularVelocity.curveMin.add(1, 45);
        this.angularVelocity.curveMax.add(0, 45);
        this.angularVelocity.curveMax.add(1, 45);
    }

    cloneTo(destObject: Rotation2DOverLifetimeModule): void {
        destObject.enable = this.enable;
        this.angularVelocity.cloneTo(destObject.angularVelocity);
    }

    clone() {
        let dest = new Rotation2DOverLifetimeModule();
        this.cloneTo(dest);
        return dest;
    }

}

