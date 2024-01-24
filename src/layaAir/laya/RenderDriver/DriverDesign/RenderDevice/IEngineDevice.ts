// import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
// import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
// import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
// import { RenderStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
// import { IRenderBuffer } from "../../../RenderEngine/RenderInterface/IRenderBuffer";
// import { IRenderShaderInstance } from "../../../RenderEngine/RenderInterface/IRenderShaderInstance";
// import { IRenderVertexState } from "../../../RenderEngine/RenderInterface/IRenderVertexState";
// import { ITextureContext } from "../../../RenderEngine/RenderInterface/ITextureContext";
// import { ShaderDataType } from "../../RenderModuleData/Design/ShaderData";
// import { InternalTexture } from "./InternalTexture";

// export interface IEngineDevice {
   
//     initRenderEngine(canvas: any): void;

//    // applyRenderStateCMD(cmd: RenderStateCommand): void;

   
//     copySubFrameBuffertoTex(texture: InternalTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void;
//    // clearRenderTexture(clearFlag: RenderClearFlag | number, clearcolor: Color, clearDepth: number, clearStencilValue: number): void;
//     scissorTest(value: boolean): void;

//     propertyNameToID(name: string): number;
//     propertyIDToName(id: number): string;

//     getParams(params: RenderParams): number;
//     getCapable(capatableType: RenderCapable): boolean;
//     getTextureContext(): ITextureContext;
//     //TODO 先写完测试，这种封装过于死板
//     //getDrawContext(): IRenderDrawContext;
//     //get2DRenderContext(): IRender2DContext;
//     //getCreateRenderOBJContext(): IRenderEngineFactory;
//     /**@internal */
//     //uploadUniforms(shader: IRenderShaderInstance, commandEncoder: CommandEncoder, shaderData: any, uploadUnTexture: boolean): number;
//     /**@internal */
//     //uploadCustomUniforms(shader: IRenderShaderInstance, custom: any[], index: number, data: any): number;
//     //createRenderStateComand(): RenderStateCommand;
//     createShaderInstance(vs: string, ps: string, attributeMap: { [name: string]: [number, ShaderDataType] }): IRenderShaderInstance
//     createBuffer(targetType: BufferTargetType, bufferUsageType: BufferUsage): IRenderBuffer;
//     createVertexState(): IRenderVertexState;
//     getUBOPointer(name: string): number;
//     /**@internal */
//     clearStatisticsInfo(info: RenderStatisticsInfo): void;
//     /**@internal */
//     getStatisticsInfo(info: RenderStatisticsInfo): number;
//     unbindVertexState(): void;
// }