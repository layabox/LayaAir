import { Vector3 } from "../../../maths/Vector3";
import { ICapsuleColliderShape } from "../../interface/Shape/ICapsuleColliderShape";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btColliderShape } from "./btColliderShape";

export class btCapsuleColliderShape extends btColliderShape implements ICapsuleColliderShape {
    private static _tempVector30: Vector3 = new Vector3();
    /**@internal */
    private _radius: number = 0.5;
    /**@internal */
    private _length: number = 2;
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
                this._btShape = bt.btCapsuleShapeX_create(this._radius, this._length - this._radius * 2);
                break;
            case btColliderShape.SHAPEORIENTATION_UPY:
                this._btShape = bt.btCapsuleShape_create(this._radius, this._length - this._radius * 2);
                break;
            case btColliderShape.SHAPEORIENTATION_UPZ:
                this._btShape = bt.btCapsuleShapeZ_create(this._radius, this._length - this._radius * 2);
                break;
            default:
                throw "CapsuleColliderShape:unknown orientation.";
        }
    }

    protected _getType(): number {
        return this._type = btColliderShape.SHAPETYPES_CAPSULE;
    }

    setRadius(radius: number): void {
        if (this._radius == radius)
            return;
        this._createShape();
    }

    setHeight(height: number): void {
        if (this._length == height)
            return;
        this._createShape();
    }
    setUpAxis(upAxis: number): void {
        if (this._orientation == upAxis)
            return;
        this._createShape();
    }

    setWorldScale(scale: Vector3): void {
        var fixScale: Vector3 = btCapsuleColliderShape._tempVector30;
        switch (this._orientation) {
            case btColliderShape.SHAPEORIENTATION_UPX:
                fixScale.x = scale.x;
                fixScale.y = fixScale.z = Math.max(scale.y, scale.z);
                break;
            case btColliderShape.SHAPEORIENTATION_UPY:
                fixScale.y = scale.y;
                fixScale.x = fixScale.z = Math.max(scale.x, scale.z);
                break;
            case btColliderShape.SHAPEORIENTATION_UPZ:
                fixScale.z = scale.z;
                fixScale.x = fixScale.y = Math.max(scale.x, scale.y);
                break;
            default:
                throw "CapsuleColliderShape:unknown orientation.";
        }
        super.setWorldScale(fixScale);
    }

}