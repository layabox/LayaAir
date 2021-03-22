import { Component } from "../../components/Component";
import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { Utils3D } from "../utils/Utils3D";
import { PhysicsComponent } from "./PhysicsComponent";
import { PhysicsTriggerComponent } from "./PhysicsTriggerComponent";
import { ColliderShape } from "./shape/ColliderShape";
import { ConstraintComponent } from "./constraints/ConstraintComponent";
import { ILaya3D } from "../../../ILaya3D";

/**
 * <code>Rigidbody3D</code> 类用于创建刚体碰撞器。
 */
export class Rigidbody3D extends PhysicsTriggerComponent {
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
	private static _btTempVector30: number;
	/** @internal */
	private static _btTempVector31: number;
	/** @internal */
	private static _btVector3Zero: number;
	/**@internal */
	private static _btTransform0: number;
	/** @internal */
	private static _btInertia: number;
	/** @internal */
	private static _btImpulse: number;
	/** @internal */
	private static _btImpulseOffset: number;
	/** @internal */
	private static _btGravity: number;


	/**
	 * @internal
	 */
	static __init__(): void {
		var bt: any = ILaya3D.Physics3D._bullet;
		Rigidbody3D._btTempVector30 = bt.btVector3_create(0, 0, 0);
		Rigidbody3D._btTempVector31 = bt.btVector3_create(0, 0, 0);
		Rigidbody3D._btVector3Zero = bt.btVector3_create(0, 0, 0);
		Rigidbody3D._btInertia = bt.btVector3_create(0, 0, 0);
		Rigidbody3D._btImpulse = bt.btVector3_create(0, 0, 0);
		Rigidbody3D._btImpulseOffset = bt.btVector3_create(0, 0, 0);
		Rigidbody3D._btGravity = bt.btVector3_create(0, 0, 0);
		Rigidbody3D._btTransform0 = bt.btTransform_create();
	}

	/** @internal */
	private _btLayaMotionState: number;
	/** @internal */
	private _isKinematic: boolean = false;
	/** @internal */
	private _mass: number = 1.0;
	/** @internal */
	private _gravity: Vector3 = new Vector3(0, -10, 0);
	/** @internal */
	private _angularDamping: number = 0.0;
	/** @internal */
	private _linearDamping: number = 0.0;
	/** @internal */
	private _overrideGravity: boolean = false;
	/** @internal */
	private _totalTorque: Vector3 = new Vector3(0, 0, 0);
	/** @internal */
	private _totalForce: Vector3 = new Vector3(0, 0, 0);
	/** @internal */
	private _linearVelocity: Vector3 = new Vector3();
	/** @internal */
	private _angularVelocity: Vector3 = new Vector3();
	/** @internal */
	private _linearFactor: Vector3 = new Vector3(1, 1, 1);
	/** @internal */
	private _angularFactor: Vector3 = new Vector3(1, 1, 1);
	/** @internal */
	private _detectCollisions: boolean = true;
	//private var _linkedConstraints:Array;//TODO:
	/** @internal */
	private _constaintRigidbodyA:ConstraintComponent;
	/** @internal */
	private _constaintRigidbodyB:ConstraintComponent;
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
		var bt: any = ILaya3D.Physics3D._bullet;
		var canInSimulation: boolean = !!(this._simulation && this._enabled && this._colliderShape);
		canInSimulation && this._removeFromSimulation();
		var natColObj: any = this._btColliderObject;
		var flags: number = bt.btCollisionObject_getCollisionFlags(natColObj);
		if (value) {
			flags = flags | PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
			bt.btCollisionObject_setCollisionFlags(natColObj, flags);//加入场景前必须配置flag,加入后无效
			bt.btCollisionObject_forceActivationState(this._btColliderObject, PhysicsComponent.ACTIVATIONSTATE_DISABLE_DEACTIVATION);//触发器开启主动检测,并防止睡眠
			this._enableProcessCollisions = false;
			this._updateMass(0);//必须设置Mass为0来保证InverMass为0
		} else {
			if ((flags & PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT) > 0)
				flags = flags ^ PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
			bt.btCollisionObject_setCollisionFlags(natColObj, flags);//加入场景前必须配置flag,加入后无效
			bt.btCollisionObject_setActivationState(this._btColliderObject, PhysicsComponent.ACTIVATIONSTATE_ACTIVE_TAG);
			this._enableProcessCollisions = true;
			this._updateMass(this._mass);
		}

