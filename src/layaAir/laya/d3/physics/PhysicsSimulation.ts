import { Stat } from "../../utils/Stat";
import { Script3D } from "../component/Script3D";
import { Sprite3D } from "../core/Sprite3D";
import { Quaternion } from "../math/Quaternion";
import { Ray } from "../math/Ray";
import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { CharacterController } from "./CharacterController";
import { PhysicsUpdateList } from "./PhysicsUpdateList";
import { Collision } from "./Collision";
import { CollisionTool } from "./CollisionTool";
import { Constraint3D } from "./Constraint3D";
import { ContactPoint } from "./ContactPoint";
import { HitResult } from "./HitResult";
import { PhysicsCollider } from "./PhysicsCollider";
import { PhysicsComponent } from "./PhysicsComponent";
import { PhysicsSettings } from "./PhysicsSettings";
import { PhysicsTriggerComponent } from "./PhysicsTriggerComponent";
import { Rigidbody3D } from "./Rigidbody3D";
import { ColliderShape } from "./shape/ColliderShape";
import { Physics3D } from "./Physics3D";

/**
 * <code>Simulation</code> 类用于创建物理模拟器。
 */
export class PhysicsSimulation {
	/** @internal */
	static PHYSICSENGINEFLAGS_NONE: number = 0x0;
	/** @internal */
	static PHYSICSENGINEFLAGS_COLLISIONSONLY: number = 0x1;
	/** @internal */
	static PHYSICSENGINEFLAGS_SOFTBODYSUPPORT: number = 0x2;
	/** @internal */
	static PHYSICSENGINEFLAGS_MULTITHREADED: number = 0x4;
	/** @internal */
	static PHYSICSENGINEFLAGS_USEHARDWAREWHENPOSSIBLE: number = 0x8;

	/** @internal */
	static SOLVERMODE_RANDMIZE_ORDER: number = 1;
	/** @internal */
	static SOLVERMODE_FRICTION_SEPARATE: number = 2;
	/** @internal */
	static SOLVERMODE_USE_WARMSTARTING: number = 4;
	/** @internal */
	static SOLVERMODE_USE_2_FRICTION_DIRECTIONS: number = 16;
	/** @internal */
	static SOLVERMODE_ENABLE_FRICTION_DIRECTION_CACHING: number = 32;
	/** @internal */
	static SOLVERMODE_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION: number = 64;
	/** @internal */
	static SOLVERMODE_CACHE_FRIENDLY: number = 128;
	/** @internal */
	static SOLVERMODE_SIMD: number = 256;
	/** @internal */
	static SOLVERMODE_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS: number = 512;
	/** @internal */
	static SOLVERMODE_ALLOW_ZERO_LENGTH_FRICTION_DIRECTIONS: number = 1024;

	/** @internal */
	private static _nativeTempVector30: number;
	/** @internal */
	private static _nativeTempVector31: number;
	/** @internal */
	private static _nativeTempQuaternion0: number;
	/** @internal */
	private static _nativeTempQuaternion1: number;
	/** @internal */
	private static _nativeTempTransform0: number;
	/** @internal */
	private static _nativeTempTransform1: number;
	/** @internal */
	private static _tempVector30: Vector3 = new Vector3();

	/*是否禁用所有模拟器。*/
	static disableSimulation: boolean = false;

	/**
	* @internal
	*/
	static __init__(): void {
		var physics3D: any = Physics3D._bullet;
		PhysicsSimulation._nativeTempVector30 = physics3D.btVector3_create(0, 0, 0);
		PhysicsSimulation._nativeTempVector31 = physics3D.btVector3_create(0, 0, 0);
		PhysicsSimulation._nativeTempQuaternion0 = physics3D.btQuaternion_create(0, 0, 0, 1);
		PhysicsSimulation._nativeTempQuaternion1 = physics3D.btQuaternion_create(0, 0, 0, 1);
		PhysicsSimulation._nativeTempTransform0 = physics3D.btTransform_create();
		PhysicsSimulation._nativeTempTransform1 = physics3D.btTransform_create();
	}

	/**
	 * 创建限制刚体运动的约束条件。
	 */
	static createConstraint(): void {//TODO: 两种重载函数
		//TODO:
	}

	/** @internal */
	private _nativeDiscreteDynamicsWorld: number;
	/** @internal */
	private _nativeCollisionWorld: any;
	/** @internal */
	private _nativeDispatcher: number;
	/** @internal */
	private _nativeCollisionConfiguration: number;
	/** @internal */
	private _nativeBroadphase: number;
	/** @internal */
	private _nativeSolverInfo: number;
	/** @internal */
	private _nativeDispatchInfo: number;
	/** @internal */
	private _gravity: Vector3 = new Vector3(0, -10, 0);

	/** @internal */
	private _nativeVector3Zero: number = Physics3D._bullet.btVector3_create(0, 0, 0);
	/** @internal */
	private _nativeDefaultQuaternion: number = Physics3D._bullet.btQuaternion_create(0, 0, 0, -1);
	/** @internal */
	private _nativeClosestRayResultCallback: number;
	/** @internal */
	private _nativeAllHitsRayResultCallback: number;
	/** @internal */
	private _nativeClosestConvexResultCallback: number;
	/** @internal */
	private _nativeAllConvexResultCallback: number;

	/** @internal */
	private _collisionsUtils: CollisionTool = new CollisionTool();
	/** @internal */
	private _previousFrameCollisions: Collision[] = [];
	/** @internal */
	private _currentFrameCollisions: Collision[] = [];

