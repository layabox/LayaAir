export enum PxD6JointDriveFlag {
    eACCELERATION = 1	//!< drive spring is for the acceleration at the joint (rather than the force) 
};

import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { D6Axis, D6Drive, D6MotionType, ID6Joint } from "../../interface/Joint/ID6Joint";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxJoint } from "./pxJoint";

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
     * set Joint axis and secendary Axis
     * @param axis 
     * @param secendary 
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
     * set Motion Type
     * @param axis 
     * @param motionType 
     */
    setMotion(axis: D6Axis, motionType: D6MotionType): void {
        this._pxJoint && this._pxJoint.setMotion(motionType, axis);
    }

    /**
     * set Distance Limit
     * @param limit 
     * @param bounceness 
     * @param bounceThreshold 
     * @param spring 
     * @param damp 
     */
    setDistanceLimit(limit: number, bounceness: number, bounceThreshold: number, spring: number, damp: number): void {
        this._pxJoint && this._pxJoint.setDistanceLimit(limit, bounceness, bounceThreshold, spring, damp);
    }

    /**
     * 
     * @param linearAxis 
     * @param upper 
     * @param lower 
     * @param bounceness 
     * @param bounceThreshold 
     * @param spring 
     * @param damping 
     */
    setLinearLimit(linearAxis: D6MotionType, upper: number, lower: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        this._pxJoint && this._pxJoint.setLinearLimit(linearAxis, lower, upper, bounceness, bounceThreshold, spring, damping);
    }

    /**
     * 
     * @param upper 
     * @param lower 
     * @param bounceness 
     * @param bounceThreshold 
     * @param spring 
     * @param damping 
     */
    setTwistLimit(upper: number, lower: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        this._pxJoint && this._pxJoint.setTwistLimit(lower, upper, bounceness, bounceThreshold, spring, damping);
    }

    /**
     * 
     * @param yAngle 
     * @param zAngle 
     * @param bounceness 
     * @param bounceThreshold 
     * @param spring 
     * @param damping 
     */
    setSwingLimit(yAngle: number, zAngle: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        this._pxJoint && this._pxJoint.setSwingLimit(yAngle, zAngle, bounceness, bounceThreshold, spring, damping);
    }

    /**
     * 
     * @param index 
     * @param stiffness 
     * @param damping 
     * @param forceLimit 
     */
    setDrive(index: D6Drive, stiffness: number, damping: number, forceLimit: number): void {
        let acceleration: number = PxD6JointDriveFlag.eACCELERATION;//TODO 1 accleration Mode
        this._pxJoint && this._pxJoint.setDrive(index, stiffness, damping, forceLimit, acceleration);
    }

    /**
     * 
     * @param position 
     * @param rotate 
     */
    setDriveTransform(position: Vector3, rotate: Quaternion): void {
        this._pxJoint && this._pxJoint.setDrivePosition(position, rotate);
    }

    /**
     * 
     * @param position 
     * @param angular 
     */
    setDriveVelocity(position: Vector3, angular: Vector3): void {
        this._pxJoint && this._pxJoint.setDriveVelocity(position, angular);
    }

    /**
     * 
     * @returns 
     */
    getTwistAngle(): number {
        return this._pxJoint.getTwistAngle();
    }

    /**
     * 
     * @returns 
     */
    getSwingYAngle(): number {
        return this._pxJoint.getSwingYAngle();
    }

    /**
     * 
     * @returns 
     */
    getSwingZAngle(): number {
        return this._pxJoint.getSwingZAngle();
    }
}