import { Component } from "../../components/Component";
import { Vector3 } from "../math/Vector3";
import { PhysicsTriggerComponent } from "./PhysicsTriggerComponent";
import { ColliderShape } from "./shape/ColliderShape";
/**
 * <code>Rigidbody3D</code> 类用于创建刚体碰撞器。
 */
export declare class Rigidbody3D extends PhysicsTriggerComponent {
    static TYPE_STATIC: number;
    static TYPE_DYNAMIC: number;
    static TYPE_KINEMATIC: number;
    /**
     * 获取质量。
     * @return 质量。
     */
    /**
    * 设置质量。
    * @param value 质量。
    */
    mass: number;
    /**
     * 获取是否为运动物体，如果为true仅可通过transform属性移动物体,而非其他力相关属性。
     * @return 是否为运动物体。
     */
    /**
    * 设置是否为运动物体，如果为true仅可通过transform属性移动物体,而非其他力相关属性。
    * @param value 是否为运动物体。
    */
    isKinematic: boolean;
    /**
     * 获取刚体的线阻力。
     * @return 线阻力。
     */
    /**
    * 设置刚体的线阻力。
    * @param value  线阻力。
    */
    linearDamping: number;
    /**
     * 获取刚体的角阻力。
     * @return 角阻力。
     */
    /**
    * 设置刚体的角阻力。
    * @param value  角阻力。
    */
    angularDamping: number;
    /**
     * 获取是否重载重力。
     * @return 是否重载重力。
     */
    /**
    * 设置是否重载重力。
    * @param value 是否重载重力。
    */
    overrideGravity: boolean;
    /**
     * 获取重力。
     * @return 重力。
     */
    /**
    * 设置重力。
    * @param value 重力。
    */
    gravity: Vector3;
    /**
     * 获取总力。
     */
    readonly totalForce: Vector3;
    /**
     * 获取性因子。
     */
    /**
    * 设置性因子。
    */
    linearFactor: Vector3;
    /**
     * 获取线速度
     * @return 线速度
     */
    /**
    * 设置线速度。
    * @param 线速度。
    */
    linearVelocity: Vector3;
    /**
     * 获取角因子。
     */
    /**
    * 设置角因子。
    */
    angularFactor: Vector3;
    /**
     * 获取角速度。
     * @return 角速度。
     */
    /**
    * 设置角速度。
    * @param 角速度
    */
    angularVelocity: Vector3;
    /**
     * 获取刚体所有扭力。
     */
    readonly totalTorque: Vector3;
    /**
     * 获取是否进行碰撞检测。
     * @return 是否进行碰撞检测。
     */
    /**
    * 设置是否进行碰撞检测。
    * @param value 是否进行碰撞检测。
    */
    detectCollisions: boolean;
    /**
     * 获取是否处于睡眠状态。
     * @return 是否处于睡眠状态。
     */
    readonly isSleeping: boolean;
    /**
     * 获取刚体睡眠的线速度阈值。
     * @return 刚体睡眠的线速度阈值。
     */
    /**
    * 设置刚体睡眠的线速度阈值。
    * @param value 刚体睡眠的线速度阈值。
    */
    sleepLinearVelocity: number;
    /**
     * 获取刚体睡眠的角速度阈值。
     * @return 刚体睡眠的角速度阈值。
     */
    /**
    * 设置刚体睡眠的角速度阈值。
    * @param value 刚体睡眠的角速度阈值。
    */
    sleepAngularVelocity: number;
    /**
     * 创建一个 <code>RigidBody</code> 实例。
     * @param collisionGroup 所属碰撞组。
     * @param canCollideWith 可产生碰撞的碰撞组。
     */
    constructor(collisionGroup?: number, canCollideWith?: number);
    /**
     * @inheritDoc
     */
    protected _onScaleChange(scale: Vector3): void;
    /**
     * @inheritDoc
     */
    _onAdded(): void;
    /**
     * @inheritDoc
     */
    _onShapeChange(colShape: ColliderShape): void;
    /**
     * @inheritDoc
     */
    _parse(data: any): void;
    /**
     * @inheritDoc
     */
    protected _onDestroy(): void;
    /**
     * @inheritDoc
     */
    _addToSimulation(): void;
    /**
     * @inheritDoc
     */
    _removeFromSimulation(): void;
    /**
     * @inheritDoc
     */
    _cloneTo(dest: Component): void;
    /**
     * 应用作用力。
     * @param	force 作用力。
     * @param	localOffset 偏移,如果为null则为中心点
     */
    applyForce(force: Vector3, localOffset?: Vector3): void;
    /**
     * 应用扭转力。
     * @param	torque 扭转力。
     */
    applyTorque(torque: Vector3): void;
    /**
     * 应用冲量。
     * @param	impulse 冲量。
     * @param   localOffset 偏移,如果为null则为中心点。
     */
    applyImpulse(impulse: Vector3, localOffset?: Vector3): void;
    /**
     * 应用扭转冲量。
     * @param	torqueImpulse
     */
    applyTorqueImpulse(torqueImpulse: Vector3): void;
    /**
     * 唤醒刚体。
     */
    wakeUp(): void;
    /**
     *清除应用到刚体上的所有力。
     */
    clearForces(): void;
}
