import { Resource } from "../../../resource/Resource";
import { IDefineDatas } from "../Design/IDefineDatas";
import { IUnitRenderModuleDataFactory } from "../Design/IUnitRenderModuleDataFactory";
import { RenderState } from "../Design/RenderState";
import { ShaderDefine } from "../Design/ShaderDefine";
import { WebDefineDatas } from "./WebDefineDatas";
import { WebShaderData } from "./WebShaderData";

export class WebUnitRenderModuleDataFactory implements IUnitRenderModuleDataFactory {
    
    createRenderState(): RenderState {
        return new RenderState();
    }

    createShaderData(ownerResource?:Resource): WebShaderData {
        return new WebShaderData(ownerResource)
    }

    createShaderDefine(index: number, value: number): ShaderDefine {
        return new ShaderDefine(index, value);
    }
    
    createDefineDatas(): WebDefineDatas {
        return new WebDefineDatas();
    }
}