import { Laya } from "../../../../Laya";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { LayaGL } from "../../../layagl/LayaGL";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { IShaderPassData } from "../../RenderModuleData/Design/IShaderPassData";
import { ISubshaderData } from "../../RenderModuleData/Design/ISubShaderData";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { NoRenderDefineDatas } from "./NoRenderDeviceFactory";
import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { IUnitRenderModuleDataFactory } from "../../RenderModuleData/Design/IUnitRenderModuleDataFactory";

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
    private _cacheShaders = new Map<string, IShaderInstance>();

    private _cacheKey(define: IDefineDatas): string {
        let length = define._length;
        while (length > 0 && !define._mask[length - 1]) length--;
        return define._mask.slice(0, length).join(",");
    }

    get validDefine(): NoRenderDefineDatas { return this._validDefine; }
    set validDefine(value: NoRenderDefineDatas) { this._validDefine = value; }

    get renderState(): RenderState { return this._renderState; }
    set renderState(value: RenderState) { this._renderState = value; }

    constructor(pass: ShaderPass) {
        this._renderState.setNull();
    }

    setCacheShader(compileDefine: IDefineDatas, shader: IShaderInstance): void {
        const key = this._cacheKey(compileDefine);
        if (shader) this._cacheShaders.set(key, shader);
        else this._cacheShaders.delete(key);
    }

    getCacheShader(compileDefine: IDefineDatas): IShaderInstance {
        compileDefine._intersectionDefineDatas(this._validDefine);
        return this._cacheShaders.get(this._cacheKey(compileDefine)) || null;
    }

    destroy(): void {
        for (const shader of new Set(this._cacheShaders.values())) shader._disposeResource();
        this._cacheShaders.clear();
        this._validDefine.destroy();
    }
}

class NoRenderSubShader implements ISubshaderData {
    shaderName: string;
    enableInstance: boolean;

    shaderPasses: IShaderPassData[] = [];
    uniformMap = new Map<number, UniformProperty>();

    addShaderPass(pass: IShaderPassData): void { this.shaderPasses.push(pass); }
    setUniformMap(uniformMap: Map<number, UniformProperty>): void { this.uniformMap = new Map(uniformMap); }
    destroy(): void {
        for (const pass of this.shaderPasses) pass.destroy();
        this.shaderPasses.length = 0;
        this.uniformMap.clear();
    }
}

export class NoRenderUnitModuleDataFactory implements IUnitRenderModuleDataFactory {
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
