import { Vector4 } from "../../../../maths/Vector4";
import { ClassUtils } from "../../../../utils/ClassUtils";
import { Base2DShape, Base2DShapeType } from "./Base2DShape";


const Angle2Radian = Math.PI / 180;

export enum FanShapeEmitType {
    Base = 0,
    Area
}


export class FanShape extends Base2DShape {

    angle: number = 25;

    radius: number = 1;

    emitType: FanShapeEmitType = FanShapeEmitType.Base;

    length: number = 5;

    constructor() {
        super(Base2DShapeType.Fan);
    }

    getPositionAndDirection(): Readonly<Vector4> {

        // get radius
        let radius = this.radius;
        // radius *= 1.0 - Math.random() * this.radiusThickness;
        let randomRadius = (Math.random() * 2 - 1);

        // direction
        let radians = this.angle * randomRadius * Angle2Radian;
        let xDir = Math.sin(radians);
        let yDir = Math.cos(radians);

        // get position
        let y = 0;
        let x = randomRadius * radius;
        switch (this.emitType) {
            case FanShapeEmitType.Area:
                {
                    y = this.length * Math.random();
                    x += y * Math.tan(radians);
                    break;
                }
            case FanShapeEmitType.Base:
            default:
                break;
        }


        let pAndd = this.posAndDir;
        pAndd.setValue(x, y, xDir, yDir);

        return pAndd;
    }

    cloneTo(destObject: FanShape): void {
        destObject.angle = this.angle;
        destObject.radius = this.radius;
        destObject.emitType = this.emitType;
        destObject.length = this.length;
    }

    clone(): FanShape {
        let destObject = new FanShape();
        this.cloneTo(destObject);
        return destObject;
    }

}
