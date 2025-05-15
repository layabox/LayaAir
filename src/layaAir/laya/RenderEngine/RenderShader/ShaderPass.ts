import { SubShader } from "./SubShader";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../webgl/utils/ShaderCompileDefineBase";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderVariantCollection } from "../../RenderEngine/RenderShader/ShaderVariantCollection";
import { IShaderCompiledObj } from "../../webgl/utils/ShaderCompile";
import { LayaGL } from "../../layagl/LayaGL";
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { IDefineDatas } from "../../RenderDriver/RenderModuleData/Design/IDefineDatas";
import { IShaderInstance } from "../../RenderDriver/DriverDesign/RenderDevice/IShaderInstance";
import { IShaderPassData } from "../../RenderDriver/RenderModuleData/Design/IShaderPassData";


/**
 * <code>ShaderPass</code> 类用于实现ShaderPass。
 */
export class ShaderPass extends ShaderCompileDefineBase {

    private _pipelineMode: string;
    public get pipelineMode(): string {
        return this._pipelineMode;
    }
    public set pipelineMode(value: string) {
        this._pipelineMode = value;
        this.moduleData.pipelineMode = value;
    }

    /**@internal */
    _nodeUniformCommonMap: Array<string>;

    set nodeCommonMap(value: Array<string>) {
        this._nodeUniformCommonMap = value;
        this.moduleData.nodeCommonMap = value;
    }

    get nodeCommonMap(): Array<string> {
        return this._nodeUniformCommonMap;
    }

    set additionShaderData(value: Array<string>) {
        this.moduleData.additionShaderData = value;
    }

    get additionShaderData(): Array<string> {
        return this.moduleData.additionShaderData;
    }

    /** 优先 ShaderPass 渲染状态 */
    private _statefirst: boolean = false;
    public get statefirst(): boolean {
        return this._statefirst;
    }
    public set statefirst(value: boolean) {
        this._statefirst = value;
        this.moduleData.statefirst = value;
    }

    moduleData: IShaderPassData;

    /**
     * 渲染状态。
     */
    get renderState(): RenderState {
        return this.moduleData.renderState;
    }

    constructor(owner: SubShader, compiledObj: IShaderCompiledObj) {
        super(owner, owner._owner.name, compiledObj);
        this.moduleData = LayaGL.unitRenderModuleDataFactory.createShaderPass(this);
        this.moduleData.validDefine = this._validDefine;
        this.moduleData.name = this.name;
    }

    /**
     * @internal
     * @param is2D 
     * @param compileDefine 
     * @returns 
     */
    static createShaderInstance(shaderpass: ShaderPass, is2D: boolean, compileDefine: IDefineDatas): IShaderInstance {
        _defineStrings.length = 0;
        Shader3D._getNamesByDefineData(compileDefine, _defineStrings);

        let shaderProcessInfo: ShaderProcessInfo = {
            is2D,
            vs: shaderpass._VS,
            ps: shaderpass._PS,
            attributeMap: shaderpass._owner._attributeMap,
            uniformMap: shaderpass._owner._uniformMap,
            defineString: _defineStrings,
        };

        if (Shader3D.debugMode)
            ShaderVariantCollection.active.add(shaderpass, _defineStrings);

        let shader = LayaGL.renderDeviceFactory.createShaderInstance(shaderProcessInfo, shaderpass);

        return shader;
    }

    /**
     * @override
     * @internal
     */
    withCompile(compileDefine: IDefineDatas, is2D: boolean = false): IShaderInstance {

        var shader: IShaderInstance = this.moduleData.getCacheShader(compileDefine);
        if (shader)
            return shader;
        shader = ShaderPass.createShaderInstance(this, is2D, compileDefine);
        this.moduleData.setCacheShader(compileDefine, shader);
        return shader;
    }

    withComplieByBin(compileDefine: IDefineDatas, is2D: boolean = false, buffer: ArrayBuffer) {
        var shader: IShaderInstance = this.moduleData.getCacheShader(compileDefine);
        if (shader)
            return shader;
        //TODO
        //shader = ShaderPass.createShaderInstance(this, is2D, compileDefine);
        this.moduleData.setCacheShader(compileDefine, shader);
        return null;
    }
}

const _defineStrings: Array<string> = [];