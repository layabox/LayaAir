import { CommandEncoder } from "../../layagl/CommandEncoder";
import { BufferTargetType, BufferUsage } from "../RenderEnum/BufferTargetType";
import { RenderCapable } from "../RenderEnum/RenderCapable";
import { RenderParams } from "../RenderEnum/RenderParams";
import { IRenderBuffer } from "./IRenderBuffer";
import { IRenderDrawContext } from "./IRenderDrawContext";
import { IRenderShaderInstance } from "./IRenderShaderInstance";
import { IRenderVertexArray } from "./IRenderVertexArray";
import { ITextureContext } from "./ITextureContext";

export interface IRenderEngine {
    _isShaderDebugMode:boolean;
    initRenderEngine(canvas:any):void;
    
    applyRenderContext(stateData:any):void;
    
    viewport(x: number, y: number, width: number, height: number): void;
    colorMask(r: boolean, g: boolean, b: boolean, a: boolean):void;
    
    getParams(params: RenderParams): number ;
    getCapable(capatableType: RenderCapable): boolean;
    getTextureContext(): ITextureContext;
     //TODO 先写完测试，这种封装过于死板
    getDrawContext():IRenderDrawContext;
    
    uploadUniforms(shader:IRenderShaderInstance,commandEncoder: CommandEncoder, shaderData: any, uploadUnTexture: boolean): number ;
    uploadCustomUniforms(shader:IRenderShaderInstance,custom: any[], index: number, data: any): number ;
    
    createShaderInstance(vs: string, ps: string, attributeMap: { [key: string]: number }):IRenderShaderInstance
    createBuffer(targetType: BufferTargetType, bufferUsageType: BufferUsage):IRenderBuffer ;
    createVertexArray():IRenderVertexArray;
}