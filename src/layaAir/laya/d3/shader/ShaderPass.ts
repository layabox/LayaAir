import { Config3D } from "../../../Config3D";
import { InlcudeFile } from "../../webgl/utils/InlcudeFile";
import { ShaderCompile } from "../../webgl/utils/ShaderCompile";
import { ShaderNode } from "../../webgl/utils/ShaderNode";
import { RenderState } from "../core/material/RenderState";
import { Vector3 } from "../math/Vector3";
import { DefineDatas } from "./DefineDatas";
import { Shader3D } from "./Shader3D";
import { ShaderInstance } from "./ShaderInstance";
import { ShaderVariant } from "./ShaderVariantCollection";
import { SubShader } from "./SubShader";

/**
 * <code>ShaderPass</code> 类用于实现ShaderPass。
 */
export class ShaderPass extends ShaderCompile {
	/**@internal */
	private static _defineString: Array<string> = [];
	/**@internal */
	private static _debugDefineString: Array<string> = [];

	/**@internal */
	private _owner: SubShader;
	/**@internal */
	_stateMap: object;
	/**@internal */
	private _cacheSharders: object = {};
	/**@internal */
	private _cacheShaderHierarchy: number = 1;
	/**@internal */
	private _renderState: RenderState = new RenderState();

	/**@internal */
	_validDefine: DefineDatas = new DefineDatas();

	/**
	 * 获取渲染状态。
	 * @return 渲染状态。
	 */
	get renderState(): RenderState {
		return this._renderState;
	}

	constructor(owner: SubShader, vs: string, ps: string, stateMap: object) {
		super(vs, ps, null);
		this._owner = owner;
		this._stateMap = stateMap;
		for (var k in this.defs)
			this._validDefine.add(Shader3D.getDefineByName(k));
	}

	/**
	 * @inheritDoc
	 * @override
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
						parent = parent.parent;
						preNode = parent.childs[parent.childs.length - 1];
						node.setParent(parent);
						parent = node;
						continue;
					case "#endif":
						parent = parent.parent;
						preNode = parent.childs[parent.childs.length - 1];
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
	_resizeCacheShaderMap(cacheMap: object, hierarchy: number, resizeLength: number): void {
		var end: number = this._cacheShaderHierarchy - 1;
		if (hierarchy == end) {
			for (var k in cacheMap) {
				var shader: ShaderInstance = cacheMap[k];
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
	_addDebugShaderVariantCollection(compileDefine: DefineDatas): void {
		var dbugShaderVariantInfo: ShaderVariant = Shader3D._debugShaderVariantInfo;
		var debugSubShader: SubShader = this._owner;
		var debugShader: Shader3D = debugSubShader._owner;
		var deugDefines: string[] = ShaderPass._debugDefineString;
		Shader3D._getNamesByDefineData(compileDefine, deugDefines);
		if (!Config3D._config._multiLighting) {
			var index = deugDefines.indexOf("LEGACYSINGLELIGHTING");
			(index !== -1) && (deugDefines.splice(index, 1));
		}
		if (dbugShaderVariantInfo)
			dbugShaderVariantInfo.setValue(debugShader, debugShader._subShaders.indexOf(debugSubShader), debugSubShader._passes.indexOf(this), deugDefines);
		else
			Shader3D._debugShaderVariantInfo = dbugShaderVariantInfo = new ShaderVariant(debugShader, debugShader._subShaders.indexOf(debugSubShader), debugSubShader._passes.indexOf(this), deugDefines);
		Shader3D.debugShaderVariantCollection.add(dbugShaderVariantInfo);
	}


	/**
	 * @internal
	 */
	withCompile(compileDefine: DefineDatas): ShaderInstance {
		compileDefine._intersectionDefineDatas(this._validDefine);
		if (Shader3D.debugMode)//add shader variant info to debug ShaderVariantCollection
			this._addDebugShaderVariantCollection(compileDefine);

		var cacheShaders: object = this._cacheSharders;
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
			var subCacheShaders: object = cacheShaders[subMask];
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
		var defineStr: string = "#define MAX_LIGHT_COUNT " + config.maxLightCount + "\n";
		defineStr += "#define MAX_LIGHT_COUNT_PER_CLUSTER " + config._maxAreaLightCountPerClusterAverage + "\n";
		defineStr += "#define CLUSTER_X_COUNT " + clusterSlices.x + "\n";
		defineStr += "#define CLUSTER_Y_COUNT " + clusterSlices.y + "\n";
		defineStr += "#define CLUSTER_Z_COUNT " + clusterSlices.z + "\n";
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
		shader = new ShaderInstance(vsVersion + defineStr + vs.join('\n'), psVersion + defineStr + ps.join('\n'), this._owner._attributeMap || this._owner._owner._attributeMap, this._owner._uniformMap || this._owner._owner._uniformMap, this);

		cacheShaders[cacheKey] = shader;

		if (Shader3D.debugMode) {
			var defStr: string = "";
			var defMask: string = "";

			if (!config._multiLighting) {
				compileDefine.remove(Shader3D.SHADERDEFINE_LEGACYSINGALLIGHTING);
				var index = defineString.indexOf("LEGACYSINGLELIGHTING");
				(index !== -1) && (defineString.splice(index, 1));
			}

			for (var i: number = 0, n: number = compileDefine._length; i < n; i++)
				(i == n - 1) ? defMask += mask[i] : defMask += mask[i] + ",";
			for (var i: number = 0, n: number = defineString.length; i < n; i++)
				(i == n - 1) ? defStr += defineString[i] : defStr += defineString[i] + ",";

			console.log("%cLayaAir: Shader Compile Information---ShaderName:" + this._owner._owner._name + " SubShaderIndex:" + this._owner._owner._subShaders.indexOf(this._owner) + " PassIndex:" + this._owner._passes.indexOf(this) + " DefineMask:[" + defMask + "]" + " DefineNames:[" + defStr + "]", "color:green");
		}

		return shader;
	}


}


