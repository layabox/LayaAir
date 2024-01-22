import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { Vector3 } from "../../../maths/Vector3";
import { IRenderEngine3DOBJFactory } from "../../RenderDriverLayer/IRenderEngine3DOBJFactory";
import { ICameraNodeData, ISceneNodeData } from "../../RenderDriverLayer/RenderModuleData/IModuleData";
import { ISpotLightData } from "../../RenderDriverLayer/RenderModuleData/ISpotLightData";
import { Sprite3D } from "../../core/Sprite3D";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { SceneRenderManagerOBJ } from "../RenderObj/SceneRenderManagerOBJ";
import { RTRenderContext3D } from "../RuntimeOBJ/RTRenderContext3D";
import { RTBaseRenderNode } from "../RuntimeOBJ/Render3DNode/RTBaseRenderNode";
import { RTMeshRenderNode } from "../RuntimeOBJ/Render3DNode/RTMeshRenderNode";
import { RTDirectLight } from "../RuntimeOBJ/RenderModuleData/RTDirectLight";
import { RTSpotLight } from "../RuntimeOBJ/RenderModuleData/RTSpotLight"
import { RTLightmapData } from "../RuntimeOBJ/RenderModuleData/RTLightmap";
import { RTCameraNodeData, RTSceneNodeData } from "../RuntimeOBJ/RenderModuleData/RTModuleData";
import { RTReflectionProb } from "../RuntimeOBJ/RenderModuleData/RTReflectionProb";
import { RTVolumetricGI } from "../RuntimeOBJ/RenderModuleData/RTVolumetricGI";
import { NativeBounds } from "./NativeBounds";
import { NativeIndexBuffer3D } from "./NativeIndexBuffer3D";
import { NativeRenderElementOBJ } from "./NativeRenderElementOBJ";
import { NativeRenderGeometryElementOBJ } from "./NativeRenderGeometryElementOBJ";
import { NativeTransform3D } from "./NativeTransform3D";
import { NativeVertexBuffer3D } from "./NativeVertexBuffer3D";

export class NativeGLRenderEngine3DOBJFactory implements IRenderEngine3DOBJFactory {
    createTransform(owner: Sprite3D): NativeTransform3D {
        return new NativeTransform3D(owner);
    }
    createBounds(min: Vector3, max: Vector3): NativeBounds {
        return new NativeBounds(min, max);
    }
    createRenderElement(): NativeRenderElementOBJ {
        return new NativeRenderElementOBJ();
    }
    createSkinRenderElement(): IRenderElement {
        return null;//TODO
    }
    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean): VertexBuffer3D {
        return new NativeVertexBuffer3D(byteLength, bufferUsage, canRead);
    }
    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage, canRead: boolean): IndexBuffer3D {
        return new NativeIndexBuffer3D(indexType, indexCount, bufferUsage, canRead);
    }
    createSceneRenderManager(): SceneRenderManagerOBJ {
        return new SceneRenderManagerOBJ();
    }
    createRenderGeometry(mode: MeshTopology, drayType: DrawType): NativeRenderGeometryElementOBJ {
        return new NativeRenderGeometryElementOBJ(mode, drayType);
    }
    createBaseRenderNode(): RTBaseRenderNode {
        return new RTBaseRenderNode();
    }
    createMeshRenderNode(): RTMeshRenderNode {
        return new RTMeshRenderNode();
    }
    createRenderContext3D(): RTRenderContext3D {
        return new RTRenderContext3D()
    }
    createVolumetricGI(): RTVolumetricGI {
        return new RTVolumetricGI();
    }
    createReflectionProbe(): RTReflectionProb {
        return new RTReflectionProb();
    }
    createLightmapData(): RTLightmapData {
        return new RTLightmapData();
    }
    createDirectLight(): RTDirectLight {
        return new RTDirectLight();
    }
    createSpotLight(): ISpotLightData {
        return new RTSpotLight();
    }
    createCameraModuleData(): ICameraNodeData {
        return new RTCameraNodeData();
    }
    createSceneModuleData(): ISceneNodeData {
        return new RTSceneNodeData();
    }

}