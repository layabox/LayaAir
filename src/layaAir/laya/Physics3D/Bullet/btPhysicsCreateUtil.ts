import { Config3D } from "../../../Config3D";
import { Laya3D } from "../../../Laya3D";
import { VertexMesh } from "../../RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { PhysicsSettings } from "../../d3/physics/PhysicsSettings";
import { Mesh } from "../../d3/resource/models/Mesh";
import { PrimitiveMesh } from "../../d3/resource/models/PrimitiveMesh";
import { IPhysicsCreateUtil } from "../interface/IPhysicsCreateUtil";
import { ID6Joint } from "../interface/Joint/ID6Joint";
import { IHingeJoint } from "../interface/Joint/IHingeJoint";
import { IPlaneColliderShape } from "../interface/Shape/IPlaneColliderShape";
import { EPhysicsCapable } from "../physicsEnum/EPhycisCapable";
import { btCharacterCollider } from "./Collider/btCharacterCollider";
import { btCollider } from "./Collider/btCollider";
import { btRigidBodyCollider } from "./Collider/btRigidBodyCollider";
import { btStaticCollider } from "./Collider/btStaticCollider";
import { btCustomJoint } from "./Joint/btCustomJoint";
import { btFixedJoint } from "./Joint/btFixedJoint";
import { btHingeJoint } from "./Joint/btHingeJoint";
import { btSpringJoint } from "./Joint/btSpringJoint";
import { btBoxColliderShape } from "./Shape/btBoxColliderShape";
import { btCapsuleColliderShape } from "./Shape/btCapsuleColliderShape";
import { btConeColliderShape } from "./Shape/btConeColliderShape";
import { btCylinderColliderShape } from "./Shape/btCylinderColliderShape";
import { btMeshColliderShape } from "./Shape/btMeshColliderShape";
import { btSphereColliderShape } from "./Shape/btSphereColliderShape";
import { BulletInteractive } from "./btInteractive";
import { btPhysicsManager } from "./btPhysicsManager";

export class btPhysicsCreateUtil implements IPhysicsCreateUtil {
    // capable map
    protected _physicsEngineCapableMap: Map<any, any>;

    initPhysicsCapable(): void {

        this._physicsEngineCapableMap = new Map();
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_Gravity, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_StaticCollider, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_DynamicCollider, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CharacterCollider, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_BoxColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_SphereColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CapsuleColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CylinderColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_ConeColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_MeshColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CompoundColliderShape, false);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_Joint, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_D6Joint, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_FixedJoint, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_SpringJoint, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_HingeJoint, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CreateCorveMesh, true);
    }

    getPhysicsCapable(value: EPhysicsCapable): boolean {
        return this._physicsEngineCapableMap.get(value);
    }

    /**@internal */
    static _bt: any;
    //Bullet init
    initialize(): Promise<void> {
        let physics3D: Function = (window as any).Physics3D;
        physics3D(Math.max(16, Config3D.defaultPhysicsMemory) * 16, new BulletInteractive(null, null)).then(() => {
            btPhysicsCreateUtil._bt = (window as any).Physics3D;
            this.initPhysicsCapable();
            btPhysicsManager.init();
            btCollider.__init__();
            btRigidBodyCollider.__init__();
            btStaticCollider.__init__();
            btCharacterCollider.__init__();
            btMeshColliderShape.__init__();
            return Promise.resolve();
        }
        );

        return Promise.resolve();
    }



    createPhysicsManger(physicsSettings: PhysicsSettings): btPhysicsManager {
        return new btPhysicsManager(physicsSettings);
    }

    createDynamicCollider(manager: btPhysicsManager): btRigidBodyCollider {
        return new btRigidBodyCollider(manager);
    }

    createStaticCollider(manager: btPhysicsManager): btStaticCollider {
        return new btStaticCollider(manager);
    }

    createCharacterController(manager: btPhysicsManager): btCharacterCollider {
        return new btCharacterCollider(manager);
    }

    createFixedJoint(manager: btPhysicsManager): btFixedJoint {
        return new btFixedJoint(manager);
    }

    createHingeJoint(manager: btPhysicsManager): IHingeJoint {
        return new btHingeJoint(manager);
    }

    createSpringJoint(manager: btPhysicsManager): btSpringJoint {
        return new btSpringJoint(manager);
    }

    createD6Joint(manager: btPhysicsManager): ID6Joint {
        return new btCustomJoint(manager);
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

    createMeshColliderShape(): btMeshColliderShape {
        return new btMeshColliderShape();
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

    createCorveMesh(mesh: Mesh): Mesh {
        if (mesh._convexMesh == null) {
            return null;
        }
        let bt = btPhysicsCreateUtil._bt;
        if ((<any>mesh).__convexMesh == null) {
            let convexMesh = mesh._convexMesh;
            let vertexCount = bt.btShapeHull_numVertices(convexMesh);
            let indexCount = bt.btShapeHull_numIndices(convexMesh);
            var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION");
            var vertexFloatStride: number = vertexDeclaration.vertexStride / 4;
            var vertice: Float32Array = new Float32Array(vertexCount * vertexFloatStride);
            let triangles: number[] = []
            for (var i = 0; i < vertexCount; i++) {
                let index = i * 3;
                let vector3 = bt.btShapeHull_getVertexPointer(convexMesh, i);
                vertice[index] = bt.btVector3_x(vector3);
                vertice[index + 1] = bt.btVector3_y(vector3);
                vertice[index + 2] = bt.btVector3_z(vector3);
            }
            for (var i = 0; i < indexCount; i++) {
                triangles.push(bt.btShapeHull_getIndexPointer(convexMesh, i));
            }
            (<any>mesh).__convexMesh = PrimitiveMesh._createMesh(vertexDeclaration, vertice, new Uint16Array(triangles));
        }
        return (<any>mesh).__convexMesh;

    }
}


Laya3D.PhysicsCreateUtil = new btPhysicsCreateUtil();