import { Ray } from "../../d3/math/Ray";
import { Collision } from "../../d3/physics/Collision";
import { HitResult } from "../../d3/physics/HitResult";
import { PhysicsSettings } from "../../d3/physics/PhysicsSettings";
import { PhysicsUpdateList } from "../../d3/physics/PhysicsUpdateList";
import { Physics3DUtils } from "../../d3/utils/Physics3DUtils";
import { Event } from "../../events/Event";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { ICollider } from "../interface/ICollider";
import { IPhysicsManager } from "../interface/IPhysicsManager";
import { pxCharactorCollider } from "./Collider/pxCharactorCollider";
import { pxCollider, pxColliderType } from "./Collider/pxCollider";
import { pxDynamicCollider } from "./Collider/pxDynamicCollider";
import { pxColliderShape } from "./Shape/pxColliderShape";
import { pxCollisionTool } from "./pxCollisionTool";
import { pxPhysicsCreateUtil } from "./pxPhysicsCreateUtil";


export enum partFlag {

    eSOLVE_CONTACT = (1 << 0),  // Dynamic中刚体触发碰撞
    eMODIFY_CONTACTS = (1 << 1),    // Dynamic中刚体碰撞需要修改碰撞
    eNOTIFY_TOUCH_FOUND = (1 << 2), // 
    eNOTIFY_TOUCH_PERSISTS = (1 << 3),  //
    eNOTIFY_TOUCH_LOST = (1 << 4),  //
    eNOTIFY_TOUCH_CCD = (1 << 5),   //
    eNOTIFY_THRESHOLD_FORCE_FOUND = (1 << 6),   //
    eNOTIFY_THRESHOLD_FORCE_PERSISTS = (1 << 7),    //
    eNOTIFY_THRESHOLD_FORCE_LOST = (1 << 8),    //
    eNOTIFY_CONTACT_POINTS = (1 << 9),  //
    eDETECT_DISCRETE_CONTACT = (1 << 10),   //
    eDETECT_CCD_CONTACT = (1 << 11),    //
    ePRE_SOLVER_VELOCITY = (1 << 12),   //
    ePOST_SOLVER_VELOCITY = (1 << 13),  //
    eCONTACT_EVENT_POSE = (1 << 14),    //
    eNEXT_FREE = (1 << 15),        //!< For internal use only.  //
    eCONTACT_DEFAULT = eSOLVE_CONTACT | eDETECT_DISCRETE_CONTACT,   // 默认碰撞标志
    eTRIGGER_DEFAULT = eNOTIFY_TOUCH_FOUND | eNOTIFY_TOUCH_LOST | eDETECT_DISCRETE_CONTACT  // 默认触发标志
};

export class pxPhysicsManager implements IPhysicsManager {
    /** @internal 引擎更新物理列表*/
    _physicsUpdateList = new PhysicsUpdateList();

    _dynamicUpdateList = new PhysicsUpdateList();
    /** @internal */
    _pxScene: any;

    /**fixedTimeStep */
    fixedTime: number = 1.0 / 60.0;

    /** enable CCD */
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

    private _gravity: Vector3 = new Vector3(0, -9.81, 0);

    /**temp tranform object */
    private static _tempTransform: {
        translation: Vector3;
        rotation: Quaternion;
    } = { translation: new Vector3(), rotation: new Quaternion() };
    /**@internal */
    private static _tempVector30: Vector3 = new Vector3();

