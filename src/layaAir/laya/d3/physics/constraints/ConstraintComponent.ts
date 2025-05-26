import { Component } from "../../../components/Component";
import { Vector3 } from "../../../maths/Vector3";
import { IJoint } from "../../../Physics3D/interface/Joint/IJoint";
import { IPhysicsManager } from "../../../Physics3D/interface/IPhysicsManager";
import { PhysicsColliderComponent } from "../PhysicsColliderComponent";
import { Sprite3D } from "../../core/Sprite3D";

/**
 * @en ConstraintComponent class is the base class for creating constraints.
 * @zh ConstraintComponent 类用于创建约束的父类。
 */
export class ConstraintComponent extends Component {
    /**@internal */
    _joint: IJoint;
    private _enableCollison: boolean = false;
    protected _physicsManager: IPhysicsManager;
    protected _ownCollider: PhysicsColliderComponent;
    protected _connectCollider: PhysicsColliderComponent;
    protected _breakForce: number = Number.MAX_VALUE;
    protected _breakTorque: number = Number.MAX_VALUE;
    protected _ownColliderLocalPos: Vector3 = new Vector3();
    protected _connectColliderLocalPos: Vector3 = new Vector3();
    private _isJointInit: boolean = false;

    declare owner : Sprite3D;

    /**
     * @en Initializes the joint instance.
     * @zh 初始化关节实例。
     */
    initJoint() {
        this._initJoint();
        this._joint.setOwner(this.owner)
        this._joint.setLocalPos(this._ownColliderLocalPos);
        this._joint.setConnectLocalPos(this._connectColliderLocalPos);
        this._joint.setBreakForce(this.breakForce);
        this._joint.setBreakTorque(this._breakTorque);
    }

    protected _initJoint() {
        //createJoint
        //Override it
    }

    /**
     * @en Physical components of joint connections rigid body
     * @zh 关节连接的物理组件刚体
     */
    get connectedBody(): PhysicsColliderComponent {
        return this._connectCollider;
    }

    set connectedBody(value: PhysicsColliderComponent) {
        if (!value || this._connectCollider == value)
            return;
        this._connectCollider = value;
        if (this._joint) {
            this._joint.setConnectedCollider(value.collider);
        }
    }

    /**
     * @en The owner rigid body of the joint, which is the physical component that the joint is attached to.
     * @zh 关节所属的物理组件刚体。
     */
    get ownBody(): PhysicsColliderComponent {
        return this._ownCollider;
    }

    set ownBody(value: PhysicsColliderComponent) {
        if (!value || this._ownCollider == value)
            return;
        this._ownCollider = value;
        if (this._joint) {
            this._joint.setCollider(value.collider);
        }
    }

    /**
     * @en The total force applied to the joint.
     * @zh 作用在关节上的总力。
     */
    get currentForce(): Vector3 {
        if (this._joint)
            return this._joint.getlinearForce();
        else {
            console.error("joint is illegal");
            return null;
        }

    }

    /**
     * @en The total torque applied to the joint.
     * @zh 作用在关节上的总力矩。
     */
    get currentTorque(): Vector3 {
        if (this._joint)
            return this._joint.getAngularForce();
        else {
            console.error("joint is illegal");
            return null;
        }

    }

    /**
     * @en The maximum force the joint can withstand before breaking.
     * @zh 关节在断裂前能承受的最大力。
     */
    get breakForce(): number {
        return this._breakForce;
    }

    set breakForce(value: number) {
        this._breakForce = value;
        this._joint && this._joint.setBreakForce(value);
    }

    /**
     * @en The maximum torque the joint can withstand before breaking.
     * @zh 关节在断裂前能承受的最大扭矩。
     */
    get breakTorque(): number {
        return this._breakTorque;
    }

    set breakTorque(value: number) {
        this._breakTorque = value;
        this._joint && this._joint.setBreakTorque(value);
    }

    /**
     * @en The anchor point.
     * @zh 锚点
     */
    get anchor() {
        return this._ownColliderLocalPos;
    }

    set anchor(value: Vector3) {
        value.cloneTo(this._ownColliderLocalPos);
        this._joint && this._joint.setLocalPos(value);
    }

    /**
     * @en The connected anchor point.
     * @zh 连接锚点位置
     */
    get connectAnchor(): Vector3 {
        return this._connectColliderLocalPos;
    }

    set connectAnchor(value: Vector3) {
        value.cloneTo(this._connectColliderLocalPos);
        this._joint && this._joint.setConnectLocalPos(this._connectColliderLocalPos);
    }

    /**
     * @en Enables or disables collision between the connected bodies of the joint.
     * @zh 是否启用关节连接体之间的碰撞。
     */
    public get enableCollison(): boolean {
        return this._enableCollison;
    }
    public set enableCollison(value: boolean) {
        this._enableCollison = value;
        this._joint.isCollision(value);
    }

    /** @ignore */
    constructor() {
        super();
        this._singleton = false;
    }

    protected _onAdded(): void {
    }

    /**
     * @en Sets the number of solver iterations used to resolve the constraint. Higher values increase the precision but may reduce performance.
     * @param overideNumIterations The number of iterations to override with.
     * @zh 设置用于解决约束的求解器迭代次数。次数越高，精度越准确，但可能会降低性能。
     * @param overideNumIterations 要使用的迭代次数。
     */
    setOverrideNumSolverIterations(overideNumIterations: number): void {
        //TODO
    }

    /**
     * @en Enables or disables the constraint.
     * @param enable True to enable the constraint, false to disable it.
     * @zh 启用或禁用约束。
     * @param enable 是否启用约束。
     */
    setConstraintEnabled(enable: boolean): void {
        //TODO
    }

    protected _onEnable(): void {
        if (!this._isJointInit) {
            this.initJoint();
            this._isJointInit = true;
        }
    }

    protected _onDestroy() {
        this._joint.destroy();
        this._isJointInit = false;
    }

    /**
     * @internal
     * @en Checks if the constraint is broken, indicating whether the joint has exceeded its limits and is no longer constrained.
     * @zh 检查约束是否被破坏，表明关节是否超出了其限制并且不再受约束。
     */
    isBreakConstrained(): Boolean {
        return this._joint.isValid();
    }
}

