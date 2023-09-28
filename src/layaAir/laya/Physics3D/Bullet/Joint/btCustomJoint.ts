import { ConfigurableConstraint } from "../../../d3/physics/constraints/ConfigurableConstraint";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { ICustomJoint } from "../../interface/Joint/ICustomJoint";
import { D6Axis, D6Drive, D6MotionType, ID6Joint } from "../../interface/Joint/ID6Joint";
import { btRigidBodyCollider } from "../Collider/btRigidBodyCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { btJoint } from "./btJoint";

export class btCustomJoint extends btJoint implements ID6Joint {

    /**@internal 最小角度限制*/
    _minAngularLimit: number = 0;
    /**@internal 最大角度限制*/
    _maxAngularLimit: number = 0;
    /**@internal 最小距离限制*/
    _minLinearLimit: number = 0;
    /**@internal 最大距离限制*/
    _maxLinearLimit: number = 0;
    /**@internal 轴限制*/
    _axis: Vector3 = new Vector3(1, 0, 0);
    /**@internal 副轴限制*/
    _secondAxis: Vector3 = new Vector3(0, 1, 0);

    /**@internal */
    _btAxis: number = 0;
    /**@internal */
    _btsceondAxis: number = 0;


    initJoint() {
        let bt = btPhysicsCreateUtil._bt;
        super.initJoint();
        this._btAxis = bt.btVector3_create(-1.0, 0.0, 0.0);
        this._btsceondAxis = bt.btVector3_create(0.0, 1.0, 0.0);
    }

    protected _createJoint(): void {
        let bt = btPhysicsCreateUtil._bt;
        this._manager && this._manager.removeJoint(this);
        if (this._collider && this._connectCollider) {
            this._btJoint = bt.btGeneric6DofSpring2Constraint_create((this._collider as btRigidBodyCollider)._btCollider, this._btTempVector30, (this._connectCollider as btRigidBodyCollider)._btCollider, this._btTempTrans1, 0);
            this._btJointFeedBackObj = bt.btJointFeedback_create(this._btJoint);
            bt.btTypedConstraint_setJointFeedback(this._btJoint, this._btJointFeedBackObj);
            bt.btTypedConstraint_setEnabled(this._btJoint, true);
            this._manager && this._manager.addJoint(this);
        }
    }

    constructor(manager: btPhysicsManager) {
        super(manager);
    }

    setAxis(axis: Vector3, secendary: Vector3): void {
        var bt = btPhysicsCreateUtil._bt;
        this._axis.setValue(axis.x, axis.y, axis.y);
        this._secondAxis.setValue(secendary.x, secendary.y, secendary.z);
        this._btAxis = bt.btVector3_setValue(-axis.x, axis.y, axis.z);
        this._btsceondAxis = bt.btVector3_setValue(-secendary.x, secendary.y, secendary.z);
        bt.btGeneric6DofSpring2Constraint_setAxis(this._btJoint, this._btAxis, this._btsceondAxis);
    }

