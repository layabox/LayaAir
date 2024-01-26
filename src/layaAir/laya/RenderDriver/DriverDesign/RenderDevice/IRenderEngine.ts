
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { RenderStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { IRenderEngineFactory } from "./IRenderEngineFactory";
import { ITextureContext } from "./ITextureContext";
import { InternalTexture } from "./InternalTexture";

export interface IRenderEngine {
    _context: any;
    /**@internal */
    _isShaderDebugMode: boolean;
    /**@internal */
    _renderOBJCreateContext: IRenderEngineFactory;
    initRenderEngine(canvas: any): void;
    copySubFrameBuffertoTex(texture: InternalTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void;


    propertyNameToID(name: string): number;
    propertyIDToName(id: number): string;

    getParams(params: RenderParams): number;
    getCapable(capatableType: RenderCapable): boolean;
    getTextureContext(): ITextureContext;

    getCreateRenderOBJContext(): IRenderEngineFactory;

    // createBuffer(targetType: BufferTargetType, bufferUsageType: BufferUsage): IRenderBuffer;
    /**@internal */
    clearStatisticsInfo(info: RenderStatisticsInfo): void;
    /**@internal */
    getStatisticsInfo(info: RenderStatisticsInfo): number;
}