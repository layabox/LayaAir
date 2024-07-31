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
import { IColliderShape } from "../interface/Shape/IColliderShape";
import { btColliderShape } from "./Shape/btColliderShape";

export class btPhysicsManager implements IPhysicsManager {
    /**默认碰撞组 */
    static COLLISIONFILTERGROUP_DEFAULTFILTER: number = 0x1;
    /**静态碰撞组 */
    static COLLISIONFILTERGROUP_STATICFILTER: number = 0x2;
    /**运动学刚体碰撞组 */
    static COLLISIONFILTERGROUP_KINEMATICFILTER: number = 0x4;
    /**碎片碰撞组 */
    static COLLISIONFILTERGROUP_DEBRISFILTER: number = 0x8;
    /**传感器触发器*/
    static COLLISIONFILTERGROUP_SENSORTRIGGER: number = 0x10;
    /**字符过滤器 */
    static COLLISIONFILTERGROUP_CHARACTERFILTER: number = 0x20;
    /**自定义过滤1 */
    static COLLISIONFILTERGROUP_CUSTOMFILTER1: number = 0x40;
    /**自定义过滤2 */
    static COLLISIONFILTERGROUP_CUSTOMFILTER2: number = 0x80;
    /**自定义过滤3 */
    static COLLISIONFILTERGROUP_CUSTOMFILTER3: number = 0x100;
    /**自定义过滤4 */
    static COLLISIONFILTERGROUP_CUSTOMFILTER4: number = 0x200;
    /**自定义过滤5 */
    static COLLISIONFILTERGROUP_CUSTOMFILTER5: number = 0x400;
    /**自定义过滤6 */
    static COLLISIONFILTERGROUP_CUSTOMFILTER6: number = 0x800;
    /**自定义过滤7 */
    static COLLISIONFILTERGROUP_CUSTOMFILTER7: number = 0x1000;
    /**自定义过滤8 */
    static COLLISIONFILTERGROUP_CUSTOMFILTER8: number = 0x2000;
    /**自定义过滤9 */
    static COLLISIONFILTERGROUP_CUSTOMFILTER9: number = 0x4000;
    /**自定义过滤10*/
    static COLLISIONFILTERGROUP_CUSTOMFILTER10: number = 0x8000;
    /**所有过滤 */
    static COLLISIONFILTERGROUP_ALLFILTER: number = -1;

    /** @internal */
    static ACTIVATIONSTATE_ACTIVE_TAG = 1;
    /** @internal */
    static ACTIVATIONSTATE_ISLAND_SLEEPING = 2;
    /** @internal */
    static ACTIVATIONSTATE_WANTS_DEACTIVATION = 3;
    /** @internal */
    static ACTIVATIONSTATE_DISABLE_DEACTIVATION = 4;
    /** @internal */
    static ACTIVATIONSTATE_DISABLE_SIMULATION = 5;

    /** @internal */
    static COLLISIONFLAGS_STATIC_OBJECT = 1;
    /** @internal */
    static COLLISIONFLAGS_KINEMATIC_OBJECT = 2;
    /** @internal */
    static COLLISIONFLAGS_NO_CONTACT_RESPONSE = 4;
    /** @internal */
    static COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK = 8;//this allows per-triangle material (friction/restitution)
    /** @internal */
    static COLLISIONFLAGS_CHARACTER_OBJECT = 16;
    /** @internal */
    static COLLISIONFLAGS_DISABLE_VISUALIZE_OBJECT = 32;//disable debug drawing
    /** @internal */
    static COLLISIONFLAGS_DISABLE_SPU_COLLISION_PROCESSING = 64;//disable parallel/SPU processing

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
    private static _tempVector30: Vector3;

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

    /**物理引擎在一帧中用于补偿减速的最大次数：模拟器每帧允许的最大模拟次数，如果引擎运行缓慢,可能需要增加该次数，否则模拟器会丢失“时间",引擎间隔时间小于maxSubSteps*fixedTimeStep非常重要。*/
    public maxSubSteps = 1;
    /**物理模拟器帧的间隔时间:通过减少fixedTimeStep可增加模拟精度，默认是1.0 / 60.0。*/
    public fixedTimeStep = 1.0 / 60.0;
    /**是否开启连续碰撞检测 */
    public enableCCD: boolean = false;
    /**连续碰撞检测阈值 */
    public ccdThreshold: number = 0.0001;
    /**连续碰撞检测球半径 */
    public ccdSphereRadius: number = 0.0001;
    /**delta */
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
    setActiveCollider(collider: btCollider, value: boolean): void {
        collider.active = value;
        if (value) {
            collider._physicsManager = this;
        } else {
            collider._physicsManager = null;
        }
    }
    sphereQuery?(pos: Vector3, radius: number, result: ICollider[], collisionmask: number): void {
        throw new Error("Method not implemented.");
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
     */
    private _updatePhysicsTransformFromRender(): void {
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
     * 这个只是给对象发送事件，不会挨个组件调用碰撞函数
     * 组件要响应碰撞的话，要通过监听事件
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
            let preColliderA = preFrameCol._colliderA.component as PhysicsColliderComponent;
            let preColliderB = preFrameCol._colliderB.component as PhysicsColliderComponent;
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
     * debugger Function
     * @param value 
     */
    enableDebugDrawer(value: boolean) {
        let bt = btPhysicsCreateUtil._bt;
        bt.btDynamicsWorld_enableDebugDrawer(this._btDiscreteDynamicsWorld, value);
    }

    getPhysicsCapable(value: EPhysicsCapable): boolean {
        return this._physicsEngineCapableMap.get(value);
    }

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
     * gravity
     * @param gravity 
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

    addJoint(joint: btJoint) {
        if (!this._btDiscreteDynamicsWorld)
            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
        // this._nativeDiscreteDynamicsWorld.addConstraint(constraint._nativeConstraint, disableCollisionsBetweenLinkedBodies);
        this._bt.btCollisionWorld_addConstraint(this._btDiscreteDynamicsWorld, joint._btJoint, joint._disableCollisionsBetweenLinkedBodies);
        this._currentConstraint[joint._id] = joint;
    }

    removeJoint(joint: btJoint) {
        if (!this._btDiscreteDynamicsWorld)
            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
        // this._nativeDiscreteDynamicsWorld.removeConstraint(constraint._nativeConstraint);
        this._bt.btCollisionWorld_removeConstraint(this._btDiscreteDynamicsWorld, joint._btJoint);
        delete this._currentConstraint[joint._id];
    }

    update(elapsedTime: number): void {
        this._updatePhysicsTransformFromRender();
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