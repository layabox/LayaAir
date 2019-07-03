import { Component } from "../../components/Component";
import { PhysicsSimulation } from "./PhysicsSimulation";
import { ColliderShape } from "./shape/ColliderShape";
/**
 * <code>PhysicsComponent</code> 类用于创建物理组件的父类。
 */
export declare class PhysicsComponent extends Component {
    /** 是否可以缩放Shape。 */
    canScaleShape: boolean;
    /**
     * 获取弹力。
     * @return 弹力。
     */
    /**
    * 设置弹力。
    * @param 弹力。
    */
    restitution: number;
    /**
     * 获取摩擦力。
     * @return 摩擦力。
     */
    /**
    * 设置摩擦力。
    * @param value 摩擦力。
    */
    friction: number;
    /**
     * 获取滚动摩擦力。
     * @return 滚动摩擦力。
     */
    /**
    * 设置滚动摩擦力。
    * @param 滚动摩擦力。
    */
    rollingFriction: number;
    /**
     *获取用于连续碰撞检测(CCD)的速度阈值,当物体移动速度小于该值时不进行CCD检测,防止快速移动物体(例如:子弹)错误的穿过其它物体,0表示禁止。
     * @return 连续碰撞检测(CCD)的速度阈值。
     */
    /**
    *设置用于连续碰撞检测(CCD)的速度阈值，当物体移动速度小于该值时不进行CCD检测,防止快速移动物体(例如:子弹)错误的穿过其它物体,0表示禁止。
    * @param value 连续碰撞检测(CCD)的速度阈值。
    */
    ccdMotionThreshold: number;
    /**
     *获取用于进入连续碰撞检测(CCD)范围的球半径。
     * @return 球半径。
     */
    /**
    *设置用于进入连续碰撞检测(CCD)范围的球半径。
    * @param 球半径。
    */
    ccdSweptSphereRadius: number;
    /**
     * 获取是否激活。
     */
    readonly isActive: boolean;
    /**
     * @inheritDoc
     */
    enabled: boolean;
    /**
     * 获取碰撞形状。
     */
    /**
    * 设置碰撞形状。
    */
    colliderShape: ColliderShape;
    /**
     * 获取模拟器。
     * @return 模拟器。
     */
    readonly simulation: PhysicsSimulation;
    /**
     * 获取所属碰撞组。
     * @return 所属碰撞组。
     */
    /**
    * 设置所属碰撞组。
    * @param 所属碰撞组。
    */
    collisionGroup: number;
    /**
     * 获取可碰撞的碰撞组。
     * @return 可碰撞组。
     */
    /**
    * 设置可碰撞的碰撞组。
    * @param 可碰撞组。
    */
    canCollideWith: number;
    /**
     * 创建一个 <code>PhysicsComponent</code> 实例。
     * @param collisionGroup 所属碰撞组。
     * @param canCollideWith 可产生碰撞的碰撞组。
     */
    constructor(collisionGroup: number, canCollideWith: number);
    /**
     * @inheritDoc
     */
    _parse(data: any): void;
    /**
     * @inheritDoc
     */
    protected _onEnable(): void;
    /**
     * @inheritDoc
     */
    protected _onDisable(): void;
    /**
     * @inheritDoc
     */
    _onAdded(): void;
    /**
     * @inheritDoc
     */
    protected _onDestroy(): void;
    /**
     * @inheritDoc
     */
    _cloneTo(dest: Component): void;
}
