import { ConstraintComponent } from "./ConstraintComponent";
import { Vector3 } from "../../../maths/Vector3";
import { Laya3D } from "../../../../Laya3D";
import { D6Axis, D6Drive, D6MotionType, ID6Joint } from "../../../Physics3D/interface/Joint/ID6Joint";
import { Quaternion } from "../../../maths/Quaternion";
import { Transform3D } from "../../core/Transform3D";
import { Scene3D } from "../../core/scene/Scene3D";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";

/**
 * <code>ConfigurableConstraint</code>类用于可设置的约束组件
 */
export class ConfigurableConstraint extends ConstraintComponent {
    /**@internal */
    _joint: ID6Joint;
    /** @internal */
    private _axis = new Vector3(1, 0, 0);
    /** @internal */
    private _secondaryAxis = new Vector3(0, 1, 0);
    /** @internal */
    private _xMotion: D6Axis = D6Axis.eFREE;
    /** @internal */
    private _yMotion: D6Axis = D6Axis.eFREE;
    /** @internal */
    private _zMotion: D6Axis = D6Axis.eFREE;
    /** @internal */
    private _angularXMotion: D6Axis = D6Axis.eFREE;
    /** @internal */
    private _angularYMotion: D6Axis = D6Axis.eFREE;
    /** @internal */
    private _angularZMotion: D6Axis = D6Axis.eFREE;
    //linear Distance Spring
    /** @internal */
    private _distanceLimit: number = 0;
    /** @internal */
    private _distanceBounciness: number = 0;
    /** @internal */
    private _distanceBounceThreshold: number = 0;
    /** @internal */
    private _distanceSpring: number = 0;
    /** @internal */
    private _distanceDamper: number = 0;
    //linear Axis Limit
    // /** @internal */
    // private _minLinearLimit: Vector3 = new Vector3();
    // /** @internal */
    // private _maxLinearLimit: Vector3 = new Vector3();
    // /**@internal */
    // private _linearSpring: Vector3 = new Vector3();
    // /**@internal */
    // private _linearDamper: Vector3 = new Vector3();
    //angular TwistLimit
    /**@internal */
    private _twistUper: number = 0;
    /**@internal */
    private _twistLower: number = 0;
    /**@internal */
    private _twistBounceness: number = 0;
    /**@internal */
    private _twistBounceThreshold: number = 0;
    /**@internal */
    private _twistStiffness: number = 0;
    /**@internal */
    private _twistDamping: number = 0;
    //angular SwingLimit
    /**@internal */
    private _ySwingAngleLimit: number = 0;
    /**@internal */
    private _zSwingAngleLimit: number = 0;
    /**@internal */
    private _Swingrestitution: number = 0;
    /**@internal */
    private _SwingbounceThreshold: number = 0;
    /**@internal */
    private _SwingStiffness: number = 0;
    /**@internal */
    private _SwingDamping: number = 0;
    //drive
    //target
    /**@internal */
    private _targetPosition: Vector3 = new Vector3();
    /**@internal */
    private _targetRotation: Vector3 = new Vector3();
    /**@internal */
    private _targetVelocity: Vector3 = new Vector3();
    /**@internal */
    private _targetAngularVelocity: Vector3 = new Vector3();
    //linearDrive
    /**@internal */
    private _linearDriveforceLimit: Vector3 = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    /**@internal */
    private _linearDriveForce: Vector3 = new Vector3();
    /**@internal */
    private _linearDriveDamping: Vector3 = new Vector3();
    //angurXDrive
    /**@internal */
    private _angularXDriveForceLimit: number = Number.MAX_VALUE;
    /**@internal */
    private _angularXDriveForce: number = 0;
    /**@internal */
    private _angularXDriveDamp: number = 0;
    //angurYZDrive
    /**@internal */
    private _angularYZDriveForceLimit: number = Number.MAX_VALUE;
    /**@internal */
    private _angularYZDriveForce: number = 0;
    /**@internal */
    private _angularYZDriveDamp: number = 0;
    //angularSlerpDrive
    /**@internal */
    private _angularSlerpDriveForceLimit: number = Number.MAX_VALUE;
    /**@internal */
    private _angularSlerpDriveForce: number = 0;
    /**@internal */
    private _angularSlerpDriveDamp: number = 0;
    /**
     * 创建一个<code>ConfigurableConstraint</code>实例	可设置的约束组件
     */
    constructor() {
        super();
    }


