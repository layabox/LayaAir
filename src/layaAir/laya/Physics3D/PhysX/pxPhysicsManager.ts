import { Ray } from "../../d3/math/Ray";
import { Collision } from "../../d3/physics/Collision";
import { HitResult } from "../../d3/physics/HitResult";
import { PhysicsSettings } from "../../d3/physics/PhysicsSettings";
import { PhysicsUpdateList } from "../../d3/physics/PhysicsUpdateList";
import { Event } from "../../events/Event";
import { LayaGL } from "../../layagl/LayaGL";
import { StatElement } from "../../layagl/StatisticsContext";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { NotImplementedError } from "../../utils/Error";
import { Stat } from "../../utils/Stat";
import { ICollider } from "../interface/ICollider";
import { IPhysicsManager, IPhysicsStepListener } from "../interface/IPhysicsManager";
import { Physics3DStatInfo } from "../interface/Physics3DStatInfo";
import { EPhysicsStatisticsInfo } from "../physicsEnum/EPhysicsStatisticsInfo";
import { pxCharactorCollider } from "./Collider/pxCharactorCollider";
import { pxCollider, pxColliderType } from "./Collider/pxCollider";
import { pxDynamicCollider } from "./Collider/pxDynamicCollider";
import { pxColliderShape } from "./Shape/pxColliderShape";
import { pxCollisionTool } from "./pxCollisionTool";
import { pxPhysicsCreateUtil } from "./pxPhysicsCreateUtil";
import { pxStatics } from "./pxStatics";

/**
 * @en The `pxPhysicsManager` class is used to implement physics management.
 * @zh `pxPhysicsManager` 类用于实现物理管理。
 */
export class pxPhysicsManager implements IPhysicsManager {
    /** @internal Fixed-step listeners shared by advanced physics components. */
    private _physicsStepListeners: IPhysicsStepListener[] = [];
    /** @internal Operations requested from inside a physics callback. */
    private _pendingPhysicsOperations: Array<() => void> = [];
    /** @internal */
    private _inPhysicsUpdate: boolean = false;
    /** @internal */
    private _destroyed: boolean = false;
    /** Scene-owned callback wrapper. It must outlive the PxScene. */
    private _simulationCallback: any = null;
    /** Descriptor returned by getDefaultSceneDesc and owned by this manager. */
    private _sceneDesc: any = null;
    /** @internal 引擎更新物理列表*/
    _physicsUpdateList = new PhysicsUpdateList();

    _dynamicUpdateList = new PhysicsUpdateList();
    /** @internal */
    _pxScene: any;

    /**
     * @en Fixed time step for physics simulation.
     * @zh 物理模拟的固定时间步长。
     */
    fixedTime: number = 1.0 / 60.0;

    /** @en Max fixed steps per outer update. @zh 单帧最多固定步数。 */
    maxSubSteps: number = 1;

    /**
     * @en Whether to enable Continuous Collision Detection (CCD).
     * @zh 是否启用连续碰撞检测(CCD)。
     */
    enableCCD: boolean = false;

    /**@internal 碰撞开始数据表*/
    _contactCollisionsBegin: Map<number, Collision> = new Map();

    /**@internal 碰撞持续数据表*/
    _contactCollisionsPersist: Map<number, Collision> = new Map();

    /**@internal 碰撞结束数据表*/
    _contactCollisionsEnd: Map<number, Collision> = new Map();

    /**@internal 触发数据开始列表*/
    _triggerCollisionsBegin: Map<number, Collision> = new Map();

    /**@internal 触发数据持续列表*/
    _triggerCollisionsPersist: Map<number, Collision> = new Map();

    /**@internal 触发数据结束列表*/
    _triggerCollisionsEnd: Map<number, Collision> = new Map();

    //
    _pxcontrollerManager: any;//PxControllerManager*

    /** @internal Current gravity used by advanced solvers. */
    _gravity: Vector3 = new Vector3(0, -9.81, 0);

    /**temp tranform object */
    private static _tempTransform: {
        translation: Vector3;
        rotation: Quaternion;
    } = { translation: new Vector3(), rotation: new Quaternion() };
    /**@internal */
    private static _tempVector30: Vector3 = new Vector3();

