import { Config } from "../../../Config";
import { Resource } from "../../resource/Resource";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../webgl/utils/ShaderCompileDefineBase";
import { CommandUniformMap } from "../CommandUniformMap";
import { BufferUsage } from "../RenderEnum/BufferTargetType";
import { DrawType } from "../RenderEnum/DrawType";
import { MeshTopology } from "../RenderEnum/RenderPologyMode";
import { RenderState } from "../RenderShader/RenderState";
import { ShaderData } from "../RenderShader/ShaderData";
import { RenderStateCommand } from "../RenderStateCommand";
import { UniformBufferObject } from "../UniformBufferObject";
import { IBaseRenderNode } from "./RenderPipelineInterface/IBaseRenderNode";
import { IRenderContext3D } from "./RenderPipelineInterface/IRenderContext3D";
import { IRenderGeometryElement } from "./RenderPipelineInterface/IRenderGeometryElement";

export interface IRenderEngineFactory {

    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): any;

    createShaderData(ownerResource: Resource): ShaderData;

    createRenderStateComand(): RenderStateCommand;

    createRenderState(): RenderState;

    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject;

    createGlobalUniformMap(blockName: string): CommandUniformMap;

    createEngine(config:Config,canvas:any):Promise<void>;
}

