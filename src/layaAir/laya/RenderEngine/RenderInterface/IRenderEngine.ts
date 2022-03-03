import { CommandEncoder } from "../../layagl/CommandEncoder";
import { BufferTargetType, BufferUsage } from "../RenderEnum/BufferTargetType";
import { RenderCapable } from "../RenderEnum/RenderCapable";
import { RenderParams } from "../RenderEnum/RenderParams";
import { IRenderBuffer } from "./IRenderBuffer";
import { IRenderShaderInstance } from "./IRenderShaderInstance";
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
    
    uploadUniforms(commandEncoder: CommandEncoder, shaderData: any, uploadUnTexture: boolean):number;
    uploadCustomUniformUniforms(custom: any[], index: number, data: any): number ;
    
    createShaderInstance(vs: string, ps: string, attributeMap: { [key: string]: number }):IRenderShaderInstance
    createBuffer(targetType: BufferTargetType, bufferUsageType: BufferUsage):IRenderBuffer ;
}