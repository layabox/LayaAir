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

export interface IPhysicsCreateUtil {
    /**
     * 初始化物理
     */
    initialize(): Promise<void>;

    /**
     * set PhysicsEngine Capable
     */
    initPhysicsCapable(): void;

    /**
     * get PhysicsEngine Capable
     * @param value 
     */
    getPhysicsCapable(value: EPhysicsCapable): boolean;

    /**
     * 创建物理管理类
     */
    createPhysicsManger(physicsSettings: PhysicsSettings): IPhysicsManager;

    /**
     * 创建动态碰撞体
     */
    createDynamicCollider(manager: IPhysicsManager): IDynamicCollider;

    /**
     * 创建静态碰撞体
     */
    createStaticCollider(manager: IPhysicsManager): IStaticCollider;

    /**
     * 创建角色碰撞器
     */
    createCharacterController(manager: IPhysicsManager): ICharacterController;

    //joint module
    /**
     * Create fixed joint.
     */
    createFixedJoint(manager: IPhysicsManager): IFixedJoint;

    /**
     * Create hinge joint.
     */
    createHingeJoint(manager: IPhysicsManager): IHingeJoint;

    /**
     * Create spring joint
     */
    createSpringJoint(manager: IPhysicsManager): ISpringJoint;

    /**
     * Create Custom Joint
     */
    createD6Joint(manager: IPhysicsManager): ID6Joint;

    //Shape
    /**
     * Create box collider shape.
     */
    createBoxColliderShape(): IBoxColliderShape;

    /**
     * Create sphere collider shape.
     */
    createSphereColliderShape(): ISphereColliderShape;

    /**
     * Create plane collider shape.
     */
    createPlaneColliderShape(): IPlaneColliderShape;

    /**
     * Create capsule collider shape.
     */
    createCapsuleColliderShape?(): ICapsuleColliderShape;

    /**
     * create Mesh Collider shape
     */
    createMeshColliderShape?(): IMeshColliderShape;

    /**
     * create Cylinder Collider Shape
     */
    createCylinderColliderShape?(): ICylinderColliderShape;

    /**
     * create Cone Collider Shape
     */
    createConeColliderShape?(): IConeColliderShape;

    /**
     * create Height Field Collider
     */
    createHeightFieldShape?(): IHeightFieldShape;


    /**
     * create Corve Mesh
     */
    createCorveMesh?(mesh: Mesh): Mesh;
}