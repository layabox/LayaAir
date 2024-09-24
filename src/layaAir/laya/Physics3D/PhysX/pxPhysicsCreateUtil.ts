import { Laya3D } from "../../../Laya3D";
import { PhysicsSettings } from "../../d3/physics/PhysicsSettings";
import { ICharacterController } from "../interface/ICharacterController";
import { IDynamicCollider } from "../interface/IDynamicCollider";
import { IPhysicsCreateUtil } from "../interface/IPhysicsCreateUtil";
import { IStaticCollider } from "../interface/IStaticCollider";
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


/**
 * @en PhysX physics creation utility class
 * @zh PhysX物理创建工具类
 */
export class pxPhysicsCreateUtil implements IPhysicsCreateUtil {
    static _physXPVD: boolean = false;
    static _PxPvdPort: any = 5425;
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

    /**
     * @en Initialize physics capabilities
     * @zh 初始化物理能力
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

    /**
     * @en Get the capability status of a specific physics feature.
     * @param value The physics capability to query.
     * @returns Whether the specified physics capability is available.
     * @zh 获取特定物理功能的能力状态。
     * @param value 要查询的物理能力。
     * @returns 指定的物理能力是否可用。
     */
    getPhysicsCapable(value: EPhysicsCapable): boolean {
        return this._physicsEngineCapableMap.get(value);
    }

    /**
     * @en Initialize the physics engine.
     * @returns A promise that resolves when initialization is complete.
     * @zh 初始化物理引擎。
     * @returns 当初始化完成时解析的Promise。
     */
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

    /**
     * @en Enable PhysX PVD (PhysX Visual Debugger) using Socket transport.
     * @param physX The PhysX instance.
     * @param pxFoundation The PhysX foundation instance.
     * @zh 使用Socket传输启用PhysX PVD（PhysX可视化调试器）。
     * @param physX PhysX实例。
     * @param pxFoundation PhysX foundation实例。
     */
    _physxPVDSocketConnect(physX: any, pxFoundation: any): any {
        var socket: WebSocket;
        var queue: any = [];
        const pvdTransport = physX.PxPvdTransport.implement({
            connect: function () {
                let url = 'ws://127.0.0.1:' + pxPhysicsCreateUtil._PxPvdPort;
                socket = new WebSocket(url, ['binary'])
                socket.onopen = (e) => {
                    console.log('Connected to PhysX Debugger');
                    //@ts-ignore
                    queue.forEach(data => socket.send(data));
                    queue = []
                }
                socket.onclose = () => {
                }
                return true
            },
            disconnect: function () {
                console.log("Socket disconnect")
            },
            isConnected: function () {
            },
            write: function (inBytes: any, inLength: any) {
                const data = physX.HEAPU8.slice(inBytes, inBytes + inLength)
                if (socket.readyState === WebSocket.OPEN) {
                    if (queue.length) {
                        //@ts-ignore
                        queue.forEach(data => socket.send(data));
                        queue.length = 0;
                    }
                    socket.send(data);
                } else {
                    queue.push(data);
                }
                return true;
            }
        })

        const gPvd = physX.PxCreatePvd(pxFoundation);
        let socketsuccess = physX.MyCreatepvdTransport(pvdTransport, gPvd);
        // console.log("PVD connect is " + socketsuccess);
        pxPhysicsCreateUtil._pvd = gPvd;
        pxPhysicsCreateUtil._PxPvdTransport = pvdTransport;
        return gPvd;
    }

