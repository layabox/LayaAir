export enum PxD6JointDriveFlag {
    /**
     * @en drive spring is for the acceleration at the joint (rather than the force).
     * @zh 表示驱动弹簧用于关节的加速度，而不是力。
     */
    eACCELERATION = 1
};

import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { D6Axis, D6Drive, D6MotionType, ID6Joint } from "../../interface/Joint/ID6Joint";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxJoint } from "./pxJoint";

/**
 * @en The `pxD6Joint` class is used to create and manage D6 joints (6 degrees of freedom joints) in the PhysX physics engine.
 * @zh `pxD6Joint` 类用于创建和管理 PhysX 物理引擎中的 D6 关节（6 自由度关节）。
 */
export class pxD6Joint extends pxJoint implements ID6Joint {

    /**@internal temp V3 */
    static tempV3 = new Vector3();

    /**@internal axis */
    private _axis: Vector3 = new Vector3(1, 0, 0);

    /**@internal */
    private _SecondaryAxis: Vector3 = new Vector3(0, 1, 0);

    /**@internal */
    private _axisRotationQuaternion = new Quaternion();

    /**
     * create Joint
     */
    protected _createJoint() {
        const transform = pxJoint._tempTransform0;
        this._localPos.cloneTo(transform.translation);
        const transform1 = pxJoint._tempTransform1;
        this._connectlocalPos.cloneTo(transform1.translation);
        this._pxJoint = pxPhysicsCreateUtil._pxPhysics.createD6Joint(this._collider._pxActor, transform.translation, transform.rotation, this._connectCollider._pxActor, transform1.translation, transform1.rotation);
        this._initAllConstrainInfo();
        this._pxJoint.setUUID(this._id);
    }

    /**
     * @internal
     */
    _initAllConstrainInfo(): void {
        this.setAxis(this._axis, this._SecondaryAxis);
        this.setMotion(D6Axis.eFREE, D6MotionType.eX);
        this.setMotion(D6Axis.eFREE, D6MotionType.eY);
        this.setMotion(D6Axis.eFREE, D6MotionType.eZ);
        this.setMotion(D6Axis.eFREE, D6MotionType.eTWIST);
        this.setMotion(D6Axis.eFREE, D6MotionType.eSWING1);
        this.setMotion(D6Axis.eFREE, D6MotionType.eSWING2);
    }

    /**
     * set local Pose
     * @param actor 
     * @param position 
     */
    protected _setLocalPose(actor: number, position: Vector3): void {
        this._pxJoint && this._pxJoint.setLocalPose(actor, position, this._axisRotationQuaternion);
    }

    /**
     * @en Sets the joint's primary and secondary axes.
     * @param axis The primary axis.
     * @param secendary The secondary axis.
     * @zh 设置关节的主轴和次轴。
     * @param axis 主轴。
     * @param secendary 次轴。
     */
    setAxis(axis: Vector3, secendary: Vector3): void {
        this._axis = axis;
        this._SecondaryAxis = secendary;
        const xAxis = pxD6Joint.tempV3;
        const axisRotationQuaternion = this._axisRotationQuaternion;
        xAxis.set(1, 0, 0);
        axis = axis.normalize();
        const angle = Math.acos(Vector3.dot(xAxis, axis));
        Vector3.cross(xAxis, axis, xAxis);
        Quaternion.rotationAxisAngle(xAxis, angle, axisRotationQuaternion);
        this._setLocalPose(0, this._localPos);
    }

    /**
     * @en Sets the motion type for a specific axis.
     * @param axis The axis to set.
     * @param motionType The motion type to apply.
     * @zh 设置特定轴的运动类型。
     * @param axis 要设置的轴。
     * @param motionType 要应用的运动类型。
     */
    setMotion(axis: D6Axis, motionType: D6MotionType): void {
        this._pxJoint && this._pxJoint.setMotion(motionType, axis);
    }

    /**
     * @en Sets the distance limit for the joint.
     * @param limit The distance limit.
     * @param bounceness The bounciness of the limit.
     * @param bounceThreshold The bounce threshold.
     * @param spring The spring coefficient.
     * @param damp The damping coefficient.
     * @zh 设置关节的距离限制。
     * @param limit 距离限制。
     * @param bounceness 限制的弹性。
     * @param bounceThreshold 反弹阈值。
     * @param spring 弹簧系数。
     * @param damp 阻尼系数。
     */
    setDistanceLimit(limit: number, bounceness: number, bounceThreshold: number, spring: number, damp: number): void {
        this._pxJoint && this._pxJoint.setDistanceLimit(limit, bounceness, bounceThreshold, spring, damp);
    }

