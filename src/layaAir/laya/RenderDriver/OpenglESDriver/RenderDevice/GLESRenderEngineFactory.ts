import { Config } from "../../../../Config";
import { CommandUniformMap } from "../../../RenderEngine/CommandUniformMap";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { IRenderEngineFactory } from "../../DriverDesign/RenderDevice/IRenderEngineFactory";



export class GLESRenderEngineFactory implements IRenderEngineFactory {
    _nativeObj:any;
    constructor() {

    }

    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject {
        throw new Error("Method not implemented.");
    }
    createGlobalUniformMap(blockName: string): CommandUniformMap {
        throw new Error("Method not implemented.");
    }
    createEngine(config: Config, canvas: any): Promise<void> {
        throw new Error("Method not implemented.");
    }




}