    //Linear Drive X
    private _setDriveLinearX() {
        this._joint.setDrive(D6Drive.eX, this._linearDriveForce.x, this._linearDriveDamping.x, this._linearDriveforceLimit.x);
    }

    //Linear Drive Y
    private _setDriveLinearY() {
        this._joint.setDrive(D6Drive.eY, this._linearDriveForce.x, this._linearDriveDamping.y, this._linearDriveforceLimit.y);
    }

    //Linear Drive Z
    private _setDriveLinearZ() {
        this._joint.setDrive(D6Drive.eZ, this._linearDriveForce.x, this._linearDriveDamping.z, this._linearDriveforceLimit.z);
    }

    private _setAngularXDrive() {
        this._joint.setDrive(D6Drive.eSWING, this._angularXDriveForce, this._angularXDriveDamp, this._angularXDriveForceLimit);
    }

    private _setAngularYZDrive() {
        this._joint.setDrive(D6Drive.eTWIST, this._angularYZDriveForce, this._angularYZDriveDamp, this._angularYZDriveForceLimit);
    }

    private _setAngularSlerpDrive() {
        this._joint.setDrive(D6Drive.eSLERP, this._angularSlerpDriveForce, this._angularSlerpDriveDamp, this._angularSlerpDriveForceLimit);
    }

    private _setDistanceLimit() {
        this._joint.setDistanceLimit(this._distanceLimit, this._distanceBounciness, this._distanceBounceThreshold, this._distanceSpring, this._distanceDamper);
    }

    //angular TwistLimit
    private _setAngularXLimit() {
        this._joint.setTwistLimit(this._twistUper / 180 * Math.PI, this._twistLower / 180 * Math.PI, this._twistBounceness, this._twistBounceThreshold, this._twistStiffness, this._twistDamping);
    }

    private _setSwingLimit() {
        this._joint.setSwingLimit(this._ySwingAngleLimit / 180 * Math.PI, this._zSwingAngleLimit / 180 * Math.PI, this._Swingrestitution, this._SwingbounceThreshold, this._SwingStiffness, this._SwingDamping);
    }

    private _setTargetTransform() {
        let rotate = Quaternion.TEMP;
        Quaternion.createFromYawPitchRoll(this._targetRotation.y / Transform3D._angleToRandin, this._targetRotation.x / Transform3D._angleToRandin, this._targetRotation.z / Transform3D._angleToRandin, rotate);
        this._joint.setDriveTransform(this._targetPosition, rotate);
    }
    /**
     * axis
     */
    private _setAxis() {
        this._joint.setAxis(this._axis, this._secondaryAxis);
    }

    private _setTargetVelocirty() {
        this._joint.setDriveVelocity(this._targetVelocity, this._targetAngularVelocity);
    }

    /**
     * main Axis
     */
    set axis(value: Vector3) {
        if (!value)
            return;
        value.cloneTo(this._axis);
        this._setAxis();
    }

    get axis(): Vector3 {
        return this._axis;
    }

    set secondaryAxis(value: Vector3) {
        if (!value)
            return;
        value.cloneTo(this._secondaryAxis);
        this._setAxis();
    }

    /**
     * 副轴
     */
    get secondaryAxis(): Vector3 {
        return this._secondaryAxis;
    }

    /**
     * X Motion
     */
    set XMotion(value: D6Axis) {
        this._xMotion = value;
        this._joint.setMotion(value, D6MotionType.eX);
    }

