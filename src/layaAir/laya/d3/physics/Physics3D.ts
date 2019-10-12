import { Rigidbody3D } from "./Rigidbody3D";
import { PhysicsComponent } from "./PhysicsComponent";

export class Physics3D {
    /**@internal */
    static _bullet: any = null;
    /**@internal */
    static _enablePhysics: Boolean = false;
    /**@internal */
    static _interactive: object = {
        "getWorldTransform": (rigidBodyID: number, worldTransPointer: number) => { },
        "setWorldTransform": (rigidBodyID: number, worldTransPointer: number) => {
            var rigidBody: Rigidbody3D = PhysicsComponent._physicObjectsMap[rigidBodyID];
            rigidBody._simulation._updatedRigidbodies++;
            rigidBody._updateTransformComponent(worldTransPointer);
        }
    };
}