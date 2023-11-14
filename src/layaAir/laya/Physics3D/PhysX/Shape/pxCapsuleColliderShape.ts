import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { ICapsuleColliderShape } from "../../interface/Shape/ICapsuleColliderShape";
import { pxCollider } from "../Collider/pxCollider";
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

    /**@internal in Physx capsule's height is X Axis, need to rotate*/
    _rotation: Quaternion = new Quaternion(0, 0, 0.7071068, 0.7071068);

    private _upAxis: ColliderShapeUpAxis = ColliderShapeUpAxis.Y;

    constructor() {
        super();
        this._pxGeometry = new pxPhysicsCreateUtil._physX.PxCapsuleGeometry(this._radius, this._halfHeight);
        this._createShape();
    }

    /**
     * @internal
     * rotate capusle in physx, physx capsule heigth is X axis
     */
    _setCapsuleRotation() {
        pxColliderShape.transform.rotation.setValue(this._rotation.x, this._rotation.y, this._rotation.z, this._rotation.w)
        this._pxShape.setLocalPose(pxColliderShape.transform);
    }

    addToActor(collider: pxCollider): void {
        super.addToActor(collider);
        this._setCapsuleRotation();
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

    destroy(): void {
        super.destroy();
        this._radius = null;
        this._halfHeight = null;
        this._upAxis = null;
    }
}