	/** @internal */
	_physicsUpdateList: PhysicsUpdateList = new PhysicsUpdateList();
	/**@internal	*/
	_characters: CharacterController[] = [];
	/**@internal	*/
	_updatedRigidbodies: number = 0;

	/**物理引擎在一帧中用于补偿减速的最大次数：模拟器每帧允许的最大模拟次数，如果引擎运行缓慢,可能需要增加该次数，否则模拟器会丢失“时间",引擎间隔时间小于maxSubSteps*fixedTimeStep非常重要。*/
	maxSubSteps: number = 1;
	/**物理模拟器帧的间隔时间:通过减少fixedTimeStep可增加模拟精度，默认是1.0 / 60.0。*/
	fixedTimeStep: number = 1.0 / 60.0;

	/**
	 * 获取是否进行连续碰撞检测。
	 * @return  是否进行连续碰撞检测。
	 */
	get continuousCollisionDetection(): boolean {
		return Physics3D._bullet.btCollisionWorld_get_m_useContinuous(this._nativeDispatchInfo);
	}

	/**
	 * 设置是否进行连续碰撞检测。
	 * @param value 是否进行连续碰撞检测。
	 */
	set continuousCollisionDetection(value: boolean) {
		Physics3D._bullet.btCollisionWorld_set_m_useContinuous(this._nativeDispatchInfo, value);
	}

	/**
	 * 获取重力。
	 */
	get gravity(): Vector3 {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
		return this._gravity;
	}

	/**
	 * 设置重力。
	 */
	set gravity(value: Vector3) {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";

		this._gravity = value;
		var physics3D: any = Physics3D._bullet;
		var nativeGravity: number = PhysicsSimulation._nativeTempVector30;
		physics3D.btVector3_setValue(nativeGravity, -value.x, value.y, value.z);//TODO:是否先get省一个变量
		physics3D.btDiscreteDynamicsWorld_setGravity(this._nativeDiscreteDynamicsWorld, nativeGravity);
	}

	/**
	 * @internal
	 */
	get speculativeContactRestitution(): boolean {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Simulation:Cannot Cannot perform this action when the physics engine is set to CollisionsOnly";
		return Physics3D._bullet.btDiscreteDynamicsWorld_getApplySpeculativeContactRestitution(this._nativeDiscreteDynamicsWorld);
	}

	/**
	 * @internal
	 */
	set speculativeContactRestitution(value: boolean) {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Simulation:Cannot Cannot perform this action when the physics engine is set to CollisionsOnly";
		Physics3D._bullet.btDiscreteDynamicsWorld_setApplySpeculativeContactRestitution(this._nativeDiscreteDynamicsWorld, value);
	}

	/**
	 * @internal
	 * 创建一个 <code>Simulation</code> 实例。
	 */
	constructor(configuration: PhysicsSettings, flags: number = 0) {
		this.maxSubSteps = configuration.maxSubSteps;
		this.fixedTimeStep = configuration.fixedTimeStep;

		var physics3D: any = Physics3D._bullet;
		this._nativeCollisionConfiguration = physics3D.btDefaultCollisionConfiguration_create();
		this._nativeDispatcher = physics3D.btCollisionDispatcher_create(this._nativeCollisionConfiguration);
		this._nativeBroadphase = physics3D.btDbvtBroadphase_create();
		physics3D.btOverlappingPairCache_setInternalGhostPairCallback(physics3D.btDbvtBroadphase_getOverlappingPairCache(this._nativeBroadphase), physics3D.btGhostPairCallback_create());//this allows characters to have proper physics behavior

		var conFlags: number = configuration.flags;
		if (conFlags & PhysicsSimulation.PHYSICSENGINEFLAGS_COLLISIONSONLY) {
			this._nativeCollisionWorld = new physics3D.btCollisionWorld(this._nativeDispatcher, this._nativeBroadphase, this._nativeCollisionConfiguration);
		} else if (conFlags & PhysicsSimulation.PHYSICSENGINEFLAGS_SOFTBODYSUPPORT) {
			throw "PhysicsSimulation:SoftBody processing is not yet available";
		} else {
			var solver: number = physics3D.btSequentialImpulseConstraintSolver_create();
			this._nativeDiscreteDynamicsWorld = physics3D.btDiscreteDynamicsWorld_create(this._nativeDispatcher, this._nativeBroadphase, solver, this._nativeCollisionConfiguration);
			this._nativeCollisionWorld = this._nativeDiscreteDynamicsWorld;
		}

		if (this._nativeDiscreteDynamicsWorld) {
			this._nativeSolverInfo = physics3D.btDynamicsWorld_getSolverInfo(this._nativeDiscreteDynamicsWorld); //we are required to keep this reference, or the GC will mess up
			this._nativeDispatchInfo = physics3D.btCollisionWorld_getDispatchInfo(this._nativeDiscreteDynamicsWorld);
		}

		this._nativeClosestRayResultCallback = physics3D.ClosestRayResultCallback_create(this._nativeVector3Zero, this._nativeVector3Zero);
		this._nativeAllHitsRayResultCallback = physics3D.AllHitsRayResultCallback_create(this._nativeVector3Zero, this._nativeVector3Zero);
		this._nativeClosestConvexResultCallback = physics3D.ClosestConvexResultCallback_create(this._nativeVector3Zero, this._nativeVector3Zero);
		this._nativeAllConvexResultCallback = physics3D.AllConvexResultCallback_create(this._nativeVector3Zero, this._nativeVector3Zero);//TODO:是否优化C++

		physics3D.btGImpactCollisionAlgorithm_RegisterAlgorithm(this._nativeDispatcher);//注册算法
	}

