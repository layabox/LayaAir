import { Quaternion } from "../math/Quaternion";
import { Ray } from "../math/Ray";
import { Vector3 } from "../math/Vector3";
import { Constraint3D } from "./Constraint3D";
import { HitResult } from "./HitResult";
import { ColliderShape } from "./shape/ColliderShape";
/**
 * <code>Simulation</code> 类用于创建物理模拟器。
 */
export declare class PhysicsSimulation {
    static disableSimulation: boolean;
    /**
     * 创建限制刚体运动的约束条件。
     */
    static createConstraint(): void;
    /**物理引擎在一帧中用于补偿减速的最大次数：模拟器每帧允许的最大模拟次数，如果引擎运行缓慢,可能需要增加该次数，否则模拟器会丢失“时间",引擎间隔时间小于maxSubSteps*fixedTimeStep非常重要。*/
    maxSubSteps: number;
    /**物理模拟器帧的间隔时间:通过减少fixedTimeStep可增加模拟精度，默认是1.0 / 60.0。*/
    fixedTimeStep: number;
    /**
     * 获取是否进行连续碰撞检测。
     * @return  是否进行连续碰撞检测。
     */
    /**
    * 设置是否进行连续碰撞检测。
    * @param value 是否进行连续碰撞检测。
    */
    continuousCollisionDetection: boolean;
    /**
     * 获取重力。
     */
    /**
    * 设置重力。
    */
    gravity: Vector3;
    /**
     * 射线检测第一个碰撞物体。
     * @param	from 起始位置。
     * @param	to 结束位置。
     * @param	out 碰撞结果。
     * @param   collisonGroup 射线所属碰撞组。
     * @param   collisionMask 与射线可产生碰撞的组。
     * @return 	是否成功。
     */
    raycastFromTo(from: Vector3, to: Vector3, out?: HitResult, collisonGroup?: number, collisionMask?: number): boolean;
    /**
     * 射线检测所有碰撞的物体。
     * @param	from 起始位置。
     * @param	to 结束位置。
     * @param	out 碰撞结果[数组元素会被回收]。
     * @param   collisonGroup 射线所属碰撞组。
     * @param   collisionMask 与射线可产生碰撞的组。
     * @return 	是否成功。
     */
    raycastAllFromTo(from: Vector3, to: Vector3, out: HitResult[], collisonGroup?: number, collisionMask?: number): boolean;
    /**
     *  射线检测第一个碰撞物体。
     * @param  	ray        射线
     * @param  	outHitInfo 与该射线发生碰撞的第一个碰撞器的碰撞信息
     * @param  	distance   射线长度,默认为最大值
     * @param   collisonGroup 射线所属碰撞组。
     * @param   collisionMask 与射线可产生碰撞的组。
     * @return 	是否检测成功。
     */
    rayCast(ray: Ray, outHitResult?: HitResult, distance?: number, collisonGroup?: number, collisionMask?: number): boolean;
    /**
     * 射线检测所有碰撞的物体。
     * @param  	ray        射线
     * @param  	out 碰撞结果[数组元素会被回收]。
     * @param  	distance   射线长度,默认为最大值
     * @param   collisonGroup 射线所属碰撞组。
     * @param   collisionMask 与射线可产生碰撞的组。
     * @return 	是否检测成功。
     */
    rayCastAll(ray: Ray, out: HitResult[], distance?: number, collisonGroup?: number, collisionMask?: number): boolean;
    /**
     * 形状检测第一个碰撞的物体。
     * @param   shape 形状。
     * @param	fromPosition 世界空间起始位置。
     * @param	toPosition 世界空间结束位置。
     * @param	out 碰撞结果。
     * @param	fromRotation 起始旋转。
     * @param	toRotation 结束旋转。
     * @param   collisonGroup 射线所属碰撞组。
     * @param   collisionMask 与射线可产生碰撞的组。
     * @return 	是否成功。
     */
    shapeCast(shape: ColliderShape, fromPosition: Vector3, toPosition: Vector3, out?: HitResult, fromRotation?: Quaternion, toRotation?: Quaternion, collisonGroup?: number, collisionMask?: number, allowedCcdPenetration?: number): boolean;
    /**
     * 形状检测所有碰撞的物体。
     * @param   shape 形状。
     * @param	fromPosition 世界空间起始位置。
     * @param	toPosition 世界空间结束位置。
     * @param	out 碰撞结果[数组元素会被回收]。
     * @param	fromRotation 起始旋转。
     * @param	toRotation 结束旋转。
     * @param   collisonGroup 射线所属碰撞组。
     * @param   collisionMask 与射线可产生碰撞的组。
     * @return 	是否成功。
     */
    shapeCastAll(shape: ColliderShape, fromPosition: Vector3, toPosition: Vector3, out: HitResult[], fromRotation?: Quaternion, toRotation?: Quaternion, collisonGroup?: number, collisionMask?: number, allowedCcdPenetration?: number): boolean;
    /**
     * 添加刚体运动的约束条件。
     * @param constraint 约束。
     * @param disableCollisionsBetweenLinkedBodies 是否禁用
     */
    addConstraint(constraint: Constraint3D, disableCollisionsBetweenLinkedBodies?: boolean): void;
    /**
     * 移除刚体运动的约束条件。
     */
    removeConstraint(constraint: Constraint3D): void;
    /**
     * 清除力。
     */
    clearForces(): void;
}