    get XMotion() {
        return this._xMotion;
    }

    /**
     * Y Motion
     */
    set YMotion(value: D6Axis) {
        this._yMotion = value;
        this._joint.setMotion(value, D6MotionType.eY);
    }

    get YMotion() {
        return this._yMotion;
    }

    /**
     * Z Motion
     */
    set ZMotion(value: D6Axis) {
        this._zMotion = value;
        this._joint.setMotion(value, D6MotionType.eZ);
    }

    get ZMotion() {
        return this._zMotion;
    }

    set angularXMotion(value: D6Axis) {
        this._angularXMotion = value;
        this._joint.setMotion(value, D6MotionType.eTWIST);
    }

    get angularXMotion() {
        return this._angularXMotion;
    }

    set angularYMotion(value: D6Axis) {
        this._angularYMotion = value;
        this._joint.setMotion(value, D6MotionType.eSWING1);
    }

    get angularYMotion() {
        return this._angularYMotion;
    }

    set angularZMotion(value: D6Axis) {
        this._angularZMotion = value;
        this._joint.setMotion(value, D6MotionType.eSWING2);
    }

    get angularZMotion() {
        return this._angularZMotion;
    }



    set distanceLimit(value: number) {
        if (value < 0)
            return;
        this._distanceLimit = value;
        this._setDistanceLimit();
    }

    get distanceLimit() {
        return this._distanceLimit;
    }

    set distanceBounciness(value: number) {
        if (value < 0)
            return;
        this._distanceBounciness = value;
        this._setDistanceLimit();
    }

    get distanceBounciness() {
        return this._distanceBounciness;
    }

    set distanceBounceThreshold(value: number) {
        if (value < 0)
            return;
        this._distanceBounceThreshold = value;
        this._setDistanceLimit();
    }

    get distanceBounceThreshold() {
        return this._distanceBounceThreshold;
    }

    set distanceSpring(value: number) {
        if (value < 0)
            return;
        this._distanceSpring = value;
        this._setDistanceLimit();
    }

    get distanceSpring() {
        return this._distanceSpring;
    }

    set distanceDamper(value: number) {
        if (value < 0)
            return;
        this._distanceDamper = value;
        this._setDistanceLimit();
    }

    get distanceDamper() {
        return this._distanceDamper;
    }

    //linear Axis Limit 
    //TODO

    /**-180 ---- 180 */
    set angularXMaxLimit(value: number) {
        value = Math.min(180, Math.max(value, this._twistLower));
        this._twistUper = value;
        this._setAngularXLimit();
    }

    get angularXMaxLimit() {
        return this._twistUper;
    }

    set angularXMinLimit(value: number) {
        value = Math.max(-180, Math.min(value, this._twistUper));
        this._twistLower = value;
        this._setAngularXLimit();
    }

    get angularXMinLimit() {
        return this._twistLower;
    }


    set AngleXLimitBounceness(value: number) {
        value = Math.max(0, value);
        this._twistBounceness = value;
        this._setAngularXLimit();
    }

    get AngleXLimitBounceness() {
        return this._twistBounceness;
    }

    set AngleXLimitBounceThreshold(value: number) {
        value = Math.max(0, value);
        this._twistBounceThreshold = value;
        this._setAngularXLimit();
    }

    get AngleXLimitBounceThreshold() {
        return this._twistBounceThreshold;
    }

    set AngleXLimitSpring(value: number) {
        value = Math.max(0, value);
        this._twistStiffness = value;
        this._setAngularXLimit();
    }

    get AngleXLimitSpring() {
        return this._twistStiffness;
    }

    set AngleXLimitDamp(value: number) {
        value = Math.max(0, value);
        this._twistDamping = value;
        this._setAngularXLimit();
    }

    get AngleXLimitDamp() {
        return this._twistDamping;
    }

    //angular SwingLimit

    /**@internal */
    set AngleYLimit(value: number) {
        value = Math.min(180, Math.max(0, value));
        this._ySwingAngleLimit = value;
        this._setSwingLimit();
    }

