import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { ICharacterController } from "../../interface/ICharacterController";
import { ECharacterCapable } from "../../physicsEnum/ECharacterCapable";
import { pxCapsuleColliderShape } from "../Shape/pxCapsuleColliderShape";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { partFlag, pxPhysicsManager } from "../pxPhysicsManager";
import { pxCollider, pxColliderType } from "./pxCollider";
import { pxDynamicCollider } from "./pxDynamicCollider";
import { Event } from "../../../events/Event";
export enum ControllerNonWalkableMode {
    /**
     * @en Stops character from climbing up non-walkable slopes, but doesn't move it otherwise.
     * @zh 阻止角色爬上不可行走的斜坡，但不会对其他情况进行移动。
     */
    ePREVENT_CLIMBING,
    /**
     * @en Stops character from climbing up non-walkable slopes, and forces it to slide down those slopes.
     * @zh 阻止角色爬上不可行走的斜坡，并强制其沿这些斜坡滑下。
     */
    ePREVENT_CLIMBING_AND_FORCE_SLIDING
};

export enum ECharacterCollisionFlag {
    /**
     * @en Character is colliding to the sides.
     * @zh 角色与侧面发生碰撞。
     */
    eCOLLISION_SIDES = 1 << 0,
    /**
     * @en Character has collision above.
     * @zh 角色上方发生碰撞。
     */
    eCOLLISION_UP = 1 << 1,
    /**
     * @en Character has collision below.
     * @zh 角色下方发生碰撞。
     */
    eCOLLISION_DOWN = 1 << 2
}

/**
 * @en The `pxCharactorCollider` class implements character controller functionality in the physics engine.
 * @zh `pxCharactorCollider` 类用于在物理引擎中实现角色控制器的功能。
 */
export class pxCharactorCollider extends pxCollider implements ICharacterController {
    static tempV3: Vector3 = new Vector3();
    _shapeID: number;
    /** @internal */
    _id: number;
    /** @internal */
    _pxController: any;
    /** @internal */
    _pxNullShape: pxCapsuleColliderShape;
    /**@internal */
    _radius: number = 0.5;
    /**@internal */
    _height: number = 2;
    /**@internal */
    _localOffset: Vector3 = new Vector3();
    /**@internal */
    _upDirection: Vector3 = new Vector3(0, 1, 0);
    /**@internal */
    private _stepOffset: number = 0;
    /**@internal */
    private _slopeLimit: number = 0;
    /**@internal */
    private _contactOffset: number = 0;
    /**@internal */
    private _minDistance: number = 0;

    private _nonWalkableMode: ControllerNonWalkableMode = ControllerNonWalkableMode.ePREVENT_CLIMBING_AND_FORCE_SLIDING;

    private _gravity: Vector3 = new Vector3(0, -9.81, 0);

    private _characterCollisionFlags: number = 0;

    /**@internal */
    static _characterCapableMap: Map<any, any>;

    /**@internal */
    private _pushForce: number = 10;

    /**@internal */
    private _characterEvents: [] = [];

    /**
     * @en Creates a instance of pxCharactorCollider.
     * @param manager The physics manager responsible for this collider.
     * @zh 创建一个 pxCharactorCollider 实例。
     * @param manager 负责管理此碰撞器的物理管理器。
     */
    constructor(manager: pxPhysicsManager) {
        super(manager);
        this._type = pxColliderType.CharactorCollider;
    }

    private _getNodeScale() {
        return this.owner ? this.owner.transform.getWorldLossyScale() : Vector3.ONE;
    }

    protected _initCollider(): void {
        this._pxActor = pxPhysicsCreateUtil._pxPhysics.createRigidDynamic(this._transformTo(new Vector3(), new Quaternion()));
    }

    /**
     * @en Gets the capability of the character controller.
     * @param value The capability to check.
     * @returns Whether the capability is supported.
     * @zh 获取角色控制器的能力。
     * @param value 要检查的能力。
     * @returns 是否支持该能力。
     */
    getCapable(value: number): boolean {
        return pxCharactorCollider.getCharacterCapable(value);
    }

