import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Vector3 } from "../../../maths/Vector3";
import { NotImplementedError } from "../../../utils/Error";
import { ICollider } from "../../interface/ICollider";
import { IJoint } from "../../interface/Joint/IJoint";
import { Physics3DStatInfo } from "../../interface/Physics3DStatInfo";
import { EJointCapable } from "../../physicsEnum/EJointCapable";
import { EPhysicsStatisticsInfo } from "../../physicsEnum/EPhysicsStatisticsInfo";
import { btCollider } from "../Collider/btCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
/**
 * @en Class `btJoint` is the base class for all joints in LayaAir physics engine.
 * @zh 类`btJoint`用于实现物理关节的基类。
 */
export class btJoint implements IJoint {
    /**@internal */
    static _jointCapableMap: Map<any, any>;

    /** @internal TODO*/
    static CONSTRAINT_POINT2POINT_CONSTRAINT_TYPE = 3;
    /** @internal TODO*/
    static CONSTRAINT_HINGE_CONSTRAINT_TYPE = 4;
    /** @internal TODO*/
    static CONSTRAINT_CONETWIST_CONSTRAINT_TYPE = 5;
    /** @internal TODO*/
    static CONSTRAINT_D6_CONSTRAINT_TYPE = 6;
    /** @internal TODO*/
    static CONSTRAINT_SLIDER_CONSTRAINT_TYPE = 7;
    /** @internal TODO*/
    static CONSTRAINT_CONTACT_CONSTRAINT_TYPE = 8;
    /** @internal TODO*/
    static CONSTRAINT_D6_SPRING_CONSTRAINT_TYPE = 9;
    /** @internal TODO*/
    static CONSTRAINT_GEAR_CONSTRAINT_TYPE = 10;
    /** @internal */
    static CONSTRAINT_FIXED_CONSTRAINT_TYPE = 11;
    /** @internal TODO*/
    static CONSTRAINT_MAX_CONSTRAINT_TYPE = 12;
    /** @internal error reduction parameter (ERP)*/
    static CONSTRAINT_CONSTRAINT_ERP = 1;
    /** @internal*/
    static CONSTRAINT_CONSTRAINT_STOP_ERP = 2;
    /** @internal constraint force mixing（CFM）*/
    static CONSTRAINT_CONSTRAINT_CFM = 3;
    /** @internal*/
    static CONSTRAINT_CONSTRAINT_STOP_CFM = 4;

    /**@internal */
    _connectCollider: ICollider;
    /**@internal */
    _collider: ICollider;

    /**@internal */
    _connectOwner: Sprite3D;
    /**@internal */
    owner: Sprite3D;


    /**@internal */
    _id: number;
    /**@internal */
    _btJoint: any;
    /**@internal 回调参数*/
    _btJointFeedBackObj: number;
    /**@internal */
    private _getJointFeedBack: boolean = false;
    /**@internal */
    _constraintType: number;
    _manager: btPhysicsManager;
    /**
     * @en Whether to perform collision detection between the two connected objects.
     * @zh 连接的两个物体是否进行碰撞检测。
     */
    _disableCollisionsBetweenLinkedBodies = false;

    /**@internal */
    _anchor: Vector3 = new Vector3(0);
    /** @internal */
    _connectAnchor = new Vector3(0);
    /**@internal */
    private _currentForce: Vector3 = new Vector3();
    /**@internal */
    private _breakForce: number;
    /**@internal */
    private _currentTorque: Vector3 = new Vector3;
    /**@internal */
    private _breakTorque: number;
    /**@internal */
    protected _btTempVector30: number;
    /**@internal */
    protected _btTempVector31: number;
    /**@internal */
    protected _btTempTrans0: number;
    /**@internal */
    protected _btTempTrans1: number;

    static __init__(): void {
        btJoint.initJointCapable();
    }

    /**
     * @en Initialize the joint capability map.
     * @zh 初始化关节能力映射。
     */
    static initJointCapable(): void {
        btJoint._jointCapableMap = new Map();
        btJoint._jointCapableMap.set(EJointCapable.Joint_Anchor, true);
        btJoint._jointCapableMap.set(EJointCapable.Joint_ConnectAnchor, true);
    }

