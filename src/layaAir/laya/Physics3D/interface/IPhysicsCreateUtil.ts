import { PhysicsSettings } from "../../d3/physics/PhysicsSettings";
import { Mesh } from "../../d3/resource/models/Mesh";
import { EPhysicsCapable } from "../physicsEnum/EPhycisCapable";
import { ICharacterController } from "./ICharacterController";
import { IDynamicCollider } from "./IDynamicCollider";
import { IPhysicsManager } from "./IPhysicsManager";
import { IStaticCollider } from "./IStaticCollider";
import { ID6Joint } from "./Joint/ID6Joint";
import { IFixedJoint } from "./Joint/IFixedJoint";
import { IHingeJoint } from "./Joint/IHingeJoint";
import { ISpringJoint } from "./Joint/ISpringJoint";
import { IBoxColliderShape } from "./Shape/IBoxColliderShape";
import { ICapsuleColliderShape } from "./Shape/ICapsuleColliderShape";
import { IConeColliderShape } from "./Shape/IConeColliderShape";
import { ICylinderColliderShape } from "./Shape/ICylinderColliderShape";
import { IHeightFieldShape } from "./Shape/IHeightFieldShape";
import { IMeshColliderShape } from "./Shape/IMeshColliderShape";
import { IPlaneColliderShape } from "./Shape/IPlaneColliderShape";
import { ISphereColliderShape } from "./Shape/ISphereColliderShape";

/**
 * @en Interface for physics creation utility.
 * @zh 物理创建工具接口。
 */
export interface IPhysicsCreateUtil {
    /**
     * @en Initialize the physics system.
     * @zh 初始化物理。
     */
    initialize(): Promise<void>;

    /**
     * @en Set the physics engine capabilities.
     * @zh 设置物理引擎能力。
     */
    initPhysicsCapable(): void;

    /**
     * @en Get the physics engine capability.
     * @param value The capability to check.
     * @zh 获取物理引擎能力。
     * @param value 要检查的能力。
     */
    getPhysicsCapable(value: EPhysicsCapable): boolean;

    /**
     * @en Create a physics manager.
     * @param physicsSettings The physics settings.
     * @zh 创建物理管理器。
     * @param physicsSettings 物理设置。
     */
    createPhysicsManger(physicsSettings: PhysicsSettings): IPhysicsManager;

    /**
     * @en Create a dynamic collider.
     * @param manager The physics manager.
     * @zh 创建动态碰撞体。
     * @param manager 物理管理器。
     */
    createDynamicCollider(manager: IPhysicsManager): IDynamicCollider;

    /**
     * @en Create a static collider.
     * @param manager The physics manager.
     * @zh 创建静态碰撞体。
     * @param manager 物理管理器。
     */
    createStaticCollider(manager: IPhysicsManager): IStaticCollider;

    /**
     * @en Create a character controller.
     * @param manager The physics manager.
     * @zh 创建角色碰撞器。
     * @param manager 物理管理器。
     */
    createCharacterController(manager: IPhysicsManager): ICharacterController;

    //joint module
    /**
     * @en Create fixed joint.
     * @param manager The physics manager.
     * @zh 创建固定关节。
     * @param manager 物理管理器。
     */
    createFixedJoint(manager: IPhysicsManager): IFixedJoint;

    /**
     * @en Create hinge joint.
     * @param manager The physics manager.
     * @zh 创建铰链关节。
     * @param manager 物理管理器。
     */
    createHingeJoint(manager: IPhysicsManager): IHingeJoint;

    /**
     * @en Create spring joint.
     * @param manager The physics manager.
     * @zh 创建弹簧关节。
     * @param manager 物理管理器。
     */
    createSpringJoint(manager: IPhysicsManager): ISpringJoint;

    /**
     * @en Create Custom Joint.
     * @param manager The physics manager.
     * @zh 创建自定义关节。
     * @param manager 物理管理器。
     */
    createD6Joint(manager: IPhysicsManager): ID6Joint;

    //Shape
    /**
     * @en Create box collider shape.
     * @zh 创建盒形碰撞器形状。
     */
    createBoxColliderShape(): IBoxColliderShape;

    /**
     * @en Create sphere collider shape.
     * @zh 创建球形碰撞器形状。
     */
    createSphereColliderShape(): ISphereColliderShape;

    /**
     * @en Create plane collider shape.
     * @zh 创建平面碰撞器形状。
     */
    createPlaneColliderShape(): IPlaneColliderShape;

    /**
     * @en Create capsule collider shape.
     * @zh 创建胶囊碰撞器形状。
     */
    createCapsuleColliderShape?(): ICapsuleColliderShape;

    /**
     * @en Create mesh collider shape.
     * @zh 创建网格碰撞器形状。
     */
    createMeshColliderShape?(): IMeshColliderShape;

    /**
     * @en Create cylinder collider shape.
     * @zh 创建圆柱碰撞器形状。
     */
    createCylinderColliderShape?(): ICylinderColliderShape;

    /**
     * @en Create cone collider shape.
     * @zh 创建圆锥碰撞器形状。
     */
    createConeColliderShape?(): IConeColliderShape;

    /**
     * @en Create height field shape.
     * @zh 创建高度场形状。
     */
    createHeightFieldShape?(): IHeightFieldShape;


    /**
     * @en Create curve mesh.
     * @param mesh The input mesh.
     * @zh 创建曲线网格。
     * @param mesh 输入的网格。
     */
    createCorveMesh?(mesh: Mesh): Mesh;
}