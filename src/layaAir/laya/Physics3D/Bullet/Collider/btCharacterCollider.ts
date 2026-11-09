import { btCollider, btColliderType } from "./btCollider";
import { ICharacterController } from "../../interface/ICharacterController";
import { Vector3 } from "../../../maths/Vector3";
import type { btPhysicsManager } from "../btPhysicsManager";
import { ECharacterCapable } from "../../physicsEnum/ECharacterCapable";
import { btColliderShape } from "../Shape/btColliderShape";
import { PhysicsCombineMode } from "../../../d3/physics/PhysicsColliderComponent";
import { btCapsuleColliderShape } from "../Shape/btCapsuleColliderShape";
import { EPhysicsStatisticsInfo } from "../../physicsEnum/EPhysicsStatisticsInfo";
import { Physics3DStatInfo } from "../../interface/Physics3DStatInfo";
import { btStatics, convertToBulletVec3 } from "../btStatics";

/**
 * @en The btCharacterCollider class is used to handle 3D physics character colliders.
 * @zh btCharacterCollider 类用于处理3D物理角色碰撞器。
 */
export class btCharacterCollider extends btCollider implements ICharacterController {
    /** @internal */
    private static _btTempVector30: number;
    /** @internal */
    private static _btTempVector31: Vector3;
    private static _btGroundFrom: number;
    private static _btGroundTo: number;
    private static _btGroundCallback: number;
    private _walkDirection = new Vector3();
    private _gravitySuppressed = false;
    private _characterShape: number;
    private static _btSupportRayFrom: number;
    private static _btSupportRayTo: number;
    private static _btSupportRayCallback: number;
    private _supportObject = 0;
    private _supportPoint = new Vector3();
    // Native position, rotation and scale at the last full support sweep.
    private _supportTransform: number[] = [];
    private _supportBodyTransform: number[] = [];
    private _supportMoved = false;
    private static _supportBodyTransform: number[] = [];
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
        btCharacterCollider._btTempVector30 = btStatics.bt.btVector3_create(0, 0, 0);
        btCharacterCollider._btTempVector31 = new Vector3(0, 0, 0);
        btCharacterCollider._btGroundFrom = btStatics.bt.btTransform_create();
        btCharacterCollider._btGroundTo = btStatics.bt.btTransform_create();
        btCharacterCollider._btGroundCallback = btStatics.bt.AllConvexResultCallback_create(
            btCharacterCollider._btTempVector30, btCharacterCollider._btTempVector30);
        const bt = btStatics.bt;
        btCharacterCollider._btSupportRayFrom = bt.btVector3_create(0, 0, 0);
        btCharacterCollider._btSupportRayTo = bt.btVector3_create(0, 0, 0);
        btCharacterCollider._btSupportRayCallback = bt.AllHitsRayResultCallback_create(
            btCharacterCollider._btSupportRayFrom, btCharacterCollider._btSupportRayTo);
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
        var bt = btStatics.bt;
        var ghostObject: number = bt.btPairCachingGhostObject_create();
        bt.btCollisionObject_setUserIndex(ghostObject, this._id);
        bt.btCollisionObject_setCollisionFlags(ghostObject, btStatics.COLLISIONFLAGS_CHARACTER_OBJECT);
        bt.btCollisionObject_setContactProcessingThreshold(ghostObject, 0);
        this._btCollider = ghostObject;
        Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicaCharacterController, 1);
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
        // throw new NotImplementedError;
    }
    /**
     * @en Set the position.
     * @param value The position vector.
     * @zh 设置位置。
     * @param value 位置向量。
     */
    setPosition(value: Vector3): void {
        // bullet no direct setposition
        btStatics.bt.btKinematicCharacterController_setCurrentPosition(this._btKinematicCharacter, value.x, value.y, value.z);
    }
    /**
     * @en Get the current position.
     * @returns The position vector.
     * @zh 获取当前位置。
     * @returns 位置向量。
     */
    getPosition(): Vector3 {
        var bt = btStatics.bt;
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
        // throw new NotImplementedError;
    }
    /**
     * @en Set the dynamic friction of the character collider.
     * @param value The dynamic friction value.
     * @zh 设置角色碰撞器的动态摩擦力。
     * @param value 动态摩擦力值。
     */
    setDynamicFriction?(value: number): void {
        // bullet no dynamicFriction
        // throw new NotImplementedError;
    }
    /**
     * @en Set the static friction of the character collider.
     * @param value The static friction value.
     * @zh 设置角色碰撞器的静态摩擦力。
     * @param value 静态摩擦力值。
     */
    setStaticFriction?(value: number): void {
        // bullet no staticFriction
        // throw new NotImplementedError;
    }
    /**
     * @en Set the friction combine mode of the character collider.
     * @param value The friction combine mode.
     * @zh 设置角色碰撞器的摩擦力合并模式。
     * @param value 摩擦力合并模式。
     */
    setFrictionCombine?(value: PhysicsCombineMode): void {
        // bullet no frictionCombine
        // throw new NotImplementedError;
    }
    /**
     * @en Set the bounce combine mode of the character collider.
     * @param value The bounce combine mode.
     * @zh 设置角色碰撞器的弹力合并模式。
     * @param value 弹力合并模式。
     */
    setBounceCombine?(value: PhysicsCombineMode): void {
        // bullet no bounceCombine
        // throw new NotImplementedError;
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
        this._characterCapableMap.set(ECharacterCapable.Character_IsOnGround, true);
    }

    protected getColliderType(): btColliderType {
        return btColliderType.CharactorCollider;
    }

    protected _initCollider() {
        super._initCollider();
    }

    protected _onShapeChange() {
        this._supportObject = 0;
        super._onShapeChange();
        // Dimension changes reuse the native shape; retain velocity, jump origin,
        // jump axis and grounded state in the existing controller.
        if (this._btKinematicCharacter && this._characterShape === this._btColliderShape._btShape)
            return;
        this._characterShape = this._btColliderShape._btShape;
        var bt = btStatics.bt;
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
        this.move(this._walkDirection);
    }

    /**
     * @en Set the world position of the character.
     * @param value The new world position vector.
     * @zh 设置角色的世界位置。
     * @param value 新的世界位置向量。
     */
    setWorldPosition(value: Vector3): void {
        btStatics.bt.btKinematicCharacterController_setCurrentPosition(this._btKinematicCharacter, value.x, value.y, value.z);
    }

    /**
     * @en Move the character by a displacement vector.
     * @param disp The displacement vector.
     * @zh 通过位移向量移动角色。
     * @param disp 位移向量。
     */
    move(disp: Vector3): void {
        disp.cloneTo(this._walkDirection);
        var btMovement: number = btCharacterCollider._btVector30;
        btStatics.bt.btVector3_setValue(btMovement, disp.x, disp.y, disp.z);
        btStatics.bt.btKinematicCharacterController_setWalkDirection(this._btKinematicCharacter, btMovement);
    }

    /** @internal Suppress gravity only while resting on a walkable static surface. */
    _beforeSimulation(world: number): void {
        if (this._walkDirection.x !== 0 || this._walkDirection.y !== 0 || this._walkDirection.z !== 0
            || !this.isGrounded()) {
            this._supportObject = 0;
            return;
        }
        if (!this._hasStaticSupport(world))
            return;
        const bt = btStatics.bt;
        bt.btVector3_setValue(btCharacterCollider._btTempVector30, 0, 0, 0);
        bt.btKinematicCharacterController_setGravity(this._btKinematicCharacter, btCharacterCollider._btTempVector30);
        this._gravitySuppressed = true;
    }

    /** @internal Restore the configured gravity before callbacks, movement or jumping. */
    _afterSimulation(): void {
        if (this._gravitySuppressed) {
            this._gravitySuppressed = false;
            this.setGravity(this._gravity);
        }
    }

    private _hasStaticSupport(world: number): boolean {
        const bt = btStatics.bt;
        const up = this._upAxis;
        const length = Math.sqrt(up.x * up.x + up.y * up.y + up.z * up.z);
        if (length === 0 || Vector3.dot(this._gravity, up) >= 0)
            return false;
        const ux = up.x / length, uy = up.y / length, uz = up.z / length;
        const transform = bt.btCollisionObject_getWorldTransform(this._btCollider);
        const origin = bt.btTransform_getOrigin(transform);
        const x = bt.btVector3_x(origin), y = bt.btVector3_y(origin), z = bt.btVector3_z(origin);
        const from = btCharacterCollider._btGroundFrom, to = btCharacterCollider._btGroundTo;
        const vector = btCharacterCollider._btTempVector30;
        const rotation = bt.btTransform_getRotation(transform);
        const rx = bt.btQuaternion_x(rotation), ry = bt.btQuaternion_y(rotation);
        const rz = bt.btQuaternion_z(rotation), rw = bt.btQuaternion_w(rotation);
        const scale = bt.btCollisionShape_getLocalScaling(this._btColliderShape._btShape);
        const sx = bt.btVector3_x(scale), sy = bt.btVector3_y(scale), sz = bt.btVector3_z(scale);
        const cached = this._supportTransform;
        const minDot = Math.max(0.0001, Math.cos(this._maxSlope * Math.PI / 180));
        this._supportMoved = false;
        if (this._supportObject && Math.abs(x - cached[0]) < 1e-6 && Math.abs(y - cached[1]) < 1e-6
            && Math.abs(z - cached[2]) < 1e-6 && rx === cached[3] && ry === cached[4]
            && rz === cached[5] && rw === cached[6] && sx === cached[7] && sy === cached[8] && sz === cached[9]
            && this._checkSupportRay(world, ux, uy, uz, minDot))
            return true;
        this._supportObject = 0;
        // A short ray can still hit a floor that moved slightly down. Let gravity
        // resolve the new contact before acquiring support again.
        if (this._supportMoved)
            return false;
        bt.btTransform_setRotation(from, rotation);
        bt.btTransform_setRotation(to, rotation);
        // Start above the contact margin so penetrating contacts still yield a normal.
        bt.btVector3_setValue(vector, x + ux * 0.05, y + uy * 0.05, z + uz * 0.05);
        bt.btTransform_setOrigin(from, vector);
        bt.btVector3_setValue(vector, x - ux * 0.05, y - uy * 0.05, z - uz * 0.05);
        bt.btTransform_setOrigin(to, vector);
        const callback = btCharacterCollider._btGroundCallback;
        bt.ConvexResultCallback_set_m_collisionFilterGroup(callback, this._collisionGroup);
        bt.ConvexResultCallback_set_m_collisionFilterMask(callback, this._canCollideWith);
        bt.ConvexResultCallback_set_m_closestHitFraction(callback, 1);
        const objects = bt.AllConvexResultCallback_get_m_collisionObjects(callback);
        const normals = bt.AllConvexResultCallback_get_m_hitNormalWorld(callback);
        const points = bt.AllConvexResultCallback_get_m_hitPointWorld(callback);
        const fractions = bt.AllConvexResultCallback_get_m_hitFractions(callback);
        bt.tBtCollisionObjectArray_clear(objects);
        bt.tVector3Array_clear(normals);
        bt.tVector3Array_clear(points);
        bt.tScalarArray_clear(fractions);
        bt.btCollisionWorld_convexSweepTest(world,
            this._btColliderShape._btShape, from, to, callback, 0);
        let closest = 1, supported = false;
        for (let i = 0, n = bt.tBtCollisionObjectArray_size(objects); i < n; i++) {
            const object = bt.tBtCollisionObjectArray_at(objects, i);
            const flags = bt.btCollisionObject_getCollisionFlags(object);
            // Ignore ourselves and triggers. Moving bodies must retain normal gravity.
            if (object === this._btCollider || (flags & btStatics.COLLISIONFLAGS_NO_CONTACT_RESPONSE))
                continue;
            const normal = bt.tVector3Array_at(normals, i);
            const dot = ux * bt.btVector3_x(normal) + uy * bt.btVector3_y(normal) + uz * bt.btVector3_z(normal);
            const fraction = bt.tScalarArray_at(fractions, i);
            // The lower half of the probe only finds nearby ground. It must not
            // lock gravity while the capsule is still above that ground.
            if (dot >= minDot && fraction <= 0.5001 && fraction <= closest) {
                closest = fraction;
                supported = (flags & btStatics.COLLISIONFLAGS_STATIC_OBJECT) !== 0
                    && (flags & btStatics.COLLISIONFLAGS_KINEMATIC_OBJECT) === 0;
                this._supportObject = supported ? object : 0;
                if (supported) {
                    const point = bt.tVector3Array_at(points, i);
                    this._supportPoint.setValue(bt.btVector3_x(point), bt.btVector3_y(point), bt.btVector3_z(point));
                }
            }
        }
        if (supported) {
            this._readSupportBodyTransform(this._supportBodyTransform);
            cached[0] = x; cached[1] = y; cached[2] = z;
            cached[3] = rx; cached[4] = ry; cached[5] = rz; cached[6] = rw;
            cached[7] = sx; cached[8] = sy; cached[9] = sz;
        }
        return supported;
    }

    private _readSupportBodyTransform(out: number[]): void {
        const bt = btStatics.bt;
        const transform = bt.btCollisionObject_getWorldTransform(this._supportObject);
        const origin = bt.btTransform_getOrigin(transform);
        out[0] = bt.btVector3_x(origin); out[1] = bt.btVector3_y(origin); out[2] = bt.btVector3_z(origin);
        const rotation = bt.btTransform_getRotation(transform);
        out[3] = bt.btQuaternion_x(rotation); out[4] = bt.btQuaternion_y(rotation);
        out[5] = bt.btQuaternion_z(rotation); out[6] = bt.btQuaternion_w(rotation);
    }

    // Revalidate the actual contact point every substep. A removed or changed floor
    // fails immediately; only a stationary, unchanged capsule can use this fast path.
    private _checkSupportRay(world: number, ux: number, uy: number, uz: number, minDot: number): boolean {
        const bt = btStatics.bt, point = this._supportPoint;
        const from = btCharacterCollider._btSupportRayFrom, to = btCharacterCollider._btSupportRayTo;
        const callback = btCharacterCollider._btSupportRayCallback;
        bt.btVector3_setValue(from, point.x + ux * 0.05, point.y + uy * 0.05, point.z + uz * 0.05);
        bt.btVector3_setValue(to, point.x - ux * 0.05, point.y - uy * 0.05, point.z - uz * 0.05);
        bt.AllHitsRayResultCallback_set_m_rayFromWorld(callback, from);
        bt.AllHitsRayResultCallback_set_m_rayToWorld(callback, to);
        bt.RayResultCallback_set_m_collisionFilterGroup(callback, this._collisionGroup);
        bt.RayResultCallback_set_m_collisionFilterMask(callback, this._canCollideWith);
        bt.RayResultCallback_set_m_collisionObject(callback, 0);
        bt.RayResultCallback_set_m_closestHitFraction(callback, 1);
        const objects = bt.AllHitsRayResultCallback_get_m_collisionObjects(callback);
        const normals = bt.AllHitsRayResultCallback_get_m_hitNormalWorld(callback);
        const points = bt.AllHitsRayResultCallback_get_m_hitPointWorld(callback);
        bt.tBtCollisionObjectArray_clear(objects);
        bt.tVector3Array_clear(normals);
        bt.tVector3Array_clear(points);
        bt.tScalarArray_clear(bt.AllHitsRayResultCallback_get_m_hitFractions(callback));
        bt.btCollisionWorld_rayTest(world, from, to, callback);
        let found = false;
        for (let i = 0, n = bt.tBtCollisionObjectArray_size(objects); i < n; i++) {
            const object = bt.tBtCollisionObjectArray_at(objects, i);
            const flags = bt.btCollisionObject_getCollisionFlags(object);
            if (object === this._btCollider || (flags & btStatics.COLLISIONFLAGS_NO_CONTACT_RESPONSE))
                continue;
            // A new solid body at the contact invalidates the cached static support.
            if (object !== this._supportObject || !(flags & btStatics.COLLISIONFLAGS_STATIC_OBJECT)
                || (flags & btStatics.COLLISIONFLAGS_KINEMATIC_OBJECT))
                return false;
            const normal = bt.tVector3Array_at(normals, i);
            if (ux * bt.btVector3_x(normal) + uy * bt.btVector3_y(normal) + uz * bt.btVector3_z(normal) >= minDot) {
                const hit = bt.tVector3Array_at(points, i);
                if (Math.abs(bt.btVector3_x(hit) - point.x) > 1e-5
                    || Math.abs(bt.btVector3_y(hit) - point.y) > 1e-5
                    || Math.abs(bt.btVector3_z(hit) - point.z) > 1e-5) {
                    this._supportMoved = true;
                    return false;
                }
                found = true;
            }
        }
        if (found) {
            // Read the body only after the ray confirms it still exists in this world.
            const current = btCharacterCollider._supportBodyTransform;
            this._readSupportBodyTransform(current);
            for (let i = 0; i < 7; i++) {
                if (current[i] !== this._supportBodyTransform[i]) {
                    this._supportMoved = true;
                    return false;
                }
            }
        }
        return found;
    }

    /**
     * @en Make the character jump with a given velocity.
     * @param velocity The jump velocity vector.
     * @zh 使角色以给定的速度跳跃。
     * @param velocity 跳跃速度向量。
     */
    jump(velocity: Vector3): void {
        var btVelocity: number = btCharacterCollider._btVector30;
        if (velocity) {
            convertToBulletVec3(velocity, btVelocity);
            btStatics.bt.btKinematicCharacterController_jump(this._btKinematicCharacter, btVelocity);
        }
    }

    isGrounded(): boolean {
        let bt = btStatics.bt;
        return bt.btKinematicCharacterController_onGround(this._btKinematicCharacter) == 1 ? true : false;
    }

    /**
     * @en Set the jump speed of the character.
     * @param value The jump speed value.
     * @zh 设置角色的跳跃速度。
     * @param value 跳跃速度值。
     */
    setJumpSpeed(value: number): void {
        this._jumpSpeed = value;
        btStatics.bt.btKinematicCharacterController_setJumpSpeed(this._btKinematicCharacter, value);
    }

    /**
     * @en Set the step offset (height) for the character.
     * @param offset The step offset value.
     * @zh 设置角色的步高。
     * @param offset 步高值。
     */
    setStepOffset(offset: number): void {
        this._stepHeight = offset;
        btStatics.bt.btKinematicCharacterController_setStepHeight(this._btKinematicCharacter, offset);
    }

    /**
     * @en Set the up direction for the character.
     * @param up The up direction vector.
     * @zh 设置角色的向上方向。
     * @param up 向上方向向量。
     */
    setUpDirection(up: Vector3) {
        this._supportObject = 0;
        up.cloneTo(this._upAxis);
        var btUpAxis: number = btCharacterCollider._btTempVector30;
        convertToBulletVec3(up, btUpAxis);
        btStatics.bt.btKinematicCharacterController_setUp(this._btKinematicCharacter, btUpAxis);
    }

    /**
     * @en Get the vertical velocity of the character.
     * @zh 获取角色的垂直速度。
     */
    getVerticalVel(): number {
        return btStatics.bt.btKinematicCharacterController_getVerticalVelocity(this._btKinematicCharacter);
    }

    /**
     * @en Set the slope limit for the character.
     * @param slopeLimit The slope limit in degrees.
     * @zh 设置角色的坡度限制。
     * @param slopeLimit 坡度限制（以度为单位）。
     */
    setSlopeLimit(slopeLimit: number): void {
        this._maxSlope = slopeLimit;
        btStatics.bt.btKinematicCharacterController_setMaxSlope(this._btKinematicCharacter, (slopeLimit / 180) * Math.PI);
    }

    /**
     * @en Set the fall speed for the character.
     * @param value The fall speed value.
     * @zh 设置角色的下落速度。
     * @param value 下落速度值。
     */
    setfallSpeed(value: number): void {
        this._fallSpeed = value;
        btStatics.bt.btKinematicCharacterController_setFallSpeed(this._btKinematicCharacter, value);
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
            btStatics.bt.btKinematicCharacterController_setPushForce(this._btKinematicCharacter, value);
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
        var btGravity: number = btCharacterCollider._btTempVector30;
        btStatics.bt.btVector3_setValue(btGravity, value.x, value.y, value.z);
        btStatics.bt.btKinematicCharacterController_setGravity(this._btKinematicCharacter, btGravity);
    }

    /**
     * @en Get the overlapping objects of the character.
     * @param cb Callback function to handle each overlapping object.
     * @zh 获得角色碰撞的对象。
     * @param cb 处理每个重叠对象的回调函数。
     */
    getOverlappingObj(cb: (body: btCollider) => void) {
        var bt = btStatics.bt;
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
        if (shape instanceof btCapsuleColliderShape)
            shape._enableCharacterResizing();
        super.setColliderShape(shape);
    }

    /**
     * @en Destroy CharacterController
     * @zh 销毁角色控制器
     */
    destroy(): void {
        btStatics.bt.btKinematicCharacterController_destroy(this._btKinematicCharacter);
        Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicaCharacterController, -1);
        super.destroy();
        this._btKinematicCharacter = null;
    }
}