import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { Resource } from "../../../resource/Resource";
import { IShaderPassData } from "../Design/IShaderPassData";
import { ISubshaderData } from "../Design/ISubShaderData";
import { IUnitRenderModuleDataFactory } from "../Design/IUnitRenderModuleDataFactory";
import { RTDefineDatas } from "./RTDefineDatas";
import { RTRenderState } from "./RTRenderState";
import { RTShaderDefine } from "./RTShaderDefine";
import { RTShaderPass } from "./RTShaderPass";
import { RTSubShader } from "./RTSubShader";

export class RTUintRenderModuleDataFactory implements IUnitRenderModuleDataFactory {
   createSubShader(): RTSubShader {
      return new RTSubShader();
   }
   createShaderPass(pass: ShaderPass): RTShaderPass {
      return new RTShaderPass(pass);
   }
   createRenderState(): RTRenderState {
      return new RTRenderState();
   }
   //createShaderDefine(index: number, value: number): RTShaderDefine {
   //   return new RTShaderDefine(index,value);
   //}
   createDefineDatas(): RTDefineDatas {
      return new RTDefineDatas();
   }
}