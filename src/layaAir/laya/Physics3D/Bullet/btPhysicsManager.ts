import { Ray } from "../../d3/math/Ray";
import { PhysicsSettings } from "../../d3/physics/PhysicsSettings";
import { Vector3 } from "../../maths/Vector3";
import { IPhysicsManager } from "../interface/IPhysicsManager";
import { btJoint } from "./Joint/btJoint";
import { btCollider, btColliderType } from "./Collider/btCollider";
import { btPhysicsCreateUtil } from "./btPhysicsCreateUtil";
import { btCharacterCollider } from "./Collider/btCharacterCollider";
import { CollisionTool } from "./CollisionTool";
import { Collision } from "../../d3/physics/Collision";
import { ContactPoint } from "../../d3/physics/ContactPoint";
import { Event } from "../../events/Event";
import { HitResult } from "../../d3/physics/HitResult";
import { EPhysicsCapable } from "../physicsEnum/EPhycisCapable";
import { Physics3DUtils } from "../../d3/utils/Physics3DUtils";
import { PhysicsUpdateList } from "../../d3/physics/PhysicsUpdateList";
import { ICollider } from "../interface/ICollider";
import { PhysicsColliderComponent } from "../../d3/physics/PhysicsColliderComponent";
import { Quaternion } from "../../maths/Quaternion";
import { btColliderShape } from "./Shape/btColliderShape";
import { Node } from "../../display/Node";
import { NotImplementedError } from "../../utils/Error";
/**
 * @en The `btPhysicsManager` class is the core class for managing the Bullet physics engine.
 * @zh `btPhysicsManager` 类是用于管理 Bullet 物理引擎的核心类。
 */
export class btPhysicsManager implements IPhysicsManager {
    /**
     * @en Default collision group
     * @zh 默认碰撞组
     */
    static COLLISIONFILTERGROUP_DEFAULTFILTER: number = 0x1;
    /**
     * @en Static collision group
     * @zh 静态碰撞组
     */
    static COLLISIONFILTERGROUP_STATICFILTER: number = 0x2;
    /**
     * @en Kinematic rigid body collision group
     * @zh 运动学刚体碰撞组
     */
    static COLLISIONFILTERGROUP_KINEMATICFILTER: number = 0x4;
    /**
     * @en Debris collision group
     * @zh 碎片碰撞组
     */
    static COLLISIONFILTERGROUP_DEBRISFILTER: number = 0x8;
    /**
     * @en Sensor trigger group
     * @zh 传感器触发器组
     */
    static COLLISIONFILTERGROUP_SENSORTRIGGER: number = 0x10;
    /**
     * @en Character filter group
     * @zh 角色过滤器组
     */
    static COLLISIONFILTERGROUP_CHARACTERFILTER: number = 0x20;
    /**
     * @en Custom filter group 1
     * @zh 自定义过滤组 1
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER1: number = 0x40;
    /**
     * @en Custom filter group 2
     * @zh 自定义过滤组 2
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER2: number = 0x80;
    /**
     * @en Custom filter group 3
     * @zh 自定义过滤组 3
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER3: number = 0x100;
    /**
     * @en Custom filter group 4
     * @zh 自定义过滤组 4
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER4: number = 0x200;
    /**
     * @en Custom filter group 5
     * @zh 自定义过滤组 5
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER5: number = 0x400;
    /**
     * @en Custom filter group 6
     * @zh 自定义过滤组 6
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER6: number = 0x800;
    /**
     * @en Custom filter group 7
     * @zh 自定义过滤组 7
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER7: number = 0x1000;
    /**
     * @en Custom filter group 8
     * @zh 自定义过滤组 8
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER8: number = 0x2000;
    /**
     * @en Custom filter group 9
     * @zh 自定义过滤组 9
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER9: number = 0x4000;
    /**
     * @en Custom filter group 10
     * @zh 自定义过滤组 10
     */
    static COLLISIONFILTERGROUP_CUSTOMFILTER10: number = 0x8000;
    /**
     * @en All filter groups
     * @zh 所有过滤组
     */
    static COLLISIONFILTERGROUP_ALLFILTER: number = -1;


    /**
     * @internal
     * @en Active tag for activation state
     * @zh 激活状态的标签
     */
    static ACTIVATIONSTATE_ACTIVE_TAG = 1;
    /**
     * @internal
     * @en Island sleeping tag for activation state
     * @zh 休眠岛状态的标签
     */
    static ACTIVATIONSTATE_ISLAND_SLEEPING = 2;
    /**
     * @internal
     * @en Wants deactivation tag for activation state
     * @zh 希望停用状态的标签
     */
    static ACTIVATIONSTATE_WANTS_DEACTIVATION = 3;
    /**
     * @internal
     * @en Disable deactivation tag for activation state
     * @zh 禁用停用状态的标签
     */
    static ACTIVATIONSTATE_DISABLE_DEACTIVATION = 4;
    /**
     * @internal
     * @en Disable simulation tag for activation state
     * @zh 禁用模拟状态的标签
     */
    static ACTIVATIONSTATE_DISABLE_SIMULATION = 5;

    /**
     * @internal
     * @en Collision flag: Static object
     * @zh 碰撞标志：静态对象
     */
    static COLLISIONFLAGS_STATIC_OBJECT = 1;
    /**
     * @internal
     * @en Collision flag: Kinematic object
     * @zh 碰撞标志：运动学对象
     */
    static COLLISIONFLAGS_KINEMATIC_OBJECT = 2;
    /**
     * @internal
     * @en Collision flag: No contact response
     * @zh 碰撞标志：无接触响应
     */
    static COLLISIONFLAGS_NO_CONTACT_RESPONSE = 4;
    /**
     * @internal
     * @en Collision flag: Custom material callback.This allows per-triangle material (friction/restitution)
     * @zh 碰撞标志：自定义材质回调。这允许每个三角形使用单独的材质（摩擦力/弹性）
     */
    static COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK = 8;
    /**
     * @internal
     * @en Collision flag: Character object
     * @zh 碰撞标志：角色对象
     */
    static COLLISIONFLAGS_CHARACTER_OBJECT = 16;
    /**
     * @internal
     * @en Collision flag: Disable visualize object.Disables debug drawing
     * @zh 碰撞标志：禁用可视化对象。禁用调试绘制
     */
    static COLLISIONFLAGS_DISABLE_VISUALIZE_OBJECT = 32;
    /**
     * @internal
     * @en Collision flag: Disable SPU collision processing.Disables parallel/SPU processing
     * @zh 碰撞标志：禁用 SPU 碰撞处理。禁用并行/SPU 处理
     */
    static COLLISIONFLAGS_DISABLE_SPU_COLLISION_PROCESSING = 64;

