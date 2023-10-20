import { Laya3D } from "../../../Laya3D";
import { PhysicsSettings } from "../../d3/physics/PhysicsSettings";
import { ICharacterController } from "../interface/ICharacterController";
import { IDynamicCollider } from "../interface/IDynamicCollider";
import { IPhysicsCreateUtil } from "../interface/IPhysicsCreateUtil";
import { IPhysicsManager } from "../interface/IPhysicsManager";
import { IStaticCollider } from "../interface/IStaticCollider";
import { ICustomJoint } from "../interface/Joint/ICustomJoint";
import { ID6Joint } from "../interface/Joint/ID6Joint";
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
import { pxFixedJoint } from "./Joint/PxFixedJoint";
import { pxD6Joint } from "./Joint/pxD6Joint";
import { pxDistanceJoint } from "./Joint/pxDistanceJoint";
import { pxRevoluteJoint } from "./Joint/pxRevoluteJoint";
import { pxBoxColliderShape } from "./Shape/pxBoxColliderShape";
import { pxCapsuleColliderShape } from "./Shape/pxCapsuleColliderShape";
import { pxMeshColliderShape } from "./Shape/pxMeshColliderShape";
import { pxHeightFieldShape } from "./Shape/pxHeightFieldShape";
import { pxSphereColliderShape } from "./Shape/pxSphereColliderShape";

import { pxPhysicsManager } from "./pxPhysicsManager";
import { pxCharactorCollider } from "./Collider/pxCharactorCollider";
import { Mesh } from "../../d3/resource/models/Mesh";
import { VertexMesh } from "../../RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { PrimitiveMesh } from "../../d3/resource/models/PrimitiveMesh";


export class pxPhysicsCreateUtil implements IPhysicsCreateUtil {
    static _physXPVD: boolean = false;
    //** @internal PhysX wasm object */
    static _physX: any;
    // /** @internal PhysX Foundation SDK singleton class */
    static _pxFoundation: any;
    // /** @internal PhysX physics object */
    static _pxPhysics: any;

    static _allocator: any;
    /**@internal pvd */
    static _pvd: any;
    /**@internal */
    static _PxPvdTransport: any;
    /**@internal */
    static _physXSimulationCallbackInstance: any;
    /**@internal */
    static _sceneDesc: any;
    static _tolerancesScale: any;

    protected _physicsEngineCapableMap: Map<any, any>;

