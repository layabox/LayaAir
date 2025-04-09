import { LayaGL } from "../../../../layagl/LayaGL";
import { IDefineDatas } from "../../../RenderModuleData/Design/IDefineDatas";
import { IComputeShader } from "./IComputeShader";

export class ComputeShader {
    /**@internal */
    static _CompileShader: { [key: string]: ComputeShader } = {};
    static createComputeShader(name: string, code: string, other: any) {
        if (!ComputeShader._CompileShader[name]) {
            return new ComputeShader(name, code, other);
        } else
            return ComputeShader._CompileShader[name];
    }

    /** @internal */
    protected _cacheSharders: { [key: number]: { [key: number]: { [key: number]: IComputeShader } } } = {};
    /** @internal */
    protected _cacheShaderHierarchy: number = 1;

    code: string;
    name: string;
    other: any;
    constructor(name: string, code: string, other: any) {
        this.name = name;
        this.code = code;
        this.other = other;
    }

    private setCacheShader(compileDefine: IDefineDatas, shader: IComputeShader): void {
        var cacheShaders: any = this._cacheSharders;
        var mask: Array<number> = compileDefine._mask;
        var endIndex: number = compileDefine._length - 1;
        var maxEndIndex: number = this._cacheShaderHierarchy - 1;
        for (var i: number = 0; i < maxEndIndex; i++) {
            var subMask: number = endIndex < i ? 0 : mask[i];
            var subCacheShaders = cacheShaders[subMask];
            (subCacheShaders) || (cacheShaders[subMask] = subCacheShaders = {});
            cacheShaders = subCacheShaders;
        }
        var cacheKey: number = endIndex < maxEndIndex ? 0 : mask[maxEndIndex];
        cacheShaders[cacheKey] = shader;
    }

    getCacheShader(compileDefine: IDefineDatas): IComputeShader {
        //compileDefine._intersectionDefineDatas(this._validDefine);//去掉没有用到的宏对变量的影响
        var cacheShaders: any = this._cacheSharders;
        var maskLength: number = compileDefine._length;
        if (maskLength > this._cacheShaderHierarchy) {//扩充已缓存ShaderMap
            this._resizeCacheShaderMap(cacheShaders, 0, maskLength);
            this._cacheShaderHierarchy = maskLength;
        }
        var mask: Array<number> = compileDefine._mask;
        var endIndex: number = compileDefine._length - 1;
        var maxEndIndex: number = this._cacheShaderHierarchy - 1;
        for (var i: number = 0; i < maxEndIndex; i++) {
            var subMask: number = endIndex < i ? 0 : mask[i];
            var subCacheShaders = cacheShaders[subMask];
            (subCacheShaders) || (cacheShaders[subMask] = subCacheShaders = {});
            cacheShaders = subCacheShaders;
        }

        var cacheKey: number = endIndex < maxEndIndex ? 0 : mask[maxEndIndex];
        var shader: IComputeShader = cacheShaders[cacheKey];
        if (!shader) {
            LayaGL.renderDeviceFactory.createComputeShader({
                name: this.name,
                code: this.code,
                other: this.other,//临时支持  等编译流程完备  会去掉
                defineData: compileDefine//是否需要宏来做shader的功能裁剪
            })
        }
        return shader;
    }

    /**
  * @internal
  */
    _resizeCacheShaderMap(cacheMap: any, hierarchy: number, resizeLength: number): void {
        var end: number = this._cacheShaderHierarchy - 1;
        if (hierarchy == end) {
            for (var k in cacheMap) {
                var shader = cacheMap[k];
                for (var i: number = 0, n: number = resizeLength - end; i < n; i++) {
                    if (i == n - 1)
                        cacheMap[0] = shader;//0替代(i == 0 ? k : 0),只扩不缩
                    else
                        cacheMap = cacheMap[i == 0 ? k : 0] = {};
                }
            }
        }
        else {
            ++hierarchy;
            for (var k in cacheMap)
                this._resizeCacheShaderMap(cacheMap[k], hierarchy, resizeLength);
        }
    }
}