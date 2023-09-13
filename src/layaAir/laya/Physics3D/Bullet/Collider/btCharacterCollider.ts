import { btCollider, btColliderType } from "./btCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { ICharacterController } from "../../interface/ICharacterController";
import { Vector3 } from "../../../maths/Vector3";
import { btPhysicsManager } from "../btPhysicsManager";
import { ECharacterCapable } from "../../physicsEnum/ECharacterCapable";
import { btColliderShape } from "../Shape/btColliderShape";
import { PhysicsCombineMode } from "../../../d3/physics/PhysicsColliderComponent";

export class btCharacterCollider extends btCollider implements ICharacterController {


    /** @internal */
    private static _btTempVector30: number;
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
    /** @internal */
    private _gravity = new Vector3(0, -9.8 * 3, 0);

    /**@internal */
    private _pushForce = 1;

    /**@internal */
    static _characterCapableMap: Map<any, any>;

    /** @internal */
    componentEnable: boolean;

    static __init__(): void {
        let bt = btPhysicsCreateUtil._bt;
        btCharacterCollider._btTempVector30 = bt.btVector3_create(0, 0, 0);
        btCharacterCollider.initCapable();
    }

    getCapable(value: number): boolean {
        return btCharacterCollider.getCharacterCapable(value);
    }

    constructor(physicsManager: btPhysicsManager) {
        super(physicsManager);
        this._enableProcessCollisions = true;  // not support trigger
        var bt = btPhysicsCreateUtil._bt;
        var ghostObject: number = bt.btPairCachingGhostObject_create();
        bt.btCollisionObject_setUserIndex(ghostObject, this._id);
        bt.btCollisionObject_setCollisionFlags(ghostObject, btPhysicsManager.COLLISIONFLAGS_CHARACTER_OBJECT);
        this._btCollider = ghostObject;
    }
    setShapelocalOffset(value: Vector3): void {
        throw new Error("Method not implemented.");
    }
    setSkinWidth?(width: number): void {
        throw new Error("Method not implemented.");
    }
    setPosition(value: Vector3): void {
        throw new Error("Method not implemented.");
    }
    setRadius?(value: number): void {
        throw new Error("Method not implemented.");
    }
    setHeight?(value: number): void {
        throw new Error("Method not implemented.");
    }
    setminDistance(value: number): void {
        throw new Error("Method not implemented.");
    }
    setDynamicFriction?(value: number): void {
        throw new Error("Method not implemented.");
    }
    setStaticFriction?(value: number): void {
        throw new Error("Method not implemented.");
    }
    setFrictionCombine?(value: PhysicsCombineMode): void {
        throw new Error("Method not implemented.");
    }
    setBounceCombine?(value: PhysicsCombineMode): void {
        throw new Error("Method not implemented.");
    }

    static getCharacterCapable(value: ECharacterCapable): boolean {
        return btCharacterCollider._characterCapableMap.get(value);
    }

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
        // this._characterCapableMap.set(ECharacterCapable.Character_PushForce, true);
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
        this.setGravity(this._gravity);
        bt.btKinematicCharacterController_setJumpAxis(this._btKinematicCharacter, 0, 1, 0);
        this.setpushForce(this._pushForce);
    }

    setWorldPosition(value: Vector3): void {
        var bt = btPhysicsCreateUtil._bt;
        bt.btKinematicCharacterController_setCurrentPosition(this._btKinematicCharacter, value.x, value.y, value.z);
    }

    move(disp: Vector3): void {
        var btMovement: number = btCharacterCollider._btVector30;
        var bt = btPhysicsCreateUtil._bt;
        bt.btVector3_setValue(btMovement, disp.x, disp.y, disp.z);
        bt.btKinematicCharacterController_setWalkDirection(this._btKinematicCharacter, btMovement);
    }

    jump(velocity: Vector3): void {
        var bt = btPhysicsCreateUtil._bt;
        var btVelocity: number = btCharacterCollider._btVector30;
        if (velocity) {
            btPhysicsManager._convertToBulletVec3(velocity, btVelocity);
            bt.btKinematicCharacterController_jump(this._btKinematicCharacter, btVelocity);
        }
    }

    setStepOffset(offset: number): void {
        this._stepHeight = offset;
        var bt = btPhysicsCreateUtil._bt;
        bt.btKinematicCharacterController_setStepHeight(this._btKinematicCharacter, offset);
    }

    setUpDirection(up: Vector3) {
        up.cloneTo(this._upAxis);
        var bt = btPhysicsCreateUtil._bt;
        var btUpAxis: number = btCharacterCollider._btTempVector30;
        btPhysicsManager._convertToBulletVec3(up, btUpAxis);
        bt.btKinematicCharacterController_setUp(this._btKinematicCharacter, btUpAxis);
    }

    getVerticalVel(): number {
        var bt = btPhysicsCreateUtil._bt;
        return bt.btKinematicCharacterController_getVerticalVelocity(this._btKinematicCharacter);
    }

    setSlopeLimit(slopeLimit: number): void {
        this._maxSlope = slopeLimit;
        var bt = btPhysicsCreateUtil._bt;
        bt.btKinematicCharacterController_setMaxSlope(this._btKinematicCharacter, (slopeLimit / 180) * Math.PI);
    }

    setfallSpeed(value: number): void {
        var bt = btPhysicsCreateUtil._bt;
        this._fallSpeed = value;
        bt.btKinematicCharacterController_setFallSpeed(this._btKinematicCharacter, value);
    }

    setpushForce(value: number): void {
        this._pushForce = value;
        if (this._btCollider && this._btKinematicCharacter) {
            var bt = btPhysicsCreateUtil._bt;
            bt.btKinematicCharacterController_setPushForce(this._btKinematicCharacter, value);
        }
    }

    setGravity(value: Vector3): void {
        this._gravity = value;
        var bt = btPhysicsCreateUtil._bt;
        var btGravity: number = btCharacterCollider._btTempVector30;
        bt.btVector3_setValue(btGravity, value.x, value.y, value.z);
        bt.btKinematicCharacterController_setGravity(this._btKinematicCharacter, btGravity);
    }

    /**
     * 获得角色碰撞的对象
     * @param cb 
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

    setColliderShape(shape: btColliderShape): void {
        super.setColliderShape(shape);
    }
}