    private _init(physX: any): void {
        const version = physX.PX_PHYSICS_VERSION;
        const defaultErrorCallback = new physX.PxDefaultErrorCallback();
        const allocator = new physX.PxDefaultAllocator();
        const pxFoundation = physX.PxCreateFoundation(version, allocator, defaultErrorCallback);
        pxPhysicsCreateUtil._tolerancesScale = new physX.PxTolerancesScale();
        let pxPhysics;
        if (pxPhysicsCreateUtil._physXPVD) {
            let gPvd = this._physxPVDSocketConnect(physX, pxFoundation);
            pxPhysics = physX.CreatePVDPhysics(pxFoundation, pxPhysicsCreateUtil._tolerancesScale, true, gPvd);
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

    /**
     * @en Create a physics manager.
     * @param physicsSettings The physics settings.
     * @returns A new physics manager instance.
     * @zh 创建物理管理器。
     * @param physicsSettings 物理设置。
     * @returns 新的物理管理器实例。
     */
    createPhysicsManger(physicsSettings: PhysicsSettings): pxPhysicsManager {
        return new pxPhysicsManager(physicsSettings);
    }

    /**
     * @en Create a dynamic collider.
     * @param manager The physics manager.
     * @returns A new dynamic collider instance.
     * @zh 创建动态碰撞器。
     * @param manager 物理管理器。
     * @returns 新的动态碰撞器实例。
     */
    createDynamicCollider(manager: pxPhysicsManager): IDynamicCollider {
        return new pxDynamicCollider(manager);
    }

    /**
     * @en Create a static collider.
     * @param manager The physics manager.
     * @returns A new static collider instance.
     * @zh 创建静态碰撞器。
     * @param manager 物理管理器。
     * @returns 新的静态碰撞器实例。
     */
    createStaticCollider(manager: pxPhysicsManager): IStaticCollider {
        return new pxStaticCollider(manager);
    }

    /**
     * @en Create a character controller.
     * @param manager The physics manager.
     * @returns A new character controller instance.
     * @zh 创建角色控制器。
     * @param manager 物理管理器。
     * @returns 新的角色控制器实例。
     */
    createCharacterController(manager: pxPhysicsManager): ICharacterController {
        return new pxCharactorCollider(manager);
    }

    /**
     * @en Create a fixed joint.
     * @param manager The physics manager.
     * @returns A new fixed joint instance.
     * @zh 创建固定关节。
     * @param manager 物理管理器。
     * @returns 新的固定关节实例。
     */
    createFixedJoint(manager: pxPhysicsManager): IFixedJoint {
        return new pxFixedJoint(manager);
    }

    /**
     * @en Create a hinge joint.
     * @param manager The physics manager.
     * @returns A new hinge joint instance.
     * @zh 创建铰链关节。
     * @param manager 物理管理器。
     * @returns 新的铰链关节实例。
     */
    createHingeJoint(manager: pxPhysicsManager): IHingeJoint {
        return new pxRevoluteJoint(manager);
    }

    /**
     * @en Create a spring joint.
     * @param manager The physics manager.
     * @returns A new spring joint instance.
     * @zh 创建弹簧关节。
     * @param manager 物理管理器。
     * @returns 新的弹簧关节实例。
     */
    createSpringJoint(manager: pxPhysicsManager): ISpringJoint {
        return new pxDistanceJoint(manager);
    }

    /**
     * @en Create a D6 joint.
     * @param manager The physics manager.
     * @returns A new D6 joint instance.
     * @zh 创建D6关节。
     * @param manager 物理管理器。
     * @returns 新的D6关节实例。
     */
    createD6Joint(manager: pxPhysicsManager): ID6Joint {
        return new pxD6Joint(manager);
    }

    /**
     * @en Create a box collider shape.
     * @returns A new box collider shape instance.
     * @zh 创建盒子碰撞器形状。
     * @returns 新的盒子碰撞器形状实例。
     */
    createBoxColliderShape(): IBoxColliderShape {
        return new pxBoxColliderShape();
    }

    /**
     * @en Create a sphere collider shape.
     * @returns A new sphere collider shape instance.
     * @zh 创建球体碰撞器形状。
     * @returns 新的球体碰撞器形状实例。
     */
    createSphereColliderShape(): ISphereColliderShape {
        return new pxSphereColliderShape();
    }

    /**
     * @en Create a plane collider shape.
     * @zh 创建平面碰撞器形状。
     */
    createPlaneColliderShape(): IPlaneColliderShape {
        return null;
    }

    /**
     * @en Create a capsule collider shape.
     * @returns A new capsule collider shape instance.
     * @zh 创建胶囊碰撞器形状。
     * @returns 新的胶囊碰撞器形状实例。
     */
    createCapsuleColliderShape?(): ICapsuleColliderShape {
        return new pxCapsuleColliderShape();
    }

    /**
     * @en Create a mesh collider shape.
     * @returns A new mesh collider shape instance.
     * @zh 创建网格碰撞器形状。
     * @returns 新的网格碰撞器形状实例。
     */
    createMeshColliderShape?(): IMeshColliderShape {
        return new pxMeshColliderShape();
    }

    /**
     * @en Create a cylinder collider shape.
     * @zh 创建圆柱体碰撞器形状。
     */
    createCylinderColliderShape?(): ICylinderColliderShape {
        return null;
    }

    /**
     * @en Create a cone collider shape.
     * @zh 创建圆锥体碰撞器形状。
     */
    createConeColliderShape?(): IConeColliderShape {
        return null;
    }

    /**
     * @en Create a height field shape.
     * @returns A new height field shape instance.
     * @zh 创建高度场形状。
     * @returns 新的高度场形状实例。
     */
    createHeightFieldShape(): pxHeightFieldShape {
        return new pxHeightFieldShape();
    }

    /**
     * @en Create a convex mesh from a given mesh.
     * @param mesh The input mesh.
     * @zh 从给定的网格创建凸包网格。
     * @param mesh 输入的网格。
     */
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

    /**
     * @en Create a Float32Array with allocated memory.
     * @param length The length of the array.
     * @zh 创建具有分配内存的Float32Array。
     * @param length 数组的长度。
     */
    static createFloat32Array(length: number): { ptr: number, buffer: Float32Array } {
        let ptr = this._physX._malloc(4 * length);
        const buffer = new Float32Array(this._physX.HEAPF32.buffer, ptr, length);
        return { ptr: ptr, buffer: buffer }
    }

    /**
     * @en Create a Uint32Array with allocated memory.
     * @param length The length of the array.
     * @zh 创建具有分配内存的Uint32Array。
     * @param length 数组的长度。
     */
    static createUint32Array(length: number): { ptr: number, buffer: Uint32Array } {
        let ptr = this._physX._malloc(4 * length);
        const buffer = new Uint32Array(this._physX.HEAPU32.buffer, ptr, length);
        return { ptr: ptr, buffer: buffer }
    }
    /**
     * @en Create a Uint16Array with allocated memory.
     * @param length The length of the array.
     * @zh 创建具有分配内存的Uint16Array。
     * @param length 数组的长度。
     */
    static createUint16Array(length: number): { ptr: number, buffer: Uint16Array } {
        let ptr = this._physX._malloc(2 * length);
        const buffer = new Uint16Array(this._physX.HEAPU16.buffer, ptr, length);
        return { ptr: ptr, buffer: buffer }
    }
    /**
     * @en Create a Uint8Array with allocated memory.
     * @param length The length of the array.
     * @zh 创建具有分配内存的Uint8Array。
     * @param length 数组的长度。
     */
    static createUint8Array(length: number): { ptr: number, buffer: Uint8Array } {
        let ptr = this._physX._malloc(length);
        const buffer = new Uint8Array(this._physX.HEAPU8.buffer, ptr, length);
        return { ptr: ptr, buffer: buffer }
    }
    /**
     * @en Free the allocated memory for a buffer.
     * @param data The buffer object to free.
     * @zh 释放为缓冲区分配的内存。
     * @param data 要释放的缓冲区对象。
     */
    static freeBuffer(data: any) {
        this._physX._free(data.ptr);
    }

}

Laya3D.PhysicsCreateUtil = new pxPhysicsCreateUtil()