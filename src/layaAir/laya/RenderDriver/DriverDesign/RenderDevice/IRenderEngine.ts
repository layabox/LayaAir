import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { ITextureContext } from "./ITextureContext";
import { InternalTexture } from "./InternalTexture";

export interface IRenderEngine {
    _context: any;
    /**@internal */
    _isShaderDebugMode: boolean;

    _framePassCount: number;

    _remapZ: boolean;
    _screenInvertY: boolean;
    _lodTextureSample: boolean;
    _breakTextureSample: boolean;

    initRenderEngine(canvas: HTMLCanvasElement): void;
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
    startFrame(): void;
    endFrame(): void;
}