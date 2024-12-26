import { Vector2 } from "../../../../maths/Vector2";
import { Vector4 } from "../../../../maths/Vector4";
import { ClassUtils } from "../../../../utils/ClassUtils";
import { Base2DShape, Base2DShapeType } from "./Base2DShape";

export class Box2DShap extends Base2DShape {

    size: Vector2 = new Vector2(1, 1);

    randomDirection: boolean = false;

    constructor() {
        super(Base2DShapeType.Box);
    }

    getPositionAndDirection(): Vector4 {

        let x = Math.random() * this.size.x + this.size.x * -0.5;
        let y = Math.random() * this.size.y + this.size.y * -0.5;
        let xDir = 0;
        let yDir = 1;

        if (this.randomDirection) {
            let radians = Math.random() * Math.PI * 2;
            xDir = Math.sin(radians);
            yDir = Math.cos(radians);
        }

        this.posAndDir.setValue(x, y, xDir, yDir);
        return this.posAndDir;
    }

    cloneTo(destObject: Box2DShap): void {
        this.size.cloneTo(destObject.size);
        destObject.randomDirection = this.randomDirection;
    }

    clone(): Box2DShap {
        let destObject = new Box2DShap();
        this.cloneTo(destObject);
        return destObject;
    }

}
