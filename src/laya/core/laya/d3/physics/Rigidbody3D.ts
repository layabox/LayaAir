import { Component } from "laya/components/Component";
import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { Utils3D } from "../utils/Utils3D";
import { Laya3D } from "./../../../Laya3D";
import { PhysicsComponent } from "././PhysicsComponent";
import { Physics } from "./Physics";
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

	/** @private */
	static _BT_DISABLE_WORLD_GRAVITY: number = 1;
	/** @private */
	static _BT_ENABLE_GYROPSCOPIC_FORCE: number = 2;

	/** @private */
	private static _nativeTempVector30: any = new Physics._physics3D.btVector3(0, 0, 0);
	/** @private */
	private static _nativeTempVector31: any = new Physics._physics3D.btVector3(0, 0, 0);
	private static _nativeVector3Zero: any = new Physics._physics3D.btVector3(0, 0, 0);
	private static _nativeInertia: any = new Physics._physics3D.btVector3(0, 0, 0);
	private static _nativeImpulse: any = new Physics._physics3D.btVector3(0, 0, 0);
	private static _nativeImpulseOffset: any = new Physics._physics3D.btVector3(0, 0, 0);
	private static _nativeGravity: any = new Physics._physics3D.btVector3(0, 0, 0);

	/** @private */
	private _nativeMotionState: any;
	/** @private */
	private _isKinematic: boolean = false;
	/** @private */
	private _mass: number = 1.0;
	/** @private */
	private _gravity: Vector3 = new Vector3(0, -10, 0);
	/** @private */
	private _angularDamping: number = 0.0;
	/** @private */
	private _linearDamping: number = 0.0;
	/** @private */
	private _overrideGravity: boolean = false;
	/** @private */
	private _totalTorque: Vector3 = new Vector3(0, 0, 0);

	//private var _linkedConstraints:Array;//TODO:

	/** @private */
	private _linearVelocity: Vector3 = new Vector3();
	/** @private */
	private _angularVelocity: Vector3 = new Vector3();
	/** @private */
	private _linearFactor: Vector3 = new Vector3(1, 1, 1);
	/** @private */
	private _angularFactor: Vector3 = new Vector3(1, 1, 1);
	/** @private */
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

		var canInSimulation: boolean = !!(this._simulation && this._enabled && this._colliderShape);
		canInSimulation && this._removeFromSimulation();
		var natColObj: any = this._nativeColliderObject;
		var flags: number = natColObj.getCollisionFlags();
		if (value) {
			flags = flags | PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
			natColObj.setCollisionFlags(flags);//加入场景前必须配置flag,加入后无效
			this._nativeColliderObject.forceActivationState(PhysicsComponent.ACTIVATIONSTATE_DISABLE_DEACTIVATION);//触发器开启主动检测,并防止睡眠
			this._enableProcessCollisions = false;
			this._updateMass(0);//必须设置Mass为0来保证InverMass为0
		} else {
			if ((flags & PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT) > 0)
				flags = flags ^ PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
			natColObj.setCollisionFlags(flags);//加入场景前必须配置flag,加入后无效
			this._nativeColliderObject.setActivationState(PhysicsComponent.ACTIVATIONSTATE_ACTIVE_TAG);
			this._enableProcessCollisions = true;
			this._updateMass(this._mass);
		}

		var nativeZero: any = Rigidbody3D._nativeVector3Zero;
		natColObj.setInterpolationLinearVelocity(nativeZero);
		natColObj.setLinearVelocity(nativeZero);
		natColObj.setInterpolationAngularVelocity(nativeZero);
		natColObj.setAngularVelocity(nativeZero);

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
			this._nativeColliderObject.setDamping(value, this._angularDamping);
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
			this._nativeColliderObject.setDamping(this._linearDamping, value);
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
		if (this._nativeColliderObject) {
			var flag: number = this._nativeColliderObject.getFlags();
			if (value) {
				if ((flag & Rigidbody3D._BT_DISABLE_WORLD_GRAVITY) === 0)
					this._nativeColliderObject.setFlags(flag | Rigidbody3D._BT_DISABLE_WORLD_GRAVITY);
			} else {
				if ((flag & Rigidbody3D._BT_DISABLE_WORLD_GRAVITY) > 0)
					this._nativeColliderObject.setFlags(flag ^ Rigidbody3D._BT_DISABLE_WORLD_GRAVITY);
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
		Rigidbody3D._nativeGravity.setValue(-value.x, value.y, value.z);
		this._nativeColliderObject.setGravity(Rigidbody3D._nativeGravity);
	}

	/**
	 * 获取总力。
	 */
	get totalForce(): Vector3 {
		if (this._nativeColliderObject)
			return this._nativeColliderObject.getTotalForce();
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
			var nativeValue: any = Rigidbody3D._nativeTempVector30;
			Utils3D._convertToBulletVec3(value, nativeValue, false);
			this._nativeColliderObject.setLinearFactor(nativeValue);
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
			var nativeValue: any = Rigidbody3D._nativeTempVector30;
			Utils3D._convertToBulletVec3(value, nativeValue, true);
			(this.isSleeping) && (this.wakeUp());//可能会因睡眠导致设置线速度无效
			this._nativeColliderObject.setLinearVelocity(nativeValue);
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
			var nativeValue: any = Rigidbody3D._nativeTempVector30;
			Utils3D._convertToBulletVec3(value, nativeValue, false);
			this._nativeColliderObject.setAngularFactor(nativeValue);
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
			var nativeValue: any = Rigidbody3D._nativeTempVector30;
			Utils3D._convertToBulletVec3(value, nativeValue, true);
			(this.isSleeping) && (this.wakeUp());//可能会因睡眠导致设置角速度无效
			this._nativeColliderObject.setAngularVelocity(nativeValue);
		}
	}

	/**
	 * 获取刚体所有扭力。
	 */
	get totalTorque(): Vector3 {
		if (this._nativeColliderObject) {
			var nativeTotalTorque: any = this._nativeColliderObject.getTotalTorque();
			var totalTorque: Vector3 = this._totalTorque;
			totalTorque.x = -nativeTotalTorque.x;
			totalTorque.y = nativeTotalTorque.y;
			totalTorque.z = nativeTotalTorque.z;
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
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		//LinkedConstraints = new List<Constraint>();
		super(collisionGroup, canCollideWith);
	}

	/**
	 * @private
	 */
	private _updateMass(mass: number): void {
		if (this._nativeColliderObject && this._colliderShape) {
			this._colliderShape._nativeShape.calculateLocalInertia(mass, Rigidbody3D._nativeInertia);
			this._nativeColliderObject.setMassProps(mass, Rigidbody3D._nativeInertia);
			this._nativeColliderObject.updateInertiaTensor(); //this was the major headache when I had to debug Slider and Hinge constraint
		}
	}

	/**
	 * @private
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
	 * @private
	 * Dynamic刚体,物理引擎每帧调用一次,用于更新渲染矩阵。
	 */
	private _delegateMotionStateSetWorldTransform(worldTransPointer: number): void {
		var rigidBody: Rigidbody3D = (<any>this)._rigidbody;
		rigidBody._simulation._updatedRigidbodies++;
		var physics3D: any = Physics._physics3D;
		var worldTrans: any = physics3D.wrapPointer(worldTransPointer, physics3D.btTransform);
		rigidBody._updateTransformComponent(worldTrans);
	}

	/**
	 *  @private
	 * Dynamic刚体,初始化时调用一次。
	 * Kinematic刚体,每次物理tick时调用(如果未进入睡眠状态),让物理引擎知道刚体位置。
	 * 该函数只有在runtime下调用
	 */
	private _delegateMotionStateGetWorldTransformNative(ridgidBody3D: Rigidbody3D, worldTransPointer: number): void {
		//已调整机制,引擎会统一处理通过Transform修改坐标更新包围盒队列

		//var rigidBody:Rigidbody3D = ridgidBody3D;
		//if (!rigidBody._colliderShape)//Dynamic刚体初始化时没有colliderShape需要跳过
		//return;
		//
		//rigidBody._simulation._updatedRigidbodies++;
		//var physics3D:* = Laya3D._physics3D;
		//var worldTrans:* = physics3D.wrapPointer(worldTransPointer, physics3D.btTransform);
		//rigidBody._innerDerivePhysicsTransformation(worldTrans, true);
	}

	/**
	 * @private
	 * Dynamic刚体,物理引擎每帧调用一次,用于更新渲染矩阵。
	 * 该函数只有在runtime下调用
	 */
	private _delegateMotionStateSetWorldTransformNative(rigidBody3D: Rigidbody3D, worldTransPointer: number): void {
		var rigidBody: Rigidbody3D = rigidBody3D;
		rigidBody._simulation._updatedRigidbodies++;
		var physics3D: any = Physics._physics3D;
		var worldTrans: any = physics3D.wrapPointer(worldTransPointer, physics3D.btTransform);
		rigidBody._updateTransformComponent(worldTrans);
	}

		/**
		 * @inheritDoc
		 */
		/*override*/ protected _onScaleChange(scale: Vector3): void {
		super._onScaleChange(scale);
		this._updateMass(this._isKinematic ? 0 : this._mass);//修改缩放需要更新惯性
	}

	/**
	 * @private
	 */
	_delegateMotionStateClear(): void {
		(<any>this)._rigidbody = null;
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _onAdded(): void {
		var physics3D: any = Physics._physics3D;
		var motionState: any = new physics3D.LayaMotionState();
		var isConchApp: boolean = ((<any>window).conch != null);
		if (isConchApp && physics3D.LayaMotionState.prototype.setRigidbody) {
			motionState.setRigidbody(this);
			motionState.setNativeGetWorldTransform(this._delegateMotionStateGetWorldTransformNative);
			motionState.setNativeSetWorldTransform(this._delegateMotionStateSetWorldTransformNative);
		} else {
			motionState.getWorldTransform = this._delegateMotionStateGetWorldTransform;
			motionState.setWorldTransform = this._delegateMotionStateSetWorldTransform;
		}

		motionState.clear = this._delegateMotionStateClear;
		motionState._rigidbody = this;
		this._nativeMotionState = motionState;
		var constructInfo: any = new physics3D.btRigidBodyConstructionInfo(0.0, motionState, null, Rigidbody3D._nativeVector3Zero);
		var btRigid: any = new physics3D.btRigidBody(constructInfo);
		btRigid.setUserIndex(this.id);
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
		physics3D.destroy(constructInfo);
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _onShapeChange(colShape: ColliderShape): void {
		super._onShapeChange(colShape);
		//TODO:此时已经加入场景,只影响mass为0,函数内部设置的flas是否为static无效			
		if (this._isKinematic) {
			this._updateMass(0);
		} else {
			this._nativeColliderObject.setCenterOfMassTransform(this._nativeColliderObject.getWorldTransform());//修改Shape会影响坐标,需要更新插值坐标,否则物理引擎motionState.setWorldTrans数据为旧数据
			this._updateMass(this._mass);
		}
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _parse(data: any): void {
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
		 */
		/*override*/ protected _onDestroy(): void {
		var physics3D: any = Physics._physics3D;
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
		 */
		/*override*/  _addToSimulation(): void {
		this._simulation._addRigidBody(this, this._collisionGroup, this._detectCollisions ? this._canCollideWith : 0);
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _removeFromSimulation(): void {
		this._simulation._removeRigidBody(this);
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _cloneTo(dest: Component): void {
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
		Rigidbody3D._nativeImpulse.setValue(-impulse.x, impulse.y, impulse.z);
		if (localOffset) {
			Rigidbody3D._nativeImpulseOffset.setValue(-localOffset.x, localOffset.y, localOffset.z);
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
		rigidBody.setInterpolationAngularVelocity(nativeZero);
		rigidBody.setLinearVelocity(nativeZero);
		rigidBody.setInterpolationAngularVelocity(nativeZero);
		rigidBody.setAngularVelocity(nativeZero);
	}

}


