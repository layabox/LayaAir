import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IStaticCollider } from "../../interface/IStaticCollider";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxPhysicsManager } from "../pxPhysicsManager";
import { pxCollider } from "./pxCollider";

export class pxStaticCollider extends pxCollider implements IStaticCollider {

    constructor(manager: pxPhysicsManager) {
        super(manager);
    }


    protected _initCollider() {
        this._pxActor = pxPhysicsCreateUtil._pxPhysics.createRigidStatic(this._transformTo(new Vector3(), new Quaternion()));
        this.setWorldTransform(true);
    }

    setTrigger(value: boolean): void {
        this._isTrigger = value;
        this._shape && this._shape.setIsTrigger(value);
    }

    protected _initColliderShapeByCollider() {
        super._initColliderShapeByCollider();
        this.setTrigger(this._isTrigger);
    }


}