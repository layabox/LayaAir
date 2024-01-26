import { Config } from "../../../Config";
import { CommandUniformMap } from "../CommandUniformMap";
import { BufferUsage } from "../RenderEnum/BufferTargetType";
import { RenderStateCommand } from "../RenderStateCommand";
import { UniformBufferObject } from "../UniformBufferObject";


export interface IRenderEngineFactory {
    createRenderStateComand(): RenderStateCommand;
    
    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject;

    createGlobalUniformMap(blockName: string): CommandUniformMap;

    createEngine(config: Config, canvas: any): Promise<void>;
}

