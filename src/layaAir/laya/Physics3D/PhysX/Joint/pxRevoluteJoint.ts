import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IHingeJoint } from "../../interface/Joint/IHingeJoint";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxJoint } from "./pxJoint";

export enum PxRevoluteJointFlag {
    eLIMIT_ENABLED = 1 << 0,	//!< enable the limit
    eDRIVE_ENABLED = 1 << 1,	//!< enable the drive
    eDRIVE_FREESPIN = 1 << 2	//!< if the existing velocity is beyond the drive velocity, do not add force
};

export class pxRevoluteJoint extends pxJoint implements IHingeJoint {

    /**@internal */
    protected static _xAxis = new Vector3(1, 0, 0);

    /**@internal */
    private _axisRotationQuaternion = new Quaternion();

    /**@internal */
    private _velocity = new Vector3();

    /**@internal */
    private _lowerLimit: number = -Math.PI / 2;

    /**@internal */
    private _uperLimit: number = Math.PI / 2;

    /**@internal */
    private _bouncenciness: number = 0;

    /**@internal */
    private _bouncenMinVelocity: number = 0;

    /**@internal */
    private _contactDistance: number = 0;

    /**@internal */
    private _enableLimit: boolean = false;

    /**
     * create Joint
     */
    protected _createJoint() {
        const transform = pxJoint._tempTransform0;
        this._localPos.cloneTo(transform.translation);
        const transform1 = pxJoint._tempTransform1;
        this._connectlocalPos.cloneTo(transform1.translation);
        this._pxJoint = pxPhysicsCreateUtil._pxPhysics.createRevoluteJoint(this._collider._pxActor, transform.translation, transform.rotation, this._connectCollider._pxActor, transform1.translation, transform1.rotation);
        this._pxJoint.setUUID(this._id);
    }

    /**@internal */
    protected _setLocalPose(actor: number, position: Vector3): void {
        this._pxJoint && this._pxJoint.setLocalPose(actor, position, this._axisRotationQuaternion);
    }

    /**@internal */
    private _setRevoluteJointFlag(flag: PxRevoluteJointFlag, value: boolean) {
        this._pxJoint && this._pxJoint.setRevoluteJointFlag(flag, value);
    }

    /**@internal */
    private _setLimit(): void {
        this._enableLimit && this._pxJoint && this._pxJoint.setHardLimit(this._lowerLimit, this._uperLimit, this._contactDistance);
    }

    setLowerLimit(lowerLimit: number): void {
        if (this._lowerLimit == lowerLimit)
            return;
        this._lowerLimit = lowerLimit;
        this._setLimit();
    }

    setUpLimit(value: number): void {
        if (this._uperLimit == value || !this._enableLimit)
            return;
        this._uperLimit = value;
        this._setLimit();
    }

    setBounceness(value: number): void {
        if (this._bouncenciness == value)
            return;
        this._bouncenciness = value;
        this._setLimit();
    }

    setBouncenMinVelocity(value: number): void {
        if (this._bouncenMinVelocity == value)
            return;
        this._bouncenMinVelocity = value;
        this._setLimit();
    }

    setContactDistance(value: number): void {
        if (this._contactDistance == value)
            return
        this._contactDistance = value;
        this._setLimit();
    }

    enableLimit(value: boolean) {
        this._enableLimit = value
        this._setRevoluteJointFlag(PxRevoluteJointFlag.eLIMIT_ENABLED, value);
        if (this._enableLimit)
            this._setLimit();
    }

    enableDrive(value: boolean) {
        this._setRevoluteJointFlag(PxRevoluteJointFlag.eDRIVE_ENABLED, value);
    }

    enableFreeSpin(value: boolean) {
        this._setRevoluteJointFlag(PxRevoluteJointFlag.eDRIVE_FREESPIN, value);
    }

    setAxis(value: Vector3): void {
        const xAxis = pxRevoluteJoint._xAxis;
        const axisRotationQuaternion = this._axisRotationQuaternion;
        xAxis.set(1, 0, 0);
        value = value.normalize();
        const angle = Math.acos(Vector3.dot(xAxis, value));
        Vector3.cross(xAxis, value, xAxis);
        Quaternion.rotationAxisAngle(xAxis, angle, axisRotationQuaternion);
        this._setLocalPose(0, this._localPos);
    }

    getAngle(): number {
        return this._pxJoint.getAngle();
    }

    getVelocity(): Readonly<Vector3> {
        const velocity = this._velocity;
        const getVel = this._pxJoint.getVelocity();
        velocity.set(getVel.x, getVel.y, getVel.z);
        return velocity;
    }

    setDriveVelocity(velocity: number): void {
        this._pxJoint && this._pxJoint.setDriveVelocity(velocity, true);
    }

    setDriveForceLimit(limit: number): void {
        this._pxJoint && this._pxJoint.setDriveForceLimit(limit);
    }
}