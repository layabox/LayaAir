import { Component } from "../../components/Component";
import { Vector3 } from "../../maths/Vector3";
import { Scene3D } from "../core/scene/Scene3D";
import { PhysicsColliderComponent } from "./PhysicsColliderComponent";
import { Laya3D } from "../../../Laya3D";
import { ICharacterController } from "../../Physics3D/interface/ICharacterController";
import { CapsuleColliderShape } from "./shape/CapsuleColliderShape";
import { ECharacterCapable } from "../../Physics3D/physicsEnum/ECharacterCapable";
import { EPhysicsCapable } from "../../Physics3D/physicsEnum/EPhycisCapable";
import { Event } from "../../events/Event";

/**
 * <code>CharacterController</code> 类用于创建角色控制器。
 */
export class CharacterController extends PhysicsColliderComponent {

    /**@internal */
    protected _collider: ICharacterController;
    /** @internal */
    private _stepHeight: number = 0.1;
    /** @internal */
    private _upAxis = new Vector3(0, 1, 0);
    /**@internal */
    private _maxSlope = 90.0;	// 45度容易在地形上卡住
    /** @internal */
    private _gravity = new Vector3(0, -9.8, 0);
    /**@internal */
    private _radius: number = 0.5;
    /**@internal */
    private _height: number = 2;
    /**@internal */
    private _offset: Vector3 = new Vector3();
    /**@internal */
    private _contactOffset: number;
    /**@internal */
    private _minDistance: number = 0;
    /**@internal */
    private _simGravity: Vector3 = new Vector3(0, -9.8 / 60, 0);
    /**@internal */
    private _pushForce: number = 1;
    /**
     * @override
     * @internal
     */
    protected _initCollider() {
        this._physicsManager = (this.owner.scene as Scene3D).physicsSimulation;
        if (Laya3D.enablePhysics && this._physicsManager && Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_CharacterCollider)) {
            this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
            this._collider = Laya3D.PhysicsCreateUtil.createCharacterController(this._physicsManager);
            this.colliderShape = new CapsuleColliderShape();
        } else {
            console.error("CharacterController: cant enable CharacterController");
        }
    }

    onUpdate(): void {
        if (this._collider && this._collider.getCapable(ECharacterCapable.Character_SimulateGravity)) {
            // physX need to simulate character Gravity.
            this.move(this._simGravity);
        }
    }

    /**
     * 胶囊半径。
     */
    get radius(): number {
        return this._radius;
    }

    set radius(value: number) {
        this._radius = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_Radius)) {
            this._collider.setRadius(this._radius);
            this._colliderShape && ((this._colliderShape as CapsuleColliderShape).radius = value);
        }
    }

    /**
     * 高度。
     */
    get height(): number {
        return this._height;
    }

    set height(value: number) {
        this._height = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_Height)) {
            this._collider.setHeight(this._height);
            this._colliderShape && ((this._colliderShape as CapsuleColliderShape).length = value);
        }
    }

    /**
     * 
     */
    get minDistance(): number {
        return this._minDistance;
    }

    set minDistance(value: number) {
        this._minDistance = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_minDistance)) {
            this._collider.setminDistance(this._minDistance);
        }
    }

    /**
     * 碰撞偏移
     */
    get centerOffset(): Vector3 {
        return this._offset;
    }

    set centerOffset(value: Vector3) {
        this._offset = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_offset)) {
            this._collider.setShapelocalOffset(this._offset);
            this._colliderShape && ((this._colliderShape as CapsuleColliderShape).localOffset = value);
        }
    }


    /**
     * 重力。
     */
    get gravity(): Vector3 {
        return this._gravity;
    }

    set gravity(value: Vector3) {
        this._gravity = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Charcater_Gravity)) {
            this._collider.setGravity(value);
        }
    }

    /**
    * 碰撞偏移。
    */
    get skinWidth(): number {
        return this._contactOffset;
    }

    set skinWidth(value: number) {
        this._contactOffset = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_Skin)) {
            this._collider.setSkinWidth(value);
        }
    }

    /**
     * 最大坡度。
     */
    get maxSlope(): number {
        return this._maxSlope;
    }

    set maxSlope(value: number) {
        this._maxSlope = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_SlopeLimit)) {
            this._collider.setSlopeLimit(value);
        }
    }

    /**
     * 角色行走的脚步高度，表示可跨越的最大高度。
     */
    get stepHeight(): number {
        return this._stepHeight;
    }

    set stepHeight(value: number) {
        this._stepHeight = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Charcater_StepOffset)) {
            this._collider.setStepOffset(value);
        }
    }

    /**
     * 角色的Up轴。
     */
    get upAxis(): Vector3 {
        return this._upAxis;
    }

    set upAxis(value: Vector3) {
        this._upAxis = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_UpDirection)) {
            this._collider.setUpDirection(value);
        }
    }

    /**
     * 角色位置
     */
    get position() {
        return null;
    }

    set position(v: Vector3) {
        if (this._collider && this.collider.getCapable(ECharacterCapable.Charcater_WorldPosition)) {
            this._collider.setPosition(v);
        }
    }

    /**
     * 推动力大小
     */
    public get pushForce(): number {
        return this._pushForce;
    }
    public set pushForce(value: number) {
        this._pushForce = value;
        if (this._collider && this.collider.getCapable(ECharacterCapable.Character_PushForce)) {
            this._collider.setPushForce(value);
        }
    }

    /**
     * 创建一个 <code>CharacterController</code> 实例。
     * @param stepheight 角色脚步高度。
     * @param upAxis 角色Up轴
     * @param collisionGroup 所属碰撞组。
     * @param canCollideWith 可产生碰撞的碰撞组。
     */
    constructor() {
        super();
    }

    /**
     * 获得速度
     * @returns 
     */
    getVerticalVel() {
        return this._collider ? this._collider.getVerticalVel() : 0;
    }

    /**
     * 通过指定移动向量移动角色。
     * @param	movement 移动向量。
     */
    move(movement: Vector3): void {
        if (this._collider && this.collider.getCapable(ECharacterCapable.Charcater_Move)) {
            this._collider.move(movement);
        }
    }

    /**
     * 跳跃。
     * @param velocity 跳跃速度。
     */
    jump(velocity: Vector3 = null): void {
        if (this._collider && this.collider.getCapable(ECharacterCapable.Charcater_Jump)) {
            if (velocity) {
                this._collider.jump(velocity);
            } else {
                // Utils3D._tempV0.set(0, this._jumpSpeed, 0)
                this._collider.jump(velocity);
            }
        }
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _cloneTo(dest: Component): void {
        super._cloneTo(dest);
        var destCharacterController: CharacterController = <CharacterController>dest;
        destCharacterController.stepHeight = this._stepHeight;
        destCharacterController.upAxis = this._upAxis;
        destCharacterController.maxSlope = this._maxSlope;
        destCharacterController.gravity = this._gravity;
    }

    /**
     * @internal
     */
    protected _setEventFilter() {
        if (this._collider && this._collider.getCapable(ECharacterCapable.Character_EventFilter)) {
            this._eventsArray = [];
            // event 
            if (this.owner.hasListener(Event.COLLISION_ENTER)) {
                this._eventsArray.push(Event.COLLISION_ENTER);
            }
            if (this.owner.hasListener(Event.COLLISION_STAY)) {
                this._eventsArray.push(Event.COLLISION_STAY);
            }
            if (this.owner.hasListener(Event.COLLISION_EXIT)) {
                this._eventsArray.push(Event.COLLISION_EXIT);
            }
            this._collider.setEventFilter(this._eventsArray);
        }
    }
}

