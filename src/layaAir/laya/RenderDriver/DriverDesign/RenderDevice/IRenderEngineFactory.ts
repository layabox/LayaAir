import { Config } from "../../../../Config";
import { CommandUniformMap } from "../../../RenderEngine/CommandUniformMap";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";



export interface IRenderEngineFactory {
    
    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject;

    createGlobalUniformMap(blockName: string): CommandUniformMap;

    createEngine(config: Config, canvas: any): Promise<void>;
}