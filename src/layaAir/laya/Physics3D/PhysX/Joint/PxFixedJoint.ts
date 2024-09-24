import { IFixedJoint } from "../../interface/Joint/IFixedJoint";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxJoint } from "./pxJoint";

/**
 * @en The pxFixedJoint class represents a fixed joint in the PhysX physics engine.
 * @zh pxFixedJoint 类表示 PhysX 物理引擎中的固定关节。
 */
export class pxFixedJoint extends pxJoint implements IFixedJoint {
    /**
     * create Joint
     */
    protected _createJoint() {
        const transform = pxJoint._tempTransform0;
        this._localPos.cloneTo(transform.translation);
        const transform1 = pxJoint._tempTransform1;
        this._connectlocalPos.cloneTo(transform1.translation);
        this._pxJoint = pxPhysicsCreateUtil._pxPhysics.createFixedJoint(this._collider._pxActor, transform.translation, transform.rotation, this._connectCollider._pxActor, transform1.translation, transform1.rotation);
        this._pxJoint.setUUID(this._id);
    }
}