import { IDefineDatas } from "./IDefineDatas";
import { RenderState } from "./RenderState";
import { ShaderDefine } from "./ShaderDefine";

export interface IUnitRenderModuleDataFactory{
    createRenderState():RenderState;
    //createShaderDefine(index:number,value:number):ShaderDefine;
    createDefineDatas():IDefineDatas;
}