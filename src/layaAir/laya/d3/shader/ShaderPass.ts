import { SubShader } from "././SubShader";
import { ShaderInstance } from "././ShaderInstance";
import { Shader3D } from "././Shader3D";
import { RenderState } from "../core/material/RenderState"
import { WebGL } from "../../webgl/WebGL"
import { InlcudeFile } from "../../webgl/utils/InlcudeFile"
import { ShaderCompile } from "../../webgl/utils/ShaderCompile"
import { ShaderNode } from "../../webgl/utils/ShaderNode"

/**
 * <code>ShaderPass</code> 类用于实现ShaderPass。
 */
export class ShaderPass extends ShaderCompile {
	/**@private */
	private _owner: SubShader;
	/**@private */
	_stateMap: any;
	/**@private */
	private _cacheSharders: any[];
	/**@private */
	private _publicValidDefine: number;
	/**@private */
	private _spriteValidDefine: number;
	/**@private */
	private _materialValidDefine: number;
	/**@private */
	private _renderState: RenderState = new RenderState();

	/**
	 * 获取渲染状态。
	 * @return 渲染状态。
	 */
	get renderState(): RenderState {
		return this._renderState;
	}

	constructor(owner: SubShader, vs: string, ps: string, stateMap: any) {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		super(vs, ps, null);
		this._owner = owner;
		this._cacheSharders = [];
		this._publicValidDefine = 0;
		this._spriteValidDefine = 0;
		this._materialValidDefine = 0;

		var publicDefineMap: any = this._owner._publicDefinesMap;
		var spriteDefineMap: any = this._owner._spriteDefinesMap;
		var materialDefineMap: any = this._owner._materialDefinesMap;
		for (var k in this.defs) {
			if (publicDefineMap[k] != null)
				this._publicValidDefine |= publicDefineMap[k];
			else if (spriteDefineMap[k] != null)
				this._spriteValidDefine |= spriteDefineMap[k];
			else if (materialDefineMap[k] != null)
				this._materialValidDefine |= materialDefineMap[k];
		}
		this._stateMap = stateMap;
	}

	/**
	 * @private
	 */
	private _definesToNameDic(value: number, int2Name: any[]): any {
		var o: any = {};
		var d: number = 1;
		for (var i: number = 0; i < 32; i++) {
			d = 1 << i;
			if (d > value) break;
			if (value & d) {
				var name: string = int2Name[d];
				o[name] = "";
			}
		}
		return o;
	}

		/**
		 * @inheritDoc
		 */
		/*override*/ protected _compileToTree(parent: ShaderNode, lines: any[], start: number, includefiles: any[], defs: any): void {
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
	 * @private
	 */
	withCompile(publicDefine: number, spriteDefine: number, materialDefine: number): ShaderInstance {
		publicDefine &= this._publicValidDefine;
		spriteDefine &= this._spriteValidDefine;
		materialDefine &= this._materialValidDefine;
		var shader: ShaderInstance;
		var spriteDefShaders: any[], materialDefShaders: any[];

		spriteDefShaders = this._cacheSharders[publicDefine];
		if (spriteDefShaders) {
			materialDefShaders = spriteDefShaders[spriteDefine];
			if (materialDefShaders) {
				shader = materialDefShaders[materialDefine];
				if (shader)
					return shader;
			} else {
				materialDefShaders = spriteDefShaders[spriteDefine] = [];
			}
		} else {
			spriteDefShaders = this._cacheSharders[publicDefine] = [];
			materialDefShaders = spriteDefShaders[spriteDefine] = [];
		}

		var publicDefGroup: any = this._definesToNameDic(publicDefine, this._owner._publicDefines);
		var spriteDefGroup: any = this._definesToNameDic(spriteDefine, this._owner._spriteDefines);
		var materialDefGroup: any = this._definesToNameDic(materialDefine, this._owner._materialDefines);
		var key: string;
		if (Shader3D.debugMode) {
			var publicDefGroupStr: string = "";
			for (key in publicDefGroup)
				publicDefGroupStr += key + " ";

			var spriteDefGroupStr: string = "";
			for (key in spriteDefGroup)
				spriteDefGroupStr += key + " ";

			var materialDefGroupStr: string = "";
			for (key in materialDefGroup)
				materialDefGroupStr += key + " ";

			if (!WebGL.shaderHighPrecision)
				publicDefine += Shader3D.SHADERDEFINE_HIGHPRECISION;//输出宏定义要保持设备无关性

			console.log("%cShader3DDebugMode---(Name:" + this._owner._owner._name + " PassIndex:" + this._owner._passes.indexOf(this) + " PublicDefine:" + publicDefine + " SpriteDefine:" + spriteDefine + " MaterialDefine:" + materialDefine + " PublicDefineGroup:" + publicDefGroupStr + " SpriteDefineGroup:" + spriteDefGroupStr + "MaterialDefineGroup: " + materialDefGroupStr + ")---ShaderCompile3DDebugMode", "color:green");
		}

		var defMap: any = {};
		var defineStr: string = "";
		if (publicDefGroup) {
			for (key in publicDefGroup) {
				defineStr += "#define " + key + "\n";
				defMap[key] = true;
			}
		}

		if (spriteDefGroup) {
			for (key in spriteDefGroup) {
				defineStr += "#define " + key + "\n";
				defMap[key] = true;
			}
		}

		if (materialDefGroup) {
			for (key in materialDefGroup) {
				defineStr += "#define " + key + "\n";
				defMap[key] = true;
			}
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

		materialDefShaders[materialDefine] = shader;
		return shader;
	}

}


