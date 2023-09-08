import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Vector3 } from "../../../maths/Vector3";
import { ICollider } from "../../interface/ICollider";
import { IJoint } from "../../interface/Joint/IJoint";
import { EJointCapable } from "../../physicsEnum/EJointCapable";
import { btCollider } from "../Collider/btCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";

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
    _connectedBody: btCollider;
    /**@internal */
    _ownBody: btCollider;


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
    _connectBody: btCollider;
    /** 连接的两个物体是否进行碰撞检测 */
    _disableCollisionsBetweenLinkedBodies = false;

    /**@internal */
    owner: Sprite3D;
    /**@internal */
    _anchor: Vector3 = new Vector3();
    /** @internal */
    _connectAnchor = new Vector3();
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

    static initJointCapable(): void {
        btJoint._jointCapableMap = new Map();
        btJoint._jointCapableMap.set(EJointCapable.Joint_Anchor, true);
        btJoint._jointCapableMap.set(EJointCapable.Joint_ConnectAnchor, true);
    }

    static getJointCapable(value: EJointCapable): boolean {
        return btJoint._jointCapableMap.get(value);
    }

    constructor(manager: btPhysicsManager) {
        this._manager = manager;
        this.initJoint();
    }
    setCollider(owner: ICollider): void {
        throw new Error("Method not implemented.");
    }
    setConnectedCollider(owner: ICollider): void {
        throw new Error("Method not implemented.");
    }
    setLocalPos(pos: Vector3): void {
        throw new Error("Method not implemented.");
    }
    setConnectLocalPos(pos: Vector3): void {
        throw new Error("Method not implemented.");
    }
    getlinearForce(): Vector3 {
        throw new Error("Method not implemented.");
    }
    getAngularForce(): Vector3 {
        throw new Error("Method not implemented.");
    }
    isValid(): boolean {
        throw new Error("Method not implemented.");
    }
    isEnable(value: boolean): void {
        throw new Error("Method not implemented.");
    }

    private initJoint() {
        let bt = btPhysicsCreateUtil._bt;
        this._breakForce = -1;
        this._breakTorque = -1;
        this._btTempVector30 = bt.btVector3_create(0, 0, 0);
        this._btTempVector31 = bt.btVector3_create(0, 0, 0);
        this._btTempTrans0 = bt.btTransform_create();
        this._btTempTrans1 = bt.btTransform_create();
        bt.btTransform_setIdentity(this._btTempTrans0);
        bt.btTransform_setIdentity(this._btTempTrans1);
        bt.btTransform_setOrigin(this._btTempTrans0, this._btTempVector30);
        bt.btTransform_setOrigin(this._btTempTrans1, this._btTempVector31);
    }

    setOwner(owner: Sprite3D) {
        this.owner = owner;
    }


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
     * 获取bt回调参数
     */
    _btFeedBackInfo() {
        var bt = btPhysicsCreateUtil._bt;
        var applyForce: number = bt.btJointFeedback_getAppliedForceBodyA(this._btJointFeedBackObj);
        var applyTorque: number = bt.btJointFeedback_getAppliedTorqueBodyA(this._btJointFeedBackObj);
        this._currentTorque.setValue(bt.btVector3_x(applyTorque), bt.btVector3_y(applyTorque), bt.btVector3_z(applyTorque));
        this._currentForce.setValue(bt.btVector3_x(applyForce), bt.btVector3_y(applyForce), bt.btVector3_z(applyForce));
        this._getJointFeedBack = true;
    }

    

    setConnectedAnchor(ownerValue: Vector3, otherValue: Vector3): void {
        this._anchor = ownerValue;
        this._connectAnchor = otherValue;
        let bt = btPhysicsCreateUtil._bt;
        btPhysicsManager._convertToBulletVec3(this._anchor, this._btTempVector30);
        btPhysicsManager._convertToBulletVec3(this._connectAnchor, this._btTempVector31);
        bt.btTransform_setOrigin(this._btTempTrans0, this._btTempVector30);
        bt.btTransform_setOrigin(this._btTempTrans1, this._btTempVector31);
    }
    setConnectedMassScale(value: number): void {
        throw new Error("Method not implemented.");
    }
    setConnectedInertiaScale(value: number): void {
        throw new Error("Method not implemented.");
    }
    setMassScale(value: number): void {
        throw new Error("Method not implemented.");
    }
    setInertiaScale(value: number): void {
        throw new Error("Method not implemented.");
    }
    setBreakForce(value: number): void {
        this._breakForce = value;
    }
    setBreakTorque(value: number): void {
        this._breakTorque = value;
    }

}