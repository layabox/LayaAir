import { Ray } from "../math/Ray";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { CharacterController } from "./CharacterController";
import { PhysicsUpdateList } from "./PhysicsUpdateList";
import { Collision } from "./Collision";
import { CollisionTool } from "./CollisionTool";
import { ContactPoint } from "./ContactPoint";
import { HitResult } from "./HitResult";
import { PhysicsCollider } from "./PhysicsCollider";
import { PhysicsComponent } from "./PhysicsComponent";
import { PhysicsSettings } from "./PhysicsSettings";
import { PhysicsTriggerComponent } from "./PhysicsTriggerComponent";
import { Rigidbody3D } from "./Rigidbody3D";
import { ColliderShape } from "./shape/ColliderShape";
import { ConstraintComponent } from "./constraints/ConstraintComponent";
import { ILaya3D } from "../../../ILaya3D";
import { RaycastVehicle } from "./RaycastVehicle";
import { NodeFlags } from "../../Const";
import { Event } from "../../events/Event";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";

/**
 * <code>Simulation</code> 类用于创建物理模拟器。
 */
export class PhysicsSimulation {
    /** @internal */
    static PHYSICSENGINEFLAGS_NONE = 0x0;
    /** @internal */
    static PHYSICSENGINEFLAGS_COLLISIONSONLY = 0x1;
    /** @internal */
    static PHYSICSENGINEFLAGS_SOFTBODYSUPPORT = 0x2;
    /** @internal */
    static PHYSICSENGINEFLAGS_MULTITHREADED = 0x4;
    /** @internal */
    static PHYSICSENGINEFLAGS_USEHARDWAREWHENPOSSIBLE = 0x8;

    /** @internal */
    static SOLVERMODE_RANDMIZE_ORDER = 1;
    /** @internal */
    static SOLVERMODE_FRICTION_SEPARATE = 2;
    /** @internal */
    static SOLVERMODE_USE_WARMSTARTING = 4;
    /** @internal */
    static SOLVERMODE_USE_2_FRICTION_DIRECTIONS = 16;
    /** @internal */
    static SOLVERMODE_ENABLE_FRICTION_DIRECTION_CACHING = 32;
    /** @internal */
    static SOLVERMODE_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION = 64;
    /** @internal */
    static SOLVERMODE_CACHE_FRIENDLY = 128;
    /** @internal */
    static SOLVERMODE_SIMD = 256;
    /** @internal */
    static SOLVERMODE_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS = 512;
    /** @internal */
    static SOLVERMODE_ALLOW_ZERO_LENGTH_FRICTION_DIRECTIONS = 1024;
    /** @internal 射线回调模式*/
    static HITSRAYRESULTCALLBACK_FLAG_NONE = 0;
    /** @internal 射线回调模式 忽略反面,射线检测时，会忽略掉反面的三角形*/
    static HITSRAYRESULTCALLBACK_FLAG_FILTERBACKFACESS = 1;
    /** @internal 射线回调模式*/
    static HITSRAYRESULTCALLBACK_FLAG_KEEPUNFILIPPEDNORMAL = 2;
    /** @internal 射线回调模式*/
    static HITSRAYRESULTCALLBACK_FLAG_USESUBSIMPLEXCONVEXCASTRAYTEST = 4;
    /** @internal 射线回调模式*/
    static HITSRAYRESULTCALLBACK_FLAG_USEGJKCONVEXCASTRAYTEST = 8;
    /** @internal 射线回调模式*/
    static HITSRAYRESULTCALLBACK_FLAG_TERMINATOR = 0xffffffff;
    /** @internal */
    private static _btTempVector30: number;
    /** @internal */
    private static _btTempVector31: number;
    /** @internal */
    private static _btTempQuaternion0: number;
    /** @internal */
    private static _btTempQuaternion1: number;
    /** @internal */
    private static _btTempTransform0: number;
    /** @internal */
    private static _btTempTransform1: number;
    /** @internal */
    private static _tempVector30 = new Vector3();

    /*是否禁用所有模拟器。*/
    static disableSimulation = false;

    protected _updateCount = 0;

    /**
    * @internal
    */
    static __init__(): void {
        var bt: any = ILaya3D.Physics3D._bullet;
        PhysicsSimulation._btTempVector30 = bt.btVector3_create(0, 0, 0);
        PhysicsSimulation._btTempVector31 = bt.btVector3_create(0, 0, 0);
        PhysicsSimulation._btTempQuaternion0 = bt.btQuaternion_create(0, 0, 0, 1);
        PhysicsSimulation._btTempQuaternion1 = bt.btQuaternion_create(0, 0, 0, 1);
        PhysicsSimulation._btTempTransform0 = bt.btTransform_create();
        PhysicsSimulation._btTempTransform1 = bt.btTransform_create();
    }

    /**
     * 创建限制刚体运动的约束条件。
     */
    static createConstraint(): void {//TODO: 两种重载函数
        //TODO:
    }

    /** @internal */
    private _btDiscreteDynamicsWorld: number;
    /** @internal */
    private _btCollisionWorld: number;
    /** @internal */
    protected _btDispatcher: number;
    /** @internal */
    private _btCollisionConfiguration: number;
    /** @internal */
    private _btBroadphase: number;
    /** @internal */
    _btSolverInfo: number;
    /** @internal */
    private _btDispatchInfo: number;
    /** @internal */
    private _gravity = new Vector3(0, -10, 0);

