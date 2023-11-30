import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { IBaseRenderNode } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IBaseRenderNode";
import { ICameraCullInfo } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { ICullPass } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/ICullPass";
import { IRenderContext3D } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { IRenderElement } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { IRenderQueue } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderQueue";
import { ISceneRenderManager } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { IShadowCullInfo } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { ISortPass } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/ISortPass";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { Transform3D } from "../../d3/core/Transform3D";
import { IndexBuffer3D } from "../../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../d3/graphics/VertexBuffer3D";
import { Vector3 } from "../../maths/Vector3";


export interface IRenderEngine3DOBJFactory{
    createTransform(owner: Sprite3D): Transform3D;

    createBounds(min: Vector3, max: Vector3): any;

    createRenderElement(): IRenderElement;

    createSkinRenderElement(): IRenderElement;

    createInstanceRenderElement(): IRenderElement;

    createBaseRenderQueue(isTransparent: boolean): IRenderQueue;

    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean): VertexBuffer3D;

    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage, canRead: boolean): IndexBuffer3D;

    createSceneRenderManager(): ISceneRenderManager;

    createCullPass(): ICullPass;

    createSortPass(): ISortPass;

    createShadowCullInfo(): IShadowCullInfo;

    createCameraCullInfo(): ICameraCullInfo;

    createRenderGeometry(mode: MeshTopology, drayType: DrawType): IRenderGeometryElement;

    createBaseRenderNode(): IBaseRenderNode;

    createRenderContext3D(): IRenderContext3D;

}