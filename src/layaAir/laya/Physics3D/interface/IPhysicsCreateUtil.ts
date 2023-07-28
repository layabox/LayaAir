import { Vector3 } from "../../maths/Vector3";
import { ICharacterController } from "./ICharacterController";
import { IDynamicCollider } from "./IDynamicCollider";
import { IPhysicsManager } from "./IPhysicsManager";
import { IPhysicsMaterial } from "./IPhysicsMaterial";
import { IStaticCollider } from "./IStaticCollider";
import { ICustomJoint } from "./Joint/ICustomJoint";
import { IFixedJoint } from "./Joint/IFixedJoint";
import { IHingeJoint } from "./Joint/IHingeJoint";
import { ISpringJoint } from "./Joint/ISpringJoint";
import { IBoxColliderShape } from "./Shape/IBoxColliderShape";
import { ICapsuleColliderShape } from "./Shape/ICapsuleColliderShape";
import { IMeshColliderShape } from "./Shape/IMeshColliderShape";
import { IPlaneColliderShape } from "./Shape/IPlaneColliderShape";
import { ISphereColliderShape } from "./Shape/ISphereColliderShape";

export interface IPhysicsCreateUtil {
    /**
     * 初始化物理
     */
    initialize(): Promise<void>;

    /**
     * 创建物理管理类
     */
    createPhysicsManger(): IPhysicsManager;

    /**
     * 创建动态碰撞体
     */
    createDynamicCollider(): IDynamicCollider;

    /**
     * 创建静态碰撞体
     */
    createStaticCollider(): IStaticCollider;

    /**
     * 创建角色碰撞器
     */
    createCharacterController(): ICharacterController;

    /**
     * 创建物理材质
     */
    createPhysicsMaterial(): IPhysicsMaterial;

    //joint module
    /**
     * Create fixed joint.
     * @param collider - Affector of joint
     */
    createFixedJoint(): IFixedJoint;

    /**
     * Create hinge joint.
     * @param collider - Affector of joint
     */
    createHingeJoint(): IHingeJoint;

    /**
     * Create spring joint
     * @param collider - Affector of joint
     */
    createSpringJoint(): ISpringJoint;

    /**
     * Create Custom Joint
     */
    createCustomJoint(): ICustomJoint;

    //Shape
    /**
     * Create box collider shape.
     * @param uniqueID - Shape unique id
     * @param size - Size of the box
     * @param material - The material of this shape
     */
    createBoxColliderShape(uniqueID: number, size: Vector3, material: IPhysicsMaterial): IBoxColliderShape;

    /**
     * Create sphere collider shape.
     * @param uniqueID - Shape unique id
     * @param radius - Radius of the sphere
     * @param material - The material of this shape
     */
    createSphereColliderShape(uniqueID: number, radius: number, material: IPhysicsMaterial): ISphereColliderShape;

    /**
     * Create plane collider shape.
     * @param uniqueID - Shape unique id
     * @param material - The material of this shape
     */
    createPlaneColliderShape(uniqueID: number, material: IPhysicsMaterial): IPlaneColliderShape;

    /**
     * Create capsule collider shape.
     * @param uniqueID - Shape unique id
     * @param radius - Radius of capsule
     * @param height - Height of capsule
     * @param material - The material of this shape
     */
    createCapsuleColliderShape(uniqueID: number, radius: number, height: number, material: IPhysicsMaterial): ICapsuleColliderShape;

    /**
     * create Mesh Collider shape
     */
    createMeshColliderShape(): IMeshColliderShape;
}