    /** @internal */
    private _btVector3Zero: number = ILaya3D.Physics3D._bullet.btVector3_create(0, 0, 0);
    /** @internal */
    private _btDefaultQuaternion: number = ILaya3D.Physics3D._bullet.btQuaternion_create(0, 0, 0, -1);
    /** @internal */
    private _btClosestRayResultCallback: number;
    /** @internal */
    private _btAllHitsRayResultCallback: number;
    /** @internal */
    private _btClosestConvexResultCallback: number;
    /** @internal */
    private _btAllConvexResultCallback: number;

    /** @internal */
    protected _collisionsUtils = new CollisionTool();
    /** @internal */
    protected _previousFrameCollisions: Collision[] = [];
    /** @internal */
    protected _currentFrameCollisions: Collision[] = [];
    /** @internal */
    private _currentConstraint: { [key: number]: ConstraintComponent } = {};
    /** @internal */
    _physicsUpdateList = new PhysicsUpdateList();
    /**@internal	*/
    _characters: CharacterController[] = [];
    /**@internal	*/
    _updatedRigidbodies = 0;

    /**物理引擎在一帧中用于补偿减速的最大次数：模拟器每帧允许的最大模拟次数，如果引擎运行缓慢,可能需要增加该次数，否则模拟器会丢失“时间",引擎间隔时间小于maxSubSteps*fixedTimeStep非常重要。*/
    maxSubSteps = 1;
    /**物理模拟器帧的间隔时间:通过减少fixedTimeStep可增加模拟精度，默认是1.0 / 60.0。*/
    fixedTimeStep = 1.0 / 60.0;

    dt = 1 / 60;

    /**
     * 是否进行连续碰撞检测。
     */
    get continuousCollisionDetection(): boolean {
        return ILaya3D.Physics3D._bullet.btCollisionWorld_get_m_useContinuous(this._btDispatchInfo);
    }

    set continuousCollisionDetection(value: boolean) {
        ILaya3D.Physics3D._bullet.btCollisionWorld_set_m_useContinuous(this._btDispatchInfo, value);
    }

    /**
     * 获取重力。
     */
    get gravity(): Vector3 {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        return this._gravity;
    }

    set gravity(value: Vector3) {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";

        this._gravity = value;
        var bt: any = ILaya3D.Physics3D._bullet;
        var btGravity: number = PhysicsSimulation._btTempVector30;
        bt.btVector3_setValue(btGravity, value.x, value.y, value.z);//TODO:是否先get省一个变量
        bt.btDiscreteDynamicsWorld_setGravity(this._btDiscreteDynamicsWorld, btGravity);
    }

    /**
     * @internal
     */
    get speculativeContactRestitution(): boolean {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot Cannot perform this action when the physics engine is set to CollisionsOnly";
        return ILaya3D.Physics3D._bullet.btDiscreteDynamicsWorld_getApplySpeculativeContactRestitution(this._btDiscreteDynamicsWorld);
    }

    /**
     * @internal
     */
    set speculativeContactRestitution(value: boolean) {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot Cannot perform this action when the physics engine is set to CollisionsOnly";
        ILaya3D.Physics3D._bullet.btDiscreteDynamicsWorld_setApplySpeculativeContactRestitution(this._btDiscreteDynamicsWorld, value);
    }

    /**
     * @internal
     * 创建一个 <code>Simulation</code> 实例。
     */
    constructor(configuration: PhysicsSettings) {
        this.maxSubSteps = configuration.maxSubSteps;
        this.fixedTimeStep = configuration.fixedTimeStep;

        var bt: any = ILaya3D.Physics3D._bullet;
        this._btCollisionConfiguration = bt.btDefaultCollisionConfiguration_create();
        this._btDispatcher = bt.btCollisionDispatcher_create(this._btCollisionConfiguration);
        this._btBroadphase = bt.btDbvtBroadphase_create();
        bt.btOverlappingPairCache_setInternalGhostPairCallback(bt.btDbvtBroadphase_getOverlappingPairCache(this._btBroadphase), bt.btGhostPairCallback_create());//this allows characters to have proper physics behavior

        var conFlags = configuration.flags;
        if (conFlags & PhysicsSimulation.PHYSICSENGINEFLAGS_COLLISIONSONLY) {
            this._btCollisionWorld = new bt.btCollisionWorld(this._btDispatcher, this._btBroadphase, this._btCollisionConfiguration);
        } else if (conFlags & PhysicsSimulation.PHYSICSENGINEFLAGS_SOFTBODYSUPPORT) {
            throw "PhysicsSimulation:SoftBody processing is not yet available";
        } else {
            var solver: number = bt.btSequentialImpulseConstraintSolver_create();
            this._btDiscreteDynamicsWorld = bt.btDiscreteDynamicsWorld_create(this._btDispatcher, this._btBroadphase, solver, this._btCollisionConfiguration);
            this._btCollisionWorld = this._btDiscreteDynamicsWorld;
        }

        if (this._btDiscreteDynamicsWorld) {
            this._btSolverInfo = bt.btDynamicsWorld_getSolverInfo(this._btDiscreteDynamicsWorld); //we are required to keep this reference, or the GC will mess up
            this._btDispatchInfo = bt.btCollisionWorld_getDispatchInfo(this._btDiscreteDynamicsWorld);
        }

        this._btClosestRayResultCallback = bt.ClosestRayResultCallback_create(this._btVector3Zero, this._btVector3Zero);
        this._btAllHitsRayResultCallback = bt.AllHitsRayResultCallback_create(this._btVector3Zero, this._btVector3Zero);
        this._btClosestConvexResultCallback = bt.ClosestConvexResultCallback_create(this._btVector3Zero, this._btVector3Zero);
        this._btAllConvexResultCallback = bt.AllConvexResultCallback_create(this._btVector3Zero, this._btVector3Zero);//TODO:是否优化C++
        //this.setHitsRayResultCallbackFlag();
        bt.btGImpactCollisionAlgorithm_RegisterAlgorithm(this._btDispatcher);//注册算法
    }

