import { UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ISubshaderData } from "../Design/ISubShaderData";
import { RTShaderPass } from "./RTShaderPass";

export class RTSubShader implements ISubshaderData {

    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchRTSubShader();
    }
    private _shaderName: string;
    public get shaderName(): string {
        return this._shaderName;
    }
    public set shaderName(value: string) {
        this._shaderName = value;
        this._nativeObj.shaderName = value;
    }

    private _pendingUniformMap: Map<number, UniformProperty> | null = null;
    private _uniformPropertyIds: Set<number> = new Set();
    setUniformMap(_uniformMap: Map<number, UniformProperty>): void {
        // 持有 live 引用：SubShader 构造时只含显式 uniform，include 绑定的 uniform 要到 addShaderPass
        // (在 _addIncludeUniform 之后) 才合并进同一个 Map。在 addShaderPass 时机再同步一次即可拿到它们。
        this._pendingUniformMap = _uniformMap;
        this._syncUniformProperties(_uniformMap);
    }

    // 按 id 去重逐个推给 native（多次调用安全，避免 UBO 成员重复/偏移错乱）
    private _syncUniformProperties(uniformMap: Map<number, UniformProperty>): void {
        uniformMap.forEach((value) => {
            if (this._uniformPropertyIds.has(value.id)) {
                return;
            }
            this._uniformPropertyIds.add(value.id);
            this._nativeObj.addUnifromProperty(value.id, value.propertyName, value.uniformtype, value.arrayLength);
        });
    }

    get enableInstance() {
        return this._nativeObj.enableInstance;
    }
    set enableInstance(value: boolean) {
        this._nativeObj.enableInstance = value;
    }
    destroy(): void {
        this._nativeObj.destroy();
    }
    addShaderPass(pass: RTShaderPass): void {
        // 此处晚于 SubShader._addShaderPass 里的 _addIncludeUniform，live map 已含 include uniform，
        // 再同步一次把它们补推给 native（否则 material UBO 缺这些成员 → setXxx 写不进 UBO → 读到 0，
        // 例如 ColorGradEffect 的 colorGrade uniform 全 0 导致 LUT bake 全黑、后期处理黑屏）。
        if (this._pendingUniformMap) {
            this._syncUniformProperties(this._pendingUniformMap);
        }
        this._nativeObj.addShaderPass(pass._nativeObj);
    }
}

