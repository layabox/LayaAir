import { SubShader } from "./SubShader";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../webgl/utils/ShaderCompileDefineBase";
import { DefineDatas } from "../../RenderEngine/RenderShader/DefineDatas";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderVariantCollection } from "../../RenderEngine/RenderShader/ShaderVariantCollection";
import { IShaderCompiledObj } from "../../webgl/utils/ShaderCompile";
import { RenderState } from "./RenderState";
import { ShaderInstance } from "./ShaderInstance";
import { LayaGL } from "../../layagl/LayaGL";


/**
 * <code>ShaderPass</code> 类用于实现ShaderPass。
 */
export class ShaderPass extends ShaderCompileDefineBase {

    /** @internal */
    private _renderState: RenderState;
    /** @internal */
    _tags: any = {};
    /** @internal */
    _pipelineMode: string;
    /**@internal */
    _nodeUniformCommonMap: Array<string>;
    /** 优先 ShaderPass 渲染状态 */
    statefirst: boolean = false;

    /**
     * 渲染状态。
     */
    get renderState(): RenderState {
        return this._renderState;
    }

    constructor(owner: SubShader, compiledObj: IShaderCompiledObj) {
        super(owner, null, compiledObj);
        this._renderState = LayaGL.renderOBJCreate.createRenderState();
        this._renderState.setNull();
    }

    /**
     * @override
     * @internal
     */
    withCompile(compileDefine: DefineDatas, IS2d: boolean = false): ShaderInstance {
        compileDefine._intersectionDefineDatas(this._validDefine);

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
        var shader: ShaderInstance = cacheShaders[cacheKey];
        if (shader)
            return shader;

        let shaderProcessInfo: ShaderProcessInfo = new ShaderProcessInfo();
        shaderProcessInfo.is2D = IS2d;
        shaderProcessInfo.vs = this._VS;
        shaderProcessInfo.ps = this._PS;
        shaderProcessInfo.attributeMap = this._owner._attributeMap;
        shaderProcessInfo.uniformMap = this._owner._uniformMap;

        var defines: string[] = ShaderCompileDefineBase._defineStrings;
        defines.length = 0;
        Shader3D._getNamesByDefineData(compileDefine, defines);
        shaderProcessInfo.defineString = defines;

        shader = LayaGL.renderOBJCreate.createShaderInstance(shaderProcessInfo, this);

        cacheShaders[cacheKey] = shader;

        if (Shader3D.debugMode)
            ShaderVariantCollection.active.add(this, defines);

        return shader;
    }
}

