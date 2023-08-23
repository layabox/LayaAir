import { Vector3 } from "../../../maths/Vector3";
import { ISphereColliderShape } from "../../interface/Shape/ISphereColliderShape";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxColliderShape } from "./pxColliderShape";

export class pxSphereColliderShape extends pxColliderShape implements ISphereColliderShape {
    /**@internal */
    private _radius: number = 0.5;



    constructor() {
        super();
        this._pxGeometry = new pxPhysicsCreateUtil._physX.PxSphereGeometry(this._radius);
    }

    setRadius(radius: number): void {
        this._radius = radius;
        var maxScale = Math.max(this._scale.x, Math.max(this._scale.y, this._scale.z));
        this._pxGeometry.radius = this._radius * maxScale;
        this._pxShape.setGeometry(this._pxGeometry);
    }

    setOffset(position: Vector3): void {
        super.setOffset(position);
        this.setRadius(this._radius);
    }

}