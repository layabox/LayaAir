import { Component } from "../../components/Component";
import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";

import { CannonColliderShape } from "./shape/CannonColliderShape";
import { CannonPhysicsCollider } from "./CannonPhysicsCollider";

//import { CannonConstraintComponent } from "./Cannonconstraints/ConstraintComponent";

/**
 * <code>Rigidbody3D</code> 类用于创建刚体碰撞器。
 */
export class CannonRigidbody3D extends CannonPhysicsCollider {
	/*
	 * 刚体类型_静态。
	 * 设定为永远不会移动刚体,引擎也不会自动更新。
	 * 如果你打算移动物理,建议使用TYPE_KINEMATIC。
	 */
	static TYPE_STATIC: number = 0;
	/*
	 * 刚体类型_动态。
	 * 可以通过forces和impulsesy移动刚体,并且不需要修改移动转换。
	 */
	static TYPE_DYNAMIC: number = 1;
	/*
	 * 刚体类型_运动。
	 * 可以移动刚体,物理引擎会自动处理动态交互。
	 * 注意：和静态或其他类型刚体不会产生动态交互。
	 */
	static TYPE_KINEMATIC: number = 2;
	/** @internal */
	static _BT_DISABLE_WORLD_GRAVITY: number = 1;
	/** @internal */
	static _BT_ENABLE_GYROPSCOPIC_FORCE: number = 2;
	/** @internal */
	private static _btTempVector30: CANNON.Vec3;
	/** @internal */
	private static _btTempVector31: CANNON.Vec3;
	/**
	 * @internal
	 */
	static __init__(): void {
		CannonRigidbody3D._btTempVector30 =new CANNON.Vec3();
		CannonRigidbody3D._btTempVector31 = new CANNON.Vec3();
	}
	/** @internal */
	private _isKinematic: boolean = false;
	/** @internal */
	private _mass: number = 1.0;
	/** @internal */
	_gravity: Vector3 = new Vector3(0, -10, 0);
	/** @internal */
	private _angularDamping: number = 0.0;
	/** @internal */
	private _linearDamping: number = 0.0;
	/** @internal */
	private _totalTorque: Vector3 = new Vector3(0, 0, 0);
	/** @internal */
	private _totalForce: Vector3 = new Vector3(0, 0, 0);
	/** @internal */
	private _linearVelocity: Vector3 = new Vector3();
	/** @internal */
	private _angularVelocity: Vector3 = new Vector3();
	/**
	 * 质量。
	 */
	get mass(): number {
		return this._mass;
	}

	set mass(value: number) {
		value = Math.max(value, 1e-07);//质量最小为1e-07
		this._mass = value;
		(this._isKinematic) || (this._updateMass(value));
	}

	/**
	 * 是否为运动物体，如果为true仅可通过transform属性移动物体,而非其他力相关属性。
	 */
	get isKinematic(): boolean {
		return this._isKinematic;
	}

	set isKinematic(value: boolean) {
		this._isKinematic = value;
		this._controlBySimulation = !value;//isKinematic not controll by Simulation
		var canInSimulation: boolean = !!(this._simulation && this._enabled && this._colliderShape);
		canInSimulation && this._removeFromSimulation();
		var natColObj: CANNON.Body = this._btColliderObject;
		var flags = natColObj.type;
		if (value) {
			flags = flags | CANNON.Body.KINEMATIC;
			natColObj.type = flags;
			this._enableProcessCollisions = false;
			this._updateMass(0);//必须设置Mass为0来保证InverMass为0
		} else {
			if ((flags & CANNON.Body.KINEMATIC) > 0)
				flags = flags ^ CANNON.Body.KINEMATIC;
				natColObj.allowSleep = true;
				natColObj.type = flags;
			this._enableProcessCollisions = true;
			this._updateMass(this._mass);
		}
		natColObj.velocity.set(0.0,0.0,0.0);
		natColObj.angularVelocity.set(0.0,0.0,0.0);
		canInSimulation && this._addToSimulation();
	}

	/**
	 * 刚体的线阻力。
	 */
	get linearDamping(): number {
		return this._linearDamping;
	}

	set linearDamping(value: number) {
		this._linearDamping = value;
		if (this._btColliderObject)
			this._btColliderObject.linearDamping = value;
	}

	/**
	 * 刚体的角阻力。
	 */
	get angularDamping(): number {
		return this._angularDamping;
	}

	set angularDamping(value: number) {
		this._angularDamping = value;
		if (this._btColliderObject)
			this._btColliderObject.angularDamping = value;
	}