    /**
     * @internal
     * @en Physics engine flag: None.Indicates no specific physics engine features are enabled.
     * @zh 物理引擎标志：无。表示没有启用任何特定的物理引擎功能。
     */
    static PHYSICSENGINEFLAGS_NONE = 0x0;
    /**
     * @internal
     * @en Physics engine flag: Collisions only.Enables collision detection without full physics simulation.
     * @zh 物理引擎标志：仅碰撞。启用碰撞检测，但不进行完整的物理模拟。
     */
    static PHYSICSENGINEFLAGS_COLLISIONSONLY = 0x1;
    /**
     * @internal
     * @en Physics engine flag: Soft body support.Enables soft body physics simulation.
     * @zh 物理引擎标志：软体支持。启用软体物理模拟。
     */
    static PHYSICSENGINEFLAGS_SOFTBODYSUPPORT = 0x2;
    /**
     * @internal
     * @en Physics engine flag: Multi-threaded.Enables multi-threaded physics computations.
     * @zh 物理引擎标志：多线程。启用多线程物理计算。
     */
    static PHYSICSENGINEFLAGS_MULTITHREADED = 0x4;
    /**
     * @internal
     * @en Physics engine flag: Use hardware when possible.Enables hardware acceleration for physics calculations when available.
     * @zh 物理引擎标志：尽可能使用硬件加速。在可用时启用硬件加速进行物理计算。
     */
    static PHYSICSENGINEFLAGS_USEHARDWAREWHENPOSSIBLE = 0x8;

    /**
     * @internal
     * @en Solver mode: Randomize order.Randomizes the order of constraint solving.
     * @zh 求解器模式：随机顺序。随机化约束求解的顺序。
     */
    static SOLVERMODE_RANDMIZE_ORDER = 1;
    /**
     * @internal
     * @en Solver mode: Separate friction.Handles friction separately from other constraints.
     * @zh 求解器模式：分离摩擦力。将摩擦力与其他约束分开处理。
     */
    static SOLVERMODE_FRICTION_SEPARATE = 2;
    /**
     * @internal
     * @en Solver mode: Use warm starting.Uses previous solution as a starting point for faster convergence.
     * @zh 求解器模式：使用热启动。使用前一次的解作为起点，以加快收敛速度。
     */
    static SOLVERMODE_USE_WARMSTARTING = 4;
    /**
     * @internal
     * @en Solver mode: Use 2 friction directions.Applies friction in two orthogonal directions.
     * @zh 求解器模式：使用两个摩擦方向。在两个正交方向上应用摩擦力。
     */
    static SOLVERMODE_USE_2_FRICTION_DIRECTIONS = 16;
    /**
     * @internal
     * @en Solver mode: Enable friction direction caching。Caches friction directions for improved performance.
     * @zh 求解器模式：启用摩擦方向缓存。缓存摩擦方向以提高性能。
     */
    static SOLVERMODE_ENABLE_FRICTION_DIRECTION_CACHING = 32;
    /**
     * @internal
     * @en Solver mode: Disable velocity-dependent friction direction.Friction direction does not depend on relative velocity.
     * @zh 求解器模式：禁用速度相关的摩擦方向。摩擦方向不依赖于相对速度。
     */
    static SOLVERMODE_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION = 64;
    /**
     * @internal
     * @en Solver mode: Cache friendly.Optimizes memory access patterns for better cache utilization.
     * @zh 求解器模式：缓存友好。优化内存访问模式以更好地利用缓存。
     */
    static SOLVERMODE_CACHE_FRIENDLY = 128;
    /**
     * @internal
     * @en Solver mode: SIMD.Uses SIMD instructions for improved performance.
     * @zh 求解器模式：SIMD。使用 SIMD 指令以提高性能。
     */
    static SOLVERMODE_SIMD = 256;
    /**
     * @internal
     * @en Solver mode: Interleave contact and friction constraints.Alternates between contact and friction constraint solving.
     * @zh 求解器模式：交错接触和摩擦约束。在接触约束和摩擦约束求解之间交替进行。
     */
    static SOLVERMODE_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS = 512;
    /**
     * @internal
     * @en Solver mode: Allow zero length friction directions.Permits friction calculations even when relative velocity is zero.
     * @zh 求解器模式：允许零长度摩擦方向。即使相对速度为零也允许进行摩擦力计算。
     */
    static SOLVERMODE_ALLOW_ZERO_LENGTH_FRICTION_DIRECTIONS = 1024;
    /**
     * @internal
     * @en Ray result callback flag: None.No special flags applied to the ray callback.
     * @zh 射线结果回调标志：无。不应用特殊标志到射线回调。
     */
    static HITSRAYRESULTCALLBACK_FLAG_NONE = 0;
    /**
     * @internal
     * @en Ray result callback flag: Ignore back faces.Ray test will ignore back faces of triangles.
     * @zh 射线回调模式：忽略反面。射线检测时，会忽略掉反面的三角形
     */
    static HITSRAYRESULTCALLBACK_FLAG_FILTERBACKFACESS = 1;
    /**
     * @internal
     * @en Ray result callback flag: Keep unflipped normal.Maintains the original normal direction of hit surfaces.
     * @zh 射线结果回调标志：保持未翻转的法线。保持命中表面的原始法线方向。
     */
    static HITSRAYRESULTCALLBACK_FLAG_KEEPUNFILIPPEDNORMAL = 2;
    /**
     * @internal
     * @en Ray result callback flag: Use sub-simplex convex cast ray test.Employs a sub-simplex algorithm for convex shape ray casting.
     * @zh 射线结果回调标志：使用子单纯形凸体投射射线测试。使用子单纯形算法进行凸形体的射线投射。
     */
    static HITSRAYRESULTCALLBACK_FLAG_USESUBSIMPLEXCONVEXCASTRAYTEST = 4;
    /**
     * @internal
     * @en Ray result callback flag: Use GJK convex cast ray test.Utilizes the GJK algorithm for convex shape ray casting.
     * @zh 射线结果回调标志：使用 GJK 凸体投射射线测试。使用 GJK 算法进行凸形体的射线投射。
     */
    static HITSRAYRESULTCALLBACK_FLAG_USEGJKCONVEXCASTRAYTEST = 8;
    /**
     * @internal
     * @en Ray result callback flag: Terminator.Indicates the end of ray callback flags.
     * @zh 射线结果回调标志：终止符。表示射线回调标志的结束。
     */
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
    private static _tempVector30: Vector3;

