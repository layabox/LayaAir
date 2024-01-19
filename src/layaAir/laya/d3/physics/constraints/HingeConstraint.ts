import { Laya3D } from "../../../../Laya3D";
import { IHingeJoint } from "../../../Physics3D/interface/Joint/IHingeJoint";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";
import { Vector3 } from "../../../maths/Vector3";
import { Scene3D } from "../../core/scene/Scene3D";
import { ConstraintComponent } from "./ConstraintComponent";

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


    /**
    * 创建一个<code>HingeConstraint</code>铰链实例
    */
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
     * 主轴
     * set Hinge Rotation Axis,value by local rigibody0 
     */
    set Axis(value: Vector3) {
        if (!value || this._axis.equal(value)) {
            return;
        }
        value = value.normalize();//归一化轴
        value.cloneTo(this._axis);
        this._joint && this._joint.setAxis(value);
    }

    get Axis(): Vector3 {
        return this._axis;
    }

    /**
     * 关节的最小限制值
     * @param lowerLimit 最小限制值
     */
    set lowerLimit(value: number) {
        this._lowerLimit = value;
        let lowerValue = value < this._lowerLimit ? this._lowerLimit : (value < (-Math.PI / 2) ? (-Math.PI) : value);
        this._joint && this._joint.setLowerLimit(lowerValue);
    }

    get lowerLimit() {
        return this._lowerLimit;
    }

    /**
     * 关节的最大限制值
     * @param lowerLimit 最大限制值
     */
    set uperLimit(value: number) {
        this._uperLimit = value;
        let uperValue = value > this._uperLimit ? this._uperLimit : (value > (Math.PI / 2) ? (Math.PI) : value);
        this._joint && this._joint.setUpLimit(uperValue);
    }

    get uperLimit(): number {
        return this._uperLimit;
    }

    /**
     * 关节限制值后弹力值
     * @param value 
     */
    set bounceness(value: number) {
        value = value < 0 ? 0 : (value > 1 ? 1 : value);
        this._bounciness = value;
        this._joint && this._joint.setBounceness(value);
    }

    get bounceness(): number {
        return this._bounciness;
    }

    /**
     * 关节限制值后弹力反弹最小速度
     * @param value 
     */
    set bouncenMinVelocity(value: number) {
        this._bounceMinVelocity = value;
        this._joint && this._joint.setBouncenMinVelocity(value);
    }

    get bouncenMinVelocity() {
        return this._bounceMinVelocity;
    }

    /**
     * 关节的接触距离值，距离值内持续碰撞
     * @param value 
     */
    set contactDistance(value: number) {
        this._contactDistance = value;
        this._joint && this._joint.setContactDistance(value);
    }

    get contactDistance() {
        return this._contactDistance;
    }

    /**
     * 关节的旋转限制值
     * @param value 
     */
    set limit(value: boolean) {
        this._limit = value;
        this._joint && this._joint.enableLimit(value);
    }

    get limit() {
        return this._limit;
    }

    /**
     * 是否自驱动
     * @param value 
     */
    set motor(value: boolean) {
        this._motor = value;
        this._motor && this._joint.enableDrive(value);
    }

    get motor() {
        return this._motor;
    }

    /**
     * 自驱动加速(不保持恒定驱动速度)
     * @param value 
     */
    set freeSpin(value: boolean) {
        this._freeSpin = value;
        this._joint && this._joint.enableFreeSpin(value);
    }

    get freeSpin() {
        return this._freeSpin;
    }

    /**
     * set the target velocity for the drive model.
     * @param velocity the drive target velocity
     */
    set targetVelocity(velocity: number) {
        this._targetVelocity = velocity;
        this._joint && this._joint.setDriveVelocity(velocity)
    }

    get targetVelocity() {
        return this._targetVelocity;
    }


    /**
     * The current angle in degrees of the joint relative to its rest position.
     */
    getAngle(): number {
        return this._joint ? this._joint.getAngle() : 0;
    }

    /**
     * The angular velocity of the joint in degrees per second.
     */
    getVelocity(): Vector3 {
        return this._joint ? this._joint.getVelocity() : Vector3._tempVector3.set(0, 0, 0);
    }
}