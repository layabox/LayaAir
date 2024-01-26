import { ShaderPass } from "../../../../RenderEngine/RenderShader/ShaderPass";
import { Transform3D } from "../../../../d3/core/Transform3D";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { IShaderInstance } from "../../../DriverDesign/RenderDevice/IShaderInstance";
import { ICameraNodeData, ISceneNodeData, IShaderPassData, ISubshaderData } from "../../Design/3D/I3DRenderModuleData";
import { RenderState } from "../../Design/RenderState";
import { WebDefineDatas } from "../WebDefineDatas";



export class WebCameraNodeData implements ICameraNodeData {
    transform: Transform3D;
    farplane: number;
    nearplane: number;
    fieldOfView: number;
    aspectRatio: number;
    _projectViewMatrix: Matrix4x4;
    constructor() {
        this._projectViewMatrix = new Matrix4x4();
    }
    setProjectionViewMatrix(value: Matrix4x4): void {
        value && value.cloneTo(this._projectViewMatrix);
    }
}

export class WebSceneNodeData implements ISceneNodeData {
    lightmapDirtyFlag: number;
}



export class WebSubShader implements ISubshaderData {
    destroy(): void {
        throw new Error("Method not implemented.");
    }
    addShaderPass(pass: WebShaderPass): void { }
}

export class WebShaderPass implements IShaderPassData {
    pipelineMode: string;
    statefirst: boolean;
    private _validDefine: WebDefineDatas;
    private _renderState: RenderState;
    public get renderState(): RenderState {
        return this._renderState;
    }
    public set renderState(value: RenderState) {
        this._renderState = value;
    }
    /** @internal */
    protected _cacheShaderHierarchy: number = 1;

    public get validDefine(): WebDefineDatas {
        return this._validDefine;
    }
    public set validDefine(value: WebDefineDatas) {
        this._validDefine = value;
    }
    /** @internal */
    protected _cacheSharders: { [key: number]: { [key: number]: { [key: number]: IShaderInstance } } } = {};

    constructor(pass: ShaderPass) {
        this._renderState = new RenderState();
        this._renderState.setNull();
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


    setCacheShader(compileDefine: WebDefineDatas, shader: IShaderInstance): void {
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

    getCacheShader(compileDefine: WebDefineDatas): IShaderInstance {
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