import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IHingeJoint } from "../../interface/Joint/IHingeJoint";
import { pxStatics } from "../pxStatics";
import { pxJoint } from "./pxJoint";

export enum PxRevoluteJointFlag {
    eLIMIT_ENABLED = 1 << 0,	//!< enable the limit
    eDRIVE_ENABLED = 1 << 1,	//!< enable the drive
    eDRIVE_FREESPIN = 1 << 2	//!< if the existing velocity is beyond the drive velocity, do not add force
};

/**
 * @en `pxRevoluteJoint` is a joint that allows rotation around an axis.
 * @zh `pxRevoluteJoint`类用于在物理引擎中创建和管理旋转关节（铰链关节）
 */
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
        this._pxJoint = pxStatics._physics.createRevoluteJoint(this._collider._pxActor, transform.translation, transform.rotation, this._connectCollider._pxActor, transform1.translation, transform1.rotation);
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

    /**@internal */
    setLowerLimit(lowerLimit: number): void {
        if (this._lowerLimit == lowerLimit)
            return;
        this._lowerLimit = lowerLimit;
        this._setLimit();
    }

    /**@internal */
    setUpLimit(value: number): void {
        if (this._uperLimit == value)
            return;
        this._uperLimit = value;
        this._setLimit();
    }

    /**@internal */
    setBounceness(value: number): void {
        if (this._bouncenciness == value)
            return;
        this._bouncenciness = value;
        this._setLimit();
    }

    /**@internal */
    setBouncenMinVelocity(value: number): void {
        if (this._bouncenMinVelocity == value)
            return;
        this._bouncenMinVelocity = value;
        this._setLimit();
    }

    /**@internal */
    setContactDistance(value: number): void {
        if (this._contactDistance == value)
            return
        this._contactDistance = value;
        this._setLimit();
    }

    /**@internal */
    enableLimit(value: boolean) {
        this._enableLimit = value
        this._setRevoluteJointFlag(PxRevoluteJointFlag.eLIMIT_ENABLED, value);
        if (this._enableLimit)
            this._setLimit();
    }

    /**@internal */
    enableDrive(value: boolean) {
        this._setRevoluteJointFlag(PxRevoluteJointFlag.eDRIVE_ENABLED, value);
    }

    /**@internal */
    enableFreeSpin(value: boolean) {
        this._setRevoluteJointFlag(PxRevoluteJointFlag.eDRIVE_FREESPIN, value);
    }

    /**@internal */
    setAxis(value: Vector3): void {
        const length = value.length();
        if (!(length > 0) || !Number.isFinite(length)) return;
        const x = value.x / length, y = value.y / length, z = value.z / length;
        const rotation = this._axisRotationQuaternion;
        // Rotation from +X to the requested axis. Antiparallel vectors need an
        // explicit half turn; their cross product is zero.
        if (x < -1 + 1e-12) rotation.setValue(0, 1, 0, 0);
        else {
            rotation.setValue(0, -z, y, 1 + x);
            rotation.normalize(rotation);
        }
        this._setLocalPose(0, this._localPos);
        this._setLocalPose(1, this._connectlocalPos);
    }

    /**@internal */
    getAngle(): number {
        return this._pxJoint.getAngle();
    }

    /**@internal */
    getVelocity(): Readonly<Vector3> {
        const velocity = this._velocity;
        const getVel = this._pxJoint.getVelocity();
        velocity.set(getVel.x, getVel.y, getVel.z);
        return velocity;
    }

    /**@internal */
    setDriveVelocity(velocity: number): void {
        this._pxJoint && this._pxJoint.setDriveVelocity(velocity, true);
    }

    /**@internal */
    setDriveForceLimit(limit: number): void {
        this._pxJoint && this._pxJoint.setDriveForceLimit(limit);
    }

    /**
     * @en Destroy joint
     * @zh 销毁关节
     */
    destroy(): void {
        super.destroy();
    }
}