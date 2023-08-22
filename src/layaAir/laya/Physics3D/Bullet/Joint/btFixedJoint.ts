import { IFixedJoint } from "../../interface/Joint/IFixedJoint";
import { btCollider } from "../Collider/btCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { btJoint } from "./btJoint";

export class btFixedJoint extends btJoint implements IFixedJoint {

    constructor(manager: btPhysicsManager) {
        super(manager);
    }

    setConnectedCollider(owner: btCollider, other: btCollider): void {
        let bt = btPhysicsCreateUtil._bt;
        this._manager && this._manager.removeJoint(this);
        this._btJoint = bt.btFixedConstraint_create(owner._btCollider, this._btTempTrans0, other._btCollider, this._btTempTrans1);
        this._btJointFeedBackObj = bt.btJointFeedback_create(this._btJoint);
        bt.btTypedConstraint_setJointFeedback(this._btJoint, this._btJointFeedBackObj);
        bt.btTypedConstraint_setEnabled(this._btJoint, true);
        this._manager.addJoint(this);
    }


}