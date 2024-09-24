import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IStaticCollider } from "../../interface/IStaticCollider";
import { EColliderCapable } from "../../physicsEnum/EColliderCapable";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxPhysicsManager } from "../pxPhysicsManager";
import { pxCollider } from "./pxCollider";

/**
 * @en Class representing a static collider in the PhysX physics engine.
 * @zh 表示 PhysX 物理引擎中的静态碰撞器的类。
 */
export class pxStaticCollider extends pxCollider implements IStaticCollider {

    /**@internal */
    static _staticCapableMap: Map<any, any>;

    /**
     * @en Get the capability of a static collider for a specific collider capable.
     * @param value The collider capable to check.
     * @returns Whether the static collider is capable of the specified feature.
     * @zh 获取静态碰撞器对特定碰撞器能力的支持状态。
     * @param value 要检查的碰撞器能力。
     * @returns 静态碰撞器是否支持指定的特性。
     */
    static getStaticColliderCapable(value: EColliderCapable): boolean {
        return pxStaticCollider._staticCapableMap.get(value);
    }

    /**
     * @en Initialize the capabilities map for static colliders.
     * @zh 初始化静态碰撞器的能力映射表。
     */
    static initCapable(): void {
        this._staticCapableMap = new Map();
        this._staticCapableMap.set(EColliderCapable.Collider_AllowTrigger, true);
        this._staticCapableMap.set(EColliderCapable.Collider_CollisionGroup, true);
        this._staticCapableMap.set(EColliderCapable.Collider_Friction, false);
        this._staticCapableMap.set(EColliderCapable.Collider_Restitution, true);
        this._staticCapableMap.set(EColliderCapable.Collider_RollingFriction, false);
        this._staticCapableMap.set(EColliderCapable.Collider_DynamicFriction, true);
        this._staticCapableMap.set(EColliderCapable.Collider_StaticFriction, true);
        this._staticCapableMap.set(EColliderCapable.Collider_BounceCombine, true);
        this._staticCapableMap.set(EColliderCapable.Collider_FrictionCombine, true);
        this._staticCapableMap.set(EColliderCapable.Collider_EventFilter, true);
        this._staticCapableMap.set(EColliderCapable.Collider_CollisionDetectionMode, true);
    }

    /**
     * @en Creates an instance of pxStaticCollider.
     * @param manager The physics manager.
     * @zh 创建一个 pxStaticCollider 实例。
     * @param manager 物理管理器。
     */
    constructor(manager: pxPhysicsManager) {
        super(manager);
    }


    /**
     * @en Check if the static collider is capable of a specific feature.
     * @param value The capability to check.
     * @returns Whether the static collider is capable of the specified feature.
     * @zh 检查静态碰撞器是否具有特定能力。
     * @param value 要检查的能力。
     * @returns 静态碰撞器是否具有指定的能力。
     */
    getCapable(value: number): boolean {
        return pxStaticCollider.getStaticColliderCapable(value);
    }

    protected _initCollider() {
        this._pxActor = pxPhysicsCreateUtil._pxPhysics.createRigidStatic(this._transformTo(new Vector3(), new Quaternion()));

    }

    /**
     * @en Set the trigger state of the collider.
     * @param value Whether the collider should act as a trigger.
     * @zh 设置碰撞器的触发器状态。
     * @param value 碰撞器是否应该作为触发器。
     */
    setTrigger(value: boolean): void {
        this._isTrigger = value;
        this._shape && this._shape.setIsTrigger(value);
    }

    protected _initColliderShapeByCollider() {
        super._initColliderShapeByCollider();
        this.setWorldTransform(true);
        this.setTrigger(this._isTrigger);
    }


}