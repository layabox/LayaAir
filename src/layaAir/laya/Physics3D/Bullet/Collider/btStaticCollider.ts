import { Vector3 } from "../../../maths/Vector3";
import { IStaticCollider } from "../../interface/IStaticCollider";
import { EStaticCapable } from "../../physicsEnum/EStaticCapable";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { btCollider, btColliderType } from "./btCollider";

export class btStaticCollider extends btCollider implements IStaticCollider {

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


    constructor(physicsManager: btPhysicsManager) {
        super(physicsManager);
        this._enableProcessCollisions = false;
        this.initCapable();
    }


    getCapable(value: EStaticCapable): boolean {
        return this._physicsCapableMap.get(value);
    }

    initCapable(): void {
        this._physicsCapableMap = new Map();
        this._physicsCapableMap.set(EStaticCapable.Static_AllowSleep, false);
        this._physicsCapableMap.set(EStaticCapable.Static_AllowTrigger, true);
        this._physicsCapableMap.set(EStaticCapable.Static_CollisionGroup, true);
        this._physicsCapableMap.set(EStaticCapable.Static_Friction, true);
        this._physicsCapableMap.set(EStaticCapable.Static_Restitution, true);
        this._physicsCapableMap.set(EStaticCapable.Static_RollingFriction, true);
        this._physicsCapableMap.set(EStaticCapable.Static_BoxColliderShape, true);
        this._physicsCapableMap.set(EStaticCapable.Static_SphereColliderShape, true);
        this._physicsCapableMap.set(EStaticCapable.Static_PlaneColliderShape, true);
        this._physicsCapableMap.set(EStaticCapable.Static_CapsuleColliderShape, true);
        this._physicsCapableMap.set(EStaticCapable.Static_CylinderColliderShape, true);
        this._physicsCapableMap.set(EStaticCapable.Static_ConeColliderShape, true);
        this._physicsCapableMap.set(EStaticCapable.Static_MeshColliderShape, true);
        this._physicsCapableMap.set(EStaticCapable.Static_CompoundColliderShape, true);
    }

    setWorldPosition(value: Vector3): void {
        let bt = btPhysicsCreateUtil._bt;
        var btColliderObject = this._btCollider;
        bt.btRigidBody_setCenterOfMassPos(btColliderObject, value.x, value.y, value.z);
    }

}