    /**
     * @en Initializes the btPhysicsManager.
     * @zh 初始化 btPhysicsManager。
     */
    static init(): void {
        let bt = btPhysicsCreateUtil._bt;
        btPhysicsManager._btTempVector30 = bt.btVector3_create(0, 0, 0);
        btPhysicsManager._btTempVector31 = bt.btVector3_create(0, 0, 0);
        btPhysicsManager._btTempQuaternion0 = bt.btQuaternion_create(0, 0, 0, 1);
        btPhysicsManager._btTempQuaternion1 = bt.btQuaternion_create(0, 0, 0, 1);
        btPhysicsManager._btTempTransform0 = bt.btTransform_create();
        btPhysicsManager._btTempTransform1 = bt.btTransform_create();
        btPhysicsManager._tempVector30 = new Vector3();
    }

    /**
     * @internal
     */
    static _convertToBulletVec3(lVector: Vector3, out: number): void {
        let bt = btPhysicsCreateUtil._bt;
        bt.btVector3_setValue(out, lVector.x, lVector.y, lVector.z);
    }

    /**
     * @en The maximum number of sub-steps used by the physics engine in one frame to compensate for deceleration. This is the maximum number of simulations allowed per frame. If the engine runs slowly, this number may need to be increased,otherwise the simulator will lose "time". It's crucial that the engine interval time is less than maxSubSteps * fixedTimeStep.
     * @zh 物理引擎在一帧中用于补偿减速的最大次数：模拟器每帧允许的最大模拟次数，如果引擎运行缓慢,可能需要增加该次数，否则模拟器会丢失“时间",引擎间隔时间小于maxSubSteps*fixedTimeStep非常重要。
     */
    public maxSubSteps = 1;
    /***/
    /**
     * @en The interval time of the physics simulator frame. Reducing fixedTimeStep can increase simulation precision. The default value is 1.0 / 60.0.
     * @zh 物理模拟器帧的间隔时间:通过减少fixedTimeStep可增加模拟精度，默认是1.0 / 60.0。
     */
    public fixedTimeStep = 1.0 / 60.0;
    /**
     * @en Whether to enable continuous collision detection.
     * @zh 是否开启连续碰撞检测。
     */
    public enableCCD: boolean = false;
    /**
     * @en The threshold for continuous collision detection.
     * @zh 连续碰撞检测的阈值。
     */
    public ccdThreshold: number = 0.0001;
    /**
     * @en The sphere radius for continuous collision detection.
     * @zh 连续碰撞检测的球体半径。
     */
    public ccdSphereRadius: number = 0.0001;
    /**
     * @en The delta time used in physics calculations, default is 1/60 second.
     * @zh 物理计算中使用的时间间隔，默认为 1/60 秒。
     */
    public dt = 1 / 60;
    /**@internal */
    private _bt;
    //Physcics World Params
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
    _gravity = new Vector3(0, -10, 0);

    //Ray cast/Shape Cast
    /** @internal */
    private _btClosestRayResultCallback: number;
    /** @internal */
    private _btAllHitsRayResultCallback: number;
    /** @internal */
    private _btClosestConvexResultCallback: number;
    /** @internal */
    private _btAllConvexResultCallback: number;
    /** @internal */
    private _btVector3Zero: number;
    /** @internal */
    private _btDefaultQuaternion: number;


    //Simulate
    /**@internal*/
    _updatedRigidbodies = 0;
    protected _updateCount = 0;
    /** @internal */
    protected _previousFrameCollisions: Collision[] = [];
    /** @internal */
    protected _currentFrameCollisions: Collision[] = [];
    /** @internal */
    protected _collisionsUtils = new CollisionTool();

    //Joint
    /** @internal */
    private _currentConstraint: { [key: number]: btJoint } = {};

    //collider
    /** @internal */
    _physicsUpdateList = new PhysicsUpdateList();
    _characters: btCharacterCollider[] = [];

    // capable map
    protected _physicsEngineCapableMap: Map<any, any>;

