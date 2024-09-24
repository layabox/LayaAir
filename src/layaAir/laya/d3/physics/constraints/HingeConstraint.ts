import { Laya3D } from "../../../../Laya3D";
import { IHingeJoint } from "../../../Physics3D/interface/Joint/IHingeJoint";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";
import { Vector3 } from "../../../maths/Vector3";
import { Scene3D } from "../../core/scene/Scene3D";
import { ConstraintComponent } from "./ConstraintComponent";

/**
 * @en Represents a hinge constraint between two rigid bodies.
 * @zh 两个刚体之间的铰链约束。
 */
export class HingeConstraint extends ConstraintComponent {
    /**@internal */
    _joint: IHingeJoint;

    /**@internal */
    private _axis: Vector3 = new Vector3(1, 0, 0);

    /**@internal */
    private _motor: boolean = false;

    /**@internal */
    private _targetVelocity: number = 0;

    /**@internal */
    private _freeSpin: boolean = false;

    /**@internal */
    private _limit: boolean = false;

    /**@internal */
    private _lowerLimit: number = -Math.PI / 2;

    /**@internal */
    private _uperLimit: number = Math.PI / 2;

    /**@internal */
    private _bounciness: number = 0;

    /**@internal */
    private _bounceMinVelocity: number = 0;

    /**@internal */
    private _contactDistance: number = 0;


    /** @ignore */
    constructor() {
        super();
    }

    /**
     * @internal
     * @protected
     * create joint
     */
    protected _initJoint(): void {
        this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
        if (Laya3D.enablePhysics && Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_HingeJoint)) {
            this._joint = Laya3D.PhysicsCreateUtil.createHingeJoint(this._physicsManager);
        } else {
            console.error("HingeConstraint: cant enable HingeConstraint");
        }
    }

    /**
     * @internal
     * @protected
     * overrid it
     */
    protected _onEnable(): void {
        if (this._joint)
            this._joint.isEnable(true);
    }

    /**
     * @internal
     * @protected
     * overrid it
     */
    protected _onDisable(): void {
        if (this._joint)
            this._joint.isEnable(false);
    }

    /**
     * @en Main axis. Set Hinge Rotation Axis, value by rigidbody0.
     * @zh 主轴。设置铰链旋转轴，值由刚体0决定。
     */
    get Axis(): Vector3 {
        return this._axis;
    }

    set Axis(value: Vector3) {
        if (!value || this._axis.equal(value)) {
            return;
        }
        value = value.normalize();//归一化轴
        value.cloneTo(this._axis);
        this._joint && this._joint.setAxis(value);
    }

    /**
     * @en The minimum limit value for joints.
     * @zh 关节的最小限制值。
     */
    get lowerLimit() {
        return this._lowerLimit;
    }

    set lowerLimit(value: number) {
        this._lowerLimit = value;
        let lowerValue = value < this._lowerLimit ? this._lowerLimit : (value < (-Math.PI / 2) ? (-Math.PI) : value);
        this._joint && this._joint.setLowerLimit(lowerValue);
    }

    /**
     * @en The maximum limit value of the joint.
     * @zh 关节的最大限制值。
     */
    get uperLimit(): number {
        return this._uperLimit;
    }

    set uperLimit(value: number) {
        this._uperLimit = value;
        let uperValue = value > this._uperLimit ? this._uperLimit : (value > (Math.PI / 2) ? (Math.PI) : value);
        this._joint && this._joint.setUpLimit(uperValue);
    }

    /**
     * @en Bounciness value after joint limit.
     * @zh 关节限制值后的弹力值。
     */
    get bounceness(): number {
        return this._bounciness;
    }

    set bounceness(value: number) {
        value = value < 0 ? 0 : (value > 1 ? 1 : value);
        this._bounciness = value;
        this._joint && this._joint.setBounceness(value);
    }

    /**
     * @en Minimum velocity for bounce after joint limit.
     * @zh 关节限制值后弹力反弹的最小速度。
     */
    get bouncenMinVelocity() {
        return this._bounceMinVelocity;
    }

    set bouncenMinVelocity(value: number) {
        this._bounceMinVelocity = value;
        this._joint && this._joint.setBouncenMinVelocity(value);
    }

    /**
     * @en Contact distance value of the joint, continuous collision within this distance.
     * @zh 关节的接触距离值，在此距离内持续碰撞。
     */
    get contactDistance() {
        return this._contactDistance;
    }

    set contactDistance(value: number) {
        this._contactDistance = value;
        this._joint && this._joint.setContactDistance(value);
    }

    /**
     * @en Rotation limit of the joint.
     * @zh 关节的旋转限制。
     */
    get limit() {
        return this._limit;
    }

    set limit(value: boolean) {
        this._limit = value;
        this._joint && this._joint.enableLimit(value);
    }

    /**
     * @en Whether it is a motor (self-driven).
     * @zh 是否为马达（自驱动）。
     */
    get motor() {
        return this._motor;
    }

    set motor(value: boolean) {
        this._motor = value;
        this._motor && this._joint.enableDrive(value);
    }

    /**
     * @en Self driving acceleration (not maintaining a constant driving speed)
     * @zh 自驱动加速（不保持恒定驱动速度）。
     */
    get freeSpin() {
        return this._freeSpin;
    }

    set freeSpin(value: boolean) {
        this._freeSpin = value;
        this._joint && this._joint.enableFreeSpin(value);
    }

    /**
     * @en The target velocity for the drive model.
     * @zh 驱动模型的目标速度。
     */
    get targetVelocity() {
        return this._targetVelocity;
    }

    set targetVelocity(velocity: number) {
        this._targetVelocity = velocity;
        this._joint && this._joint.setDriveVelocity(velocity)
    }

    /**
     * @en Get the current angle in degrees of the joint relative to its rest position.
     * @zh 获取关节相对于其静止位置的当前角度(度)。
     */
    getAngle(): number {
        return this._joint ? this._joint.getAngle() : 0;
    }

    /**
     * @en The angular velocity of the joint in degrees per second.
     * @zh 获取关节的角速度，单位为度每秒。
     */
    getVelocity(): Vector3 {
        return this._joint ? this._joint.getVelocity() : Vector3._tempVector3.set(0, 0, 0);
    }
}