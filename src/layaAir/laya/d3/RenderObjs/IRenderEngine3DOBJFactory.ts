import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderElement } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { ISceneRenderManager } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { Transform3D } from "../../d3/core/Transform3D";
import { IndexBuffer3D } from "../../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../d3/graphics/VertexBuffer3D";
import { Vector3 } from "../../maths/Vector3";
import { IRenderContext3D } from "../RenderDriverLayer/IRenderContext3D";
import { IBaseRenderNode } from "../RenderDriverLayer/Render3DNode/IBaseRenderNode";
import { IMeshRenderNode } from "../RenderDriverLayer/Render3DNode/IMeshRenderNode";
import { IDirectLightData } from "../RenderDriverLayer/RenderModuleData/IDirectLightData";
import { ICameraNodeData, ISceneNodeData } from "../RenderDriverLayer/RenderModuleData/IModuleData";
import { IReflectionProbeData } from "../RenderDriverLayer/RenderModuleData/IReflectionProbeData";
import { ISpotLightData } from "../RenderDriverLayer/RenderModuleData/ISpotLightData";
import { IVolumetricGIData } from "../RenderDriverLayer/RenderModuleData/IVolumetricGIData";


export interface IRenderEngine3DOBJFactory {
    createTransform(owner: Sprite3D): Transform3D;

    createBounds(min: Vector3, max: Vector3): any;

    createRenderElement(): IRenderElement;

    createSkinRenderElement(): IRenderElement;

    createInstanceRenderElement(): IRenderElement;

    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean): VertexBuffer3D;

    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage, canRead: boolean): IndexBuffer3D;

    createSceneRenderManager(): ISceneRenderManager;

    createRenderGeometry(mode: MeshTopology, drayType: DrawType): IRenderGeometryElement;

    createBaseRenderNode(): IBaseRenderNode;

    createMeshRenderNode(): IMeshRenderNode;

    createRenderContext3D(): IRenderContext3D;

    createVolumetricGI(): IVolumetricGIData;

    createReflectionProbe(): IReflectionProbeData;

    createDirectLight(): IDirectLightData;

    createSpotLight(): ISpotLightData;

    createCameraModuleData(): ICameraNodeData;

    createSceneModuleData(): ISceneNodeData;

}