import { Vector4 } from "../../../../maths/Vector4";
import { ClassUtils } from "../../../../utils/ClassUtils";
import { IClone } from "../../../../utils/IClone";

export enum Base2DShapeType {
    Fan,
    Circle,
    Box,
    Semicircle,
    None
}

export abstract class Base2DShape implements IClone {

    type: Base2DShapeType = Base2DShapeType.None;

    protected posAndDir: Vector4 = new Vector4();

    constructor(type: Base2DShapeType) {
        this.type = type;
    }

    abstract getPositionAndDirection(): Vector4;

    abstract clone(): Base2DShape;

    abstract cloneTo(destObject: Base2DShape): void;
}

