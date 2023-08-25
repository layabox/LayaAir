import { Vector3 } from "../../../maths/Vector3";
import { ICapsuleColliderShape } from "../../interface/Shape/ICapsuleColliderShape";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxColliderShape } from "./pxColliderShape";
/**
 * The up axis of the collider shape.
 */
enum ColliderShapeUpAxis {
    /** Up axis is X. */
    X,
    /** Up axis is Y. */
    Y,
    /** Up axis is Z. */
    Z
}

export class pxCapsuleColliderShape extends pxColliderShape implements ICapsuleColliderShape {
    /** @internal */
    _radius: number = 0.25;
    /** @internal */
    _halfHeight: number = 0.5;

    private _upAxis: ColliderShapeUpAxis = ColliderShapeUpAxis.Y;

    constructor() {
        super();
        this._pxGeometry = new pxPhysicsCreateUtil._physX.PxCapsuleGeometry(this._radius, this._halfHeight);
        this._createShape();
    }

    setRadius(radius: number): void {
        this._radius = radius;
        switch (this._upAxis) {
            case ColliderShapeUpAxis.X:
                this._pxGeometry.radius = this._radius * Math.max(this._scale.y, this._scale.z);
                break;
            case ColliderShapeUpAxis.Y:
                this._pxGeometry.radius = this._radius * Math.max(this._scale.x, this._scale.z);
                break;
            case ColliderShapeUpAxis.Z:
                this._pxGeometry.radius = this._radius * Math.max(this._scale.x, this._scale.y);
                break;
        }
        this._pxShape.setGeometry(this._pxGeometry);
    }

    setHeight(height: number): void {
        this._halfHeight = height * 0.5;
        switch (this._upAxis) {
            case ColliderShapeUpAxis.X:
                this._pxGeometry.halfHeight = this._halfHeight * this._scale.x;
                break;
            case ColliderShapeUpAxis.Y:
                this._pxGeometry.halfHeight = this._halfHeight * this._scale.y;
                break;
            case ColliderShapeUpAxis.Z:
                this._pxGeometry.halfHeight = this._halfHeight * this._scale.z;
                break;
        }
        this._pxShape.setGeometry(this._pxGeometry);
    }

    setUpAxis(upAxis: number): void {
        if (this._upAxis == upAxis)
            return;
        this._upAxis = upAxis;
        this.setHeight(this._halfHeight);
        this.setRadius(this._radius);
    }

    setOffset(position: Vector3): void {
        super.setOffset(position);
        this.setHeight(this._halfHeight);
        this.setRadius(this._radius);
    }
}