    /**
     * @en Create a new instance of `pxPhysicsManager`.
     * @param physicsSettings The physics settings to initialize the manager.
     * @zh 创建`pxPhysicsManager`类的新实例。
     * @param physicsSettings 用于初始化管理器的物理设置。
     */
    constructor(physicsSettings: PhysicsSettings) {


        //TODO 事件
        const triggerCallback = {

            onWake: (wakeActors: any) => {
                //加到更新队列
                let size = wakeActors.size();
                for (let i = 0; i < size; i++) {
                    let uuid = wakeActors.get(i);
                    this.addDynamicElementByUUID(uuid);
                }
            },

            onSleep: (sleepActors: any) => {
                //移除更新队列
                let size = sleepActors.size();
                for (let i = 0; i < size; i++) {
                    let uuid = sleepActors.get(i);
                    this.removeDynamicElementByUUID(uuid);
                }
            },

            onContactBegin: (startContacts: any) => {
                this.setDataToMap(startContacts, "onContactBegin");
            },
            onContactEnd: (onContactEnd: any) => {
                this.setDataToMap(onContactEnd, "onContactEnd");
            },
            onContactPersist: (onContactPersist: any) => {
                this.setDataToMap(onContactPersist, "onContactPersist");
            },
            onTriggerBegin: (startTrigger: any) => {
                this.setDataToMap(startTrigger, "onTriggerBegin", true);
            },
            onTriggerEnd: (lostTrigger: any) => {
                this.setDataToMap(lostTrigger, "onTriggerEnd", true);
            }
        };
        this.enableCCD = physicsSettings.enableCCD;
        const pxPhysics = pxStatics._physics;
        this._simulationCallback = pxStatics._physX.PxSimulationEventCallback.implement(triggerCallback);
        this._sceneDesc = pxStatics._physX.getDefaultSceneDesc(pxPhysics.getTolerancesScale(), 0, this._simulationCallback);
        this._pxScene = pxPhysics.createScene(this._sceneDesc);
        this.setGravity(this._gravity);
        this._pxcontrollerManager = this._pxScene.createControllerManager();
        if (pxStatics._physXPVD) {
            this._pxScene.setPVDClient();
        }
        this.fixedTime = physicsSettings.fixedTimeStep;
        this.maxSubSteps = physicsSettings.maxSubSteps;
    }

    /**
     * @en Set the active state of a collider.
     * @param collider The collider to set.
     * @param value The active state to set.
     * @zh 设置碰撞器的活动状态。
     * @param collider 要设置的碰撞器。
     * @param value 要设置的活动状态。
     */
    setActiveCollider(collider: pxCollider, value: boolean): void {
        collider.active = value;
        if (value) {
            collider._physicsManager = this;
        } else {
            collider._physicsManager = null;
        }
    }
    /**
     * @en Enable or disable the debug drawer.
     * @param value Whether to enable the debug drawer.
     * @zh 启用或禁用调试绘制器。
     * @param value 是否启用调试绘制器。
     */
    enableDebugDrawer?(value: boolean): void {
        throw new NotImplementedError();
    }

    /**
     * @en Set collision data to the appropriate map based on the event type.
     * @param dataCallBack The collision data callback.
     * @param eventType The type of collision event.
     * @param isTrigger Whether the collision is a trigger event.
     * @zh 根据事件类型将碰撞数据设置到适当的映射中。
     * @param dataCallBack 碰撞数据回调。
     * @param eventType 碰撞事件的类型。
     * @param isTrigger 碰撞是否为触发器事件。
     */
    setDataToMap(dataCallBack: any, eventType: string, isTrigger: boolean = false) {
        let curCollision = pxCollisionTool.getCollision(dataCallBack, isTrigger);
        if (!curCollision) return;
        let _colliderA = curCollision._colliderA as pxCollider;
        let _colliderB = curCollision._colliderB as pxCollider;

        switch (eventType) {
            case "onContactBegin":
                this._contactCollisionsBegin.set(_colliderA._id, curCollision);
                this._contactCollisionsBegin.set(_colliderB._id, curCollision);
                break;
            case "onContactPersist":
                this._contactCollisionsPersist.set(_colliderA._id, curCollision);
                this._contactCollisionsPersist.set(_colliderB._id, curCollision);
                break;
            case "onContactEnd":
                this._contactCollisionsEnd.set(_colliderA._id, curCollision);
                this._contactCollisionsEnd.set(_colliderB._id, curCollision);
                break;
            case "onTriggerBegin":
                this._triggerCollisionsBegin.set(_colliderA._id, curCollision);
                this._triggerCollisionsBegin.set(_colliderB._id, curCollision);
                this._triggerCollisionsPersist.set(_colliderA._id, curCollision);
                this._triggerCollisionsPersist.set(_colliderB._id, curCollision);
                break;
            case "onTriggerEnd":
                this._triggerCollisionsEnd.set(_colliderA._id, curCollision);
                this._triggerCollisionsEnd.set(_colliderB._id, curCollision);
                this._triggerCollisionsPersist.delete(_colliderA._id);
                this._triggerCollisionsPersist.delete(_colliderB._id);
                break;
            default:
                break;
        }
    }

