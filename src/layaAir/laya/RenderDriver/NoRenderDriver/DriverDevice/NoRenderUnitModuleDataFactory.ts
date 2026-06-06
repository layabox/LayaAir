import { Laya } from "../../../../Laya";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { LayaGL } from "../../../layagl/LayaGL";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { IShaderPassData } from "../../RenderModuleData/Design/IShaderPassData";
import { ISubshaderData } from "../../RenderModuleData/Design/ISubShaderData";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { NoRenderDefineDatas } from "./NoRenderDeviceFactory";

class NoRenderShaderPass implements IShaderPassData {
    is2D: boolean;
    pipelineMode: string;
    statefirst: boolean;
    name: string;
    additionShaderData: string[];
    nodeCommonMap: string[];
    attributeLocations: Set<number>;

    private _validDefine: NoRenderDefineDatas = new NoRenderDefineDatas();
    private _renderState: RenderState = new RenderState();

    get validDefine(): NoRenderDefineDatas { return this._validDefine; }
    set validDefine(value: NoRenderDefineDatas) { this._validDefine = value; }

    get renderState(): RenderState { return this._renderState; }
    set renderState(value: RenderState) { this._renderState = value; }

    constructor(pass: ShaderPass) {
        this._renderState.setNull();
    }

    setCacheShader(compileDefine: IDefineDatas, shader: IShaderInstance): void {
    }

    getCacheShader(compileDefine: IDefineDatas): IShaderInstance {
        return null;
    }

    destroy(): void {
    }
}

class NoRenderSubShader implements ISubshaderData {
    shaderName: string;
    enableInstance: boolean;

    addShaderPass(pass: IShaderPassData): void { }
    setUniformMap(_uniformMap: Map<number, any>): void { }
    destroy(): void { }
}

export class NoRenderUnitModuleDataFactory {
    createSubShader(): NoRenderSubShader {
        return new NoRenderSubShader();
    }

    createShaderPass(pass: ShaderPass): IShaderPassData {
        return new NoRenderShaderPass(pass);
    }

    createRenderState(): RenderState {
        return new RenderState();
    }

    createDefineDatas(): NoRenderDefineDatas {
        return new NoRenderDefineDatas();
    }
}

Laya.addBeforeInitCallback(() => {
    if (!LayaGL.unitRenderModuleDataFactory)
        LayaGL.unitRenderModuleDataFactory = new NoRenderUnitModuleDataFactory();
});