	/**
	 * @internal
	 */
	_simulate(deltaTime: number): void {
		this._updatedRigidbodies = 0;
		var physics3D: any = Physics3D._bullet;
		if (this._nativeDiscreteDynamicsWorld)
			physics3D.btDiscreteDynamicsWorld_stepSimulation(this._nativeDiscreteDynamicsWorld, deltaTime, this.maxSubSteps, this.fixedTimeStep);
		else
			physics3D.PerformDiscreteCollisionDetection(this._nativeCollisionWorld);
	}

	/**
	 * @internal
	 */
	_destroy(): void {
		var physics3D: any = Physics3D._bullet;
		if (this._nativeDiscreteDynamicsWorld) {
			physics3D.destroy(this._nativeDiscreteDynamicsWorld);
			this._nativeDiscreteDynamicsWorld = null;
		} else {
			physics3D.destroy(this._nativeCollisionWorld);
			this._nativeCollisionWorld = null;
		}

		physics3D.destroy(this._nativeBroadphase);
		this._nativeBroadphase = null;
		physics3D.destroy(this._nativeDispatcher);
		this._nativeDispatcher = null;
		physics3D.destroy(this._nativeCollisionConfiguration);
		this._nativeCollisionConfiguration = null;
	}

	/**
	 * @internal
	 */
	_addPhysicsCollider(component: PhysicsCollider, group: number, mask: number): void {
		Physics3D._bullet.btCollisionWorld_addCollisionObject(this._nativeCollisionWorld, component._nativeColliderObject, group, mask);
	}

	/**
	 * @internal
	 */
	_removePhysicsCollider(component: PhysicsCollider): void {
		Physics3D._bullet.btCollisionWorld_removeCollisionObject(this._nativeCollisionWorld, component._nativeColliderObject);
	}

	/**
	 * @internal
	 */
	_addRigidBody(rigidBody: Rigidbody3D, group: number, mask: number): void {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
		Physics3D._bullet.btDiscreteDynamicsWorld_addRigidBody(this._nativeCollisionWorld, rigidBody._nativeColliderObject, group, mask);
	}

	/**
	 * @internal
	 */
	_removeRigidBody(rigidBody: Rigidbody3D): void {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
		Physics3D._bullet.btDiscreteDynamicsWorld_removeRigidBody(this._nativeCollisionWorld, rigidBody._nativeColliderObject);
	}

	/**
	 * @internal
	 */
	_addCharacter(character: CharacterController, group: number, mask: number): void {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
		var bullet: any = Physics3D._bullet;
		bullet.btCollisionWorld_addCollisionObject(this._nativeCollisionWorld, character._nativeColliderObject, group, mask);
		bullet.btDynamicsWorld_addAction(this._nativeCollisionWorld, character._nativeKinematicCharacter);
	}

	/**
	 * @internal
	 */
	_removeCharacter(character: CharacterController): void {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
		var bullet: any = Physics3D._bullet;
		bullet.btCollisionWorld_removeCollisionObject(this._nativeCollisionWorld, character._nativeColliderObject);
		bullet.btDynamicsWorld_removeAction(this._nativeCollisionWorld, character._nativeKinematicCharacter);
	}

	/**
	 * 射线检测第一个碰撞物体。
	 * @param	from 起始位置。
	 * @param	to 结束位置。
	 * @param	out 碰撞结果。
	 * @param   collisonGroup 射线所属碰撞组。
	 * @param   collisionMask 与射线可产生碰撞的组。
	 * @return 	是否成功。
	 */
	raycastFromTo(from: Vector3, to: Vector3, out: HitResult = null, collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER): boolean {
		var bullet: any = Physics3D._bullet;
		var rayResultCall: number = this._nativeClosestRayResultCallback;
		var rayFrom: number = PhysicsSimulation._nativeTempVector30;
		var rayTo: number = PhysicsSimulation._nativeTempVector31;
		bullet.btVector3_setValue(rayFrom, -from.x, from.y, from.z);
		bullet.btVector3_setValue(rayTo, -to.x, to.y, to.z);
		bullet.ClosestRayResultCallback_set_m_rayFromWorld(rayResultCall, rayFrom);
		bullet.ClosestRayResultCallback_set_m_rayToWorld(rayResultCall, rayTo);
		bullet.RayResultCallback_set_m_collisionFilterGroup(rayResultCall, collisonGroup);
		bullet.RayResultCallback_set_m_collisionFilterMask(rayResultCall, collisionMask);

		bullet.RayResultCallback_set_m_collisionObject(rayResultCall, null);//还原默认值
		bullet.RayResultCallback_set_m_closestHitFraction(rayResultCall, 1);//还原默认值
		bullet.btCollisionWorld_rayTest(this._nativeCollisionWorld, rayFrom, rayTo, rayResultCall);//TODO:out为空可优化,bullet内
		if (bullet.RayResultCallback_hasHit(rayResultCall)) {
			if (out) {
				out.succeeded = true;
				out.collider = PhysicsComponent._physicObjectsMap[bullet.btCollisionObject_getUserIndex(bullet.RayResultCallback_get_m_collisionObject(rayResultCall))];
				out.hitFraction = bullet.RayResultCallback_get_m_closestHitFraction(rayResultCall);
				var nativePoint: number = bullet.ClosestRayResultCallback_get_m_hitPointWorld(rayResultCall);
				var point: Vector3 = out.point;
				point.x = -bullet.btVector3_x(nativePoint);
				point.y = bullet.btVector3_y(nativePoint);
				point.z = bullet.btVector3_z(nativePoint);
				var nativeNormal: number = bullet.ClosestRayResultCallback_get_m_hitPointWorld(rayResultCall);
				var normal: Vector3 = out.normal;
				normal.x = -bullet.btVector3_x(nativeNormal);
				normal.y = bullet.btVector3_y(nativeNormal);
				normal.z = bullet.btVector3_z(nativeNormal);
			}
			return true;
		} else {
			if (out)
				out.succeeded = false;
			return false;
		}
	}

