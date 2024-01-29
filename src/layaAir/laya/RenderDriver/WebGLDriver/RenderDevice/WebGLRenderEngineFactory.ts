
import { Config } from "../../../../Config";
import { LayaGL } from "../../../layagl/LayaGL";
import { WebGLShaderInstance } from "../../../RenderDriver/WebglDriver/RenderDevice/WebGLShaderInstance";
import { CommandUniformMap } from "../../../RenderEngine/CommandUniformMap";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IRenderEngineFactory } from "../../DriverDesign/RenderDevice/IRenderEngineFactory";
import { WebGLEngine } from "./WebGLEngine";
import { WebGLMode } from "./WebGLEngine/GLEnum/WebGLMode";
import { WebGlConfig } from "./WebGLEngine/WebGLConfig";


export class WebGLRenderEngineFactory implements IRenderEngineFactory {
    /**@internal */
    private globalBlockMap: any = {};
    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): WebGLShaderInstance {
        let shaderins = new WebGLShaderInstance();
        shaderins._create(shaderProcessInfo, shaderPass);
        return shaderins;
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

    createEngine(config: any, canvas: any): Promise<void> {
        let engine: WebGLEngine;
        let glConfig: WebGlConfig = { stencil: Config.isStencil, alpha: Config.isAlpha, antialias: Config.isAntialias, premultipliedAlpha: Config.premultipliedAlpha, preserveDrawingBuffer: Config.preserveDrawingBuffer, depth: Config.isDepth, failIfMajorPerformanceCaveat: Config.isfailIfMajorPerformanceCaveat, powerPreference: Config.powerPreference };

        //TODO  other engine
        const webglMode: WebGLMode = Config.useWebGL2 ? WebGLMode.Auto : WebGLMode.WebGL1;
        engine = new WebGLEngine(glConfig, webglMode);
        engine.initRenderEngine(canvas._source);
        var gl: WebGLRenderingContext = engine._context;//TODO 优化
        if (Config.printWebglOrder)
            this._replaceWebglcall(gl);

        if (gl) {
            new LayaGL();
        }
        LayaGL.renderEngine = engine;
        LayaGL.textureContext = engine.getTextureContext();

        return Promise.resolve();
    }

    /**@private test function*/
    private _replaceWebglcall(gl: any) {
        var tempgl: { [key: string]: any } = {};
        for (const key in gl) {
            if (typeof gl[key] == "function" && key != "getError" && key != "__SPECTOR_Origin_getError" && key != "__proto__") {
                tempgl[key] = gl[key];
                gl[key] = function () {
                    let arr: IArguments[] = [];
                    for (let i = 0; i < arguments.length; i++) {
                        arr.push(arguments[i]);
                    }
                    let result = tempgl[key].apply(gl, arr);

                    //console.log(RenderInfo.loopCount + ":gl." + key + ":" + arr);
                    let err = gl.getError();
                    if (err) {
                        //console.log(err);
                        debugger;
                    }
                    return result;
                }
            }
        }
    }
}