    get AngleYLimit() {
        return this._ySwingAngleLimit
    }

    set AngleZLimit(value: number) {
        value = Math.min(180, Math.max(0, value));
        this._zSwingAngleLimit = value;
        this._setSwingLimit();
    }

    get AngleZLimit() {
        return this._zSwingAngleLimit;
    }

    set AngleYZLimitBounciness(value: number) {
        value = Math.max(0, value);
        this._Swingrestitution = value;
        this._setSwingLimit();
    }

    get AngleYZLimitBounciness() {
        return this._Swingrestitution;
    }

    set AngleYZLimitBounceThreshold(value: number) {
        value = Math.max(0, value);
        this._SwingbounceThreshold = value;
        this._setSwingLimit();
    }

    get AngleYZLimitBounceThreshold() {
        return this._SwingbounceThreshold;
    }

    set AngleYZLimitSpring(value: number) {
        value = Math.max(0, value);
        this._SwingStiffness = value;
        this._setSwingLimit();
    }

    get AngleYZLimitSpring() {
        return this._SwingStiffness;
    }

    set AngleYZLimitDamping(value: number) {
        value = Math.max(0, value);
        this._SwingDamping = value;
        this._setSwingLimit();
    }

    get AngleYZLimitDamping() {
        return this._SwingDamping;
    }

    //set target transform Velocity


    set targetPosition(value: Vector3) {
        value.cloneTo(this._targetPosition);
        this._setTargetTransform();
    }

    get targetPosition() {
        return this._targetPosition;
    }

    set targetRotation(value: Vector3) {
        value.cloneTo(this._targetRotation);
        this._setTargetTransform();
    }

    get targetRotation() {
        return this._targetRotation;
    }

    set targetPositionVelocity(value: Vector3) {
        value.cloneTo(this._targetVelocity);
        this._setTargetVelocirty();
    }

    get targetPositionVelocity() {
        return this._targetVelocity;
    }

    set targetAngularVelocity(value: Vector3) {
        value.cloneTo(this._targetAngularVelocity);
        this._setTargetVelocirty();
    }

    get targetAngularVelocity() {
        return this._targetAngularVelocity;
    }


    set XDriveSpring(value: number) {
        value = Math.max(value, 0);
        this._linearDriveForce.x = value;
        this._setDriveLinearX();
    }

    get XDriveSpring() {
        return this._linearDriveForce.x;
    }

    set YDriveSpring(value: number) {
        value = Math.max(value, 0);
        this._linearDriveForce.y = value;
        this._setDriveLinearY();
    }

    get YDriveSpring() {
        return this._linearDriveForce.y;
    }

    set ZDriveSpring(value: number) {
        value = Math.max(value, 0);
        this._linearDriveForce.z = value;
        this._setDriveLinearZ();
    }

    get ZDriveSpring() {
        return this._linearDriveForce.z;
    }

    set XDriveDamp(value: number) {
        value = Math.max(value, 0);
        this._linearDriveDamping.x = value;
        this._setDriveLinearX();
    }

    get XDriveDamp() {
        return this._linearDriveDamping.x;
    }

    set YDriveDamp(value: number) {
        value = Math.max(value, 0);
        this._linearDriveDamping.y = value;
        this._setDriveLinearY();
    }

    get YDriveDamp() {
        return this._linearDriveDamping.y;
    }

    set ZDriveDamp(value: number) {
        value = Math.max(value, 0);
        this._linearDriveDamping.z = value;
        this._setDriveLinearZ();
    }

    get ZDriveDamp() {
        return this._linearDriveDamping.z;
    }

    set XDriveForceLimit(value: number) {
        value = Math.max(value, 0);
        this._linearDriveforceLimit.x = value;
        this._setDriveLinearX();
    }

    get XDriveForceLimit() {
        return this._linearDriveforceLimit.x;
    }

