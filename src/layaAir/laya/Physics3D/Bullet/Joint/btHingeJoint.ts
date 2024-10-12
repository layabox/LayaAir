import { Vector3 } from "../../../maths/Vector3";
import { IHingeJoint } from "../../interface/Joint/IHingeJoint";
import { btRigidBodyCollider } from "../Collider/btRigidBodyCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { btJoint } from "./btJoint";
/**
 * @en The class `btHingeJoint` represents a hinge joint between two rigid bodies.
 * @zh 类 `btHingeJoint` 表示两个刚体之间的摆动关节。
 */
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
            this._initJointConstraintInfo();
            this._manager.addJoint(this);
        }
    }

    /**
     * @internal
     */
    _initJointConstraintInfo() {
        let bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btHingeJoint.ANGULAR_X, 0, 0);
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btHingeJoint.ANGULAR_Y, 0, 0);
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btHingeJoint.ANGULAR_Z, 0, 0);
    }

    /**
     * @ignore
     * @en Creates an instance of btHingeJoint.
     * @param manager The physics manager.
     * @zh 创建 `btHingeJoint` 的实例。
     * @param manager 物理管理器。
     */
    constructor(manager: btPhysicsManager) {
        super(manager);
    }

    /**
     * @en Sets the local position of the joint.
     * @param pos The new local position vector.
     * @zh 设置关节的局部位置。
     * @param pos 新的局部位置。
     */
    setLocalPos(pos: Vector3): void {
        super.setLocalPos(pos);
        let bt = btPhysicsCreateUtil._bt;
        this._btJoint && bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
    }

    /**
     * @en Sets the connected local position of the joint.
     * @param pos The new connected local position vector.
     * @zh 设置关节的连接局部位置。
     * @param pos 新的连接局部位置。
     */
    setConnectLocalPos(pos: Vector3): void {
        super.setConnectLocalPos(pos);
        let bt = btPhysicsCreateUtil._bt;
        this._btJoint && bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
    }

    /**
     * @en Sets the lower limit of the joint's rotation.
     * @param lowerLimit The new lower limit in radians.
     * @zh 设置关节旋转的下限。
     * @param lowerLimit 新的下限值，单位为弧度。
     */
    setLowerLimit(lowerLimit: number): void {
        if (!this._btJoint) return;
        if (lowerLimit == this._lowerLimit) return;
        this._lowerLimit = lowerLimit / Math.PI * 180;
        let bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, this._lowerLimit, this._uperLimit);
    }

    /**
     * @en Sets the upper limit of the joint's rotation.
     * @param value The new upper limit in radians.
     * @zh 设置关节旋转的上限。
     * @param value 新的上限值，单位为弧度。
     */
    setUpLimit(value: number): void {
        if (!this._btJoint) return;
        if (value == this._uperLimit) return;
        this._uperLimit = value / Math.PI * 180;
        let bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, this._lowerLimit, this._uperLimit);
    }
    /**
     * @en Sets the bounciness of the joint.
     * @param value The bounce factor. If less than or equal to 0, it will be set to 0.
     * @zh 设置关节的弹性。
     * @param value 弹跳因子。如果小于或等于0，将被设置为0。
     */
    setBounceness(value: number): void {
        if (!this._btJoint)
            return;
        var bt = btPhysicsCreateUtil._bt;
        value = value <= 0 ? 0 : value;
        bt.btGeneric6DofSpring2Constraint_setBounce(this._btJoint, this._angularAxis, value);

    }
    /**
     * @en Sets the minimum velocity for bounce.
     * @param value The minimum velocity value.
     * @zh 设置弹跳的最小速度。
     * @param value 最小速度值。
     */
    setBouncenMinVelocity(value: number): void {
        // TODO bullet
    }
    /**
     * @en Sets the contact distance for the joint.
     * @param value The contact distance value.
     * @zh 设置关节的接触距离。
     * @param value 接触距离值。
     */
    setContactDistance(value: number): void {
        throw new Error("Method not implemented.");
    }
    /**
     * @en Enables or disables the joint limit.
     * @param value True to enable the limit, false to disable.
     * @zh 启用或禁用关节限制。
     * @param value 为true时启用限制，为false时禁用。
     */
    enableLimit(value: boolean): void {
        this._enableLimit = value;
    }
    /**
     * @en Enables or disables the joint drive.
     * @param value True to enable the drive, false to disable.
     * @zh 启用或禁用关节驱动。
     * @param value 为true时启用驱动，为false时禁用。
     */
    enableDrive(value: boolean): void {
        this._enableDrive = value;
        var bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_enableMotor(this._btJoint, this._angularAxis, value);
    }
    /**
     * @en Enables or disables free spin for the joint.
     * @param value True to enable free spin, false to disable.
     * @zh 启用或禁用关节的自由旋转。
     * @param value 为true时启用自由旋转，为false时禁用。
     */
    enableFreeSpin(value: boolean): void {
        //TODO bullet
        // throw new Error("Method not implemented.");
    }

    /**
     * @en Sets the axis of rotation for the hinge joint.
     * @param value A vector representing the axis of rotation.
     * @zh 设置铰链关节的旋转轴。
     * @param value 表示旋转轴的向量。
     */
    setAxis(value: Vector3): void {
        if (value.x == 1) {
            this._angularAxis = btHingeJoint.ANGULAR_X;
            let bt = btPhysicsCreateUtil._bt;
            if (this._enableLimit) {
                bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, this._lowerLimit, this._uperLimit);
            } else {
                bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, 1, 0);
            }
        }
        if (value.y == 1) {
            this._angularAxis = btHingeJoint.ANGULAR_Y;
            let bt = btPhysicsCreateUtil._bt;
            if (this._enableLimit) {
                bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, this._lowerLimit, this._uperLimit);
            } else {
                bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, 1, 0);
            }
        }
        if (value.z == 1) {
            this._angularAxis = btHingeJoint.ANGULAR_Z;
            let bt = btPhysicsCreateUtil._bt;
            if (this._enableLimit) {
                bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, this._lowerLimit, this._uperLimit);
            } else {
                bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, this._angularAxis, 1, 0);
            }
        }
    }
    /**
     * @en Sets the swing offset for the joint.
     * @param value The swing offset vector.
     * @zh 设置关节的摆动偏移。
     * @param value 摆动偏移向量。
     */
    setSwingOffset(value: Vector3): void {
        throw new Error("Method not implemented.");
    }
    /**
     * @en Gets the current angle of the joint.
     * @zh 获取关节的当前角度。
     */
    getAngle(): number {
        throw new Error("Method not implemented.");
    }
    /**
     * @en Gets the current velocity of the joint.
     * @zh 获取关节的当前速度。
     */
    getVelocity(): Readonly<Vector3> {
        throw new Error("Method not implemented.");
    }
    /**
     * @en Sets the hard limit for the joint.
     * @param lowerLimit The lower limit of the joint's movement.
     * @param upperLimit The upper limit of the joint's movement.
     * @param contactDist The contact distance.
     * @zh 设置关节的硬限制。
     * @param lowerLimit 关节运动的下限。
     * @param upperLimit 关节运动的上限。
     * @param contactDist 接触距离。
     */
    setHardLimit(lowerLimit: number, upperLimit: number, contactDist: number): void {
        throw new Error("Method not implemented.");
    }
    /**
     * @en Sets the soft limit for the joint.
     * @param lowerLimit The lower limit of the joint's movement.
     * @param upperLimit The upper limit of the joint's movement.
     * @param stiffness The stiffness of the soft limit.
     * @param damping The damping of the soft limit.
     * @zh 设置关节的软限制。
     * @param lowerLimit 关节运动的下限。
     * @param upperLimit 关节运动的上限。
     * @param stiffness 软限制的刚度。
     * @param damping 软限制的阻尼。
     */
    setSoftLimit(lowerLimit: number, upperLimit: number, stiffness: number, damping: number): void {
        throw new Error("Method not implemented.");
    }
    /**
     * @en Sets the drive velocity for the joint.
     * @param velocity The target velocity for the joint's motor.
     * @zh 设置关节的驱动速度。
     * @param velocity 关节电机的目标速度。
     */
    setDriveVelocity(velocity: number): void {
        var bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, this._angularAxis, velocity);
    }
    /**
     * @en Sets the drive force limit for the joint.
     * @param limit The maximum force that can be applied by the joint's motor.
     * @zh 设置关节的驱动力限制。
     * @param limit 关节电机可以施加的最大力。
     */
    setDriveForceLimit(limit: number): void {
        throw new Error("Method not implemented.");
    }
    /**
     * @en Sets the drive gear ratio for the joint.
     * @param ratio The gear ratio for the joint's motor.
     * @zh 设置关节的驱动齿轮比。
     * @param ratio 关节电机的齿轮比。
     */
    setDriveGearRatio(ratio: number): void {
        throw new Error("Method not implemented.");
    }
    /**
     * @en Sets a specific flag for the hinge joint.
     * @param flag The flag to be set.
     * @param value The boolean value to set the flag to.
     * @zh 为铰链关节设置特定标志。
     * @param flag 要设置的标志。
     * @param value 设置标志的布尔值。
     */
    setHingeJointFlag(flag: number, value: boolean): void {
        throw new Error("Method not implemented.");
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