import { IStaticCollider } from "../../interface/IStaticCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { btCollider, btColliderType } from "./btCollider";

export class btStaticCollider extends btCollider implements IStaticCollider {
    protected _initCollider(){
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

    /**@internal */
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

    protected getColliderType(): btColliderType{
        return btColliderType.StaticCollider;
    }


    constructor(physicsManager: btPhysicsManager) {
        super(physicsManager);
        this._enableProcessCollisions = false;
    }
}