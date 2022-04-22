import { Bounds } from "../../d3/core/Bounds";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { Transform3D } from "../../d3/core/Transform3D";
import { IndexBuffer3D } from "../../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../d3/graphics/VertexBuffer3D";
import { BoundSphere } from "../../d3/math/BoundSphere";
import { Plane } from "../../d3/math/Plane";
import { Vector3 } from "../../d3/math/Vector3";
import { Resource } from "../../resource/Resource";
import { BufferUsage } from "../RenderEnum/BufferTargetType";
import { DrawType } from "../RenderEnum/DrawType";
import { IndexFormat } from "../RenderEnum/IndexFormat";
import { MeshTopology } from "../RenderEnum/RenderPologyMode";
import { ShaderData } from "../RenderShader/ShaderData";
import { IBaseRenderNode } from "./RenderPipelineInterface/IBaseRenderNode";
import { ICullPass } from "./RenderPipelineInterface/ICullPass";
import { IRenderContext3D } from "./RenderPipelineInterface/IRenderContext3D";
import { IRenderElement } from "./RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "./RenderPipelineInterface/IRenderGeometryElement";
import { IRenderQueue } from "./RenderPipelineInterface/IRenderQueue";
import { ISceneRenderManager } from "./RenderPipelineInterface/ISceneRenderManager";

export interface IRenderOBJCreate{
    createTransform(owner:Sprite3D):Transform3D;

    createBounds(min:Vector3,max:Vector3):Bounds;

    createBoundsSphere(center:Vector3,radius:number):BoundSphere;

    createPlane(normal:Vector3,d:number):Plane;

    createShaderData(ownerResource: Resource):ShaderData;

    createRenderElement():IRenderElement;

    createSkinRenderElement():IRenderElement;

    createBaseRenderQueue(isTransparent:boolean):IRenderQueue;

    createRenderGeometry(mode:MeshTopology,drayType:DrawType):IRenderGeometryElement;

    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean):VertexBuffer3D;

    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage, canRead: boolean):IndexBuffer3D;

    createBaseRenderNode():IBaseRenderNode;

    createRenderContext3D():IRenderContext3D;

    createSceneRenderManager():ISceneRenderManager;

    createCullPass():ICullPass;
}