import { Config3D } from "../../../Config3D";
import { WebGL } from "../../webgl/WebGL";
import { RenderState } from "../core/material/RenderState";
import { Vector3 } from "../math/Vector3";
import { SubShader } from "./SubShader";
import { ShaderCompileDefineBase } from "../../webgl/utils/ShaderCompileDefineBase";
import { LayaGL } from "../../layagl/LayaGL";
import { RenderParams } from "../../RenderEngine/RenderEnum/RenderParams";
import { DefineDatas } from "../../RenderEngine/RenderShader/DefineDatas";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderVariant } from "../../RenderEngine/RenderShader/ShaderVariantCollection";
import { ShaderInstance } from "./ShaderInstance";
import { GLSLCodeGenerator } from "./GLSLCodeGenerator";

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
    _stateMap: { [key: string]: number };
    /** @internal */
    private _renderState: RenderState;
    /** @internal */
    _tags: any = {};
    /** @internal */
    _pipelineMode: string;
    /**设置这个参数，会优先ShaderPass设置的渲染状态 */
    statefirst: boolean = false;

    /**
     * 渲染状态。
     */
    get renderState(): RenderState {
        return this._renderState;
    }

    constructor(owner: SubShader, vs: string, ps: string, stateMap: { [key: string]: number }) {
        super(owner, vs, ps, null);
        this._stateMap = stateMap;
        this._renderState = LayaGL.renderOBJCreate.createRenderState();
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

    /**
     * @override
     * @internal
     */
    withCompile(compileDefine: DefineDatas): ShaderInstance {
        var debugDefineString: string[] = ShaderPass._debugDefineStrings;
        var debugDefineMask: number[] = ShaderPass._debugDefineMasks;
        var debugMaskLength: number;
        compileDefine._intersectionDefineDatas(this._validDefine);
        if (Shader3D.debugMode) {//add shader variant info to debug ShaderVariantCollection
            debugMaskLength = compileDefine._length;
            this._addDebugShaderVariantCollection(compileDefine, debugDefineString, debugDefineMask);
        }

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

        var defineString: string[] = ShaderPass._defineStrings;
        Shader3D._getNamesByDefineData(compileDefine, defineString);

        var clusterSlices: Vector3 = Config3D.lightClusterCount;
        var defMap: any = {};

        var vertexHead: string;
        var fragmentHead: string;
        var defineStr: string = "";

        // 拼接 shader attribute
        let attributeMap = this._owner._attributeMap;
        let uniformMap = this._owner._uniformMap;
        let useUniformBlock = Config3D._uniformBlock;
        let attributeglsl = GLSLCodeGenerator.glslAttributeString(attributeMap);
        let uniformglsl = GLSLCodeGenerator.glslUniformString(uniformMap, useUniformBlock);

        if (WebGL._isWebGL2) {
            vertexHead =
                `#version 300 es
#if defined(GL_FRAGMENT_PRECISION_HIGH)
    precision highp float;
    precision highp int;
#else
    precision mediump float;
    precision mediump int;
#endif
layout(std140, column_major) uniform;
#define attribute in
#define varying out
#define textureCube texture
#define texture2D texture
${attributeglsl}
${uniformglsl}
`;

            fragmentHead =
                `#version 300 es
#if defined(GL_FRAGMENT_PRECISION_HIGH)
    precision highp float;
    precision highp int;
#else
    precision mediump float;
    precision mediump int;
#endif
layout(std140, column_major) uniform;
#define varying in
out highp vec4 pc_fragColor;
#define gl_FragColor pc_fragColor
#define gl_FragDepthEXT gl_FragDepth
#define texture2D texture
#define textureCube texture
#define texture2DProj textureProj
#define texture2DLodEXT textureLod
#define texture2DProjLodEXT textureProjLod
#define textureCubeLodEXT textureLod
#define texture2DGradEXT textureGrad
#define texture2DProjGradEXT textureProjGrad
#define textureCubeGradEXT textureGrad
${uniformglsl}`;
        }
        else {
            vertexHead =
                `#if defined(GL_FRAGMENT_PRECISION_HIGH)
    precision highp float;
    precision highp int;
#else
    precision mediump float;
    precision mediump int;
#endif
${attributeglsl}
${uniformglsl}`;
            fragmentHead =
                `#ifdef GL_EXT_shader_texture_lod
    #extension GL_EXT_shader_texture_lod : enable
#endif

#if defined(GL_FRAGMENT_PRECISION_HIGH)
    precision highp float;
    precision highp int;
#else
    precision mediump float;
    precision mediump int;
#endif

#if !defined(GL_EXT_shader_texture_lod)
    #define texture1DLodEXT texture1D
    #define texture2DLodEXT texture2D
    #define texture2DProjLodEXT texture2DProj
    #define texture3DLodEXT texture3D
    #define textureCubeLodEXT textureCube
#endif
${uniformglsl}`;
        }

        // todo 
        defineStr += "#define MAX_LIGHT_COUNT " + Config3D.maxLightCount + "\n";
        defineStr += "#define MAX_LIGHT_COUNT_PER_CLUSTER " + Config3D._maxAreaLightCountPerClusterAverage + "\n";
        defineStr += "#define CLUSTER_X_COUNT " + clusterSlices.x + "\n";
        defineStr += "#define CLUSTER_Y_COUNT " + clusterSlices.y + "\n";
        defineStr += "#define CLUSTER_Z_COUNT " + clusterSlices.z + "\n";
        defineStr += "#define SHADER_CAPAILITY_LEVEL " + LayaGL.renderEngine.getParams(RenderParams.SHADER_CAPAILITY_LEVEL) + "\n";



        for (var i: number = 0, n: number = defineString.length; i < n; i++) {
            var def: string = defineString[i];
            defineStr += "#define " + def + "\n";
            defMap[def] = true;
        }

        var vs: any[] = this._VS.toscript(defMap, []);
        var vsVersion: string = '';
        if (vs[0].indexOf('#version') == 0) {
            vsVersion = vs[0] + '\n';
            vs.shift();
        }

        var ps: any[] = this._PS.toscript(defMap, []);
        var psVersion: string = '';
        if (ps[0].indexOf('#version') == 0) {
            psVersion = ps[0] + '\n';
            ps.shift();
        };
        // todo definestr
        shader = LayaGL.renderOBJCreate.createShaderInstance(vsVersion + vertexHead + defineStr + vs.join('\n'), psVersion + fragmentHead + defineStr + ps.join('\n'), this._owner._attributeMap, this);

        cacheShaders[cacheKey] = shader;

        if (Shader3D.debugMode) {
            var defStr: string = "";
            var defMask: string = "";
            for (var i: number = 0, n: number = debugMaskLength; i < n; i++)
                (i == n - 1) ? defMask += debugDefineMask[i] : defMask += debugDefineMask[i] + ",";
            for (var i: number = 0, n: number = debugDefineString.length; i < n; i++)
                (i == n - 1) ? defStr += debugDefineString[i] : defStr += debugDefineString[i] + ",";
            console.log("%cLayaAir: Shader Compile Information---ShaderName:" + this._owner._owner._name + " SubShaderIndex:" + this._owner._owner._subShaders.indexOf(this._owner) + " PassIndex:" + this._owner._passes.indexOf(this) + " DefineMask:[" + defMask + "]" + " DefineNames:[" + defStr + "]", "color:green");
        }
        return shader;
    }
}


