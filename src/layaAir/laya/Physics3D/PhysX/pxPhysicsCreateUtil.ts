import { Laya3D } from "../../../Laya3D";
import { PhysicsSettings } from "../../d3/physics/PhysicsSettings";
import { ICharacterController } from "../interface/ICharacterController";
import { IDynamicCollider } from "../interface/IDynamicCollider";
import { IPhysicsCreateUtil } from "../interface/IPhysicsCreateUtil";
import { IPhysicsManager } from "../interface/IPhysicsManager";
import { IStaticCollider } from "../interface/IStaticCollider";
import { ICustomJoint } from "../interface/Joint/ICustomJoint";
import { IFixedJoint } from "../interface/Joint/IFixedJoint";
import { IHingeJoint } from "../interface/Joint/IHingeJoint";
import { ISpringJoint } from "../interface/Joint/ISpringJoint";
import { IBoxColliderShape } from "../interface/Shape/IBoxColliderShape";
import { ICapsuleColliderShape } from "../interface/Shape/ICapsuleColliderShape";
import { IConeColliderShape } from "../interface/Shape/IConeColliderShape";
import { ICylinderColliderShape } from "../interface/Shape/ICylinderColliderShape";
import { IMeshColliderShape } from "../interface/Shape/IMeshColliderShape";
import { IPlaneColliderShape } from "../interface/Shape/IPlaneColliderShape";
import { ISphereColliderShape } from "../interface/Shape/ISphereColliderShape";
import { EPhysicsCapable } from "../physicsEnum/EPhycisCapable";
import { pxDynamicCollider } from "./Collider/pxDynamicCollider";
import { pxStaticCollider } from "./Collider/pxStaticCollider";
import { pxBoxColliderShape } from "./Shape/pxBoxColliderShape";
import { pxCapsuleColliderShape } from "./Shape/pxCapsuleColliderShape";
import { pxSphereColliderShape } from "./Shape/pxSphereColliderShape";
import { pxPhysicsManager } from "./pxPhysicsManager";


export class pxPhysicsCreateUtil implements IPhysicsCreateUtil {

    static _physXPVD: boolean = false;
    //** @internal PhysX wasm object */
    static _physX: any;
    // /** @internal PhysX Foundation SDK singleton class */
    static _pxFoundation: any;
    // /** @internal PhysX physics object */
    static _pxPhysics: any;
    /**@internal pvd */
    static _pvd: any;
    /**@internal */
    static _PxPvdTransport: any;

    protected _physicsEngineCapableMap: Map<any, any>;

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

    initialize(): Promise<void> {
        return (window as any).PHYSX().then((PHYSX: any) => {
            this._init(PHYSX);
            console.log("PhysX loaded.");
            this.initPhysicsCapable();
            pxDynamicCollider.initCapable();
            pxStaticCollider.initCapable();

            return Promise.resolve();
        });

    }

    private _init(physX: any): void {
        const version = physX.PX_PHYSICS_VERSION;
        const defaultErrorCallback = new physX.PxDefaultErrorCallback();
        const allocator = new physX.PxDefaultAllocator();
        const pxFoundation = physX.PxCreateFoundation(version, allocator, defaultErrorCallback);
        let pxPhysics;
        if (pxPhysicsCreateUtil._physXPVD) {
            let gPvd = physX.PxCreatePvd(pxFoundation);
            let socketsuccess = physX.CreatepvdTransport(5425, 10, gPvd);
            //gPvd.connect(PxPvdTransport,);
            pxPhysics = physX.PxCreatePhysics(version, pxFoundation, new physX.PxTolerancesScale(), true, gPvd);
            physX.PxInitExtensions(pxPhysics, gPvd);
        } else {
            pxPhysics = physX.CreateDefaultPhysics(pxFoundation, new physX.PxTolerancesScale());
            physX.InitDefaultExtensions(pxPhysics);
        }



        pxPhysicsCreateUtil._physX = physX;
        pxPhysicsCreateUtil._pxFoundation = pxFoundation;
        pxPhysicsCreateUtil._pxPhysics = pxPhysics;
    }

    createPhysicsManger(physicsSettings: PhysicsSettings): pxPhysicsManager {
        return new pxPhysicsManager(physicsSettings);
    }

    createDynamicCollider(manager: pxPhysicsManager): IDynamicCollider {
        return new pxDynamicCollider(manager);
    }

    createStaticCollider(manager: pxPhysicsManager): IStaticCollider {
        return new pxStaticCollider(manager);
    }

    createCharacterController(manager: IPhysicsManager): ICharacterController {
        //TODO
        return null;
    }

    createFixedJoint(manager: IPhysicsManager): IFixedJoint {
        //TODO
        return null;
    }

    createHingeJoint(manager: IPhysicsManager): IHingeJoint {
        //TODO
        return null;
    }

    createSpringJoint(manager: IPhysicsManager): ISpringJoint {
        //TODO
        return null;
    }

    createCustomJoint(manager: IPhysicsManager): ICustomJoint {
        //TODO
        return null;
    }

    createBoxColliderShape(): IBoxColliderShape {
        return new pxBoxColliderShape();
    }

    createSphereColliderShape(): ISphereColliderShape {
        return new pxSphereColliderShape();
    }

    createPlaneColliderShape(): IPlaneColliderShape {
        return null;
    }

    createCapsuleColliderShape?(): ICapsuleColliderShape {
        return new pxCapsuleColliderShape();
    }

    createMeshColliderShape?(): IMeshColliderShape {
        return null;
    }

    createCylinderColliderShape?(): ICylinderColliderShape {
        return null;
    }

    createConeColliderShape?(): IConeColliderShape {
        return null;
    }
}

Laya3D.PhysicsCreateUtil = new pxPhysicsCreateUtil()