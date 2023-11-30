import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderGeometryElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { IRenderQueue } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderQueue";
import { Vector3 } from "../../../maths/Vector3";
import { Sprite3D } from "../../core/Sprite3D";
import { Transform3D } from "../../core/Transform3D";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { BoundsImpl } from "../../math/BoundsImpl";
import { IRenderEngine3DOBJFactory } from "../IRenderEngine3DOBJFactory";
import { BaseRenderNode } from "../RenderObj/BaseRenderNode";
import { BaseRenderQueue } from "../RenderObj/BaseRenderQueue";
import { CameraCullInfo } from "../RenderObj/CameraCullInfo";
import { CullPassBase } from "../RenderObj/CullPass";
import { InstanceRenderElementOBJ } from "../RenderObj/InstanceRenderElementOBJ";
import { QuickSort } from "../RenderObj/QuickSort";
import { RenderGeometryElementOBJ } from "../RenderObj/RenderGeometryElementOBJ";
import { SceneRenderManagerOBJ } from "../RenderObj/SceneRenderManagerOBJ";
import { ShadowCullInfo } from "../RenderObj/ShadowCullInfo";
import { SkinRenderElementOBJ } from "../RenderObj/SkinRenderElementOBJ";
import { WGPURenderContext3D } from "./WGPURenderContext3D";
import { WGPURenderElementObJ } from "./WGPURenderElementObJ";

export class WGPURenderEngine3DOBJFactory implements IRenderEngine3DOBJFactory{
    createTransform(owner: Sprite3D): Transform3D {
        return new Transform3D(owner);
    }

    createBounds(min: Vector3, max: Vector3): any {
        return new BoundsImpl(min, max);
    }

    createRenderElement(): WGPURenderElementObJ {
        return new WGPURenderElementObJ();
    }

    createSkinRenderElement(): SkinRenderElementOBJ {//TODO
        return new SkinRenderElementOBJ();
    }

    createInstanceRenderElement() {//TODO
        return new InstanceRenderElementOBJ();
    }

    createBaseRenderQueue(isTransparent: boolean): IRenderQueue {
        var queue: BaseRenderQueue = new BaseRenderQueue(isTransparent);
        queue.sortPass = this.createSortPass();
        return queue;
    }

    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean = false) {
        return new VertexBuffer3D(byteLength, bufferUsage, canRead);
    }

    
    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage = BufferUsage.Static, canRead: boolean = false): IndexBuffer3D {
        return new IndexBuffer3D(indexType, indexCount, bufferUsage, canRead);
    }

    
    createSceneRenderManager(): SceneRenderManagerOBJ {
        return new SceneRenderManagerOBJ();
    }

    createCullPass(): CullPassBase {
        return new CullPassBase();
    }

       
    createSortPass(): QuickSort {
        return new QuickSort();
    }

    
    createShadowCullInfo(): ShadowCullInfo {
        return new ShadowCullInfo();
    }

    createCameraCullInfo(): CameraCullInfo {
        return new CameraCullInfo();
    }
    
    createRenderGeometry(mode: MeshTopology, drayType: DrawType): IRenderGeometryElement {
        return new RenderGeometryElementOBJ(mode, drayType);
    }

    createBaseRenderNode(): BaseRenderNode {
        return new BaseRenderNode();
    }

    createRenderContext3D(): WGPURenderContext3D {
        return new WGPURenderContext3D();
    }
}