import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { IDefineDatas } from "./IDefineDatas";
import { RenderState } from "./RenderState";

/** 
 * @blueprintIgnore @blueprintIgnoreSubclasses
 */
export interface IShaderPassData {
    is2D: boolean;
    pipelineMode: string;
    statefirst: boolean;
    validDefine: IDefineDatas;
    renderState: RenderState;
    nodeCommonMap: string[];
    additionShaderData: string[];
    setCacheShader(defines: IDefineDatas, shaderInstance: IShaderInstance): void;
    getCacheShader(defines: IDefineDatas): IShaderInstance;
    destroy(): void;
}

