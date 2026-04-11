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

    positionX: number = 0;
    positionY: number = 0;
    scaleX: number = 1;
    scaleY: number = 1;
    rotation: number = 0;

    constructor(type: Base2DShapeType) {
        this.type = type;
    }

    protected applyTransform(): void {
        if (this.scaleX === 1 && this.scaleY === 1 && this.rotation === 0 && this.positionX === 0 && this.positionY === 0) {
            return;
        }

        let x = this.posAndDir.x;
        let y = this.posAndDir.y;
        let dirX = this.posAndDir.z;
        let dirY = this.posAndDir.w;

        // scale
        x *= this.scaleX;
        y *= this.scaleY;
        dirX *= this.scaleX;
        dirY *= this.scaleY;

        // rotate
        if (this.rotation !== 0) {
            let rad = this.rotation * Math.PI / 180;
            let cos = Math.cos(rad);
            let sin = Math.sin(rad);

            let rx = x * cos - y * sin;
            let ry = x * sin + y * cos;
            x = rx;
            y = ry;

            let rdx = dirX * cos - dirY * sin;
            let rdy = dirX * sin + dirY * cos;
            dirX = rdx;
            dirY = rdy;
        }

        // translate
        x += this.positionX;
        y += this.positionY;

        // normalize direction
        let len = Math.sqrt(dirX * dirX + dirY * dirY);
        if (len > 0) {
            dirX /= len;
            dirY /= len;
        }

        this.posAndDir.setValue(x, y, dirX, dirY);
    }

    protected cloneTransformTo(destObject: Base2DShape): void {
        destObject.positionX = this.positionX;
        destObject.positionY = this.positionY;
        destObject.scaleX = this.scaleX;
        destObject.scaleY = this.scaleY;
        destObject.rotation = this.rotation;
    }

    abstract getPositionAndDirection(randomFn?: () => number): Vector4;

    abstract clone(): Base2DShape;

    abstract cloneTo(destObject: Base2DShape): void;
}