	/**
	 * 射线检测所有碰撞的物体。
	 * @param	from 起始位置。
	 * @param	to 结束位置。
	 * @param	out 碰撞结果[数组元素会被回收]。
	 * @param   collisonGroup 射线所属碰撞组。
	 * @param   collisionMask 与射线可产生碰撞的组。
	 * @return 	是否成功。
	 */
	raycastAllFromTo(from: Vector3, to: Vector3, out: HitResult[], collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER): boolean {
		var bullet: any = Physics3D._bullet;
		var rayResultCall: number = this._nativeAllHitsRayResultCallback;
		var rayFrom: number = PhysicsSimulation._nativeTempVector30;
		var rayTo: number = PhysicsSimulation._nativeTempVector31;

		out.length = 0;
		bullet.btVector3_setValue(rayFrom, -from.x, from.y, from.z);
		bullet.btVector3_setValue(rayTo, -to.x, to.y, to.z);
		bullet.AllHitsRayResultCallback_set_m_rayFromWorld(rayResultCall, rayFrom);
		bullet.AllHitsRayResultCallback_set_m_rayToWorld(rayResultCall, rayTo);
		bullet.RayResultCallback_set_m_collisionFilterGroup(rayResultCall, collisonGroup);
		bullet.RayResultCallback_set_m_collisionFilterMask(rayResultCall, collisionMask);

		//rayResultCall.set_m_collisionObject(null);//还原默认值
		//rayResultCall.set_m_closestHitFraction(1);//还原默认值
		var collisionObjects: number = bullet.AllHitsRayResultCallback_get_m_collisionObjects(rayResultCall);
		var nativePoints: number = bullet.AllHitsRayResultCallback_get_m_hitPointWorld(rayResultCall);
		var nativeNormals: number = bullet.AllHitsRayResultCallback_get_m_hitNormalWorld(rayResultCall);
		var nativeFractions: number = bullet.AllHitsRayResultCallback_get_m_hitFractions(rayResultCall);
		bullet.tBtCollisionObjectArray_clear(collisionObjects);//清空检测队列
		bullet.tVector3Array_clear(nativePoints);
		bullet.tVector3Array_clear(nativeNormals);
		bullet.tScalarArray_clear(nativeFractions);
		bullet.btCollisionWorld_rayTest(this._nativeCollisionWorld, rayFrom, rayTo, rayResultCall);
		var count: number = bullet.tBtCollisionObjectArray_size(collisionObjects);
		if (count > 0) {
			this._collisionsUtils.recoverAllHitResultsPool();
			for (var i: number = 0; i < count; i++) {
				var hitResult: HitResult = this._collisionsUtils.getHitResult();
				out.push(hitResult);
				hitResult.succeeded = true;
				hitResult.collider = PhysicsComponent._physicObjectsMap[bullet.btCollisionObject_getUserIndex(bullet.tBtCollisionObjectArray_at(collisionObjects, i))];
				hitResult.hitFraction = bullet.tScalarArray_at(nativeFractions, i);
				var nativePoint: number = bullet.tVector3Array_at(nativePoints, i);//取出后需要立即赋值,防止取出法线时被覆盖
				var pointE: Vector3 = hitResult.point;
				pointE.x = -bullet.btVector3_x(nativePoint);
				pointE.y = bullet.btVector3_y(nativePoint);
				pointE.z = bullet.btVector3_z(nativePoint);
				var nativeNormal: number = bullet.tVector3Array_at(nativeNormals, i);
				var normalE: Vector3 = hitResult.normal;
				normalE.x = -bullet.btVector3_x(nativeNormal);
				normalE.y = bullet.btVector3_y(nativeNormal);
				normalE.z = bullet.btVector3_z(nativeNormal);
			}
			return true;
		} else {
			return false;
		}
	}

	/**
	 *  射线检测第一个碰撞物体。
	 * @param  	ray        射线
	 * @param  	outHitInfo 与该射线发生碰撞的第一个碰撞器的碰撞信息
	 * @param  	distance   射线长度,默认为最大值
	 * @param   collisonGroup 射线所属碰撞组。
	 * @param   collisionMask 与射线可产生碰撞的组。
	 * @return 	是否检测成功。
	 */
	rayCast(ray: Ray, outHitResult: HitResult = null, distance: number = 2147483647/*Int.MAX_VALUE*/, collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER): boolean {
		var from: Vector3 = ray.origin;
		var to: Vector3 = PhysicsSimulation._tempVector30;
		Vector3.normalize(ray.direction, to);
		Vector3.scale(to, distance, to);
		Vector3.add(from, to, to);
		return this.raycastFromTo(from, to, outHitResult, collisonGroup, collisionMask);
	}

