import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { MeshRenderDynamicBatchManager } from "laya/d3/graphics/MeshRenderDynamicBatchManager";
import { MeshRenderStaticBatchManager } from "laya/d3/graphics/MeshRenderStaticBatchManager";
import { SubMeshDynamicBatch } from "laya/d3/graphics/SubMeshDynamicBatch";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Scene3DUtils } from "laya/d3/utils/Scene3DUtils";
import { Laya3D } from "Laya3D";

/**
 * 使用全局类的时候，避免引用其他模块
 */
 export class ILaya3D{
     static Scene3D:typeof Scene3D = null;
     static MeshRenderStaticBatchManager:typeof MeshRenderStaticBatchManager = null;
     static MeshRenderDynamicBatchManager:typeof MeshRenderDynamicBatchManager = null;
     static SubMeshDynamicBatch:typeof SubMeshDynamicBatch = null;
     static Laya3D:typeof Laya3D = null;
     static CommandBuffer:typeof CommandBuffer = null;
     static Matrix4x4:typeof Matrix4x4 = null;
 }
 