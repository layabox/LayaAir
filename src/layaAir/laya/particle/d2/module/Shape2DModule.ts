import { ClassUtils } from "../../../utils/ClassUtils";
import { IClone } from "../../../utils/IClone";
import { Base2DShape } from "./shapes/Base2DShape";
import { FanShape } from "./shapes/FanShape";

export class Shape2DModule implements IClone {

    enable: boolean = true;

    shape: Base2DShape;

    /**
     * @en Align the particle's initial rotation to its initial direction of travel (evaluated once at spawn, added on top of startRotation).
     * @zh 出生时将粒子的初始旋转对齐到其初始运动方向（仅在发射时计算一次，叠加在 startRotation 之上）。
     */
    alignToDirection: boolean = false;

    constructor() {
        this.shape = new FanShape();
    }

    cloneTo(destObject: Shape2DModule): void {
        destObject.enable = this.enable;
        destObject.alignToDirection = this.alignToDirection;
        this.shape.cloneTo(destObject.shape);
    }

    clone() {
        let destObject = new Shape2DModule();
        this.cloneTo(destObject);
        return destObject;
    }

}
