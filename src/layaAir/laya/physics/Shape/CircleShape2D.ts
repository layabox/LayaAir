import { LayaEnv } from "../../../LayaEnv";
import { EPhysics2DShape } from "../factory/IPhysics2DFactory";
import { Physics2D } from "../Physics2D";
import { Physics2DShapeBase } from "./Physics2DShapeBase";

/**
 * @en 2Dphysics circle shape
 * @zh 2D物理圆形碰撞体
 */
export class CircleShape2D extends Physics2DShapeBase {
    private _radius: number = 50;

    /**
     * @en Circular radius, must be a positive number
     * @zh 圆形半径，必须为正数
    */
    public get radius(): number {
        return this._radius;
    }
    public set radius(value: number) {
        this._radius = value;
        this._updateShapeData();
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
        let shape: any = this._box2DShape ? Physics2D.I._factory.getShape(this._box2DShape, this._shapeDef.shapeType) : Physics2D.I._factory.getShapeByDef(this._box2DShapeDef, this._shapeDef.shapeType);
        Physics2D.I._factory.set_CircleShape_radius(shape, radius, scale);
        Physics2D.I._factory.set_CircleShape_pos(shape, this.x, this.y, scale);
    }

    clone(): CircleShape2D {
        let dest: CircleShape2D = new CircleShape2D();
        this.cloneTo(dest);
        return dest;
    }

    cloneTo(destObject: CircleShape2D): void {
        super.cloneTo(destObject);
        destObject.radius = this.radius;
    }
}