	/**
	 * 射线检测所有碰撞的物体。
	 * @param  	ray        射线
	 * @param  	out 碰撞结果[数组元素会被回收]。
	 * @param  	distance   射线长度,默认为最大值
	 * @param   collisonGroup 射线所属碰撞组。
	 * @param   collisionMask 与射线可产生碰撞的组。
	 * @return 	是否检测成功。
	 */
	rayCastAll(ray: Ray, out: HitResult[], distance: number = 2147483647/*Int.MAX_VALUE*/, collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER): boolean {
		var from: Vector3 = ray.origin;
		var to: Vector3 = PhysicsSimulation._tempVector30;
		Vector3.normalize(ray.direction, to);
		Vector3.scale(to, distance, to);
		Vector3.add(from, to, to);
		return this.raycastAllFromTo(from, to, out, collisonGroup, collisionMask);
	}

	/**
	 * 形状检测第一个碰撞的物体。
	 * @param   shape 形状。
	 * @param	fromPosition 世界空间起始位置。
	 * @param	toPosition 世界空间结束位置。
	 * @param	out 碰撞结果。
	 * @param	fromRotation 起始旋转。
	 * @param	toRotation 结束旋转。
	 * @param   collisonGroup 射线所属碰撞组。
	 * @param   collisionMask 与射线可产生碰撞的组。
	 * @return 	是否成功。
	 */
	shapeCast(shape: ColliderShape, fromPosition: Vector3, toPosition: Vector3, out: HitResult = null, fromRotation: Quaternion = null, toRotation: Quaternion = null, collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, allowedCcdPenetration: number = 0.0): boolean {
		var bullet: any = Physics3D._bullet;
		var convexResultCall: number = this._nativeClosestConvexResultCallback;
		var convexPosFrom: number = PhysicsSimulation._nativeTempVector30;
		var convexPosTo: number = PhysicsSimulation._nativeTempVector31;
		var convexRotFrom: number = PhysicsSimulation._nativeTempQuaternion0;
		var convexRotTo: number = PhysicsSimulation._nativeTempQuaternion1;
		var convexTransform: number = PhysicsSimulation._nativeTempTransform0;
		var convexTransTo: number = PhysicsSimulation._nativeTempTransform1;

		var sweepShape: number = shape._nativeShape;

		bullet.btVector3_setValue(convexPosFrom, -fromPosition.x, fromPosition.y, fromPosition.z);
		bullet.btVector3_setValue(convexPosTo, -toPosition.x, toPosition.y, toPosition.z);
		//convexResultCall.set_m_convexFromWorld(convexPosFrom);
		//convexResultCall.set_m_convexToWorld(convexPosTo);
		bullet.ConvexResultCallback_set_m_collisionFilterGroup(convexResultCall, collisonGroup);
		bullet.ConvexResultCallback_set_m_collisionFilterMask(convexResultCall, collisionMask);

		bullet.btTransform_setOrigin(convexTransform, convexPosFrom);
		bullet.btTransform_setOrigin(convexTransTo, convexPosTo);

		if (fromRotation) {
			bullet.btQuaternion_setValue(convexRotFrom, -fromRotation.x, fromRotation.y, fromRotation.z, -fromRotation.w);
			bullet.btTransform_setRotation(convexTransform, convexRotFrom);
		} else {
			bullet.btTransform_setRotation(convexTransform, this._nativeDefaultQuaternion);
		}
		if (toRotation) {
			bullet.btQuaternion_setValue(convexRotTo, -toRotation.x, toRotation.y, toRotation.z, -toRotation.w);
			bullet.btTransform_setRotation(convexTransTo, convexRotTo);
		} else {
			bullet.btTransform_setRotation(convexTransTo, this._nativeDefaultQuaternion);
		}

		bullet.ClosestConvexResultCallback_set_m_hitCollisionObject(convexResultCall, null);//还原默认值
		bullet.ConvexResultCallback_set_m_closestHitFraction(convexResultCall, 1);//还原默认值
		bullet.btCollisionWorld_convexSweepTest(this._nativeCollisionWorld, sweepShape, convexTransform, convexTransTo, convexResultCall, allowedCcdPenetration);
		if (bullet.ConvexResultCallback_hasHit(convexResultCall)) {
			if (out) {
				out.succeeded = true;
				out.collider = PhysicsComponent._physicObjectsMap[bullet.btCollisionObject_getUserIndex(bullet.ClosestConvexResultCallback_get_m_hitCollisionObject(convexResultCall))];
				out.hitFraction = bullet.ConvexResultCallback_get_m_closestHitFraction(convexResultCall);
				var nativePoint: number = bullet.ClosestConvexResultCallback_get_m_hitPointWorld(convexResultCall);
				var nativeNormal: number = bullet.ClosestConvexResultCallback_get_m_hitNormalWorld(convexResultCall);
				var point: Vector3 = out.point;
				var normal: Vector3 = out.normal;
				point.x = -bullet.btVector3_x(nativePoint);
				point.y = bullet.btVector3_y(nativePoint);
				point.z = bullet.btVector3_z(nativePoint);
				normal.x = -bullet.btVector3_x(nativeNormal);
				normal.y = bullet.btVector3_y(nativeNormal);
				normal.z = bullet.btVector3_z(nativeNormal);
			}
			return true;
		} else {
			if (out)
				out.succeeded = false;
			return false;
		}
	}

