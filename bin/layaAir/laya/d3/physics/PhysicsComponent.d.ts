import { Component } from "laya/components/Component";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { PhysicsSimulation } from "./PhysicsSimulation";
import { ColliderShape } from "./shape/ColliderShape";
/**
 * <code>PhysicsComponent</code> 类用于创建物理组件的父类。
 */
export declare class PhysicsComponent extends Component {
    /** @private */
    static ACTIVATIONSTATE_ACTIVE_TAG: number;
    /** @private */
    static ACTIVATIONSTATE_ISLAND_SLEEPING: number;
    /** @private */
    static ACTIVATIONSTATE_WANTS_DEACTIVATION: number;
    /** @private */
    static ACTIVATIONSTATE_DISABLE_DEACTIVATION: number;
    /** @private */
    static ACTIVATIONSTATE_DISABLE_SIMULATION: number;
    /** @private */
    static COLLISIONFLAGS_STATIC_OBJECT: number;
    /** @private */
    static COLLISIONFLAGS_KINEMATIC_OBJECT: number;
    /** @private */
    static COLLISIONFLAGS_NO_CONTACT_RESPONSE: number;
    /** @private */
    static COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK: number;
    /** @private */
    static COLLISIONFLAGS_CHARACTER_OBJECT: number;
    /** @private */
    static COLLISIONFLAGS_DISABLE_VISUALIZE_OBJECT: number;
    /** @private */
    static COLLISIONFLAGS_DISABLE_SPU_COLLISION_PROCESSING: number;
    /**@private */
    protected static _tempVector30: Vector3;
    /**@private */
    protected static _tempQuaternion0: Quaternion;
    /**@private */
    protected static _tempQuaternion1: Quaternion;
    /**@private */
    protected static _tempMatrix4x40: Matrix4x4;
    /** @private */
    protected static _nativeVector30: any;
    /** @private */
    protected static _nativeQuaternion0: any;
    /**@private */
    static _physicObjectsMap: any;
    /** @private */
    static _addUpdateList: boolean;
    /**
    * @private
    */
    static __init__(): void;
    /**
     * @private
     */
    private static _createAffineTransformationArray;
    /**
* @private
*/
    static _creatShape(shapeData: any): ColliderShape;
    /**
     * @private
     */
    private static physicVector3TransformQuat;
    /**
     * @private
     */
    private static physicQuaternionMultiply;
    /** @private */
    private _restitution;
    /** @private */
    private _friction;
    /** @private */
    private _rollingFriction;
    /** @private */
    private _ccdMotionThreshold;
    /** @private */
    private _ccdSweptSphereRadius;
    /** @private */
    protected _collisionGroup: number;
    /** @private */
    protected _canCollideWith: number;
    /** @private */
    protected _colliderShape: ColliderShape;
    /** @private */
    protected _transformFlag: number;
    /** @private */
    _nativeColliderObject: any;
    /** @private */
    _simulation: PhysicsSimulation;
    /** @private */
    _enableProcessCollisions: boolean;
    /** @private */
    _inPhysicUpdateListIndex: number;
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
     * @private
     */
    _isValid(): boolean;
    /**
     * @inheritDoc
     */
    _parse(data: any): void;
    /**
     * @private
     */
    protected _parseShape(shapesData: any[]): void;
    /**
     * @private
     */
    protected _onScaleChange(scale: Vector3): void;
    /**
     * @private
     */
    _setTransformFlag(type: number, value: boolean): void;
    /**
     * @private
     */
    _getTransformFlag(type: number): boolean;
    /**
     * @private
     */
    _addToSimulation(): void;
    /**
     * @private
     */
    _removeFromSimulation(): void;
    /**
     * 	@private
     */
    _derivePhysicsTransformation(force: boolean): void;
    /**
     * 	@private
     *	通过渲染矩阵更新物理矩阵。
     */
    _innerDerivePhysicsTransformation(physicTransformOut: any, force: boolean): void;
    /**
     * @private
     * 通过物理矩阵更新渲染矩阵。
     */
    _updateTransformComponent(physicsTransform: any): void;
    /**
     * @inheritDoc
     */
    protected _onEnable(): void;
    /**
     * @inheritDoc
     */
    protected _onDisable(): void;
    /**
     * @private
     */
    _onShapeChange(colShape: ColliderShape): void;
    /**
     * @inheritDoc
     */
    _onAdded(): void;
    /**
     * @inheritDoc
     */
    protected _onDestroy(): void;
    /**
     * @private
     */
    _onTransformChanged(flag: number): void;
    /**
     * @inheritDoc
     */
    _cloneTo(dest: Component): void;
}
