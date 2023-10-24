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

    /**@internal 最小X角度限制*/
    _minAngularXLimit: number = 0;
    /**@internal 最大X角度限制*/
    _maxAngularXLimit: number = 0;
    /**@internal 最小Y角度限制*/
    _minAngularYLimit: number = 0;
    /**@internal 最大Y角度限制*/
    _maxAngularYLimit: number = 0;
    /**@internal 最小Z角度限制*/
    _minAngularZLimit: number = 0;
    /**@internal 最大Z角度限制*/
    _maxAngularZLimit: number = 0;
    /**@internal 最小距离限制*/
    _minLinearLimit: number = 0;
    /**@internal 最大距离限制*/
    _maxLinearLimit: number = 0;
    /**@internal */
    _linearXMotion: D6Axis = D6Axis.eFREE;
    /**@internal */
    _linearYMotion: D6Axis = D6Axis.eFREE;
    /**@internal */
    _linearZMotion: D6Axis = D6Axis.eFREE;
    /**@internal */
    _angularXMotion: D6Axis = D6Axis.eFREE;
    /**@internal */
    _angularYMotion: D6Axis = D6Axis.eFREE;
    /**@internal */
    _angularZMotion: D6Axis = D6Axis.eFREE;

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
            this._initAllConstraintInfo();
            this._manager && this._manager.addJoint(this);
        }
    }

    _initAllConstraintInfo(): void {
        //MotionMode
        this.setMotion(D6Axis.eLOCKED, D6MotionType.eX);
        this.setMotion(D6Axis.eLOCKED, D6MotionType.eY);
        this.setMotion(D6Axis.eLOCKED, D6MotionType.eZ);
        this.setMotion(D6Axis.eLOCKED, D6MotionType.eTWIST);
        this.setMotion(D6Axis.eLOCKED, D6MotionType.eSWING1);
        this.setMotion(D6Axis.eLOCKED, D6MotionType.eSWING2);
    }

    constructor(manager: btPhysicsManager) {
        super(manager);
    }

    /**
     * TODO
     * @internal
     */
    setEquilibriumPoint(axis: number, equilibriumPoint: number): void {
        var bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setEquilibriumPoint(this._btJoint, axis, equilibriumPoint);
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

    setAxis(axis: Vector3, secendary: Vector3): void {
        var bt = btPhysicsCreateUtil._bt;
        this._axis.setValue(axis.x, axis.y, axis.y);
        this._secondAxis.setValue(secendary.x, secendary.y, secendary.z);
        this._btAxis = bt.btVector3_setValue(-axis.x, axis.y, axis.z);
        this._btsceondAxis = bt.btVector3_setValue(-secendary.x, secendary.y, secendary.z);
        bt.btGeneric6DofSpring2Constraint_setAxis(this._btJoint, this._btAxis, this._btsceondAxis);
    }

    /**
     * @internal
     * 设置各个轴限制值
     * @param axis 限制类型
     * @param motionType 运动类型
     */
    _setLimit(axis: D6Axis, motionType: D6MotionType, low?: number, high?: number): void {
        let lowLimit = 0;
        let maxLimit = 0;
        if (motionType == D6MotionType.eX || motionType == D6MotionType.eY || motionType == D6MotionType.eZ) {
            // linear motion
            lowLimit = this._minLinearLimit;
            maxLimit = this._maxLinearLimit;
        } else {
            if (motionType == D6MotionType.eTWIST) {
                // angular motion
                lowLimit = this._minAngularXLimit;
                maxLimit = this._maxAngularXLimit;
            } else if (motionType == D6MotionType.eSWING1) {
                // angular motion
                lowLimit = this._minAngularYLimit;
                maxLimit = this._maxAngularYLimit;
            } else if (motionType == D6MotionType.eSWING2) {
                // angular motion
                lowLimit = this._minAngularZLimit;
                maxLimit = this._maxAngularZLimit;
            }
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

    /**
     * @internal
     * 设置各个轴的弹簧属性值
     * @param axis 
     * @param motionType 
     * @param springValue 
     * @param limitIfNeeded 
     */
    _setSpring(axis: D6Axis, motionType: D6MotionType, springValue: number, limitIfNeeded: boolean = true): void {
        let bt = btPhysicsCreateUtil._bt;
        var enableSpring: Boolean = springValue > 0 && axis == D6Axis.eLIMITED;
        bt.btGeneric6DofSpring2Constraint_enableSpring(this._btJoint, motionType, enableSpring);
        if (enableSpring)
            bt.btGeneric6DofSpring2Constraint_setStiffness(this._btJoint, motionType, springValue, limitIfNeeded);
    }

    /**
     * @internal
     * 设置各个轴的弹力值
     * @param axis 
     * @param motionType 
     * @param bounce 
     */
    _setBounce(axis: D6Axis, motionType: D6MotionType, bounce: number): void {
        if (axis == D6Axis.eLIMITED) {
            var bt = btPhysicsCreateUtil._bt
            bounce = bounce <= 0 ? 0 : bounce;
            bt.btGeneric6DofSpring2Constraint_setBounce(this._btJoint, motionType, bounce);
        }
    }

    /**
     * @internal
     * 设置各个轴的阻尼值
     * @param axis 
     * @param motionType 
     * @param damp 
     * @param limitIfNeeded 
     */
    _setDamp(axis: D6Axis, motionType: D6MotionType, damp: number, limitIfNeeded: boolean = true): void {
        if (axis == D6Axis.eLIMITED) {
            var bt = btPhysicsCreateUtil._bt;
            damp = damp <= 0 ? 0 : damp;
            bt.btGeneric6DofSpring2Constraint_setDamping(this._btJoint, motionType, damp, limitIfNeeded);
        }
    }

    setMotion(axis: D6Axis, motionType: D6MotionType): void {
        switch (motionType) {
            case D6MotionType.eX:
                this._linearXMotion = axis;
                break;
            case D6MotionType.eY:
                this._linearYMotion = axis;
                break;
            case D6MotionType.eZ:
                this._linearZMotion = axis;
                break;
            case D6MotionType.eTWIST:
                this._angularXMotion = axis;
                break;
            case D6MotionType.eSWING1:
                this._angularYMotion = axis;
                break;
            case D6MotionType.eSWING2:
                this._angularZMotion = axis;
                break;
            default:
                break;
        }
        this._setLimit(axis, motionType);
    }

    setDistanceLimit(limit: number, bounceness: number, bounceThreshold: number, spring: number, damp: number): void {
        this._minLinearLimit = -limit;
        this._maxLinearLimit = limit;
        // linear limit
        this._setLimit(this._linearXMotion, D6MotionType.eX);
        this._setLimit(this._linearYMotion, D6MotionType.eY);
        this._setLimit(this._linearZMotion, D6MotionType.eZ);
        // linear spring
        this._setSpring(this._linearXMotion, D6MotionType.eX, spring);
        this._setSpring(this._linearYMotion, D6MotionType.eX, spring);
        this._setSpring(this._linearZMotion, D6MotionType.eX, spring);
        // bounce
        this._setBounce(this._linearXMotion, D6MotionType.eX, bounceness);
        this._setBounce(this._linearYMotion, D6MotionType.eY, bounceness);
        this._setBounce(this._linearZMotion, D6MotionType.eZ, bounceness);
        // damp
        this._setDamp(this._linearXMotion, D6MotionType.eX, damp);
        this._setDamp(this._linearYMotion, D6MotionType.eY, damp);
        this._setDamp(this._linearZMotion, D6MotionType.eZ, damp);

    }

    setLinearLimit(linearAxis: D6MotionType, upper: number, lower: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        this._minLinearLimit = lower;
        this._maxLinearLimit = upper;
        // linear limit
        this._setLimit(this._linearXMotion, linearAxis);
        this._setLimit(this._linearYMotion, linearAxis);
        this._setLimit(this._linearZMotion, linearAxis);
        // linear spring
        this._setSpring(this._linearXMotion, linearAxis, spring);
        this._setSpring(this._linearYMotion, linearAxis, spring);
        this._setSpring(this._linearZMotion, linearAxis, spring);
        // bounce
        this._setBounce(this._linearXMotion, linearAxis, bounceness);
        this._setBounce(this._linearYMotion, linearAxis, bounceness);
        this._setBounce(this._linearZMotion, linearAxis, bounceness);
        // damp
        this._setDamp(this._linearXMotion, linearAxis, damping);
        this._setDamp(this._linearYMotion, linearAxis, damping);
        this._setDamp(this._linearZMotion, linearAxis, damping);
    }

    setTwistLimit(upper: number, lower: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        this._minAngularYLimit = lower / Math.PI * 180;
        this._maxAngularYLimit = upper / Math.PI * 180;
        // angular limit
        this._setLimit(this._angularXMotion, D6MotionType.eTWIST);
        this._setLimit(this._angularYMotion, D6MotionType.eSWING1);
        this._setLimit(this._angularZMotion, D6MotionType.eSWING2);
        // angular spring
        this._setSpring(this._angularXMotion, D6MotionType.eTWIST, spring);
        this._setSpring(this._angularYMotion, D6MotionType.eSWING1, spring);
        this._setSpring(this._angularZMotion, D6MotionType.eSWING2, spring);
        // bounce
        this._setBounce(this._angularXMotion, D6MotionType.eTWIST, bounceness);
        this._setBounce(this._angularYMotion, D6MotionType.eSWING1, bounceness);
        this._setBounce(this._angularZMotion, D6MotionType.eSWING2, bounceness);
        // damp
        this._setDamp(this._angularXMotion, D6MotionType.eTWIST, damping);
        this._setDamp(this._angularYMotion, D6MotionType.eSWING1, damping);
        this._setDamp(this._angularZMotion, D6MotionType.eSWING2, damping);
    }

    setSwingLimit(yAngle: number, zAngle: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        // swing angualr limit
        this._minAngularYLimit = -yAngle / Math.PI * 180;
        this._maxAngularYLimit = yAngle / Math.PI * 180;
        this._minAngularZLimit = -zAngle / Math.PI * 180;
        this._maxAngularZLimit = zAngle / Math.PI * 180;
        // linear limit
        this._setLimit(this._angularXMotion, D6MotionType.eTWIST);
        this._setLimit(this._angularYMotion, D6MotionType.eSWING1);
        this._setLimit(this._angularZMotion, D6MotionType.eSWING2);
        // linear spring
        this._setSpring(this._angularXMotion, D6MotionType.eTWIST, spring);
        this._setSpring(this._angularYMotion, D6MotionType.eSWING1, spring);
        this._setSpring(this._angularZMotion, D6MotionType.eSWING2, spring);
        // bounce
        this._setBounce(this._angularXMotion, D6MotionType.eTWIST, bounceness);
        this._setBounce(this._angularYMotion, D6MotionType.eSWING1, bounceness);
        this._setBounce(this._angularZMotion, D6MotionType.eSWING2, bounceness);
        // damp
        this._setDamp(this._angularXMotion, D6MotionType.eTWIST, damping);
        this._setDamp(this._angularYMotion, D6MotionType.eSWING1, damping);
        this._setDamp(this._angularZMotion, D6MotionType.eSWING2, damping);
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