	/**
	 * 形状检测所有碰撞的物体。
	 * @param   shape 形状。
	 * @param	fromPosition 世界空间起始位置。
	 * @param	toPosition 世界空间结束位置。
	 * @param	out 碰撞结果[数组元素会被回收]。
	 * @param	fromRotation 起始旋转。
	 * @param	toRotation 结束旋转。
	 * @param   collisonGroup 射线所属碰撞组。
	 * @param   collisionMask 与射线可产生碰撞的组。
	 * @return 	是否成功。
	 */
	shapeCastAll(shape: ColliderShape, fromPosition: Vector3, toPosition: Vector3, out: HitResult[], fromRotation: Quaternion = null, toRotation: Quaternion = null, collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, allowedCcdPenetration: number = 0.0): boolean {
		var bullet: any = Physics3D._bullet;
		var convexResultCall: number = this._nativeAllConvexResultCallback;
		var convexPosFrom: number = PhysicsSimulation._nativeTempVector30;
		var convexPosTo: number = PhysicsSimulation._nativeTempVector31;
		var convexRotFrom: number = PhysicsSimulation._nativeTempQuaternion0;
		var convexRotTo: number = PhysicsSimulation._nativeTempQuaternion1;
		var convexTransform: number = PhysicsSimulation._nativeTempTransform0;
		var convexTransTo: number = PhysicsSimulation._nativeTempTransform1;

		var sweepShape: number = shape._nativeShape;

		out.length = 0;
		bullet.btVector3_setValue(convexPosFrom, -fromPosition.x, fromPosition.y, fromPosition.z);
		bullet.btVector3_setValue(convexPosTo, -toPosition.x, toPosition.y, toPosition.z);

		//convexResultCall.set_m_convexFromWorld(convexPosFrom);
		//convexResultCall.set_m_convexToWorld(convexPosTo);

		bullet.ConvexResultCallback_set_m_collisionFilterGroup(convexResultCall, collisonGroup);
		bullet.ConvexResultCallback_set_m_collisionFilterMask(convexResultCall, collisionMask);

		bullet.btTransform_setOrigin(convexTransform, convexPosFrom);
		bullet.btTransform_setOrigin(convexTransTo, convexPosTo);
		if (fromRotation) {
			bullet.btQuaternion_setValue(convexRotFrom, -fromRotation.x, fromRotation.y, fromRotation.z, -fromRotation.w);
			bullet.btTransform_setRotation(convexTransform, convexRotFrom);
		} else {
			bullet.btTransform_setRotation(convexTransform, this._nativeDefaultQuaternion);
		}
		if (toRotation) {
			bullet.btQuaternion_setValue(convexRotTo, -toRotation.x, toRotation.y, toRotation.z, -toRotation.w);
			bullet.btTransform_setRotation(convexTransTo, convexRotTo);
		} else {
			bullet.btTransform_setRotation(convexTransTo, this._nativeDefaultQuaternion);
		}

		var collisionObjects: number = bullet.AllConvexResultCallback_get_m_collisionObjects(convexResultCall);
		bullet.tBtCollisionObjectArray_clear(collisionObjects);//清空检测队列
		bullet.btCollisionWorld_convexSweepTest(this._nativeCollisionWorld, sweepShape, convexTransform, convexTransTo, convexResultCall, allowedCcdPenetration);
		var count: number = bullet.tBtCollisionObjectArray_size(collisionObjects);
		if (count > 0) {
			var nativePoints: number = bullet.AllConvexResultCallback_get_m_hitPointWorld(convexResultCall);
			var nativeNormals: number = bullet.AllConvexResultCallback_get_m_hitNormalWorld(convexResultCall);
			var nativeFractions: number = bullet.AllConvexResultCallback_get_m_hitFractions(convexResultCall);
			for (var i: number = 0; i < count; i++) {
				var hitResult: HitResult = this._collisionsUtils.getHitResult();
				out.push(hitResult);
				hitResult.succeeded = true;
				hitResult.collider = PhysicsComponent._physicObjectsMap[bullet.btCollisionObject_getUserIndex(bullet.tBtCollisionObjectArray_at(collisionObjects, i))];
				hitResult.hitFraction = bullet.tScalarArray_at(nativeFractions, i);
				var nativePoint: number = bullet.tVector3Array_at(nativePoints, i);
				var point: Vector3 = hitResult.point;
				point.x = -bullet.btVector3_x(nativePoint);
				point.y = bullet.btVector3_y(nativePoint);
				point.z = bullet.btVector3_z(nativePoint);
				var nativeNormal: number = bullet.tVector3Array_at(nativeNormals, i);
				var normal: Vector3 = hitResult.normal;
				normal.x = -bullet.btVector3_x(nativeNormal);
				normal.y = bullet.btVector3_y(nativeNormal);
				normal.z = bullet.btVector3_z(nativeNormal);
			}
			return true;
		} else {
			return false;
		}
	}

	/**
	 * 添加刚体运动的约束条件。
	 * @param constraint 约束。
	 * @param disableCollisionsBetweenLinkedBodies 是否禁用
	 */
	addConstraint(constraint: Constraint3D, disableCollisionsBetweenLinkedBodies: boolean = false): void {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
		// this._nativeDiscreteDynamicsWorld.addConstraint(constraint._nativeConstraint, disableCollisionsBetweenLinkedBodies);
		constraint._simulation = this;
	}

	/**
	 * 移除刚体运动的约束条件。
	 */
	removeConstraint(constraint: Constraint3D): void {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
		// this._nativeDiscreteDynamicsWorld.removeConstraint(constraint._nativeConstraint);
	}

