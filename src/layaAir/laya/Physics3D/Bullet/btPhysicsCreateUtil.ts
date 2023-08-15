import { Config3D } from "../../../Config3D";
import { PhysicsSettings } from "../../d3/physics/PhysicsSettings";
import { IPhysicsCreateUtil } from "../interface/IPhysicsCreateUtil";
import { ICustomJoint } from "../interface/Joint/ICustomJoint";
import { IFixedJoint } from "../interface/Joint/IFixedJoint";
import { IHingeJoint } from "../interface/Joint/IHingeJoint";
import { ISpringJoint } from "../interface/Joint/ISpringJoint";
import { IMeshColliderShape } from "../interface/Shape/IMeshColliderShape";
import { IPlaneColliderShape } from "../interface/Shape/IPlaneColliderShape";
import { btCharacterCollider } from "./Collider/btCharacterCollider";
import { btRigidBodyCollider } from "./Collider/btRigidBodyCollider";
import { btStaticCollider } from "./Collider/btStaticCollider";
import { btBoxColliderShape } from "./Shape/btBoxColliderShape";
import { btCapsuleColliderShape } from "./Shape/btCapsuleColliderShape";
import { btConeColliderShape } from "./Shape/btConeColliderShape";
import { btCylinderColliderShape } from "./Shape/btCylinderColliderShape";
import { btSphereColliderShape } from "./Shape/btSphereColliderShape";
import { BulletInteractive } from "./btInteractive";
import { btPhysicsManager } from "./btPhysicsManager";

export class btPhysicsCreateUtil implements IPhysicsCreateUtil {

    /**@internal */
    static _bt: any;
    //Bullet init
    initialize(): Promise<void> {
        let physics3D: Function = (window as any).Physics3D;
        physics3D(Math.max(16, Config3D.defaultPhysicsMemory) * 16, new BulletInteractive(null, null)).then(() => {
            //     StaticPlaneColliderShape.__init__();
            // ColliderShape.__init__();
            // CompoundColliderShape.__init__();
            // PhysicsComponent.__init__();
            // PhysicsSimulation.__init__();
            // BoxColliderShape.__init__();
            // CylinderColliderShape.__init__();
            // CharacterController.__init__();
            // Rigidbody3D.__init__();
            btPhysicsCreateUtil._bt = (window as any).Physics3D;
            return Promise.resolve();
        }
        );

        return Promise.resolve();
    }

    createPhysicsManger(physicsSettings: PhysicsSettings): btPhysicsManager {
        return new btPhysicsManager(physicsSettings);
    }


    createDynamicCollider(manager:btPhysicsManager): btRigidBodyCollider {
        return new btRigidBodyCollider(manager);
    }

    createStaticCollider(manager:btPhysicsManager): btStaticCollider {
        return new btStaticCollider(manager);
    }

    createCharacterController(manager:btPhysicsManager): btCharacterCollider {
        return new btCharacterCollider(manager);
    }

    createFixedJoint(manager:btPhysicsManager): IFixedJoint {
        throw new Error("Method not implemented.");
    }

    createHingeJoint(manager:btPhysicsManager): IHingeJoint {
        throw new Error("Method not implemented.");
    }

    createSpringJoint(manager:btPhysicsManager): ISpringJoint {
        throw new Error("Method not implemented.");
    }

    createCustomJoint(manager:btPhysicsManager): ICustomJoint {
        throw new Error("Method not implemented.");
    }

    createBoxColliderShape(): btBoxColliderShape {
        return new btBoxColliderShape();
    }

    createSphereColliderShape(): btSphereColliderShape {
        return new btSphereColliderShape()
    }

    createCapsuleColliderShape(): btCapsuleColliderShape {
        return new btCapsuleColliderShape();
    }

    createMeshColliderShape(): IMeshColliderShape {
        throw new Error("Method not implemented.");
    }

    createPlaneColliderShape(): IPlaneColliderShape {
        throw new Error("Method not implemented.");
    }

    createCylinderColliderShape(): btCylinderColliderShape {
        return new btCylinderColliderShape();
    }

    createConeColliderShape(): btConeColliderShape {
        return new btConeColliderShape();
    }
}