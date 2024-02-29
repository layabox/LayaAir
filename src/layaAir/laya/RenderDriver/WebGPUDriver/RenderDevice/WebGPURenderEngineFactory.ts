import { Config } from "../../../../Config";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { LayaGL } from "../../../layagl/LayaGL";
import { IRenderEngineFactory } from "../../DriverDesign/RenderDevice/IRenderEngineFactory";
import { WebGPUConfig, WebGPURenderEngine } from "./WebGPURenderEngine";

export class WebGPURenderEngineFactory implements IRenderEngineFactory{
    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject {
        throw new Error("Method not implemented.");
    }
    async createEngine(config: Config, canvas: any): Promise<void> {
        let gpuConfig = new WebGPUConfig();
                gpuConfig.alphaMode = Config.premultipliedAlpha ? "premultiplied" : "opaque";
                gpuConfig.colorSpace = "srgb";//TODO 这里感觉会出问题
                switch (Config.powerPreference) {
                    case "default":
                        gpuConfig.powerPreference = undefined;
                        break;
                    default:
                        gpuConfig.powerPreference = Config.powerPreference;
                        break;
                }
                let engine = new WebGPURenderEngine(gpuConfig, canvas._source);
                LayaGL.renderEngine = engine;
                await engine.initRenderEngine();
                LayaGL.textureContext = engine.getTextureContext();
                return Promise.resolve() as any;
    }
    
}