import { Config } from "../../../Config";
import { Resource } from "../../resource/Resource";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../webgl/utils/ShaderCompileDefineBase";
import { CommandUniformMap } from "../CommandUniformMap";
import { BufferUsage } from "../RenderEnum/BufferTargetType";
import { RenderState } from "../RenderShader/RenderState";
import { ShaderPass } from "../RenderShader/ShaderPass";
import { RenderStateCommand } from "../RenderStateCommand";
import { UniformBufferObject } from "../UniformBufferObject";
import { IShaderInstance, IShaderPassData, ISubshaderData } from "./RenderPipelineInterface/IShaderInstance";
import { ShaderData } from "./ShaderData";

export interface IRenderEngineFactory {

    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): IShaderInstance;

    createSubShaderData(): ISubshaderData;

    createShaderPass(pass: ShaderPass): IShaderPassData;

    createShaderData(ownerResource: Resource): ShaderData;

    createRenderStateComand(): RenderStateCommand;

    createRenderState(): RenderState;

    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject;

    createGlobalUniformMap(blockName: string): CommandUniformMap;

    createEngine(config: Config, canvas: any): Promise<void>;
}

