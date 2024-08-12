import { ConstraintComponent } from "./ConstraintComponent";
import { Vector3 } from "../../../maths/Vector3";
import { Laya3D } from "../../../../Laya3D";
import { D6Axis, D6Drive, D6MotionType, ID6Joint } from "../../../Physics3D/interface/Joint/ID6Joint";
import { Quaternion } from "../../../maths/Quaternion";
import { Transform3D } from "../../core/Transform3D";
import { Scene3D } from "../../core/scene/Scene3D";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";

/**
 * @en The ConfigurableConstraint class is used for configurable constraint components.
 * @zh ConfigurableConstraint类用于可设置的约束组件
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

    /** @ignore */
    constructor() {
        super();
    }


    //Linear Drive X
    private _setDriveLinearX() {
        this._joint.setDrive(D6Drive.eX, this._linearDriveForce.x, this._linearDriveDamping.x, this._linearDriveforceLimit.x);
    }

    //Linear Drive Y
    private _setDriveLinearY() {
        this._joint.setDrive(D6Drive.eY, this._linearDriveForce.y, this._linearDriveDamping.y, this._linearDriveforceLimit.y);
    }

    //Linear Drive Z
    private _setDriveLinearZ() {
        this._joint.setDrive(D6Drive.eZ, this._linearDriveForce.z, this._linearDriveDamping.z, this._linearDriveforceLimit.z);
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
     * @en Main axis
     * @zh 主轴
     */
    get axis(): Vector3 {
        return this._axis;
    }

    set axis(value: Vector3) {
        if (!value)
            return;
        value.cloneTo(this._axis);
        this._setAxis();
    }

    /**
     * @en Secondary axis
     * @zh 副轴
     */
    get secondaryAxis(): Vector3 {
        return this._secondaryAxis;
    }

    set secondaryAxis(value: Vector3) {
        if (!value)
            return;
        value.cloneTo(this._secondaryAxis);
        this._setAxis();
    }

    /**
     * @en The motion type for X translation.
     * @zh X位移运动类型。
     */
    get XMotion() {
        return this._xMotion;
    }

    set XMotion(value: D6Axis) {
        this._xMotion = value;
        this._joint.setMotion(value, D6MotionType.eX);
    }


    /**
     * @en The motion type for Y translation.
     * @zh Y位移运动类型。
     */
    get YMotion() {
        return this._yMotion;
    }

    set YMotion(value: D6Axis) {
        this._yMotion = value;
        this._joint.setMotion(value, D6MotionType.eY);
    }


    /**
     * @en The motion type for Z translation.
     * @zh Z位移运动类型。
     */
    get ZMotion() {
        return this._zMotion;
    }

    set ZMotion(value: D6Axis) {
        this._zMotion = value;
        this._joint.setMotion(value, D6MotionType.eZ);
    }


    /**
     * @en The motion type for X-axis rotation.
     * @zh 绕 X 轴旋转的角运动类型
     */
    get angularXMotion() {
        return this._angularXMotion;
    }

    set angularXMotion(value: D6Axis) {
        this._angularXMotion = value;
        this._joint.setMotion(value, D6MotionType.eTWIST);
    }

    /**
     * @en The motion type for Y-axis rotation.
     * @zh 绕 Y 轴旋转的角运动类型
     */
    get angularYMotion() {
        return this._angularYMotion;
    }

    set angularYMotion(value: D6Axis) {
        this._angularYMotion = value;
        this._joint.setMotion(value, D6MotionType.eSWING1);
    }

    /**
     * @en The motion type for Z-axis rotation.
     * @zh 绕 Z 轴旋转的角运动类型
     */
    get angularZMotion() {
        return this._angularZMotion;
    }

    set angularZMotion(value: D6Axis) {
        this._angularZMotion = value;
        this._joint.setMotion(value, D6MotionType.eSWING2);
    }

    /**
     * @en The limit value for joint translation.
     * @zh 关节位移值。
     */
    get distanceLimit() {
        return this._distanceLimit;
    }

    set distanceLimit(value: number) {
        if (value < 0)
            return;
        this._distanceLimit = value;
        this._setDistanceLimit();
    }

    /**
     * @en The bounciness value after the joint translation limit is reached.
     * @zh 关节位移限制后的弹力值。
     */
    get distanceBounciness() {
        return this._distanceBounciness;
    }
    
    set distanceBounciness(value: number) {
        if (value < 0)
            return;
        this._distanceBounciness = value;
        this._setDistanceLimit();
    }

    /**
     * @en The bounciness threshold after the joint translation limit is reached.
     * @zh 关节位移限制后弹力阈值。
     */
    get distanceBounceThreshold() {
        return this._distanceBounceThreshold;
    }

    set distanceBounceThreshold(value: number) {
        if (value < 0)
            return;
        this._distanceBounceThreshold = value;
        this._setDistanceLimit();
    }

    /**
     * @en The spring coefficient value for joint translation.
     * @zh 关节位移的弹簧系数。
     */
    get distanceSpring() {
        return this._distanceSpring;
    }

    set distanceSpring(value: number) {
        if (value < 0)
            return;
        this._distanceSpring = value;
        this._setDistanceLimit();
    }

    /**
     * @en The damping coefficient value for joint translation.
     * @zh 关节位移的阻尼值。
     */
    get distanceDamper() {
        return this._distanceDamper;
    }

    set distanceDamper(value: number) {
        if (value < 0)
            return;
        this._distanceDamper = value;
        this._setDistanceLimit();
    }

    //linear Axis Limit 

    /**
     * @en The maximum angle value for the joint's X-axis, ranging from -180° to 180°.
     * @zh 关节X轴的最大角度值，范围从 -180° 到 180°。
     */
    get angularXMaxLimit() {
        return this._twistUper;
    }

    set angularXMaxLimit(value: number) {
        value = Math.min(180, Math.max(value, this._twistLower));
        this._twistUper = value;
        this._setAngularXLimit();
    }

    /**
     * @en The minimum angle value for the joint's X-axis.
     * @zh 关节X轴的最小角度值。
     */
    get angularXMinLimit() {
        return this._twistLower;
    }

    set angularXMinLimit(value: number) {
        value = Math.max(-180, Math.min(value, this._twistUper));
        this._twistLower = value;
        this._setAngularXLimit();
    }

    /**
     * @en The bounciness value after the joint's X-axis angle reaches its maximum value.
     * @zh 关节X轴角度达到最大值后的弹力值。
     */
    get AngleXLimitBounceness() {
        return this._twistBounceness;
    }

    set AngleXLimitBounceness(value: number) {
        value = Math.max(0, value);
        this._twistBounceness = value;
        this._setAngularXLimit();
    }

    /**
     * @en The bounciness threshold after the joint's X-axis angle reaches its maximum value.
     * @zh 关节X轴角度达到最大值后的弹力阈值。
     */
    get AngleXLimitBounceThreshold() {
        return this._twistBounceThreshold;
    }

    set AngleXLimitBounceThreshold(value: number) {
        value = Math.max(0, value);
        this._twistBounceThreshold = value;
        this._setAngularXLimit();
    }

    /**
     * @en The spring coefficient value for the joint's X-axis angle.
     * @zh 关节X轴角度弹簧系数。
     */
    get AngleXLimitSpring() {
        return this._twistStiffness;
    }

    set AngleXLimitSpring(value: number) {
        value = Math.max(0, value);
        this._twistStiffness = value;
        this._setAngularXLimit();
    }

    /**
     * @en The damping value of joint X-axis angle
     * @zh 关节X轴角度阻尼值
     */
    get AngleXLimitDamp() {
        return this._twistDamping;
    }

    set AngleXLimitDamp(value: number) {
        value = Math.max(0, value);
        this._twistDamping = value;
        this._setAngularXLimit();
    }


    //angular SwingLimit

    /**
     * @en The angle limit value for the joint's Y-axis.
     * @zh 关节Y轴的角度限制值。
     */
    get AngleYLimit() {
        return this._ySwingAngleLimit;
    }

    set AngleYLimit(value: number) {
        value = Math.min(180, Math.max(0, value));
        this._ySwingAngleLimit = value;
        this._setSwingLimit();
    }

    /**
     * @en The angle limit value for the joint's Z-axis.
     * @zh 关节Z轴的角度限制值。
     */
    get AngleZLimit() {
        return this._zSwingAngleLimit;
    }

    set AngleZLimit(value: number) {
        value = Math.min(180, Math.max(0, value));
        this._zSwingAngleLimit = value;
        this._setSwingLimit();
    }

    /**
     * @en The bounciness value after the joint's YZ-plane angle reaches its maximum limit.
     * @zh 关节YZ平面角度达到最大限制后的弹力值。
     */
    get AngleYZLimitBounciness() {
        return this._Swingrestitution;
    }

    set AngleYZLimitBounciness(value: number) {
        value = Math.max(0, value);
        this._Swingrestitution = value;
        this._setSwingLimit();
    }

    /**
     * @en The bounciness threshold after the joint's YZ-plane angle reaches its maximum limit.
     * @zh 关节YZ平面角度达到最大限制后的弹力阈值。
     */
    get AngleYZLimitBounceThreshold() {
        return this._SwingbounceThreshold;
    }

    set AngleYZLimitBounceThreshold(value: number) {
        value = Math.max(0, value);
        this._SwingbounceThreshold = value;
        this._setSwingLimit();
    }

    /**
     * @en The spring coefficient value for the joint's YZ-axis rotation.
     * @zh 关节YZ轴旋转的弹簧系数。
     */
    get AngleYZLimitSpring() {
        return this._SwingStiffness;
    }

    set AngleYZLimitSpring(value: number) {
        value = Math.max(0, value);
        this._SwingStiffness = value;
        this._setSwingLimit();
    }

    /**
     * @en The damping value for the joint's YZ-axis rotation.
     * @zh 关节YZ轴旋转的阻尼值。
     */
    get AngleYZLimitDamping() {
        return this._SwingDamping;
    }

    set AngleYZLimitDamping(value: number) {
        value = Math.max(0, value);
        this._SwingDamping = value;
        this._setSwingLimit();
    }

    //set target transform Velocity
    /**
     * @en The target position the joint is moving towards.
     * @zh 关节移动到的目标位置。
     */
    get targetPosition() {
        return this._targetPosition;
    }

    set targetPosition(value: Vector3) {
        value.cloneTo(this._targetPosition);
        this._setTargetTransform();
    }

    /**
     * @en The target rotation direction for the joint's rotation drive.
     * @zh 关节旋转驱动的目标方向。
     */
    get targetRotation() {
        return this._targetRotation;
    }

    set targetRotation(value: Vector3) {
        value.cloneTo(this._targetRotation);
        this._setTargetTransform();
    }

    /**
     * @en The velocity at which the joint moves towards the target position.
     * @zh 关节移动到目标位置的速度。
     */
    get targetPositionVelocity() {
        return this._targetVelocity;
    }

    set targetPositionVelocity(value: Vector3) {
        value.cloneTo(this._targetVelocity);
        this._setTargetVelocirty();
    }

    /**
     * @en The angular velocity driven by joint rotation to the target angle.
     * @zh 关节旋转到目标角度驱动的角速度。
     */
    get targetAngularVelocity() {
        return this._targetAngularVelocity;
    }

    set targetAngularVelocity(value: Vector3) {
        value.cloneTo(this._targetAngularVelocity);
        this._setTargetVelocirty();
    }

    /**
     * @en The spring coefficient value for the joint along the X-axis.
     * @zh 关节在X轴方向上的弹簧系数。
     */
    get XDriveSpring() {
        return this._linearDriveForce.x;
    }

    set XDriveSpring(value: number) {
        value = Math.max(value, 0);
        this._linearDriveForce.x = value;
        this._setDriveLinearX();
    }

    /**
     * @en The spring coefficient value for the joint along the Y-axis.
     * @zh 关节在Y轴方向上的弹簧系数。
     */
    get YDriveSpring() {
        return this._linearDriveForce.y;
    }

    set YDriveSpring(value: number) {
        value = Math.max(value, 0);
        this._linearDriveForce.y = value;
        this._setDriveLinearY();
    }

    /**
     * @en The spring coefficient value for the joint along the Z-axis.
     * @zh 关节在Z轴方向上的弹簧系数。
     */
    get ZDriveSpring() {
        return this._linearDriveForce.z;
    }

    set ZDriveSpring(value: number) {
        value = Math.max(value, 0);
        this._linearDriveForce.z = value;
        this._setDriveLinearZ();
    }

    /**
     * @en The damping value along the X-axis of the joint drive.
     * @zh 关节在X轴方向上的阻尼值。
     */
    get XDriveDamp() {
        return this._linearDriveDamping.x;
    }

    set XDriveDamp(value: number) {
        value = Math.max(value, 0);
        this._linearDriveDamping.x = value;
        this._setDriveLinearX();
    }

    /**
     * @en The damping value along the Y-axis of the joint drive.
     * @zh 关节在Y轴方向上的阻尼值。
     */
    get YDriveDamp() {
        return this._linearDriveDamping.y;
    }

    set YDriveDamp(value: number) {
        value = Math.max(value, 0);
        this._linearDriveDamping.y = value;
        this._setDriveLinearY();
    }

    /**
     * @en The damping value along the Z-axis of the joint drive.
     * @zh 关节在Z轴方向上的阻尼值。
     */
    get ZDriveDamp() {
        return this._linearDriveDamping.z;
    }

    set ZDriveDamp(value: number) {
        value = Math.max(value, 0);
        this._linearDriveDamping.z = value;
        this._setDriveLinearZ();
    }

    /**
     * @en The maximum force limit along the X-axis of the joint drive.
     * @zh 关节在X轴方向上的最大驱动力值。
     */
    get XDriveForceLimit() {
        return this._linearDriveforceLimit.x;
    }

    set XDriveForceLimit(value: number) {
        value = Math.max(value, 0);
        this._linearDriveforceLimit.x = value;
        this._setDriveLinearX();
    }

    /**
     * @en The maximum force limit along the Y-axis of the joint drive.
     * @zh 关节在Y轴方向上的最大驱动力值。
     */
    get YDriveForceLimit() {
        return this._linearDriveforceLimit.y;
    }

    set YDriveForceLimit(value: number) {
        value = Math.max(value, 0);
        this._linearDriveforceLimit.y = value;
        this._setDriveLinearY();
    }

    /**
     * @en The maximum force limit along the Z-axis of the joint drive.
     * @zh 关节在Z轴方向上的最大驱动力值。
     */

    get ZDriveForceLimit() {
        return this._linearDriveforceLimit.z;
    }

    set ZDriveForceLimit(value: number) {
        value = Math.max(value, 0);
        this._linearDriveforceLimit.z = value;
        this._setDriveLinearZ();
    }

    /**
     * @en The maximum rotational driving force of the joint on the X-axis.
     * @zh 关节在X轴上的最大旋转驱动力。
     */
    public get angularXDriveForceLimit(): number {
        return this._angularXDriveForceLimit;
    }

    public set angularXDriveForceLimit(value: number) {
        value = Math.max(value, 0);
        this._angularXDriveForceLimit = value;
        this._setAngularXDrive();
    }

    /**
     * @en The drive force for the joint's rotation around the X-axis.
     * @zh 关节在X轴上的旋转驱动力。
     */
    public get angularXDriveForce(): number {
        return this._angularXDriveForce;
    }

    public set angularXDriveForce(value: number) {
        value = Math.max(value, 0);
        this._angularXDriveForce = value;
        this._setAngularXDrive();
    }

    /**
     * @en The rotational damping value of the joint in the X-axis direction.
     * @zh 关节在X轴方向上的旋转阻尼值。
     */
    public get angularXDriveDamp(): number {
        return this._angularXDriveDamp;
    }

    public set angularXDriveDamp(value: number) {
        value = Math.max(value, 0);
        this._angularXDriveDamp = value;
        this._setAngularXDrive();
    }

    /**
     * @en The maximum drive force for the joint's rotation in the YZ-plane.
     * @zh 关节在YZ平面旋转驱动力的最大值。
     */
    public get angularYZDriveForceLimit(): number {
        return this._angularYZDriveForceLimit;
    }

    public set angularYZDriveForceLimit(value: number) {
        value = Math.max(value, 0);
        this._angularYZDriveForceLimit = value;
        this._setAngularYZDrive();
    }

    /**
     * @en The drive force for the joint's rotation in the YZ-plane.
     * @zh 关节在YZ平面上的旋转驱动力。
     */
    public get angularYZDriveForce(): number {
        return this._angularYZDriveForce;
    }

    public set angularYZDriveForce(value: number) {
        value = Math.max(value, 0);
        this._angularYZDriveForce = value;
        this._setAngularYZDrive();
    }

    /**
     * @en The damping for the joint's rotation in the YZ-plane.
     * @zh 关节在YZ平面上的阻尼。
     */
    public get angularYZDriveDamp(): number {
        return this._angularYZDriveDamp;
    }

    public set angularYZDriveDamp(value: number) {
        value = Math.max(value, 0);
        this._angularYZDriveDamp = value;
        this._setAngularYZDrive();
    }

    /**
     * @en The maximum drive force for the joint's angular slerp interpolation.
     * @zh 关节的角度插值驱动力的最大值。
     */
    public get angularSlerpDriveForceLimit(): number {
        return this._angularSlerpDriveForceLimit;
    }

    public set angularSlerpDriveForceLimit(value: number) {
        value = Math.max(value, 0);
        this._angularSlerpDriveForceLimit = value;
        this._setAngularSlerpDrive();
    }

    /**
     * @en The drive force for the joint's angular slerp interpolation.
     * @zh 关节的角度插值驱动力。
     */
    public get angularSlerpDriveForce(): number {
        return this._angularSlerpDriveForce;
    }

    public set angularSlerpDriveForce(value: number) {
        value = Math.max(value, 0);
        this._angularSlerpDriveForce = value;
        this._setAngularSlerpDrive();
    }

    /**
     * @en The damping for the joint's angular slerp interpolation.
     * @zh 角度插值阻尼。
     */
    public get angularSlerpDriveDamp(): number {
        return this._angularSlerpDriveDamp;
    }

    public set angularSlerpDriveDamp(value: number) {
        value = Math.max(value, 0);
        this._angularSlerpDriveDamp = value;
        this._setAngularSlerpDrive();
    }

    /**
     * @internal
     */
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

    /**
     * @internal
     * @protected
     */
    protected _onEnable(): void {
        if (this._joint)
            this._joint.isEnable(true);
    }

    /**
     * @internal
     * @protected
     */
    protected _onDisable(): void {
        if (this._joint)
            this._joint.isEnable(false);
    }

    /**
     * @internal
     * @protected
     * create joint
     */
    protected _initJoint(): void {
        this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
        if (Laya3D.enablePhysics && Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_D6Joint)) {
            this._joint = Laya3D.PhysicsCreateUtil.createD6Joint(this._physicsManager);
        } else {
            console.error("Rigidbody3D: cant enable Rigidbody3D");
        }
    }
}