import { Ray } from "../../d3/math/Ray";
import { HitResult } from "../../d3/physics/HitResult";
import { PhysicsSettings } from "../../d3/physics/PhysicsSettings";
import { PhysicsUpdateList } from "../../d3/physics/PhysicsUpdateList";
import { Vector3 } from "../../maths/Vector3";
import { ICollider } from "../interface/ICollider";
import { IPhysicsManager } from "../interface/IPhysicsManager";
import { pxCharactorCollider } from "./Collider/pxCharactorCollider";
import { pxCollider, pxColliderType } from "./Collider/pxCollider";
import { pxDynamicCollider } from "./Collider/pxDynamicCollider";
import { pxPhysicsCreateUtil } from "./pxPhysicsCreateUtil";


export enum partFlag {

    eSOLVE_CONTACT = (1 << 0),
    eMODIFY_CONTACTS = (1 << 1),
    eNOTIFY_TOUCH_FOUND = (1 << 2),
    eNOTIFY_TOUCH_PERSISTS = (1 << 3),
    eNOTIFY_TOUCH_LOST = (1 << 4),
    eNOTIFY_TOUCH_CCD = (1 << 5),
    eNOTIFY_THRESHOLD_FORCE_FOUND = (1 << 6),
    eNOTIFY_THRESHOLD_FORCE_PERSISTS = (1 << 7),
    eNOTIFY_THRESHOLD_FORCE_LOST = (1 << 8),
    eNOTIFY_CONTACT_POINTS = (1 << 9),
    eDETECT_DISCRETE_CONTACT = (1 << 10),
    eDETECT_CCD_CONTACT = (1 << 11),
    ePRE_SOLVER_VELOCITY = (1 << 12),
    ePOST_SOLVER_VELOCITY = (1 << 13),
    eCONTACT_EVENT_POSE = (1 << 14),
    eNEXT_FREE = (1 << 15),        //!< For internal use only.
    eCONTACT_DEFAULT = eSOLVE_CONTACT | eDETECT_DISCRETE_CONTACT,
    eTRIGGER_DEFAULT = eNOTIFY_TOUCH_FOUND | eNOTIFY_TOUCH_LOST | eDETECT_DISCRETE_CONTACT
};

export class pxPhysicsManager implements IPhysicsManager {
    /** @internal 引擎更新物理列表*/
    _physicsUpdateList = new PhysicsUpdateList();

    _dynamicUpdateList = new PhysicsUpdateList();
    /** @internal */
    _pxScene: any;

    /**fixedTimeStep */
    fixedTime: number = 1.0 / 60.0;
    //
    _pxcontrollerManager: any;//PxControllerManager*

    private _gravity: Vector3 = new Vector3(0, -9.81, 0);

    constructor(physicsSettings: PhysicsSettings) {

        //TODO 事件
        const triggerCallback = {

            onWake: (wakeActors: any) => {
                //加到更新队列
                //Vector<int>  ActorUUID
            },

            onSleep: (sleepActors: any) => {
                //移除更新队列

            },

            onContactBegin: (startContacts: any) => {
                //Vector< LayaContactPairInfo>
                //Vector<int>  ActorUUID
                // struct{
                //     PxU32 pxShape0;
                //     PxU32 pxShape1;
                //     PxU8 contactCount;
                //     PxContactPairPoint contactPoint0;
                //     PxContactPairPoint contactPoint1;
                //     PxContactPairPoint contactPoint2;
                //     PxContactPairPoint contactPoint3;
                // }
                //     struct PxContactPairPoint{
                //"position",&PxContactPairPoint::position)
                //"normal",&PxContactPairPoint::normal)
                //"impulse",&PxContactPairPoint::impulse);
                //}
            },
            onContactEnd: (onContactEnd: any) => {

            },
            onContactPersist: (onContactPersist: any) => {

            },
            onTriggerBegin: (startTrigger: any) => {

                //vector<LayaTriggerInfo>
                // value_object<LayaTriggerInfo>("LayaTriggerInfo")
                // .field("triggerShape",&LayaTriggerInfo::triggerShape)
                // .field("triggerActor",&LayaTriggerInfo::triggerActor)
                // .field("otherShape",&LayaTriggerInfo::otherShape)
                // .field("otherActor",&LayaTriggerInfo::otherActor);
            },
            onTriggerEnd: (lostTrigger: any) => {

            }
        };
        const pxPhysics = pxPhysicsCreateUtil._pxPhysics;
        const physXSimulationCallbackInstance = pxPhysicsCreateUtil._physX.PxSimulationEventCallback.implement(triggerCallback);
        const sceneDesc = pxPhysicsCreateUtil._physX.getDefaultSceneDesc(pxPhysics.getTolerancesScale(), 0, physXSimulationCallbackInstance);
        this._pxScene = pxPhysics.createScene(sceneDesc);
        this.setGravity(this._gravity);
        this._pxcontrollerManager = this._pxScene.createControllerManager();
        if (pxPhysicsCreateUtil._physXPVD) {
            this._pxScene.setPVDClient();
        }
        this.fixedTime = physicsSettings.fixedTimeStep;

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

    addCollider(collider: ICollider): void {
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
    }
    rayCast(ray: Ray, outHitResult: HitResult, distance?: number, collisonGroup?: number, collisionMask?: number): boolean {
        this._pxScene.raycastCloset(ray.origin, ray.direction, collisionMask);
        return false;
    }
    rayCastAll?(ray: Ray, out: HitResult[], distance: number, collisonGroup?: number, collisionMask?: number): boolean {
        //TODO
        return false;
    }

    sphereQuery?(pos: Vector3, radius: number, result: ICollider[], collisionmask: number): void {
        //TODO
    }
    destroy(): void {
        //TODO
    }

}