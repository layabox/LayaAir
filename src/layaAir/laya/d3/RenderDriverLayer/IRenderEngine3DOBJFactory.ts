import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderElement } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { ISceneRenderManager } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { Sprite3D } from "../core/Sprite3D";
import { Transform3D } from "../core/Transform3D";
import { IndexBuffer3D } from "../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../graphics/VertexBuffer3D";
import { Vector3 } from "../../maths/Vector3";
import { IRenderContext3D } from "./IRenderContext3D";
import { IBaseRenderNode } from "./Render3DNode/IBaseRenderNode";
import { IMeshRenderNode } from "./Render3DNode/IMeshRenderNode";
import { IDirectLightData } from "./RenderModuleData/IDirectLightData";
import { ICameraNodeData, ISceneNodeData } from "./RenderModuleData/IModuleData";
import { IReflectionProbeData } from "./RenderModuleData/IReflectionProbeData";
import { ISpotLightData } from "./RenderModuleData/ISpotLightData";
import { IVolumetricGIData } from "./RenderModuleData/IVolumetricGIData";
import { ILightMapData } from "./RenderModuleData/ILightMapData";


export interface IRenderEngine3DOBJFactory {
    createTransform(owner: Sprite3D): Transform3D;

    createBounds(min: Vector3, max: Vector3): any;

    createRenderElement(): IRenderElement;

    createSkinRenderElement(): IRenderElement;

   // createInstanceRenderElement(): IRenderElement;

    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean): VertexBuffer3D;

    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage, canRead: boolean): IndexBuffer3D;

    createSceneRenderManager(): ISceneRenderManager;

    createRenderGeometry(mode: MeshTopology, drayType: DrawType): IRenderGeometryElement;

    createBaseRenderNode(): IBaseRenderNode;

    createMeshRenderNode(): IMeshRenderNode;

    createRenderContext3D(): IRenderContext3D;

    createVolumetricGI(): IVolumetricGIData;

    createReflectionProbe(): IReflectionProbeData;

    createLightmapData():ILightMapData;

    createDirectLight(): IDirectLightData;

    createSpotLight(): ISpotLightData;

    createCameraModuleData(): ICameraNodeData;

    createSceneModuleData(): ISceneNodeData;

}