	/**
	 * 总力。
	 */
	get totalForce(): Vector3 {
		if (this._btColliderObject) {
			var btTotalForce:CANNON.Vec3= this.btColliderObject.force;
			this.totalForce.setValue(btTotalForce.x,btTotalForce.y,btTotalForce.z);
			return this._totalForce;
		}
		return null;
	}

	/**
	 * 线速度
	 */
	get linearVelocity(): Vector3 {
		if (this._btColliderObject){
			var phylinear:CANNON.Vec3 = this.btColliderObject.velocity;
			this._linearVelocity.setValue(phylinear.x,phylinear.y,phylinear.z);
		}
		return this._linearVelocity;
	}

	set linearVelocity(value: Vector3) {
		this._linearVelocity = value;
		if (this._btColliderObject) {
			var btValue: CANNON.Vec3= this.btColliderObject.velocity;
			(this.isSleeping)&&(this.wakeUp());
			btValue.set(value.x,value.y,value.z);
			this.btColliderObject.velocity = btValue;
		}
	}

	/**
	 * 角速度。
	 */
	get angularVelocity(): Vector3 {
		if (this._btColliderObject)
		{
			var phtqua:CANNON.Vec3 = this._btColliderObject.angularVelocity;
			this.angularVelocity.setValue(phtqua.x,phtqua.y,phtqua.z);
		}
		return this._angularVelocity;
	}

	set angularVelocity(value: Vector3) {
		this._angularVelocity = value;
		if (this._btColliderObject) {
			var btValue: CANNON.Vec3= this.btColliderObject.angularVelocity;
			(this.isSleeping)&&(this.wakeUp());
			btValue.set(value.x,value.y,value.z);
			this.btColliderObject.angularVelocity = btValue;
		}
	}

	/**
	 * 刚体所有扭力。
	 */
	get totalTorque(): Vector3 {
		if (this._btColliderObject) {
			var btTotalTorque:CANNON.Vec3 = this._btColliderObject.torque;
			this._totalTorque.setValue(btTotalTorque.x,btTotalTorque.y,btTotalTorque.z);
			return this._totalTorque;
		}
		return null;
	}

	/**
	 * 是否处于睡眠状态。
	 */
	get isSleeping(): boolean {
		if (this._btColliderObject)
			return this._btColliderObject.sleepState!=CANNON.Body.AWAKE;
		return false;
	}

	/**
	 * 刚体睡眠的线速度阈值。
	 */
	get sleepLinearVelocity(): number {
		return this._btColliderObject.sleepSpeedLimit;
	}

	set sleepLinearVelocity(value: number) {
		this._btColliderObject.sleepSpeedLimit = value;
	}

	get btColliderObject():CANNON.Body{
		return this._btColliderObject;
	}

	/**
	 * 创建一个 <code>RigidBody3D</code> 实例。
	 * @param collisionGroup 所属碰撞组。
	 * @param canCollideWith 可产生碰撞的碰撞组。
	 */
	constructor(collisionGroup: number = -1, canCollideWith: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
		super(collisionGroup, canCollideWith);
		this._controlBySimulation = true;
	}

