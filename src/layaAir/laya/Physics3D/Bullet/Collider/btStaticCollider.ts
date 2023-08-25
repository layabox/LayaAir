import { Vector3 } from "../../../maths/Vector3";
import { IStaticCollider } from "../../interface/IStaticCollider";
import { EColliderCapable } from "../../physicsEnum/EColliderCapable";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { btCollider, btColliderType } from "./btCollider";

export class btStaticCollider extends btCollider implements IStaticCollider {
    /**@internal */
    static _staticCapableMap: Map<any, any>;
    /**@internal */
    componentEnable: boolean;
    /**
     * @internal
     */
    static __init__(): void {
        btStaticCollider.initCapable();
    }

    protected _initCollider() {
        let bt = btPhysicsCreateUtil._bt;
        var btColObj: number = bt.btCollisionObject_create();
        bt.btCollisionObject_setUserIndex(btColObj, this._id);
        bt.btCollisionObject_forceActivationState(btColObj, btPhysicsManager.ACTIVATIONSTATE_DISABLE_SIMULATION);//prevent simulation

        var flags: number = bt.btCollisionObject_getCollisionFlags(btColObj);
        if ((this.owner).isStatic) {//TODO:
            if ((flags & btPhysicsManager.COLLISIONFLAGS_KINEMATIC_OBJECT) > 0)
                flags = flags ^ btPhysicsManager.COLLISIONFLAGS_KINEMATIC_OBJECT;
            flags = flags | btPhysicsManager.COLLISIONFLAGS_STATIC_OBJECT;
        } else {
            if ((flags & btPhysicsManager.COLLISIONFLAGS_STATIC_OBJECT) > 0)
                flags = flags ^ btPhysicsManager.COLLISIONFLAGS_STATIC_OBJECT;
            flags = flags | btPhysicsManager.COLLISIONFLAGS_KINEMATIC_OBJECT;
        }
        bt.btCollisionObject_setCollisionFlags(btColObj, flags);
        this._btCollider = btColObj;
    }

    setTrigger(value: boolean): void {
        this._isTrigger = value;
        this._enableProcessCollisions = !this._isTrigger;
        let bt = btPhysicsCreateUtil._bt;
        if (this._btCollider) {
            var flags: number = bt.btCollisionObject_getCollisionFlags(this._btCollider);
            if (value) {
                if ((flags & btPhysicsManager.COLLISIONFLAGS_NO_CONTACT_RESPONSE) === 0)
                    bt.btCollisionObject_setCollisionFlags(this._btCollider, flags | btPhysicsManager.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
            } else {
                if ((flags & btPhysicsManager.COLLISIONFLAGS_NO_CONTACT_RESPONSE) !== 0)
                    bt.btCollisionObject_setCollisionFlags(this._btCollider, flags ^ btPhysicsManager.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
            }
        }
    }

    protected getColliderType(): btColliderType {
        return btColliderType.StaticCollider;
    }

    getCapable(value: number): boolean {
        return btStaticCollider.getStaticColliderCapable(value);
    }

    constructor(physicsManager: btPhysicsManager) {
        super(physicsManager);
        this._enableProcessCollisions = !this._isTrigger;
    }


    static getStaticColliderCapable(value: EColliderCapable): boolean {
        return this._staticCapableMap.get(value);
    }

    static initCapable(): void {
        this._staticCapableMap = new Map();
        this._staticCapableMap.set(EColliderCapable.Collider_AllowTrigger, true);
        this._staticCapableMap.set(EColliderCapable.Collider_CollisionGroup, true);
        this._staticCapableMap.set(EColliderCapable.Collider_Friction, true);
        this._staticCapableMap.set(EColliderCapable.Collider_Restitution, true);
        this._staticCapableMap.set(EColliderCapable.Collider_RollingFriction, true);
        this._staticCapableMap.set(EColliderCapable.Collider_DynamicFriction, true);
        this._staticCapableMap.set(EColliderCapable.Collider_StaticFriction, true);
        this._staticCapableMap.set(EColliderCapable.Collider_BounceCombine, true);
        this._staticCapableMap.set(EColliderCapable.Collider_FrictionCombine, true);
    }

    setWorldPosition(value: Vector3): void {
        let bt = btPhysicsCreateUtil._bt;
        var btColliderObject = this._btCollider;
        bt.btRigidBody_setCenterOfMassPos(btColliderObject, value.x, value.y, value.z);
    }

}