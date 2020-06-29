import { CannonColliderShape } from "../physicsCannon/shape/CannonColliderShape";
import { CannonPhysicsComponent } from "../physicsCannon/CannonPhysicsComponent";
import { CannonPhysicsSimulation } from "../physicsCannon/CannonPhysicsSimulation";
import { CannonBoxColliderShape } from "../physicsCannon/shape/CannonBoxColliderShape";
import { CannonRigidbody3D } from "../physicsCannon/CannonRigidbody3D";
import { StaticPlaneColliderShape } from "./shape/StaticPlaneColliderShape";
import { ColliderShape } from "./shape/ColliderShape";
import { CompoundColliderShape } from "./shape/CompoundColliderShape";
import { PhysicsComponent } from "./PhysicsComponent";
import { PhysicsSimulation } from "./PhysicsSimulation";
import { BoxColliderShape } from "./shape/BoxColliderShape";
import { CylinderColliderShape } from "./shape/CylinderColliderShape";
import { CharacterController } from "./CharacterController";
import { Rigidbody3D } from "./Rigidbody3D";

export class Physics3D {
    /**@internal */
    static _bullet: any = null;
    /**@internal */
    static _cannon:any = null;
    /**@internal */
    static _enablePhysics: Boolean = false;

    /**@internal */
    static __bulletinit__(){
        this._bullet = (window as any).Physics3D;
        if(this._bullet){
            StaticPlaneColliderShape.__init__();
            ColliderShape.__init__();
            CompoundColliderShape.__init__();
            PhysicsComponent.__init__();
            PhysicsSimulation.__init__();
            BoxColliderShape.__init__();
            CylinderColliderShape.__init__();
            CharacterController.__init__();
            Rigidbody3D.__init__();
        }   
    }

    static __cannoninit__(){
        this._cannon = window.CANNON;
        if(!this._cannon)
            return;
        CannonColliderShape.__init__();
        CannonPhysicsComponent.__init__();
        CannonPhysicsSimulation.__init__();
        CannonBoxColliderShape.__init__();
        CannonRigidbody3D.__init__();
    }

}