import { Component } from "laya/components/Component";
import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { Utils3D } from "../utils/Utils3D";
import { PhysicsComponent } from "././PhysicsComponent";
import { Physics } from "./Physics";
import { ColliderShape } from "./shape/ColliderShape";

/**
 * <code>CharacterController</code> 类用于创建角色控制器。
 */
export class CharacterController extends PhysicsComponent {
	/** @private */
	private static _nativeTempVector30: any;

	/**
	 * @private
	 */
	static __init__(): void {
		CharacterController._nativeTempVector30 = new Physics._physics3D.btVector3(0, 0, 0);
	}

	/* UP轴_X轴。*/
	static UPAXIS_X: number = 0;
	/* UP轴_Y轴。*/
	static UPAXIS_Y: number = 1;
	/* UP轴_Z轴。*/
	static UPAXIS_Z: number = 2;

	/** @private */
	private _stepHeight: number;
	/** @private */
	private _upAxis: Vector3 = new Vector3(0, 1, 0);
	/**@private */
	private _maxSlope: number = 45.0;
	/**@private */
	private _jumpSpeed: number = 10.0;
	/**@private */
	private _fallSpeed: number = 55.0;
	/** @private */
	private _gravity: Vector3 = new Vector3(0, -9.8 * 3, 0);

	/**@private */
	_nativeKinematicCharacter: any;

	/**
	 * 获取角色降落速度。
	 * @return 角色降落速度。
	 */
	get fallSpeed(): number {
		return this._fallSpeed;
	}

	/**
	 * 设置角色降落速度。
	 * @param value 角色降落速度。
	 */
	set fallSpeed(value: number) {
		this._fallSpeed = value;
		this._nativeKinematicCharacter.setFallSpeed(value);
	}

	/**
	 * 获取角色跳跃速度。
	 * @return 角色跳跃速度。
	 */
	get jumpSpeed(): number {
		return this._jumpSpeed;
	}

	/**
	 * 设置角色跳跃速度。
	 * @param value 角色跳跃速度。
	 */
	set jumpSpeed(value: number) {
		this._jumpSpeed = value;
		this._nativeKinematicCharacter.setJumpSpeed(value);
	}

	/**
	 * 获取重力。
	 * @return 重力。
	 */
	get gravity(): Vector3 {
		return this._gravity;
	}

	/**
	 * 设置重力。
	 * @param value 重力。
	 */
	set gravity(value: Vector3) {
		this._gravity = value;
		var nativeGravity: any = CharacterController._nativeTempVector30;
		nativeGravity.setValue(-value.x, value.y, value.z);
		this._nativeKinematicCharacter.setGravity(nativeGravity);
	}

	/**
	 * 获取最大坡度。
	 * @return 最大坡度。
	 */
	get maxSlope(): number {
		return this._maxSlope;
	}

	/**
	 * 设置最大坡度。
	 * @param value 最大坡度。
	 */
	set maxSlope(value: number) {
		this._maxSlope = value;
		this._nativeKinematicCharacter.setMaxSlope((value / 180) * Math.PI);
	}

	/**
	 * 获取角色是否在地表。
	 */
	get isGrounded(): boolean {
		return this._nativeKinematicCharacter.onGround();
	}

	/**
	 * 获取角色行走的脚步高度，表示可跨越的最大高度。
	 * @return 脚步高度。
	 */
	get stepHeight(): number {
		return this._stepHeight;
	}

	/**
	 * 设置角色行走的脚步高度，表示可跨越的最大高度。
	 * @param value 脚步高度。
	 */
	set stepHeight(value: number) {
		this._stepHeight = value;
		this._constructCharacter();
	}

	/**
	 * 获取角色的Up轴。
	 * @return 角色的Up轴。
	 */
	get upAxis(): Vector3 {
		return this._upAxis;
	}

	/**
	 * 设置角色的Up轴。
	 * @return 角色的Up轴。
	 */
	set upAxis(value: Vector3) {
		this._upAxis = value;
		this._constructCharacter();
	}

