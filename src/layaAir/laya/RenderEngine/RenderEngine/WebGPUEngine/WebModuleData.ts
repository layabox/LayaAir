import { IShaderInstance, IShaderPassData, ISubshaderData } from "../../RenderInterface/RenderPipelineInterface/IShaderInstance";
import { DefineDatas } from "../../RenderShader/DefineDatas";

export class WebSubShader implements ISubshaderData {
    destroy(): void {
        throw new Error("Method not implemented.");
    }
    addShaderPass(pass: IShaderPassData): void { }
}

export class WebShaderPass implements IShaderPassData {
    pipelineMode: string;
    statefirst: boolean;
    private _validDefine: DefineDatas;
    /** @internal */
    protected _cacheShaderHierarchy: number = 1;

    public get validDefine(): DefineDatas {
        return this._validDefine;
    }
    public set validDefine(value: DefineDatas) {
        this._validDefine = value;
    }
    /** @internal */
    protected _cacheSharders: { [key: number]: { [key: number]: { [key: number]: IShaderInstance } } } = {};

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


    setCacheShader(compileDefine: DefineDatas, shader: IShaderInstance): void {
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

    getCacheShader(compileDefine: DefineDatas): IShaderInstance {
        compileDefine._intersectionDefineDatas(this._validDefine);//去掉没有用到的宏对变量的影响
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
        var shader: IShaderInstance = cacheShaders[cacheKey];
        return shader;
    }

    destory(): void {
        //删除所有shader TODO
    }

}