		var btZero: number = Rigidbody3D._btVector3Zero;
		bt.btCollisionObject_setInterpolationLinearVelocity(natColObj, btZero);
		bt.btRigidBody_setLinearVelocity(natColObj, btZero);
		bt.btCollisionObject_setInterpolationAngularVelocity(natColObj, btZero);
		bt.btRigidBody_setAngularVelocity(natColObj, btZero);

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
			ILaya3D.Physics3D._bullet.btRigidBody_setDamping(this._btColliderObject, value, this._angularDamping);
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
			ILaya3D.Physics3D._bullet.btRigidBody_setDamping(this._btColliderObject, this._linearDamping, value);
	}

	/**
	 * 是否重载重力。
	 */
	get overrideGravity(): boolean {
		return this._overrideGravity;
	}

	set overrideGravity(value: boolean) {
		this._overrideGravity = value;
		var bt: any = ILaya3D.Physics3D._bullet;
		if (this._btColliderObject) {
			var flag: number = bt.btRigidBody_getFlags(this._btColliderObject);
			if (value) {
				if ((flag & Rigidbody3D._BT_DISABLE_WORLD_GRAVITY) === 0)
					bt.btRigidBody_setFlags(this._btColliderObject, flag | Rigidbody3D._BT_DISABLE_WORLD_GRAVITY);
			} else {
				if ((flag & Rigidbody3D._BT_DISABLE_WORLD_GRAVITY) > 0)
					bt.btRigidBody_setFlags(this._btColliderObject, flag ^ Rigidbody3D._BT_DISABLE_WORLD_GRAVITY);
			}
		}
	}

	/**
	 * 重力。
	 */
	get gravity(): Vector3 {
		var bt: any = ILaya3D.Physics3D._bullet;
		Rigidbody3D._btGravity = bt.btRigidBody_getGravity(this._btColliderObject);
		Utils3D._convertToLayaVec3(Rigidbody3D._btGravity , this._gravity, true);
		return this._gravity;
	}

	set gravity(value: Vector3) {
		this._gravity = value;
		var bt: any = ILaya3D.Physics3D._bullet;
		bt.btVector3_setValue(Rigidbody3D._btGravity, -value.x, value.y, value.z);
		bt.btRigidBody_setGravity(this._btColliderObject, Rigidbody3D._btGravity);
	}

	/**
	 * 总力。
	 */
	get totalForce(): Vector3 {
		if (this._btColliderObject) {
			var btTotalForce: number = ILaya3D.Physics3D._bullet.btRigidBody_getTotalForce(this._btColliderObject);
			Utils3D._convertToLayaVec3(btTotalForce, this._totalForce, true);
			return this._totalForce;
		}
		return null;
	}

	/**
	 * 每个轴的线性运动缩放因子,如果某一轴的值为0表示冻结在该轴的线性运动。
	 */
	get linearFactor(): Vector3 {
		return this._linearFactor;
	}

	set linearFactor(value: Vector3) {
		this._linearFactor = value;
		var btValue: number = Rigidbody3D._btTempVector30;
		Utils3D._convertToBulletVec3(value, btValue, false);
		ILaya3D.Physics3D._bullet.btRigidBody_setLinearFactor(this._btColliderObject, btValue);
	}

	/**
	 * 线速度
	 */
	get linearVelocity(): Vector3 {
		if (this._btColliderObject)
			Utils3D._convertToLayaVec3(ILaya3D.Physics3D._bullet.btRigidBody_getLinearVelocity(this._btColliderObject), this._linearVelocity, true);
		return this._linearVelocity;
	}

	set linearVelocity(value: Vector3) {
		this._linearVelocity = value;
		if (this._btColliderObject) {
			var btValue: number = Rigidbody3D._btTempVector30;
			Utils3D._convertToBulletVec3(value, btValue, true);
			(this.isSleeping) && (this.wakeUp());//可能会因睡眠导致设置线速度无效
			ILaya3D.Physics3D._bullet.btRigidBody_setLinearVelocity(this._btColliderObject, btValue);
		}
	}

	/**
	 * 每个轴的角度运动缩放因子,如果某一轴的值为0表示冻结在该轴的角度运动。
	 */
	get angularFactor(): Vector3 {
		return this._angularFactor;
	}

	set angularFactor(value: Vector3) {
		this._angularFactor = value;
		var btValue: number = Rigidbody3D._btTempVector30;
		Utils3D._convertToBulletVec3(value, btValue, false);
		ILaya3D.Physics3D._bullet.btRigidBody_setAngularFactor(this._btColliderObject, btValue);

	}

	/**
	 * 角速度。
	 */
	get angularVelocity(): Vector3 {
		if (this._btColliderObject)
			Utils3D._convertToLayaVec3(ILaya3D.Physics3D._bullet.btRigidBody_getAngularVelocity(this._btColliderObject), this._angularVelocity, true);
		return this._angularVelocity;
	}

	set angularVelocity(value: Vector3) {
		this._angularVelocity = value;
		if (this._btColliderObject) {
			var btValue: number = Rigidbody3D._btTempVector30;
			Utils3D._convertToBulletVec3(value, btValue, true);
			(this.isSleeping) && (this.wakeUp());//可能会因睡眠导致设置角速度无效
			ILaya3D.Physics3D._bullet.btRigidBody_setAngularVelocity(this._btColliderObject, btValue);
		}
	}

	/**
	 * 刚体所有扭力。
	 */
	get totalTorque(): Vector3 {
		if (this._btColliderObject) {
			var btTotalTorque: number = ILaya3D.Physics3D._bullet.btRigidBody_getTotalTorque(this._btColliderObject);
			Utils3D._convertToLayaVec3(btTotalTorque, this._totalTorque, true);
			return this._totalTorque;
		}
		return null;
	}

	/**
	 * 是否进行碰撞检测。
	 */
	get detectCollisions(): boolean {
		return this._detectCollisions;
	}

	set detectCollisions(value: boolean) {
		if (this._detectCollisions !== value) {
			this._detectCollisions = value;

			if (this._colliderShape && this._enabled && this._simulation) {
				this._simulation._removeRigidBody(this);
				this._simulation._addRigidBody(this, this._collisionGroup, value ? this._canCollideWith : 0);
				//_nativeColliderObject.getBroadphaseHandle().set_m_collisionFilterMask(value ? _canCollideWith : 0);//有延迟问题
			}
		}
	}

	/**
	 * 是否处于睡眠状态。
	 */
	get isSleeping(): boolean {
		if (this._btColliderObject)
			return ILaya3D.Physics3D._bullet.btCollisionObject_getActivationState(this._btColliderObject) === PhysicsComponent.ACTIVATIONSTATE_ISLAND_SLEEPING;
		return false;
	}

	/**
	 * 刚体睡眠的线速度阈值。
	 */
	get sleepLinearVelocity(): number {
		return ILaya3D.Physics3D._bullet.btRigidBody_getLinearSleepingThreshold(this._btColliderObject);
	}

	set sleepLinearVelocity(value: number) {
		var bt: any = ILaya3D.Physics3D._bullet;
		bt.btRigidBody_setSleepingThresholds(this._btColliderObject, value, bt.btRigidBody_getAngularSleepingThreshold(this._btColliderObject));
	}

	/**
	 * 刚体睡眠的角速度阈值。
	 */
	get sleepAngularVelocity(): number {
		return ILaya3D.Physics3D._bullet.btRigidBody_getAngularSleepingThreshold(this._btColliderObject);
	}

	set sleepAngularVelocity(value: number) {
		var bt: any = ILaya3D.Physics3D._bullet;
		bt.btRigidBody_setSleepingThresholds(this._btColliderObject, bt.btRigidBody_getLinearSleepingThreshold(this._btColliderObject), value);
	}

	get btColliderObject():number{
		return this._btColliderObject;
	}

	/**
	 * @internal
	 */	
	set constaintRigidbodyA(value:ConstraintComponent){
		this._constaintRigidbodyA = value;
	}
	/**
	 * @internal
	 */	
	get constaintRigidbodyA():ConstraintComponent{
		return this._constaintRigidbodyA;
	}
	/**
	 * @internal
	 */	
	set constaintRigidbodyB(value:ConstraintComponent){
		this._constaintRigidbodyB = value;
	}
	/**
	 * @internal
	 */	
	get constaintRigidbodyB():ConstraintComponent{
		return this._constaintRigidbodyB;
	}

	/**
	 * 创建一个 <code>RigidBody3D</code> 实例。
	 * @param collisionGroup 所属碰撞组。
	 * @param canCollideWith 可产生碰撞的碰撞组。
	 */
	constructor(collisionGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER, canCollideWith: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
		//LinkedConstraints = new List<Constraint>();
		super(collisionGroup, canCollideWith);
		this._controlBySimulation = true;
	}

	/**
	 * @internal
	 */
	private _updateMass(mass: number): void {
		if (this._btColliderObject && this._colliderShape) {
			var bt: any = ILaya3D.Physics3D._bullet;
			bt.btCollisionShape_calculateLocalInertia(this._colliderShape._btShape, mass, Rigidbody3D._btInertia);
			bt.btRigidBody_setMassProps(this._btColliderObject, mass, Rigidbody3D._btInertia);
			bt.btRigidBody_updateInertiaTensor(this._btColliderObject); //this was the major headache when I had to debug Slider and Hinge constraint
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
		var bt: any = ILaya3D.Physics3D._bullet;
		var btColliderObject: number = this._btColliderObject;
		var oriTransform: number = bt.btCollisionObject_getWorldTransform(btColliderObject);
		var transform: number =Rigidbody3D._btTransform0;//must use another transform
		bt.btTransform_equal(transform,oriTransform);
		this._innerDerivePhysicsTransformation(transform, force);
		bt.btRigidBody_setCenterOfMassTransform(btColliderObject, transform);//RigidBody use 'setCenterOfMassTransform' instead(influence interpolationWorldTransform and so on) ,or stepSimulation may return old transform because interpolation.
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_onAdded(): void {
		var bt: any = ILaya3D.Physics3D._bullet;
		var motionState: number = bt.layaMotionState_create();
		bt.layaMotionState_set_rigidBodyID(motionState, this._id);
		this._btLayaMotionState = motionState;
		var constructInfo: number = bt.btRigidBodyConstructionInfo_create(0.0, motionState, null, Rigidbody3D._btVector3Zero);
		var btRigid: number = bt.btRigidBody_create(constructInfo);
		bt.btCollisionObject_setUserIndex(btRigid, this.id);
		this._btColliderObject = btRigid;
		super._onAdded();
		this.mass = this._mass;
		this.linearFactor = this._linearFactor;
		this.angularFactor = this._angularFactor;
		this.linearDamping = this._linearDamping;
		this.angularDamping = this._angularDamping;
		this.overrideGravity = this._overrideGravity;
		this.gravity = this._gravity;
		this.isKinematic = this._isKinematic;
		bt.btRigidBodyConstructionInfo_destroy(constructInfo);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_onEnable(){
		super._onEnable();
		if(this._constaintRigidbodyA){
			if(this._constaintRigidbodyA.connectedBody._simulation){
				this._constaintRigidbodyA._createConstraint();
				this._constaintRigidbodyA._onEnable();
			}
		}
		if(this._constaintRigidbodyB){
			if(this._constaintRigidbodyB.ownBody._simulation){
				this._constaintRigidbodyB._createConstraint();
				this._constaintRigidbodyB._onEnable();
			}
		}
	}
	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_onShapeChange(colShape: ColliderShape): void {
		super._onShapeChange(colShape);
		//TODO:此时已经加入场景,只影响mass为0,函数内部设置的flas是否为static无效			
		if (this._isKinematic) {
			this._updateMass(0);
		} else {
			var bt: any = ILaya3D.Physics3D._bullet;
			bt.btRigidBody_setCenterOfMassTransform(this._btColliderObject, bt.btCollisionObject_getWorldTransform(this._btColliderObject));//修改Shape会影响坐标,需要更新插值坐标,否则物理引擎motionState.setWorldTrans数据为旧数据
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
		(data.rollingFriction != null) && (this.rollingFriction = data.rollingFriction);
		(data.restitution != null) && (this.restitution = data.restitution);
		(data.isTrigger != null) && (this.isTrigger = data.isTrigger);
		(data.mass != null) && (this.mass = data.mass);
		(data.linearDamping != null) && (this.linearDamping = data.linearDamping);
		(data.angularDamping != null) && (this.angularDamping = data.angularDamping);
		(data.overrideGravity != null) && (this.overrideGravity = data.overrideGravity);

		if (data.linearFactor != null) {
			var linFac = this.linearFactor;
			linFac.fromArray(data.linearFactor);
			this.linearFactor = linFac;
		}
		if (data.angularFactor != null) {
			var angFac = this.angularFactor;
			angFac.fromArray(data.angularFactor);
			this.angularFactor = angFac;
		}

		if (data.gravity) {
			this.gravity.fromArray(data.gravity);
			this.gravity = this.gravity;
		}
		super._parse(data);
		this._parseShape(data.shapes);
		(data.isKinematic != null) && (this.isKinematic = data.isKinematic);
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDestroy(): void {
		ILaya3D.Physics3D._bullet.btMotionState_destroy(this._btLayaMotionState);

		////Remove constraints safely
		//var toremove = new FastList<Constraint>();
		//foreach (var c in LinkedConstraints)
		//{
		//toremove.Add(c);
		//}

		//foreach (var disposable in toremove)
		//{
		//disposable.Dispose();
		//}

		//LinkedConstraints.Clear();
		////~Remove constraints

		super._onDestroy();
		this._btLayaMotionState = null;
		this._gravity = null;
		this._totalTorque = null;
		this._linearVelocity = null;
		this._angularVelocity = null;
		this._linearFactor = null;
		this._angularFactor = null;
		if(this.constaintRigidbodyA)
			this.constaintRigidbodyA._breakConstrained();	
		if(this.constaintRigidbodyB){
			this.constaintRigidbodyB.connectedBody = null;
			this.constaintRigidbodyB._onDisable();
		}
			
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_addToSimulation(): void {
		this._simulation._addRigidBody(this, this._collisionGroup, this._detectCollisions ? this._canCollideWith : 0);
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
		var destRigidbody3D: Rigidbody3D = (<Rigidbody3D>dest);
		destRigidbody3D.isKinematic = this._isKinematic;
		destRigidbody3D.mass = this._mass;
		destRigidbody3D.gravity = this._gravity;
		destRigidbody3D.angularDamping = this._angularDamping;
		destRigidbody3D.linearDamping = this._linearDamping;
		destRigidbody3D.overrideGravity = this._overrideGravity;
		//destRigidbody3D.totalTorque = _totalTorque;
		destRigidbody3D.linearVelocity = this._linearVelocity;
		destRigidbody3D.angularVelocity = this._angularVelocity;
		destRigidbody3D.linearFactor = this._linearFactor;
		destRigidbody3D.angularFactor = this._angularFactor;
		destRigidbody3D.detectCollisions = this._detectCollisions;
	}

	/**
	 * 应用作用力。
	 * @param	force 作用力。
	 * @param	localOffset 偏移,如果为null则为中心点
	 */
	applyForce(force: Vector3, localOffset: Vector3 = null): void {
		if (this._btColliderObject == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
		var bt: any = ILaya3D.Physics3D._bullet;
		var btForce: number = Rigidbody3D._btTempVector30;
		bt.btVector3_setValue(btForce, -force.x, force.y, force.z);
		if (localOffset) {
			var btOffset: number = Rigidbody3D._btTempVector31;
			bt.btVector3_setValue(btOffset, -localOffset.x, localOffset.y, localOffset.z);
			bt.btRigidBody_applyForce(this._btColliderObject, btForce, btOffset);
		} else {
			bt.btRigidBody_applyCentralForce(this._btColliderObject, btForce);
		}
	}

	/**
	 * 应用扭转力。
	 * @param	torque 扭转力。
	 */
	applyTorque(torque: Vector3): void {
		if (this._btColliderObject == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
		var bullet: any = ILaya3D.Physics3D._bullet;
		var btTorque: number = Rigidbody3D._btTempVector30;
		bullet.btVector3_setValue(btTorque, -torque.x, torque.y, torque.z);
		bullet.btRigidBody_applyTorque(this._btColliderObject, btTorque);
	}

	/**
	 * 应用冲量。
	 * @param	impulse 冲量。
	 * @param   localOffset 偏移,如果为null则为中心点。
	 */
	applyImpulse(impulse: Vector3, localOffset: Vector3 = null): void {
		if (this._btColliderObject == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
		var bt: any = ILaya3D.Physics3D._bullet;
		bt.btVector3_setValue(Rigidbody3D._btImpulse, -impulse.x, impulse.y, impulse.z);
		if (localOffset) {
			bt.btVector3_setValue(Rigidbody3D._btImpulseOffset, -localOffset.x, localOffset.y, localOffset.z);
			bt.btRigidBody_applyImpulse(this._btColliderObject, Rigidbody3D._btImpulse, Rigidbody3D._btImpulseOffset);
		} else {
			bt.btRigidBody_applyCentralImpulse(this._btColliderObject, Rigidbody3D._btImpulse);
		}
	}

	/**
	 * 应用扭转冲量。
	 * @param	torqueImpulse
	 */
	applyTorqueImpulse(torqueImpulse: Vector3): void {
		if (this._btColliderObject == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
		var bt: any = ILaya3D.Physics3D._bullet;
		var btTorqueImpulse: number = Rigidbody3D._btTempVector30;
		bt.btVector3_setValue(btTorqueImpulse, -torqueImpulse.x, torqueImpulse.y, torqueImpulse.z);
		bt.btRigidBody_applyTorqueImpulse(this._btColliderObject, btTorqueImpulse);
	}

	/**
	 * 唤醒刚体。
	 */
	wakeUp(): void {
		this._btColliderObject && (ILaya3D.Physics3D._bullet.btCollisionObject_activate(this._btColliderObject, false));
	}

	/**
	 *清除应用到刚体上的所有力。
	 */
	clearForces(): void {
		var rigidBody: number = this._btColliderObject;
		if (rigidBody == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";

		var bt: any = ILaya3D.Physics3D._bullet;
		bt.btRigidBody_clearForces(rigidBody);
		var btZero: number = Rigidbody3D._btVector3Zero;
		bt.btCollisionObject_setInterpolationLinearVelocity(rigidBody, btZero);
		bt.btRigidBody_setLinearVelocity(rigidBody, btZero);
		bt.btCollisionObject_setInterpolationAngularVelocity(rigidBody, btZero);
		bt.btRigidBody_setAngularVelocity(rigidBody, btZero);
	}

}


