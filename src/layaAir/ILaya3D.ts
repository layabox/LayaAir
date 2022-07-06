import { Scene3D } from "./laya/d3/core/scene/Scene3D";
import { MeshRenderDynamicBatchManager } from "./laya/d3/graphics/MeshRenderDynamicBatchManager";
import { MeshRenderStaticBatchManager } from "./laya/d3/graphics/MeshRenderStaticBatchManager";
import { Matrix4x4 } from "./laya/d3/math/Matrix4x4";
import { Laya3D } from "./Laya3D";
import { ShadowLightType } from "./laya/d3/shadowMap/ShadowCasterPass";
import { Physics3D } from "./laya/d3/Physics3D";
import { RenderElement } from "./laya/d3/core/render/RenderElement";
import { CommandBuffer } from "./laya/d3/core/render/command/CommandBuffer";
import { Camera } from "./laya/d3/core/Camera";
import { SubMeshRenderElement } from "./laya/d3/core/render/SubMeshRenderElement";
import { Shader3D } from "./laya/RenderEngine/RenderShader/Shader3D";

/**
 * @internal
 * 使用全局类的时候，避免引用其他模块
 */
export class ILaya3D {
    static Shader3D: typeof Shader3D = null;
    static Scene3D: typeof Scene3D = null;
    static MeshRenderStaticBatchManager: typeof MeshRenderStaticBatchManager = null;
    static MeshRenderDynamicBatchManager: typeof MeshRenderDynamicBatchManager = null;
    static Laya3D: typeof Laya3D = null;
    static Matrix4x4: typeof Matrix4x4 = null;
    static Physics3D: typeof Physics3D = null;
    static ShadowLightType: typeof ShadowLightType = null;
    static RenderElement: typeof RenderElement = null;
    static CommandBuffer: typeof CommandBuffer = null;
    static Camera: typeof Camera = null
    static SubMeshRenderElement: typeof SubMeshRenderElement = null;
}
