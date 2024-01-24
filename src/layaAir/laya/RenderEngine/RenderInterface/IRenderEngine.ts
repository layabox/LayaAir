import { InternalTexture } from "../../RenderDriver/DriverDesign/RenderDevice/InternalTexture";
import { ShaderDataType } from "../../RenderDriver/RenderModuleData/Design/ShaderData";
import { CommandEncoder } from "../../layagl/CommandEncoder";
import { Color } from "../../maths/Color";
import { BufferTargetType, BufferUsage } from "../RenderEnum/BufferTargetType";
import { RenderCapable } from "../RenderEnum/RenderCapable";
import { RenderClearFlag } from "../RenderEnum/RenderClearFlag";
import { RenderParams } from "../RenderEnum/RenderParams";
import { RenderStatisticsInfo } from "../RenderEnum/RenderStatInfo";
import { RenderStateCommand } from "../RenderStateCommand";
import { IRender2DContext } from "./IRender2DContext";
import { IRenderBuffer } from "./IRenderBuffer";
import { IRenderDrawContext } from "./IRenderDrawContext";
import { IRenderEngineFactory } from "./IRenderEngineFactory";
import { IRenderShaderInstance } from "./IRenderShaderInstance";
import { IRenderVertexState } from "./IRenderVertexState";
import { ITextureContext } from "./ITextureContext";

export interface IRenderEngine {
    _context: any;
    /**@internal */
    _isShaderDebugMode: boolean;
    /**@internal */
    _renderOBJCreateContext: IRenderEngineFactory;
    initRenderEngine(canvas: any): void;

    applyRenderStateCMD(cmd: RenderStateCommand): void;

   
    copySubFrameBuffertoTex(texture: InternalTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void;
    clearRenderTexture(clearFlag: RenderClearFlag | number, clearcolor: Color, clearDepth: number, clearStencilValue: number): void;
    scissorTest(value: boolean): void;

    propertyNameToID(name: string): number;
    propertyIDToName(id: number): string;

    getParams(params: RenderParams): number;
    getCapable(capatableType: RenderCapable): boolean;
    getTextureContext(): ITextureContext;
    //TODO 先写完测试，这种封装过于死板
    getDrawContext(): IRenderDrawContext;
    get2DRenderContext(): IRender2DContext;
    getCreateRenderOBJContext(): IRenderEngineFactory;
    /**@internal */
    uploadUniforms(shader: IRenderShaderInstance, commandEncoder: CommandEncoder, shaderData: any, uploadUnTexture: boolean): number;
    /**@internal */
    uploadCustomUniforms(shader: IRenderShaderInstance, custom: any[], index: number, data: any): number;
    createRenderStateComand(): RenderStateCommand;
    createShaderInstance(vs: string, ps: string, attributeMap: { [name: string]: [number, ShaderDataType] }): IRenderShaderInstance
    createBuffer(targetType: BufferTargetType, bufferUsageType: BufferUsage): IRenderBuffer;
    createVertexState(): IRenderVertexState;
    getUBOPointer(name: string): number;
    /**@internal */
    clearStatisticsInfo(info: RenderStatisticsInfo): void;
    /**@internal */
    getStatisticsInfo(info: RenderStatisticsInfo): number;
    unbindVertexState(): void;
}