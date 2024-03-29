import { Config } from "../../../../Config";
import { CommandUniformMap } from "../../../RenderEngine/CommandUniformMap";
import { WebGPUConfig } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPUConfig";
import { WebGPUEngine } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPUEngine";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IRenderEngineFactory } from "../../../RenderEngine/RenderInterface/IRenderEngineFactory";
import { RenderState } from "../../../RenderEngine/RenderShader/RenderState";
import { RenderStateCommand } from "../../../RenderEngine/RenderStateCommand";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { WGPURenderPipelineInstance } from "../../../d3/RenderObjs/WebGPUOBJ/WGPURenderPipelineInstance";
import { WGPUShaderData } from "../../../d3/RenderObjs/WebGPUOBJ/WGPUShaderData";
import { LayaGL } from "../../../layagl/LayaGL";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";


export class WGPURenderEngineFactory implements IRenderEngineFactory {
    /**@internal */
    private globalBlockMap: any = {};

    createShaderData(): WGPUShaderData {
        return new WGPUShaderData();
    }



    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): WGPURenderPipelineInstance {
        return new WGPURenderPipelineInstance(shaderProcessInfo, shaderPass);
    }

  

    createRenderStateComand(): RenderStateCommand {
        return new RenderStateCommand();
    }

    createRenderState(): RenderState {
        return new RenderState();
    }

    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject {
        return new UniformBufferObject(glPointer, name, bufferUsage, byteLength, isSingle);
    }

    createGlobalUniformMap(blockName: string): CommandUniformMap {
        let comMap = this.globalBlockMap[blockName];
        if (!comMap)
            comMap = this.globalBlockMap[blockName] = new CommandUniformMap(blockName);;
        return comMap;
    }

    async createEngine(config: any, canvas: any){
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
        let engine = new WebGPUEngine(gpuConfig,canvas._source);
        LayaGL.renderEngine= engine;
        await engine.initRenderEngine();
        LayaGL.textureContext = engine.getTextureContext();
        return Promise.resolve() as any;
    }
}