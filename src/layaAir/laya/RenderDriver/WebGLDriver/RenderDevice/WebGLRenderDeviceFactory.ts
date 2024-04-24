import { Config } from "../../../../Config";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderDeviceFactory } from "../../DriverDesign/RenderDevice/IRenderDeviceFactory";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { WebGLRenderGeometryElement } from "./WebGLRenderGeometryElement";
import { WebGLBufferState } from "./WebGLBufferState";
import { WebGLIndexBuffer } from "./WebGLIndexBuffer";
import { WebGLShaderInstance } from "./WebGLShaderInstance";
import { WebGLVertexBuffer } from "./WebGLVertexBuffer";
import { LayaGL } from "../../../layagl/LayaGL";
import { WebGLEngine } from "./WebGLEngine";
import { WebGLMode } from "./WebGLEngine/GLEnum/WebGLMode";
import { WebGLConfig } from "./WebGLEngine/WebGLConfig";
import { WebGLCommandUniformMap } from "./WebGLCommandUniformMap";
import { Resource } from "../../../resource/Resource";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { Laya } from "../../../../Laya";

export class WebGLRenderDeviceFactory implements IRenderDeviceFactory {
    createShaderData(ownerResource?: Resource): ShaderData {
        return new WebGLShaderData(ownerResource);
    }

    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): IShaderInstance {
        let shaderIns = new WebGLShaderInstance();
        shaderIns._create(shaderProcessInfo, shaderPass);
        return shaderIns;
    }

    createIndexBuffer(bufferUsageType: BufferUsage): IIndexBuffer {
        return new WebGLIndexBuffer(BufferTargetType.ELEMENT_ARRAY_BUFFER, bufferUsageType);
    }

    createVertexBuffer(bufferUsageType: BufferUsage): IVertexBuffer {
        return new WebGLVertexBuffer(BufferTargetType.ARRAY_BUFFER, bufferUsageType);
    }

    createBufferState(): IBufferState {
        return new WebGLBufferState();
    }

    createRenderGeometryElement(mode: MeshTopology, drawType: DrawType): IRenderGeometryElement {
        return new WebGLRenderGeometryElement(mode, drawType);
    }

    private globalBlockMap: any = {};
    createGlobalUniformMap(blockName: string): WebGLCommandUniformMap {
        let comMap = this.globalBlockMap[blockName];
        if (!comMap)
            comMap = this.globalBlockMap[blockName] = new WebGLCommandUniformMap(blockName);;
        return comMap;
    }

    createEngine(config: Config, canvas: any): Promise<void> {
        let engine: WebGLEngine;
        let glConfig: WebGLConfig = { stencil: Config.isStencil, alpha: Config.isAlpha, antialias: Config.isAntialias, premultipliedAlpha: Config.premultipliedAlpha, preserveDrawingBuffer: Config.preserveDrawingBuffer, depth: Config.isDepth, failIfMajorPerformanceCaveat: Config.isfailIfMajorPerformanceCaveat, powerPreference: Config.powerPreference };

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

Laya.addBeforeInitCallback(() => {
    if (!LayaGL.renderDeviceFactory)
        LayaGL.renderDeviceFactory = new WebGLRenderDeviceFactory();
})