import { Vector3 } from "../../../maths/Vector3";
import { IConeColliderShape } from "../../interface/Shape/IConeColliderShape";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btColliderShape } from "./btColliderShape";

export class btConeColliderShape extends btColliderShape implements IConeColliderShape {
    private static _tempVector30: Vector3 = new Vector3();
    /**@internal */
    private _radius: number = 0.25;
    /**@internal */
    private _length: number = 1;
    /**@internal */
    private _orientation: number = btColliderShape.SHAPEORIENTATION_UPY;
    constructor() {
        super();
    }

    protected _createShape() {
        //TODO MIner
        let bt = btPhysicsCreateUtil._bt;
        if (this._btShape) {
            bt.btCollisionShape_destroy(this._btShape);
        }
        switch (this._orientation) {
            case btColliderShape.SHAPEORIENTATION_UPX:
                this._btShape = bt.btConeShapeX_create(this._radius, this._length);
                break;
            case btColliderShape.SHAPEORIENTATION_UPY:
                this._btShape = bt.btConeShape_create(this._radius, this._length);
                break;
            case btColliderShape.SHAPEORIENTATION_UPZ:
                this._btShape = bt.btConeShapeZ_create(this._radius, this._length);
                break;
            default:
                throw "CapsuleColliderShape:unknown orientation.";
        }
    }

    protected _getType(): number {
        return this._type = btColliderShape.SHAPETYPES_CONE;
    }

    setRadius(radius: number): void {
        if (this._radius == radius)
            return;
        this._radius = radius;
        this._createShape();
    }

    setHeight(height: number): void {
        if (this._length == height)
            return;
        this._length = height;
        this._createShape();
    }

    setUpAxis(upAxis: number): void {
        if (this._orientation == upAxis)
            return;
        this._orientation = upAxis;
        this._createShape();
    }
}