import { btCollider, btColliderType } from "./btCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { ICharacterController } from "../../interface/ICharacterController";
import { Vector3 } from "../../../maths/Vector3";
import { btPhysicsManager } from "../btPhysicsManager";
import { ECharacterCapable } from "../../physicsEnum/ECharacterCapable";
import { btColliderShape } from "../Shape/btColliderShape";
import { PhysicsCombineMode } from "../../../d3/physics/PhysicsColliderComponent";
import { btCapsuleColliderShape } from "../Shape/btCapsuleColliderShape";

/**
 * @en The btCharacterCollider class is used to handle 3D physics character colliders.
 * @zh btCharacterCollider 类用于处理3D物理角色碰撞器。
 */
export class btCharacterCollider extends btCollider implements ICharacterController {
    /** @internal */
    private static _btTempVector30: number;
    /** @internal */
    private static _btTempVector31: Vector3;
    /**@internal */
    _btKinematicCharacter: number = null;
    /** @internal */
    private _stepHeight: number = 0.1;
    /** @internal */
    private _upAxis = new Vector3(0, 1, 0);
    /**@internal */
    private _maxSlope = 90.0;	// 45度容易在地形上卡住
    /**@internal */
    private _fallSpeed = 55.0;
    /**@internal */
    private _jumpSpeed = 10.0;
    /** @internal */
    private _gravity = new Vector3(0, -9.8 * 3, 0);

    /**@internal */
    private _pushForce = 1;

    /**@internal */
    static _characterCapableMap: Map<any, any>;

    /**
     * @internal
     * @en Whethe the character is enabled.
     * @zh 是否启用。
     */
    componentEnable: boolean;

    static __init__(): void {
        let bt = btPhysicsCreateUtil._bt;
        btCharacterCollider._btTempVector30 = bt.btVector3_create(0, 0, 0);
        btCharacterCollider._btTempVector31 = new Vector3(0, 0, 0);
        btCharacterCollider.initCapable();
    }

    /**
     * @en Check if the character is capable of a specific action.
     * @param value The capability to check.
     * @returns True if the character is capable, false otherwise.
     * @zh 检查角色是否能够执行特定动作。
     * @param value 要检查的能力。
     * @returns 如果角色具备该能力则返回 true，否则返回 false。
     */
    getCapable(value: number): boolean {
        return btCharacterCollider.getCharacterCapable(value);
    }

    /**
     * @en Creates an instance of the btCharacterCollider class.
     * @param physicsManager The physics manager instance.
     * @zh 创建一个 btCharacterCollider 类的实例。
     * @param physicsManager 物理管理器实例。
     */
    constructor(physicsManager: btPhysicsManager) {
        super(physicsManager);
        this._enableProcessCollisions = true;
        var bt = btPhysicsCreateUtil._bt;
        var ghostObject: number = bt.btPairCachingGhostObject_create();
        bt.btCollisionObject_setUserIndex(ghostObject, this._id);
        bt.btCollisionObject_setCollisionFlags(ghostObject, btPhysicsManager.COLLISIONFLAGS_CHARACTER_OBJECT);
        bt.btCollisionObject_setContactProcessingThreshold(ghostObject, 0);
        this._btCollider = ghostObject;
    }
    /**
     * @en Set the local offset of the collider shape.
     * @param value The local offset vector.
     * @zh 设置碰撞器形状的偏移。
     * @param value 偏移向量。
     */
    setShapelocalOffset(value: Vector3): void {
        this._btColliderShape && (this._btColliderShape as btCapsuleColliderShape).setOffset(value);
    }
    /**
     * @en Set the skin width of the character collider.
     * @param width The skin width value.
     * @zh 设置角色碰撞器的皮肤宽度。
     * @param width 皮肤宽度值。
     */
    setSkinWidth?(width: number): void {
        // bullet no skinwidth
        // throw new Error("Method not implemented.");
    }
    /**
     * @en Set the position.
     * @param value The position vector.
     * @zh 设置位置。
     * @param value 位置向量。
     */
    setPosition(value: Vector3): void {
        // bullet no direct setposition
        var bt = btPhysicsCreateUtil._bt;
        bt.btKinematicCharacterController_setCurrentPosition(this._btKinematicCharacter, value.x, value.y, value.z);
    }
    /**
     * @en Get the current position.
     * @returns The position vector.
     * @zh 获取当前位置。
     * @returns 位置向量。
     */
    getPosition(): Vector3 {
        var bt = btPhysicsCreateUtil._bt;
        let pPos = bt.btKinematicCharacterController_getCurrentPosition(this._btKinematicCharacter);
        btCharacterCollider._btTempVector31.setValue(bt.btVector3_x(pPos), bt.btVector3_y(pPos), bt.btVector3_z(pPos))
        return btCharacterCollider._btTempVector31;
    }
    /**
     * @en Set the radius of the character collider.
     * @param value The radius value.
     * @zh 设置角色碰撞器的半径。
     * @param value 半径值。
     */
    setRadius?(value: number): void {
        this._btColliderShape && (this._btColliderShape as btCapsuleColliderShape).setRadius(value);
    }
    /**
     * @en Set the height of the character collider.
     * @param value The height value.
     * @zh 设置角色碰撞器的高度。
     * @param value 高度值。
     */
    setHeight?(value: number): void {
        this._btColliderShape && (this._btColliderShape as btCapsuleColliderShape).setHeight(value);
    }
    /**
     * @en Set the minimum distance for the character collider.
     * @param value The minimum distance value.
     * @zh 设置角色碰撞器的最小距离。
     * @param value 最小距离值。
     */
    setminDistance(value: number): void {
        // bullet no mindistance
        // throw new Error("Method not implemented.");
    }
    /**
     * @en Set the dynamic friction of the character collider.
     * @param value The dynamic friction value.
     * @zh 设置角色碰撞器的动态摩擦力。
     * @param value 动态摩擦力值。
     */
    setDynamicFriction?(value: number): void {
        // bullet no dynamicFriction
        // throw new Error("Method not implemented.");
    }
    /**
     * @en Set the static friction of the character collider.
     * @param value The static friction value.
     * @zh 设置角色碰撞器的静态摩擦力。
     * @param value 静态摩擦力值。
     */
    setStaticFriction?(value: number): void {
        // bullet no staticFriction
        // throw new Error("Method not implemented.");
    }
    /**
     * @en Set the friction combine mode of the character collider.
     * @param value The friction combine mode.
     * @zh 设置角色碰撞器的摩擦力合并模式。
     * @param value 摩擦力合并模式。
     */
    setFrictionCombine?(value: PhysicsCombineMode): void {
        // bullet no frictionCombine
        // throw new Error("Method not implemented.");
    }
    /**
     * @en Set the bounce combine mode of the character collider.
     * @param value The bounce combine mode.
     * @zh 设置角色碰撞器的弹力合并模式。
     * @param value 弹力合并模式。
     */
    setBounceCombine?(value: PhysicsCombineMode): void {
        // bullet no bounceCombine
        // throw new Error("Method not implemented.");
    }
    /**
     * @en Get the character capability status.
     * @param value The character capability to check.
     * @zh 获取角色能力状态。
     * @param value 要检查的角色能力。
     */
    static getCharacterCapable(value: ECharacterCapable): boolean {
        return btCharacterCollider._characterCapableMap.get(value);
    }

