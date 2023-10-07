import { Component } from "../../../components/Component";
import { Rigidbody3D } from "../Rigidbody3D";
import { Vector3 } from "../../../maths/Vector3";
import { IJoint } from "../../../Physics3D/interface/Joint/IJoint";
import { Node } from "../../../display/Node";
import { IPhysicsManager } from "../../../Physics3D/interface/IPhysicsManager";
import { pxJoint } from "../../../Physics3D/PhysX/Joint/pxJoint";
/**
 * <code>ConstraintComponent</code> 类用于创建约束的父类。
 */
export class ConstraintComponent extends Component {
    /**@internal */
    _joint: IJoint;
    /**@internal */
    private _enableCollison: boolean = false;
    protected _physicsManager: IPhysicsManager;
    /**@internal */
    protected _ownCollider: Rigidbody3D;
    protected _connectCollider: Rigidbody3D;
    protected _breakForce: number = Number.MAX_VALUE;
    protected _breakTorque: number = Number.MAX_VALUE;
    protected _ownColliderLocalPos: Vector3 = new Vector3();
    protected _connectColliderLocalPos: Vector3 = new Vector3();
    /**
     * instance joint
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

    set connectedBody(value: Rigidbody3D) {
        if (!value || this._connectCollider == value)
            return;
        this._connectCollider = value;
        if (this._joint) {
            this._joint.setConnectedCollider(value.collider);
        }
    }

    get connectedBody(): Rigidbody3D {
        return this._connectCollider;
    }


    get ownBody(): Rigidbody3D {
        return this._ownCollider;
    }

    set ownBody(value: Rigidbody3D) {
        if (!value || this._ownCollider == value)
            return;
        this._ownCollider = value;
        if (this._joint) {
            this._joint.setCollider(value.collider);
        }
    }

    /**
     * 获得收到的总力
     */
    get currentForce(): Vector3 {
        if (this._joint)
            return this._joint.getlinearForce();
        else
            throw "joint is illegal";
    }

    /**
     * 获取的总力矩
     */
    get currentTorque(): Vector3 {
        if (this._joint)
            return this._joint.getAngularForce();
        else
            throw "joint is illegal";
    }

    /**
     * 设置最大承受力
     * @param value 最大承受力
     */
    get breakForce(): number {
        return this._breakForce;
    }

    set breakForce(value: number) {
        this._breakForce = value;
        this._joint && this._joint.setBreakForce(value);
    }

    /**
     * 设置最大承受力矩
     * @param value 最大承受力矩
     */
    get breakTorque(): number {
        return this._breakTorque;
    }

    set breakTorque(value: number) {
        this._breakTorque = value;
        this._joint && this._joint.setBreakTorque(value);
    }

    /**
     * 设置锚点
     */
    set anchor(value: Vector3) {
        value.cloneTo(this._ownColliderLocalPos);
        this._joint && this._joint.setLocalPos(value);
    }

    get anchor() {
        return this._ownColliderLocalPos;
    }

    /**
     * 设置链接锚点位置
     */
    set connectAnchor(value: Vector3) {
        value.cloneTo(this._connectColliderLocalPos);
        this._joint && this._joint.setConnectLocalPos(this._connectColliderLocalPos);
    }

    get connectAnchor(): Vector3 {
        return this._connectColliderLocalPos;
    }

    /**
     * 是否碰撞关节之间的内容
     */
    public get enableCollison(): boolean {
        return this._enableCollison;
    }
    public set enableCollison(value: boolean) {
        this._enableCollison = value;
        this._joint.isCollision(value);
    }

    /**
     * 创建一个 <code>ConstraintComponent</code> 实例。
     */
    constructor() {
        super();
    }

    protected _onAdded(): void {
        if (!this.owner.scene) {
            this.owner.on(Node.EVENT_SET_ACTIVESCENE, this, this._onAdded);
        } else {
            this.initJoint();
            this.owner.off(Node.EVENT_SET_ACTIVESCENE, this, this._onAdded);
        }
    }

    /**
     * 设置迭代的次数，次数越高，越精确
     * @param overideNumIterations 
     */
    setOverrideNumSolverIterations(overideNumIterations: number): void {
        //TODO
    }

    /**
     * 设置约束是否可用
     * @param enable 
     */
    setConstraintEnabled(enable: boolean): void {
        //TODO
    }

    protected _onDestroy() {

    }

    /**
     * @internal
     */
    isBreakConstrained(): Boolean {
        return this._joint.isValid();
    }
}

