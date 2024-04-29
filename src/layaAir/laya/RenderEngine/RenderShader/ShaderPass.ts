import { SubShader } from "./SubShader";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../webgl/utils/ShaderCompileDefineBase";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderVariantCollection } from "../../RenderEngine/RenderShader/ShaderVariantCollection";
import { IShaderCompiledObj } from "../../webgl/utils/ShaderCompile";
import { LayaGL } from "../../layagl/LayaGL";
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { IDefineDatas } from "../../RenderDriver/RenderModuleData/Design/IDefineDatas";
import { Laya3DRender } from "../../d3/RenderObjs/Laya3DRender";
import { IShaderInstance } from "../../RenderDriver/DriverDesign/RenderDevice/IShaderInstance";
import { IShaderPassData } from "../../RenderDriver/RenderModuleData/Design/IShaderPassData";


/**
 * <code>ShaderPass</code> 类用于实现ShaderPass。
 */
export class ShaderPass extends ShaderCompileDefineBase {
    /** @internal */
    private static _debugDefineStrings: string[] = [];
    /** @internal */
    private static _debugDefineMasks: number[] = [];
    // /** @internal */
    // private _renderState: RenderState;
    /** @internal */
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
        super(owner, null, compiledObj);
        this.moduleData = LayaGL.unitRenderModuleDataFactory.createShaderPass(this);
        this.moduleData.validDefine = this._validDefine;
    }

    /**
     * @internal
     * @param IS2d 
     * @param compileDefine 
     * @returns 
     */
    static createShaderInstance(shaderpass: ShaderPass, IS2d: boolean, compileDefine: IDefineDatas): IShaderInstance {
        var shader: IShaderInstance;
        let shaderProcessInfo: ShaderProcessInfo = new ShaderProcessInfo();
        shaderProcessInfo.is2D = IS2d;
        shaderProcessInfo.vs = shaderpass._VS;
        shaderProcessInfo.ps = shaderpass._PS;
        shaderProcessInfo.attributeMap = shaderpass._owner._attributeMap;
        shaderProcessInfo.uniformMap = shaderpass._owner._uniformMap;
        var defines: string[] = ShaderCompileDefineBase._defineStrings;
        defines.length = 0;
        Shader3D._getNamesByDefineData(compileDefine, defines);
        shaderProcessInfo.defineString = defines;
        shader = LayaGL.renderDeviceFactory.createShaderInstance(shaderProcessInfo, shaderpass);

        

        if (Shader3D.debugMode)
            ShaderVariantCollection.active.add(shaderpass, defines);

        return shader;
    }

    /**
     * @override
     * @internal
     */
    withCompile(compileDefine: IDefineDatas, IS2d: boolean = false): IShaderInstance {
        var shader: IShaderInstance = this.moduleData.getCacheShader(compileDefine);
        if (shader)
            return shader;
        shader = ShaderPass.createShaderInstance(this, IS2d, compileDefine);
        this.moduleData.setCacheShader(compileDefine, shader);
        return shader;
    }

    /**
     * 获取uniform信息
     * @param compileDefine 
     */
    getUniform(compileDefine: IDefineDatas) { //兼容WGSL
        const defineString = ShaderPass._defineStrings;
        Shader3D._getNamesByDefineData(compileDefine, defineString); //@ts-ignore
        return LayaGL.renderDeviceFactory.getUniform(defineString, this._owner._uniformMap, this._VS, this._PS);
    }
}