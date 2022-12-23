import { CharacterController } from "./physics/CharacterController";
import { PhysicsComponent } from "./physics/PhysicsComponent";
import { PhysicsSimulation } from "./physics/PhysicsSimulation";
import { Rigidbody3D } from "./physics/Rigidbody3D";
import { BoxColliderShape } from "./physics/shape/BoxColliderShape";
import { ColliderShape } from "./physics/shape/ColliderShape";
import { CompoundColliderShape } from "./physics/shape/CompoundColliderShape";
import { CylinderColliderShape } from "./physics/shape/CylinderColliderShape";
import { StaticPlaneColliderShape } from "./physics/shape/StaticPlaneColliderShape";


/**
 * Laya物理类
 * internal
 */
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
}