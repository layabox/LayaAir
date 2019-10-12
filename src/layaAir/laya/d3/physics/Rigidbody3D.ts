import { Component } from "../../components/Component";
import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { Utils3D } from "../utils/Utils3D";
import { PhysicsComponent } from "./PhysicsComponent";
import { Physics3D } from "./Physics3D";
import { PhysicsTriggerComponent } from "./PhysicsTriggerComponent";
import { ColliderShape } from "./shape/ColliderShape";

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
	private static _nativeTempVector30: number;
	/** @internal */
	private static _nativeTempVector31: number;
	/** @internal */
	private static _nativeVector3Zero: number;
	/** @internal */
	private static _nativeInertia: number;
	/** @internal */
	private static _nativeImpulse: number;
	/** @internal */
	private static _nativeImpulseOffset: number;
	/** @internal */
	private static _nativeGravity: number;


	/**
	 * @internal
	 */
	static __init__(): void {
		var physics3D: any = Physics3D._physics3D;
		Rigidbody3D._nativeTempVector30 = physics3D.btVector3_create(0, 0, 0);
		Rigidbody3D._nativeTempVector31 = physics3D.btVector3_create(0, 0, 0);
		Rigidbody3D._nativeVector3Zero = physics3D.btVector3_create(0, 0, 0);
		Rigidbody3D._nativeInertia = physics3D.btVector3_create(0, 0, 0);
		Rigidbody3D._nativeImpulse = physics3D.btVector3_create(0, 0, 0);
		Rigidbody3D._nativeImpulseOffset = physics3D.btVector3_create(0, 0, 0);
		Rigidbody3D._nativeGravity = physics3D.btVector3_create(0, 0, 0);

		var interactive: object = Physics3D._interactive;
		//Dynamic刚体,初始化时调用一次。
		//Kinematic刚体,每次物理tick时调用(如果未进入睡眠状态),让物理引擎知道刚体位置。
		interactive["getWorldTransform"] = (worldTransPointer: number) => { };
		//Dynamic刚体,物理引擎每帧调用一次,用于更新渲染矩阵。
		interactive["setWorldTransform"] = (worldTransPointer: number) => {
			var rigidBody: Rigidbody3D = (<any>this)._rigidbody;
			rigidBody._simulation._updatedRigidbodies++;
			var physics3D: any = Physics3D._physics3D;
			var worldTrans: any = physics3D.wrapPointer(worldTransPointer, physics3D.btTransform);
			rigidBody._updateTransformComponent(worldTrans);
		};
	}

	/** @internal */
	private _nativeMotionState: any;
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

	//private var _linkedConstraints:Array;//TODO:

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

	/**
	 * 获取质量。
	 * @return 质量。
	 */
	get mass(): number {
		return this._mass;
	}

	/**
	 * 设置质量。
	 * @param value 质量。
	 */
	set mass(value: number) {
		value = Math.max(value, 1e-07);//质量最小为1e-07
		this._mass = value;
		(this._isKinematic) || (this._updateMass(value));
	}

	/**
	 * 获取是否为运动物体，如果为true仅可通过transform属性移动物体,而非其他力相关属性。
	 * @return 是否为运动物体。
	 */
	get isKinematic(): boolean {
		return this._isKinematic;
	}

	/**
	 * 设置是否为运动物体，如果为true仅可通过transform属性移动物体,而非其他力相关属性。
	 * @param value 是否为运动物体。
	 */
	set isKinematic(value: boolean) {
		this._isKinematic = value;

		var physics3D: any = Physics3D._physics3D;
		var canInSimulation: boolean = !!(this._simulation && this._enabled && this._colliderShape);
		canInSimulation && this._removeFromSimulation();
		var natColObj: any = this._nativeColliderObject;
		var flags: number = physics3D.btCollisionObject_getCollisionFlags(natColObj);
		if (value) {
			flags = flags | PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
			physics3D.btCollisionObject_setCollisionFlags(natColObj, flags);//加入场景前必须配置flag,加入后无效
			physics3D.btCollisionObject_forceActivationState(this._nativeColliderObject, PhysicsComponent.ACTIVATIONSTATE_DISABLE_DEACTIVATION);//触发器开启主动检测,并防止睡眠
			this._enableProcessCollisions = false;
			this._updateMass(0);//必须设置Mass为0来保证InverMass为0
		} else {
			if ((flags & PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT) > 0)
				flags = flags ^ PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
			physics3D.btCollisionObject_setCollisionFlags(natColObj, flags);//加入场景前必须配置flag,加入后无效
			physics3D.btCollisionObject_setActivationState(this._nativeColliderObject, PhysicsComponent.ACTIVATIONSTATE_ACTIVE_TAG);
			this._enableProcessCollisions = true;
			this._updateMass(this._mass);
		}

		var nativeZero: any = Rigidbody3D._nativeVector3Zero;
		physics3D.btCollisionObject_setInterpolationLinearVelocity(natColObj, nativeZero);
		physics3D.btRigidBody_setLinearVelocity(natColObj, nativeZero);
		physics3D.btCollisionObject_setInterpolationAngularVelocity(natColObj, nativeZero);
		physics3D.btRigidBody_setAngularVelocity(natColObj, nativeZero);

		canInSimulation && this._addToSimulation();
	}

	/**
	 * 获取刚体的线阻力。
	 * @return 线阻力。
	 */
	get linearDamping(): number {
		return this._linearDamping;
	}

	/**
	 * 设置刚体的线阻力。
	 * @param value  线阻力。
	 */
	set linearDamping(value: number) {
		this._linearDamping = value;
		if (this._nativeColliderObject)
			Physics3D._physics3D.btRigidBody_setDamping(this._nativeColliderObject, value, this._angularDamping);
	}

	/**
	 * 获取刚体的角阻力。
	 * @return 角阻力。
	 */
	get angularDamping(): number {
		return this._angularDamping;
	}

	/**
	 * 设置刚体的角阻力。
	 * @param value  角阻力。
	 */
	set angularDamping(value: number) {
		this._angularDamping = value;
		if (this._nativeColliderObject)
			Physics3D._physics3D.btRigidBody_setDamping(this._nativeColliderObject, this._linearDamping, value);
	}

	/**
	 * 获取是否重载重力。
	 * @return 是否重载重力。
	 */
	get overrideGravity(): boolean {
		return this._overrideGravity;
	}

	/**
	 * 设置是否重载重力。
	 * @param value 是否重载重力。
	 */
	set overrideGravity(value: boolean) {
		this._overrideGravity = value;
		var physics3D: any = Physics3D._physics3D;
		if (this._nativeColliderObject) {
			var flag: number = physics3D.btRigidBody_getFlags(this._nativeColliderObject);
			if (value) {
				if ((flag & Rigidbody3D._BT_DISABLE_WORLD_GRAVITY) === 0)
					physics3D.btRigidBody_setFlags(this._nativeColliderObject, flag | Rigidbody3D._BT_DISABLE_WORLD_GRAVITY);
			} else {
				if ((flag & Rigidbody3D._BT_DISABLE_WORLD_GRAVITY) > 0)
					physics3D.btRigidBody_setFlags(this._nativeColliderObject, flag ^ Rigidbody3D._BT_DISABLE_WORLD_GRAVITY);
			}
		}
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
		var physics3D: any = Physics3D._physics3D;
		physics3D.btVector3_setValue(Rigidbody3D._nativeGravity, -value.x, value.y, value.z);
		physics3D.btRigidBody_setGravity(this._nativeColliderObject, Rigidbody3D._nativeGravity);
	}

	/**
	 * 获取总力。
	 */
	get totalForce(): Vector3 {
		if (this._nativeColliderObject) {
			var nativeTotalForce: any = this._nativeColliderObject.getTotalForce();
			Utils3D._convertToLayaVec3(nativeTotalForce, this._totalForce, true);
			return this._totalForce;
		}
		return null;
	}

	/**
	 * 获取性因子。
	 */
	get linearFactor(): Vector3 {
		if (this._nativeColliderObject)
			return this._linearFactor;
		return null;
	}

	/**
	 * 设置性因子。
	 */
	set linearFactor(value: Vector3) {
		this._linearFactor = value;
		if (this._nativeColliderObject) {
			var nativeValue: number = Rigidbody3D._nativeTempVector30;
			Utils3D._convertToBulletVec3(value, nativeValue, false);
			Physics3D._physics3D.btRigidBody_setLinearFactor(this._nativeColliderObject, nativeValue);
		}
	}

	/**
	 * 获取线速度
	 * @return 线速度
	 */
	get linearVelocity(): Vector3 {
		if (this._nativeColliderObject)
			Utils3D._convertToLayaVec3(this._nativeColliderObject.getLinearVelocity(), this._linearVelocity, true);
		return this._linearVelocity;
	}

	/**
	 * 设置线速度。
	 * @param 线速度。
	 */
	set linearVelocity(value: Vector3) {
		this._linearVelocity = value;
		if (this._nativeColliderObject) {
			var nativeValue: number = Rigidbody3D._nativeTempVector30;
			Utils3D._convertToBulletVec3(value, nativeValue, true);
			(this.isSleeping) && (this.wakeUp());//可能会因睡眠导致设置线速度无效
			Physics3D._physics3D.btRigidBody_setLinearVelocity(this._nativeColliderObject, nativeValue);
		}
	}

	/**
	 * 获取角因子。
	 */
	get angularFactor(): Vector3 {
		if (this._nativeColliderObject)
			return this._angularFactor;
		return null;
	}

	/**
	 * 设置角因子。
	 */
	set angularFactor(value: Vector3) {
		this._angularFactor = value;
		if (this._nativeColliderObject) {
			var nativeValue: number = Rigidbody3D._nativeTempVector30;
			Utils3D._convertToBulletVec3(value, nativeValue, false);
			Physics3D._physics3D.btRigidBody_setAngularFactor(this._nativeColliderObject, nativeValue);
		}
	}

	/**
	 * 获取角速度。
	 * @return 角速度。
	 */
	get angularVelocity(): Vector3 {
		if (this._nativeColliderObject)
			Utils3D._convertToLayaVec3(this._nativeColliderObject.getAngularVelocity(), this._angularVelocity, true);
		return this._angularVelocity;
	}

	/**
	 * 设置角速度。
	 * @param 角速度
	 */
	set angularVelocity(value: Vector3) {
		this._angularVelocity = value;
		if (this._nativeColliderObject) {
			var nativeValue: number = Rigidbody3D._nativeTempVector30;
			Utils3D._convertToBulletVec3(value, nativeValue, true);
			(this.isSleeping) && (this.wakeUp());//可能会因睡眠导致设置角速度无效
			Physics3D._physics3D.btRigidBody_setAngularVelocity(this._nativeColliderObject, nativeValue);
		}
	}

	/**
	 * 获取刚体所有扭力。
	 */
	get totalTorque(): Vector3 {
		if (this._nativeColliderObject) {
			var nativeTotalTorque: number = this._nativeColliderObject.getTotalTorque();
			Utils3D._convertToLayaVec3(nativeTotalTorque, this._totalTorque, true);
			return this._totalTorque;
		}
		return null;
	}

	/**
	 * 获取是否进行碰撞检测。
	 * @return 是否进行碰撞检测。
	 */
	get detectCollisions(): boolean {
		return this._detectCollisions;
	}

	/**
	 * 设置是否进行碰撞检测。
	 * @param value 是否进行碰撞检测。
	 */
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
	 * 获取是否处于睡眠状态。
	 * @return 是否处于睡眠状态。
	 */
	get isSleeping(): boolean {
		if (this._nativeColliderObject)
			return this._nativeColliderObject.getActivationState() === PhysicsComponent.ACTIVATIONSTATE_ISLAND_SLEEPING;
		return false;
	}

	/**
	 * 获取刚体睡眠的线速度阈值。
	 * @return 刚体睡眠的线速度阈值。
	 */
	get sleepLinearVelocity(): number {
		return this._nativeColliderObject.getLinearSleepingThreshold();
	}

	/**
	 * 设置刚体睡眠的线速度阈值。
	 * @param value 刚体睡眠的线速度阈值。
	 */
	set sleepLinearVelocity(value: number) {
		this._nativeColliderObject.setSleepingThresholds(value, this._nativeColliderObject.getAngularSleepingThreshold());
	}

	/**
	 * 获取刚体睡眠的角速度阈值。
	 * @return 刚体睡眠的角速度阈值。
	 */
	get sleepAngularVelocity(): number {
		return this._nativeColliderObject.getAngularSleepingThreshold();
	}

	/**
	 * 设置刚体睡眠的角速度阈值。
	 * @param value 刚体睡眠的角速度阈值。
	 */
	set sleepAngularVelocity(value: number) {
		this._nativeColliderObject.setSleepingThresholds(this._nativeColliderObject.getLinearSleepingThreshold(), value);
	}


	/**
	 * 创建一个 <code>RigidBody</code> 实例。
	 * @param collisionGroup 所属碰撞组。
	 * @param canCollideWith 可产生碰撞的碰撞组。
	 */
	constructor(collisionGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER, canCollideWith: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {

		//LinkedConstraints = new List<Constraint>();
		super(collisionGroup, canCollideWith);
	}

	/**
	 * @internal
	 */
	private _updateMass(mass: number): void {
		if (this._nativeColliderObject && this._colliderShape) {
			var physics3D: any = Physics3D._physics3D;
			physics3D.btCollisionShape_calculateLocalInertia(this._colliderShape._nativeShape, mass, Rigidbody3D._nativeInertia);
			physics3D.btRigidBody_setMassProps(this._nativeColliderObject,mass, Rigidbody3D._nativeInertia);
			physics3D.btRigidBody_updateInertiaTensor(this._nativeColliderObject); //this was the major headache when I had to debug Slider and Hinge constraint
		}
	}

	/**
	 * @internal
	 * Dynamic刚体,初始化时调用一次。
	 * Kinematic刚体,每次物理tick时调用(如果未进入睡眠状态),让物理引擎知道刚体位置。
	 */
	private _delegateMotionStateGetWorldTransform(worldTransPointer: number): void {
		//已调整机制,引擎会统一处理通过Transform修改坐标更新包围盒队列

		//var rigidBody:Rigidbody3D = __JS__("this._rigidbody");
		//if (!rigidBody._colliderShape)//Dynamic刚体初始化时没有colliderShape需要跳过
		//return;
		//
		//rigidBody._simulation._updatedRigidbodies++;
		//var physics3D:* = Laya3D._physics3D;
		//var worldTrans:* = physics3D.wrapPointer(worldTransPointer, physics3D.btTransform);
		//rigidBody._innerDerivePhysicsTransformation(worldTrans, true);
	}

	/**
	 * @internal
	 * Dynamic刚体,物理引擎每帧调用一次,用于更新渲染矩阵。
	 */
	private _delegateMotionStateSetWorldTransform(worldTransPointer: number): void {
		var rigidBody: Rigidbody3D = (<any>this)._rigidbody;
		rigidBody._simulation._updatedRigidbodies++;
		var physics3D: any = Physics3D._physics3D;
		var worldTrans: any = physics3D.wrapPointer(worldTransPointer, physics3D.btTransform);
		rigidBody._updateTransformComponent(worldTrans);
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
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_onAdded(): void {
		var physics3D: any = Physics3D._physics3D;
		var motionState: number = physics3D.LayaMotionState_create();
		// var isConchApp: boolean = ((<any>window).conch != null);
		// if (isConchApp && physics3D.LayaMotionState.prototype.setRigidbody) {
		// motionState.setRigidbody(this);
		// motionState.setNativeGetWorldTransform(this._delegateMotionStateGetWorldTransformNative);
		// motionState.setNativeSetWorldTransform(this._delegateMotionStateSetWorldTransformNative);
		// } else {
		// 	motionState.getWorldTransform = this._delegateMotionStateGetWorldTransform;
		// 	motionState.setWorldTransform = this._delegateMotionStateSetWorldTransform;
		// }

		physics3D.layaMotionState_set_rigidBodyID(motionState,this._id);
		this._nativeMotionState = motionState;
		var constructInfo: number = physics3D.btRigidBodyConstructionInfo_create(0.0, motionState, null, Rigidbody3D._nativeVector3Zero);
		var btRigid: number = physics3D.btRigidBody_create(constructInfo);
		physics3D.btCollisionObject_setUserIndex(btRigid, this.id);
		console.log(btRigid);
		this._nativeColliderObject = btRigid;
		super._onAdded();
		this.mass = this._mass;
		this.linearFactor = this._linearFactor;
		this.angularFactor = this._angularFactor;
		this.linearDamping = this._linearDamping;
		this.angularDamping = this._angularDamping;
		this.overrideGravity = this._overrideGravity;
		this.gravity = this._gravity;
		this.isKinematic = this._isKinematic;
		physics3D.btRigidBodyConstructionInfo_destroy(constructInfo);
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
			var physics3D: any = Physics3D._physics3D;
			physics3D.btRigidBody_setCenterOfMassTransform(this._nativeColliderObject, physics3D.btCollisionObject_getWorldTransform(this._nativeColliderObject));//修改Shape会影响坐标,需要更新插值坐标,否则物理引擎motionState.setWorldTrans数据为旧数据
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
		(data.isKinematic != null) && (this.isKinematic = data.isKinematic);
		(data.linearDamping != null) && (this.linearDamping = data.linearDamping);
		(data.angularDamping != null) && (this.angularDamping = data.angularDamping);
		(data.overrideGravity != null) && (this.overrideGravity = data.overrideGravity);

		if (data.gravity) {
			this.gravity.fromArray(data.gravity);
			this.gravity = this.gravity;
		}
		super._parse(data);
		this._parseShape(data.shapes);
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDestroy(): void {
		var physics3D: any = Physics3D._physics3D;
		this._nativeMotionState.clear();
		physics3D.destroy(this._nativeMotionState);

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
		this._nativeMotionState = null;
		this._gravity = null;
		this._totalTorque = null;
		this._linearVelocity = null;
		this._angularVelocity = null;
		this._linearFactor = null;
		this._angularFactor = null;
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
		if (this._nativeColliderObject == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
		var nativeForce: any = Rigidbody3D._nativeTempVector30;
		nativeForce.setValue(-force.x, force.y, force.z);
		if (localOffset) {
			var nativeOffset: any = Rigidbody3D._nativeTempVector31;
			nativeOffset.setValue(-localOffset.x, localOffset.y, localOffset.z);
			this._nativeColliderObject.applyForce(nativeForce, nativeOffset);
		} else {
			this._nativeColliderObject.applyCentralForce(nativeForce);
		}
	}

	/**
	 * 应用扭转力。
	 * @param	torque 扭转力。
	 */
	applyTorque(torque: Vector3): void {
		if (this._nativeColliderObject == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";

		var nativeTorque: any = Rigidbody3D._nativeTempVector30;
		nativeTorque.setValue(-torque.x, torque.y, torque.z);
		this._nativeColliderObject.applyTorque(nativeTorque);
	}

	/**
	 * 应用冲量。
	 * @param	impulse 冲量。
	 * @param   localOffset 偏移,如果为null则为中心点。
	 */
	applyImpulse(impulse: Vector3, localOffset: Vector3 = null): void {
		if (this._nativeColliderObject == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
		var physics3D: any = Physics3D._physics3D;
		physics3D.btVector3_setValue(Rigidbody3D._nativeImpulse, -impulse.x, impulse.y, impulse.z);
		if (localOffset) {
			physics3D.btVector3_setValue(Rigidbody3D._nativeImpulseOffset, -localOffset.x, localOffset.y, localOffset.z);
			this._nativeColliderObject.applyImpulse(Rigidbody3D._nativeImpulse, Rigidbody3D._nativeImpulseOffset);
		} else {
			this._nativeColliderObject.applyCentralImpulse(Rigidbody3D._nativeImpulse);
		}
	}

	/**
	 * 应用扭转冲量。
	 * @param	torqueImpulse
	 */
	applyTorqueImpulse(torqueImpulse: Vector3): void {
		if (this._nativeColliderObject == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
		var nativeTorqueImpulse: any = Rigidbody3D._nativeTempVector30;
		nativeTorqueImpulse.setValue(-torqueImpulse.x, torqueImpulse.y, torqueImpulse.z);
		this._nativeColliderObject.applyTorqueImpulse(nativeTorqueImpulse);
	}

	/**
	 * 唤醒刚体。
	 */
	wakeUp(): void {
		this._nativeColliderObject && (this._nativeColliderObject.activate(false));
	}

	/**
	 *清除应用到刚体上的所有力。
	 */
	clearForces(): void {
		var rigidBody: any = this._nativeColliderObject;
		if (rigidBody == null)
			throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";

		rigidBody.clearForces();
		var nativeZero: any = Rigidbody3D._nativeVector3Zero;
		rigidBody.setInterpolationLinearVelocity(nativeZero);
		rigidBody.setLinearVelocity(nativeZero);
		rigidBody.setInterpolationAngularVelocity(nativeZero);
		rigidBody.setAngularVelocity(nativeZero);
	}

}


