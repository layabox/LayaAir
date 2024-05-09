
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { GLBuffer } from "../../WebGLDriver/RenderDevice/WebGLEngine/GLBuffer";
import { IRenderEngineFactory } from "./IRenderEngineFactory";
import { ITextureContext } from "./ITextureContext";
import { InternalTexture } from "./InternalTexture";

export interface IRenderEngine {
    _context: any;
    /**@internal */
    _isShaderDebugMode: boolean;
    /**@internal */
    _renderOBJCreateContext: IRenderEngineFactory;

    _enableStatistics: boolean;

    _remapZ:boolean;
    _screenInvertY: boolean;
    _lodTextureSample: boolean;

    initRenderEngine(canvas: any): void;
    copySubFrameBuffertoTex(texture: InternalTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void;

    resizeOffScreen(width: number, height: number): void;

    propertyNameToID(name: string): number;
    propertyIDToName(id: number): string;

    getDefineByName(name: string): ShaderDefine;
    getNamesByDefineData(defineData: IDefineDatas, out: Array<string>): void;

    addTexGammaDefine(key: number, value: ShaderDefine): void;

    getParams(params: RenderParams): number;
    getCapable(capatableType: RenderCapable): boolean;
    getTextureContext(): ITextureContext;

    getCreateRenderOBJContext(): IRenderEngineFactory;
    /**@internal */
    clearStatisticsInfo(): void;
    /**@internal */
    getStatisticsInfo(info: GPUEngineStatisticsInfo): number;
    getUBOPointer?(name: string): number;   // TODO
    createBuffer?(targetType: BufferTargetType, bufferUsageType: BufferUsage): GLBuffer;    // TODO
}