    enableDebugDrawer(b: boolean) {
        var bt: any = ILaya3D.Physics3D._bullet;
        bt.btDynamicsWorld_enableDebugDrawer(this._btDiscreteDynamicsWorld, b);
    }

    /**
     * @internal
     */
    _simulate(deltaTime: number): void {
        this._updatedRigidbodies = 0;
        this.dt = deltaTime;
        var bt: any = ILaya3D.Physics3D._bullet;
        if (this._btDiscreteDynamicsWorld)
            bt.btDiscreteDynamicsWorld_stepSimulation(this._btDiscreteDynamicsWorld, deltaTime, this.maxSubSteps, this.fixedTimeStep);
        else
            bt.PerformDiscreteCollisionDetection(this._btCollisionWorld);

        this._updateCount++;
    }

    /**
     * @internal
     */
    _destroy(): void {
        var bt: any = ILaya3D.Physics3D._bullet;
        if (this._btDiscreteDynamicsWorld) {
            bt.btCollisionWorld_destroy(this._btDiscreteDynamicsWorld);
            this._btDiscreteDynamicsWorld = null;
        } else {
            bt.btCollisionWorld_destroy(this._btCollisionWorld);
            this._btCollisionWorld = null;
        }

        bt.btDbvtBroadphase_destroy(this._btBroadphase);
        this._btBroadphase = null;
        bt.btCollisionDispatcher_destroy(this._btDispatcher);
        this._btDispatcher = null;
        bt.btDefaultCollisionConfiguration_destroy(this._btCollisionConfiguration);
        this._btCollisionConfiguration = null;
    }

    /**
     * @internal
     */
    _addPhysicsCollider(component: PhysicsCollider, group: number, mask: number): void {
        ILaya3D.Physics3D._bullet.btCollisionWorld_addCollisionObject(this._btCollisionWorld, component._btColliderObject, group, mask);
    }

    /**
     * @internal
     */
    _removePhysicsCollider(component: PhysicsCollider): void {
        ILaya3D.Physics3D._bullet.btCollisionWorld_removeCollisionObject(this._btCollisionWorld, component._btColliderObject);
    }

    /**
     * @internal
     */
    _addRigidBody(rigidBody: Rigidbody3D, group: number, mask: number): void {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        ILaya3D.Physics3D._bullet.btDiscreteDynamicsWorld_addRigidBody(this._btCollisionWorld, rigidBody._btColliderObject, group, mask);
    }

    /**
     * @internal
     */
    _removeRigidBody(rigidBody: Rigidbody3D): void {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        ILaya3D.Physics3D._bullet.btDiscreteDynamicsWorld_removeRigidBody(this._btCollisionWorld, rigidBody._btColliderObject);
    }

    /**
     * @internal
     */
    _addCharacter(character: CharacterController, group: number, mask: number): void {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        var bt: any = ILaya3D.Physics3D._bullet;
        bt.btCollisionWorld_addCollisionObject(this._btCollisionWorld, character._btColliderObject, group, mask);
        bt.btDynamicsWorld_addAction(this._btCollisionWorld, character._btKinematicCharacter);
    }

