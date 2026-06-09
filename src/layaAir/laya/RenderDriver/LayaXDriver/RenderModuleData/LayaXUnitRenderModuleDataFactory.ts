import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { IUnitRenderModuleDataFactory } from "../../RenderModuleData/Design/IUnitRenderModuleDataFactory";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { IShaderPassData } from "../../RenderModuleData/Design/IShaderPassData";
import { ISubshaderData } from "../../RenderModuleData/Design/ISubShaderData";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { LayaXDefineDatas } from "./LayaXDefineDatas";
import { LayaXRenderState } from "./LayaXRenderState";
import { LayaXShaderPass } from "./LayaXShaderPass";
import { LayaXSubShader } from "./LayaXSubShader";
import { Laya } from "../../../../Laya";
import { LayaGL } from "../../../layagl/LayaGL";

/**
 * LayaX UnitRenderModuleDataFactory
 *
 * Creates LayaX (Rust-backed) versions of shader variant system objects.
 * Replaces RTUintRenderModuleDataFactory for the LayaX rendering path.
 */
export class LayaXUnitRenderModuleDataFactory implements IUnitRenderModuleDataFactory {

    createRenderState(): RenderState {
        return new LayaXRenderState();
    }

    createDefineDatas(): IDefineDatas {
        return new LayaXDefineDatas();
    }

    createSubShader(): ISubshaderData {
        return new LayaXSubShader();
    }

    createShaderPass(pass: ShaderPass): IShaderPassData {
        return new LayaXShaderPass(pass);
    }
}

Laya.addBeforeInitCallback(() => {
    if (!LayaGL.unitRenderModuleDataFactory)
        LayaGL.unitRenderModuleDataFactory = new LayaXUnitRenderModuleDataFactory();
})