    /**
     * @en Sets the linear limit for a specific axis.
     * @param linearAxis The linear axis to set.
     * @param upper The upper limit.
     * @param lower The lower limit.
     * @param bounceness The bounciness of the limit.
     * @param bounceThreshold The bounce threshold.
     * @param spring The spring coefficient.
     * @param damping The damping coefficient.
     * @zh 设置特定轴的线性限制。
     * @param linearAxis 要设置的线性轴。
     * @param upper 上限。
     * @param lower 下限。
     * @param bounceness 限制的弹性。
     * @param bounceThreshold 反弹阈值。
     * @param spring 弹簧系数。
     * @param damping 阻尼系数。
     */
    setLinearLimit(linearAxis: D6MotionType, upper: number, lower: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        this._pxJoint && this._pxJoint.setLinearLimit(linearAxis, lower, upper, bounceness, bounceThreshold, spring, damping);
    }

    /**
     * @en Sets the twist limit for the joint.
     * @param upper The upper limit.
     * @param lower The lower limit.
     * @param bounceness The bounciness of the limit.
     * @param bounceThreshold The bounce threshold.
     * @param spring The spring coefficient.
     * @param damping The damping coefficient.
     * @zh 设置关节的扭转限制。
     * @param upper 上限。
     * @param lower 下限。
     * @param bounceness 限制的弹性。
     * @param bounceThreshold 反弹阈值。
     * @param spring 弹簧系数。
     * @param damping 阻尼系数。
     */
    setTwistLimit(upper: number, lower: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        this._pxJoint && this._pxJoint.setTwistLimit(lower, upper, bounceness, bounceThreshold, spring, damping);
    }

    /**
     * @en Sets the swing limit for the joint.
     * @param yAngle The Y angle limit.
     * @param zAngle The Z angle limit.
     * @param bounceness The bounciness of the limit.
     * @param bounceThreshold The bounce threshold.
     * @param spring The spring coefficient.
     * @param damping The damping coefficient.
     * @zh 设置关节的摆动限制。
     * @param yAngle Y 角度限制。
     * @param zAngle Z 角度限制。
     * @param bounceness 限制的弹性。
     * @param bounceThreshold 反弹阈值。
     * @param spring 弹簧系数。
     * @param damping 阻尼系数。
     */
    setSwingLimit(yAngle: number, zAngle: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        this._pxJoint && this._pxJoint.setSwingLimit(yAngle, zAngle, bounceness, bounceThreshold, spring, damping);
    }

    /**
     * @en Sets the drive parameters for a specific drive index.
     * @param index The drive index.
     * @param stiffness The stiffness of the drive.
     * @param damping The damping of the drive.
     * @param forceLimit The force limit of the drive.
     * @zh 设置特定驱动索引的驱动参数。
     * @param index 驱动索引。
     * @param stiffness 驱动的刚度。
     * @param damping 驱动的阻尼。
     * @param forceLimit 驱动的力限制。
     */
    setDrive(index: D6Drive, stiffness: number, damping: number, forceLimit: number): void {
        let acceleration: number = PxD6JointDriveFlag.eACCELERATION;//TODO 1 accleration Mode
        this._pxJoint && this._pxJoint.setDrive(index, stiffness, damping, forceLimit, acceleration);
    }

    /**
     * @en Sets the drive transform for the joint.
     * @param position The target position.
     * @param rotate The target rotation.
     * @zh 设置关节的驱动变换。
     * @param position 目标位置。
     * @param rotate 目标旋转。
     */
    setDriveTransform(position: Vector3, rotate: Quaternion): void {
        this._pxJoint && this._pxJoint.setDrivePosition(position, rotate);
    }

    /**
     * @en Sets the drive velocity for the joint.
     * @param position The linear velocity.
     * @param angular The angular velocity.
     * @zh 设置关节的驱动速度。
     * @param position 线性速度。
     * @param angular 角速度。
     */
    setDriveVelocity(position: Vector3, angular: Vector3): void {
        this._pxJoint && this._pxJoint.setDriveVelocity(position, angular);
    }

    /**
     * @en Gets the current twist angle of the joint.
     * @returns The twist angle in radians.
     * @zh 获取关节当前的扭转角度。
     * @returns 扭转角度（弧度）。
     */
    getTwistAngle(): number {
        return this._pxJoint.getTwistAngle();
    }

    /**
     * @en Gets the current swing Y angle of the joint.
     * @returns The swing Y angle in radians.
     * @zh 获取关节当前的 Y 轴摆动角度。
     * @returns Y 轴摆动角度（弧度）。
     */
    getSwingYAngle(): number {
        return this._pxJoint.getSwingYAngle();
    }

    /**
     * @en Gets the current swing Z angle of the joint.
     * @returns The swing Z angle in radians.
     * @zh 获取关节当前的 Z 轴摆动角度。
     * @returns Z 轴摆动角度（弧度）。
     */
    getSwingZAngle(): number {
        return this._pxJoint.getSwingZAngle();
    }

    /**
     * @en Destroy joint
     * @zh 销毁关节
     */
    destroy(): void {
        this._pxJoint && this._pxJoint.release();
        super.destroy();
    }
}