	/**
	 * 创建一个 <code>CharacterController</code> 实例。
	 * @param stepheight 角色脚步高度。
	 * @param upAxis 角色Up轴
	 * @param collisionGroup 所属碰撞组。
	 * @param canCollideWith 可产生碰撞的碰撞组。
	 */
	constructor(stepheight: number = 0.1, upAxis: Vector3 = null, collisionGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER, canCollideWith: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		super(collisionGroup, canCollideWith);
		this._stepHeight = stepheight;
		(upAxis) && (this._upAxis = upAxis);
	}

	/**
	 * @private
	 */
	private _constructCharacter(): void {
		var physics3D: any = Physics._physics3D;
		if (this._nativeKinematicCharacter)
			physics3D.destroy(this._nativeKinematicCharacter);

		var nativeUpAxis: any = CharacterController._nativeTempVector30;
		nativeUpAxis.setValue(this._upAxis.x, this._upAxis.y, this._upAxis.z);
		this._nativeKinematicCharacter = new physics3D.btKinematicCharacterController(this._nativeColliderObject, this._colliderShape._nativeShape, this._stepHeight, nativeUpAxis);
		this.fallSpeed = this._fallSpeed;
		this.maxSlope = this._maxSlope;
		this.jumpSpeed = this._jumpSpeed;
		this.gravity = this._gravity;
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _onShapeChange(colShape: ColliderShape): void {
		super._onShapeChange(colShape);
		this._constructCharacter();
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _onAdded(): void {
		var physics3D: any = Physics._physics3D;
		var ghostObject: any = new physics3D.btPairCachingGhostObject();
		ghostObject.setUserIndex(this.id);
		ghostObject.setCollisionFlags(PhysicsComponent.COLLISIONFLAGS_CHARACTER_OBJECT);
		this._nativeColliderObject = ghostObject;

		if (this._colliderShape)
			this._constructCharacter();

		super._onAdded();
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _addToSimulation(): void {
		this._simulation._characters.push(this);
		this._simulation._addCharacter(this, this._collisionGroup, this._canCollideWith);
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _removeFromSimulation(): void {
		this._simulation._removeCharacter(this);
		var characters: CharacterController[] = this._simulation._characters;
		characters.splice(characters.indexOf(this), 1);
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _cloneTo(dest: Component): void {
		super._cloneTo(dest);
		var destCharacterController: CharacterController = (<CharacterController>dest);
		destCharacterController.stepHeight = this._stepHeight;
		destCharacterController.upAxis = this._upAxis;
		destCharacterController.maxSlope = this._maxSlope;
		destCharacterController.jumpSpeed = this._jumpSpeed;
		destCharacterController.fallSpeed = this._fallSpeed;
		destCharacterController.gravity = this._gravity;
	}

		/**
		 * @inheritDoc
		 */
		/*override*/ protected _onDestroy(): void {
		Physics._physics3D.destroy(this._nativeKinematicCharacter);
		super._onDestroy();
		this._nativeKinematicCharacter = null;
	}

	/**
	 * 通过指定移动向量移动角色。
	 * @param	movement 移动向量。
	 */
	move(movement: Vector3): void {
		var nativeMovement: any = CharacterController._nativeVector30;
		nativeMovement.setValue(-movement.x, movement.y, movement.z);
		this._nativeKinematicCharacter.setWalkDirection(nativeMovement);
	}

	/**
	 * 跳跃。
	 * @param velocity 跳跃速度。
	 */
	jump(velocity: Vector3 = null): void {
		if (velocity) {
			var nativeVelocity: any = CharacterController._nativeVector30;
			Utils3D._convertToBulletVec3(velocity, nativeVelocity, true);
			this._nativeKinematicCharacter.jump(nativeVelocity);
		} else {
			this._nativeKinematicCharacter.jump();
		}
	}
}

