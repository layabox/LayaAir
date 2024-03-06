import { IUnitRenderModuleDataFactory } from "../Design/IUnitRenderModuleDataFactory";
import { RenderState } from "../Design/RenderState";
import { ShaderDefine } from "../Design/ShaderDefine";
import { WebDefineDatas } from "./WebDefineDatas";

export class WebUnitRenderModuleDataFactory implements IUnitRenderModuleDataFactory {
    
    createRenderState(): RenderState {
        return new RenderState();
    }
    
    createDefineDatas(): WebDefineDatas {
        return new WebDefineDatas();
    }
}