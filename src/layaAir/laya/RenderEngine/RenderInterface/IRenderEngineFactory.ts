import { Config } from "../../../Config";
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { ShaderProcessInfo, ShaderCompileDefineBase } from "../../webgl/utils/ShaderCompileDefineBase";
import { CommandUniformMap } from "../CommandUniformMap";
import { BufferUsage } from "../RenderEnum/BufferTargetType";
import { RenderStateCommand } from "../RenderStateCommand";
import { UniformBufferObject } from "../UniformBufferObject";
import { IShaderInstance } from "./RenderPipelineInterface/IShaderInstance";


export interface IRenderEngineFactory {

    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): IShaderInstance;

    createRenderStateComand(): RenderStateCommand;
    
    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject;

    createGlobalUniformMap(blockName: string): CommandUniformMap;

    createEngine(config: Config, canvas: any): Promise<void>;
}