    /**
     * @internal
     */
    _removeCharacter(character: CharacterController): void {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        var bt: any = ILaya3D.Physics3D._bullet;
        bt.btCollisionWorld_removeCollisionObject(this._btCollisionWorld, character._btColliderObject);
        bt.btDynamicsWorld_removeAction(this._btCollisionWorld, character._btKinematicCharacter);
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
        var bt: any = ILaya3D.Physics3D._bullet;
        var rayResultCall: number = this._btClosestRayResultCallback;
        var rayFrom = PhysicsSimulation._btTempVector30;
        var rayTo = PhysicsSimulation._btTempVector31;
        bt.btVector3_setValue(rayFrom, from.x, from.y, from.z);
        bt.btVector3_setValue(rayTo, to.x, to.y, to.z);
        bt.ClosestRayResultCallback_set_m_rayFromWorld(rayResultCall, rayFrom);
        bt.ClosestRayResultCallback_set_m_rayToWorld(rayResultCall, rayTo);
        bt.RayResultCallback_set_m_collisionFilterGroup(rayResultCall, collisonGroup);
        bt.RayResultCallback_set_m_collisionFilterMask(rayResultCall, collisionMask);

        bt.RayResultCallback_set_m_collisionObject(rayResultCall, null);//还原默认值
        bt.RayResultCallback_set_m_closestHitFraction(rayResultCall, 1);//还原默认值
        bt.btCollisionWorld_rayTest(this._btCollisionWorld, rayFrom, rayTo, rayResultCall);//TODO:out为空可优化,bullet内
        if (bt.RayResultCallback_hasHit(rayResultCall)) {
            if (out) {
                out.succeeded = true;
                out.collider = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.RayResultCallback_get_m_collisionObject(rayResultCall))];
                out.hitFraction = bt.RayResultCallback_get_m_closestHitFraction(rayResultCall);
                var btPoint: number = bt.ClosestRayResultCallback_get_m_hitPointWorld(rayResultCall);
                var point = out.point;
                point.x = bt.btVector3_x(btPoint);
                point.y = bt.btVector3_y(btPoint);
                point.z = bt.btVector3_z(btPoint);
                var btNormal: number = bt.ClosestRayResultCallback_get_m_hitNormalWorld(rayResultCall);
                var normal = out.normal;
                normal.x = bt.btVector3_x(btNormal);
                normal.y = bt.btVector3_y(btNormal);
                normal.z = bt.btVector3_z(btNormal);
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
        var bt: any = ILaya3D.Physics3D._bullet;
        var rayResultCall: number = this._btAllHitsRayResultCallback;
        var rayFrom: number = PhysicsSimulation._btTempVector30;
        var rayTo: number = PhysicsSimulation._btTempVector31;

        out.length = 0;
        bt.btVector3_setValue(rayFrom, from.x, from.y, from.z);
        bt.btVector3_setValue(rayTo, to.x, to.y, to.z);
        bt.AllHitsRayResultCallback_set_m_rayFromWorld(rayResultCall, rayFrom);
        bt.AllHitsRayResultCallback_set_m_rayToWorld(rayResultCall, rayTo);
        bt.RayResultCallback_set_m_collisionFilterGroup(rayResultCall, collisonGroup);
        bt.RayResultCallback_set_m_collisionFilterMask(rayResultCall, collisionMask);

        //rayResultCall.set_m_collisionObject(null);//还原默认值
        //rayResultCall.set_m_closestHitFraction(1);//还原默认值
        var collisionObjects: number = bt.AllHitsRayResultCallback_get_m_collisionObjects(rayResultCall);
        var btPoints: number = bt.AllHitsRayResultCallback_get_m_hitPointWorld(rayResultCall);
        var btNormals: number = bt.AllHitsRayResultCallback_get_m_hitNormalWorld(rayResultCall);
        var btFractions: number = bt.AllHitsRayResultCallback_get_m_hitFractions(rayResultCall);
        bt.tBtCollisionObjectArray_clear(collisionObjects);//清空检测队列
        bt.tVector3Array_clear(btPoints);
        bt.tVector3Array_clear(btNormals);
        bt.tScalarArray_clear(btFractions);
        bt.btCollisionWorld_rayTest(this._btCollisionWorld, rayFrom, rayTo, rayResultCall);
        var count: number = bt.tBtCollisionObjectArray_size(collisionObjects);
        if (count > 0) {
            this._collisionsUtils.recoverAllHitResultsPool();
            for (var i = 0; i < count; i++) {
                var hitResult = this._collisionsUtils.getHitResult();
                out.push(hitResult);
                hitResult.succeeded = true;
                hitResult.collider = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.tBtCollisionObjectArray_at(collisionObjects, i))];
                hitResult.hitFraction = bt.tScalarArray_at(btFractions, i);
                var btPoint: number = bt.tVector3Array_at(btPoints, i);//取出后需要立即赋值,防止取出法线时被覆盖
                var pointE = hitResult.point;
                pointE.x = bt.btVector3_x(btPoint);
                pointE.y = bt.btVector3_y(btPoint);
                pointE.z = bt.btVector3_z(btPoint);
                var btNormal: number = bt.tVector3Array_at(btNormals, i);
                var normal = hitResult.normal;
                normal.x = bt.btVector3_x(btNormal);
                normal.y = bt.btVector3_y(btNormal);
                normal.z = bt.btVector3_z(btNormal);
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
        var from = ray.origin;
        var to = PhysicsSimulation._tempVector30;
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
        var from = ray.origin;
        var to = PhysicsSimulation._tempVector30;
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
        var bt: any = ILaya3D.Physics3D._bullet;
        var convexResultCall: number = this._btClosestConvexResultCallback;
        var convexPosFrom: number = PhysicsSimulation._btTempVector30;
        var convexPosTo: number = PhysicsSimulation._btTempVector31;
        var convexRotFrom: number = PhysicsSimulation._btTempQuaternion0;
        var convexRotTo: number = PhysicsSimulation._btTempQuaternion1;
        var convexTransform: number = PhysicsSimulation._btTempTransform0;
        var convexTransTo: number = PhysicsSimulation._btTempTransform1;

        var sweepShape: number = shape._btShape;

        bt.btVector3_setValue(convexPosFrom, fromPosition.x, fromPosition.y, fromPosition.z);
        bt.btVector3_setValue(convexPosTo, toPosition.x, toPosition.y, toPosition.z);
        //convexResultCall.set_m_convexFromWorld(convexPosFrom);
        //convexResultCall.set_m_convexToWorld(convexPosTo);
        bt.ConvexResultCallback_set_m_collisionFilterGroup(convexResultCall, collisonGroup);
        bt.ConvexResultCallback_set_m_collisionFilterMask(convexResultCall, collisionMask);

        bt.btTransform_setOrigin(convexTransform, convexPosFrom);
        bt.btTransform_setOrigin(convexTransTo, convexPosTo);

        if (fromRotation) {
            bt.btQuaternion_setValue(convexRotFrom, fromRotation.x, fromRotation.y, fromRotation.z, fromRotation.w);
            bt.btTransform_setRotation(convexTransform, convexRotFrom);
        } else {
            bt.btTransform_setRotation(convexTransform, this._btDefaultQuaternion);
        }
        if (toRotation) {
            bt.btQuaternion_setValue(convexRotTo, toRotation.x, toRotation.y, toRotation.z, toRotation.w);
            bt.btTransform_setRotation(convexTransTo, convexRotTo);
        } else {
            bt.btTransform_setRotation(convexTransTo, this._btDefaultQuaternion);
        }

        bt.ClosestConvexResultCallback_set_m_hitCollisionObject(convexResultCall, null);//还原默认值
        bt.ConvexResultCallback_set_m_closestHitFraction(convexResultCall, 1);//还原默认值
        bt.btCollisionWorld_convexSweepTest(this._btCollisionWorld, sweepShape, convexTransform, convexTransTo, convexResultCall, allowedCcdPenetration);
        if (bt.ConvexResultCallback_hasHit(convexResultCall)) {
            if (out) {
                out.succeeded = true;
                out.collider = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.ClosestConvexResultCallback_get_m_hitCollisionObject(convexResultCall))];
                out.hitFraction = bt.ConvexResultCallback_get_m_closestHitFraction(convexResultCall);
                var btPoint: number = bt.ClosestConvexResultCallback_get_m_hitPointWorld(convexResultCall);
                var btNormal: number = bt.ClosestConvexResultCallback_get_m_hitNormalWorld(convexResultCall);
                var point = out.point;
                var normal = out.normal;
                point.x = bt.btVector3_x(btPoint);
                point.y = bt.btVector3_y(btPoint);
                point.z = bt.btVector3_z(btPoint);
                normal.x = bt.btVector3_x(btNormal);
                normal.y = bt.btVector3_y(btNormal);
                normal.z = bt.btVector3_z(btNormal);
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
        var bt: any = ILaya3D.Physics3D._bullet;
        var convexResultCall: number = this._btAllConvexResultCallback;
        var convexPosFrom: number = PhysicsSimulation._btTempVector30;
        var convexPosTo: number = PhysicsSimulation._btTempVector31;
        var convexRotFrom: number = PhysicsSimulation._btTempQuaternion0;
        var convexRotTo: number = PhysicsSimulation._btTempQuaternion1;
        var convexTransform: number = PhysicsSimulation._btTempTransform0;
        var convexTransTo: number = PhysicsSimulation._btTempTransform1;

        var sweepShape: number = shape._btShape;

        out.length = 0;
        bt.btVector3_setValue(convexPosFrom, fromPosition.x, fromPosition.y, fromPosition.z);
        bt.btVector3_setValue(convexPosTo, toPosition.x, toPosition.y, toPosition.z);

        //convexResultCall.set_m_convexFromWorld(convexPosFrom);
        //convexResultCall.set_m_convexToWorld(convexPosTo);

        bt.ConvexResultCallback_set_m_collisionFilterGroup(convexResultCall, collisonGroup);
        bt.ConvexResultCallback_set_m_collisionFilterMask(convexResultCall, collisionMask);

        bt.btTransform_setOrigin(convexTransform, convexPosFrom);
        bt.btTransform_setOrigin(convexTransTo, convexPosTo);
        if (fromRotation) {
            bt.btQuaternion_setValue(convexRotFrom, fromRotation.x, fromRotation.y, fromRotation.z, fromRotation.w);
            bt.btTransform_setRotation(convexTransform, convexRotFrom);
        } else {
            bt.btTransform_setRotation(convexTransform, this._btDefaultQuaternion);
        }
        if (toRotation) {
            bt.btQuaternion_setValue(convexRotTo, toRotation.x, toRotation.y, toRotation.z, toRotation.w);
            bt.btTransform_setRotation(convexTransTo, convexRotTo);
        } else {
            bt.btTransform_setRotation(convexTransTo, this._btDefaultQuaternion);
        }

        var collisionObjects: number = bt.AllConvexResultCallback_get_m_collisionObjects(convexResultCall);
        var btPoints: number = bt.AllConvexResultCallback_get_m_hitPointWorld(convexResultCall);
        var btNormals: number = bt.AllConvexResultCallback_get_m_hitNormalWorld(convexResultCall);
        var btFractions: number = bt.AllConvexResultCallback_get_m_hitFractions(convexResultCall);

        bt.tVector3Array_clear(btPoints);
        bt.tVector3Array_clear(btNormals);
        bt.tScalarArray_clear(btFractions);
        bt.tBtCollisionObjectArray_clear(collisionObjects);//清空检测队列
        bt.btCollisionWorld_convexSweepTest(this._btCollisionWorld, sweepShape, convexTransform, convexTransTo, convexResultCall, allowedCcdPenetration);
        var count: number = bt.tBtCollisionObjectArray_size(collisionObjects);

        if (count > 0) {
            this._collisionsUtils.recoverAllHitResultsPool();

            for (var i = 0; i < count; i++) {
                var hitResult = this._collisionsUtils.getHitResult();
                out.push(hitResult);
                hitResult.succeeded = true;
                hitResult.collider = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.tBtCollisionObjectArray_at(collisionObjects, i))];
                hitResult.hitFraction = bt.tScalarArray_at(btFractions, i);
                var btPoint: number = bt.tVector3Array_at(btPoints, i);
                var point = hitResult.point;
                point.x = bt.btVector3_x(btPoint);
                point.y = bt.btVector3_y(btPoint);
                point.z = bt.btVector3_z(btPoint);
                var btNormal: number = bt.tVector3Array_at(btNormals, i);
                var normal = hitResult.normal;
                normal.x = bt.btVector3_x(btNormal);
                normal.y = bt.btVector3_y(btNormal);
                normal.z = bt.btVector3_z(btNormal);
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
    addConstraint(constraint: ConstraintComponent, disableCollisionsBetweenLinkedBodies: boolean = false): void {
        if (!this._btDiscreteDynamicsWorld)
            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
        // this._nativeDiscreteDynamicsWorld.addConstraint(constraint._nativeConstraint, disableCollisionsBetweenLinkedBodies);
        ILaya3D.Physics3D._bullet.btCollisionWorld_addConstraint(this._btDiscreteDynamicsWorld, constraint._btConstraint, disableCollisionsBetweenLinkedBodies);
        this._currentConstraint[constraint.id] = constraint;
    }

    /**
     * 移除刚体运动的约束条件。
     */
    removeConstraint(constraint: ConstraintComponent): void {
        if (!this._btDiscreteDynamicsWorld)
            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
        // this._nativeDiscreteDynamicsWorld.removeConstraint(constraint._nativeConstraint);
        ILaya3D.Physics3D._bullet.btCollisionWorld_removeConstraint(this._btDiscreteDynamicsWorld, constraint._btConstraint);
        delete this._currentConstraint[constraint.id];
    }

    /**
     * 设置射线检测回调
     * @param HITSRAYRESULTCALLBACK_FLAG值
     */
    setHitsRayResultCallbackFlag(flag: number = 1) {
        var bt: any = ILaya3D.Physics3D._bullet;
        bt.RayResultCallback_set_m_flags(this._btAllHitsRayResultCallback, flag);
        bt.RayResultCallback_set_m_flags(this._btClosestRayResultCallback, flag);
    }

    /**
     * @internal
     */

    _updatePhysicsTransformFromRender(): void {
        var elements: any = this._physicsUpdateList.elements;
        for (var i = 0, n = this._physicsUpdateList.length; i < n; i++) {
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
        let bt = ILaya3D.Physics3D._bullet;
        for (var i = 0, n = this._characters.length; i < n; i++) {
            var character = this._characters[i];
            //TODO 临时加一个0.04，对一个人来说0.04的margin太大了，足以把脚陷入地下，所以先加回来
            character._updateTransformComponent(bt.btCollisionObject_getWorldTransform(character._btColliderObject), false, 0.04);
        }
    }

    /**
     * @internal
     */
    _updateCollisions(): void {
        this._collisionsUtils.recoverAllContactPointsPool();
        var previous = this._currentFrameCollisions;
        this._currentFrameCollisions = this._previousFrameCollisions;
        this._currentFrameCollisions.length = 0;
        this._previousFrameCollisions = previous;
        var loopCount = this._updateCount;
        var bt: any = ILaya3D.Physics3D._bullet;
        var numManifolds: number = bt.btDispatcher_getNumManifolds(this._btDispatcher);
        for (let i = 0; i < numManifolds; i++) {
            var contactManifold: number = bt.btDispatcher_getManifoldByIndexInternal(this._btDispatcher, i);//1.可能同时返回A和B、B和A 2.可能同时返回A和B多次(可能和CCD有关)
            var componentA: PhysicsTriggerComponent = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.btPersistentManifold_getBody0(contactManifold))];
            var componentB: PhysicsTriggerComponent = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.btPersistentManifold_getBody1(contactManifold))];
            if (componentA.id > componentB.id) {
                //交换一下，保证A.id<b.id
                let tt = componentA;
                componentA = componentB;
                componentB = tt;
            }
            var collision: Collision = null;
            var isFirstCollision: boolean;//可能同时返回A和B多次,需要过滤
            var contacts: ContactPoint[] = null;
            var isTrigger = componentA.isTrigger || componentB.isTrigger;
            if (isTrigger) {
                if (componentA.owner._getBit(NodeFlags.PROCESS_TRIGGERS) || componentB.owner._getBit(NodeFlags.PROCESS_TRIGGERS)) {
                    var numContacts: number = bt.btPersistentManifold_getNumContacts(contactManifold);
                    for (let j = 0; j < numContacts; j++) {
                        var pt: number = bt.btPersistentManifold_getContactPoint(contactManifold, j);
                        var distance: number = bt.btManifoldPoint_getDistance(pt);
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
                }
            } else if (componentA.owner._getBit(NodeFlags.PROCESS_COLLISIONS) || componentB.owner._getBit(NodeFlags.PROCESS_COLLISIONS)) {
                if (componentA._enableProcessCollisions || componentB._enableProcessCollisions) {//例：A和B均为运动刚体或PhysicCollider
                    numContacts = bt.btPersistentManifold_getNumContacts(contactManifold);
                    for (let j = 0; j < numContacts; j++) {
                        pt = bt.btPersistentManifold_getContactPoint(contactManifold, j);
                        distance = bt.btManifoldPoint_getDistance(pt)
                        if (distance <= 0) {
                            var contactPoint = this._collisionsUtils.getContactPoints();
                            contactPoint.colliderA = componentA;
                            contactPoint.colliderB = componentB;
                            contactPoint.distance = distance;
                            var btNormal: number = bt.btManifoldPoint_get_m_normalWorldOnB(pt);
                            var normal = contactPoint.normal;
                            normal.x = bt.btVector3_x(btNormal);
                            normal.y = bt.btVector3_y(btNormal);
                            normal.z = bt.btVector3_z(btNormal);
                            var btPostionA: number = bt.btManifoldPoint_get_m_positionWorldOnA(pt);
                            var positionOnA = contactPoint.positionOnA;
                            positionOnA.x = bt.btVector3_x(btPostionA);
                            positionOnA.y = bt.btVector3_y(btPostionA);
                            positionOnA.z = bt.btVector3_z(btPostionA);
                            var btPostionB: number = bt.btManifoldPoint_get_m_positionWorldOnB(pt);
                            var positionOnB = contactPoint.positionOnB;
                            positionOnB.x = bt.btVector3_x(btPostionB);
                            positionOnB.y = bt.btVector3_y(btPostionB);
                            positionOnB.z = bt.btVector3_z(btPostionB);

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
            if (collision && isFirstCollision) {//isFirstCollision是因为可能有AB,AB,BA
                this._currentFrameCollisions.push(collision);
                collision._setUpdateFrame(loopCount);
            }
        }

        // 角色的碰撞需要特殊处理一下。由于在角色流程中有可能已经解决了碰撞，导致发现不了碰撞，所以特殊处理,不使用AABB检测碰撞了
        let _characters = this._characters;
        for (let i = 0, n = _characters.length; i < n; i++) {
            let character = _characters[i];
            let btkc = character._btKinematicCharacter;
            let collisionObjs = bt.btKinematicCharacterController_AllHitInfo_get_m_collisionObjects(btkc);
            let count = bt.tBtCollisionObjectArray_size(collisionObjs) as number;
            if (count > 0) {
                for (let j = 0; j < count; j++) {
                    let colobj = bt.tBtCollisionObjectArray_at(collisionObjs, j);
                    if (colobj == 0) continue;
                    let collider = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(colobj)];
                    if (!collider) continue;
                    let compa = character;
                    let compb = collider;
                    if (character._id > collider._id) {
                        compa = collider as any;
                        compb = character as any;
                    }
                    let collision = this._collisionsUtils.getCollision(compa, compb);
                    // a和b已经有碰撞了，则忽略
                    if (collision._updateFrame === loopCount) return;
                    let contacts = collision.contacts;
                    contacts.length = 1;	// 反正是假的，只记录一个假的碰撞点
                    collision._setUpdateFrame(loopCount);
                    // 添加假的碰撞点
                    var contactPoint = this._collisionsUtils.getContactPoints();
                    contactPoint.colliderA = compa;
                    contactPoint.colliderB = compb;
                    contactPoint.distance = 0;
                    contacts[0] = contactPoint;
                    let isTrigger = (compa as any).isTrigger || compb.isTrigger;
                    collision._isTrigger = isTrigger;
                    this._currentFrameCollisions.push(collision);
                }
            }
        }
    }


    /**
     * 这个只是给对象发送事件，不会挨个组件调用碰撞函数
     * 组件要响应碰撞的话，要通过监听事件
     */
    dispatchCollideEvent(): void {
        let loopCount = this._updateCount;
        for (let i = 0, n = this._currentFrameCollisions.length; i < n; i++) {
            let curFrameCol = this._currentFrameCollisions[i];
            let colliderA = curFrameCol._colliderA;
            let colliderB = curFrameCol._colliderB;
            if (colliderA.destroyed || colliderB.destroyed)//前一个循环可能会销毁后面循环的同一物理组件
                continue;
            // TODO 下面是否正确。现在这个_enableProcessCollisions是kinematic的话，就是false，所以先改成&&
            //if(!colliderA._enableProcessCollisions && colliderB._enableProcessCollisions) return;	// 这个会导致角色和kinematic地板的碰撞不处理
            let ownerA = colliderA.owner;
            let ownerB = colliderB.owner;
            if (loopCount - curFrameCol._lastUpdateFrame === 1) {// 上一帧有，这一帧还有,则是stay
                if (curFrameCol._isTrigger) {
                    ownerA.event(Event.TRIGGER_STAY, colliderB);
                    ownerB.event(Event.TRIGGER_STAY, colliderA);
                } else {
                    curFrameCol.other = colliderB;
                    ownerA.event(Event.COLLISION_STAY, curFrameCol);
                    curFrameCol.other = colliderA;
                    ownerB.event(Event.COLLISION_STAY, curFrameCol);
                }
            } else {
                if (curFrameCol._isTrigger) {
                    ownerA.event(Event.TRIGGER_ENTER, colliderB);
                    ownerB.event(Event.TRIGGER_ENTER, colliderA);
                } else {
                    curFrameCol.other = colliderB;
                    ownerA.event(Event.COLLISION_ENTER, curFrameCol);
                    curFrameCol.other = colliderA;
                    ownerB.event(Event.COLLISION_ENTER, curFrameCol);
                }
            }
        }

        for (let i = 0, n = this._previousFrameCollisions.length; i < n; i++) {
            let preFrameCol = this._previousFrameCollisions[i];
            let preColliderA = preFrameCol._colliderA;
            let preColliderB = preFrameCol._colliderB;
            if (preColliderA.destroyed || preColliderB.destroyed)
                continue;
            let ownerA = preColliderA.owner;
            let ownerB = preColliderB.owner;

            if (loopCount - preFrameCol._updateFrame === 1) {
                this._collisionsUtils.recoverCollision(preFrameCol);//回收collision对象
                if (preFrameCol._isTrigger) {
                    ownerA.event(Event.TRIGGER_EXIT, preColliderB);
                    ownerB.event(Event.TRIGGER_EXIT, preColliderA);
                } else {
                    preFrameCol.other = preColliderB;
                    ownerA.event(Event.COLLISION_EXIT, preFrameCol);
                    preFrameCol.other = preColliderA;
                    ownerB.event(Event.COLLISION_EXIT, preFrameCol);
                }
            }
        }

        for (let id in this._currentConstraint) {
            // 检查所有的约束
            let constraintObj = this._currentConstraint[id];
            // TODO 这个只要发一次就行
            if (constraintObj.enabled && constraintObj._isBreakConstrained()) {
                let bodya = constraintObj.ownBody.owner;
                let bodyb = constraintObj.connectedBody.owner;
                bodya.event(Event.JOINT_BREAK);
                bodyb.event(Event.JOINT_BREAK);
            }
        }
    }

    /**
     * 清除力。
     */
    clearForces(): void {
        if (!this._btDiscreteDynamicsWorld)
            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
        ILaya3D.Physics3D._bullet.btDiscreteDynamicsWorld_clearForces(this._btDiscreteDynamicsWorld);
    }

    createRaycastVehicle(body: Rigidbody3D) {
        let bt: any = ILaya3D.Physics3D._bullet;
        let btVehiclePtr = bt.btRaycastVehicle_create(this._btDiscreteDynamicsWorld, body._btColliderObject);
        bt.btCollisionObject_forceActivationState(body._btColliderObject, PhysicsComponent.ACTIVATIONSTATE_DISABLE_DEACTIVATION);//车辆禁止睡眠
        let ret = new RaycastVehicle(btVehiclePtr);
        return ret;
    }

    addVehicle(v: RaycastVehicle) {
        let bt: any = ILaya3D.Physics3D._bullet;
        bt.btDynamicsWorld_addAction(this._btDiscreteDynamicsWorld, v.btVehiclePtr);
    }

    removeVehicle(v: RaycastVehicle) {
        let bt: any = ILaya3D.Physics3D._bullet;
        bt.btDynamicsWorld_removeAction(v.btVehiclePtr);
    }

    // 给Query用的
    private _btPairCachingGhost: number;
    private _btSphereShape: number;
    private _btTransform: number;
    private _btVec: number;

    sphereQuery(pos: Vector3, radius: number, result: PhysicsComponent[], collisionmask = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
        let bt = ILaya3D.Physics3D._bullet;
        if (!this._btPairCachingGhost) {
            this._btPairCachingGhost = bt.btPairCachingGhostObject_create();
            this._btTransform = bt.btTransform_create();
            this._btVec = bt.btVector3_create(0, 0, 0);
            this._btSphereShape = bt.btSphereShape_create(1);
        }
        result.length = 0;
        let sphere = this._btSphereShape;
        bt.btSphereShpae_setUnscaledRadius(sphere, radius);
        let ghost = this._btPairCachingGhost;
        let xform = this._btTransform;
        let vpos = this._btVec;
        bt.btVector3_setValue(vpos, pos.x, pos.y, pos.z);
        bt.btTransform_setIdentity(xform);
        bt.btTransform_setOrigin(xform, vpos);
        bt.btCollisionObject_setCollisionShape(ghost, sphere);
        bt.btCollisionObject_setWorldTransform(ghost, xform);
        bt.btCollisionWorld_addCollisionObject(this._btDiscreteDynamicsWorld, ghost, -1, -1);
        let num = bt.btCollisionObject_getNumOverlappingObjects(ghost);
        for (let i = 0; i < num; i++) {
            let obj = bt.btCollisionObject_getOverlappingObject(ghost, i);
            let comp = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(obj)] as Rigidbody3D;
            if (comp.collisionGroup & collisionmask)
                result.push(comp);
            //let motionstate = bt.btRigidBody_getMotionState(obj);
            //let rigidid = bt.layaMotionState_get_rigidBodyID(motionstate)
        }

        // 必须要删掉，否则会触发碰撞事件
        bt.btCollisionWorld_removeCollisionObject(this._btDiscreteDynamicsWorld, ghost);
    }
}


