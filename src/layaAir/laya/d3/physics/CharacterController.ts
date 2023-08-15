import { Utils3D } from "../utils/Utils3D";
import { Component } from "../../components/Component";
import { Vector3 } from "../../maths/Vector3";
import { Scene3D } from "../core/scene/Scene3D";
import { PhysicsColliderComponent } from "./PhysicsColliderComponent";
import { Laya3D } from "../../../Laya3D";
import { ICharacterController } from "../../Physics3D/interface/ICharacterController";

/**
 * <code>CharacterController</code> 类用于创建角色控制器。
 */
export class CharacterController extends PhysicsColliderComponent {

    /**@internal */
    protected _collider: ICharacterController;
    /** @internal */
    private _stepHeight: number;
    /** @internal */
    private _upAxis = new Vector3(0, 1, 0);
    /**@internal */
    private _maxSlope = 90.0;	// 45度容易在地形上卡住
    /**@internal */
    private _jumpSpeed = 10.0;
    /**@internal */
    private _fallSpeed = 55.0;
    /** @internal */
    private _gravity = new Vector3(0, -9.8 * 3, 0);
    /**@internal */
    private _pushForce = 1;

    /**
     * @override
     * @internal
     */
    protected _initCollider() {
        if (Laya3D.enablePhysics) {
            this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
            this._collider = Laya3D.PhysicsCreateUtil.createCharacterController(this._physicsManager);
        }
    }

    /**
     * 角色降落速度。
     */
    get fallSpeed(): number {
        return this._fallSpeed;
    }

    set fallSpeed(value: number) {
        this._collider && this._collider.setfallSpeed(value);
    }

    /**
     * 角色与其他物体碰撞的时候，产生的推力的大小
     */
    set pushForce(v: number) {
        this._pushForce = v;
        this._collider && this._collider.setpushForce(v);
    }

    get pushForce() {
        return this._pushForce;
    }

    /**
     * 角色跳跃速度。
     */
    get jumpSpeed(): number {
        return this._jumpSpeed;
    }

    set jumpSpeed(value: number) {
        this._jumpSpeed = value;
    }

    /**
     * 重力。
     */
    get gravity(): Vector3 {
        return this._gravity;
    }

    set gravity(value: Vector3) {
        this._gravity = value;
        this._collider && this._collider.setGravity(value);
    }

    /**
     * 最大坡度。
     */
    get maxSlope(): number {
        return this._maxSlope;
    }

    set maxSlope(value: number) {
        this._maxSlope = value;
        this._collider && this._collider.setSlopeLimit(value);
    }

    /**
     * 角色行走的脚步高度，表示可跨越的最大高度。
     */
    get stepHeight(): number {
        return this._stepHeight;
    }

    set stepHeight(value: number) {
        this._stepHeight = value;
        this._collider && this._collider.setStepOffset(value);
    }

    /**
     * 角色的Up轴。
     */
    get upAxis(): Vector3 {
        return this._upAxis;
    }

    set upAxis(value: Vector3) {
        this._upAxis = value;
        this._collider && this._collider.setUpDirection(value);
    }

    /**
     * 角色位置
     */
    get position() {
        return null;
    }

    set position(v: Vector3) {
        this._collider && this._collider.setWorldPosition(v);
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
        this._collider && this._collider.move(movement);
    }

    /**
     * 跳跃。
     * @param velocity 跳跃速度。
     */
    jump(velocity: Vector3 = null): void {

        if (velocity) {
            this._collider && this._collider.jump(velocity);
        } else {
            Utils3D._tempV0.set(0, this._jumpSpeed, 0)
            this._collider && this._collider.jump(Utils3D._tempV0);
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
        destCharacterController.jumpSpeed = this._jumpSpeed;
        destCharacterController.fallSpeed = this._fallSpeed;
        destCharacterController.gravity = this._gravity;
    }
}

