import { PhysicsSettings } from "../../d3/physics/PhysicsSettings";
import { EPhysicsCapable } from "../physicsEnum/EPhycisCapable";
import { ICharacterController } from "./ICharacterController";
import { IDynamicCollider } from "./IDynamicCollider";
import { IPhysicsManager } from "./IPhysicsManager";
import { IStaticCollider } from "./IStaticCollider";
import { ICustomJoint } from "./Joint/ICustomJoint";
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
     * @param collider - Affector of joint
     */
    createFixedJoint(manager: IPhysicsManager): IFixedJoint;

    /**
     * Create hinge joint.
     * @param collider - Affector of joint
     */
    createHingeJoint(manager: IPhysicsManager): IHingeJoint;

    /**
     * Create spring joint
     * @param collider - Affector of joint
     */
    createSpringJoint(manager: IPhysicsManager): ISpringJoint;

    /**
     * Create Custom Joint
     */
    createD6Joint(manager: IPhysicsManager): ID6Joint;

    //Shape
    /**
     * Create box collider shape.
     * @param uniqueID - Shape unique id
     * @param size - Size of the box
     * @param material - The material of this shape
     */
    createBoxColliderShape(): IBoxColliderShape;

    /**
     * Create sphere collider shape.
     * @param uniqueID - Shape unique id
     * @param radius - Radius of the sphere
     * @param material - The material of this shape
     */
    createSphereColliderShape(): ISphereColliderShape;

    /**
     * Create plane collider shape.
     * @param uniqueID - Shape unique id
     * @param material - The material of this shape
     */
    createPlaneColliderShape(): IPlaneColliderShape;

    /**
     * Create capsule collider shape.
     * @param uniqueID - Shape unique id
     * @param radius - Radius of capsule
     * @param height - Height of capsule
     * @param material - The material of this shape
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
}