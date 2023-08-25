import { Ray } from "../../d3/math/Ray";
import { HitResult } from "../../d3/physics/HitResult";
import { PhysicsSettings } from "../../d3/physics/PhysicsSettings";
import { PhysicsUpdateList } from "../../d3/physics/PhysicsUpdateList";
import { Vector3 } from "../../maths/Vector3";
import { ICollider } from "../interface/ICollider";
import { IPhysicsManager } from "../interface/IPhysicsManager";
import { EPhysicsCapable } from "../physicsEnum/EPhycisCapable";
import { pxCharactorCollider } from "./Collider/pxCharactorCollider";
import { pxCollider, pxColliderType } from "./Collider/pxCollider";
import { pxDynamicCollider } from "./Collider/pxDynamicCollider";
import { pxPhysicsCreateUtil } from "./pxPhysicsCreateUtil";

export class pxPhysicsManager implements IPhysicsManager {
    /** @internal 引擎更新物理列表*/
    _physicsUpdateList = new PhysicsUpdateList();

    _dynamicUpdateList = new PhysicsUpdateList();
    /** @internal */
    _pxScene: any;

    protected _physicsEngineCapableMap: Map<any, any>;

    private _gravity: Vector3 = new Vector3(0, -9.81, 0);

    constructor(physicsSettings: PhysicsSettings) {
        //TODO 事件
        const triggerCallback = {
            onContactBegin: (index1: number, index2: number) => {

            },
            onContactEnd: (index1: number, index2: number) => {

            },
            onContactPersist: (index1: number, index2: number) => {

            },
            onTriggerBegin: (index1: number, index2: number) => {

            },
            onTriggerEnd: (index1: number, index2: number) => {

            }
        };
        const pxPhysics = pxPhysicsCreateUtil._pxPhysics;
        const physXSimulationCallbackInstance = pxPhysicsCreateUtil._physX.PxSimulationEventCallback.implement(triggerCallback);
        const sceneDesc = pxPhysicsCreateUtil._physX.getDefaultSceneDesc(pxPhysics.getTolerancesScale(), 0, physXSimulationCallbackInstance);
        this._pxScene = pxPhysics.createScene(sceneDesc);
        this.setGravity(this._gravity);
        this.initPhysicsCapable();
    }

    initPhysicsCapable(): void {
        this._physicsEngineCapableMap = new Map();
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_Gravity, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_StaticCollider, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_DynamicCollider, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CharacterCollider, false);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_BoxColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_SphereColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CapsuleColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CylinderColliderShape, false);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_ConeColliderShape, false);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_MeshColliderShape, false);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CompoundColliderShape, false);
    }

    getPhysicsCapable(value: EPhysicsCapable): boolean {
        return this._physicsEngineCapableMap.get(value);
    }

    setGravity(gravity: Vector3): void {
        this._pxScene.setGravity(gravity);
    }

    private _addCharactorCollider(charactorCollider: pxCharactorCollider): void {
        //TODO
    }

    private _removeCharactorCollider(charactorCollider: pxCharactorCollider): void {
        //TODO
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
                this._dynamicUpdateList.add(collider);
                break;
            case pxColliderType.CharactorCollider:
                //TODO:
                this._addCharactorCollider(collider);
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
                    this._dynamicUpdateList.remove(collider);
                this._pxScene.removeActor(pxcollider._pxActor, true);
                break;
            case pxColliderType.CharactorCollider:
                //TODO:
                this._removeCharactorCollider(pxcollider);
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
    rayCast?(ray: Ray, outHitResult: HitResult, distance?: number, collisonGroup?: number, collisionMask?: number): boolean {
        //TODO
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