    /**
     * @en Initialize the capabilities of the character collider.
     * @zh 初始化角色碰撞器的能力。
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
        this._characterCapableMap.set(ECharacterCapable.Character_Skin, false);
        this._characterCapableMap.set(ECharacterCapable.Character_minDistance, false);
        this._characterCapableMap.set(ECharacterCapable.Character_EventFilter, false);
        this._characterCapableMap.set(ECharacterCapable.Character_SimulateGravity, false);
    }

    protected getColliderType(): btColliderType {
        return btColliderType.CharactorCollider;
    }

    protected _initCollider() {
        super._initCollider();
    }

    protected _onShapeChange() {
        super._onShapeChange();
        var bt = btPhysicsCreateUtil._bt;
        if (this._btKinematicCharacter)
            bt.btKinematicCharacterController_destroy(this._btKinematicCharacter);

        var btUpAxis: number = btCharacterCollider._btTempVector30;
        bt.btVector3_setValue(btUpAxis, this._upAxis.x, this._upAxis.y, this._upAxis.z);
        this._btKinematicCharacter = bt.btKinematicCharacterController_create(this._btCollider, this._btColliderShape._btShape, this._stepHeight, btUpAxis);
        //bt.btKinematicCharacterController_setUseGhostSweepTest(this._btKinematicCharacter, false);
        this.setfallSpeed(this._fallSpeed);
        this.setSlopeLimit(this._maxSlope);
        this.setJumpSpeed(this._jumpSpeed);
        this.setGravity(this._gravity);
        bt.btKinematicCharacterController_setJumpAxis(this._btKinematicCharacter, 0, 1, 0);
        this.setPushForce(this._pushForce);
    }

    /**
     * @en Set the world position of the character.
     * @param value The new world position vector.
     * @zh 设置角色的世界位置。
     * @param value 新的世界位置向量。
     */
    setWorldPosition(value: Vector3): void {
        var bt = btPhysicsCreateUtil._bt;
        bt.btKinematicCharacterController_setCurrentPosition(this._btKinematicCharacter, value.x, value.y, value.z);
    }

    /**
     * @en Move the character by a displacement vector.
     * @param disp The displacement vector.
     * @zh 通过位移向量移动角色。
     * @param disp 位移向量。
     */
    move(disp: Vector3): void {
        var btMovement: number = btCharacterCollider._btVector30;
        var bt = btPhysicsCreateUtil._bt;
        bt.btVector3_setValue(btMovement, disp.x, disp.y, disp.z);
        bt.btKinematicCharacterController_setWalkDirection(this._btKinematicCharacter, btMovement);
    }

