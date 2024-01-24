import { Resource } from "../../../resource/Resource";
import { IDefineDatas } from "./IDefineDatas";
import { RenderState } from "./RenderState";
import { ShaderData } from "./ShaderData";
import { ShaderDefine } from "./ShaderDefine";

export interface IUnitRenderModuleDataFactory{
    createRenderState():RenderState;
    createShaderData(ownerResource?:Resource):ShaderData;
    createShaderDefine(index:number,value:number):ShaderDefine;
    createDefineDatas():IDefineDatas;
}