    setMotion(axis: D6Axis, motionType: D6MotionType): void {
        let lowLimit = 0;
        let maxLimit = 0;
        if (motionType == D6MotionType.eX || motionType == D6MotionType.eY || motionType == D6MotionType.eZ) {
            // linear motion
            lowLimit = this._minLinearLimit;
            maxLimit = this._maxLinearLimit;
        } else {
            // angular motion
            lowLimit = this._minAngularLimit;
            maxLimit = this._maxAngularLimit;
        }
        let bt = btPhysicsCreateUtil._bt;
        if (axis == D6Axis.eFREE) {
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, motionType, 1, 0);
        } else if (axis == D6Axis.eLIMITED) {
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, motionType, lowLimit, maxLimit);
        } else if (axis == D6Axis.eLOCKED) {
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, motionType, 0, 0);
        }
    }

    setDistanceLimit(limit: number, bounceness: number, bounceThreshold: number, spring: number, damp: number): void {
        let bt = btPhysicsCreateUtil._bt;
        let axis = D6MotionType.eY;
        // limit
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, axis, 0, limit);
        // bounce
        bt.btGeneric6DofSpring2Constraint_setBounce(this._btJoint, axis, bounceness);
        // spring
        bt.btGeneric6DofSpring2Constraint_enableSpring(this._btJoint, axis, true);
        bt.btGeneric6DofSpring2Constraint_setStiffness(this._btJoint, axis, spring, true);
        // damp
        bt.btGeneric6DofSpring2Constraint_setDamping(this._btJoint, axis, damp, true);
    }

    setLinearLimit(linearAxis: D6MotionType, upper: number, lower: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        let bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, linearAxis, lower, upper);
        // bounce
        bt.btGeneric6DofSpring2Constraint_setBounce(this._btJoint, linearAxis, bounceness);
        // spring
        bt.btGeneric6DofSpring2Constraint_enableSpring(this._btJoint, linearAxis, true);
        bt.btGeneric6DofSpring2Constraint_setStiffness(this._btJoint, linearAxis, spring, true);
        // damp
        bt.btGeneric6DofSpring2Constraint_setDamping(this._btJoint, linearAxis, damping, true);
    }

    setTwistLimit(upper: number, lower: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        let bt = btPhysicsCreateUtil._bt;
        let axis = D6MotionType.eTWIST;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, axis, lower, upper);
        // bounce
        bt.btGeneric6DofSpring2Constraint_setBounce(this._btJoint, axis, bounceness);
        // spring
        bt.btGeneric6DofSpring2Constraint_enableSpring(this._btJoint, axis, true);
        bt.btGeneric6DofSpring2Constraint_setStiffness(this._btJoint, axis, spring, true);
        // damp
        bt.btGeneric6DofSpring2Constraint_setDamping(this._btJoint, axis, damping, true);
    }

    setSwingLimit(yAngle: number, zAngle: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        let bt = btPhysicsCreateUtil._bt;
        let axis = D6MotionType.eSWING1;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, axis, 0, yAngle);
        // bounce
        bt.btGeneric6DofSpring2Constraint_setBounce(this._btJoint, axis, bounceness);
        // spring
        bt.btGeneric6DofSpring2Constraint_enableSpring(this._btJoint, axis, true);
        bt.btGeneric6DofSpring2Constraint_setStiffness(this._btJoint, axis, spring, true);
        // damp
        bt.btGeneric6DofSpring2Constraint_setDamping(this._btJoint, axis, damping, true);

        axis = D6MotionType.eSWING2;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, axis, 0, zAngle);
        // bounce
        bt.btGeneric6DofSpring2Constraint_setBounce(this._btJoint, axis, bounceness);
        // spring
        bt.btGeneric6DofSpring2Constraint_enableSpring(this._btJoint, axis, true);
        bt.btGeneric6DofSpring2Constraint_setStiffness(this._btJoint, axis, spring, true);
        // damp
        bt.btGeneric6DofSpring2Constraint_setDamping(this._btJoint, axis, damping, true);

    }

    setDrive(index: D6Drive, stiffness: number, damping: number, forceLimit: number): void {
        // enable motor
        let bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_enableMotor(this._btJoint, index, true);
    }

    setDriveTransform(position: Vector3, rotate: Quaternion): void {
        let bt = btPhysicsCreateUtil._bt;
        let axis = D6Drive.eY;
        // TODO
        // bt.btGeneric6DofSpring2Constraint_setServoTarget(this._btJoint, axis, target);
    }

    setDriveVelocity(position: Vector3, angular: Vector3): void {
        let bt = btPhysicsCreateUtil._bt;
        let axis = D6Drive.eX;
        // position
        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, position.x);
        axis = D6Drive.eY;
        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, position.y);
        axis = D6Drive.eZ;
        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, position.z);
        // angular
        axis = D6Drive.eX;
        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, angular.x);
        axis = D6Drive.eY;
        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, angular.y);
        axis = D6Drive.eZ;
        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, angular.z);
    }

    getTwistAngle(): number {
        throw new Error("Method not implemented.");
    }

    getSwingYAngle(): number {
        throw new Error("Method not implemented.");
    }

    getSwingZAngle(): number {
        throw new Error("Method not implemented.");
    }

}