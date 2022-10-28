import { ILaya } from "../../../ILaya";
import { URL } from "../../net/URL";
import { IncludeFile } from "./IncludeFile";
import { ShaderNode } from "./ShaderNode";

export interface IShaderCompiledObj {
    vsNode: ShaderNode;
    psNode: ShaderNode;
    includeNames: Set<string>;
    defs: Set<string>;
};

type IncludeItem = { name: string, node: ShaderNode, codeName: string, file: IncludeFile };

const _clearCR: RegExp = new RegExp("\r", "g");
const _removeAnnotation: RegExp = new RegExp("(/\\*([^*]|[\\r\\\n]|(\\*+([^*/]|[\\r\\n])))*\\*+/)|(//.*)", "g");
const _reg: RegExp = new RegExp("(\".*\")|('.*')|([#\\w\\*-\\.+/()=<>{}\\\\]+)|([,;:\\\\])", "g");
const _splitToWordExps: RegExp = new RegExp("[(\".*\")]+|[('.*')]+|([ \\t=\\+\\-*/&%!<>!%\(\),;])", "g");
const _splitToWordExps3: RegExp = new RegExp("[ \\t=\\+\\-*/&%!<>!%\(\),;\\|]", "g");

/**
 * @private
 * <code>ShaderCompile</code> 类用于实现Shader编译。
 */
export class ShaderCompile {
    static IFDEF_NO: number = 0;
    static IFDEF_YES: number = 1;
    static IFDEF_ELSE: number = 2;
    static IFDEF_PARENT: number = 3;

    static includes: Record<string, IncludeFile> = {};

    static loadIncludeFileSync: (fileName: string) => void;

    static addInclude(fileName: string, txt: string, allowReplace?: boolean): IncludeFile {
        if (!txt || txt.length === 0) {
            console.error("shader include file err:" + fileName);
            return null;
        }

        if (!allowReplace && ShaderCompile.includes[fileName]) {
            console.warn("shader include file already exists:" + fileName);
            return ShaderCompile.includes[fileName];
        }

        txt = txt.replace(_clearCR, "");//CRLF风格需要先去掉“\r",否则切分字符会出错导致宏定义编译错误等
        let file = new IncludeFile(txt);
        ShaderCompile.includes[fileName] = file;
        return file;
    }

    static compile(vs: string, ps: string, basePath?: string): IShaderCompiledObj {
        let result: IShaderCompiledObj = {
            vsNode: new ShaderNode([]),
            psNode: new ShaderNode([]),
            includeNames: new Set(),
            defs: new Set()
        };

        let includes: Array<IncludeItem> = [];

        vs = vs.replace(_clearCR, "");//CRLF风格需要先去掉“\r",否则切分字符会出错导致宏定义编译错误等
        ps = ps.replace(_clearCR, "")

        ShaderCompile._compileToTree(result.vsNode, vs, result.defs, includes, basePath);
        ShaderCompile._compileToTree(result.psNode, ps, result.defs, includes, basePath);

        for (let inc of includes) {
            if (inc.file)
                result.includeNames.add(inc.name);
            else
                console.warn(`ShaderCompile missing file ${inc.name}`);
        }

        return result;
    }

    static compileAsync(vs: string, ps: string, basePath: string): Promise<IShaderCompiledObj> {
        let result: IShaderCompiledObj = {
            vsNode: new ShaderNode([]),
            psNode: new ShaderNode([]),
            includeNames: new Set(),
            defs: new Set()
        };

        let includes: Array<IncludeItem> = [];

        vs = vs.replace(_clearCR, "");
        ps = ps.replace(_clearCR, "")

        ShaderCompile._compileToTree(result.vsNode, vs, result.defs, includes, basePath);
        ShaderCompile._compileToTree(result.psNode, ps, result.defs, includes, basePath);

        return this._loadIncludesDeep(result, includes, 0);
    }

    private static _loadIncludesDeep(result: IShaderCompiledObj, includes: Array<IncludeItem>, index: number): Promise<IShaderCompiledObj> {
        let toLoad: Array<IncludeItem>;
        let includesCnt = includes.length;
        for (let i = index; i < includesCnt; i++) {
            let inc = includes[i];
            if (inc.file)
                result.includeNames.add(inc.name);
            else {
                if (!toLoad) toLoad = [];
                toLoad.push(inc);
            }
        }

        if (!toLoad)
            return Promise.resolve(result);

        return ILaya.loader.load(toLoad.map(tc => tc.name)).then(files => {
            let cnt = toLoad.length;
            for (let i = 0; i < cnt; i++) {
                let inc = toLoad[i];
                let file = files[i];
                if (!file) {
                    let childs = inc.node.parent.childs;
                    childs.splice(childs.indexOf(inc.node), 1);
                }
                else {
                    result.includeNames.add(inc.name);

                    let text = file.getWith(inc.codeName);
                    if (inc.node.condition)
                        inc.node.text = text;
                    else {
                        ShaderCompile._compileToTree(inc.node, text, result.defs, includes, URL.getPath(inc.name));
                        inc.node.text = "";
                    }
                }
            }
            if (includes.length > includesCnt)
                return ShaderCompile._loadIncludesDeep(result, includes, includesCnt);
            else
                return result;
        });
    }

