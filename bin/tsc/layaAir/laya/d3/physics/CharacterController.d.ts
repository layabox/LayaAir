import { Vector3 } from "../math/Vector3";
import { PhysicsComponent } from "./PhysicsComponent";
import { ColliderShape } from "./shape/ColliderShape";
import { Component } from "../../components/Component";
/**
 * <code>CharacterController</code> 类用于创建角色控制器。
 */
export declare class CharacterController extends PhysicsComponent {
    static UPAXIS_X: number;
    static UPAXIS_Y: number;
    static UPAXIS_Z: number;
    /**
     * 获取角色降落速度。
     * @return 角色降落速度。
     */
    /**
    * 设置角色降落速度。
    * @param value 角色降落速度。
    */
    fallSpeed: number;
    /**
     * 获取角色跳跃速度。
     * @return 角色跳跃速度。
     */
    /**
    * 设置角色跳跃速度。
    * @param value 角色跳跃速度。
    */
    jumpSpeed: number;
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
     * 获取最大坡度。
     * @return 最大坡度。
     */
    /**
    * 设置最大坡度。
    * @param value 最大坡度。
    */
    maxSlope: number;
    /**
     * 获取角色是否在地表。
     */
    readonly isGrounded: boolean;
    /**
     * 获取角色行走的脚步高度，表示可跨越的最大高度。
     * @return 脚步高度。
     */
    /**
    * 设置角色行走的脚步高度，表示可跨越的最大高度。
    * @param value 脚步高度。
    */
    stepHeight: number;
    /**
     * 获取角色的Up轴。
     * @return 角色的Up轴。
     */
    /**
    * 设置角色的Up轴。
    * @return 角色的Up轴。
    */
    upAxis: Vector3;
    /**
     * 创建一个 <code>CharacterController</code> 实例。
     * @param stepheight 角色脚步高度。
     * @param upAxis 角色Up轴
     * @param collisionGroup 所属碰撞组。
     * @param canCollideWith 可产生碰撞的碰撞组。
     */
    constructor(stepheight?: number, upAxis?: Vector3, collisionGroup?: number, canCollideWith?: number);
    /**
     * @inheritDoc
     */
    _onShapeChange(colShape: ColliderShape): void;
    /**
     * @inheritDoc
     */
    _onAdded(): void;
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
     * @inheritDoc
     */
    protected _onDestroy(): void;
    /**
     * 通过指定移动向量移动角色。
     * @param	movement 移动向量。
     */
    move(movement: Vector3): void;
    /**
     * 跳跃。
     * @param velocity 跳跃速度。
     */
    jump(velocity?: Vector3): void;
}
