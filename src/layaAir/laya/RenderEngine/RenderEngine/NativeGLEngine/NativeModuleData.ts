import { NativeShaderInstance } from "../../../d3/RenderObjs/NativeOBJ/NativeShaderInstance";
import { IDefineDatas, IShaderPassData, ISubshaderData } from "../../RenderInterface/RenderPipelineInterface/IShaderInstance";

import { RenderState } from "../../RenderShader/RenderState";
import { ShaderDefine } from "../../RenderShader/ShaderDefine";
import { ShaderPass } from "../../RenderShader/ShaderPass";

export class NativeSubShader implements ISubshaderData {

    private _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchSubShader();
    }
    destroy(): void {
        //this._nativeObj.destroy  TODO
    }
    addShaderPass(pass: NativeShaderPass): void {
        this._nativeObj.addShaderPass(pass._nativeObj);//TODO 
    }
}

export class NativeShaderPass implements IShaderPassData {
    static TempDefine: NativeDefineDatas;//native 创建Shader要同步这个defineData
    pipelineMode: string;
    statefirst: boolean;
    validDefine: NativeDefineDatas = new NativeDefineDatas();
    private _createShaderInstanceFun: any;//想办法把这个传下去
    _nativeObj: any;
    private _pass: ShaderPass;
    constructor(pass: ShaderPass) {
        this._nativeObj = new (window as any).conchShaderPass();
        this._createShaderInstanceFun = this.nativeCreateShaderInstance.bind(this);
    }
    renderState: RenderState;

    nativeCreateShaderInstance() {
        let instance = ShaderPass.createShaderInstance(this._pass, false, NativeShaderPass.TempDefine) as NativeShaderInstance;
        this.setCacheShader(NativeShaderPass.TempDefine, instance);
    }

    destory(): void {
        //TODO
    }

    setCacheShader(defines: IDefineDatas, shaderInstance: NativeShaderInstance): void {
        this._nativeObj.setCacheShader(defines, shaderInstance._nativeObj);
    }

    getCacheShader(defines: IDefineDatas): NativeShaderInstance {
        //TODO  不会调用到
        return null;
    }
}

export class NativeDefineDatas implements IDefineDatas {
    _nativeobj: any;
    constructor() {
        this._nativeobj = new (window as any).conchDefineDatas();
    }
    private __length: number;
    get _length(): number {
        return this._nativeobj._length;
    }

    set _length(value: number) {
        this._nativeobj._length = value;
    }
    _mask: number[];
    _intersectionDefineDatas(define: NativeDefineDatas): void {
        this._nativeobj
    }
    add(define: ShaderDefine): void {
        throw new Error("Method not implemented.");
    }
    remove(define: ShaderDefine): void {
        throw new Error("Method not implemented.");
    }
    addDefineDatas(define: NativeDefineDatas): void {
        throw new Error("Method not implemented.");
    }
    removeDefineDatas(define: NativeDefineDatas): void {
        throw new Error("Method not implemented.");
    }
    has(define: ShaderDefine): boolean {
        throw new Error("Method not implemented.");
    }
    clear(): void {
        throw new Error("Method not implemented.");
    }
    cloneTo(destObject: NativeDefineDatas): void {
        throw new Error("Method not implemented.");
    }
    clone(): NativeDefineDatas {
        throw new Error("Method not implemented.");
    }
    destroy(): void {
        throw new Error("Method not implemented.");
    }

}

export class NativeShaderDefine extends ShaderDefine {
    _nativeobj: any;
    constructor(index: number, value: number) {
        super(index, value);
        this._nativeobj = new (window as any).conchShaderDefine(index, value);
    }
}