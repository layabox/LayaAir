import { IFixedJoint } from "../../interface/Joint/IFixedJoint";
import { btCollider } from "../Collider/btCollider";
import { btRigidBodyCollider } from "../Collider/btRigidBodyCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { btJoint } from "./btJoint";

export class btFixedJoint extends btJoint implements IFixedJoint {

    constructor(manager: btPhysicsManager) {
        super(manager);
    }

    protected _createJoint(): void {
        let bt = btPhysicsCreateUtil._bt;
        this._manager && this._manager.removeJoint(this);
        if (this._collider && this._connectCollider) {
            this._btJoint = bt.btFixedConstraint_create((this._collider as btRigidBodyCollider)._btCollider, this._btTempTrans0, (this._connectCollider as btRigidBodyCollider)._btCollider, this._btTempTrans1, 0);
            this._btJointFeedBackObj = bt.btJointFeedback_create(this._btJoint);
            bt.btTypedConstraint_setJointFeedback(this._btJoint, this._btJointFeedBackObj);
            bt.btTypedConstraint_setEnabled(this._btJoint, true);
            this._manager.addJoint(this);
        }
    }

}