    /**
     * @en Set the gravity of the physics world.
     * @param gravity The gravity vector to set.
     * @zh 设置物理世界的重力。
     * @param gravity 要设置的重力向量。
     */
    setGravity(gravity: Vector3): void {
        gravity.cloneTo(this._gravity);
        this._pxScene.setGravity(gravity);
    }

    private _addCharactorCollider(charactorCollider: pxCharactorCollider): void {
        charactorCollider._createController();
        this._dynamicUpdateList.add(charactorCollider);
    }

    private _removeCharactorCollider(charactorCollider: pxCharactorCollider): void {
        charactorCollider._releaseController();
        this._dynamicUpdateList.remove(charactorCollider);
    }

    private addDynamicElementByUUID(uuid: number) {
        let collider = pxCollider._ActorPool.get(uuid) as pxDynamicCollider;
        if (!collider || collider.inPhysicUpdateListIndex !== -1) return;
        this._dynamicUpdateList.add(collider);
    }

    private removeDynamicElementByUUID(uuid: number) {
        let collider = pxCollider._ActorPool.get(uuid) as pxDynamicCollider;
        if (!collider || collider.IsKinematic || collider.inPhysicUpdateListIndex === -1) return;
        this._dynamicUpdateList.remove(collider);
    }

    /**
     * @en Add a collider to the physics world.
     * @param collider The collider to be added.
     * @zh 将碰撞器添加到物理世界中。
     * @param collider 要添加的碰撞器。
     */
    addCollider(collider: ICollider): void {
        if (!collider.active) {
            return;
        }
        let pxcollider = collider as pxCollider;
        switch (pxcollider._type) {
            case pxColliderType.StaticCollider:
                this._pxScene.addActor(pxcollider._pxActor, null);
                LayaGL.statAgent.recordCountData(StatElement.C_PhysicaStaticRigidBody, 1);
                break;
            case pxColliderType.RigidbodyCollider:
                pxcollider.setWorldTransform(true);
                this._pxScene.addActor(pxcollider._pxActor, null);
                if (!(collider as pxDynamicCollider).IsKinematic) {
                    this._dynamicUpdateList.add(collider);
                    LayaGL.statAgent.recordCountData(StatElement.C_PhysicaDynamicRigidBody, 1);
                } else {
                    LayaGL.statAgent.recordCountData(StatElement.C_PhysicaKinematicRigidBody, 1);
                }
                break;
            case pxColliderType.CharactorCollider:
                this._addCharactorCollider(collider as pxCharactorCollider);
                LayaGL.statAgent.recordCountData(StatElement.C_PhysicaCharacterController, 1);
                break;
        }
        pxcollider._isSimulate = true;
    }