    /**
     * @en Gets the character capability.
     * @param value The character capability to check.
     * @returns Whether the capability is supported.
     * @zh 获取角色能力。
     * @param value 要检查的角色能力。
     * @returns 是否支持该能力。
     */
    static getCharacterCapable(value: ECharacterCapable): boolean {
        return pxCharactorCollider._characterCapableMap.get(value);
    }

    /**
     * @en Initializes the character capabilities.
     * @zh 初始化角色能力。
     */
    static initCapable(): void {
        this._characterCapableMap = new Map();
        // this._characterCapableMap.set(ECharacterCapable.Charcater_AllowSleep, false);
        this._characterCapableMap.set(ECharacterCapable.Charcater_Gravity, true);
        this._characterCapableMap.set(ECharacterCapable.Charcater_CollisionGroup, true);
        // this._characterCapableMap.set(ECharacterCapable.Charcater_Friction, true);
        // this._characterCapableMap.set(ECharacterCapable.Charcater_Restitution, true);
        // this._characterCapableMap.set(ECharacterCapable.Charcater_RollingFriction, true);
        // this._characterCapableMap.set(ECharacterCapable.Charcater_AllowTrigger, false);
        this._characterCapableMap.set(ECharacterCapable.Charcater_WorldPosition, true);
        this._characterCapableMap.set(ECharacterCapable.Charcater_Move, true);
        this._characterCapableMap.set(ECharacterCapable.Charcater_Jump, true);
        this._characterCapableMap.set(ECharacterCapable.Charcater_StepOffset, true);
        this._characterCapableMap.set(ECharacterCapable.Character_UpDirection, true);
        this._characterCapableMap.set(ECharacterCapable.Character_FallSpeed, true);
        this._characterCapableMap.set(ECharacterCapable.Character_SlopeLimit, true);
        this._characterCapableMap.set(ECharacterCapable.Character_PushForce, true);
        this._characterCapableMap.set(ECharacterCapable.Character_Radius, true);
        this._characterCapableMap.set(ECharacterCapable.Character_Height, true);
        this._characterCapableMap.set(ECharacterCapable.Character_offset, true);
        this._characterCapableMap.set(ECharacterCapable.Character_Skin, true);
        this._characterCapableMap.set(ECharacterCapable.Character_minDistance, true);
        this._characterCapableMap.set(ECharacterCapable.Character_EventFilter, true);
        this._characterCapableMap.set(ECharacterCapable.Character_SimulateGravity, true);
    }

    /**
     * @en Creates the character controller in the physics engine.
     * @zh 在物理引擎中创建角色控制器。
     */
    _createController() {
        let desc: any;
        const pxPhysics = pxPhysicsCreateUtil._physX;
        desc = new pxPhysics.PxCapsuleControllerDesc();
        this._characterCollisionFlags = new pxPhysics.PxControllerCollisionFlags(ECharacterCollisionFlag.eCOLLISION_DOWN);
        let scale = this._getNodeScale();
        desc.radius = this._radius * Math.max(scale.x, scale.z);
        desc.height = this._height * scale.y;
        desc.climbingMode = 1; // constraint mode=
        desc.setreportCallBackBehavior();
        this._pxNullShape = this._pxNullShape ? this._pxNullShape : new pxCapsuleColliderShape();
        desc.setMaterial(this._pxNullShape._pxMaterials[0]._pxMaterial);
        this._pxNullShape._pxCollider = this;
        this._pxController = this._physicsManager._pxcontrollerManager.createController(desc);
        this._pxController.setShapeID(this._pxNullShape._id);
        // pxColliderShape._shapePool.set(this._id, this as any);
        this.setRadius(this._radius);
        this.setHeight(this._height);
        this.setPosition(this.owner.transform.position);
        this.setStepOffset(this._stepOffset);
        this.setUpDirection(this._upDirection);
        this.setSlopeLimit(this._slopeLimit);
        this.setGravity(this._gravity);
        this.setPushForce(this._pushForce);
        this.setNonWalkableMode(this._nonWalkableMode);
        this.setEventFilter(this._characterEvents);
        this._setCharacterCollisonFlag(ECharacterCollisionFlag.eCOLLISION_SIDES);
    }

