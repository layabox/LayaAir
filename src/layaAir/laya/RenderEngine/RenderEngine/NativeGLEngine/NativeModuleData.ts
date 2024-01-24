import { NativeShaderInstance } from "../../../d3/RenderObjs/NativeOBJ/NativeShaderInstance";
import { IShaderInstance, IShaderPassData, ISubshaderData } from "../../RenderInterface/RenderPipelineInterface/IShaderInstance";
import { DefineDatas } from "../../RenderShader/DefineDatas";
import { ShaderPass } from "../../RenderShader/ShaderPass";

export class NativeSubShader implements ISubshaderData {

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchSubShader();
    }
    destroy(): void {
        this._nativeObj.destroy();
    }
    addShaderPass(pass: NativeShaderPass): void {
        this._nativeObj.addShaderPass(pass._nativeObj);
    }
}

export class NativeShaderPass implements IShaderPassData {
    static TempDefine: DefineDatas;//native 创建Shader要同步这个defineData
    public get pipelineMode() {
        return this._nativeObj._pipelineMode;
    }
    public set pipelineMode(value: string) {
        this._nativeObj._pipelineMode = value;
    }
    public get statefirst() {
        return this._nativeObj._statefirst;
    }
    public set statefirst(value: boolean) {
        this._nativeObj._statefirst = value;
    }
    validDefine: DefineDatas = new DefineDatas();
    private _createShaderInstanceFun: any;//想办法把这个传下去
    _nativeObj: any;
    private _pass: ShaderPass;
    constructor(pass: ShaderPass) {
        this._pass = pass;
        this._nativeObj = new (window as any).conchShaderPass();
        this._createShaderInstanceFun = this.nativeCreateShaderInstance.bind(this);
        this._nativeObj.setCreateShaderInstanceFunction(this._createShaderInstanceFun);
    }

    nativeCreateShaderInstance() {
        let instance = ShaderPass.createShaderInstance(this._pass, false, NativeShaderPass.TempDefine) as NativeShaderInstance;
        this.setCacheShader(NativeShaderPass.TempDefine, instance);
    }

    destory(): void {
        this._nativeObj.destroy();
    }

    setCacheShader(defines: DefineDatas, shaderInstance: NativeShaderInstance): void {
        this._nativeObj.setCacheShader(defines, shaderInstance._nativeObj);
    }

    getCacheShader(defines: DefineDatas): NativeShaderInstance {
        //TODO  不会调用到
        return null;
    }
}
