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
	private static _nativeTempVector30: any;
	/** @internal */
	private static _nativeTempVector31: any;
	/** @internal */
	private static _nativeTempQuaternion0: any;
	/** @internal */
	private static _nativeTempQuaternion1: any;
	/** @internal */
	private static _nativeTempTransform0: any;
	/** @internal */
	private static _nativeTempTransform1: any;
	/**@internal */
	private static _tempVector30: Vector3 = new Vector3();

	/*是否禁用所有模拟器。*/
	static disableSimulation: boolean = false;

	/**
	* @internal
	*/
	static __init__(): void {
		PhysicsSimulation._nativeTempVector30 = new Physics3D._physics3D.btVector3(0, 0, 0);
		PhysicsSimulation._nativeTempVector31 = new Physics3D._physics3D.btVector3(0, 0, 0);
		PhysicsSimulation._nativeTempQuaternion0 = new Physics3D._physics3D.btQuaternion(0, 0, 0, 1);
		PhysicsSimulation._nativeTempQuaternion1 = new Physics3D._physics3D.btQuaternion(0, 0, 0, 1);
		PhysicsSimulation._nativeTempTransform0 = new Physics3D._physics3D.btTransform();
		PhysicsSimulation._nativeTempTransform1 = new Physics3D._physics3D.btTransform();
	}

	/**
	 * 创建限制刚体运动的约束条件。
	 */
	static createConstraint(): void {//TODO: 两种重载函数
		//TODO:
	}

	/**@internal	*/
	private _nativeDiscreteDynamicsWorld: any;
	/**@internal	*/
	private _nativeCollisionWorld: any;
	/**@internal	*/
	private _nativeDispatcher: any;
	/**@internal	*/
	private _nativeCollisionConfiguration: any;
	/**@internal	*/
	private _nativeBroadphase: any;
	/**@internal	*/
	private _nativeSolverInfo: any;
	/**@internal	*/
	private _nativeDispatchInfo: any;
	/**@internal	*/
	private _gravity: Vector3 = new Vector3(0, -10, 0);

	/** @internal */
	private _nativeVector3Zero: any = new Physics3D._physics3D.btVector3(0, 0, 0);
	/** @internal */
	private _nativeDefaultQuaternion: any = new Physics3D._physics3D.btQuaternion(0, 0, 0, -1);
	/**@internal */
	private _nativeClosestRayResultCallback: any;
	/**@internal */
	private _nativeAllHitsRayResultCallback: any;
	/**@internal */
	private _nativeClosestConvexResultCallback: any;
	/**@internal */
	private _nativeAllConvexResultCallback: any;

	/**@internal	*/
	private _collisionsUtils: CollisionTool = new CollisionTool();
	/**@internal	*/
	private _previousFrameCollisions: Collision[] = [];
	/**@internal	*/
	private _currentFrameCollisions: Collision[] = [];

	/**@internal	*/
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
		return this._nativeDispatchInfo.get_m_useContinuous();
	}

	/**
	 * 设置是否进行连续碰撞检测。
	 * @param value 是否进行连续碰撞检测。
	 */
	set continuousCollisionDetection(value: boolean) {
		this._nativeDispatchInfo.set_m_useContinuous(value);
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
		var nativeGravity: any = PhysicsSimulation._nativeTempVector30;
		nativeGravity.setValue(-value.x, value.y, value.z);//TODO:是否先get省一个变量
		this._nativeDiscreteDynamicsWorld.setGravity(nativeGravity);
	}

	/**
	 * @internal
	 */
	get speculativeContactRestitution(): boolean {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Simulation:Cannot Cannot perform this action when the physics engine is set to CollisionsOnly";
		return this._nativeDiscreteDynamicsWorld.getApplySpeculativeContactRestitution();
	}

	/**
	 * @internal
	 */
	set speculativeContactRestitution(value: boolean) {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Simulation:Cannot Cannot perform this action when the physics engine is set to CollisionsOnly";
		this._nativeDiscreteDynamicsWorld.setApplySpeculativeContactRestitution(value);
	}

	/**
	 * @internal
	 * 创建一个 <code>Simulation</code> 实例。
	 */
	constructor(configuration: PhysicsSettings, flags: number = 0) {
		this.maxSubSteps = configuration.maxSubSteps;
		this.fixedTimeStep = configuration.fixedTimeStep;

		var physics3D: any = Physics3D._physics3D;
		this._nativeCollisionConfiguration = new physics3D.btDefaultCollisionConfiguration();
		this._nativeDispatcher = new physics3D.btCollisionDispatcher(this._nativeCollisionConfiguration);
		this._nativeBroadphase = new physics3D.btDbvtBroadphase();
		this._nativeBroadphase.getOverlappingPairCache().setInternalGhostPairCallback(new physics3D.btGhostPairCallback());//this allows characters to have proper physics behavior

		var conFlags: number = configuration.flags;
		if (conFlags & PhysicsSimulation.PHYSICSENGINEFLAGS_COLLISIONSONLY) {
			this._nativeCollisionWorld = new physics3D.btCollisionWorld(this._nativeDispatcher, this._nativeBroadphase, this._nativeCollisionConfiguration);
		} else if (conFlags & PhysicsSimulation.PHYSICSENGINEFLAGS_SOFTBODYSUPPORT) {
			throw "PhysicsSimulation:SoftBody processing is not yet available";
		} else {
			var solver: any = new physics3D.btSequentialImpulseConstraintSolver();
			this._nativeDiscreteDynamicsWorld = new physics3D.btDiscreteDynamicsWorld(this._nativeDispatcher, this._nativeBroadphase, solver, this._nativeCollisionConfiguration);
			this._nativeCollisionWorld = this._nativeDiscreteDynamicsWorld;
		}

		if (this._nativeDiscreteDynamicsWorld) {
			this._nativeSolverInfo = this._nativeDiscreteDynamicsWorld.getSolverInfo(); //we are required to keep this reference, or the GC will mess up
			this._nativeDispatchInfo = this._nativeDiscreteDynamicsWorld.getDispatchInfo();
		}

		this._nativeClosestRayResultCallback = new physics3D.ClosestRayResultCallback(this._nativeVector3Zero, this._nativeVector3Zero);
		this._nativeAllHitsRayResultCallback = new physics3D.AllHitsRayResultCallback(this._nativeVector3Zero, this._nativeVector3Zero);
		this._nativeClosestConvexResultCallback = new physics3D.ClosestConvexResultCallback(this._nativeVector3Zero, this._nativeVector3Zero);
		this._nativeAllConvexResultCallback = new physics3D.AllConvexResultCallback(this._nativeVector3Zero, this._nativeVector3Zero);//是否TODO:优化C++

		physics3D._btGImpactCollisionAlgorithm_RegisterAlgorithm(this._nativeDispatcher.a);//注册算法
	}

	/**
	 * @internal
	 */
	_simulate(deltaTime: number): void {
		this._updatedRigidbodies = 0;

		if (this._nativeDiscreteDynamicsWorld)
			this._nativeDiscreteDynamicsWorld.stepSimulation(deltaTime, this.maxSubSteps, this.fixedTimeStep);
		else
			this._nativeCollisionWorld.PerformDiscreteCollisionDetection();

	}

	/**
	 * @internal
	 */
	_destroy(): void {
		var physics3D: any = Physics3D._physics3D;
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
		this._nativeCollisionWorld.addCollisionObject(component._nativeColliderObject, group, mask);
	}

	/**
	 * @internal
	 */
	_removePhysicsCollider(component: PhysicsCollider): void {
		this._nativeCollisionWorld.removeCollisionObject(component._nativeColliderObject);
	}

	/**
	 * @internal
	 */
	_addRigidBody(rigidBody: Rigidbody3D, group: number, mask: number): void {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
		this._nativeCollisionWorld.addRigidBody(rigidBody._nativeColliderObject, group, mask);
	}

	/**
	 * @internal
	 */
	_removeRigidBody(rigidBody: Rigidbody3D): void {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
		this._nativeCollisionWorld.removeRigidBody(rigidBody._nativeColliderObject);
	}

	/**
	 * @internal
	 */
	_addCharacter(character: CharacterController, group: number, mask: number): void {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
		this._nativeCollisionWorld.addCollisionObject(character._nativeColliderObject, group, mask);
		this._nativeCollisionWorld.addAction(character._nativeKinematicCharacter);
	}

	/**
	 * @internal
	 */
	_removeCharacter(character: CharacterController): void {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
		this._nativeCollisionWorld.removeCollisionObject(character._nativeColliderObject);
		this._nativeCollisionWorld.removeAction(character._nativeKinematicCharacter);
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
		var rayResultCall: any = this._nativeClosestRayResultCallback;
		var rayFrom: any = PhysicsSimulation._nativeTempVector30;
		var rayTo: any = PhysicsSimulation._nativeTempVector31;
		rayFrom.setValue(-from.x, from.y, from.z);
		rayTo.setValue(-to.x, to.y, to.z);
		rayResultCall.set_m_rayFromWorld(rayFrom);
		rayResultCall.set_m_rayToWorld(rayTo);
		rayResultCall.set_m_collisionFilterGroup(collisonGroup);
		rayResultCall.set_m_collisionFilterMask(collisionMask);

		rayResultCall.set_m_collisionObject(null);//还原默认值
		rayResultCall.set_m_closestHitFraction(1);//还原默认值
		this._nativeCollisionWorld.rayTest(rayFrom, rayTo, rayResultCall);//TODO:out为空可优化,bullet内
		if (rayResultCall.hasHit()) {
			if (out) {
				out.succeeded = true;
				out.collider = PhysicsComponent._physicObjectsMap[rayResultCall.get_m_collisionObject().getUserIndex()];
				out.hitFraction = rayResultCall.get_m_closestHitFraction();
				var nativePoint: any = rayResultCall.get_m_hitPointWorld();
				var point: Vector3 = out.point;
				point.x = -nativePoint.x();
				point.y = nativePoint.y();
				point.z = nativePoint.z();
				var nativeNormal: any = rayResultCall.get_m_hitNormalWorld();
				var normal: Vector3 = out.normal;
				normal.x = -nativeNormal.x();
				normal.y = nativeNormal.y();
				normal.z = nativeNormal.z();
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
		var rayResultCall: any = this._nativeAllHitsRayResultCallback;
		var rayFrom: any = PhysicsSimulation._nativeTempVector30;
		var rayTo: any = PhysicsSimulation._nativeTempVector31;

		out.length = 0;
		rayFrom.setValue(-from.x, from.y, from.z);
		rayTo.setValue(-to.x, to.y, to.z);
		rayResultCall.set_m_rayFromWorld(rayFrom);
		rayResultCall.set_m_rayToWorld(rayTo);
		rayResultCall.set_m_collisionFilterGroup(collisonGroup);
		rayResultCall.set_m_collisionFilterMask(collisionMask);

		//rayResultCall.set_m_collisionObject(null);//还原默认值
		//rayResultCall.set_m_closestHitFraction(1);//还原默认值
		var collisionObjects: any = rayResultCall.get_m_collisionObjects();
		var nativePoints: any = rayResultCall.get_m_hitPointWorld();
		var nativeNormals: any = rayResultCall.get_m_hitNormalWorld();
		var nativeFractions: any = rayResultCall.get_m_hitFractions();
		collisionObjects.clear();//清空检测队列
		nativePoints.clear();
		nativeNormals.clear();
		nativeFractions.clear();
		this._nativeCollisionWorld.rayTest(rayFrom, rayTo, rayResultCall);
		var count: number = collisionObjects.size();
		if (count > 0) {

			this._collisionsUtils.recoverAllHitResultsPool();
			for (var i: number = 0; i < count; i++) {
				var hitResult: HitResult = this._collisionsUtils.getHitResult();
				out.push(hitResult);
				hitResult.succeeded = true;
				hitResult.collider = PhysicsComponent._physicObjectsMap[collisionObjects.at(i).getUserIndex()];
				hitResult.hitFraction = nativeFractions.at(i);
				var nativePoint: any = nativePoints.at(i);//取出后需要立即赋值,防止取出法线时被覆盖
				var pointE: Vector3 = hitResult.point;
				pointE.x = -nativePoint.x();
				pointE.y = nativePoint.y();
				pointE.z = nativePoint.z();
				var nativeNormal: any = nativeNormals.at(i);
				var normalE: Vector3 = hitResult.normal;
				normalE.x = -nativeNormal.x();
				normalE.y = nativeNormal.y();
				normalE.z = nativeNormal.z();
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
		var convexResultCall: any = this._nativeClosestConvexResultCallback;
		var convexPosFrom: any = PhysicsSimulation._nativeTempVector30;
		var convexPosTo: any = PhysicsSimulation._nativeTempVector31;
		var convexRotFrom: any = PhysicsSimulation._nativeTempQuaternion0;
		var convexRotTo: any = PhysicsSimulation._nativeTempQuaternion1;
		var convexTransform: any = PhysicsSimulation._nativeTempTransform0;
		var convexTransTo: any = PhysicsSimulation._nativeTempTransform1;

		var sweepShape: any = shape._nativeShape;

		convexPosFrom.setValue(-fromPosition.x, fromPosition.y, fromPosition.z);
		convexPosTo.setValue(-toPosition.x, toPosition.y, toPosition.z);
		//convexResultCall.set_m_convexFromWorld(convexPosFrom);
		//convexResultCall.set_m_convexToWorld(convexPosTo);
		convexResultCall.set_m_collisionFilterGroup(collisonGroup);
		convexResultCall.set_m_collisionFilterMask(collisionMask);

		convexTransform.setOrigin(convexPosFrom);
		convexTransTo.setOrigin(convexPosTo);

		if (fromRotation) {
			convexRotFrom.setValue(-fromRotation.x, fromRotation.y, fromRotation.z, -fromRotation.w);
			convexTransform.setRotation(convexRotFrom);
		} else {
			convexTransform.setRotation(this._nativeDefaultQuaternion);
		}
		if (toRotation) {
			convexRotTo.setValue(-toRotation.x, toRotation.y, toRotation.z, -toRotation.w);
			convexTransTo.setRotation(convexRotTo);
		} else {
			convexTransTo.setRotation(this._nativeDefaultQuaternion);
		}

		convexResultCall.set_m_hitCollisionObject(null);//还原默认值
		convexResultCall.set_m_closestHitFraction(1);//还原默认值
		this._nativeCollisionWorld.convexSweepTest(sweepShape, convexTransform, convexTransTo, convexResultCall, allowedCcdPenetration);
		if (convexResultCall.hasHit()) {
			if (out) {
				out.succeeded = true;
				out.collider = PhysicsComponent._physicObjectsMap[convexResultCall.get_m_hitCollisionObject().getUserIndex()];
				out.hitFraction = convexResultCall.get_m_closestHitFraction();
				var nativePoint: any = convexResultCall.get_m_hitPointWorld();
				var nativeNormal: any = convexResultCall.get_m_hitNormalWorld();
				var point: Vector3 = out.point;
				var normal: Vector3 = out.normal;
				point.x = -nativePoint.x();
				point.y = nativePoint.y();
				point.z = nativePoint.z();
				normal.x = -nativeNormal.x();
				normal.y = nativeNormal.y();
				normal.z = nativeNormal.z();
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
		var convexResultCall: any = this._nativeAllConvexResultCallback;
		var convexPosFrom: any = PhysicsSimulation._nativeTempVector30;
		var convexPosTo: any = PhysicsSimulation._nativeTempVector31;
		var convexRotFrom: any = PhysicsSimulation._nativeTempQuaternion0;
		var convexRotTo: any = PhysicsSimulation._nativeTempQuaternion1;
		var convexTransform: any = PhysicsSimulation._nativeTempTransform0;
		var convexTransTo: any = PhysicsSimulation._nativeTempTransform1;

		var sweepShape: any = shape._nativeShape;

		out.length = 0;
		convexPosFrom.setValue(-fromPosition.x, fromPosition.y, fromPosition.z);
		convexPosTo.setValue(-toPosition.x, toPosition.y, toPosition.z);

		//convexResultCall.set_m_convexFromWorld(convexPosFrom);
		//convexResultCall.set_m_convexToWorld(convexPosTo);

		convexResultCall.set_m_collisionFilterGroup(collisonGroup);
		convexResultCall.set_m_collisionFilterMask(collisionMask);

		convexTransform.setOrigin(convexPosFrom);
		convexTransTo.setOrigin(convexPosTo);
		if (fromRotation) {
			convexRotFrom.setValue(-fromRotation.x, fromRotation.y, fromRotation.z, -fromRotation.w);
			convexTransform.setRotation(convexRotFrom);
		} else {
			convexTransform.setRotation(this._nativeDefaultQuaternion);
		}
		if (toRotation) {
			convexRotTo.setValue(-toRotation.x, toRotation.y, toRotation.z, -toRotation.w);
			convexTransTo.setRotation(convexRotTo);
		} else {
			convexTransTo.setRotation(this._nativeDefaultQuaternion);
		}

		var collisionObjects: any = convexResultCall.get_m_collisionObjects();
		collisionObjects.clear();//清空检测队列
		this._nativeCollisionWorld.convexSweepTest(sweepShape, convexTransform, convexTransTo, convexResultCall, allowedCcdPenetration);
		var count: number = collisionObjects.size();
		if (count > 0) {
			var nativePoints: any = convexResultCall.get_m_hitPointWorld();
			var nativeNormals: any = convexResultCall.get_m_hitNormalWorld();
			var nativeFractions: any = convexResultCall.get_m_hitFractions();
			for (var i: number = 0; i < count; i++) {
				var hitResult: HitResult = this._collisionsUtils.getHitResult();
				out.push(hitResult);
				hitResult.succeeded = true;
				hitResult.collider = PhysicsComponent._physicObjectsMap[collisionObjects.at(i).getUserIndex()];
				hitResult.hitFraction = nativeFractions.at(i);
				var nativePoint: any = nativePoints.at(i);
				var point: Vector3 = hitResult.point;
				point.x = -nativePoint.x();
				point.y = nativePoint.y();
				point.z = nativePoint.z();
				var nativeNormal: any = nativeNormals.at(i);
				var normal: Vector3 = hitResult.normal;
				normal.x = -nativeNormal.x();
				normal.y = nativeNormal.y();
				normal.z = nativeNormal.z();
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
		this._nativeDiscreteDynamicsWorld.addConstraint(constraint._nativeConstraint, disableCollisionsBetweenLinkedBodies);
		constraint._simulation = this;
	}

	/**
	 * 移除刚体运动的约束条件。
	 */
	removeConstraint(constraint: Constraint3D): void {
		if (!this._nativeDiscreteDynamicsWorld)
			throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
		this._nativeDiscreteDynamicsWorld.removeConstraint(constraint._nativeConstraint);
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
			character._updateTransformComponent(character._nativeColliderObject.getWorldTransform());
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
		var numManifolds: number = this._nativeDispatcher.getNumManifolds();
		for (var i: number = 0; i < numManifolds; i++) {
			var contactManifold: any = this._nativeDispatcher.getManifoldByIndexInternal(i);//1.可能同时返回A和B、B和A 2.可能同时返回A和B多次(可能和CCD有关)
			var componentA: PhysicsTriggerComponent = PhysicsComponent._physicObjectsMap[contactManifold.getBody0().getUserIndex()];
			var componentB: PhysicsTriggerComponent = PhysicsComponent._physicObjectsMap[contactManifold.getBody1().getUserIndex()];
			var collision: Collision = null;
			var isFirstCollision: boolean;//可能同时返回A和B多次,需要过滤
			var contacts: ContactPoint[] = null;
			var isTrigger: boolean = componentA.isTrigger || componentB.isTrigger;
			if (isTrigger && (((<Sprite3D>componentA.owner))._needProcessTriggers || ((<Sprite3D>componentB.owner))._needProcessTriggers)) {
				var numContacts: number = contactManifold.getNumContacts();
				for (var j: number = 0; j < numContacts; j++) {
					var pt: any = contactManifold.getContactPoint(j);
					var distance: number = pt.getDistance();
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
					numContacts = contactManifold.getNumContacts();
					for (j = 0; j < numContacts; j++) {
						pt = contactManifold.getContactPoint(j);
						distance = pt.getDistance();
						if (distance <= 0) {
							var contactPoint: ContactPoint = this._collisionsUtils.getContactPoints();
							contactPoint.colliderA = componentA;
							contactPoint.colliderB = componentB;
							contactPoint.distance = distance;
							var nativeNormal: any = pt.get_m_normalWorldOnB();
							var normal: Vector3 = contactPoint.normal;
							normal.x = -nativeNormal.x();
							normal.y = nativeNormal.y();
							normal.z = nativeNormal.z();
							var nativePostionA: any = pt.get_m_positionWorldOnA();
							var positionOnA: Vector3 = contactPoint.positionOnA;
							positionOnA.x = -nativePostionA.x();
							positionOnA.y = nativePostionA.y();
							positionOnA.z = nativePostionA.z();
							var nativePostionB: any = pt.get_m_positionWorldOnB();
							var positionOnB: Vector3 = contactPoint.positionOnB;
							positionOnB.x = -nativePostionB.x();
							positionOnB.y = nativePostionB.y();
							positionOnB.z = nativePostionB.z();

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
		this._nativeDiscreteDynamicsWorld.clearForces();
	}

}


