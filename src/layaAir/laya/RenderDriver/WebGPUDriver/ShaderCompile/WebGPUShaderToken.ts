import { WebGPUShaderCompileCode, TypeOut, enumDescribe, enumInOut, enumOperator } from "./WebGPUShaderCompileCode";
import { WebGPUShaderCompileUtil } from "./WebGPUShaderCompileUtil";

export class WebGPUShaderToken {
    uniform: Record<string, TypeOut>;
    variable: Set<string>;
    structs: Record<string, WebGPUShaderToken>;
    varying: Record<string, TypeOut>;
    attribute: Record<string, TypeOut>;

    /**是否是赋值状态 */
    assign: boolean;
    /**类似于+=、-=、/=、*=、>>=、<<=这种逻辑 */
    assignLeft: enumOperator;
    includefiles: any[];
    describe: enumDescribe;
    childs: WebGPUShaderToken[];
    parent: WebGPUShaderToken;
    inOrOut: enumInOut;
    /**如果是函数，这里就是函数名，否则是变量名,或者是精度定义 */
    name: string;

    /**原始未解析的代码 */
    code: string;
    /**用原始code分析出来的语法树 */
    root: WebGPUShaderToken;
    /**节点的类型，例如vec4，float...如果是函数，则是函数的返回值,还有可能是参数的分隔符,或者?或者: */
    type: string;
    /**操作符，例如=、+、-、*、/ */
    operator: enumOperator;
    /**操作符是在name的左侧还是右侧，通常是用于++和--，但是有时也会用于= */
    operatorRight: boolean;
    /**函数类型的话会有这些参数数据 */
    parameter: WebGPUShaderToken;

    /**这里是数组参数a[][]这种，支持多维数组 */
    parameterArr: WebGPUShaderToken[];

    /**参数数据的数据源 */
    owner: WebGPUShaderToken;
    /**ifdef的参数 */
    defParam: string[] | WebGPUShaderToken;
    /**这里是uniform或者struct后面默认追加变量定义的地方 */
    varNames: string[];
    z = 0;

    constructor(includefiles?: any[]) {
        if (includefiles) {
            this.includefiles = includefiles;
        } else {
            this.includefiles = [];
        }
    }
    condition(def: Record<string, boolean>) {
        if ('#else' == this.name) return true;
        if (null != def) {
            if ("#ifdef" == this.name || "#ifndef" == this.name) {
                try {
                    let check = (this.defParam as any)[0];
                    return ("#ifdef" == this.name) == !!def[check];
                } catch (err) { }
            } else {
                if (!(this.defParam instanceof WebGPUShaderToken)) {
                    let defParm = this.defParam.join(" ");
                    let parmRoot = WebGPUShaderCompileCode.compile(defParm);
                    this.defParam = parmRoot;
                }
                return WebGPUShaderCompileUtil.checkCondition(this.defParam, def);
            }
        } else if ("#ifndef" == this.name) {
            return true;
        }
        return false;
    }
    addParameterArr(param: WebGPUShaderToken, parent?: WebGPUShaderToken) {
        if (null == this.parameterArr) {
            this.parameterArr = [];
        }
        this.parameterArr.push(param);
        param.owner = this;
        if (parent) {
            param.parent = parent;
        }
    }
    setParameter(param: WebGPUShaderToken, parent?: WebGPUShaderToken) {
        this.parameter = param;
        param.owner = this;
        if (parent)
            param.parent = parent;
    }
    addBody(body: WebGPUShaderToken) {
        body.setParent(this);
    }
    setParent(parent: WebGPUShaderToken) {
        if (null == parent.childs) {
            parent.childs = [];
        }
        parent.childs.push(this);
        this.z = parent.z + 1;
        this.parent = parent;
    }

