import { IDefineDatas } from "../../../RenderModuleData/Design/IDefineDatas";

export interface ComputeShaderProcessInfo {
    name: string;
    code: string;
    other: any;//临时支持  等编译流程完备  会去掉
    defineData: IDefineDatas;//是否需要宏来做shader的功能裁剪
}


export interface IComputeShader {
    name: string;
    HasKernel(kernel: string): boolean;
    compilete: boolean;
}
