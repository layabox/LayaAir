import { ShaderInstance } from "../../d3/shader/ShaderInstance";
import { SubShader } from "../../d3/shader/SubShader";
import { LayaGL } from "../../layagl/LayaGL";
import { DefineDatas } from "../../RenderEngine/RenderShader/DefineDatas";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { WebGL } from "../WebGL";
import { IShaderCompiledObj } from "./ShaderCompile";
import { ShaderNode } from "./ShaderNode";

export class ShaderCompileDefineBase {
    /** @internal */
    static _defineString: Array<string> = [];
    /** @internal */
    static _debugDefineString: string[] = [];
    /** @internal */
    static _debugDefineMask: number[] = [];
    /** @internal */
    public _VS: ShaderNode;
    /** @internal */
    public _PS: ShaderNode;
    /** @internal */
    _defs: Set<string>;
    /** @internal */
    _validDefine: DefineDatas = new DefineDatas();
    /** @internal */
    protected _cacheShaderHierarchy: number = 1;
    /** @internal */
    protected _owner: SubShader;
    /** @internal */
    name: string;
    /** @internal */
    protected _cacheSharders: { [key: number]: { [key: number]: { [key: number]: ShaderInstance } } } = {};

    constructor(owner: any, name: string, compiledObj: IShaderCompiledObj) {
        this._owner = owner;
        this.name = name;
        this._VS = compiledObj.vsNode;
        this._PS = compiledObj.psNode;
        this._defs = compiledObj.defs;
        for (let k of compiledObj.defs)
            this._validDefine.add(Shader3D.getDefineByName(k));
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

    /**
     * @internal
     */
    withCompile(compileDefine: DefineDatas): ShaderInstance {
        var debugDefineString: string[] = ShaderCompileDefineBase._debugDefineString;
        var debugDefineMask: number[] = ShaderCompileDefineBase._debugDefineMask;
        var debugMaskLength: number;
        compileDefine._intersectionDefineDatas(this._validDefine);
        if (Shader3D.debugMode) {//add shader variant info to debug ShaderVariantCollection
            debugMaskLength = compileDefine._length;
        }
        //compileDefine.addDefineDatas(Scene3D._configDefineValues);

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

        var defineString: string[] = ShaderCompileDefineBase._defineString;
        //TODO
        Shader3D._getNamesByDefineData(compileDefine, defineString);

        // var config: Config3D = Config3D._config;
        // var clusterSlices: Vector3 = config.lightClusterCount;
        var defMap: any = {};

        var vertexHead: string;
        var fragmentHead: string;
        var defineStr: string = "";

        if (WebGL._isWebGL2) {
            vertexHead =
                `#version 300 es\n
                #define attribute in
                #define varying out
                #define textureCube texture
                #define texture2D texture\n`;
            fragmentHead =
                `#version 300 es\n
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
                #define textureCubeGradEXT textureGrad\n`;
        }
        else {
            vertexHead = ""
            fragmentHead =
                `#ifdef GL_EXT_shader_texture_lod
                    #extension GL_EXT_shader_texture_lod : enable
                #endif
                #if !defined(GL_EXT_shader_texture_lod)
                    #define texture1DLodEXT texture1D
                    #define texture2DLodEXT texture2D
                    #define texture2DProjLodEXT texture2DProj
                    #define texture3DLodEXT texture3D
                    #define textureCubeLodEXT textureCube
                #endif\n`;
        }


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
        }

        shader = LayaGL.renderOBJCreate.createShaderInstance(vsVersion + vertexHead + defineStr + vs.join('\n'), psVersion + fragmentHead + defineStr + ps.join('\n'), this._owner._attributeMap, this);

        cacheShaders[cacheKey] = shader;

        if (Shader3D.debugMode) {
            var defStr: string = "";
            var defMask: string = "";

            for (var i: number = 0, n: number = debugMaskLength; i < n; i++)
                (i == n - 1) ? defMask += debugDefineMask[i] : defMask += debugDefineMask[i] + ",";
            for (var i: number = 0, n: number = debugDefineString.length; i < n; i++)
                (i == n - 1) ? defStr += debugDefineString[i] : defStr += debugDefineString[i] + ",";

            console.log("%cLayaAir: Shader Compile Information---ShaderName:" + this.name + " " + " DefineMask:[" + defMask + "]" + " DefineNames:[" + defStr + "]", "color:green");
        }

        return shader;
    }
}