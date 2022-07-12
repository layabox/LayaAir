import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { Utils3D } from "../utils/Utils3D";
import { PhysicsComponent } from "./PhysicsComponent";
import { ColliderShape } from "./shape/ColliderShape";
import { Component } from "../../components/Component";
import { ILaya3D } from "../../../ILaya3D";
import { Quaternion } from "../math/Quaternion";
import { Rigidbody3D } from "./Rigidbody3D";

/**
 * <code>CharacterController</code> 类用于创建角色控制器。
 */
export class CharacterController extends PhysicsComponent {
	/** @internal */
	private static _btTempVector30: number;
	/** @internal */
	private static tmpPosition = new Vector3();
	/** @internal */
	private static tmpOrientation = new Quaternion();
	/**
	 * @internal
	 */
	static __init__(): void {
		CharacterController._btTempVector30 = ILaya3D.Physics3D._bullet.btVector3_create(0, 0, 0);
	}

	/* UP轴_X轴。*/
	static UPAXIS_X = 0;
	/* UP轴_Y轴。*/
	static UPAXIS_Y = 1;
	/* UP轴_Z轴。*/
	static UPAXIS_Z = 2;
	
	

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
	_btKinematicCharacter: number = null;

	userData: any;

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
		bt.btVector3_setValue(btGravity, value.x, value.y, value.z);
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
		Utils3D._convertToBulletVec3(value, btUpAxis);
		ILaya3D.Physics3D._bullet.btKinematicCharacterController_setUp(this._btKinematicCharacter, btUpAxis);
	}

	/**
	 * 角色位置
	 */
	get position() {
		let bt = ILaya3D.Physics3D._bullet;
		let pPos = bt.btKinematicCharacterController_getCurrentPosition(this._btKinematicCharacter);
		CharacterController.tmpPosition.setValue(
			bt.btVector3_x(pPos),
			bt.btVector3_y(pPos),
			bt.btVector3_z(pPos));
		return CharacterController.tmpPosition;
	}

	set position(v: Vector3) {
		var bt = ILaya3D.Physics3D._bullet;
		bt.btKinematicCharacterController_setCurrentPosition(this._btKinematicCharacter, v.x, v.y, v.z);
		//var btColliderObject = this._btColliderObject;
		//bt.btCollisionObject_setWorldTransformPos(btColliderObject, v.x, v.y, v.z);		
	}

	/**
	 * 获得角色四元数
	 */
	get orientation() {
		let bt = ILaya3D.Physics3D._bullet;
		let pQuat = bt.btKinematicCharacterController_getCurrentOrientation(this._btKinematicCharacter);
		CharacterController.tmpOrientation.setValue(
			bt.btQuaternion_x(pQuat),
			bt.btQuaternion_y(pQuat),
			bt.btQuaternion_z(pQuat),
			bt.btQuaternion_w(pQuat));
		return CharacterController.tmpOrientation;
	}

	set orientation(v: Quaternion) {
		var bt = ILaya3D.Physics3D._bullet;
		var btColliderObject = this._btColliderObject;
		// 不能按照rigidbody算，会破坏内存
		//bt.btRigidBody_setCenterOfMassOrientation(btColliderObject, v.x, v.y, v.z, v.w);
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

	private setJumpAxis(x: number, y: number, z: number) {
		ILaya3D.Physics3D._bullet.btKinematicCharacterController_setJumpAxis(this._btKinematicCharacter, x, y, z);
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
	 * @internal
	 */
	private _constructCharacter(): void {
		var bt: any = ILaya3D.Physics3D._bullet;
		if (this._btKinematicCharacter)
			bt.btKinematicCharacterController_destroy(this._btKinematicCharacter);

		var btUpAxis: number = CharacterController._btTempVector30;
		bt.btVector3_setValue(btUpAxis, this._upAxis.x, this._upAxis.y, this._upAxis.z);
		this._btKinematicCharacter = bt.btKinematicCharacterController_create(this._btColliderObject, this._colliderShape._btShape, this._stepHeight, btUpAxis);
		//bt.btKinematicCharacterController_setUseGhostSweepTest(this._btKinematicCharacter, false);
		this.fallSpeed = this._fallSpeed;
		this.maxSlope = this._maxSlope;
		this.jumpSpeed = this._jumpSpeed;
		this.gravity = this._gravity;
		this.setJumpAxis(0, 1, 0);
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
	 * 获得碰撞标签
	 * @returns 
	 */
	getHitFlag() {
		return ILaya3D.Physics3D._bullet.btKinematicCharacterController_getHitFlag(this._btKinematicCharacter);
	}

	/**
	 * 获得速度
	 * @returns 
	 */
	getVerticalVel() {
		return ILaya3D.Physics3D._bullet.btKinematicCharacterController_getVerticalVelocity(this._btKinematicCharacter);
	}

	/**
	 * 获得角色碰撞的对象
	 * @param cb 
	 */
	getOverlappingObj(cb: (body: Rigidbody3D) => void) {
		var bt: any = ILaya3D.Physics3D._bullet;
		let ghost = this._btColliderObject;
		let num = bt.btCollisionObject_getNumOverlappingObjects(ghost);
		for (let i = 0; i < num; i++) {
			let obj = bt.btCollisionObject_getOverlappingObject(ghost, i);
			let comp = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(obj)] as Rigidbody3D;
			if (comp) {
				cb(comp);
			}
		}
	}

	/**
	 * 通过指定移动向量移动角色。
	 * @param	movement 移动向量。
	 */
	move(movement: Vector3): void {
		var btMovement: number = CharacterController._btVector30;
		var bt: any = ILaya3D.Physics3D._bullet;
		bt.btVector3_setValue(btMovement, movement.x, movement.y, movement.z);
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
			Utils3D._convertToBulletVec3(velocity, btVelocity);
			bt.btKinematicCharacterController_jump(this._btKinematicCharacter, btVelocity);
		} else {
			bt.btVector3_setValue(btVelocity, 0, 0, 0);
			bt.btKinematicCharacterController_jump(this._btKinematicCharacter, btVelocity);
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

