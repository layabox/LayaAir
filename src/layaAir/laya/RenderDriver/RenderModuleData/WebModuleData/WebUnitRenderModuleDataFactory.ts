import { IUnitRenderModuleDataFactory } from "../Design/IUnitRenderModuleDataFactory";
import { RenderState } from "../Design/RenderState";
import { ShaderDefine } from "../Design/ShaderDefine";
import { WebDefineDatas } from "./WebDefineDatas";

export class WebUnitRenderModuleDataFactory implements IUnitRenderModuleDataFactory {
    
    createRenderState(): RenderState {
        return new RenderState();
    }

    //createShaderDefine(index: number, value: number): ShaderDefine {
    //    return new ShaderDefine(index, value);
    //}
    
    createDefineDatas(): WebDefineDatas {
        return new WebDefineDatas();
    }
}