import { PhysicsForceMode } from "../../d3/physics/PhysicsColliderComponent";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { ICollider } from "./ICollider";

/**
 * @en Interface of physics dynamic collider.
 * @zh 物理动态碰撞器的接口。
 */
export interface IDynamicCollider extends ICollider {
    /**
     * @en Sets the linear damping coefficient.
     * @param value Linear damping coefficient.
     * @zh 设置线性阻尼系数。
     * @param value 线性阻尼系数。
     */
    setLinearDamping(value: number): void;

    /**
     * @en Sets the angular damping coefficient.
     * @param value Angular damping coefficient.
     * @zh 设置角度阻尼系数。
     * @param value 角度阻尼系数。
     */
    setAngularDamping(value: number): void;

    /**
     * @en Sets the linear velocity of the actor.
     * @param value New linear velocity of actor.
     * @zh 设置物体的线性速度。
     * @param value 物体的新线性速度。
     */
    setLinearVelocity(value: Vector3): void;

    /**
     * @en Get the linear velocity of the actor.
     * @zh 获取物体的线性速度。
     */
    getLinearVelocity(): Vector3;

    /**
     * @en Sets the angular velocity of the actor.
     * @param value New angular velocity of actor.
     * @zh 设置物体的角速度。
     * @param value 物体的新角速度。
     */
    setAngularVelocity(value: Vector3): void;

    /**
     * @en Gets the angular velocity of the actor.
     * @zh 获取物体的角速度。
     */
    getAngularVelocity(): Vector3;

    /**
     * @en Sets the mass of a dynamic actor.
     * @param value New mass value for the actor.
     * @zh 设置动态物体的质量。
     * @param value 物体的新质量值。
     */
    setMass(value: number): void;

    /**
     * @en Sets the pose of the center of mass relative to the actor.
     * @param value Mass frame offset transform relative to the actor frame.
     * @zh 设置质心相对于物体的位置。
     * @param value 质心相对于物体框架的偏移变换。
     */
    setCenterOfMass(value: Vector3): void;

    /**
     * @en Sets the inertia tensor, using a parameter specified in mass space coordinates.
     * @param value New mass space inertia tensor for the actor.
     * @zh 设置惯性张量，使用质量空间坐标中指定的参数。
     * @param value 物体的新质量空间惯性张量。
     */
    setInertiaTensor(value: Vector3): void;

    /**
     * @en Sets the mass-normalized kinetic energy threshold below which an actor may go to sleep.
     * @param value Energy below which an actor may go to sleep.
     * @zh 设置物体可能进入睡眠状态的质量归一化动能阈值。
     * @param value 物体可能进入睡眠状态的能量阈值。
     */
    setSleepThreshold(value: number): void;

    /**
     * @en Sets the colliders' collision detection mode.
     * @param value Rigid body flag.
     * @zh 设置碰撞器的碰撞检测模式。
     * @param value 刚体标志。
     */
    setCollisionDetectionMode(value: number): void;

    /**
     * @en Controls whether physics affects the dynamic collider.
     * @param value Whether physics affects the dynamic collider.
     * @zh 控制物理是否影响动态碰撞器。
     * @param value 物理是否影响动态碰撞器。
     */
    setIsKinematic(value: boolean): void;

    /**
     * @en Raises or clears a particular rigid dynamic lock flag.
     * @param linearFactor Linear constraint factor.
     * @param angularFactor Angular constraint factor.
     * @zh 设置或清除特定的刚体动态锁定标志。
     * @param linearFactor 线性约束因子。
     * @param angularFactor 角度约束因子。
     */
    setConstraints(linearFactor: Vector3, angularFactor: Vector3): void;

    /**
     * @en Apply a force to the dynamic collider.
     * @param force The force to make the collider move.
     * @param mode The mode of applying the force.
     * @param localOffset The local offset where the force is applied.
     * @zh 对动态碰撞器施加力。
     * @param force 使碰撞器移动的力。
     * @param mode 施加力的模式。
     * @param localOffset 力施加的局部偏移。
     */
    addForce(force: Vector3, mode: PhysicsForceMode, localOffset: Vector3): void;

    /**
     * @en Apply a torque to the dynamic collider.
     * @param torque The torque to make the collider rotate.
     * @param mode The mode of applying the torque.
     * @zh 对动态碰撞器施加扭矩。
     * @param torque 使碰撞器旋转的扭矩。
     * @param mode 施加扭矩的模式。
     */
    addTorque(torque: Vector3, mode: PhysicsForceMode): void;

    /**
     * @en Forces a collider to sleep at least one frame.
     * @zh 强制碰撞器至少休眠一帧。
     */
    sleep?(): void;

    /**
     * @en Forces a collider to wake up.
     * @zh 强制唤醒碰撞器。
     */
    wakeUp(): void;

    /**
     * @en Sets the world position of the collider.
     * @param value The new world position.
     * @zh 设置碰撞器的世界位置。
     * @param value 位置。
     */
    setWorldPosition(value: Vector3): void;

    /**
     * @en Sets the world rotation of the collider.
     * @param value The new world rotation.
     * @zh 设置碰撞器的世界旋转。
     * @param value 旋转四元数。
     */
    setWorldRotation(value: Quaternion): void;

    /**
     * @en Sets whether the collider is a trigger.
     * @param value Whether the collider is a trigger.
     * @zh 设置碰撞器是否为触发器。
     * @param value 碰撞器是否为触发器。
     */
    setTrigger(value: boolean): void;
}