    /**
     * @ignore
     * @en Creates an instance of a btPhysicsManager.
     * @param physicsSettings The settings for the physics simulation.
     * @zh 创建一个 btPhysicsManager 的实例。
     * @param physicsSettings 物理模拟的设置。
     */
    constructor(physicsSettings: PhysicsSettings) {
        let bt = this._bt = btPhysicsCreateUtil._bt;
        //Physcics World create
        this.maxSubSteps = physicsSettings.maxSubSteps;
        this.fixedTimeStep = physicsSettings.fixedTimeStep;
        this.enableCCD = physicsSettings.enableCCD;
        this.ccdThreshold = physicsSettings.ccdThreshold;
        this.ccdSphereRadius = physicsSettings.ccdSphereRadius;

        this._btCollisionConfiguration = bt.btDefaultCollisionConfiguration_create();
        this._btDispatcher = bt.btCollisionDispatcher_create(this._btCollisionConfiguration);
        this._btBroadphase = bt.btDbvtBroadphase_create();
        bt.btOverlappingPairCache_setInternalGhostPairCallback(bt.btDbvtBroadphase_getOverlappingPairCache(this._btBroadphase), bt.btGhostPairCallback_create());//this allows characters to have proper physics behavior

        var conFlags = physicsSettings.flags;
        if (conFlags & btPhysicsManager.PHYSICSENGINEFLAGS_COLLISIONSONLY) {
            this._btCollisionWorld = new bt.btCollisionWorld(this._btDispatcher, this._btBroadphase, this._btCollisionConfiguration);
        } else if (conFlags & btPhysicsManager.PHYSICSENGINEFLAGS_SOFTBODYSUPPORT) {
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

        //Ray
        this._btVector3Zero = bt.btVector3_create(0, 0, 0);
        this._btDefaultQuaternion = bt.btQuaternion_create(0, 0, 0, -1);
        this._btClosestRayResultCallback = bt.ClosestRayResultCallback_create(this._btVector3Zero, this._btVector3Zero);
        this._btAllHitsRayResultCallback = bt.AllHitsRayResultCallback_create(this._btVector3Zero, this._btVector3Zero);
        this._btClosestConvexResultCallback = bt.ClosestConvexResultCallback_create(this._btVector3Zero, this._btVector3Zero);
        this._btAllConvexResultCallback = bt.AllConvexResultCallback_create(this._btVector3Zero, this._btVector3Zero);//TODO:是否优化C++

        bt.btGImpactCollisionAlgorithm_RegisterAlgorithm(this._btDispatcher);//注册算法
        this.initPhysicsCapable();  // 初始化物理能力
    }

    /**
     * @en Sets the active state of a btCollider.
     * @param collider The btCollider to set the active state for.
     * @param value The active state to set (true for active, false for inactive).
     * @zh 设置 btCollider 的激活状态。
     * @param collider 要设置激活状态的 btCollider。
     * @param value 要设置的激活状态（true 表示激活，false 表示不激活）。
     */
    setActiveCollider(collider: btCollider, value: boolean): void {
        collider.active = value;
        if (value) {
            collider._physicsManager = this;
        } else {
            collider._physicsManager = null;
        }
    }
    /**
     * @en Performs a sphere query to find colliders within a specified radius from a given position.
     * @param pos The center position of the sphere query.
     * @param radius The radius of the sphere query.
     * @param result An array to store the found colliders.
     * @param collisionmask The collision mask to filter the query results.
     * @zh 执行球体查询，查找给定位置指定半径内的碰撞体。
     * @param pos 球体查询的中心位置。
     * @param radius 球体查询的半径。
     * @param result 用于存储找到的碰撞体的数组。
     * @param collisionmask 用于过滤查询结果的碰撞掩码。
     */
    sphereQuery?(pos: Vector3, radius: number, result: ICollider[], collisionmask: number): void {
        throw new NotImplementedError;
    }

    /**
    * @internal
    */
    private _simulate(deltaTime: number): void {
        this._updatedRigidbodies = 0;
        this.dt = deltaTime;
        var bt: any = this._bt;
        if (this._btDiscreteDynamicsWorld)
            bt.btDiscreteDynamicsWorld_stepSimulation(this._btDiscreteDynamicsWorld, deltaTime, this.maxSubSteps, this.fixedTimeStep);
        else
            bt.PerformDiscreteCollisionDetection(this._btCollisionWorld);

        this._updateCount++;
    }

    /**
     * @internal
     * @perfTag PerformanceDefine.T_Physics_UpdateNode
     */
    private _updatePhysicsTransformToRender(): void {
        var elements: any = this._physicsUpdateList.elements;
        for (var i = 0, n = this._physicsUpdateList.length; i < n; i++) {
            var physicCollider: btCollider = elements[i];
            physicCollider._derivePhysicsTransformation(true);
            physicCollider.inPhysicUpdateListIndex = -1;//置空索引
        }
        this._physicsUpdateList.length = 0;//清空物理更新队列
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
        var bt: any = this._bt;
        var numManifolds: number = bt.btDispatcher_getNumManifolds(this._btDispatcher);
        for (let i = 0; i < numManifolds; i++) {
            var contactManifold: number = bt.btDispatcher_getManifoldByIndexInternal(this._btDispatcher, i);//1.可能同时返回A和B、B和A 2.可能同时返回A和B多次(可能和CCD有关)
            var componentA: btCollider = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.btPersistentManifold_getBody0(contactManifold))];
            var componentB: btCollider = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.btPersistentManifold_getBody1(contactManifold))];
            if (componentA._id > componentB._id) {
                //交换一下，保证A.id<b.id
                let tt = componentA;
                componentA = componentB;
                componentB = tt;
            }
            var collision: Collision = null;
            var isFirstCollision: boolean;//可能同时返回A和B多次,需要过滤
            var contacts: ContactPoint[] = null;
            var isTrigger = componentA._isTrigger || componentB._isTrigger;
            if (isTrigger) {
                //if (componentA.owner._getBit(NodeFlags.PROCESS_TRIGGERS) || componentB.owner._getBit(NodeFlags.PROCESS_TRIGGERS)) {
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
                //}
                //} else if (componentA.owner._getBit(NodeFlags.PROCESS_COLLISIONS) || componentB.owner._getBit(NodeFlags.PROCESS_COLLISIONS)) {
            } else {
                if (componentA._enableProcessCollisions || componentB._enableProcessCollisions) {//例：A和B均为运动刚体或PhysicCollider
                    numContacts = bt.btPersistentManifold_getNumContacts(contactManifold);
                    for (let j = 0; j < numContacts; j++) {
                        pt = bt.btPersistentManifold_getContactPoint(contactManifold, j);
                        distance = bt.btManifoldPoint_getDistance(pt)
                        if (distance <= 0) {
                            var contactPoint = this._collisionsUtils.getContactPoints();
                            contactPoint._colliderA = componentA;
                            contactPoint._colliderB = componentB;
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
                    let collider = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(colobj)];
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
                    contactPoint._colliderA = compa;
                    contactPoint._colliderB = compb;
                    contactPoint.distance = 0;
                    contacts[0] = contactPoint;
                    let isTrigger = compa._isTrigger || compb._isTrigger;
                    collision._isTrigger = isTrigger;
                    this._currentFrameCollisions.push(collision);
                }
            }
        }
    }

    /**
     * @perfTag PerformanceDefine.T_PhysicsColliderEnter
     * @en Dispatch Collider Enter Event
     * @param colliderA 碰撞组件A
     * @param ownerA 组件A的所属节点
     * @param colliderB 碰撞组件B
     * @param ownerB 组件B的所属节点
     * @param curFrameCol 当前帧碰撞信息
     * @zh 派发碰撞器进入事件
     * @param colliderA Collision Component A
     * @param ownerA The Node to Which Component A Belongs
     * @param colliderB Collision Component B
     * @param ownerB The Node to Which Component B Belongs
     * @param curFrameCol Current Frame Collision Information
     */
    private _collision_EnterEvent(colliderA: PhysicsColliderComponent, ownerA: Node, colliderB: PhysicsColliderComponent, ownerB: Node, curFrameCol: Collision): void {
        curFrameCol.other = colliderB;
        ownerA.event(Event.COLLISION_ENTER, curFrameCol);
        curFrameCol.other = colliderA;
        ownerB.event(Event.COLLISION_ENTER, curFrameCol);
    }

    /**
     * @perfTag PerformanceDefine.T_PhysicsColliderStay
     * @en Dispatch Collider Stay Event
     * @param colliderA 碰撞组件A
     * @param ownerA 组件A的所属节点
     * @param colliderB 碰撞组件B
     * @param ownerB 组件B的所属节点
     * @param curFrameCol 当前帧碰撞信息
     * @zh 派发碰撞器持续事件
     * @param colliderA Collision Component A
     * @param ownerA The Node to Which Component A Belongs
     * @param colliderB Collision Component B
     * @param ownerB The Node to Which Component B Belongs
     * @param curFrameCol Current Frame Collision Information
     */
    private _collision_StayEvent(colliderA: PhysicsColliderComponent, ownerA: Node, colliderB: PhysicsColliderComponent, ownerB: Node, curFrameCol: Collision): void {
        curFrameCol.other = colliderB;
        ownerA.event(Event.COLLISION_STAY, curFrameCol);
        curFrameCol.other = colliderA;
        ownerB.event(Event.COLLISION_STAY, curFrameCol);
    }

    /**
     * @perfTag PerformanceDefine.T_PhysicsColliderExit
     * @en Dispatch Collider Exit Event
     * @param preColliderA 碰撞组件A
     * @param ownerA 组件A的所属节点
     * @param preColliderB 碰撞组件B
     * @param ownerB 组件B的所属节点
     * @param preFrameCol 当前帧碰撞信息
     * @zh 派发碰撞器离开事件
     * @param preColliderA Collision Component A
     * @param ownerA The Node to Which Component A Belongs
     * @param preColliderB Collision Component B
     * @param ownerB The Node to Which Component B Belongs
     * @param preFrameCol Current Frame Collision Information
     */
    private _collision_ExitEvent(preColliderA: PhysicsColliderComponent, ownerA: Node, preColliderB: PhysicsColliderComponent, ownerB: Node, preFrameCol: Collision): void {
        preFrameCol.other = preColliderB;
        ownerA.event(Event.COLLISION_EXIT, preFrameCol);
        preFrameCol.other = preColliderA;
        ownerB.event(Event.COLLISION_EXIT, preFrameCol);
    }

    /**
     * @perfTag PerformanceDefine.T_PhysicsTriggerEnter
     * @en Dispatch Trigger Enter Event
     * @param colliderA 碰撞组件A
     * @param ownerA 组件A的所属节点
     * @param colliderB 碰撞组件B
     * @param ownerB 组件B的所属节点
     * @zh 派发触发器进入事件
     * @param colliderA Collision Component A
     * @param ownerA The Node to Which Component A Belongs
     * @param colliderB Collision Component B
     * @param ownerB The Node to Which Component B Belongs
     */
    private _trigger_EnterEvent(colliderA: PhysicsColliderComponent, ownerA: Node, colliderB: PhysicsColliderComponent, ownerB: Node): void {
        ownerA.event(Event.TRIGGER_ENTER, colliderB);
        ownerB.event(Event.TRIGGER_ENTER, colliderA);
    }

    /**
     * @perfTag PerformanceDefine.T_PhysicsTriggerStay
     * @en Dispatch Trigger Enter Event
     * @param colliderA 碰撞组件A
     * @param ownerA 组件A的所属节点
     * @param colliderB 碰撞组件B
     * @param ownerB 组件B的所属节点
     * @zh 派发触发器持续事件
     * @param colliderA Collision Component A
     * @param ownerA The Node to Which Component A Belongs
     * @param colliderB Collision Component B
     * @param ownerB The Node to Which Component B Belongs
     */
    private _trigger_StayEvent(colliderA: PhysicsColliderComponent, ownerA: Node, colliderB: PhysicsColliderComponent, ownerB: Node): void {
        ownerA.event(Event.TRIGGER_STAY, colliderB);
        ownerB.event(Event.TRIGGER_STAY, colliderA);
    }

    /**
     * @perfTag PerformanceDefine.T_PhysicsTriggerExit
     * @en Dispatch Trigger Exit Event
     * @param preColliderA 碰撞组件A
     * @param ownerA 组件A的所属节点
     * @param preColliderB 碰撞组件B
     * @param ownerB 组件B的所属节点
     * @zh 派发触发器离开事件
     * @param preColliderA Collision Component A
     * @param ownerA The Node to Which Component A Belongs
     * @param preColliderB Collision Component B
     * @param ownerB The Node to Which Component B Belongs
     */
    private _trigger_ExitEvent(preColliderA: PhysicsColliderComponent, ownerA: Node, preColliderB: PhysicsColliderComponent, ownerB: Node): void {
        ownerA.event(Event.TRIGGER_EXIT, preColliderB);
        ownerB.event(Event.TRIGGER_EXIT, preColliderA);
    }

    /**
     * @perfTag PerformanceDefine.T_PhysicsEvent
     * @en This method only sends events to objects, it doesn't call collision functions for each component individually.Components need to listen to events if they want to respond to collisions.
     * @zh 这个只是给对象发送事件，不会挨个组件调用碰撞函数。组件要响应碰撞的话，要通过监听事件。
     */
    dispatchCollideEvent(): void {
        let loopCount = this._updateCount;
        for (let i = 0, n = this._currentFrameCollisions.length; i < n; i++) {
            let curFrameCol = this._currentFrameCollisions[i];
            let colliderA = curFrameCol._colliderA.component as PhysicsColliderComponent;
            let colliderB = curFrameCol._colliderB.component as PhysicsColliderComponent;
            if (colliderA.destroyed || colliderB.destroyed)//前一个循环可能会销毁后面循环的同一物理组件
                continue;
            // TODO 下面是否正确。现在这个_enableProcessCollisions是kinematic的话，就是false，所以先改成&&
            //if(!colliderA._enableProcessCollisions && colliderB._enableProcessCollisions) return;	// 这个会导致角色和kinematic地板的碰撞不处理
            let ownerA = colliderA.owner;
            let ownerB = colliderB.owner;
            if (loopCount - curFrameCol._lastUpdateFrame === 1) {// 上一帧有，这一帧还有,则是stay
                if (curFrameCol._isTrigger) {
                    this._trigger_StayEvent(colliderA, ownerA, colliderB, ownerB);
                } else {
                    this._collision_StayEvent(colliderA, ownerA, colliderB, ownerB, curFrameCol);
                }
            } else {
                if (curFrameCol._isTrigger) {
                    this._trigger_EnterEvent(colliderA, ownerA, colliderB, ownerB);
                } else {
                    this._collision_EnterEvent(colliderA, ownerA, colliderB, ownerB, curFrameCol);
                }
            }
        }

        for (let i = 0, n = this._previousFrameCollisions.length; i < n; i++) {
            let preFrameCol = this._previousFrameCollisions[i];
            let preColliderA = preFrameCol._colliderA.component as PhysicsColliderComponent;
            let preColliderB = preFrameCol._colliderB.component as PhysicsColliderComponent;
            if (preColliderA.destroyed || preColliderB.destroyed)
                continue;
            let ownerA = preColliderA.owner;
            let ownerB = preColliderB.owner;

            if (loopCount - preFrameCol._updateFrame === 1) {
                this._collisionsUtils.recoverCollision(preFrameCol);//回收collision对象
                if (preFrameCol._isTrigger) {
                    this._trigger_ExitEvent(preColliderA, ownerA, preColliderB, ownerB);

                } else {
                    this._collision_ExitEvent(preColliderA, ownerA, preColliderB, ownerB, preFrameCol);

                }
            }
        }

        for (let id in this._currentConstraint) {
            // 检查所有的约束
            let constraintObj = this._currentConstraint[id] as btJoint;
            // TODO 这个只要发一次就行
            if (constraintObj._isBreakConstrained()) {
                let bodya = constraintObj.owner;
                let bodyb = constraintObj._connectOwner;
                bodya.event(Event.JOINT_BREAK);
                bodyb.event(Event.JOINT_BREAK);
            }
        }
    }



    /**
    * @internal
    */
    _updateCharacters(): void {
        var bt: any = this._bt;
        for (var i = 0, n = this._characters.length; i < n; i++) {
            var character = this._characters[i];
            //TODO 临时加一个0.04，对一个人来说0.04的margin太大了，足以把脚陷入地下，所以先加回来
            character._updateTransformComponent(bt.btCollisionObject_getWorldTransform(character._btCollider), false, 0.04);
        }
    }

    /**
     * @en Debugger function to enable or disable the debug drawer.
     * @param value A boolean value to enable (true) or disable (false) the debug drawer.
     * @zh 调试器函数，用于启用或禁用调试绘制器。
     * @param value 布尔值，用于启用（true）或禁用（false）调试绘制器。
     */
    enableDebugDrawer(value: boolean) {
        let bt = btPhysicsCreateUtil._bt;
        bt.btDynamicsWorld_enableDebugDrawer(this._btDiscreteDynamicsWorld, value);
    }

    /**
     * @en Gets the capability status of a specific physics feature.
     * @param value The physics capability to check.
     * @returns Whether the specified physics capability is supported.
     * @zh 获取特定物理特性的能力状态。
     * @param value 要检查的物理能力。
     * @returns 指定的物理能力是否被支持。
     */
    getPhysicsCapable(value: EPhysicsCapable): boolean {
        return this._physicsEngineCapableMap.get(value);
    }

    /**
     * @en Initializes the physics capabilities map.
     * @zh 初始化物理能力映射。
     */
    initPhysicsCapable(): void {
        this._physicsEngineCapableMap = new Map();
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_Gravity, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_StaticCollider, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_DynamicCollider, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CharacterCollider, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_BoxColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_SphereColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CapsuleColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CylinderColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_ConeColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_MeshColliderShape, false);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CompoundColliderShape, false);
    }

    /**
     * @en Sets the gravity.
     * @param gravity The gravity to be set.
     * @zh 设置重力。
     * @param gravity 要设置的重力。
     */
    setGravity(gravity: Vector3): void {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        gravity.cloneTo(this._gravity);
        var bt = this._bt;
        var btGravity: number = btPhysicsManager._btTempVector30;
        bt.btVector3_setValue(btGravity, gravity.x, gravity.y, gravity.z);//TODO:是否先get省一个变量
        bt.btDiscreteDynamicsWorld_setGravity(this._btDiscreteDynamicsWorld, btGravity);
    }

    /**
     * @en Adds a collider.
     * @param collider The collider to be added.
     * @zh 添加碰撞体。
     * @param collider 要添加的碰撞体。
     */
    addCollider(collider: ICollider): void {

        let btcollider = collider as btCollider;
        if (btcollider._isSimulate || !collider.active)
            return;
        btcollider._derivePhysicsTransformation(true);
        switch (btcollider._type) {
            case btColliderType.StaticCollider:
                this._bt.btCollisionWorld_addCollisionObject(this._btCollisionWorld, btcollider._btCollider, btcollider._collisionGroup, btcollider._canCollideWith);
                break;
            case btColliderType.RigidbodyCollider:
                this._addRigidBody(btcollider);
                break;
            case btColliderType.CharactorCollider:
                this._addCharacter(btcollider as btCharacterCollider);
                //TODO:
                break;
        }
        btcollider._isSimulate = true;
    }

    /**
     * @en Removes a collider.
     * @param collider The collider to be removed.
     * @zh 移除碰撞体。
     * @param collider 要移除的碰撞体。
     */
    removeCollider(collider: ICollider): void {
        let btcollider = collider as btCollider;
        if (btcollider.inPhysicUpdateListIndex !== -1)
            this._physicsUpdateList.remove(btcollider);
        switch (btcollider._type) {
            case btColliderType.StaticCollider:
                this._bt.btCollisionWorld_removeCollisionObject(this._btCollisionWorld, btcollider._btCollider);
                break;
            case btColliderType.RigidbodyCollider:
                this._removeRigidBody(btcollider);
                break;
            case btColliderType.CharactorCollider:
                //TODO:
                this._removeCharacter(btcollider as btCharacterCollider);
                break;
        }
        btcollider._isSimulate = false;
        (btcollider as any).inScene = false;
    }

    /**
     * @en Adds a joint.
     * @param joint The joint to be added.
     * @zh 添加关节。
     * @param joint 要添加的关节。
     */
    addJoint(joint: btJoint) {
        if (!this._btDiscreteDynamicsWorld)
            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
        // this._nativeDiscreteDynamicsWorld.addConstraint(constraint._nativeConstraint, disableCollisionsBetweenLinkedBodies);
        this._bt.btCollisionWorld_addConstraint(this._btDiscreteDynamicsWorld, joint._btJoint, joint._disableCollisionsBetweenLinkedBodies);
        this._currentConstraint[joint._id] = joint;
    }

    /**
     * @en Removes a joint.
     * @param joint The joint to be removed.
     * @zh 移除关节。
     * @param joint 要移除的关节。
     */
    removeJoint(joint: btJoint) {
        if (!this._btDiscreteDynamicsWorld)
            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
        // this._nativeDiscreteDynamicsWorld.removeConstraint(constraint._nativeConstraint);
        this._bt.btCollisionWorld_removeConstraint(this._btDiscreteDynamicsWorld, joint._btJoint);
        delete this._currentConstraint[joint._id];
    }

    /**
     * @perfTag PerformanceDefine.T_Physics_Simulation
     * @en Updates the physics simulation.
     * @param elapsedTime The time elapsed since the last update.
     * @zh 更新物理模拟。
     * @param elapsedTime 自上次更新以来经过的时间。
     */
    update(elapsedTime: number): void {
        this._updatePhysicsTransformToRender();
        btCollider._addUpdateList = false;//物理模拟器会触发_updateTransformComponent函数,不加入更新队列
        //simulate physics
        this._simulate(elapsedTime);
        //update character sprite3D transforms from physics engine simulation
        this._updateCharacters();
        btCollider._addUpdateList = true;
        //handle frame contacts
        this._updateCollisions();
        //send contact events
        this.dispatchCollideEvent();
    }

    /**
     * @en Performs a ray cast in the physics world.Returns the first hit object.
     * @param ray The ray to cast.
     * @param outHitResult The hit result object to store the result.
     * @param distance The maximum distance of the ray cast.
     * @param collisonGroup The collision group of the ray.
     * @param collisionMask The collision mask of the ray.
     * @returns Whether the ray hit anything.
     * @zh 执行一次射线检测，返回第一个与射线相交的碰撞体信息。
     * @param ray 要投射的射线。
     * @param outHitResult 用于存储结果的命中结果对象。
     * @param distance 射线投射的最大距离。
     * @param collisonGroup 射线的碰撞组。
     * @param collisionMask 射线的碰撞掩码。
     * @returns 射线是否击中了任何物体。
     */
    rayCast(ray: Ray, outHitResult: HitResult, distance: number = 2147483647/*Int.MAX_VALUE*/, collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER): boolean {
        var from = ray.origin;
        var to = btPhysicsManager._tempVector30;
        Vector3.normalize(ray.direction, to);
        Vector3.scale(to, distance, to);
        Vector3.add(from, to, to);

        var bt: any = this._bt;
        var rayResultCall: number = this._btClosestRayResultCallback;
        var rayFrom = btPhysicsManager._btTempVector30;
        var rayTo = btPhysicsManager._btTempVector31;
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
            if (outHitResult) {
                outHitResult.succeeded = true;
                outHitResult.collider = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.RayResultCallback_get_m_collisionObject(rayResultCall))];
                outHitResult.hitFraction = bt.RayResultCallback_get_m_closestHitFraction(rayResultCall);
                var btPoint: number = bt.ClosestRayResultCallback_get_m_hitPointWorld(rayResultCall);
                var point = outHitResult.point;
                point.x = bt.btVector3_x(btPoint);
                point.y = bt.btVector3_y(btPoint);
                point.z = bt.btVector3_z(btPoint);
                var btNormal: number = bt.ClosestRayResultCallback_get_m_hitNormalWorld(rayResultCall);
                var normal = outHitResult.normal;
                normal.x = bt.btVector3_x(btNormal);
                normal.y = bt.btVector3_y(btNormal);
                normal.z = bt.btVector3_z(btNormal);
            }
            return true;
        } else {
            if (outHitResult)
                outHitResult.succeeded = false;
            return false;
        }
    }

    /**
     * @en Performs a ray cast in the physics world.Returns all hit objects.
     * @param ray The ray to cast.
     * @param out An array to store all hit results.
     * @param distance The maximum distance of the ray cast.
     * @param collisonGroup The collision group of the ray.
     * @param collisionMask The collision mask of the ray.
     * @returns Whether the ray hit anything.
     * @zh 执行一次射线检测，返回所有与射线相交的碰撞体信息。
     * @param ray 要投射的射线。
     * @param out 用于存储所有命中结果的数组。
     * @param distance 射线投射的最大距离。
     * @param collisonGroup 射线的碰撞组。
     * @param collisionMask 射线的碰撞掩码。
     * @returns 射线是否击中了任何物体。
     */
    rayCastAll(ray: Ray, out: HitResult[], distance: number = 2147483647/*Int.MAX_VALUE*/, collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER): boolean {
        var from = ray.origin;
        var to = btPhysicsManager._tempVector30;
        Vector3.normalize(ray.direction, to);
        Vector3.scale(to, distance, to);
        Vector3.add(from, to, to);
        var bt: any = this._bt;
        var rayResultCall: number = this._btAllHitsRayResultCallback;
        var rayFrom: number = btPhysicsManager._btTempVector30;
        var rayTo: number = btPhysicsManager._btTempVector31;

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
                hitResult.collider = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.tBtCollisionObjectArray_at(collisionObjects, i))];
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
     * @en Performs a shape cast. Returns the first hit object.
     * @param shape The shape to cast.
     * @param fromPosition The starting position of the shape.
     * @param toPosition The ending position of the shape.
     * @param out The hit result object to store the result.
     * @param fromRotation The starting rotation of the shape.
     * @param toRotation The ending rotation of the shape.
     * @param collisonGroup The collision group of the shape.
     * @param collisionMask The collision mask of the shape.
     * @param allowedCcdPenetration The allowed continuous collision detection penetration.
     * @returns Whether hit anything.
     * @zh 执行形状射线检测，返回第一个与射线相交的碰撞体信息。
     * @param shape 要投射的形状。
     * @param fromPosition 形状的起始位置。
     * @param toPosition 形状的结束位置。
     * @param out 用于存储结果的命中结果对象。
     * @param fromRotation 形状的起始旋转。
     * @param toRotation 形状的结束旋转。
     * @param collisonGroup 形状的碰撞组。
     * @param collisionMask 形状的碰撞掩码。
     * @param allowedCcdPenetration 允许的连续碰撞检测穿透。
     * @returns 是否击中了任何物体。
     */
    shapeCast(shape: btColliderShape, fromPosition: Vector3, toPosition: Vector3, out: HitResult, fromRotation: Quaternion = null, toRotation: Quaternion = null, collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, allowedCcdPenetration: number = 0.0): boolean {
        var bt: any = this._bt;
        var convexResultCall: number = this._btClosestConvexResultCallback;
        var convexPosFrom: number = btPhysicsManager._btTempVector30;
        var convexPosTo: number = btPhysicsManager._btTempVector31;
        var convexRotFrom: number = btPhysicsManager._btTempQuaternion0;
        var convexRotTo: number = btPhysicsManager._btTempQuaternion1;
        var convexTransform: number = btPhysicsManager._btTempTransform0;
        var convexTransTo: number = btPhysicsManager._btTempTransform1;

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
            bt.btQuaternion_setValue(convexRotFrom, fromRotation.x, fromRotation.y, fromRotation.z, -fromRotation.w);
            bt.btTransform_setRotation(convexTransform, convexRotFrom);
        } else {
            bt.btTransform_setRotation(convexTransform, this._btDefaultQuaternion);
        }
        if (toRotation) {
            bt.btQuaternion_setValue(convexRotTo, toRotation.x, toRotation.y, toRotation.z, -toRotation.w);
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
                out.collider = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.ClosestConvexResultCallback_get_m_hitCollisionObject(convexResultCall))];
                out.hitFraction = bt.ConvexResultCallback_get_m_closestHitFraction(convexResultCall);
                var btPoint: number = bt.ClosestConvexResultCallback_get_m_hitPointWorld(convexResultCall);
                var btNormal: number = bt.ClosestConvexResultCallback_get_m_hitNormalWorld(convexResultCall);
                var point: Vector3 = out.point;
                var normal: Vector3 = out.normal;
                point.x = -bt.btVector3_x(btPoint);
                point.y = bt.btVector3_y(btPoint);
                point.z = bt.btVector3_z(btPoint);
                normal.x = -bt.btVector3_x(btNormal);
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
     * @en Performs a shape cast. Returns all hit objects.
     * @param shape The shape to cast.
     * @param fromPosition The starting position of the shape.
     * @param toPosition The ending position of the shape.
     * @param out An array to store all hit results.
     * @param fromRotation The starting rotation of the shape.
     * @param toRotation The ending rotation of the shape.
     * @param collisonGroup The collision group of the shape.
     * @param collisionMask The collision mask of the shape.
     * @param allowedCcdPenetration The allowed continuous collision detection penetration.
     * @returns Whether hit anything.
     * @zh 执行形状投射，返回所有与射线相交的碰撞体信息。
     * @param shape 要投射的形状。
     * @param fromPosition 形状的起始位置。
     * @param toPosition 形状的结束位置。
     * @param out 用于存储所有命中结果的数组。
     * @param fromRotation 形状的起始旋转。
     * @param toRotation 形状的结束旋转。
     * @param collisonGroup 形状的碰撞组。
     * @param collisionMask 形状的碰撞掩码。
     * @param allowedCcdPenetration 允许的连续碰撞检测穿透。
     * @returns 是否击中了任何物体。
     */
    shapeCastAll(shape: btColliderShape, fromPosition: Vector3, toPosition: Vector3, out: HitResult[], fromRotation: Quaternion = null, toRotation: Quaternion = null, collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, allowedCcdPenetration: number = 0.0): boolean {
        var bt: any = this._bt;
        var convexResultCall: number = this._btAllConvexResultCallback;
        var convexPosFrom: number = btPhysicsManager._btTempVector30;
        var convexPosTo: number = btPhysicsManager._btTempVector31;
        var convexRotFrom: number = btPhysicsManager._btTempQuaternion0;
        var convexRotTo: number = btPhysicsManager._btTempQuaternion1;
        var convexTransform: number = btPhysicsManager._btTempTransform0;
        var convexTransTo: number = btPhysicsManager._btTempTransform1;

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
            bt.btQuaternion_setValue(convexRotFrom, fromRotation.x, fromRotation.y, fromRotation.z, -fromRotation.w);
            bt.btTransform_setRotation(convexTransform, convexRotFrom);
        } else {
            bt.btTransform_setRotation(convexTransform, this._btDefaultQuaternion);
        }
        if (toRotation) {
            bt.btQuaternion_setValue(convexRotTo, toRotation.x, toRotation.y, toRotation.z, -toRotation.w);
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

            for (var i: number = 0; i < count; i++) {
                var hitResult: HitResult = this._collisionsUtils.getHitResult();
                out.push(hitResult);
                hitResult.succeeded = true;
                hitResult.collider = btCollider._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.tBtCollisionObjectArray_at(collisionObjects, i))];
                hitResult.hitFraction = bt.tScalarArray_at(btFractions, i);
                var btPoint: number = bt.tVector3Array_at(btPoints, i);
                var point: Vector3 = hitResult.point;
                point.x = -bt.btVector3_x(btPoint);
                point.y = bt.btVector3_y(btPoint);
                point.z = bt.btVector3_z(btPoint);
                var btNormal: number = bt.tVector3Array_at(btNormals, i);
                var normal: Vector3 = hitResult.normal;
                normal.x = -bt.btVector3_x(btNormal);
                normal.y = bt.btVector3_y(btNormal);
                normal.z = bt.btVector3_z(btNormal);
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * @en Destroys the physics manager and releases all associated resources.
     * @zh 销毁物理管理器并释放所有相关资源。
     */
    destroy(): void {
        var bt = this._bt;
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
        this._physicsEngineCapableMap = null;
    }

    /**
    * @internal
    */
    private _addRigidBody(rigidBody: btCollider): void {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._bt.btDiscreteDynamicsWorld_addRigidBody(this._btCollisionWorld, rigidBody._btCollider, rigidBody._collisionGroup, rigidBody._canCollideWith);
    }

    /**
     * @internal
     */
    private _removeRigidBody(rigidBody: btCollider): void {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._bt.btDiscreteDynamicsWorld_removeRigidBody(this._btCollisionWorld, rigidBody._btCollider);
    }

    /**
     * @internal
     */
    private _addCharacter(character: btCharacterCollider): void {
        var characters: btCharacterCollider[] = this._characters;
        let index = characters.indexOf(character)
        if (index == -1) {
            if (!this._btDiscreteDynamicsWorld)
                throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
            this._bt.btCollisionWorld_addCollisionObject(this._btCollisionWorld, character._btCollider, character._collisionGroup, character._canCollideWith);
            this._bt.btDynamicsWorld_addAction(this._btCollisionWorld, character._btKinematicCharacter);
            characters.push(character);
        } else {
            characters[index] = character;
        }
    }

    /**
     * @internal
     */
    private _removeCharacter(character: btCharacterCollider): void {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._bt.btCollisionWorld_removeCollisionObject(this._btCollisionWorld, character._btCollider);
        this._bt.btDynamicsWorld_removeAction(this._btCollisionWorld, character._btKinematicCharacter);
        var characters: btCharacterCollider[] = this._characters;
        characters.splice(characters.indexOf(character), 1);
    }

    // /**
    //  * @internal
    //  */
    // private addVehicle(v: RaycastVehicle) {
    //     let bt: any = ILaya3D.Physics3D._bullet;
    //     bt.btDynamicsWorld_addAction(this._btDiscreteDynamicsWorld, v.btVehiclePtr);
    // }

    // /**
    //  * @internal
    //  */
    // private removeVehicle(v: RaycastVehicle) {
    //     let bt: any = ILaya3D.Physics3D._bullet;
    //     bt.btDynamicsWorld_removeAction(v.btVehiclePtr);
    // }

}