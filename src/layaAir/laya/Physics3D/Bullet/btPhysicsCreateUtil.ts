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
/**
 * @en The `btPhysicsCreateUtil` class is responsible for creating and managing various physics objects and capabilities within the Bullet physics engine.
 * @zh `btPhysicsCreateUtil` 类负责在 Bullet 物理引擎中创建和管理各种物理对象和功能。
 */
export class btPhysicsCreateUtil implements IPhysicsCreateUtil {
    /**
     * @en A map that stores the capabilities of the physics engine.
     * @zh 存储物理引擎功能的映射。
     */
    protected _physicsEngineCapableMap: Map<any, any>;

    /**
     * @en Initializes the physics engine's capabilities, setting up which features are supported.
     * @zh 初始化物理引擎的功能，设置支持的功能项。
     */
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

    /**
     * @en Get the status of a specific physics capability.
     * @param value The physics capability to query.
     * @returns Whether the capability is available.
     * @zh 获取特定物理能力的状态。
     * @param value 要查询的物理能力。
     * @returns 该能力是否可用。
     */
    getPhysicsCapable(value: EPhysicsCapable): boolean {
        return this._physicsEngineCapableMap.get(value);
    }

    /**@internal */
    static _bt: any;
    /**
     * @en Initializes the Bullet physics engine. This includes setting up the physics memory, creating an instance of the Bullet physics engine, and initializing various physics components.
     * @returns A promise that resolves when initialization is complete.
     * @zh 初始化 Bullet 物理引擎。这包括设置物理内存、创建 Bullet 物理引擎实例以及初始化各种物理组件。
     * @returns 当初始化完成时解析的 Promise。
     */
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

    /**
     * @en Creates a new instance of the physics manager with the specified settings.
     * @param physicsSettings The physics settings.
     * @returns A btPhysicsManager instance.
     * @zh 使用指定的设置创建一个新的物理管理器实例。
     * @param physicsSettings 物理设置。
     * @returns btPhysicsManager 实例。
     */
    createPhysicsManger(physicsSettings: PhysicsSettings): btPhysicsManager {
        return new btPhysicsManager(physicsSettings);
    }

    /**
     * @en Create a dynamic collider.
     * @param manager The physics manager.
     * @returns A btRigidBodyCollider instance.
     * @zh 创建动态碰撞器。
     * @param manager 物理管理器。
     * @returns btRigidBodyCollider 实例。
     */
    createDynamicCollider(manager: btPhysicsManager): btRigidBodyCollider {
        return new btRigidBodyCollider(manager);
    }

    /**
     * @en Create a static collider.
     * @param manager The physics manager.
     * @returns A btStaticCollider instance.
     * @zh 创建静态碰撞器。
     * @param manager 物理管理器。
     * @returns btStaticCollider 实例。
     */
    createStaticCollider(manager: btPhysicsManager): btStaticCollider {
        return new btStaticCollider(manager);
    }

    /**
     * @en Create a character controller.
     * @param manager The physics manager.
     * @returns A btCharacterCollider instance.
     * @zh 创建角色控制器。
     * @param manager 物理管理器。
     * @returns btCharacterCollider 实例。
     */
    createCharacterController(manager: btPhysicsManager): btCharacterCollider {
        return new btCharacterCollider(manager);
    }

    /**
     * @en Create a fixed joint.
     * @param manager The physics manager.
     * @returns A btFixedJoint instance.
     * @zh 创建固定关节。
     * @param manager 物理管理器。
     * @returns btFixedJoint 实例。
     */
    createFixedJoint(manager: btPhysicsManager): btFixedJoint {
        return new btFixedJoint(manager);
    }

    /**
     * @en Create a hinge joint.
     * @param manager The physics manager.
     * @returns A btHingeJoint instance.
     * @zh 创建铰链关节。
     * @param manager 物理管理器。
     * @returns btHingeJoint 实例。
     */
    createHingeJoint(manager: btPhysicsManager): IHingeJoint {
        return new btHingeJoint(manager);
    }

    /**
     * @en Create a spring joint.
     * @param manager The physics manager.
     * @returns A btSpringJoint instance.
     * @zh 创建弹簧关节。
     * @param manager 物理管理器。
     * @returns btSpringJoint 实例。
     */
    createSpringJoint(manager: btPhysicsManager): btSpringJoint {
        return new btSpringJoint(manager);
    }

    /**
     * @en Create a D6 (6 degrees of freedom) joint.
     * @param manager The physics manager.
     * @returns A btCustomJoint instance.
     * @zh 创建 D6（6 自由度） 关节。
     * @param manager 物理管理器。
     * @returns btCustomJoint 实例。
     */
    createD6Joint(manager: btPhysicsManager): ID6Joint {
        return new btCustomJoint(manager);
    }

    /**
     * @en Create a box collider shape.
     * @returns A btBoxColliderShape instance.
     * @zh 创建盒型碰撞器形状。
     * @returns btBoxColliderShape 实例。
     */
    createBoxColliderShape(): btBoxColliderShape {
        return new btBoxColliderShape();
    }

    /**
     * @en Create a sphere collider shape.
     * @returns A btSphereColliderShape instance.
     * @zh 创建球形碰撞器形状。
     * @returns btSphereColliderShape 实例。
     */
    createSphereColliderShape(): btSphereColliderShape {
        return new btSphereColliderShape()
    }

    /**
     * @en Create a capsule collider shape.
     * @returns A btCapsuleColliderShape instance.
     * @zh 创建胶囊碰撞器形状。
     * @returns btCapsuleColliderShape 实例。
     */
    createCapsuleColliderShape(): btCapsuleColliderShape {
        return new btCapsuleColliderShape();
    }

    /**
     * @en Create a mesh collider shape.
     * @returns A btMeshColliderShape instance.
     * @zh 创建网格碰撞器形状。
     * @returns btMeshColliderShape 实例。
     */
    createMeshColliderShape(): btMeshColliderShape {
        return new btMeshColliderShape();
    }

    /**
     * @en Create a plane collider shape.
     * @zh 创建平面碰撞器形状。
     */
    createPlaneColliderShape(): IPlaneColliderShape {
        throw new Error("Method not implemented.");
    }

    /**
     * @en Create a cylinder collider shape.
     * @returns A btCylinderColliderShape instance.
     * @zh 创建圆柱碰撞器形状。
     * @returns btCylinderColliderShape 实例。
     */
    createCylinderColliderShape(): btCylinderColliderShape {
        return new btCylinderColliderShape();
    }

    /**
     * @en Create a cone collider shape.
     * @returns A btConeColliderShape instance.
     * @zh 创建圆锥碰撞器形状。
     * @returns btConeColliderShape 实例。
     */
    createConeColliderShape(): btConeColliderShape {
        return new btConeColliderShape();
    }

    /**
     * @en Create a convex mesh from a given mesh.
     * @param mesh The source mesh.
     * @returns The created convex mesh, or null if creation fails.
     * @zh 从给定的网格创建凸包网格。
     * @param mesh 源网格。
     * @returns 创建的凸包网格，如果创建失败则返回 null。
     */
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