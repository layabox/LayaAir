import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IJoint } from "../../interface/Joint/IJoint";
import { pxCollider } from "../Collider/pxCollider";
import { pxPhysicsManager } from "../pxPhysicsManager";

/**
 * joint flag
 */
export enum PxConstraintFlag {
    eBROKEN = 1 << 0,		//!< whether the constraint is broken
    ePROJECT_TO_ACTOR0 = 1 << 1,		//!< @deprecated whether actor1 should get projected to actor0 for this constraint (note: projection of a static/kinematic actor to a dynamic actor will be ignored)
    ePROJECT_TO_ACTOR1 = 1 << 2,		//!< @deprecated whether actor0 should get projected to actor1 for this constraint (note: projection of a static/kinematic actor to a dynamic actor will be ignored)
    ePROJECTION = ePROJECT_TO_ACTOR0 | ePROJECT_TO_ACTOR1,	//!< @deprecated whether the actors should get projected for this constraint (the direction will be chosen by PhysX)
    eCOLLISION_ENABLED = 1 << 3,		//!< whether contacts should be generated between the objects this constraint constrains
    eVISUALIZATION = 1 << 4,		//!< whether this constraint should be visualized, if constraint visualization is turned on
    eDRIVE_LIMITS_ARE_FORCES = 1 << 5,		//!< limits for drive strength are forces rather than impulses
    eIMPROVED_SLERP = 1 << 7,		//!< perform preprocessing for improved accuracy on D6 Slerp Drive (this flag will be removed in a future release when preprocessing is no longer required)
    eDISABLE_PREPROCESSING = 1 << 8,		//!< suppress constraint preprocessing, intended for use with rowResponseThreshold. May result in worse solver accuracy for ill-conditioned constraints.
    eENABLE_EXTENDED_LIMITS = 1 << 9,		//!< enables extended limit ranges for angular limits (e.g., limit values > PxPi or < -PxPi)
    eGPU_COMPATIBLE = 1 << 10,	//!< the constraint type is supported by gpu dynamics
    eALWAYS_UPDATE = 1 << 11,	//!< updates the constraint each frame
    eDISABLE_CONSTRAINT = 1 << 12		//!< disables the constraint. SolverPrep functions won't be called for this constraint.
};

export class pxJoint implements IJoint {

    /**@internal */
    static _ActorPool: Map<number, pxJoint> = new Map();

    /**@internal */
    static _pxJointID: number = 0;

    /**@interanl */
    static _tempTransform0: {
        translation: Vector3;
        rotation: Quaternion;
    } = { translation: new Vector3(), rotation: new Quaternion() };

    /**@internal */
    static _tempTransform1: {
        translation: Vector3;
        rotation: Quaternion;
    } = { translation: new Vector3(), rotation: new Quaternion() };

    /**@internal */
    protected _pxJoint: any;

    /**@internal */
    protected _collider: pxCollider;

    /**@internal */
    protected _localPos: Vector3;

    /**@internal */
    protected _connectCollider: pxCollider;

    /**@internal */
    protected _connectlocalPos: Vector3;

    /**@internal */
    protected _breakForce: number = Number.MAX_VALUE;

    /**@internal */
    protected _breakTorque: number = Number.MAX_VALUE;

    /**@internal */
    protected _id: number;

    /**@internal */
    protected _linearForce: Vector3;

    /**@internal */
    protected _angularForce: Vector3;

    /**
     * @internal
     */
    owner: Sprite3D;

    /**@internal */
    _physicsManager: pxPhysicsManager;

    /**
     * @param manager 
     */
    constructor(manager: pxPhysicsManager) {
        this._physicsManager = manager;
        this._id = pxJoint._pxJointID++;
        this._localPos = new Vector3();
        this._connectlocalPos = new Vector3();
        this._linearForce = new Vector3();
        this._angularForce = new Vector3();
    }

    /**@internal */
    isEnable(value: boolean): void {
        this._pxJoint && this._pxJoint.setConstraintFlag(PxConstraintFlag.eDISABLE_CONSTRAINT, !value);
    }

    //actor0 & actor1 whether collision enable
    /**@internal */
    isCollision(value: boolean): void {
        this._pxJoint && this._pxJoint.setConstraintFlag(PxConstraintFlag.eCOLLISION_ENABLED, value);
    }

    //Disabling preprocessing helps to stabilize impossible-to-fulfil configurations.
    /**@internal */
    isPreprocessiong(value: boolean): void {
        this._pxJoint && this._pxJoint.setConstraintFlag(PxConstraintFlag.eDISABLE_PREPROCESSING, value);
    }

    /**@internal */
    protected _createJoint() {

    }

    /**@internal */
    setOwner(value: Sprite3D): void {
        this.owner = value;
        pxJoint._ActorPool.set(this._id, this);
        this._collider && this._connectCollider && this._createJoint();
    }

    /**@internal */
    protected _setActor() {
        if (this._pxJoint) {
            this._pxJoint.setActors(this._collider._pxActor || null, this._connectCollider._pxActor || null);
        } else {
            this._collider && this._connectCollider && this._createJoint();
        }
    }

    /**@internal */
    setCollider(owner: pxCollider): void {
        if (owner == this._collider)
            return;
        this._collider = owner;
        this._setActor();
    }

    /**@internal */
    setConnectedCollider(owner: pxCollider): void {
        if (owner == this._connectCollider)
            return;
        this._connectCollider = owner;
        this._setActor();
    }

    /**@internal */
    protected _setLocalPose(actor: number, position: Vector3): void {
        this._pxJoint && this._pxJoint.setLocalPose(actor, position, Quaternion.DEFAULT);
    }

    /**@internal */
    setLocalPos(value: Vector3): void {
        value && value.cloneTo(this._localPos);
        this._pxJoint && this._setLocalPose(0, this._localPos);
    }

    /**@internal */
    setConnectLocalPos(value: Vector3): void {
        value && value.cloneTo(this._connectlocalPos);
        this._setLocalPose(1, this._connectlocalPos);
    }

    /**@internal */
    setConnectedMassScale(value: number): void {
        this._pxJoint && this._pxJoint.setInvMassScale0(1 / value);
    }

    /**@internal */
    setConnectedInertiaScale(value: number): void {
        this._pxJoint && this._pxJoint.setInvInertiaScale0(1 / value);
    }

    /**@internal */
    setMassScale(value: number): void {
        this._pxJoint && this._pxJoint.setInvMassScale1(1 / value);
    }

    /**@internal */
    setInertiaScale(value: number): void {
        this._pxJoint && this._pxJoint.setInvInertiaScale1(1 / value);
    }

    /**@internal */
    setBreakForce(value: number): void {
        this._breakForce = value;
        this._pxJoint && this._pxJoint.setBreakForce(this._breakForce, this._breakTorque);
    }

    /**@internal */
    setBreakTorque(value: number): void {
        this._breakTorque = value;
        this._pxJoint && this._pxJoint.setBreakForce(this._breakForce, this._breakTorque);
    }

    /**@internal */
    getlinearForce(): Vector3 {
        const v3 = this._pxJoint.getlinearForce();
        this._linearForce.set(v3.x, v3.y, v3.z);
        return this._linearForce;
    }

    /**@internal */
    getAngularForce(): Vector3 {
        const v3 = this._pxJoint.getAngularForce();
        this._linearForce.set(v3.x, v3.y, v3.z);
        return this._linearForce;
    }

    /**@internal */
    isValid(): boolean {
        return this._pxJoint.isValid()
    }

    /**@internal */
    release() {

    }

}