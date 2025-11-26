import { ShaderNode } from "../../../../webgl/utils/ShaderNode";
import { IDefineDatas } from "../../../RenderModuleData/Design/IDefineDatas";
import { CommandUniformMap } from "../CommandUniformMap";

export interface ComputeShaderProcessInfo {
    name: string;
    node: ShaderNode;
    uniformMaps: CommandUniformMap[];//临时支持  等编译流程完备  会去掉
    defineData: IDefineDatas;//是否需要宏来做shader的功能裁剪
}


export interface IComputeShader {
    name: string;
    compilete: boolean;
}
