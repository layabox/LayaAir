import { LayaEnv } from "../../../LayaEnv";
import { EPhysics2DShape } from "../factory/IPhysics2DFactory";
import { Physics2D } from "../Physics2D";
import { Physics2DShapeBase } from "./Physics2DShapeBase";

export class BoxShape2D extends Physics2DShapeBase {

    private _width: number = 100;

    private _height: number = 100;

    public get height(): number {
        return this._height;
    }
    public set height(value: number) {
        if (value < 0) console.warn("BoxCollider size cannot be less than 0");
        if (this._height == value) return;
        this._height = value;
        this._updateShapeData();
    }

    public get width(): number {
        return this._width;
    }
    public set width(value: number) {
        if (value < 0) console.warn("BoxCollider size cannot be less than 0");
        if (this._width == value) return;
        this._width = value;
        this._updateShapeData();
    }

    constructor() {
        super();
        this._shapeDef.shapeType = EPhysics2DShape.BoxShape;
    }

    protected _createShape(): void {
        this._box2DShape = Physics2D.I._factory.createShape(this._physics2DManager.box2DWorld, this._box2DBody, EPhysics2DShape.BoxShape, this._box2DShapeDef);
    }


    protected _updateShapeData(): void {
        if (!LayaEnv.isPlaying || !this._body) return;
        let helfW: number = this._width * 0.5;
        let helfH: number = this._height * 0.5;
        var center = {
            x: helfW + this.pivotoffx,
            y: helfH + this.pivotoffy
        }
        Physics2D.I._factory.set_collider_SetAsBox(this._box2DShapeDef._shape, helfW, helfH, center, Math.abs(this.scaleX), Math.abs(this.scaleY));

    }

    clone(): BoxShape2D {
        let dest: BoxShape2D = new BoxShape2D();
        this.cloneTo(dest);
        return dest;
    }

    cloneTo(destObject: BoxShape2D): void {
        super.cloneTo(destObject);
        destObject.width = this.width;
        destObject.height = this.height;
    }

}