    set YDriveForceLimit(value: number) {
        value = Math.max(value, 0);
        this._linearDriveforceLimit.y = value;
        this._setDriveLinearY();
    }

    get YDriveForceLimit() {
        return this._linearDriveforceLimit.y;
    }

    set ZDriveForceLimit(value: number) {
        value = Math.max(value, 0);
        this._linearDriveforceLimit.z = value;
        this._setDriveLinearZ();
    }

    get ZDriveForceLimit() {
        return this._linearDriveforceLimit.z;
    }

    public get angularXDriveForceLimit(): number {
        return this._angularXDriveForceLimit;
    }
    public set angularXDriveForceLimit(value: number) {
        value = Math.max(value, 0);
        this._angularXDriveForceLimit = value;
        this._setAngularXDrive();
    }

    public get angularXDriveForce(): number {
        return this._angularXDriveForce;
    }
    public set angularXDriveForce(value: number) {
        value = Math.max(value, 0);
        this._angularXDriveForce = value;
        this._setAngularXDrive();
    }

    public get angularXDriveDamp(): number {
        return this._angularXDriveDamp;
    }
    public set angularXDriveDamp(value: number) {
        value = Math.max(value, 0);
        this._angularXDriveDamp = value;
        this._setAngularXDrive();
    }

    public get angularYZDriveForceLimit(): number {
        return this._angularYZDriveForceLimit;
    }
    public set angularYZDriveForceLimit(value: number) {
        value = Math.max(value, 0);
        this._angularYZDriveForceLimit = value;
        this._setAngularYZDrive();
    }

    public get angularYZDriveForce(): number {
        return this._angularYZDriveForce;
    }
    public set angularYZDriveForce(value: number) {
        value = Math.max(value, 0);
        this._angularYZDriveForce = value;
        this._setAngularYZDrive();
    }

    public get angularYZDriveDamp(): number {
        return this._angularYZDriveDamp;
    }
    public set angularYZDriveDamp(value: number) {
        value = Math.max(value, 0);
        this._angularYZDriveDamp = value;
        this._setAngularYZDrive();
    }

    public get angularSlerpDriveForceLimit(): number {
        return this._angularSlerpDriveForceLimit;
    }
    public set angularSlerpDriveForceLimit(value: number) {
        value = Math.max(value, 0);
        this._angularSlerpDriveForceLimit = value;
        this._setAngularSlerpDrive();
    }

    public get angularSlerpDriveForce(): number {
        return this._angularSlerpDriveForce;
    }
    public set angularSlerpDriveForce(value: number) {
        value = Math.max(value, 0);
        this._angularSlerpDriveForce = value;
        this._setAngularSlerpDrive();
    }

    public get angularSlerpDriveDamp(): number {
        return this._angularSlerpDriveDamp;
    }
    public set angularSlerpDriveDamp(value: number) {
        value = Math.max(value, 0);
        this._angularSlerpDriveDamp = value;
        this._setAngularSlerpDrive();
    }

    _initAllConstraintInfo(): void {
        this._setDriveLinearX();
        this._setDriveLinearY();
        this._setDriveLinearZ();
        this._setAngularXDrive();
        this._setAngularYZDrive();
        this._setAngularSlerpDrive();
        this._setDistanceLimit();
        this._setAngularXLimit();
        this._setSwingLimit();
        this._setTargetTransform();
        this._setAxis();
        this._setTargetVelocirty();
    }
    protected _onEnable(): void {
        if (this._joint)
            this._joint.isEnable(true);
    }

    protected _onDisable(): void {
        if (this._joint)
            this._joint.isEnable(false);
    }

    /**
    * create joint
    */
    protected _initJoint(): void {
        this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
        if (Laya3D.enablePhysics && Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_D6Joint)) {
            this._joint = Laya3D.PhysicsCreateUtil.createD6Joint(this._physicsManager);
        } else {
            throw "Rigidbody3D: cant enable Rigidbody3D";
        }
    }
}