    private _parseShaderNode(sn: WebGPUShaderToken) {
        let ret = '';
        let operator: string = null;
        if (null != sn.operator) {
            operator = enumOperator[sn.operator];
            if (!sn.operatorRight) {
                ret += operator;
                operator = null;
            }
        }
        if (sn.type) {
            if (null != sn.describe) {
                ret += enumDescribe[sn.describe] + " ";
            }
            if (null != sn.inOrOut) {
                ret += enumInOut[sn.inOrOut] + " ";
            }
            if (null != sn.type) {
                ret += sn.type + " ";
            }
            if (null != sn.name) {
                ret += sn.name;
            }
            if (null != sn.parameter) {
                //这一般是sn.type是?或者:
                let childs = sn.parameter.childs;
                if (childs) {
                    ret += '(';
                    for (let i = 0, len = childs.length; i < len; i++) {
                        ret += this._parseShaderNode(childs[i]);
                    }
                    ret += ')';
                }
            }
        } else if (sn.parameter) {
            if (null != sn.name) {
                ret += sn.name;
            }
            if (null != operator) {
                //if(a!=(b))应该是这种情况
                ret += operator;
                operator = null;
            }
            ret += '(' + this._getParameter(sn.parameter) + ")";
        } else if (sn.parameterArr) {
            ret += this._getParameterArr(sn, '');
        } else if (sn.name) {
            ret += sn.name;
        }
        if (null != operator) {
            ret += operator;
        }
        if (null != sn.childs) {
            for (let i = 0, len = sn.childs.length; i < len; i++) {
                ret += this._parseShaderNode(sn.childs[i]);
            }
        }
        return ret;
    }
    private _getParameter(param?: WebGPUShaderToken, isFor = false) {
        let ret = '';
        if (null == param) {
            param = this.parameter;
        }
        if (param) {
            if (param.childs) {
                let arr = param.childs;
                for (let i = 0, len = arr.length; i < len; i++) {
                    let sn = arr[i];
                    ret += this._parseShaderNode(sn);
                    if (isFor && i < len - 1) {
                        ret += ';';
                    }
                }
            } else {
                ret += this._parseShaderNode(param)
            }
        }
        return ret;
    }

