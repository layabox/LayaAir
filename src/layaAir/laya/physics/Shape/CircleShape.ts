import { LayaEnv } from "../../../LayaEnv";
import { EPhysics2DShape } from "../factory/IPhysics2DFactory";
import { Physics2D } from "../Physics2D";
import { Physics2DShapeBase } from "./Physics2DShapeBase";

export class CircleShape extends Physics2DShapeBase {
    private _radius: number = 50;


    public get radius(): number {
        return this._radius;
    }
    public set radius(value: number) {
        this._radius = value;
    }

    constructor() {
        super();
        this._shapeDef.shapeType = EPhysics2DShape.CircleShape;
    }

    protected _createShape(): void {
        this._box2DShape = Physics2D.I._factory.createShape(this._physics2DManager.box2DWorld, this._box2DBody, EPhysics2DShape.CircleShape, this._box2DShapeDef);
        this._updateShapeData();
    }

    protected _updateShapeData(): void {
        if (!LayaEnv.isPlaying || !this._body) return;

        var scale: number = Math.max(Math.abs(this.scaleX), Math.abs(this.scaleY));
        let radius = this.radius;
        Physics2D.I._factory.set_CircleShape_radius(this._box2DShapeDef._shape, radius, scale);
        Physics2D.I._factory.set_CircleShape_pos(this._box2DShapeDef._shape, this.x, this.y, scale);
    }

    clone(): CircleShape {
        let dest: CircleShape = new CircleShape();
        this.cloneTo(dest);
        return dest;
    }

    cloneTo(destObject: CircleShape): void {
        super.cloneTo(destObject);
        destObject.radius = this.radius;
    }
}