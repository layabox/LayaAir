import { Vector3 } from "../../../maths/Vector3";
import { IHingeJoint } from "../../interface/Joint/IHingeJoint";
import { btRigidBodyCollider } from "../Collider/btRigidBodyCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { btJoint } from "./btJoint";

export class btHingeJoint extends btJoint implements IHingeJoint {

    /**@internal */
    static ANGULAR_X: number = 3;
    /**@internal */
    static ANGULAR_Y: number = 4;
    /**@internal */
    static ANGULAR_Z: number = 5;

    /**@internal */
    _uperLimit: number = 0;
    /**@internal */
    _lowerLimit: number = 1;
    /**@internal */
    _angularAxis: number = 0;
    /**@internal */
    _enableLimit: boolean = false;
    /**@internal */
    _enableDrive: boolean = false;

    protected _createJoint(): void {
        var bt = btPhysicsCreateUtil._bt;
        // last param 0 is R0.XYZ
        this._manager && this._manager.removeJoint(this);
        if (this._collider && this._connectCollider) {
            this._btJoint = bt.btGeneric6DofSpring2Constraint_create((this._collider as btRigidBodyCollider)._btCollider, this._btTempTrans0, (this._connectCollider as btRigidBodyCollider)._btCollider, this._btTempTrans1, 0);
            this._btJointFeedBackObj = bt.btJointFeedback_create(this._btJoint);
            bt.btTypedConstraint_setJointFeedback(this._btJoint, this._btJointFeedBackObj);
            bt.btTypedConstraint_setEnabled(this._btJoint, true);
            this._manager.addJoint(this);
        }
    }

    constructor(manager: btPhysicsManager) {
        super(manager);
    }

    setLowerLimit(lowerLimit: number): void {
        if (!this._btJoint) return;
        if (lowerLimit == this._lowerLimit) return;
        let bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, this._lowerLimit, this._uperLimit);
    }
    setUpLimit(value: number): void {
        if (!this._btJoint) return;
        if (value == this._uperLimit) return;
        let bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, this._lowerLimit, this._uperLimit);
    }
    setBounceness(value: number): void {
        if (!this._btJoint)
            return;
        var bt = btPhysicsCreateUtil._bt;
        value = value <= 0 ? 0 : value;
        bt.btGeneric6DofSpring2Constraint_setBounce(this._btJoint, this._angularAxis, value);

    }
    setBouncenMinVelocity(value: number): void {
        // TODO bullet
    }
    setContactDistance(value: number): void {
        throw new Error("Method not implemented.");
    }
    enableLimit(value: boolean): void {
        this._enableLimit = value;
    }
    enableDrive(value: boolean): void {
        this._enableDrive = value;
        var bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_enableMotor(this._btJoint, this._angularAxis, value);
    }
    enableFreeSpin(value: boolean): void {
        //TODO bullet
        // throw new Error("Method not implemented.");
    }

    setAxis(value: Vector3): void {
        if (value.x == 1) {
            this._angularAxis = btHingeJoint.ANGULAR_X;
        }
        if (value.y == 1) {
            this._angularAxis = btHingeJoint.ANGULAR_Y;
        }
        if (value.z == 1) {
            this._angularAxis = btHingeJoint.ANGULAR_Z;
        }
        let bt = btPhysicsCreateUtil._bt;
        if (this._enableLimit) {
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, this._lowerLimit, this._uperLimit);
        } else {
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, 1, 0);
        }
    }
    setSwingOffset(value: Vector3): void {
        throw new Error("Method not implemented.");
    }
    getAngle(): number {
        throw new Error("Method not implemented.");
    }
    getVelocity(): Readonly<Vector3> {
        throw new Error("Method not implemented.");
    }
    setHardLimit(lowerLimit: number, upperLimit: number, contactDist: number): void {
        throw new Error("Method not implemented.");
    }
    setSoftLimit(lowerLimit: number, upperLimit: number, stiffness: number, damping: number): void {
        throw new Error("Method not implemented.");
    }
    setDriveVelocity(velocity: number): void {
        var bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, this._angularAxis, velocity);
    }
    setDriveForceLimit(limit: number): void {
        throw new Error("Method not implemented.");
    }
    setDriveGearRatio(ratio: number): void {
        throw new Error("Method not implemented.");
    }
    setHingeJointFlag(flag: number, value: boolean): void {
        throw new Error("Method not implemented.");
    }

}