    /**
     * @en Sets the collision flag for the character controller.
     * @param value The collision flag to set.
     * @zh 设置角色控制器的碰撞标志。
     * @param value 要设置的碰撞标志。
     */
    _setCharacterCollisonFlag(value: ECharacterCollisionFlag) {
        this._pxController && this._pxController.isSetControllerCollisionFlag(this._characterCollisionFlags, value);
    }

    /**
     * @en Releases the character controller from the physics engine.
     * @zh 从物理引擎中释放角色控制器。
     */
    _releaseController() {
        if (this._pxController) {
            this._pxController.release();
            this._pxController = null;
        }
    }

    /**
     * @en Moves the character controller.
     * @param disp The displacement vector.
     * @zh 移动角色控制器。
     * @param disp 位移向量。
     */
    move(disp: Vector3): void {
        return this._pxController && this._pxController.move(disp, this._minDistance, 1 / 60);
    }

    /**
     * @en Makes the character jump.
     * @param velocity The jump velocity.
     * @zh 使角色跳跃。
     * @param velocity 跳跃速度。
     */
    jump?(velocity: Vector3): void {
        return this._pxController && this._pxController.move(velocity, this._minDistance, 1 / 60);
    }

    /**
     * @en Sets the step offset for the character controller.
     * @param offset The step offset value.
     * @zh 设置角色控制器的台阶偏移。
     * @param offset 台阶偏移值。
     */
    setStepOffset(offset: number) {
        this._stepOffset = offset;
        this._pxController && this._pxController.setStepOffset(this._stepOffset);
    }

    /**
     * @en Sets the up direction for the character controller.
     * @param up The up direction vector.
     * @zh 设置角色控制器的向上方向。
     * @param up 向上方向向量。
     */
    setUpDirection(up: Vector3): void {
        up.cloneTo(this._upDirection);
        this._pxController && this._pxController.setUpDirection(up);
    }

    /**
     * @en Sets the slope limit for the character controller.
     * @param value The slope limit value in radians.
     * @zh 设置角色控制器的坡度限制。
     * @param value 坡度限制值（弧度）。
     */
    setSlopeLimit(value: number) {
        this._slopeLimit = value;
        this._pxController && this._pxController.setSlopeLimit(Math.cos(this._slopeLimit));
    }

    /**
     * @en Sets the gravity for the character controller.
     * @param value The gravity vector.
     * @zh 设置角色控制器的重力。
     * @param value 重力向量。
     */
    setGravity(value: Vector3): void {
        value.cloneTo(this._gravity);
    }

    /**
     * @en Sets the push force for the character controller.
     * @param value The push force value.
     * @zh 设置角色控制器的推力。
     * @param value 推力值。
     */
    setPushForce(value: number): void {
        this._pushForce = value;
        this._pxController && this._pxController.setPushForce(this._pushForce);
    }

    /**
     * @en Updates the character's world transform from the physics engine.
     * @zh 从物理引擎更新角色的世界变换。
     */
    getWorldTransform() {
        const v3 = this._pxController.getPosition();
        pxDynamicCollider._tempTranslation.set(v3.x, v3.y, v3.z);
        this.owner.transform.position = pxDynamicCollider._tempTranslation;
    }

    /**
     * @en Sets the skin width for the character controller.
     * @param width The skin width value.
     * @zh 设置角色控制器的皮肤宽度。
     * @param width 皮肤宽度值。
     */
    setSkinWidth(width: number): void {
        this._contactOffset = width;
        this._pxController && this._pxController.setContactOffset(this._contactOffset);
    }

    /**
     * @en Destroys the character controller.
     * @zh 销毁角色控制器。
     */
    destroy(): void {
        this._releaseController();
    }

