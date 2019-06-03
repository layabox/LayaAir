import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { MeshRenderStaticBatchManager } from "laya/d3/graphics/MeshRenderStaticBatchManager";
import { MeshRenderDynamicBatchManager } from "laya/d3/graphics/MeshRenderDynamicBatchManager";
import { SubMeshDynamicBatch } from "laya/d3/graphics/SubMeshDynamicBatch";
import { Laya3D } from "Laya3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { CapsuleColliderShape } from "laya/d3/physics/shape/CapsuleColliderShape";
import { MeshColliderShape } from "laya/d3/physics/shape/MeshColliderShape";
import { ConeColliderShape } from "laya/d3/physics/shape/ConeColliderShape";
import { CylinderColliderShape } from "laya/d3/physics/shape/CylinderColliderShape";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Scene3DUtils } from "laya/d3/utils/Scene3DUtils";

/**
 * 使用全局类的时候，避免引用其他模块
 */
 export class ILaya3D{
     static Scene3D:typeof Scene3D = null;
     static MeshRenderStaticBatchManager:typeof MeshRenderStaticBatchManager = null;
     static MeshRenderDynamicBatchManager:typeof MeshRenderDynamicBatchManager = null;
     static SubMeshDynamicBatch:typeof SubMeshDynamicBatch = null;
     static Laya3D:typeof Laya3D = null;
     static BoxColliderShape:typeof BoxColliderShape = null;
     static SphereColliderShape:typeof SphereColliderShape = null;
     static CapsuleColliderShape:typeof CapsuleColliderShape = null;
     static MeshColliderShape:typeof MeshColliderShape = null;
     static ConeColliderShape:typeof ConeColliderShape = null;
     static CylinderColliderShape:typeof CylinderColliderShape = null;
     static CommandBuffer:typeof CommandBuffer = null;
     static Matrix4x4:typeof Matrix4x4 = null;
     static Scene3DUtils:typeof Scene3DUtils = null;
 }
 