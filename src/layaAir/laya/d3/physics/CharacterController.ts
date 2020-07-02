import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { Utils3D } from "../utils/Utils3D";
import { PhysicsComponent } from "./PhysicsComponent";
import { ColliderShape } from "./shape/ColliderShape";
import { Component } from "../../components/Component";
import { ILaya3D } from "../../../ILaya3D";

/**
 * <code>CharacterController</code> 类用于创建角色控制器。
 */
export class CharacterController extends PhysicsComponent {
	/** @internal */
	private static _btTempVector30: number;

	/**
	 * @internal
	 */
	static __init__(): void {
		CharacterController._btTempVector30 = ILaya3D.Physics3D._bullet.btVector3_create(0, 0, 0);
	}

	/* UP轴_X轴。*/
	static UPAXIS_X: number = 0;
	/* UP轴_Y轴。*/
	static UPAXIS_Y: number = 1;
	/* UP轴_Z轴。*/
	static UPAXIS_Z: number = 2;

	/** @internal */
	private _stepHeight: number;
	/** @internal */
	private _upAxis: Vector3 = new Vector3(0, 1, 0);
	/**@internal */
	private _maxSlope: number = 45.0;
	/**@internal */
	private _jumpSpeed: number = 10.0;
	/**@internal */
	private _fallSpeed: number = 55.0;
	/** @internal */
	private _gravity: Vector3 = new Vector3(0, -9.8 * 3, 0);

	/**@internal */
	_btKinematicCharacter: number = null;

	/**
	 * 角色降落速度。
	 */
	get fallSpeed(): number {
		return this._fallSpeed;
	}

	set fallSpeed(value: number) {
		this._fallSpeed = value;
		ILaya3D.Physics3D._bullet.btKinematicCharacterController_setFallSpeed(this._btKinematicCharacter, value);
	}

	/**
	 * 角色跳跃速度。
	 */
	get jumpSpeed(): number {
		return this._jumpSpeed;
	}

	set jumpSpeed(value: number) {
		this._jumpSpeed = value;
		ILaya3D.Physics3D._bullet.btKinematicCharacterController_setJumpSpeed(this._btKinematicCharacter, value);
	}

	/**
	 * 重力。
	 */
	get gravity(): Vector3 {
		return this._gravity;
	}

	set gravity(value: Vector3) {
		this._gravity = value;
		var bt: any = ILaya3D.Physics3D._bullet;
		var btGravity: number = CharacterController._btTempVector30;
		bt.btVector3_setValue(btGravity, -value.x, value.y, value.z);
		bt.btKinematicCharacterController_setGravity(this._btKinematicCharacter, btGravity);
	}

	/**
	 * 最大坡度。
	 */
	get maxSlope(): number {
		return this._maxSlope;
	}

	set maxSlope(value: number) {
		this._maxSlope = value;
		ILaya3D.Physics3D._bullet.btKinematicCharacterController_setMaxSlope(this._btKinematicCharacter, (value / 180) * Math.PI);
	}

	/**
	 * 角色是否在地表。
	 */
	get isGrounded(): boolean {
		return ILaya3D.Physics3D._bullet.btKinematicCharacterController_onGround(this._btKinematicCharacter);
	}

	/**
	 * 角色行走的脚步高度，表示可跨越的最大高度。
	 */
	get stepHeight(): number {
		return this._stepHeight;
	}

	set stepHeight(value: number) {
		this._stepHeight = value;
		ILaya3D.Physics3D._bullet.btKinematicCharacterController_setStepHeight(this._btKinematicCharacter, value);
	}

	/**
	 * 角色的Up轴。
	 */
	get upAxis(): Vector3 {
		return this._upAxis;
	}

	set upAxis(value: Vector3) {
		this._upAxis = value;
		var btUpAxis: number = CharacterController._btTempVector30;
		Utils3D._convertToBulletVec3(value, btUpAxis, false);
		ILaya3D.Physics3D._bullet.btKinematicCharacterController_setUp(this._btKinematicCharacter, btUpAxis);
	}

	/**
	 * 创建一个 <code>CharacterController</code> 实例。
	 * @param stepheight 角色脚步高度。
	 * @param upAxis 角色Up轴
	 * @param collisionGroup 所属碰撞组。
	 * @param canCollideWith 可产生碰撞的碰撞组。
	 */
	constructor(stepheight: number = 0.1, upAxis: Vector3 = null, collisionGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER, canCollideWith: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
		super(collisionGroup, canCollideWith);
		this._stepHeight = stepheight;
		(upAxis) && (this._upAxis = upAxis);
		this._controlBySimulation = true;
	}

	/**
	 * @internal
	 */
	private _constructCharacter(): void {
		var bt: any = ILaya3D.Physics3D._bullet;
		if (this._btKinematicCharacter)
			bt.btKinematicCharacterController_destroy(this._btKinematicCharacter);

		var btUpAxis: number = CharacterController._btTempVector30;
		bt.btVector3_setValue(btUpAxis, this._upAxis.x, this._upAxis.y, this._upAxis.z);
		this._btKinematicCharacter = bt.btKinematicCharacterController_create(this._btColliderObject, this._colliderShape._btShape, this._stepHeight, btUpAxis);
		this.fallSpeed = this._fallSpeed;
		this.maxSlope = this._maxSlope;
		this.jumpSpeed = this._jumpSpeed;
		this.gravity = this._gravity;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_onShapeChange(colShape: ColliderShape): void {
		super._onShapeChange(colShape);
		this._constructCharacter();
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_onAdded(): void {
		var bt: any = ILaya3D.Physics3D._bullet;
		var ghostObject: number = bt.btPairCachingGhostObject_create();
		bt.btCollisionObject_setUserIndex(ghostObject, this.id);
		bt.btCollisionObject_setCollisionFlags(ghostObject, PhysicsComponent.COLLISIONFLAGS_CHARACTER_OBJECT);
		this._btColliderObject = ghostObject;
		(this._colliderShape) && (this._constructCharacter());
		super._onAdded();
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_addToSimulation(): void {
		this._simulation._characters.push(this);
		this._simulation._addCharacter(this, this._collisionGroup, this._canCollideWith);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_removeFromSimulation(): void {
		this._simulation._removeCharacter(this);
		var characters: CharacterController[] = this._simulation._characters;
		characters.splice(characters.indexOf(this), 1);
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

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDestroy(): void {
		ILaya3D.Physics3D._bullet.btKinematicCharacterController_destroy(this._btKinematicCharacter);
		super._onDestroy();
		this._btKinematicCharacter = null;
	}

	/**
	 * 通过指定移动向量移动角色。
	 * @param	movement 移动向量。
	 */
	move(movement: Vector3): void {
		var btMovement: number = CharacterController._btVector30;
		var bt: any = ILaya3D.Physics3D._bullet;
		bt.btVector3_setValue(btMovement, -movement.x, movement.y, movement.z);
		bt.btKinematicCharacterController_setWalkDirection(this._btKinematicCharacter, btMovement);
	}

	/**
	 * 跳跃。
	 * @param velocity 跳跃速度。
	 */
	jump(velocity: Vector3 = null): void {
		var bt: any = ILaya3D.Physics3D._bullet;
		var btVelocity: number = CharacterController._btVector30;
		if (velocity) {
			Utils3D._convertToBulletVec3(velocity, btVelocity, true);
			bt.btKinematicCharacterController_jump(this._btKinematicCharacter, btVelocity);
		} else {
			bt.btVector3_setValue(btVelocity, 0, 0, 0);
			bt.btKinematicCharacterController_jump(this._btKinematicCharacter, btVelocity);
		}
	}
}

