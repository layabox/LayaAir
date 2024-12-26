import { ClassUtils } from "../../../utils/ClassUtils";
import { IClone } from "../../../utils/IClone";
import { ParticleMinMaxGradient } from "../ParticleMinMaxGradient";

export class ColorOverLifetimeModule implements IClone {

    enable: boolean = true;

    color: ParticleMinMaxGradient = new ParticleMinMaxGradient();

    constructor() {

    }

    cloneTo(destObject: ColorOverLifetimeModule): void {
        destObject.enable = this.enable;
        this.color.cloneTo(destObject.color);
    }

    clone(): ColorOverLifetimeModule {
        var dest = new ColorOverLifetimeModule();
        this.cloneTo(dest);
        return dest;
    }

}
