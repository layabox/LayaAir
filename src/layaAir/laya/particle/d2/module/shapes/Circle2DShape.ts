import { Vector4 } from "../../../../maths/Vector4";
import { Base2DShape, Base2DShapeType } from "./Base2DShape";

export class Circle2DShape extends Base2DShape {

    radius: number = 1;

    emitFromEdge: boolean = false;

    randomDirction: boolean = false;

    constructor() {
        super(Base2DShapeType.Circle);
    }

    getPositionAndDirection(): Vector4 {

        let radians = Math.random() * Math.PI * 2;

        // direction
        let xDir = Math.sin(radians);
        let yDir = Math.cos(radians);

        // position
        let x = 0;
        let y = 0;

        if (this.emitFromEdge) {
            x = xDir * this.radius;
            y = yDir * this.radius;
        }
        else {
            let length = Math.random() * this.radius;
            x = xDir * length;
            y = yDir * length;
        }

        if (this.randomDirction) {
            let radians = Math.random() * Math.PI * 2;
            xDir = Math.sin(radians);
            yDir = Math.cos(radians);
        }

        this.posAndDir.setValue(x, y, xDir, yDir);
        return this.posAndDir;
    }

    cloneTo(destObject: Circle2DShape): void {
        destObject.radius = this.radius;
        destObject.emitFromEdge = this.emitFromEdge;
        destObject.randomDirction = this.randomDirction;
    }

    clone() {
        let destObject = new Circle2DShape();
        this.cloneTo(destObject);
        return destObject;
    }

}
