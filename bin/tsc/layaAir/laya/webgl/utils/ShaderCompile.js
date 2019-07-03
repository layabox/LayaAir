import { Shader } from "../shader/Shader";
import { InlcudeFile } from "./InlcudeFile";
import { ShaderNode } from "./ShaderNode";
/**
 * @private
 * <code>ShaderCompile</code> 类用于实现Shader编译。
 */
export class ShaderCompile {
    constructor(vs, ps, nameMap) {
        this.defs = {};
        let _this = this;
        function _compile(script) {
            script = script.replace(ShaderCompile._clearCR, ""); //CRLF风格需要先去掉“\r",否则切分字符会出错导致宏定义编译错误等
            var includefiles = [];
            var top = new ShaderNode(includefiles);
            _this._compileToTree(top, script.split('\n'), 0, includefiles, _this.defs);
            return top;
        }
        //先要去掉注释,还没有完成
        var startTime = Date.now();
        this._VS = _compile(vs);
        this._PS = _compile(ps);
        this._nameMap = nameMap;
        if ((Date.now() - startTime) > 2)
            console.log("ShaderCompile use time:" + (Date.now() - startTime) + "  size:" + vs.length + "/" + ps.length);
    }
    //TODO:coverage
    static _parseOne(attributes, uniforms, words, i, word, b) {
        var one = { type: ShaderCompile.shaderParamsMap[words[i + 1]], name: words[i + 2], size: isNaN(parseInt(words[i + 3])) ? 1 : parseInt(words[i + 3]) };
        if (b) {
            if (word == "attribute") {
                attributes.push(one);
            }
            else {
                uniforms.push(one);
            }
        }
        if (words[i + 3] == ':') {
            one.type = words[i + 4];
            i += 2;
        }
        i += 2;
        return i;
    }
    static addInclude(fileName, txt) {
        if (!txt || txt.length === 0)
            throw new Error("add shader include file err:" + fileName);
        if (ShaderCompile.includes[fileName])
            throw new Error("add shader include file err, has add:" + fileName);
        ShaderCompile.includes[fileName] = new InlcudeFile(txt);
    }
    //TODO:coverage
    static preGetParams(vs, ps) {
        var text = [vs, ps];
        var result = {};
        var attributes = [];
        var uniforms = [];
        var definesInfo = {};
        var definesName = [];
        result.attributes = attributes;
        result.uniforms = uniforms;
        result.defines = definesInfo;
        var i, n, one;
        for (var s = 0; s < 2; s++) {
            text[s] = text[s].replace(ShaderCompile._removeAnnotation, "");
            var words = text[s].match(ShaderCompile._reg);
            var tempelse;
            for (i = 0, n = words.length; i < n; i++) {
                var word = words[i];
                if (word != "attribute" && word != "uniform") {
                    if (word == "#define") {
                        word = words[++i];
                        definesName[word] = 1;
                        continue;
                    }
                    else if (word == "#ifdef") {
                        tempelse = words[++i];
                        var def = definesInfo[tempelse] = definesInfo[tempelse] || [];
                        for (i++; i < n; i++) {
                            word = words[i];
                            if (word != "attribute" && word != "uniform") {
                                if (word == "#else") {
                                    for (i++; i < n; i++) {
                                        word = words[i];
                                        if (word != "attribute" && word != "uniform") {
                                            if (word == "#endif") {
                                                break;
                                            }
                                            continue;
                                        }
                                        i = ShaderCompile._parseOne(attributes, uniforms, words, i, word, !definesName[tempelse]);
                                    }
                                }
                                continue;
                            }
                            i = ShaderCompile._parseOne(attributes, uniforms, words, i, word, definesName[tempelse]);
                        }
                    }
                    continue;
                }
                i = ShaderCompile._parseOne(attributes, uniforms, words, i, word, true);
            }
        }
        return result;
    }
    static splitToWords(str, block) {
        var out = [];
        /*
           var words:Array = str.split(_splitToWordExps);
           trace(str);
           trace(words);
         */
        var c;
        var ofs = -1;
        var word;
        for (var i = 0, n = str.length; i < n; i++) {
            c = str.charAt(i);
            if (" \t=+-*/&%!<>()'\",;".indexOf(c) >= 0) {
                if (ofs >= 0 && (i - ofs) > 1) {
                    word = str.substr(ofs, i - ofs);
                    out.push(word);
                }
                if (c == '"' || c == "'") {
                    var ofs2 = str.indexOf(c, i + 1);
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
            if (ofs < 0)
                ofs = i;
        }
        if (ofs < n && (n - ofs) > 1) {
            word = str.substr(ofs, n - ofs);
            out.push(word);
        }
        return out;
    }
    /**
     * @private
     */
    _compileToTree(parent, lines, start, includefiles, defs) {
        var node, preNode;
        var text, name, fname;
        var ofs, words, noUseNode;
        var i, n, j;
        for (i = start; i < lines.length; i++) {
            text = lines[i];
            if (text.length < 1)
                continue;
            ofs = text.indexOf("//");
            if (ofs === 0)
                continue;
            if (ofs >= 0)
                text = text.substr(0, ofs);
            node = noUseNode || new ShaderNode(includefiles);
            noUseNode = null;
            node.text = text;
            node.noCompile = true;
            if ((ofs = text.indexOf("#")) >= 0) {
                name = "#";
                for (j = ofs + 1, n = text.length; j < n; j++) {
                    var c = text.charAt(j);
                    if (c === ' ' || c === '\t' || c === '?')
                        break;
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
                        }
                        else {
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
                            node.text = "//" + node.text + " " + preNode.text + " " + node.conditionType;
                        }
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
                    case "#include": //这里有问题,主要是空格
                        words = ShaderCompile.splitToWords(text, null);
                        var inlcudeFile = ShaderCompile.includes[words[1]];
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
            }
            else {
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
    createShader(define, shaderName, createShader, bindAttrib) {
        var defMap = {};
        var defineStr = "";
        if (define) {
            for (var i in define) {
                defineStr += "#define " + i + "\n";
                defMap[i] = true;
            }
        }
        var vs = this._VS.toscript(defMap, []);
        var ps = this._PS.toscript(defMap, []);
        return (createShader || Shader.create)(defineStr + vs.join('\n'), defineStr + ps.join('\n'), shaderName, this._nameMap, bindAttrib);
    }
}
ShaderCompile.IFDEF_NO = 0;
ShaderCompile.IFDEF_YES = 1;
ShaderCompile.IFDEF_ELSE = 2;
ShaderCompile.IFDEF_PARENT = 3;
ShaderCompile._removeAnnotation = new RegExp("(/\\*([^*]|[\\r\\\n]|(\\*+([^*/]|[\\r\\n])))*\\*+/)|(//.*)", "g");
ShaderCompile._reg = new RegExp("(\".*\")|('.*')|([#\\w\\*-\\.+/()=<>{}\\\\]+)|([,;:\\\\])", "g");
ShaderCompile._splitToWordExps = new RegExp("[(\".*\")]+|[('.*')]+|([ \\t=\\+\\-*/&%!<>!%\(\),;])", "g");
ShaderCompile.includes = {};
ShaderCompile.shaderParamsMap = { "float": WebGL2RenderingContext.FLOAT, "int": WebGL2RenderingContext.INT, "bool": WebGL2RenderingContext.BOOL, "vec2": WebGL2RenderingContext.FLOAT_VEC2, "vec3": WebGL2RenderingContext.FLOAT_VEC3, "vec4": WebGL2RenderingContext.FLOAT_VEC4, "ivec2": WebGL2RenderingContext.INT_VEC2, "ivec3": WebGL2RenderingContext.INT_VEC3, "ivec4": WebGL2RenderingContext.INT_VEC4, "bvec2": WebGL2RenderingContext.BOOL_VEC2, "bvec3": WebGL2RenderingContext.BOOL_VEC3, "bvec4": WebGL2RenderingContext.BOOL_VEC4, "mat2": WebGL2RenderingContext.FLOAT_MAT2, "mat3": WebGL2RenderingContext.FLOAT_MAT3, "mat4": WebGL2RenderingContext.FLOAT_MAT4, "sampler2D": WebGL2RenderingContext.SAMPLER_2D, "samplerCube": WebGL2RenderingContext.SAMPLER_CUBE };
ShaderCompile._clearCR = new RegExp("\r", "g");
ShaderCompile._splitToWordExps3 = new RegExp("[ \\t=\\+\\-*/&%!<>!%\(\),;\\|]", "g");