    /**
     * @en Get the joint capability.
     * @param value The joint capability to check.
     * @returns Whether the joint has the specified capability.
     * @zh 获取关节能力。
     * @param value 要检查的关节能力。
     * @returns 关节是否具有指定的能力。
     */
    static getJointCapable(value: EJointCapable): boolean {
        return btJoint._jointCapableMap.get(value);
    }

    /**
     * @en Creates an instance of btJoint.
     * @param manager The physics manager.
     * @zh 创建一个 btJoint 的实例。
     * @param manager 物理管理器。
     */
    constructor(manager: btPhysicsManager) {
        this._manager = manager;
        this.initJoint();
        Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicsJoint, 1);
    }

    protected _createJoint() {
        //override it
    }

    destroy(): void {
        Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicsJoint, -1);
    }

    /**
     * @en Set the collider for the joint.
     * @param collider The collider to set.
     * @zh 设置关节的碰撞器。
     * @param collider 要设置的碰撞器。
     */
    setCollider(collider: btCollider): void {
        if (collider == this._collider)
            return;
        this._collider = collider;
        this._createJoint();
    }

    /**
     * @en Set the connected collider for the joint.
     * @param collider The connected collider to set.
     * @zh 设置关节的连接碰撞器。
     * @param collider 要设置的连接碰撞器。
     */
    setConnectedCollider(collider: btCollider): void {
        if (collider == this._connectCollider)
            return;
        if (collider) {
            this._connectOwner = collider.owner;
        }
        this._connectCollider = collider;
        this._createJoint();
    }

    /**
     * @en Set the local position of the joint.
     * @param pos The local position to set.
     * @zh 设置关节的局部位置。
     * @param pos 要设置的局部位置。
     */
    setLocalPos(pos: Vector3): void {
        let bt = btPhysicsCreateUtil._bt;
        this._anchor = pos;
        bt.btVector3_setValue(this._btTempVector30, this._anchor.x, this._anchor.y, this._anchor.z);
        bt.btVector3_setValue(this._btTempVector31, this._connectAnchor.x, this._connectAnchor.y, this._connectAnchor.z);
        bt.btTransform_setOrigin(this._btTempTrans0, this._btTempVector30);
        bt.btTransform_setOrigin(this._btTempTrans1, this._btTempVector31);
    }
    /**
     * @en Set the connected local position of the joint.
     * @param pos The connected local position to set.
     * @zh 设置关节的连接局部位置。
     * @param pos 要设置的连接局部位置。
     */
    setConnectLocalPos(pos: Vector3): void {
        let bt = btPhysicsCreateUtil._bt;
        this._connectAnchor = pos;
        bt.btVector3_setValue(this._btTempVector30, this._anchor.x, this._anchor.y, this._anchor.z);
        bt.btVector3_setValue(this._btTempVector31, this._connectAnchor.x, this._connectAnchor.y, this._connectAnchor.z);
        bt.btTransform_setOrigin(this._btTempTrans0, this._btTempVector30);
        bt.btTransform_setOrigin(this._btTempTrans1, this._btTempVector31);
    }
    /**
     * @en Get the linear force of the joint.
     * @zh 获取关节的线性力。
     */
    getlinearForce(): Vector3 {
        throw new NotImplementedError();
    }
    /**
     * @en Get the angular force of the joint.
     * @zh 获取关节的角力。
     */
    getAngularForce(): Vector3 {
        throw new NotImplementedError();
    }
    /**
     * @en Check if the joint is valid.
     * @zh 检查关节是否有效。
     */
    isValid(): boolean {
        throw new NotImplementedError();
    }
    /**
     * @en Enable or disable the joint.
     * @param value Whether to enable the joint.
     * @zh 启用或禁用关节。
     * @param value 是否启用关节。
     */
    isEnable(value: boolean): void {
        let bt = btPhysicsCreateUtil._bt;
        bt.btTypedConstraint_setEnabled(this._btJoint, value);
    }
    /**
     * @en Set whether collision is enabled between connected bodies.
     * @param value Whether to enable collision.
     * @zh 设置连接的物体之间是否启用碰撞。
     * @param value 是否启用碰撞。
     */
    isCollision(value: boolean): void {
        this._disableCollisionsBetweenLinkedBodies = !value;
        this._createJoint();
    }

    protected initJoint() {
        let bt = btPhysicsCreateUtil._bt;
        this._breakForce = -1;
        this._breakTorque = -1;
        this._btTempVector30 = bt.btVector3_create(0, 0, 0);
        this._btTempVector31 = bt.btVector3_create(0, 0, 0);
        this._btTempTrans0 = bt.btTransform_create();
        this._btTempTrans1 = bt.btTransform_create();
        bt.btTransform_setIdentity(this._btTempTrans0);
        bt.btTransform_setOrigin(this._btTempTrans0, this._btTempVector30);
        bt.btTransform_setIdentity(this._btTempTrans1);
        bt.btTransform_setOrigin(this._btTempTrans1, this._btTempVector31);
    }
    /**
     * @en Set the owner of the joint.
     * @param owner The owner to set.
     * @zh 设置关节的所有者。
     * @param owner 要设置的所有者。
     */
    setOwner(owner: Sprite3D) {
        this.owner = owner;
    }

    /**
     * @en Check if the joint is constrained by break force or torque.
     * @zh 检查关节是否受到断裂力或扭矩的约束。
     */
    _isBreakConstrained() {
        this._getJointFeedBack = false;
        if (this._breakForce == -1 && this._breakTorque == -1)
            return false;
        this._btFeedBackInfo();
        var isBreakForce: Boolean = this._breakForce != -1 && (Vector3.scalarLength(this._currentForce) > this._breakForce);
        var isBreakTorque: Boolean = this._breakTorque != -1 && (Vector3.scalarLength(this._currentTorque) > this._breakTorque);
        if (isBreakForce || isBreakTorque) {
            this.setConnectedCollider(null);
            return true;
        }
        return false;
    }

    /**
     * @internal
     * @en Get the feedback information from bt.
     * @zh 获取bt回调参数。
     */
    _btFeedBackInfo() {
        var bt = btPhysicsCreateUtil._bt;
        var applyForce: number = bt.btJointFeedback_getAppliedForceBodyA(this._btJointFeedBackObj);
        var applyTorque: number = bt.btJointFeedback_getAppliedTorqueBodyA(this._btJointFeedBackObj);
        this._currentTorque.setValue(bt.btVector3_x(applyTorque), bt.btVector3_y(applyTorque), bt.btVector3_z(applyTorque));
        this._currentForce.setValue(bt.btVector3_x(applyForce), bt.btVector3_y(applyForce), bt.btVector3_z(applyForce));
        this._getJointFeedBack = true;
    }

    /**
     * @en Set the mass scale of the connected body.
     * @param value The mass scale to set.
     * @zh 设置连接物体的质量比例。
     * @param value 要设置的质量比例。
     */
    setConnectedMassScale(value: number): void {
        throw new NotImplementedError();
    }
    /**
     * @en Set the inertia scale of the connected body.
     * @param value The inertia scale to set.
     * @zh 设置连接物体的惯性比例。
     * @param value 要设置的惯性比例。
     */
    setConnectedInertiaScale(value: number): void {
        throw new NotImplementedError();
    }
    /**
     * @en Set the mass scale of the joint.
     * @param value The mass scale to set.
     * @zh 设置关节的质量比例。
     * @param value 要设置的质量比例。
     */
    setMassScale(value: number): void {
        throw new NotImplementedError();
    }
    /**
     * @en Set the inertia scale of the joint.
     * @param value The inertia scale to set.
     * @zh 设置关节的惯性比例。
     * @param value 要设置的惯性比例。
     */
    setInertiaScale(value: number): void {
        throw new NotImplementedError();
    }
    /**
     * @en Set the break force of the joint.
     * @param value The break force to set.
     * @zh 设置关节的断裂力。
     * @param value 要设置的断裂力。
     */
    setBreakForce(value: number): void {
        this._breakForce = value;
    }
    /**
     * @en Set the break torque of the joint.
     * @param value The break torque to set.
     * @zh 设置关节的断裂扭矩。
     * @param value 要设置的断裂扭矩。
     */
    setBreakTorque(value: number): void {
        this._breakTorque = value;
    }

}