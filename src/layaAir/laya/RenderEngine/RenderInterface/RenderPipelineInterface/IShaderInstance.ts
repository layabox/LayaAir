import { ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { DefineDatas } from "../../RenderShader/DefineDatas";
import { ShaderPass } from "../../RenderShader/ShaderPass";

export interface IShaderInstance {
    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void
    _disposeResource(): void;
}


export interface IShaderPassData {
    pipelineMode: string;
    statefirst: boolean;
    validDefine: DefineDatas;
    setCacheShader(defines: DefineDatas, shaderInstance: IShaderInstance): void;
    getCacheShader(defines: DefineDatas): IShaderInstance;
    destory(): void;
}


//subShader和shaderpass仅仅保留getCacheShader相关的数据
export interface ISubshaderData {
    addShaderPass(pass: IShaderPassData): void;
    destroy(): void;
}