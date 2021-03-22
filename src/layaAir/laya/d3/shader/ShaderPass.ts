import { Config3D } from "../../../Config3D";
import { SystemUtils } from "../../webgl/SystemUtils";
import { InlcudeFile } from "../../webgl/utils/InlcudeFile";
import { ShaderCompile } from "../../webgl/utils/ShaderCompile";
import { ShaderNode } from "../../webgl/utils/ShaderNode";
import { WebGL } from "../../webgl/WebGL";
import { RenderState } from "../core/material/RenderState";
import { Vector3 } from "../math/Vector3";
import { DefineDatas } from "./DefineDatas";
import { Shader3D } from "./Shader3D";
import { ShaderInstance } from "./ShaderInstance";
import { ShaderVariant } from "./ShaderVariantCollection";
import { SubShader } from "./SubShader";
import { Scene3D } from "../core/scene/Scene3D";

/**
 * <code>ShaderPass</code> 类用于实现ShaderPass。
 */
export class ShaderPass extends ShaderCompile {
	/** @internal */
	private static _defineString: Array<string> = [];
	/** @internal */
	private static _debugDefineString: string[] = [];
	/** @internal */
	private static _debugDefineMask: number[] = [];

	/** @internal */
	private _owner: SubShader;
	/** @internal */
	_stateMap:  {[key:string]:number} ;
	/** @internal */
	private _cacheSharders: {[key:number]:{[key:number]:{[key:number]:ShaderInstance}}} = {};
	/** @internal */
	private _cacheShaderHierarchy: number = 1;
	/** @internal */
	private _renderState: RenderState = new RenderState();

	/** @internal */
	_validDefine: DefineDatas = new DefineDatas();
	/** @internal */
	_tags: any = {};
	/** @internal */
	_pipelineMode: string;

	/**
	 * 渲染状态。
	 */
	get renderState(): RenderState {
		return this._renderState;
	}

	constructor(owner: SubShader, vs: string, ps: string, stateMap:  {[key:string]:number} ) {
		super(vs, ps, null);
		this._owner = owner;
		this._stateMap = stateMap;
		for (var k in this.defs)
			this._validDefine.add(Shader3D.getDefineByName(k));
	}

	/**
	 * @private
	 */
	protected _compileToTree(parent: ShaderNode, lines: any[], start: number, includefiles: any[], defs: any): void {
		var node: ShaderNode, preNode: ShaderNode;
		var text: string, name: string, fname: string;
		var ofs: number, words: any[], noUseNode: ShaderNode;
		var i: number, n: number, j: number;
		
		for (i = start; i < lines.length; i++) {
			text = lines[i];
			if (text.length < 1) continue;
			ofs = text.indexOf("//");
			if (ofs === 0) continue;
			if (ofs >= 0) text = text.substr(0, ofs);
			node = noUseNode || new ShaderNode(includefiles);
			noUseNode = null;
			node.text = text;
			node.noCompile = true;

			if ((ofs = text.indexOf("#")) >= 0) {
				name = "#";
				for (j = ofs + 1, n = text.length; j < n; j++) {
					var c: string = text.charAt(j);
					if (c === ' ' || c === '\t' || c === '?') break;
					name += c;
				}
				node.name = name;
				switch (name) {
					case "#ifdef":
					case "#ifndef":
						node.src = text;
						node.noCompile = text.match(/[!&|()=<>]/) != null;
						if (!node.noCompile) {
							words = text.replace(/^\s*/, '').split(/\s+/);
							node.setCondition(words[1], name === "#ifdef" ? ShaderCompile.IFDEF_YES : ShaderCompile.IFDEF_ELSE);
							node.text = "//" + node.text;
						} else {
							console.log("function():Boolean{return " + text.substr(ofs + node.name.length) + "}");
						}
						node.setParent(parent);
						parent = node;
						if (defs) {
							words = text.substr(j).split(ShaderCompile._splitToWordExps3);
							for (j = 0; j < words.length; j++) {
								text = words[j];
								text.length && (defs[text] = true);
							}
						}
						continue;
					case "#if":
					case "#elif":
						node.src = text;
						node.noCompile = true;
                        if(name=="#elif"){
                            parent = parent.parent;
                            preNode = parent.childs[parent.childs.length - 1];
                            //匹配"#ifdef"
                            preNode.text = preNode.src;
                            preNode.noCompile = true;
                            preNode.condition = null;
                        }
						node.setParent(parent);
                        parent = node;
                        
						if (defs) {
							words = text.substr(j).split(ShaderCompile._splitToWordExps3);
							for (j = 0; j < words.length; j++) {
								text = words[j];
								text.length && text != "defined" && (defs[text] = true);
							}
						}
						continue;
					case "#else":
						node.src = text;
						parent = parent.parent;
						preNode = parent.childs[parent.childs.length - 1];
						node.noCompile = preNode.noCompile;
						if (!node.noCompile) {
							node.condition = preNode.condition;
							node.conditionType = preNode.conditionType == ShaderCompile.IFDEF_YES ? ShaderCompile.IFDEF_ELSE : ShaderCompile.IFDEF_YES;
							node.text = "//" + node.text + " " + preNode.text + " " + node.conditionType;
						}
						//递归节点树
						node.setParent(parent);
						parent = node;
						continue;
					case "#endif":
						parent = parent.parent;
						preNode = parent.childs[parent.childs.length - 1];
						node.noCompile = preNode.noCompile;
						if (!node.noCompile) {
							node.text = "//" + node.text;
						}
						node.setParent(parent);
						continue;
					case "#include"://这里有问题,主要是空格
						words = ShaderCompile.splitToWords(text, null);
						var inlcudeFile: InlcudeFile = ShaderCompile.includes[words[1]];
						if (!inlcudeFile) {
							throw "ShaderCompile error no this include file:" + words[1];
						}
						if ((ofs = words[0].indexOf("?")) < 0) {
							node.setParent(parent);
							text = inlcudeFile.getWith(words[2] == 'with' ? words[3] : null);
							this._compileToTree(node, text.split('\n'), 0, includefiles, defs);
							node.text = "";
							continue;
						}
						node.setCondition(words[0].substr(ofs + 1), ShaderCompile.IFDEF_YES);
						node.text = inlcudeFile.getWith(words[2] == 'with' ? words[3] : null);
						break;
					case "#import":
						words = ShaderCompile.splitToWords(text, null);
						fname = words[1];
						includefiles.push({ node: node, file: ShaderCompile.includes[fname], ofs: node.text.length });
						continue;
				}
			} else {
				preNode = parent.childs[parent.childs.length - 1];
				if (preNode && !preNode.name) {
					includefiles.length > 0 && ShaderCompile.splitToWords(text, preNode);
					noUseNode = node;
					preNode.text += "\n" + text;
					continue;
				}
				includefiles.length > 0 && ShaderCompile.splitToWords(text, node);
			}
			node.setParent(parent);
		}
	}


