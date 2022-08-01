import { Color } from "../../d3/math/Color";
import { RenderTexture } from "../../d3/resource/RenderTexture";
import { CommandEncoder } from "../../layagl/CommandEncoder";
import { BaseTexture } from "../../resource/BaseTexture";
import { BufferTargetType, BufferUsage } from "../RenderEnum/BufferTargetType";
import { RenderCapable } from "../RenderEnum/RenderCapable";
import { RenderClearFlag } from "../RenderEnum/RenderClearFlag";
import { RenderParams } from "../RenderEnum/RenderParams";
import { RenderStatisticsInfo } from "../RenderEnum/RenderStatInfo";
import { ShaderDataType } from "../RenderShader/ShaderData";
import { RenderStateCommand } from "../RenderStateCommand";
import { IRender2DContext } from "./IRender2DContext";
import { IRenderBuffer } from "./IRenderBuffer";
import { IRenderDrawContext } from "./IRenderDrawContext";
import { IRenderOBJCreate } from "./IRenderOBJCreate";
import { IRenderShaderInstance } from "./IRenderShaderInstance";
import { IRenderVertexState } from "./IRenderVertexState";
import { ITextureContext } from "./ITextureContext";

export interface IRenderEngine {
    gl: any;
    isWebGL2: boolean;
    _isShaderDebugMode: boolean;
    initRenderEngine(canvas: any): void;

    applyRenderStateCMD(cmd: RenderStateCommand): void;

    viewport(x: number, y: number, width: number, height: number): void;
    scissor(x: number, y: number, width: number, height: number): void;
    colorMask(r: boolean, g: boolean, b: boolean, a: boolean): void;
    copySubFrameBuffertoTex(texture: BaseTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void;
    bindTexture(texture: BaseTexture): void;
    clearRenderTexture(clearFlag: RenderClearFlag | number, clearcolor: Color, clearDepth: number): void;
    scissorTest(value: boolean): void;

    propertyNameToID(name: string): number;
    propertyIDToName(id: number): string;

    getParams(params: RenderParams): number;
    getCapable(capatableType: RenderCapable): boolean;
    getTextureContext(): ITextureContext;
    //TODO 先写完测试，这种封装过于死板
    getDrawContext(): IRenderDrawContext;
    get2DRenderContext(): IRender2DContext;
    getCreateRenderOBJContext(): IRenderOBJCreate;

    uploadUniforms(shader: IRenderShaderInstance, commandEncoder: CommandEncoder, shaderData: any, uploadUnTexture: boolean): number;
    uploadCustomUniforms(shader: IRenderShaderInstance, custom: any[], index: number, data: any): number;

    createShaderInstance(vs: string, ps: string, attributeMap: { [name: string]: [number, ShaderDataType] }): IRenderShaderInstance
    createBuffer(targetType: BufferTargetType, bufferUsageType: BufferUsage): IRenderBuffer;
    createVertexState(): IRenderVertexState;
    getUBOPointer(name: string): number;

    clearStatisticsInfo(info:RenderStatisticsInfo):void;
    getStatisticsInfo(info:RenderStatisticsInfo):number;
}