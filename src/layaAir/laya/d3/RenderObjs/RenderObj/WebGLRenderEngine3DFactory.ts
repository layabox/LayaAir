import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { ICameraCullInfo } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { ISceneRenderManager } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { Vector3 } from "../../../maths/Vector3";
import { IRenderContext3D } from "../../RenderDriverLayer/IRenderContext3D";
import { IBaseRenderNode } from "../../RenderDriverLayer/Render3DNode/IBaseRenderNode";
import { Sprite3D } from "../../core/Sprite3D";
import { Transform3D } from "../../core/Transform3D";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { BoundsImpl } from "../../math/BoundsImpl";
import { IRenderEngine3DOBJFactory } from "../IRenderEngine3DOBJFactory";
import { Laya3DRender } from "../Laya3DRender";
import { GLESRenderContext3D } from "../WebGLOBJ/GLESRenderContext3D";
import { GLESBaseRenderNode } from "../WebGLOBJ/Render3DNode/GLESBaseRenderNode";
import { CameraCullInfo } from "./CameraCullInfo";
import { InstanceRenderElementOBJ } from "./InstanceRenderElementOBJ";
import { RenderElementOBJ } from "./RenderElementOBJ";
import { RenderGeometryElementOBJ } from "./RenderGeometryElementOBJ";
import { SceneRenderManagerOBJ } from "./SceneRenderManagerOBJ";
import { ShadowCullInfo } from "./ShadowCullInfo";
import { SkinRenderElementOBJ } from "./SkinRenderElementOBJ";

export class WebGLRenderEngine3DFactory implements IRenderEngine3DOBJFactory{
    createTransform(owner: Sprite3D): Transform3D {
        return new Transform3D(owner);
    }

    createBounds(min: Vector3, max: Vector3): any {
        return new BoundsImpl(min, max);
    }

    createRenderElement(): IRenderElement {
        return new RenderElementOBJ();
    }

    createSkinRenderElement(): IRenderElement {
        return new SkinRenderElementOBJ();
    }
    createInstanceRenderElement() {
        return new InstanceRenderElementOBJ();
    }


    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean = false) {
        return new VertexBuffer3D(byteLength, bufferUsage, canRead);
    }

    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage = BufferUsage.Static, canRead: boolean = false): IndexBuffer3D {
        return new IndexBuffer3D(indexType, indexCount, bufferUsage, canRead);
    }

    createSceneRenderManager(): ISceneRenderManager {
        return new SceneRenderManagerOBJ();
    }

    createCameraCullInfo(): ICameraCullInfo {
        return new CameraCullInfo();
    }

    createRenderGeometry(mode: MeshTopology, drayType: DrawType): IRenderGeometryElement {
        return new RenderGeometryElementOBJ(mode, drayType);
    }

    createBaseRenderNode(): IBaseRenderNode {
        return new GLESBaseRenderNode();
    }

    createRenderContext3D(): IRenderContext3D {
        return new GLESRenderContext3D();
    }


}
Laya3DRender.renderOBJCreate =new WebGLRenderEngine3DFactory();