    constructor(physicsSettings: PhysicsSettings) {


        //TODO 事件
        const triggerCallback = {

            onWake: (wakeActors: any) => {
                //加到更新队列
                let uuid = wakeActors.get(0);
                this.addDynamicElementByUUID(uuid);
            },

            onSleep: (sleepActors: any) => {
                //移除更新队列
                let uuid = sleepActors.get(0);
                this.removeDynamicElementByUUID(uuid);
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
        const pxPhysics = pxPhysicsCreateUtil._pxPhysics;
        pxPhysicsCreateUtil._physXSimulationCallbackInstance = pxPhysicsCreateUtil._physX.PxSimulationEventCallback.implement(triggerCallback);
        pxPhysicsCreateUtil._sceneDesc = pxPhysicsCreateUtil._physX.getDefaultSceneDesc(pxPhysics.getTolerancesScale(), 0, pxPhysicsCreateUtil._physXSimulationCallbackInstance);
        this._pxScene = pxPhysics.createScene(pxPhysicsCreateUtil._sceneDesc);
        this.setGravity(this._gravity);
        this._pxcontrollerManager = this._pxScene.createControllerManager();
        if (pxPhysicsCreateUtil._physXPVD) {
            this._pxScene.setPVDClient();
        }
        this.fixedTime = physicsSettings.fixedTimeStep;
    }
    setActiveCollider(collider: pxCollider, value: boolean): void {
        collider.active = value;
        if (value) {
            collider._physicsManager = this;
        } else {
            collider._physicsManager = null;
        }
    }
    enableDebugDrawer?(value: boolean): void {
        throw new Error("Method not implemented.");
    }

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

    setGravity(gravity: Vector3): void {
        this._pxScene.setGravity(gravity);
    }

    private _addCharactorCollider(charactorCollider: pxCharactorCollider): void {
        charactorCollider._createController();
        this._dynamicUpdateList.add(charactorCollider);
    }

    private _removeCharactorCollider(charactorCollider: pxCharactorCollider): void {
        charactorCollider._createController();
        this._dynamicUpdateList.remove(charactorCollider);
    }

    private addDynamicElementByUUID(uuid: number) {
        let collider = pxCollider._ActorPool.get(uuid) as pxDynamicCollider;
        if (collider) return;
        this._dynamicUpdateList.add(collider);
    }

    private removeDynamicElementByUUID(uuid: number) {
        let collider = pxCollider._ActorPool.get(uuid) as pxDynamicCollider;
        if (!collider || collider.IsKinematic) return;
        this._dynamicUpdateList.remove(collider);
    }

    addCollider(collider: ICollider): void {
        if (!collider.active) {
            return;
        }
        let pxcollider = collider as pxCollider;
        //collider._derivePhysicsTransformation(true);
        switch (pxcollider._type) {
            case pxColliderType.StaticCollider:
                this._pxScene.addActor(pxcollider._pxActor, null);
                break;
            case pxColliderType.RigidbodyCollider:
                this._pxScene.addActor(pxcollider._pxActor, null);
                !(collider as pxDynamicCollider).IsKinematic && this._dynamicUpdateList.add(collider);
                break;
            case pxColliderType.CharactorCollider:
                this._addCharactorCollider(collider as pxCharactorCollider);
                break;
        }
        pxcollider._isSimulate = true;
    }

    removeCollider(collider: ICollider): void {
        let pxcollider = collider as pxCollider;

        switch (pxcollider._type) {
            case pxColliderType.StaticCollider:
                if (collider.inPhysicUpdateListIndex !== -1)
                    this._physicsUpdateList.remove(collider);
                this._pxScene.removeActor(pxcollider._pxActor, true);
                break;
            case pxColliderType.RigidbodyCollider:    //TODO
                if (collider.inPhysicUpdateListIndex !== -1)
                    !(collider as pxDynamicCollider).IsKinematic && this._dynamicUpdateList.remove(collider);
                this._pxScene.removeActor(pxcollider._pxActor, true);
                break;
            case pxColliderType.CharactorCollider:
                //TODO:
                this._removeCharactorCollider(pxcollider as pxCharactorCollider);
                break;
        }
        pxcollider._isSimulate = false;
    }

    private _updatePhysicsEvents(): void {
        // contact
        this._contactCollisionsBegin.forEach((value: Collision, key: number) => {
            if (!value) return;
            let ownerA = value._colliderA.owner;
            let ownerB = value._colliderB.owner;
            value.other = value._colliderB.component;
            ownerA.event(Event.COLLISION_ENTER, value);
            value.other = value._colliderA.component;
            ownerB.event(Event.COLLISION_ENTER, value);
            pxCollisionTool.reCoverCollision(value);
        });

        this._contactCollisionsPersist.forEach((value: Collision, key: number) => {
            if (!value) return;
            let ownerA = value._colliderA.owner;
            let ownerB = value._colliderB.owner;
            value.other = value._colliderB.component;
            ownerA.event(Event.COLLISION_STAY, value);
            value.other = value._colliderA.component;
            ownerB.event(Event.COLLISION_STAY, value);
            pxCollisionTool.reCoverCollision(value);
        });

        this._contactCollisionsEnd.forEach((value: Collision, key: number) => {
            if (!value) return;
            let ownerA = value._colliderA.owner;
            let ownerB = value._colliderB.owner;
            value.other = value._colliderB.component;
            ownerA.event(Event.COLLISION_EXIT, value);
            value.other = value._colliderA.component;
            ownerB.event(Event.COLLISION_EXIT, value);
            pxCollisionTool.reCoverCollision(value);
        });
        // trigger
        this._triggerCollisionsBegin.forEach((value: Collision, key: number) => {
            if (!value) return;
            let ownerA = value._colliderA.owner;
            let ownerB = value._colliderB.owner;
            // value.other = value._colliderB;
            ownerA.event(Event.TRIGGER_ENTER, value);
            // value.other = value._colliderA;
            ownerB.event(Event.TRIGGER_ENTER, value);
            pxCollisionTool.reCoverCollision(value);
        });

        this._triggerCollisionsPersist.forEach((value: Collision, key: number) => {
            if (!value) return;
            let ownerA = value._colliderA.owner;
            let ownerB = value._colliderB.owner;
            // value.other = value._colliderB;
            ownerA.event(Event.TRIGGER_STAY, value);
            // value.other = value._colliderA;
            ownerB.event(Event.TRIGGER_STAY, value);
            pxCollisionTool.reCoverCollision(value);
        });

        this._triggerCollisionsEnd.forEach((value: Collision, key: number) => {
            if (!value) return;
            let ownerA = value._colliderA.owner;
            let ownerB = value._colliderB.owner;
            // value.other = value._colliderB;
            ownerA.event(Event.TRIGGER_EXIT, value);
            // value.other = value._colliderA;
            ownerB.event(Event.TRIGGER_EXIT, value);
            pxCollisionTool.reCoverCollision(value);
        });

        this._contactCollisionsBegin.clear();
        this._contactCollisionsPersist.clear();
        this._contactCollisionsEnd.clear();
        this._triggerCollisionsBegin.clear();
        this._triggerCollisionsEnd.clear();
    }

    private _updatePhysicsTransformToRender(): void {
        var elements: any = this._dynamicUpdateList.elements;
        for (var i = 0, n = this._dynamicUpdateList.length; i < n; i++) {
            var physicCollider = elements[i] as pxDynamicCollider;
            physicCollider.getWorldTransform();
            //physicCollider.inPhysicUpdateListIndex = -1;//置空索引
        }
        //this._physicsUpdateList.length = 0;//清空物理更新队列
    }


    private functiontest() {
        let a = new Float32Array(30);
        var length = 30 * 4;
        var ptr = pxPhysicsCreateUtil._allocator.allocate(4 * length, 0, 0, 0); // Get buffer from emscripten.
        var buffer = new Float32Array(pxPhysicsCreateUtil._physX.HEAPF32.buffer, ptr, 30);
        for (var i = 0; i < length; i++) {
            buffer[i] = i + 20;
        }
        let vecpointer = pxPhysicsCreateUtil._physX.wrapPointer(ptr, pxPhysicsCreateUtil._physX.PxVec3);//PXVec3
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

    update(elapsedTime: number): void {
        this._updatePhysicsTransformFromRender();//update render to physics
        //simulate
        this._pxScene.simulate(1 / 60, true);
        this._pxScene.fetchResults(true);
        //update dynamic
        this._updatePhysicsTransformToRender();
        // update Events
        this._updatePhysicsEvents();
    }
    rayCast(ray: Ray, outHitResult: HitResult, distance: number = 1000000, collisonGroup: number = 1 << 4, collisionMask: number = 1 << 4): boolean {
        let result: any = this._pxScene.raycastCloset(ray.origin, ray.direction, distance, collisonGroup, collisionMask);
        pxCollisionTool.getRayCastResult(outHitResult, result);
        return outHitResult.succeeded;
    }
    rayCastAll?(ray: Ray, out: HitResult[], distance: number = 1000000, collisonGroup: number = 1 << 4, collisionMask: number = 1 << 4): boolean {
        let results: any = this._pxScene.raycastAllHits(ray.origin, ray.direction, distance, collisonGroup, collisionMask);
        pxCollisionTool.getRayCastResults(out, results);
        return (out.length >= 1 ? true : false);
    }

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
    destroy(): void {
        //TODO
    }

}