	/**
	 * @internal
	 */
	_updatePhysicsTransformFromRender(): void {
		var elements: any = this._physicsUpdateList.elements;
		for (var i: number = 0, n: number = this._physicsUpdateList.length; i < n; i++) {
			var physicCollider: PhysicsComponent = elements[i];
			physicCollider._derivePhysicsTransformation(false);
			physicCollider._inPhysicUpdateListIndex = -1;//置空索引
		}
		this._physicsUpdateList.length = 0;//清空物理更新队列
	}

	/**
	 * @internal
	 */
	_updateCharacters(): void {
		for (var i: number = 0, n: number = this._characters.length; i < n; i++) {
			var character: PhysicsComponent = this._characters[i];
			character._updateTransformComponent(Physics3D._bullet.btCollisionObject_getWorldTransform(character._nativeColliderObject));
		}
	}

	/**
	 * @internal
	 */
	_updateCollisions(): void {
		this._collisionsUtils.recoverAllContactPointsPool();
		var previous: Collision[] = this._currentFrameCollisions;
		this._currentFrameCollisions = this._previousFrameCollisions;
		this._currentFrameCollisions.length = 0;
		this._previousFrameCollisions = previous;
		var loopCount: number = Stat.loopCount;
		var physics3D: any = Physics3D._bullet;
		var numManifolds: number = physics3D.btDispatcher_getNumManifolds(this._nativeDispatcher);
		for (var i: number = 0; i < numManifolds; i++) {
			var contactManifold: number = physics3D.btDispatcher_getManifoldByIndexInternal(this._nativeDispatcher, i);//1.可能同时返回A和B、B和A 2.可能同时返回A和B多次(可能和CCD有关)
			var componentA: PhysicsTriggerComponent = PhysicsComponent._physicObjectsMap[physics3D.btCollisionObject_getUserIndex(physics3D.btPersistentManifold_getBody0(contactManifold))];
			var componentB: PhysicsTriggerComponent = PhysicsComponent._physicObjectsMap[physics3D.btCollisionObject_getUserIndex(physics3D.btPersistentManifold_getBody1(contactManifold))];
			var collision: Collision = null;
			var isFirstCollision: boolean;//可能同时返回A和B多次,需要过滤
			var contacts: ContactPoint[] = null;
			var isTrigger: boolean = componentA.isTrigger || componentB.isTrigger;
			if (isTrigger && (((<Sprite3D>componentA.owner))._needProcessTriggers || ((<Sprite3D>componentB.owner))._needProcessTriggers)) {
				var numContacts: number = physics3D.btPersistentManifold_getNumContacts(contactManifold);
				for (var j: number = 0; j < numContacts; j++) {
					var pt: number = physics3D.btPersistentManifold_getContactPoint(contactManifold, j);
					var distance: number = physics3D.btManifoldPoint_getDistance(pt);
					if (distance <= 0) {
						collision = this._collisionsUtils.getCollision(componentA, componentB);
						contacts = collision.contacts;
						isFirstCollision = collision._updateFrame !== loopCount;
						if (isFirstCollision) {
							collision._isTrigger = true;
							contacts.length = 0;
						}
						break;
					}
				}
			} else if (((<Sprite3D>componentA.owner))._needProcessCollisions || ((<Sprite3D>componentB.owner))._needProcessCollisions) {
				if (componentA._enableProcessCollisions || componentB._enableProcessCollisions) {//例：A和B均为运动刚体或PhysicCollider
					numContacts = physics3D.btPersistentManifold_getNumContacts(contactManifold);
					for (j = 0; j < numContacts; j++) {
						pt = physics3D.btPersistentManifold_getContactPoint(contactManifold, j);
						distance = physics3D.btManifoldPoint_getDistance(pt)
						if (distance <= 0) {
							var contactPoint: ContactPoint = this._collisionsUtils.getContactPoints();
							contactPoint.colliderA = componentA;
							contactPoint.colliderB = componentB;
							contactPoint.distance = distance;
							var nativeNormal: number = physics3D.btManifoldPoint_get_m_normalWorldOnB(pt);
							var normal: Vector3 = contactPoint.normal;
							normal.x = -physics3D.btVector3_x(nativeNormal);
							normal.y = physics3D.btVector3_y(nativeNormal);
							normal.z = physics3D.btVector3_z(nativeNormal);
							var nativePostionA: number = physics3D.btManifoldPoint_get_m_positionWorldOnA(pt);
							var positionOnA: Vector3 = contactPoint.positionOnA;
							positionOnA.x = -physics3D.btVector3_x(nativePostionA);
							positionOnA.y = physics3D.btVector3_y(nativePostionA);
							positionOnA.z = physics3D.btVector3_z(nativePostionA);
							var nativePostionB: number = physics3D.btManifoldPoint_get_m_positionWorldOnB(pt);
							var positionOnB: Vector3 = contactPoint.positionOnB;
							positionOnB.x = -physics3D.btVector3_x(nativePostionB);
							positionOnB.y = physics3D.btVector3_y(nativePostionB);
							positionOnB.z = physics3D.btVector3_z(nativePostionB);

							if (!collision) {
								collision = this._collisionsUtils.getCollision(componentA, componentB);
								contacts = collision.contacts;
								isFirstCollision = collision._updateFrame !== loopCount;
								if (isFirstCollision) {
									collision._isTrigger = false;
									contacts.length = 0;
								}
							}
							contacts.push(contactPoint);
						}
					}
				}
			}
			if (collision && isFirstCollision) {
				this._currentFrameCollisions.push(collision);
				collision._setUpdateFrame(loopCount);
			}
		}
	}