    initPhysicsCapable(): void {
        this._physicsEngineCapableMap = new Map();
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_Gravity, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_StaticCollider, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_DynamicCollider, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CharacterCollider, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_BoxColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_SphereColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CapsuleColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CylinderColliderShape, false);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_ConeColliderShape, false);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_MeshColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.physics_heightFieldColliderShape, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CompoundColliderShape, false);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_Joint, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_FixedJoint, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_SpringJoint, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_HingeJoint, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_D6Joint, true);
        this._physicsEngineCapableMap.set(EPhysicsCapable.Physics_CreateCorveMesh, true);
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
            pxCharactorCollider.initCapable();
            return Promise.resolve();
        });

    }

    private _init(physX: any): void {
        const version = physX.PX_PHYSICS_VERSION;
        const defaultErrorCallback = new physX.PxDefaultErrorCallback();
        const allocator = new physX.PxDefaultAllocator();
        const pxFoundation = physX.PxCreateFoundation(version, allocator, defaultErrorCallback);
        pxPhysicsCreateUtil._tolerancesScale = new physX.PxTolerancesScale();
        let pxPhysics;
        if (pxPhysicsCreateUtil._physXPVD) {
            let gPvd = physX.PxCreatePvd(pxFoundation);
            let socketsuccess = physX.CreatepvdTransport(5425, 10, gPvd);
            //gPvd.connect(PxPvdTransport,);
            pxPhysics = physX.PxCreatePhysics(version, pxFoundation, pxPhysicsCreateUtil._tolerancesScale, true, gPvd);
            physX.PxInitExtensions(pxPhysics, gPvd);
        } else {
            pxPhysics = physX.CreateDefaultPhysics(pxFoundation, pxPhysicsCreateUtil._tolerancesScale);
            physX.InitDefaultExtensions(pxPhysics);
        }
        pxPhysicsCreateUtil._physX = physX;
        pxPhysicsCreateUtil._pxFoundation = pxFoundation;
        pxPhysicsCreateUtil._pxPhysics = pxPhysics;
        pxPhysicsCreateUtil._allocator = allocator;
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

    createCharacterController(manager: pxPhysicsManager): ICharacterController {
        return new pxCharactorCollider(manager);
    }

    createFixedJoint(manager: pxPhysicsManager): IFixedJoint {
        return new pxFixedJoint(manager);
    }

    createHingeJoint(manager: pxPhysicsManager): IHingeJoint {
        return new pxRevoluteJoint(manager);
    }

    createSpringJoint(manager: pxPhysicsManager): ISpringJoint {
        return new pxDistanceJoint(manager);
    }

    createD6Joint(manager: pxPhysicsManager): ID6Joint {
        return new pxD6Joint(manager);
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
        return new pxMeshColliderShape();
    }

    createCylinderColliderShape?(): ICylinderColliderShape {
        return null;
    }

    createConeColliderShape?(): IConeColliderShape {
        return null;
    }

    createHeightFieldShape(): pxHeightFieldShape {
        return new pxHeightFieldShape();
    }

    createCorveMesh(mesh: Mesh): Mesh {
        if (mesh._convexMesh == null) {
            return null;
        }
        if ((<any>mesh).__convexMesh == null) {
            let convexMesh = mesh._convexMesh;
            let vertices = convexMesh.getVertices();
            let vertexCount = vertices.size();
            var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION");
            var vertexFloatStride: number = vertexDeclaration.vertexStride / 4;
            var vertice: Float32Array = new Float32Array(vertexCount * vertexFloatStride);
            for (var i = 0; i < vertexCount; i++) {
                let index = i * 3;
                let data = vertices.get(i);
                vertice[index] = data.x;
                vertice[index + 1] = data.y;
                vertice[index + 2] = data.z;
            }
            let indexs = convexMesh.getIndexBuffer();
            let polygons = convexMesh.getPolygons();
            let triangles = []
            for (var i = 0, n = polygons.size(); i < n;) {
                let nbTris = polygons.get(i) - 2;
                let mIndexBase = polygons.get(i + 1);
                let vref0 = indexs.get(mIndexBase);
                for (var j = 0; j < nbTris; j++) {
                    let vref1 = indexs.get(mIndexBase + j + 1);
                    let vref2 = indexs.get(mIndexBase + j + 2);
                    triangles.push(vref0, vref1, vref2);
                }
                i += 2;
            }
            (<any>mesh).__convexMesh = PrimitiveMesh._createMesh(vertexDeclaration, vertice, new Uint16Array(triangles));
        }
        return (<any>mesh).__convexMesh;

    }

    static createFloat32Array(length: number): { ptr: number, buffer: Float32Array } {
        let ptr = this._physX._malloc(4 * length);
        const buffer = new Float32Array(this._physX.HEAPF32.buffer, ptr, length);
        return { ptr: ptr, buffer: buffer }
    }

    static createUint32Array(length: number): { ptr: number, buffer: Uint32Array } {
        let ptr = this._physX._malloc(4 * length);
        const buffer = new Uint32Array(this._physX.HEAPU32.buffer, ptr, length);
        return { ptr: ptr, buffer: buffer }
    }
    static createUint16Array(length: number): { ptr: number, buffer: Uint16Array } {
        let ptr = this._physX._malloc(2 * length);
        const buffer = new Uint16Array(this._physX.HEAPU16.buffer, ptr, length);
        return { ptr: ptr, buffer: buffer }
    }
    static createUint8Array(length: number): { ptr: number, buffer: Uint8Array } {
        let ptr = this._physX._malloc(length);
        const buffer = new Uint8Array(this._physX.HEAPU8.buffer, ptr, length);
        return { ptr: ptr, buffer: buffer }
    }

    static freeBuffer(data: any) {
        this._physX._free(data.ptr);
    }

}

Laya3D.PhysicsCreateUtil = new pxPhysicsCreateUtil()