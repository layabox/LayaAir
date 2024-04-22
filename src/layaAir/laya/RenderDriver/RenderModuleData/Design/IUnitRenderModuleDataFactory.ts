import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { IDefineDatas } from "./IDefineDatas";
import { IShaderPassData } from "./IShaderPassData";
import { ISubshaderData } from "./ISubShaderData";
import { RenderState } from "./RenderState";

export interface IUnitRenderModuleDataFactory{
    createRenderState():RenderState;
    //createShaderDefine(index:number,value:number):ShaderDefine;
    createDefineDatas():IDefineDatas;

    createSubShader(): ISubshaderData;

    createShaderPass(pass: ShaderPass): IShaderPassData;
}