    /**
     * @en Make the character jump with a given velocity.
     * @param velocity The jump velocity vector.
     * @zh 使角色以给定的速度跳跃。
     * @param velocity 跳跃速度向量。
     */
    jump(velocity: Vector3): void {
        var bt = btPhysicsCreateUtil._bt;
        var btVelocity: number = btCharacterCollider._btVector30;
        if (velocity) {
            btPhysicsManager._convertToBulletVec3(velocity, btVelocity);
            bt.btKinematicCharacterController_jump(this._btKinematicCharacter, btVelocity);
        }
    }

    /**
     * @en Set the jump speed of the character.
     * @param value The jump speed value.
     * @zh 设置角色的跳跃速度。
     * @param value 跳跃速度值。
     */
    setJumpSpeed(value: number): void {
        this._jumpSpeed = value;
        var bt = btPhysicsCreateUtil._bt;
        bt.btKinematicCharacterController_setJumpSpeed(this._btKinematicCharacter, value);
    }

    /**
     * @en Set the step offset (height) for the character.
     * @param offset The step offset value.
     * @zh 设置角色的步高。
     * @param offset 步高值。
     */
    setStepOffset(offset: number): void {
        this._stepHeight = offset;
        var bt = btPhysicsCreateUtil._bt;
        bt.btKinematicCharacterController_setStepHeight(this._btKinematicCharacter, offset);
    }

    /**
     * @en Set the up direction for the character.
     * @param up The up direction vector.
     * @zh 设置角色的向上方向。
     * @param up 向上方向向量。
     */
    setUpDirection(up: Vector3) {
        up.cloneTo(this._upAxis);
        var bt = btPhysicsCreateUtil._bt;
        var btUpAxis: number = btCharacterCollider._btTempVector30;
        btPhysicsManager._convertToBulletVec3(up, btUpAxis);
        bt.btKinematicCharacterController_setUp(this._btKinematicCharacter, btUpAxis);
    }

    /**
     * @en Get the vertical velocity of the character.
     * @zh 获取角色的垂直速度。
     */
    getVerticalVel(): number {
        var bt = btPhysicsCreateUtil._bt;
        return bt.btKinematicCharacterController_getVerticalVelocity(this._btKinematicCharacter);
    }

    /**
     * @en Set the slope limit for the character.
     * @param slopeLimit The slope limit in degrees.
     * @zh 设置角色的坡度限制。
     * @param slopeLimit 坡度限制（以度为单位）。
     */
    setSlopeLimit(slopeLimit: number): void {
        this._maxSlope = slopeLimit;
        var bt = btPhysicsCreateUtil._bt;
        bt.btKinematicCharacterController_setMaxSlope(this._btKinematicCharacter, (slopeLimit / 180) * Math.PI);
    }

    /**
     * @en Set the fall speed for the character.
     * @param value The fall speed value.
     * @zh 设置角色的下落速度。
     * @param value 下落速度值。
     */
    setfallSpeed(value: number): void {
        var bt = btPhysicsCreateUtil._bt;
        this._fallSpeed = value;
        bt.btKinematicCharacterController_setFallSpeed(this._btKinematicCharacter, value);
    }

    /**
     * @en Set the push force for the character.
     * @param value The push force value.
     * @zh 设置角色的推力。
     * @param value 推力值。
     */
    setPushForce(value: number): void {
        this._pushForce = value;
        if (this._btCollider && this._btKinematicCharacter) {
            var bt = btPhysicsCreateUtil._bt;
            bt.btKinematicCharacterController_setPushForce(this._btKinematicCharacter, value);
        }
    }

    /**
     * @en Set the gravity for the character.
     * @param value The gravity vector.
     * @zh 设置角色的重力。
     * @param value 重力向量。
     */
    setGravity(value: Vector3): void {
        this._gravity = value;
        var bt = btPhysicsCreateUtil._bt;
        var btGravity: number = btCharacterCollider._btTempVector30;
        bt.btVector3_setValue(btGravity, value.x, value.y, value.z);
        bt.btKinematicCharacterController_setGravity(this._btKinematicCharacter, btGravity);
    }

    /**
     * @en Get the overlapping objects of the character.
     * @param cb Callback function to handle each overlapping object.
     * @zh 获得角色碰撞的对象。
     * @param cb 处理每个重叠对象的回调函数。
     */
    getOverlappingObj(cb: (body: btCollider) => void) {
        var bt = btPhysicsCreateUtil._bt;
        let ghost = this._btCollider;
        let num = bt.btCollisionObject_getNumOverlappingObjects(ghost);
        for (let i = 0; i < num; i++) {
            let obj = bt.btCollisionObject_getOverlappingObject(ghost, i);
            let comp = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(obj)] as btCharacterCollider;
            if (comp) {
                cb(comp);
            }
        }
    }

    /**
     * @en Set the collider shape for the character.
     * @param shape The collider shape to set.
     * @zh 设置角色的碰撞器形状。
     * @param shape 要设置的碰撞器形状。
     */
    setColliderShape(shape: btColliderShape): void {
        super.setColliderShape(shape);
    }
}