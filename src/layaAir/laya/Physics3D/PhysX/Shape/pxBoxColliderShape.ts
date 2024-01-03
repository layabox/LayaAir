import { Vector3 } from "../../../maths/Vector3";
import { IBoxColliderShape } from "../../interface/Shape/IBoxColliderShape";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxColliderShape } from "./pxColliderShape";

export class pxBoxColliderShape extends pxColliderShape implements IBoxColliderShape {
    private static _tempHalfExtents = new Vector3();
    /** @interanl */
    private _size: Vector3;

    constructor() {
        super();
        this._size = new Vector3(0.5, 0.5, 0.5);
        this._pxGeometry = new pxPhysicsCreateUtil._physX.PxBoxGeometry(
            this._size.x / 2,
            this._size.y / 2,
            this._size.z / 2
        );
        this._createShape();
    }

    setSize(size: Vector3): void {
        const tempExtents = pxBoxColliderShape._tempHalfExtents;
        size.cloneTo(this._size);
        tempExtents.setValue(this._size.x * 0.5 * this._scale.x, this._size.y * 0.5 * this._scale.y, this._size.z * 0.5 * this._scale.z);
        this._pxGeometry.halfExtents = tempExtents;
        this._pxShape && this._pxShape.setGeometry(this._pxGeometry);
    }

    setOffset(position: Vector3): void {
        super.setOffset(position);
        this.setSize(this._size);
    }

    destroy(): void {
        super.destroy();
        this._size = null;
    }

}