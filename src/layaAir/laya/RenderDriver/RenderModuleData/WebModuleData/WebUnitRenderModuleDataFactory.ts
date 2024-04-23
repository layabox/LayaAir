import { Laya } from "../../../../Laya";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { LayaGL } from "../../../layagl/LayaGL";
import { IShaderPassData } from "../Design/IShaderPassData";
import { IUnitRenderModuleDataFactory } from "../Design/IUnitRenderModuleDataFactory";
import { RenderState } from "../Design/RenderState";
import { WebDefineDatas } from "./WebDefineDatas";
import { WebShaderPass } from "./WebShaderPass";
import { WebSubShader } from "./WebSubShader";

export class WebUnitRenderModuleDataFactory implements IUnitRenderModuleDataFactory {
    createSubShader(): WebSubShader {
        return new WebSubShader();
    }
    createShaderPass(pass: ShaderPass): IShaderPassData {
        return new WebShaderPass(pass);
    }

    createRenderState(): RenderState {
        return new RenderState();
    }

    createDefineDatas(): WebDefineDatas {
        return new WebDefineDatas();
    }
}

Laya.addBeforeInitCallback(() => {
    if (!LayaGL.unitRenderModuleDataFactory)
        LayaGL.unitRenderModuleDataFactory = new WebUnitRenderModuleDataFactory();
})