import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { IDefineDatas } from "./IDefineDatas";
import { RenderState } from "./RenderState";

export interface IShaderPassData {
    is2D: boolean;
    pipelineMode: string;
    statefirst: boolean;
    validDefine: IDefineDatas;
    renderState: RenderState;
    setCacheShader(defines: IDefineDatas, shaderInstance: IShaderInstance): void;
    getCacheShader(defines: IDefineDatas): IShaderInstance;
    destroy(): void;
}

