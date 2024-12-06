import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { GLESShaderInstance } from "../../OpenGLESDriver/RenderDevice/GLESShaderInstance";
import { IDefineDatas } from "../Design/IDefineDatas";
import { IShaderPassData } from "../Design/IShaderPassData";
import { RenderState } from "../Design/RenderState";
import { RTDefineDatas } from "./RTDefineDatas";
import { RTRenderState } from "./RTRenderState";

export class RTShaderPass implements IShaderPassData {
    private _validDefine: RTDefineDatas = new RTDefineDatas();
    private _createShaderInstanceFun: any;
    _nativeObj: any;
    static _globalCompileDefine: RTDefineDatas = null;
    is2D: boolean = false;
    private _pass: ShaderPass;
    constructor(pass: ShaderPass) {
        this._nativeObj = new (window as any).conchRTShaderPass();
        this._createShaderInstanceFun = this.nativeCreateShaderInstance.bind(this);
        this._nativeObj.setCreateShaderInstanceFunction(this._createShaderInstanceFun);
        this.renderState = new RTRenderState();
        this.renderState.setNull();
        this._pass = pass;
    }
    private _nodeCommonMap: string[];

    public get nodeCommonMap(): string[] {
        return this._nodeCommonMap;
    }

    public set nodeCommonMap(value: string[]) {
        this._nativeObj.setCommonUniformMap(value);
    }
    /** @internal */
    static getGlobalCompileDefine(): RTDefineDatas {
        if (!RTShaderPass._globalCompileDefine) {
            RTShaderPass._globalCompileDefine = new RTDefineDatas();
        }
        return RTShaderPass._globalCompileDefine;
    }
    public get statefirst(): boolean {
        return this._nativeObj._statefirst;
    }
    public set statefirst(value: boolean) {
        this._nativeObj._statefirst = value;
    }
    private _renderState: RenderState;
    public get renderState(): RenderState {
        return this._renderState;
    }
    public set renderState(value: RenderState) {
        this._renderState = value;
        this._nativeObj.setRenderState((value as any)._nativeObj);
    }
    public get pipelineMode(): string {
        return this._nativeObj._pipelineMode;
    }
    public set pipelineMode(value: string) {
        this._nativeObj._pipelineMode = value;
    }
    public get validDefine(): RTDefineDatas {
        return this._validDefine;
    }
    public set validDefine(value: RTDefineDatas) {
        this._validDefine = value;
        this._nativeObj.setValidDefine(value._nativeObj);
    }
    nativeCreateShaderInstance() {
        var shaderIns = this._pass.withCompile(RTShaderPass.getGlobalCompileDefine(), this._nativeObj.is2D) as GLESShaderInstance;
        return shaderIns._nativeObj;
    }
    destroy(): void {
        this._nativeObj.destroy();
    }

    setCacheShader(defines: IDefineDatas, shaderInstance: IShaderInstance): void {
        //@ts-ignore
        this._nativeObj.setCacheShader(defines._nativeObj, shaderInstance._nativeObj, shaderInstance);
    }

    getCacheShader(defines: IDefineDatas): IShaderInstance {
        //@ts-ignore
        return this._nativeObj.getCacheShader(defines._nativeObj);
    }
}
