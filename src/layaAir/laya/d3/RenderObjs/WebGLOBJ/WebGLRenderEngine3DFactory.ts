import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { ISceneRenderManager } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { Vector3 } from "../../../maths/Vector3";
import { IRenderContext3D } from "../../RenderDriverLayer/IRenderContext3D";
import { IBaseRenderNode } from "../../RenderDriverLayer/Render3DNode/IBaseRenderNode";
import { IMeshRenderNode } from "../../RenderDriverLayer/Render3DNode/IMeshRenderNode";
import { IDirectLightData } from "../../RenderDriverLayer/RenderModuleData/IDirectLightData";
import { ICameraNodeData, ISceneNodeData } from "../../RenderDriverLayer/RenderModuleData/IModuleData";
import { IReflectionProbeData } from "../../RenderDriverLayer/RenderModuleData/IReflectionProbeData";
import { ISpotLightData } from "../../RenderDriverLayer/RenderModuleData/ISpotLightData";
import { IVolumetricGIData } from "../../RenderDriverLayer/RenderModuleData/IVolumetricGIData";
import { Sprite3D } from "../../core/Sprite3D";
import { Transform3D } from "../../core/Transform3D";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { BoundsImpl } from "../../math/BoundsImpl";
import { IRenderEngine3DOBJFactory } from "../../RenderDriverLayer/IRenderEngine3DOBJFactory";
import { Laya3DRender } from "../Laya3DRender";
import { GLESRenderContext3D } from "./GLESRenderContext3D";
import { GLESBaseRenderNode } from "./Render3DNode/GLESBaseRenderNode";
import { GLESMeshRenderNode } from "./Render3DNode/GLESMeshRenderNode";
import { GLESDirectLight } from "./RenderModuleData/GLESDirectLight";
import { GLESCameraNodeData, GLESSceneNodeData } from "./RenderModuleData/GLESModuleData";
import { GLESReflectionProbe } from "./RenderModuleData/GLESReflectionProb";
import { GLESSpotLight } from "./RenderModuleData/GLESSpotLight";
import { GLESVolumetricGI } from "./RenderModuleData/GLESVolumetricGI";
import { InstanceRenderElementOBJ } from "../RenderObj/InstanceRenderElementOBJ";
import { RenderGeometryElementOBJ } from "./RenderGeometryElementOBJ";
import { SceneRenderManagerOBJ } from "../RenderObj/SceneRenderManagerOBJ";
import { SkinRenderElementOBJ } from "../RenderObj/SkinRenderElementOBJ";
import { GLESRenderElementOBJ } from "./GLESRenderElementOBJ";
import { ILightMapData } from "../../RenderDriverLayer/RenderModuleData/ILightMapData";
import { GLESLightmap } from "./RenderModuleData/GLESLightmap";

export class WebGLRenderEngine3DFactory implements IRenderEngine3DOBJFactory {
    createLightmapData(): ILightMapData {
        return new GLESLightmap();
    }
    createCameraModuleData(): ICameraNodeData {
        return new GLESCameraNodeData();
    }
    createSceneModuleData(): ISceneNodeData {
        return new GLESSceneNodeData();
    }

    createTransform(owner: Sprite3D): Transform3D {
        return new Transform3D(owner);
    }

    createBounds(min: Vector3, max: Vector3): any {
        return new BoundsImpl(min, max);
    }

    createRenderElement(): IRenderElement {
        return new GLESRenderElementOBJ();
    }

    createSkinRenderElement(): IRenderElement {
        return new SkinRenderElementOBJ();
    }

    // createInstanceRenderElement() {
    //     return new InstanceRenderElementOBJ();
    // }

    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean = false) {
        return new VertexBuffer3D(byteLength, bufferUsage, canRead);
    }

    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage = BufferUsage.Static, canRead: boolean = false): IndexBuffer3D {
        return new IndexBuffer3D(indexType, indexCount, bufferUsage, canRead);
    }

    createSceneRenderManager(): ISceneRenderManager {
        return new SceneRenderManagerOBJ();
    }

    createRenderGeometry(mode: MeshTopology, drayType: DrawType): IRenderGeometryElement {
        return new RenderGeometryElementOBJ(mode, drayType);
    }

    createBaseRenderNode(): IBaseRenderNode {
        return new GLESBaseRenderNode();
    }

    createMeshRenderNode(): IMeshRenderNode {
        return new GLESMeshRenderNode();
    }

    createRenderContext3D(): IRenderContext3D {
        return new GLESRenderContext3D();
    }

    createVolumetricGI(): IVolumetricGIData {
        return new GLESVolumetricGI();
    }
    createReflectionProbe(): GLESReflectionProbe {
        return new GLESReflectionProbe();
    }
    createDirectLight(): GLESDirectLight {
        return new GLESDirectLight();
    }
    createSpotLight(): ISpotLightData {
        return new GLESSpotLight();
    }


}
Laya3DRender.renderOBJCreate = new WebGLRenderEngine3DFactory();