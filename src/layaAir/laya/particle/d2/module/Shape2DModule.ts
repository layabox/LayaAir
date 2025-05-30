import { ClassUtils } from "../../../utils/ClassUtils";
import { IClone } from "../../../utils/IClone";
import { Base2DShape } from "./shapes/Base2DShape";
import { FanShape } from "./shapes/FanShape";

export class Shape2DModule implements IClone {

    enable: boolean = true;

    shape: Base2DShape;

    constructor() {
        this.shape = new FanShape();
    }

    cloneTo(destObject: Shape2DModule): void {
        destObject.enable = this.enable;
        this.shape.cloneTo(destObject.shape);
    }

    clone() {
        let destObject = new Shape2DModule();
        this.cloneTo(destObject);
        return destObject;
    }

}
