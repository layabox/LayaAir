import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { ISceneRenderManager } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { Vector3 } from "../../../maths/Vector3";
import { IRenderContext3D } from "../../RenderDriverLayer/IRenderContext3D";
import { IRenderEngine3DOBJFactory } from "../../RenderDriverLayer/IRenderEngine3DOBJFactory";
import { IBaseRenderNode } from "../../RenderDriverLayer/Render3DNode/IBaseRenderNode";
import { IMeshRenderNode } from "../../RenderDriverLayer/Render3DNode/IMeshRenderNode";
import { IDirectLightData } from "../../RenderDriverLayer/RenderModuleData/IDirectLightData";
import { ILightMapData } from "../../RenderDriverLayer/RenderModuleData/ILightMapData";
import { ICameraNodeData, ISceneNodeData } from "../../RenderDriverLayer/RenderModuleData/IModuleData";
import { IReflectionProbeData } from "../../RenderDriverLayer/RenderModuleData/IReflectionProbeData";
import { ISpotLightData } from "../../RenderDriverLayer/RenderModuleData/ISpotLightData";
import { IVolumetricGIData } from "../../RenderDriverLayer/RenderModuleData/IVolumetricGIData";
import { Sprite3D } from "../../core/Sprite3D";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { NativeRenderElementOBJ } from "./NativeRenderElementOBJ";
import { NativeTransform3D } from "./NativeTransform3D";

export class NativeGLRenderEngine3DOBJFactory implements IRenderEngine3DOBJFactory{
    createTransform(owner: Sprite3D): NativeTransform3D {
      return new NativeTransform3D(owner);
    }
    createBounds(min: Vector3, max: Vector3) {
        throw new Error("Method not implemented.");
    }
    createRenderElement(): NativeRenderElementOBJ {
       return new NativeRenderElementOBJ();
    }
    createSkinRenderElement(): IRenderElement {
       return null;//TODO
    }
    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean): VertexBuffer3D {
        throw new Error("Method not implemented.");
    }
    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage, canRead: boolean): IndexBuffer3D {
        throw new Error("Method not implemented.");
    }
    createSceneRenderManager(): ISceneRenderManager {
        throw new Error("Method not implemented.");
    }
    createRenderGeometry(mode: MeshTopology, drayType: DrawType): IRenderGeometryElement {
        throw new Error("Method not implemented.");
    }
    createBaseRenderNode(): IBaseRenderNode {
        throw new Error("Method not implemented.");
    }
    createMeshRenderNode(): IMeshRenderNode {
        throw new Error("Method not implemented.");
    }
    createRenderContext3D(): IRenderContext3D {
        throw new Error("Method not implemented.");
    }
    createVolumetricGI(): IVolumetricGIData {
        throw new Error("Method not implemented.");
    }
    createReflectionProbe(): IReflectionProbeData {
        throw new Error("Method not implemented.");
    }
    createLightmapData(): ILightMapData {
        throw new Error("Method not implemented.");
    }
    createDirectLight(): IDirectLightData {
        throw new Error("Method not implemented.");
    }
    createSpotLight(): ISpotLightData {
        throw new Error("Method not implemented.");
    }
    createCameraModuleData(): ICameraNodeData {
        throw new Error("Method not implemented.");
    }
    createSceneModuleData(): ISceneNodeData {
        throw new Error("Method not implemented.");
    }
  
}