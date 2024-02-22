import { Config } from "../../../../Config";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { LayaGL } from "../../../layagl/LayaGL";
import { IRenderEngineFactory } from "../../DriverDesign/RenderDevice/IRenderEngineFactory";
import { WebGLMode } from "../../WebGLDriver/RenderDevice/WebGLEngine/GLEnum/WebGLMode";
import { WebGLConfig } from "../../WebGLDriver/RenderDevice/WebGLEngine/WebGLConfig";
import { GLESCommandUniformMap } from "./GLESCommandUniformMap";
import { GLESEngine } from "./GLESEngine";



export class GLESRenderEngineFactory implements IRenderEngineFactory {
    _nativeObj: any;
    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject {
        throw new Error("Method not implemented.");
    }

    createEngine(config: Config, canvas: any): Promise<void> {
        let engine: GLESEngine;
        let glConfig: WebGLConfig = { stencil: Config.isStencil, alpha: Config.isAlpha, antialias: Config.isAntialias,           premultipliedAlpha: Config.premultipliedAlpha, preserveDrawingBuffer: Config.preserveDrawingBuffer, depth:               Config.isDepth, failIfMajorPerformanceCaveat: Config.isfailIfMajorPerformanceCaveat, powerPreference:                    Config.powerPreference };

        //TODO  other engine
        const webglMode: WebGLMode = Config.useWebGL2 ? WebGLMode.Auto : WebGLMode.WebGL1;
        engine = new GLESEngine(glConfig, webglMode);
        engine.initRenderEngine(canvas._source);
        
        new LayaGL();
        
        LayaGL.renderEngine = engine;
        LayaGL.textureContext = engine.getTextureContext();

        return Promise.resolve();
    }

}