	/**
	 * @internal
	 */
	private _updateMass(mass: number): void {
		if (this._btColliderObject && this._colliderShape) {
			this._btColliderObject.mass = mass;
			this._btColliderObject.updateMassProperties();
			this._btColliderObject.updateSolveMassProperties();
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _onScaleChange(scale: Vector3): void {
		super._onScaleChange(scale);
		this._updateMass(this._isKinematic ? 0 : this._mass);//修改缩放需要更新惯性
	}

	/**
	 * 	@internal
	 */
	_derivePhysicsTransformation(force: boolean): void {
		//TODO：
		 this._innerDerivePhysicsTransformation(this.btColliderObject, force);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_onAdded(): void {
		var btRigid: CANNON.Body = new CANNON.Body();
		btRigid.material = new CANNON.Material();
		btRigid.layaID = this.id;
		btRigid.collisionFilterGroup = this.collisionGroup;
		btRigid.collisionFilterMask = this._canCollideWith;
		this._btColliderObject = btRigid;
		super._onAdded();
		this.mass = this._mass;
		this.linearDamping = this._linearDamping;
		this.angularDamping = this._angularDamping;
		this.isKinematic = this._isKinematic;
		if(!this.isKinematic)
			this._btColliderObject.type = CANNON.Body.DYNAMIC;
		else
			this._btColliderObject.type = CANNON.Body.KINEMATIC;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_onShapeChange(colShape: CannonColliderShape): void {
		super._onShapeChange(colShape);		
		if (this._isKinematic) {
			this._updateMass(0);
		} else {
			this._updateMass(this._mass);
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_parse(data: any): void {
		(data.friction != null) && (this.friction = data.friction);
		(data.restitution != null) && (this.restitution = data.restitution);
		(data.isTrigger != null) && (this.isTrigger = data.isTrigger);
		(data.mass != null) && (this.mass = data.mass);
		(data.isKinematic != null) && (this.isKinematic = data.isKinematic);
		(data.linearDamping != null) && (this.linearDamping = data.linearDamping);
		(data.angularDamping != null) && (this.angularDamping = data.angularDamping);
		super._parse(data);
		this._parseShape(data.shapes);
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDestroy(): void {
	
		super._onDestroy();
		this._gravity = null;
		this._totalTorque = null;
		this._linearVelocity = null;
		this._angularVelocity = null;
	}
			
	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_addToSimulation(): void {
		this._simulation._addRigidBody(this);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_removeFromSimulation(): void {
		this._simulation._removeRigidBody(this);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_cloneTo(dest: Component): void {
		super._cloneTo(dest);
		var destRigidbody3D: CannonRigidbody3D = (<CannonRigidbody3D>dest);
		destRigidbody3D.isKinematic = this._isKinematic;
		destRigidbody3D.mass = this._mass;
		destRigidbody3D.angularDamping = this._angularDamping;
		destRigidbody3D.linearDamping = this._linearDamping;
		destRigidbody3D.linearVelocity = this._linearVelocity;
		destRigidbody3D.angularVelocity = this._angularVelocity;
	}

	/**
	 * 应用作用力。
	 * @param	force 作用力。
	 * @param	localOffset 偏移,如果为null则为中心点
	 */
	applyForce(force: Vector3, localOffset: Vector3 = null): void {
		if (this._btColliderObject == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
		var btForce: CANNON.Vec3 = CannonRigidbody3D._btTempVector30;
		btForce.set(force.x,force.y,force.z);
		var btOffset :CANNON.Vec3 = CannonRigidbody3D._btTempVector31;
		if(localOffset)
			btOffset.set(localOffset.x,localOffset.y,localOffset.z);
		else
			btOffset.set(0.0,0.0,0.0);
		this.btColliderObject.applyLocalForce(btForce,btOffset);
	}

	/**
	 * 应用扭转力。
	 * @param	torque 扭转力。
	 */
	applyTorque(torque: Vector3): void {
		if (this._btColliderObject == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
		var btTorque: CANNON.Vec3 = CannonRigidbody3D._btTempVector30;
		btTorque.set(torque.x,torque.y,torque.z);
		var oriTorque:CANNON.Vec3 = this.btColliderObject.torque;
		oriTorque.set(oriTorque.x+btTorque.x,oriTorque.y+btTorque.y,oriTorque.z+btTorque.z);
		this.btColliderObject.torque = oriTorque;
	}

	/**
	 * 应用冲量。
	 * @param	impulse 冲量。
	 * @param   localOffset 偏移,如果为null则为中心点。
	 */
	applyImpulse(impulse: Vector3, localOffset: Vector3 = null): void {
		if (this._btColliderObject == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
		if (this._btColliderObject == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
		var btForce: CANNON.Vec3 = CannonRigidbody3D._btTempVector30;
		btForce.set(impulse.x,impulse.y,impulse.z);
		var btOffset :CANNON.Vec3 = CannonRigidbody3D._btTempVector31;
		if(localOffset)
			btOffset.set(localOffset.x,localOffset.y,localOffset.z);
		else
			btOffset.set(0.0,0.0,0.0);
		this.btColliderObject.applyImpulse(btForce,btOffset);
	}

	/**
	 * 唤醒刚体。
	 */
	wakeUp(): void {
		this._btColliderObject && this._btColliderObject.wakeUp();
	}

	/**
	 *清除应用到刚体上的所有力。
	 */
	clearForces(): void {
		var rigidBody:CANNON.Body = this._btColliderObject;
		if (rigidBody == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
		rigidBody.velocity.set(0.0,0.0,0.0);
		rigidBody.velocity = rigidBody.velocity;
		rigidBody.angularVelocity.set(0.0,0.0,0.0);
		rigidBody.angularVelocity = rigidBody.angularVelocity;

	}
}


