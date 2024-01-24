import { Resource } from "../../../resource/Resource";
import { IUnitRenderModuleDataFactory } from "../Design/IUnitRenderModuleDataFactory";
import { RTDefineDatas } from "./RTDefineDatas";
import { RTRenderState } from "./RTRenderState";
import { RTShaderData } from "./RTShaderData";
import { RTShaderDefine } from "./RTShaderDefine";

export class RTUintRenderModuleDataFactory implements IUnitRenderModuleDataFactory{
    createRenderState(): RTRenderState {
       return new RTRenderState();
    }
    createShaderData(ownerResource?:Resource): RTShaderData {
      return new RTShaderData(ownerResource);
    }
    createShaderDefine(index: number, value: number): RTShaderDefine {
       return new RTShaderDefine(index,value);
    }
    createDefineDatas(): RTDefineDatas {
       return new RTDefineDatas();
    } 
}