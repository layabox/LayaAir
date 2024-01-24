import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderGeometryElement } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { ISceneRenderManager } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";

import { IndexBuffer3D } from "../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../graphics/VertexBuffer3D";


export interface IRenderEngine3DOBJFactory {


    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean): VertexBuffer3D;

    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage, canRead: boolean): IndexBuffer3D;

    createSceneRenderManager(): ISceneRenderManager;

    createRenderGeometry(mode: MeshTopology, drayType: DrawType): IRenderGeometryElement;
}