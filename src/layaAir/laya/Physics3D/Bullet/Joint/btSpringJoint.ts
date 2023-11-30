import { Vector3 } from "../../../maths/Vector3";
import { ISpringJoint } from "../../interface/Joint/ISpringJoint";
import { btRigidBodyCollider } from "../Collider/btRigidBodyCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { btJoint } from "./btJoint";

export class btSpringJoint extends btJoint implements ISpringJoint {

    /**@internal */
    static LINEARSPRING_AXIS_X: number = 0;
    /**@internal */
    static LINEARSPRING_AXIS_Y: number = 1;
    /**@internal */
    static LINEARSPRING_AXIS_Z: number = 2;
    /**@internal */
    static ANGULARSPRING_AXIS_X: number = 3;
    /**@internal */
    static ANGULARSPRING_AXIS_Y: number = 4;
    /**@internal */
    static ANGULARSPRING_AXIS_Z: number = 5;

    /**@internal */
    _minDistance: number = 0;
    /**@internal */
    _maxDistance: number = Number.MAX_VALUE;

    protected _createJoint(): void {
        var bt = btPhysicsCreateUtil._bt;
        // last param 0 is R0.XYZ
        this._manager && this._manager.removeJoint(this);
        if (this._collider && this._connectCollider) {
            this._btJoint = bt.btGeneric6DofSpring2Constraint_create((this._collider as btRigidBodyCollider)._btCollider, this._btTempTrans0, (this._connectCollider as btRigidBodyCollider)._btCollider, this._btTempTrans1, 0);
            this._btJointFeedBackObj = bt.btJointFeedback_create(this._btJoint);
            bt.btTypedConstraint_setJointFeedback(this._btJoint, this._btJointFeedBackObj);
            bt.btTypedConstraint_setEnabled(this._btJoint, true);
            this._initJointConstraintInfo();
            this._manager.addJoint(this);
        }
    }
    /**
         * @internal
         */
    _initJointConstraintInfo() {
        let bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.ANGULARSPRING_AXIS_X, 0, 0);
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.ANGULARSPRING_AXIS_Y, 0, 0);
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.ANGULARSPRING_AXIS_Z, 0, 0);

        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_X, 0, 0);
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, 0, 0);
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Z, 0, 0);
    }
    constructor(manager: btPhysicsManager) {
        super(manager);
    }

    setLocalPos(pos: Vector3): void {
        super.setLocalPos(pos);
        let bt = btPhysicsCreateUtil._bt;
        this._btJoint && bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
    }

    setConnectLocalPos(pos: Vector3): void {
        super.setConnectLocalPos(pos);
        let bt = btPhysicsCreateUtil._bt;
        this._btJoint && bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
    }

    setSwingOffset(value: Vector3): void {
        //TODO bullet
        throw new Error("Method not implemented.");
    }
    setMinDistance(distance: number): void {
        if (!this._btJoint)
            return;
        if (distance == this._minDistance) {
            return;
        }
        this._minDistance = distance;
        var bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, this._minDistance, this._maxDistance);
    }
    setMaxDistance(distance: number): void {
        if (!this._btJoint)
            return;
        if (distance == this._maxDistance) {
            return;
        }
        this._maxDistance = distance;
        var bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, this._minDistance, this._maxDistance);
    }
    setTolerance(tolerance: number): void {
        // TODO
        // is bullet has this param?
        // throw new Error("Method not implemented.");
    }
    setStiffness(stiffness: number): void {
        var bt = btPhysicsCreateUtil._bt;
        var enableSpring: Boolean = stiffness > 0;
        // in btSpringJoint only Y-Axis default
        bt.btGeneric6DofSpring2Constraint_enableSpring(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, enableSpring);
        if (enableSpring)
            bt.btGeneric6DofSpring2Constraint_setStiffness(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, stiffness, true);
    }
    setDamping(damping: number): void {
        if (!this._btJoint)
            return;
        var bt = btPhysicsCreateUtil._bt;
        damping = damping <= 0 ? 0 : damping;
        bt.btGeneric6DofSpring2Constraint_setDamping(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, damping, true);
    }

}