    private _getParameterArr(st: WebGPUShaderToken, end = ';') {
        let outStr = '';
        if (null != st.type) {
            outStr += st.type + " ";
        }
        let operator: string;
        if (null != st.operator && '' != end) {
            operator = enumOperator[st.operator];
            if (!st.operatorRight) {
                outStr += operator;
                operator = null;
            }
        }
        let arr = st.parameterArr;
        if (null != st.name) {
            outStr += st.name;
        }
        for (let i = 0, len = arr.length; i < len; i++) {
            outStr += "[" + st._getParameter(arr[i]) + "]";
        }
        if (null != operator) {
            outStr += operator;
        }
        if (st.assign) {
            if (null != st.assignLeft) {
                outStr += enumOperator[st.assignLeft];
            }
            outStr += "=";
        }
        if (st.childs) {
            outStr += st._getParameter(st);
        }
        return outStr + end;
    }
    toscript(def?: Record<string, boolean>, out?: string[]) {
        if (null == out) {
            out = [];
        }
        if (this.type) {
            if ("return" == this.type) {
                //这里是返回逻辑
                let outStr = this.type + " ";
                if (this.name) {
                    outStr += this.name;
                }
                if (this.parameter) {
                    outStr += "(" + this._getParameter() + ")";
                }
                if (null != this.childs) {
                    outStr += this._getParameter(this);
                }
                outStr += ";"
                out.push(outStr);
            } else if (this.parameter) {
                //这里应该是个函数
                let outStr = this.type + " " + this.name + "(" + this._getParameter() + "){";
                if (null != this.describe) {
                    outStr = enumDescribe[this.describe] + " " + outStr;
                }
                out.push(outStr);
                if (this.childs) {
                    for (let i = 0, len = this.childs.length; i < len; i++) {
                        this.childs[i].toscript(def, out);
                    }
                }
                out.push('}');
            } else if (this.parameterArr) {
                //这里是带定义的多维数组
                out.push(this._getParameterArr(this));
            } else if (this.assign) {
                //有type的赋值逻辑
                let outStr = this.type + " " + this.name;
                if (null != this.assignLeft) {
                    outStr += enumOperator[this.assignLeft];
                }
                outStr += '=';
                if (this.childs) {
                    outStr += this._getParameter(this);
                    outStr += ';';
                    out.push(outStr);
                } else {
                    console.log("理论上不存在这种情况！");
                }

            } else if (null != this.name) {
                //有可能是struct或者？？
                let outStr = '';
                if (null != this.describe) {
                    outStr += enumDescribe[this.describe] + " ";
                }
                outStr += this.type + " " + this.name;
                if (null != this.operator) {
                    outStr += enumOperator[this.operator];
                }
                if ('struct' == this.type) {
                    outStr += '{';
                    out.push(outStr);
                    outStr = '';
                    if (null != this.childs) {
                        let arr = this.childs;
                        for (let i = 0, len = arr.length; i < len; i++) {
                            let sn = arr[i];
                            let outStr = this._parseShaderNode(sn);
                            if ('' != outStr) {
                                out.push(outStr + ";");
                            }
                        }
                    }
                    outStr += '}';
                    if (this.varNames) {
                        outStr += " " + this.varNames.join(",");
                    }
                } else {
                    if (null != this.childs) outStr += this._getParameter(this);
                }
                outStr += ';'
                out.push(outStr);
            } else {
                //这里一般是break，continue，类似这种逻辑
                out.push(this.type + ";");
            }
        } else if (this.parameterArr) {
            //这里应该是数组，或者多维数组
            out.push(this._getParameterArr(this));
        } else if (this.parameter) {
            if (null != this.name) {
                let outStr = ''
                //这里应该是函数调用
                if (null != this.operator) {
                    outStr += enumOperator[this.operator];
                }
                outStr += this.name + "(" + this._getParameter(null, 'for' == this.name) + ")";
                if ("layout" == this.name) {
                    //"对于layout做特殊处理！";
                    if (this.childs) {
                        for (let i = 0, len = this.childs.length; i < len; i++) {
                            let sn = this.childs[i];
                            if (sn.describe == enumDescribe.uniform) {
                                outStr += ' uniform';
                            } else {
                                console.log("TODO待处理:", sn);
                            }
                        }
                    }
                    outStr += ';'
                    out.push(outStr);
                } else {
                    out.push(outStr);
                    if (this.childs) {
                        //这里应该是if或者while类似逻辑
                        out.push("{");
                        for (let i = 0, len = this.childs.length; i < len; i++) {
                            let sn = this.childs[i];
                            sn.toscript(def, out);
                        }
                        out.push("}");
                    }
                }
            }
        } else if (this.name) {
            if (this.describe == enumDescribe.uniform) {
                //这里是uniform结构体
                out.push("uniform " + this.name + "{");
                for (let i = 0, len = this.childs.length; i < len; i++) {
                    let sn = this.childs[i];
                    sn.toscript(def, out);
                }
                let outstr = '}';
                if (this.varNames) {
                    outstr += " " + this.varNames.join(",");
                }
                outstr += ';';
                out.push(outstr);
            } else if (this.assign) {
                //这里是赋值逻辑
                let outStr = this.name;
                if (null != this.assignLeft) {
                    outStr += enumOperator[this.assignLeft];
                }
                outStr += '=';
                if (this.childs) {
                    outStr += this._getParameter(this);
                    outStr += ';';
                    out.push(outStr);
                } else {
                    console.log("理论上不存在这种情况！");
                }
            } else {
                if (this.childs) {
                    //这里应该是else{}逻辑
                    out.push(this.name + "{");
                    for (let i = 0, len = this.childs.length; i < len; i++) {
                        let sn = this.childs[i];
                        sn.toscript(def, out);
                    }
                    out.push("}");
                } else {
                    //这里应该是精度定义
                    if (0 > this.name.indexOf("#")) {
                        out.push(this.name + ";");
                    } else {
                        out.push(this.name);
                    }
                }
            }

        } else if (null != this.operator) {
            //这里应该是表达式，比如+、-、*、/
        } else if (this.childs) {
            if (null != this.parent) {
                //这里应该是函数内部隔离用的大括号
                out.push("{");
                for (let i = 0, len = this.childs.length; i < len; i++) {
                    let sn = this.childs[i];
                    sn.toscript(def, out);
                }
                out.push("}");
            } else {
                //这里应该是需要遍历的根节点
                for (let i = 0, len = this.childs.length; i < len; i++) {
                    let sn = this.childs[i];
                    sn.toscript(def, out);
                }
            }
        } else {
            //这里应该是没用的空节点
        }
        return out;
    }
}