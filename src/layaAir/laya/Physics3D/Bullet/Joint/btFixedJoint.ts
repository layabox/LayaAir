import { IFixedJoint } from "../../interface/Joint/IFixedJoint";
import { btCollider } from "../Collider/btCollider";
import { btRigidBodyCollider } from "../Collider/btRigidBodyCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { btJoint } from "./btJoint";
/**
 * @en Class `btFixedJoint` is used to create a fixed joint in the physical engine.
 * @zh 类`btFixedJoint`用于在物理引擎中创建固定关节。
 */
export class btFixedJoint extends btJoint implements IFixedJoint {

    /**
     * @en Creates an instance of `btFixedJoint`.
     * @param manager The physics manager that will handle this joint.
     * @zh 创建一个实例`btFixedJoint`。
     * @param manager 将处理这个关节的物理管理器。
     */
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

    /**
     * @en Destroy joint
     * @zh 销毁关节
     */
    destroy(): void {
        this._btJoint = null;
        this._btJointFeedBackObj = null;
        super.destroy();
    }

}