    /**
     * @en Sets the position of the character controller.
     * @param value The position vector.
     * @zh 设置角色控制器的位置。
     * @param value 位置向量。
     */
    setPosition(value: Vector3): void {
        // let v3 = this.owner.transform.position;
        // let scale = this._getNodeScale();
        // pxCharactorCollider.tempV3.setValue(this._localOffset.x * scale.x, this._localOffset.y * scale.y, this._localOffset.z * scale.z);
        // Vector3.add(v3, pxCharactorCollider.tempV3, pxCharactorCollider.tempV3);
        this._pxController && this._pxController.setPosition(value);
    }

    /**
     * @en Gets the position of the character controller.
     * @returns The position vector.
     * @zh 获取角色控制器的位置。
     * @returns 位置向量。
     */
    getPosition(): Vector3 {
        const v3 = this._pxController.getPosition();
        pxCharactorCollider.tempV3.set(v3.x, v3.y, v3.z);
        return pxCharactorCollider.tempV3;
    }

    /**
     * @en Sets the local offset of the character's shape.
     * @param value The local offset vector.
     * @zh 设置角色形状的局部偏移。
     * @param value 局部偏移向量。
     */
    setShapelocalOffset(value: Vector3) {
        this._localOffset = value;
    }

    /**
     * @en Sets the height of the character controller.
     * @param value The height value.
     * @zh 设置角色控制器的高度。
     * @param value 高度值。
     */
    setHeight(value: number) {
        this._height = value;
        let scale = this._getNodeScale();
        this._pxController && this._pxController.resize(this._height * scale.y)
    }

    /**
     * @en Sets the radius of the character controller.
     * @param value The radius value.
     * @zh 设置角色控制器的半径。
     * @param value 半径值。
     */
    setRadius(value: number) {
        this._radius = value;
        let scale = this._getNodeScale();
        this._pxController && this._pxController.setRadius(this._radius * Math.max(scale.x, scale.z))
    }

    /**
     * @en Sets the minimum distance for the character controller.
     * @param value The minimum distance value.
     * @zh 设置角色控制器的最小距离。
     * @param value 最小距离值。
     */
    setminDistance(value: number) {
        this._minDistance = value;
    }

    /**
     * @en Sets the non-walkable mode for the character controller.
     * @param value The non-walkable mode.
     * @zh 设置角色控制器的不可行走模式。
     * @param value 不可行走模式。
     */
    setNonWalkableMode(value: ControllerNonWalkableMode) {
        this._nonWalkableMode = value;
        this._pxController && this._pxController.setNonWalkableMode(this._nonWalkableMode);
    }

    /**
     * @en Sets the event filter for the character controller.
     * @param events An array of events to filter.
     * @zh 设置角色控制器的事件过滤器。
     * @param events 要过滤的事件数组。
     */
    setEventFilter(events: []): void {
        this._characterEvents = events;
        if (!this._pxController) return;
        let flag = partFlag.eCONTACT_DEFAULT;
        for (let i = 0, j = events.length; i < j; i++) {
            let value = events[i];
            // no trigger event
            if (value == Event.COLLISION_ENTER) {
                flag = flag | partFlag.eNOTIFY_TOUCH_PERSISTS | partFlag.eNOTIFY_CONTACT_POINTS;
            }
            if (value == Event.COLLISION_STAY) {
                flag = flag | partFlag.eNOTIFY_TOUCH_PERSISTS;
            }
            if (value == Event.COLLISION_EXIT) {
                flag = flag | partFlag.eNOTIFY_TOUCH_PERSISTS | partFlag.eNOTIFY_TOUCH_LOST;
            }
        }

        this._pxController && this._pxController.setEventFilter(flag);
    }

    /**
     * @en Releases the character controller resources.
     * @zh 释放角色控制器资源。
     */
    release() {
        if (this._pxController) {
            this._pxController.release();
            this._pxController = null;
        }
    }

}