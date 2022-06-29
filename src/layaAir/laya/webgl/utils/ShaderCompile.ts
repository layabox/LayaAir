import { LayaGL } from "../../layagl/LayaGL";
import { Shader } from "../shader/Shader";
import { InlcudeFile } from "./InlcudeFile";
import { ShaderNode } from "./ShaderNode";

/**
 * @private
 * <code>ShaderCompile</code> 类用于实现Shader编译。
 */
export class ShaderCompile {


	static IFDEF_NO: number = 0;
	static IFDEF_YES: number = 1;
	static IFDEF_ELSE: number = 2;
	static IFDEF_PARENT: number = 3;

	static _removeAnnotation: RegExp = new RegExp("(/\\*([^*]|[\\r\\\n]|(\\*+([^*/]|[\\r\\n])))*\\*+/)|(//.*)", "g");
	static _reg: RegExp = new RegExp("(\".*\")|('.*')|([#\\w\\*-\\.+/()=<>{}\\\\]+)|([,;:\\\\])", "g");
	static _splitToWordExps: RegExp = new RegExp("[(\".*\")]+|[('.*')]+|([ \\t=\\+\\-*/&%!<>!%\(\),;])", "g");

	static includes: any = {};
	static shaderParamsMap: any;

	private _nameMap: any;
	/** @internal */
	public _VS: ShaderNode;
	/** @internal */
	public _PS: ShaderNode;

	static addInclude(fileName: string, txt: string): void {
		if (!txt || txt.length === 0)
			throw new Error("add shader include file err:" + fileName);
		if (ShaderCompile.includes[fileName])
			return;
			//throw new Error("add shader include file err, has add:" + fileName);
		ShaderCompile.includes[fileName] = new InlcudeFile(txt);
	}

	static splitToWords(str: string, block: ShaderNode): any[]//这里要修改
	{
		var out: any[] = [];
		/*
		   var words:Array = str.split(_splitToWordExps);
		   trace(str);
		   trace(words);
		 */
		var c: string;
		var ofs: number = -1;
		var word: string;
		for (var i: number = 0, n: number = str.length; i < n; i++) {
			c = str.charAt(i);
			if (" \t=+-*/&%!<>()'\",;".indexOf(c) >= 0) {
				if (ofs >= 0 && (i - ofs) > 1) {
					word = str.substr(ofs, i - ofs);
					out.push(word);
				}
				if (c == '"' || c == "'") {
					var ofs2: number = str.indexOf(c, i + 1);
					if (ofs2 < 0) {
						throw "Sharder err:" + str;
					}
					out.push(str.substr(i + 1, ofs2 - i - 1));
					i = ofs2;
					ofs = -1;
					continue;
				}
				if (c == '(' && block && out.length > 0) {
					word = out[out.length - 1] + ";";
					if ("vec4;main;".indexOf(word) < 0)
						block.useFuns += word;
				}
				ofs = -1;
				continue;
			}
			if (ofs < 0) ofs = i;
		}
		if (ofs < n && (n - ofs) > 1) {
			word = str.substr(ofs, n - ofs);
			out.push(word);
		}
		return out;
	}

	static _clearCR: RegExp = new RegExp("\r", "g");
	public defs: Object = {};

	constructor(vs: string, ps: string, nameMap: any) {
		let _this = this;
		function _compile(script: string): ShaderNode {
			script = script.replace(ShaderCompile._clearCR, "");//CRLF风格需要先去掉“\r",否则切分字符会出错导致宏定义编译错误等
			var includefiles: any[] = [];
			var top: ShaderNode = new ShaderNode(includefiles);
			_this._compileToTree(top, script.split('\n'), 0, includefiles, _this.defs);
			return top;
		}

		//先要去掉注释,还没有完成
		var startTime: number = Date.now();
		this._VS = _compile(vs);
		this._PS = _compile(ps);
		this._nameMap = nameMap;
		if ((Date.now() - startTime) > 2)
			console.log("ShaderCompile use time:" + (Date.now() - startTime) + "  size:" + vs.length + "/" + ps.length);
	}

	static _splitToWordExps3: RegExp = new RegExp("[ \\t=\\+\\-*/&%!<>!%\(\),;\\|]", "g");

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
							node.text =  node.text;
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
						node.src = text;
						node.noCompile = true;
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
							node.text =  node.text + " " + preNode.text + " " + node.conditionType;
						}
						node.setParent(parent);
						parent = node;
						continue;
					case "#endif":
						parent = parent.parent;
						preNode = parent.childs[parent.childs.length - 1];
						node.noCompile = preNode.noCompile;
						if (!node.noCompile) {
							node.text =  node.text;
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

	createShader(define: any, shaderName: any, createShader: Function, bindAttrib: any[]): Shader {
		var defMap: any = {};
		var defineStr: string = "";
		if (define) {
			for (var i in define) {
				defineStr += "#define " + i + "\n";
				defMap[i] = true;
			}
		}
		var vs: any[] = this._VS.toscript(defMap, []);
		var ps: any[] = this._PS.toscript(defMap, []);
		return ((<Function>createShader) || (<Function>Shader.create))(defineStr + vs.join('\n'), defineStr + ps.join('\n'), shaderName, this._nameMap, bindAttrib);
	}

}