    /**
     * @en Remove a collider from the physics world.
     * @param collider The collider to be removed.
     * @zh 从物理世界中移除碰撞器。
     * @param collider 要移除的碰撞器。
     */
    removeCollider(collider: ICollider): void {
        let pxcollider = collider as pxCollider;

        switch (pxcollider._type) {
            case pxColliderType.StaticCollider:
                if (collider.inPhysicUpdateListIndex !== -1)
                    this._physicsUpdateList.remove(collider);
                this._pxScene.removeActor(pxcollider._pxActor, true);
                LayaGL.statAgent.recordCountData(StatElement.C_PhysicaStaticRigidBody, -1);
                break;
            case pxColliderType.RigidbodyCollider:    //TODO
                if (collider.inPhysicUpdateListIndex !== -1)
                    !(collider as pxDynamicCollider).IsKinematic && this._dynamicUpdateList.remove(collider);
                this._pxScene.removeActor(pxcollider._pxActor, true);
                if (!(collider as pxDynamicCollider).IsKinematic) {
                    LayaGL.statAgent.recordCountData(StatElement.C_PhysicaDynamicRigidBody, -1);
                } else {
                    LayaGL.statAgent.recordCountData(StatElement.C_PhysicaKinematicRigidBody, -1);
                }
                break;
            case pxColliderType.CharactorCollider:
                //TODO:
                this._removeCharactorCollider(pxcollider as pxCharactorCollider);
                LayaGL.statAgent.recordCountData(StatElement.C_PhysicaCharacterController, -1);
                break;
        }
        pxcollider._isSimulate = false;
    }
    /**
     * @private
     * @perfTag PerformanceDefine.T_PhysicsCollider
     */
    private _collision_event() {
        this._collision_EnterEvent();
        this._collision_StayEvent();
        this._collision_ExitEvent();
    }
    /**
     * @private
     * @perfTag PerformanceDefine.T_PhysicsColliderEnter
     */
    private _collision_EnterEvent() {
        this._contactCollisionsBegin.forEach((value: Collision, key: number) => {
            if (!value) return;
            Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicsEventCount, 1);
            let ownerA = value._colliderA.owner;
            let ownerB = value._colliderB.owner;
            value.other = value._colliderB.component;
            ownerA.event(Event.COLLISION_ENTER, value);
            value.other = value._colliderA.component;
            ownerB.event(Event.COLLISION_ENTER, value);
            pxCollisionTool.reCoverCollision(value);
        });
    }
    /**
     * @private
     * @perfTag PerformanceDefine.T_PhysicsColliderStay
     */
    private _collision_StayEvent() {
        this._contactCollisionsPersist.forEach((value: Collision, key: number) => {
            if (!value) return;
            Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicsEventCount, 1);
            let ownerA = value._colliderA.owner;
            let ownerB = value._colliderB.owner;
            value.other = value._colliderB.component;
            ownerA.event(Event.COLLISION_STAY, value);
            value.other = value._colliderA.component;
            ownerB.event(Event.COLLISION_STAY, value);
            pxCollisionTool.reCoverCollision(value);
        });
    }
    /**
     * @private
     * @perfTag PerformanceDefine.T_PhysicsColliderExit
     */
    private _collision_ExitEvent() {
        this._contactCollisionsEnd.forEach((value: Collision, key: number) => {
            if (!value) return;
            Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicsEventCount, 1);
            let ownerA = value._colliderA.owner;
            let ownerB = value._colliderB.owner;
            value.other = value._colliderB.component;
            ownerA.event(Event.COLLISION_EXIT, value);
            value.other = value._colliderA.component;
            ownerB.event(Event.COLLISION_EXIT, value);
            pxCollisionTool.reCoverCollision(value);
        });
    }

    /**
     * @private
     * @perfTag PerformanceDefine.T_PhysicsTrigger
     */
    private _trigger_Event() {
        this._trigger_EnterEvent();
        this._trigger_StayEvent();
        this._trigger_ExitEvent();
    }

    /**
     * @private
     * @perfTag PerformanceDefine.T_PhysicsTriggerEnter
     */
    private _trigger_EnterEvent() {
        // trigger
        this._triggerCollisionsBegin.forEach((value: Collision, key: number) => {
            if (!value) return;
            Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicsEventCount, 1);
            let ownerA = value._colliderA.owner;
            let ownerB = value._colliderB.owner;
            // value.other = value._colliderB;
            ownerA.event(Event.TRIGGER_ENTER, value);
            // value.other = value._colliderA;
            ownerB.event(Event.TRIGGER_ENTER, value);
            pxCollisionTool.reCoverCollision(value);
        });
    }

    /**
     * @private
     * @perfTag PerformanceDefine.T_PhysicsTriggerStay
     */
    private _trigger_StayEvent() {
        this._triggerCollisionsPersist.forEach((value: Collision, key: number) => {
            if (!value) return;
            Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicsEventCount, 1);
            let ownerA = value._colliderA.owner;
            let ownerB = value._colliderB.owner;
            // value.other = value._colliderB;
            ownerA.event(Event.TRIGGER_STAY, value);
            // value.other = value._colliderA;
            ownerB.event(Event.TRIGGER_STAY, value);
            pxCollisionTool.reCoverCollision(value);
        });

    }

    /**
     * @private
     * @perfTag PerformanceDefine.T_PhysicsTriggerExit
     */
    private _trigger_ExitEvent() {
        this._triggerCollisionsEnd.forEach((value: Collision, key: number) => {
            if (!value) return;
            Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicsEventCount, 1);
            let ownerA = value._colliderA.owner;
            let ownerB = value._colliderB.owner;
            // value.other = value._colliderB;
            ownerA.event(Event.TRIGGER_EXIT, value);
            // value.other = value._colliderA;
            ownerB.event(Event.TRIGGER_EXIT, value);
            pxCollisionTool.reCoverCollision(value);
        });
    }


    /**
     * @private
     * @perfTag PerformanceDefine.T_PhysicsEvent
     */
    private _updatePhysicsEvents(): void {
        // contact
        this._collision_event();
        this._trigger_Event();
        this._contactCollisionsBegin.clear();
        this._contactCollisionsPersist.clear();
        this._contactCollisionsEnd.clear();
        this._triggerCollisionsBegin.clear();
        this._triggerCollisionsEnd.clear();
    }

    /**
     * @private
     * @perfTag PerformanceDefine.T_Physics_UpdateNode
     */
    private _updatePhysicsTransformToRender(): void {
        var elements: any = this._dynamicUpdateList.elements;
        for (var i = 0, n = this._dynamicUpdateList.length; i < n; i++) {
            var physicCollider = elements[i] as pxDynamicCollider;
            physicCollider.getWorldTransform();
            //physicCollider.inPhysicUpdateListIndex = -1;//置空索引
        }
        //this._physicsUpdateList.length = 0;//清空物理更新队列
    }


    /**
     * @internal
     */
    private _updatePhysicsTransformFromRender(): void {
        var elements: any = this._physicsUpdateList.elements;
        for (var i = 0, n = this._physicsUpdateList.length; i < n; i++) {
            var physicCollider: pxCollider = elements[i];
            physicCollider.setWorldTransform(false)
            physicCollider.inPhysicUpdateListIndex = -1;//置空索引
        }
        this._physicsUpdateList.length = 0;//清空物理更新队列
    }

    /**
     * @perfTag PerformanceDefine.T_Physics_Simulation
     * @en Update the physics simulation.
     * @param elapsedTime The elapsed time since the last update.
     * @zh 更新物理模拟。
     * @param elapsedTime 自上次更新以来经过的时间。
     */
    update(elapsedTime: number): void {
        if (this._destroyed || !this._pxScene)
            return;
        this._updatePhysicsTransformFromRender();//update render to physics
        const fixedDeltaTime = this.fixedTime > 0 ? this.fixedTime : elapsedTime;
        const requestedSteps = (fixedDeltaTime > 0 && elapsedTime > 0)
            ? Math.max(1, Math.round(elapsedTime / fixedDeltaTime)) : 0;
        // Clamp like Bullet: never exceed maxSubSteps; 0 when elapsedTime is 0.
        const stepCount = Math.min(Math.max(1, this.maxSubSteps), requestedSteps);
        try {
            this._flushPendingPhysicsOperations();
            for (let step = 0; step < stepCount; step++) {
                this._inPhysicsUpdate = true;
                try {
                    const listeners = this._physicsStepListeners;
                    for (let i = 0, n = listeners.length; i < n; i++)
                        listeners[i].beforePhysicsStep(fixedDeltaTime);
                    this._pxScene.simulate(fixedDeltaTime, true);
                    this._pxScene.fetchResults(true);
                    for (let i = 0, n = listeners.length; i < n; i++)
                        listeners[i].afterPhysicsStep(fixedDeltaTime);
                } finally {
                    this._inPhysicsUpdate = false;
                    this._flushPendingPhysicsOperations();
                }
            }
        } finally {
            this._inPhysicsUpdate = false;
            this._flushPendingPhysicsOperations();
        }
        //update dynamic
        this._updatePhysicsTransformToRender();
        // update Events
        this._updatePhysicsEvents();
    }
    /**
     * @en Performs a ray cast in the physics world.Returns the first hit object.
     * @param ray The ray to cast.
     * @param outHitResult The result of the raycast.
     * @param distance The maximum distance of the raycast.
     * @param collisonGroup The collision group of the ray.
     * @param collisionMask The collision mask of the ray.
     * @returns Whether the raycast hit anything.
     * @zh 执行一次射线检测，返回第一个与射线相交的碰撞体信息。
     * @param ray 要投射的射线。
     * @param outHitResult 射线检测的结果。
     * @param distance 射线检测的最大距离。
     * @param collisonGroup 射线的碰撞组。
     * @param collisionMask 射线的碰撞掩码。
     * @returns 射线是否击中了任何物体。
     */
    rayCast(ray: Ray, outHitResult: HitResult, distance: number = 1000000, collisonGroup: number = 1 << 4, collisionMask: number = 1 << 4): boolean {
        let result: any = this._pxScene.raycastCloset(ray.origin, ray.direction, distance, collisonGroup, collisionMask);
        pxCollisionTool.getRayCastResult(outHitResult, result);
        return outHitResult.succeeded;
    }
    /**
     * @en Performs a ray cast in the physics world.Returns all hit objects.
     * @param ray The ray to cast.
     * @param out An array to store all hit results.
     * @param distance The maximum distance of the raycast.
     * @param collisonGroup The collision group of the ray.
     * @param collisionMask The collision mask of the ray.
     * @returns Whether the raycast hit anything.
     * @zh 执行一次射线检测，返回所有与射线相交的碰撞体信息。
     * @param ray 要投射的射线。
     * @param out 用于存储所有击中结果的数组。
     * @param distance 射线检测的最大距离。
     * @param collisonGroup 射线的碰撞组。
     * @param collisionMask 射线的碰撞掩码。
     * @returns 射线是否击中了任何物体。
     */
    rayCastAll?(ray: Ray, out: HitResult[], distance: number = 1000000, collisonGroup: number = 1 << 4, collisionMask: number = 1 << 4): boolean {
        let results: any = this._pxScene.raycastAllHits(ray.origin, ray.direction, distance, collisonGroup, collisionMask);
        pxCollisionTool.getRayCastResults(out, results);
        return (out.length >= 1 ? true : false);
    }

    /**
     * @en Performs a shape cast. Returns the first hit object.
     * @param shape The shape to cast.
     * @param fromPosition The starting position of the shape.
     * @param toPosition The ending position of the shape.
     * @param out The result of the shape cast.
     * @param fromRotation The starting rotation of the shape.
     * @param toRotation The ending rotation of the shape.
     * @param collisonGroup The collision group of the shape.
     * @param collisionMask The collision mask of the shape.
     * @param allowedCcdPenetration The allowed continuous collision detection penetration.
     * @returns Whether the shape cast hit anything.
     * @zh 执行形状射线检测，返回第一个与射线相交的碰撞体信息。
     * @param shape 要投射的形状。
     * @param fromPosition 形状的起始位置。
     * @param toPosition 形状的结束位置。
     * @param out 形状投射的结果。
     * @param fromRotation 形状的起始旋转。
     * @param toRotation 形状的结束旋转。
     * @param collisonGroup 形状的碰撞组。
     * @param collisionMask 形状的碰撞掩码。
     * @param allowedCcdPenetration 允许的连续碰撞检测穿透。
     * @returns 形状投射是否击中了任何物体。
     */
    shapeCast(shape: pxColliderShape, fromPosition: Vector3, toPosition: Vector3, out: HitResult, fromRotation: Quaternion = new Quaternion(), toRotation: Quaternion = new Quaternion(), collisonGroup: number = 1 << 4, collisionMask: number = 1 << 4, allowedCcdPenetration: number = 0.0): boolean {
        let transform = pxPhysicsManager._tempTransform;
        fromPosition.cloneTo(transform.translation);
        let distance = Vector3.distance(fromPosition, toPosition);
        Vector3.subtract(toPosition, fromPosition, pxPhysicsManager._tempVector30);
        Vector3.normalize(pxPhysicsManager._tempVector30, pxPhysicsManager._tempVector30);
        let dir = pxPhysicsManager._tempVector30;
        let result: any = this._pxScene.sweepSingle(shape._pxGeometry, transform, dir, distance, collisonGroup, collisionMask, allowedCcdPenetration);
        pxCollisionTool.getRayCastResult(out, result);
        return out.succeeded;
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
     * @returns Whether the shape cast hit anything.
     * @zh 执行形状投射，返回所有与射线相交的碰撞体信息。
     * @param shape 要投射的形状。
     * @param fromPosition 形状的起始位置。
     * @param toPosition 形状的结束位置。
     * @param out 用于存储所有击中结果的数组。
     * @param fromRotation 形状的起始旋转。
     * @param toRotation 形状的结束旋转。
     * @param collisonGroup 形状的碰撞组。
     * @param collisionMask 形状的碰撞掩码。
     * @param allowedCcdPenetration 允许的连续碰撞检测穿透。
     * @returns 形状投射是否击中了任何物体。
     */
    shapeCastAll(shape: pxColliderShape, fromPosition: Vector3, toPosition: Vector3, out: HitResult[], fromRotation: Quaternion = new Quaternion(), toRotation: Quaternion = new Quaternion(), collisonGroup: number = 1 << 4, collisionMask: number = 1 << 4, allowedCcdPenetration: number = 0.0): boolean {
        let transform = pxPhysicsManager._tempTransform;
        fromPosition.cloneTo(transform.translation);
        let distance = Vector3.distance(fromPosition, toPosition);
        Vector3.subtract(toPosition, fromPosition, pxPhysicsManager._tempVector30);
        Vector3.normalize(pxPhysicsManager._tempVector30, pxPhysicsManager._tempVector30);
        let dir = pxPhysicsManager._tempVector30;
        let results: any = this._pxScene.sweepAny(shape._pxGeometry, transform, dir, distance, collisonGroup, collisionMask, allowedCcdPenetration);
        pxCollisionTool.getRayCastResults(out, results);
        return (out.length >= 1 ? true : false);
    }

    sphereQuery?(pos: Vector3, radius: number, result: ICollider[], collisionmask: number): void {
        //TODO
    }

    addPhysicsStepListener(listener: IPhysicsStepListener): void {
        if (this._destroyed)
            return;
        this.deferPhysicsOperation(() => {
            if (this._physicsStepListeners.indexOf(listener) === -1)
                this._physicsStepListeners.push(listener);
        });
    }

    removePhysicsStepListener(listener: IPhysicsStepListener): void {
        if (this._destroyed)
            return;
        this.deferPhysicsOperation(() => {
            const index = this._physicsStepListeners.indexOf(listener);
            if (index !== -1)
                this._physicsStepListeners.splice(index, 1);
        });
    }

    deferPhysicsOperation(operation: () => void): void {
        if (this._destroyed)
            return;
        if (this._inPhysicsUpdate)
            this._pendingPhysicsOperations.push(operation);
        else
            operation();
    }

    private _flushPendingPhysicsOperations(): void {
        while (this._pendingPhysicsOperations.length > 0) {
            const operations = this._pendingPhysicsOperations.splice(0, this._pendingPhysicsOperations.length);
            for (let i = 0; i < operations.length; i++)
                operations[i]();
        }
    }

    destroy(): void {
        if (this._destroyed)
            return;
        this._inPhysicsUpdate = false;
        this._flushPendingPhysicsOperations();
        this._destroyed = true;
        this._physicsStepListeners.length = 0;
        this._pendingPhysicsOperations.length = 0;
        this._releaseNative(this._pxcontrollerManager, "release", "PxControllerManager");
        this._pxcontrollerManager = null;
        this._releaseNative(this._pxScene, "release", "PxScene");
        this._pxScene = null;
        this._releaseNative(this._sceneDesc, "delete", "PxSceneDesc");
        this._sceneDesc = null;
        this._releaseNative(this._simulationCallback, "delete", "PxSimulationEventCallback");
        this._simulationCallback = null;
        this._physicsUpdateList.clear();
        this._dynamicUpdateList.clear();
        this._contactCollisionsBegin.clear();
        this._contactCollisionsPersist.clear();
        this._contactCollisionsEnd.clear();
        this._triggerCollisionsBegin.clear();
        this._triggerCollisionsPersist.clear();
        this._triggerCollisionsEnd.clear();
    }

    private _releaseNative(resource: any, method: string, name: string): void {
        if (!resource || typeof resource[method] !== "function")
            return;
        try {
            resource[method]();
            if (method !== "delete" && typeof resource.delete === "function")
                resource.delete();
        } catch (error) {
            console.error("[PhysX] Failed to release " + name + ".", error);
        }
    }

}
