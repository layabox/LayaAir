import { Config } from "../../../Config";
import { Resource } from "../../resource/Resource";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../webgl/utils/ShaderCompileDefineBase";
import { CommandUniformMap } from "../CommandUniformMap";
import { BufferUsage } from "../RenderEnum/BufferTargetType";
import { RenderState } from "../RenderShader/RenderState";
import { ShaderData } from "../RenderShader/ShaderData";
import { RenderStateCommand } from "../RenderStateCommand";
import { UniformBufferObject } from "../UniformBufferObject";

export interface IRenderEngineFactory {

    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): any;

    createShaderData(ownerResource: Resource): ShaderData;

    createRenderStateComand(): RenderStateCommand;

    createRenderState(): RenderState;

    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject;

    createGlobalUniformMap(blockName: string): CommandUniformMap;

    createEngine(config:Config,canvas:any):Promise<void>;
}