	/**
	 * @internal
	 */
	_resizeCacheShaderMap(cacheMap:any, hierarchy: number, resizeLength: number): void {
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
			this._cacheShaderHierarchy = resizeLength;
		}
		else {
			for (var k in cacheMap)
				this._resizeCacheShaderMap(cacheMap[k], ++hierarchy, resizeLength);
		}
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
	 * @internal
	 */
	withCompile(compileDefine: DefineDatas): ShaderInstance {
		var debugDefineString: string[] = ShaderPass._debugDefineString;
		var debugDefineMask: number[] = ShaderPass._debugDefineMask;
		var debugMaskLength: number;
		compileDefine._intersectionDefineDatas(this._validDefine);
		if (Shader3D.debugMode) {//add shader variant info to debug ShaderVariantCollection
			debugMaskLength = compileDefine._length;
			this._addDebugShaderVariantCollection(compileDefine, debugDefineString, debugDefineMask);
		}
		compileDefine.addDefineDatas(Scene3D._configDefineValues);

		var cacheShaders:any = this._cacheSharders;
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

		var defineString: string[] = ShaderPass._defineString;
		Shader3D._getNamesByDefineData(compileDefine, defineString);

		var config: Config3D = Config3D._config;
		var clusterSlices: Vector3 = config.lightClusterCount;
		var defMap: any = {};

		var vertexHead: string;
		var fragmentHead: string;
		var defineStr: string = "";

		if (WebGL._isWebGL2) {
			vertexHead =
				`#version 300 es\n
				#define attribute in
				#define varying out
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


		defineStr += "#define MAX_LIGHT_COUNT " + config.maxLightCount + "\n";
		defineStr += "#define MAX_LIGHT_COUNT_PER_CLUSTER " + config._maxAreaLightCountPerClusterAverage + "\n";
		defineStr += "#define CLUSTER_X_COUNT " + clusterSlices.x + "\n";
		defineStr += "#define CLUSTER_Y_COUNT " + clusterSlices.y + "\n";
		defineStr += "#define CLUSTER_Z_COUNT " + clusterSlices.z + "\n";
		defineStr += "#define SHADER_CAPAILITY_LEVEL " + SystemUtils._shaderCapailityLevel + "\n";

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
		//TODO:动态切换Attribute
		//var attibuteMap = Shader3D.getAttributeMapByDefine(defineString,this._owner._attributeMap);
		shader = new ShaderInstance(vsVersion + vertexHead + defineStr + vs.join('\n'), psVersion + fragmentHead + defineStr + ps.join('\n'),this._owner._attributeMap , this._owner._uniformMap || this._owner._owner._uniformMap, this);

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

	/**
	 * 添加标记。
	 * @param key 标记键。
	 * @param value 标记值。
	 */
	setTag(key: string, value: string): void {
		if (value)
			this._tags[key] = value;
		else
			delete this._tags[key];
	}

	/**
	 * 获取标记值。
	 * @return key 标记键。
	 */
	getTag(key: string): string {
		return this._tags[key];
	}
}


