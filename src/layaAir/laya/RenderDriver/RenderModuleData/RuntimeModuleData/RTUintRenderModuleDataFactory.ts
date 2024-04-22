import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { IUnitRenderModuleDataFactory } from "../Design/IUnitRenderModuleDataFactory";
import { RTDefineDatas } from "./RTDefineDatas";
import { RTRenderState } from "./RTRenderState";
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
   createDefineDatas(): RTDefineDatas {
      return new RTDefineDatas();
   }
}