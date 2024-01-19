import { SubShader } from "./SubShader";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../webgl/utils/ShaderCompileDefineBase";
import { DefineDatas } from "../../RenderEngine/RenderShader/DefineDatas";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderVariant } from "../../RenderEngine/RenderShader/ShaderVariantCollection";
import { IShaderCompiledObj } from "../../webgl/utils/ShaderCompile";
import { RenderState } from "./RenderState";
import { LayaGL } from "../../layagl/LayaGL";
import { IShaderInstance } from "../RenderInterface/RenderPipelineInterface/IShaderInstance";


/**
 * <code>ShaderPass</code> 类用于实现ShaderPass。
 */
export class ShaderPass extends ShaderCompileDefineBase {

    /** @internal */
    private static _defineStrings: Array<string> = [];
    /** @internal */
    private static _debugDefineStrings: string[] = [];
    /** @internal */
    private static _debugDefineMasks: number[] = [];
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
     * @internal
     */
    _addDebugShaderVariantCollection(compileDefine: DefineDatas, outDebugDefines: string[], outDebugDefineMask: number[]): void {
        var dbugShaderVariantInfo: ShaderVariant = Shader3D._debugShaderVariantInfo;
        var debugSubShader: SubShader = this._owner;
        var debugShader: Shader3D = debugSubShader._owner;
        var mask: number[] = compileDefine._mask;
        Shader3D._getNamesByDefineData(compileDefine, outDebugDefines);
        outDebugDefineMask.length = mask.length;
        for (var i: number = 0, n: number = mask.length; i < n; i++)
            outDebugDefineMask[i] = mask[i];

        if (dbugShaderVariantInfo)
            dbugShaderVariantInfo.setValue(debugShader, debugShader._subShaders.indexOf(debugSubShader), debugSubShader._passes.indexOf(this), outDebugDefines);
        else
            Shader3D._debugShaderVariantInfo = dbugShaderVariantInfo = new ShaderVariant(debugShader, debugShader._subShaders.indexOf(debugSubShader), debugSubShader._passes.indexOf(this), outDebugDefines);
        Shader3D.debugShaderVariantCollection.add(dbugShaderVariantInfo);
    }

    private _getCacheShader(compileDefine: DefineDatas) {
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
        var shader: IShaderInstance = cacheShaders[cacheKey];
        return shader;
    }

    private setCacheShader(compileDefine: DefineDatas, shader: IShaderInstance) {
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

    private _createShaderInstance(IS2d: boolean, compileDefine: DefineDatas): IShaderInstance {
        var shader: IShaderInstance;
        let shaderProcessInfo: ShaderProcessInfo = new ShaderProcessInfo();
        shaderProcessInfo.is2D = IS2d;
        shaderProcessInfo.vs = this._VS;
        shaderProcessInfo.ps = this._PS;
        shaderProcessInfo.attributeMap = this._owner._attributeMap;
        shaderProcessInfo.uniformMap = this._owner._uniformMap;

        var defineString: string[] = ShaderPass._defineStrings;
        Shader3D._getNamesByDefineData(compileDefine, defineString);
        shaderProcessInfo.defineString = defineString;

        shader = LayaGL.renderOBJCreate.createShaderInstance(shaderProcessInfo, this);
        return shader;
    }




    /**
     * @override
     * @internal
     */
    withCompile(compileDefine: DefineDatas, IS2d: boolean = false): IShaderInstance {

        // compileDefine._intersectionDefineDatas(this._validDefine);


        // var cacheShaders: any = this._cacheSharders;
        // var maskLength: number = compileDefine._length;
        // if (maskLength > this._cacheShaderHierarchy) {//扩充已缓存ShaderMap
        //     this._resizeCacheShaderMap(cacheShaders, 0, maskLength);
        //     this._cacheShaderHierarchy = maskLength;
        // }

        // var mask: Array<number> = compileDefine._mask;
        // var endIndex: number = compileDefine._length - 1;
        // var maxEndIndex: number = this._cacheShaderHierarchy - 1;
        // for (var i: number = 0; i < maxEndIndex; i++) {
        //     var subMask: number = endIndex < i ? 0 : mask[i];
        //     var subCacheShaders = cacheShaders[subMask];
        //     (subCacheShaders) || (cacheShaders[subMask] = subCacheShaders = {});
        //     cacheShaders = subCacheShaders;
        // }

        // var cacheKey: number = endIndex < maxEndIndex ? 0 : mask[maxEndIndex];
        // var shader: ShaderInstance = cacheShaders[cacheKey];
        var shader: IShaderInstance = this._getCacheShader(compileDefine);
        if (shader)
            return shader;
        var debugDefineString: string[] = ShaderPass._debugDefineStrings;
        var debugDefineMask: number[] = ShaderPass._debugDefineMasks;
        var debugMaskLength: number;
        if (Shader3D.debugMode) {//add shader variant info to debug ShaderVariantCollection
            debugMaskLength = compileDefine._length;
            this._addDebugShaderVariantCollection(compileDefine, debugDefineString, debugDefineMask);
        }
        shader = this._createShaderInstance(IS2d, compileDefine);
        this.setCacheShader(compileDefine, shader);
        if (Shader3D.debugMode) {
            var defStr: string = "";
            var defCommonStr: string = "";
            var defMask: string = "";
            var spriteCommonNode: string = "";
            for (var i: number = 0, n: number = debugMaskLength; i < n; i++) {
                (i == n - 1) ? defMask += debugDefineMask[i] : defMask += debugDefineMask[i] + ",";
            }
            // for (var i: number = 0, n: number = debugDefineString.length; i < n; i++){}
            //     (i == n - 1) ? defStr += debugDefineString[i] : defStr += debugDefineString[i] + ",";
            for (var i: number = 0, n: number = debugDefineString.length; i < n; i++) {
                if (Shader3D._configDefineValues.has(Shader3D.getDefineByName(debugDefineString[i])))
                    defCommonStr += debugDefineString[i] + ",";
                else
                    defStr += debugDefineString[i] + ",";
            }
            if (this.nodeCommonMap) {
                for (var j = 0; j < this.nodeCommonMap.length; j++) {
                    spriteCommonNode += this.nodeCommonMap[j] + ",";
                }
            }
            console.log("%cLayaAir: Shader Compile Information---ShaderName:" + this._owner._owner._name +
                " SubShaderIndex:" + this._owner._owner._subShaders.indexOf(this._owner) +
                " PassIndex:" + this._owner._passes.indexOf(this) +
                " DefineMask:[" + defMask + "]" +
                " DefineNames:[" + defStr + "]" +
                " Environment Macro DefineNames:[" + defCommonStr + "]" +
                "Sprite CommonNode:[" + spriteCommonNode + "]",
                "color:green");
        }
        return shader;
    }
}

