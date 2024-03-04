import { WebGPUShaderCompileCode, TypeOutData, enumOperator } from "./WebGPUShaderCompileCode";
import { WebGPUShaderToken } from "./WebGPUShaderToken";

export class WebGPUShaderCompileUtil {
    static checkDef(node: WebGPUShaderToken, _defs: Set<string>) {
        if (null == _defs) return;
        let arr = node.defParam as string[];
        if (arr) {
            for (let i = 0, len = arr.length; i < len; i++) {
                let str = arr[i];
                if ("#ifdef" == node.name || '#ifndef' == node.name) {
                    _defs.add(str);
                } else {
                    while (true) {
                        let ofs = str.indexOf("defined");
                        if (0 <= ofs) {
                            ofs = str.indexOf("(");
                            if (0 < ofs) {
                                let ofs2 = str.indexOf(")");
                                _defs.add(str.substring(ofs + 1, ofs2).trim());
                                str = str.substring(ofs2 + 1);
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                }
            }
        }
    }

    static toScript(root: WebGPUShaderToken, def?: Record<string, boolean>, outData?: TypeOutData) {
        if (null == def) def = {};
        let out = this._parseChilds(root, def);

        if (outData) {
            let st = WebGPUShaderCompileCode.compile(out);
            let uniform = st.uniform;
            let varying = st.varying;
            let attribute = st.attribute;

            let variable = st.variable;
            if (variable) {
                if (uniform) {
                    for (let k in uniform) {
                        if (variable.has(k)) {
                            if (null == outData.uniform) outData.uniform = {};
                            outData.uniform[k] = uniform[k];
                        }
                    }
                }
                if (varying) {
                    for (let k in varying) {
                        if (variable.has(k)) {
                            if (null == outData.varying) outData.varying = {};
                            outData.varying[k] = varying[k];
                        }
                    }
                }
                if (attribute) {
                    for (let k in attribute) {
                        if (variable.has(k)) {
                            if (null == outData.attribute) outData.attribute = {};
                            outData.attribute[k] = attribute[k];
                        }
                    }
                }
            }
            outData.variable = variable;
        }

        out = this.removeUniform(out);
        out = this.removeVarying(out);
        return out;
    }

    static removeUniform(code: string) {
        let arr = code.split("\n");
        let isParentRemove = false;
        let isUniformStruct = false;
        let isModify = false;
        for (let i = 0, len = arr.length; i < len; i++) {
            let cstr = arr[i].trim();
            if ('' == cstr) {
                arr.splice(i, 1);
                len -= 1;
                i -= 1;
            } else if (0 == cstr.indexOf("uniform ")) {
                isParentRemove = true;
                arr.splice(i, 1);
                len -= 1;
                i -= 1;
                isModify = true;
                if (0 < cstr.indexOf("{")) {
                    isUniformStruct = true;
                }
            } else {
                if (isParentRemove && !isUniformStruct) {
                    if (0 == cstr.indexOf("{")) {
                        isUniformStruct = true;
                        arr.splice(i, 1);
                        len -= 1;
                        i -= 1;
                    }
                } else if (isUniformStruct) {
                    if (0 <= cstr.indexOf("}")) {
                        isUniformStruct = false;
                    }
                    arr.splice(i, 1);
                    len -= 1;
                    i -= 1;
                }
                isParentRemove = false;
            }
        }
        if (isModify)
            code = arr.join('\n');

        return code;
    }

    static removeVarying(code: string) {
        let arr = code.split("\n");
        let isModify = false;
        for (let i = 0, len = arr.length; i < len; i++) {
            let cstr = arr[i].trim();
            if ('' == cstr) {
                arr.splice(i, 1);
                len -= 1;
                i -= 1;
            } else if (0 == cstr.indexOf("varying ")) {
                arr.splice(i, 1);
                len -= 1;
                i -= 1;
                isModify = true;
            }
        }
        if (isModify)
            code = arr.join('\n');

        return code;
    }

    static checkCondition(st: WebGPUShaderToken, def: Record<string, boolean>) {
        let childs = st.childs;
        let ret = false;
        if (null == childs) {
            return ret;
        }
        for (let i = 0, len = childs.length; i < len; i++) {
            let o = childs[i];
            if (enumOperator["&&"] == o.operator) {
                if (!ret) {
                    continue;
                }
            } else if (enumOperator["||"] == o.operator) {
                if (ret) {
                    continue;
                }
            }

            if ('defined' == o.name) {
                try {
                    let defName = o.parameter.childs[0].name;
                    let b = !!def[defName];
                    if (o.operator == enumOperator["!"]) b = !b;
                    ret = b;
                } catch (err) { }
            } else {
                if (null != o.name || null == o.operator || null != o.parameter) {
                    if (('' == o.name || null == o.name) && null != o.parameter) {
                        ret = this.checkCondition(o.parameter, def);
                    } else {
                        console.log("TODO:待处理判断", o);
                    }
                }
            }
        }
        return ret;
    }

    private static _parseChilds(parent: WebGPUShaderToken, def?: Record<string, boolean>) {
        let childs = parent.childs;
        let checkConditionType = 0;
        let out = '';
        if (null == childs) return out;
        for (let i = 0, len = childs.length; i < len; i++) {
            let t = childs[i];
            if ("#ifdef" == t.name || "#ifndef" == t.name || "#if" == t.name || "#elif" == t.name || "#else" == t.name) {
                if (1 == checkConditionType && ("#elif" == t.name || "#else" == t.name)) {
                    continue;
                }
                if (t.condition(def)) {
                    if ("#else" != t.name) {
                        checkConditionType = 1;
                    } else {
                        checkConditionType = 0;
                    }
                    out += this._parseChilds(t, def);
                } else {
                    checkConditionType = 0;
                }
            } else if (null != t.defParam) {
                if ('#define' == t.name) {
                    if (Array.isArray(t.defParam)) {
                        let arr = t.defParam;
                        if (1 == arr.length) {
                            def[arr[0]] = true;
                        } else {
                            //TODO 这里应该是define变量，待处理
                        }
                    } else {
                        console.log('TODO');
                    }
                } else if ('#undefine' == t.name) {
                    if (Array.isArray(t.defParam)) {
                        let arr = t.defParam;
                        if (1 == arr.length) {
                            delete def[arr[0]];
                        } else {
                            //TODO 这里应该是define变量，待处理
                        }
                    } else {
                        console.log('TODO');
                    }
                }

                //这里是#号开头的无脑添加到输出程序中的代码
                if (t.code)
                    out += t.code + "\n";
            } else {
                if (t.code && null == t.root) {
                    out += t.code + "\n";
                    //console.log(t.code);
                    //t.root = ShaderCompileCode.compile(t.code);
                }
                // if (t.root) {
                //     this._getUniforms(t.root, uniforms);
                //     out += t.code + "\n";
                // }
            }
        }
        return out;
    }
}