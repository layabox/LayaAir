import { Config } from "../../../../Config";
import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";
import { IRenderEngineFactory } from "../../DriverDesign/RenderDevice/IRenderEngineFactory";
import { WebGPUCodeGenerator } from "./WebGPUCodeGenerator";
import { WebGPUConfig, WebGPURenderEngine } from "./WebGPURenderEngine";

export class WebGPURenderEngineFactory implements IRenderEngineFactory {
    async createEngine(config: Config, canvas: any): Promise<void> {
        const gpuConfig = new WebGPUConfig();
        gpuConfig.alphaMode = Config.premultipliedAlpha ? "premultiplied" : "opaque";
        gpuConfig.colorSpace = "srgb"; //TODO 这里感觉会出问题
        switch (Config.powerPreference) {
            case "default":
                gpuConfig.powerPreference = "high-performance";
                break;
            default:
                gpuConfig.powerPreference = Config.powerPreference;
                break;
        }
        //@ts-ignore
        // todo add required features
        gpuConfig.deviceDescriptor.requiredFeatures = [
            // "texture-compression-astc",
            // "texture-compression-bc",
            // "texture-compression-etc2",
            // "float32-filterable"
            "depth-clip-control",
            "depth32float-stencil8",
            "texture-compression-bc",
            "texture-compression-etc2",
            "texture-compression-astc",
            "timestamp-query",
            "indirect-first-instance",
            "shader-f16",
            "rg11b10ufloat-renderable",
            "bgra8unorm-storage",
            "float32-filterable",
        ];
        const engine = new WebGPURenderEngine(gpuConfig, canvas._source);
        LayaGL.renderEngine = engine;
        await engine.initRenderEngine();
        LayaGL.textureContext = engine.getTextureContext();
        await WebGPUCodeGenerator.init();
    }
}

Laya.addBeforeInitCallback(() => {
    if (!LayaGL.renderOBJCreate)
        LayaGL.renderOBJCreate = new WebGPURenderEngineFactory();
});