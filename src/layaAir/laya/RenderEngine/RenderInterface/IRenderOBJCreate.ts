import { Config } from "../../../Config";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { Transform3D } from "../../d3/core/Transform3D";
import { IndexBuffer3D } from "../../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../d3/graphics/VertexBuffer3D";
import { Vector3 } from "../../maths/Vector3";
import { Resource } from "../../resource/Resource";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../webgl/utils/ShaderCompileDefineBase";
import { CommandUniformMap } from "../CommandUniformMap";
import { BufferUsage } from "../RenderEnum/BufferTargetType";
import { DrawType } from "../RenderEnum/DrawType";
import { IndexFormat } from "../RenderEnum/IndexFormat";
import { MeshTopology } from "../RenderEnum/RenderPologyMode";
import { RenderState } from "../RenderShader/RenderState";
import { ShaderData } from "../RenderShader/ShaderData";
import { RenderStateCommand } from "../RenderStateCommand";
import { UniformBufferObject } from "../UniformBufferObject";
import { IRenderEngine } from "./IRenderEngine";
import { IBaseRenderNode } from "./RenderPipelineInterface/IBaseRenderNode";
import { ICameraCullInfo } from "./RenderPipelineInterface/ICameraCullInfo";
import { ICullPass } from "./RenderPipelineInterface/ICullPass";
import { IRenderContext3D } from "./RenderPipelineInterface/IRenderContext3D";
import { IRenderElement } from "./RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "./RenderPipelineInterface/IRenderGeometryElement";
import { IRenderQueue } from "./RenderPipelineInterface/IRenderQueue";
import { ISceneRenderManager } from "./RenderPipelineInterface/ISceneRenderManager";
import { IShadowCullInfo } from "./RenderPipelineInterface/IShadowCullInfo";
import { ISortPass } from "./RenderPipelineInterface/ISortPass";

export interface IRenderOBJCreate {

    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): any;

    createTransform(owner: Sprite3D): Transform3D;

    createBounds(min: Vector3, max: Vector3): any;

    createShaderData(ownerResource: Resource): ShaderData;

    createRenderElement(): IRenderElement;

    createSkinRenderElement(): IRenderElement;

    createInstanceRenderElement(): IRenderElement;

    createBaseRenderQueue(isTransparent: boolean): IRenderQueue;

    createRenderGeometry(mode: MeshTopology, drayType: DrawType): IRenderGeometryElement;

    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean): VertexBuffer3D;

    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage, canRead: boolean): IndexBuffer3D;

    createBaseRenderNode(): IBaseRenderNode;

    createRenderContext3D(): IRenderContext3D;

    createSceneRenderManager(): ISceneRenderManager;

    createCullPass(): ICullPass;

    createSortPass(): ISortPass;

    createShadowCullInfo(): IShadowCullInfo;

    createCameraCullInfo(): ICameraCullInfo;

    createRenderStateComand(): RenderStateCommand;

    createRenderState(): RenderState;

    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject;

    createGlobalUniformMap(blockName: string): CommandUniformMap;

    createEngine(config:Config,canvas:any):any;
}