	/**
	 * @internal
	 */
	_eventScripts(): void {
		var loopCount: number = Stat.loopCount;
		for (var i: number = 0, n: number = this._currentFrameCollisions.length; i < n; i++) {
			var curFrameCol: Collision = this._currentFrameCollisions[i];
			var colliderA: PhysicsComponent = curFrameCol._colliderA;
			var colliderB: PhysicsComponent = curFrameCol._colliderB;
			if (colliderA.destroyed || colliderB.destroyed)//前一个循环可能会销毁后面循环的同一物理组件
				continue;
			if (loopCount - curFrameCol._lastUpdateFrame === 1) {
				var ownerA: Sprite3D = (<Sprite3D>colliderA.owner);
				var scriptsA: Script3D[] = ownerA._scripts;
				if (scriptsA) {
					if (curFrameCol._isTrigger) {
						if (ownerA._needProcessTriggers) {
							for (var j: number = 0, m: number = scriptsA.length; j < m; j++)
								scriptsA[j].onTriggerStay(colliderB);
						}
					} else {
						if (ownerA._needProcessCollisions) {
							for (j = 0, m = scriptsA.length; j < m; j++) {
								curFrameCol.other = colliderB;
								scriptsA[j].onCollisionStay(curFrameCol);
							}
						}
					}
				}
				var ownerB: Sprite3D = (<Sprite3D>colliderB.owner);
				var scriptsB: Script3D[] = ownerB._scripts;
				if (scriptsB) {
					if (curFrameCol._isTrigger) {
						if (ownerB._needProcessTriggers) {
							for (j = 0, m = scriptsB.length; j < m; j++)
								scriptsB[j].onTriggerStay(colliderA);
						}
					} else {
						if (ownerB._needProcessCollisions) {
							for (j = 0, m = scriptsB.length; j < m; j++) {
								curFrameCol.other = colliderA;
								scriptsB[j].onCollisionStay(curFrameCol);
							}
						}
					}
				}
			} else {
				ownerA = (<Sprite3D>colliderA.owner);
				scriptsA = ownerA._scripts;
				if (scriptsA) {
					if (curFrameCol._isTrigger) {
						if (ownerA._needProcessTriggers) {
							for (j = 0, m = scriptsA.length; j < m; j++)
								scriptsA[j].onTriggerEnter(colliderB);
						}
					} else {
						if (ownerA._needProcessCollisions) {
							for (j = 0, m = scriptsA.length; j < m; j++) {
								curFrameCol.other = colliderB;
								scriptsA[j].onCollisionEnter(curFrameCol);
							}
						}
					}
				}
				ownerB = (<Sprite3D>colliderB.owner);
				scriptsB = ownerB._scripts;
				if (scriptsB) {
					if (curFrameCol._isTrigger) {
						if (ownerB._needProcessTriggers) {
							for (j = 0, m = scriptsB.length; j < m; j++)
								scriptsB[j].onTriggerEnter(colliderA);
						}
					} else {
						if (ownerB._needProcessCollisions) {
							for (j = 0, m = scriptsB.length; j < m; j++) {
								curFrameCol.other = colliderA;
								scriptsB[j].onCollisionEnter(curFrameCol);
							}
						}

					}
				}
			}
		}

		for (i = 0, n = this._previousFrameCollisions.length; i < n; i++) {
			var preFrameCol: Collision = this._previousFrameCollisions[i];
			var preColliderA: PhysicsComponent = preFrameCol._colliderA;
			var preColliderB: PhysicsComponent = preFrameCol._colliderB;
			if (preColliderA.destroyed || preColliderB.destroyed)
				continue;
			if (loopCount - preFrameCol._updateFrame === 1) {
				this._collisionsUtils.recoverCollision(preFrameCol);//回收collision对象
				ownerA = (<Sprite3D>preColliderA.owner);
				scriptsA = ownerA._scripts;
				if (scriptsA) {
					if (preFrameCol._isTrigger) {
						if (ownerA._needProcessTriggers) {
							for (j = 0, m = scriptsA.length; j < m; j++)
								scriptsA[j].onTriggerExit(preColliderB);
						}
					} else {
						if (ownerA._needProcessCollisions) {
							for (j = 0, m = scriptsA.length; j < m; j++) {
								preFrameCol.other = preColliderB;
								scriptsA[j].onCollisionExit(preFrameCol);
							}
						}
					}
				}
				ownerB = (<Sprite3D>preColliderB.owner);
				scriptsB = ownerB._scripts;
				if (scriptsB) {
					if (preFrameCol._isTrigger) {
						if (ownerB._needProcessTriggers) {
							for (j = 0, m = scriptsB.length; j < m; j++)
								scriptsB[j].onTriggerExit(preColliderA);
						}
					} else {
						if (ownerB._needProcessCollisions) {
							for (j = 0, m = scriptsB.length; j < m; j++) {
								preFrameCol.other = preColliderA;
								scriptsB[j].onCollisionExit(preFrameCol);
							}
						}
					}
				}
			}
		}
	}

	/**
	 * 清除力。
	 */
	clearForces(): void {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
		Physics3D._bullet.btDiscreteDynamicsWorld_clearForces(this._nativeDiscreteDynamicsWorld);
	}

}


