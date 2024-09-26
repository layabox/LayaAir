import { Ray } from "../../d3/math/Ray";
import { HitResult } from "../../d3/physics/HitResult";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { ICollider } from "./ICollider";
import { IColliderShape } from "./Shape/IColliderShape";

/**
 * @en Interface for physics manager.
 * @zh 物理管理器的接口。
 */
export interface IPhysicsManager {

    /**
     * @en Set gravity for the physics world.
     * @param gravity Physics gravity vector.
     * @zh 设置物理世界的重力。
     * @param gravity 物理重力向量。
     */
    setGravity(gravity: Vector3): void;

    /**
     * @en Add ICollider into the manager.
     * @param collider StaticCollider or DynamicCollider to be added.
     * @zh 向物理管理器添加碰撞器。
     * @param collider 要添加的静态碰撞器或动态碰撞器。
     */
    addCollider(collider: ICollider): void;


    /**
     * @en Set whether the collider is active.
     * @param collider The collider to set active state.
     * @param value Whether the collider is active.
     * @zh 是否启用碰撞器。
     * @param collider 要设置启用状态的碰撞器。
     * @param value 碰撞器是否处于启用状态。
     */
    setActiveCollider(collider: ICollider, value: boolean): void;

    /**
     * @en Remove ICollider from the physics manager.
     * @param collider StaticCollider or DynamicCollider to be removed.
     * @zh 从物理管理器中移除碰撞器。
     * @param collider 要移除的静态碰撞器或动态碰撞器。
     */
    removeCollider(collider: ICollider): void;

    /**
     * @en Update the physics world, called on every frame to update object poses.
     * @param elapsedTime Step time for the update.
     * @zh 更新物理世界，每帧调用以更新对象姿态。
     * @param elapsedTime 更新的步进时间。
     */
    update(elapsedTime: number): void;

    /**
     * @en Perform a raycast to find the first collision.
     * @param ray The ray to cast.
     * @param outHitResult The result of the raycast.
     * @param distance Maximum distance of the raycast.
     * @param collisonGroup Collision group for filtering.
     * @param collisionMask Collision mask for filtering.
     * @zh 执行射线检测以找到第一个碰撞。
     * @param ray 要投射的射线。
     * @param outHitResult 射线检测的结果。
     * @param distance 射线检测的最大距离。
     * @param collisonGroup 用于过滤的碰撞组。
     * @param collisionMask 用于过滤的碰撞掩码。
     */
    rayCast?(ray: Ray, outHitResult: HitResult, distance?: number, collisonGroup?: number, collisionMask?: number): boolean;

    /**
     * @en Perform a raycast to find all collisions.
     * @param ray The ray to cast.
     * @param out Array to store all hit results.
     * @param distance Maximum distance of the raycast.
     * @param collisonGroup Collision group for filtering.
     * @param collisionMask Collision mask for filtering.
     * @zh 执行射线检测以找到所有碰撞。
     * @param ray 要投射的射线。
     * @param out 用于存储所有命中结果的数组。
     * @param distance 射线检测的最大距离。
     * @param collisonGroup 用于过滤的碰撞组。
     * @param collisionMask 用于过滤的碰撞掩码。
     */
    rayCastAll?(ray: Ray, out: HitResult[], distance?: number, collisonGroup?: number, collisionMask?: number): boolean;

    /**
     * @en Enable or disable the debug drawer.
     * @param value Whether to enable the debug drawer.
     * @zh 启用或禁用调试器。
     * @param value 是否启用调试器。
     */
    enableDebugDrawer?(value: boolean): void;

    /**
     * @en Destroy the physics manager.
     * @zh 销毁物理管理器。
     */
    destroy(): void;

    /**
     * @en Perform a shape cast to find the first collision.
     * @param shape The shape to cast.
     * @param fromPosition Start position of the cast.
     * @param toPosition End position of the cast.
     * @param out The result of the shape cast.
     * @param fromRotation Start rotation of the cast.
     * @param toRotation End rotation of the cast.
     * @param collisonGroup Collision group for filtering.
     * @param collisionMask Collision mask for filtering.
     * @param allowedCcdPenetration Allowed continuous collision detection penetration.
     * @zh 执行形状投射以找到第一个碰撞。
     * @param shape 要投射的形状。
     * @param fromPosition 投射的起始位置。
     * @param toPosition 投射的结束位置。
     * @param out 形状投射的结果。
     * @param fromRotation 投射的起始旋转。
     * @param toRotation 投射的结束旋转。
     * @param collisonGroup 用于过滤的碰撞组。
     * @param collisionMask 用于过滤的碰撞掩码。
     * @param allowedCcdPenetration 允许的连续碰撞检测穿透。
     */
    shapeCast(shape: IColliderShape, fromPosition: Vector3, toPosition: Vector3, out: HitResult, fromRotation?: Quaternion, toRotation?: Quaternion, collisonGroup?: number, collisionMask?: number, allowedCcdPenetration?: number): boolean;

    /**
     * @en Perform a shape cast to find all collisions.
     * @param shape The shape to cast.
     * @param fromPosition Start position of the cast.
     * @param toPosition End position of the cast.
     * @param out Array to store all hit results.
     * @param fromRotation Start rotation of the cast.
     * @param toRotation End rotation of the cast.
     * @param collisonGroup Collision group for filtering.
     * @param collisionMask Collision mask for filtering.
     * @param allowedCcdPenetration Allowed continuous collision detection penetration.
     * @zh 执行形状投射以找到所有碰撞。
     * @param shape 要投射的形状。
     * @param fromPosition 投射的起始位置。
     * @param toPosition 投射的结束位置。
     * @param out 用于存储所有命中结果的数组。
     * @param fromRotation 投射的起始旋转。
     * @param toRotation 投射的结束旋转。
     * @param collisonGroup 用于过滤的碰撞组。
     * @param collisionMask 用于过滤的碰撞掩码。
     * @param allowedCcdPenetration 允许的连续碰撞检测穿透。
     */
    shapeCastAll(shape: IColliderShape, fromPosition: Vector3, toPosition: Vector3, out: HitResult[], fromRotation?: Quaternion, toRotation?: Quaternion, collisonGroup?: number, collisionMask?: number, allowedCcdPenetration?: number): boolean;

}