    /**
     * @private
     */
    private static _compileToTree(parent: ShaderNode, script: string, defs: Set<string>, includes: Array<IncludeItem>, basePath: string): void {
        let node: ShaderNode, preNode: ShaderNode;
        let text: string, name: string, fname: string;
        let ofs: number, words: any[];
        let i: number, n: number, j: number;
        let lines = script.split("\n");

        for (i = 0; i < lines.length; i++) {
            text = lines[i];
            if (text.length < 1) continue;
            ofs = text.indexOf("//");
            if (ofs === 0) continue;
            if (ofs >= 0) text = text.substr(0, ofs);

            if ((ofs = text.indexOf("#")) < 0) {
                preNode = parent.childs[parent.childs.length - 1];
                let includefiles = parent.includefiles;
                if (preNode && !preNode.name) {
                    includefiles.length > 0 && ShaderCompile.splitToWords(text, preNode);
                    preNode.text += "\n" + text;
                    continue;
                }

                node = new ShaderNode(includefiles);
                node.text = text;
                node.noCompile = true;
                includefiles.length > 0 && ShaderCompile.splitToWords(text, node);
                node.setParent(parent);
                continue;
            }

            node = new ShaderNode(parent.includefiles);
            node.text = text;
            node.noCompile = true;

            name = "#";
            for (j = ofs + 1, n = text.length; j < n; j++) {
                let c: string = text.charAt(j);
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
                        node.text = node.text;
                    } else {
                        console.log("function():Boolean{return " + text.substr(ofs + node.name.length) + "}");
                    }
                    node.setParent(parent);
                    parent = node;

                    words = text.substr(j).split(_splitToWordExps3);
                    for (j = 0; j < words.length; j++) {
                        text = words[j];
                        text.length && defs.add(text);
                    }
                    break;

                case "#if":
                case "#elif":
                    node.src = text;
                    node.noCompile = true;
                    if (name == "#elif") {
                        parent = parent.parent;
                        preNode = parent.childs[parent.childs.length - 1];
                        //匹配"#ifdef"
                        preNode.text = preNode.src;
                        preNode.noCompile = true;
                        preNode.condition = null;
                    }
                    node.setParent(parent);
                    parent = node;

                    words = text.substr(j).split(_splitToWordExps3);
                    for (j = 0; j < words.length; j++) {
                        text = words[j];
                        text.length && text != "defined" && defs.add(text);
                    }
                    break;

                case "#else":
                    node.src = text;
                    parent = parent.parent;
                    preNode = parent.childs[parent.childs.length - 1];
                    node.noCompile = preNode.noCompile;
                    if (!node.noCompile) {
                        node.condition = preNode.condition;
                        node.conditionType = preNode.conditionType == ShaderCompile.IFDEF_YES ? ShaderCompile.IFDEF_ELSE : ShaderCompile.IFDEF_YES;
                        //node.text =  node.text + " " + preNode.text + " " + node.conditionType;
                    }
                    //递归节点树
                    node.setParent(parent);
                    parent = node;
                    break;

                case "#endif":
                    parent = parent.parent;
                    preNode = parent.childs[parent.childs.length - 1];
                    node.noCompile = preNode.noCompile;
                    if (!node.noCompile) {
                        node.text = node.text;
                    }
                    node.setParent(parent);
                    break;

                case "#include"://这里有问题,主要是空格
                    words = ShaderCompile.splitToWords(text, null);
                    let includeName: string = words[1];
                    let includeFile: IncludeFile;
                    if (includeName.startsWith("."))
                        includeName = URL.join(basePath, includeName);
                    includeFile = ShaderCompile.includes[includeName];

                    if (!includeFile && ShaderCompile.loadIncludeFileSync) {
                        ShaderCompile.loadIncludeFileSync(includeName);
                        includeFile = ShaderCompile.includes[includeName];
                    }

                    let codeName = words[2] == 'with' ? words[3] : null;
                    includes.push({ name: includeName, codeName: codeName, node: node, file: includeFile });
                    node.setParent(parent);

                    if ((ofs = words[0].indexOf("?")) < 0) {
                        if (includeFile) {
                            text = includeFile.getWith(codeName);
                            this._compileToTree(node, text, defs, includes, URL.getPath(includeName));
                        }
                        node.text = "";
                    }
                    else {
                        node.setCondition(words[0].substr(ofs + 1), ShaderCompile.IFDEF_YES);

                        if (includeFile)
                            node.text = includeFile.getWith(codeName);
                    }
                    break;

                case "#import":
                    words = ShaderCompile.splitToWords(text, null);
                    fname = words[1];
                    node.includefiles.push({ node: node, file: ShaderCompile.includes[fname], ofs: node.text.length });
                    break;

                default:
                    node.setParent(parent);
                    break;
            }
        }
    }

    static splitToWords(str: string, block: ShaderNode): any[] {//这里要修改
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
}



