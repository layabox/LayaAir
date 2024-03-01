import { ShaderToken } from "./ShaderToken";
// 对于in和out需要特殊检测解析处理
// in,
// out,
// inout,
export enum enumInOut {
    in,
    out,
    inout,
}
export enum enumDescribe {
    uniform,
    varying,
    const,
    mediump,
    highp,
    lowp,
    attribute,
}
export enum enumOperator {
    "!=",
    "==",
    "<=",
    ">=",
    "||",
    "&&",
    ">>",
    "<<",
    "++",
    "^^",
    "--",
    "!",
    "+",
    "-",
    "*",
    "/",
    "=",
    "<",
    ">",
    "&",
    "|",
    "^",
    "%",
}
const operatorArr = ['+', '-', '*', '/', '%', "^", "&", "|"];
export const boolCheck = ['<=', '>=', '!=', '==', "&&", "||", '>', '<', '!'];
const checkBodyName = ['if', 'for', 'while', 'layout'];
export const _clearCR = new RegExp("\r", "g");

export type TypeOut =
    {
        type: string,
        struct?: ShaderToken,
        length?: number[],
        blockName?: string,
    }
export type TypeOutData =
    {
        uniform?: Record<string, TypeOut>,
        varying?: Record<string, TypeOut>,
        attribute?: Record<string, TypeOut>,
        variable?: Set<String>,
    }

export class ShaderCompileCode {
    /**如果parameterNode有值，则代表当前正在解析参数，可能是函数也可能是函数调用 */
    private static _parameterNode: ShaderToken;
    /**当前的父节点，一般都是往父节点里面添加节点 */
    private static _parentNode: ShaderToken;
    /**是否当前正在检测Type */
    private static _isCheckType = false;
    /**当前正在处理中的Node节点，一般是parameterNode的child的最后一个或者——parentNode的child最后一个节点 */
    private static __currNode: ShaderToken;
    /**当前刚刚设置过名字的Node，如果后面发现是个函数的话，直接给該node这是parameter属性 */
    private static _currNameNode: ShaderToken;
    /**当前的函数参数，或者函数调用的参数 */
    private static _currParame: string;
    /**用户当前checkBodyName的函数体，如果未写大括号会临时放到这里面 */
    private static _currTmpBody: string[];
    private static _isCheckBody3: boolean;

    private static _uniform: Record<string, TypeOut>;
    private static _attribute: Record<string, TypeOut>;
    private static _varying: Record<string, TypeOut>;

    private static _variable: Set<string>;
    private static _struct: Record<string, ShaderToken>;

    private static _varUniform: Record<string, string>;


    static compile(code: string) {
        let ret = new ShaderToken();
        code = code.replace(_clearCR, "");//CRLF风格需要先去掉“\r",否则切分字符会出错导致宏定义编译错误等
        code = this.removeAnnotation(code).trim();//移除代码中的所有注释(TODO可能之后要对注释也进行分析，并不需要移除！)
        this._compileToTree(ret, code);
        this._parameterNode = null;
        this._parentNode = null;
        this._currNode = null;
        this._currNameNode = null;
        this._currParame = null;
        this._isCheckType = false;
        this._currTmpBody = null;

        ret.uniform = this._uniform;
        ret.variable = this._variable;
        ret.structs = this._struct;
        ret.varying = this._varying;
        ret.attribute = this._attribute;

        if (this._struct) {
            if (this._uniform) {
                for (let k in this._uniform) {
                    if (this._struct[this._uniform[k].type]) {
                        this._uniform[k].struct = this._struct[this._uniform[k].type];
                    }
                }
            }
            if (this._varying) {
                for (let k in this._varying) {
                    if (this._struct[this._varying[k].type]) {
                        this._varying[k].struct = this._struct[this._varying[k].type];
                    }
                }
            }
            if (this._attribute) {
                for (let k in this._attribute) {
                    if (this._struct[this._attribute[k].type]) {
                        this._attribute[k].struct = this._struct[this._attribute[k].type];
                    }
                }
            }
        }

        this._uniform = null;
        this._variable = null;
        this._struct = null;
        this._varying = null;
        this._attribute = null;
        this._varUniform = null;

        return ret;
    }

    private static get _currNode() {
        return this.__currNode;
    }
    private static set _currNode(value: ShaderToken) {
        if (value == this.__currNode) return;
        if (null != this.__currNode) {
            if (null != this.__currNode.name && (null == this.__currNode.type || 'return' == this.__currNode.type)) {
                if (null == this.__currNode.parameter && this.__currNode.describe != enumDescribe.uniform) {
                    let name = this.__currNode.name;
                    if ('' != name && isNaN(Number(name))) {
                        let ofs = name.indexOf(".");
                        if (0 <= ofs) {
                            name = name.substring(0, ofs).trim();
                            if (this._varUniform && this._varUniform[name]) {
                                name = this.__currNode.name.substring(ofs + 1).trim();
                            }
                        }
                        if ('' != name) {
                            if (null == this._variable) this._variable = new Set();
                            this._variable.add(name);
                        }
                    }
                }
            }
        }
        this.__currNode = value;
    }

    // static compile(vs: string, ps: string, basePath?: string) {
    //     this.uniforms = {};
    //     let result: IShaderCompiledObj2 = {
    //         vsNode: new ShaderToken(),
    //         psNode: new ShaderToken(),
    //         includeNames: new Set(),
    //         defs: new Set(),
    //         uniforms: this.uniforms,
    //     };
    //     vs = vs.replace(_clearCR, "");//CRLF风格需要先去掉“\r",否则切分字符会出错导致宏定义编译错误等
    //     ps = ps.replace(_clearCR, "");
    //     this._compileToTree(result.vsNode, vs, basePath);
    //     this._parameterNode = null;
    //     this._parentNode = null;
    //     this._currNode = null;
    //     this._currNameNode = null;
    //     this._currParame = null;
    //     this._isCheckType = false;
    //     return result;
    // }

    private static get isCheckType() {
        return this._isCheckType;
    }
    private static set isCheckType(value: boolean) {
        if (value != this._isCheckType) {
            if (null == this._parameterNode && value) {
                if (this._parentNode.assign) {
                    //逻辑结束，需要退出到上一层
                    this._parentNode = this._parentNode.parent;
                }
                if ('return' == this._parentNode.type) {
                    this._parentNode = this._parentNode.parent;
                }
            }
            this._isCheckType = value;
        }
    }

    private static get currNode() {
        if (null == this._currNode) {
            if (null == this._parentNode) {
                console.log("异常啦！！！");
            }
            this._currNode = new ShaderToken(this._parentNode.includefiles);
            if (this._parameterNode) {
                this._currNode.owner = this._parameterNode.owner;
                this._parameterNode.addBody(this._currNode);
            } else {
                this._parentNode.addBody(this._currNode);
            }
        }
        return this._currNode;
    }

    /**
     * 当退出一个函数参数，需要更新currNode为当前_parentNode的最后一个或者_parameterNode的最后一个节点
     */
    private static updateCurrNode() {
        if (this._parameterNode) {
            if (this._parameterNode.childs) {
                this._currNode = this._parameterNode.childs[this._parameterNode.childs.length - 1];
            } else
                this._currNode = null;
        } else {
            if (this._parentNode.childs) {
                this._currNode = this._parentNode.childs[this._parentNode.childs.length - 1];
            } else {
                console.log("这里应该有点问题！");
                this._currNode = null;
            }
        }
    }

    /**
     * 
     * @param parameterType 0为(),1为[]
     */
    private static newParameterNode(parameterType: 0 | 1 = 0) {
        let sn = new ShaderToken(this._parentNode.includefiles);
        if (null == this._currNameNode) {
            if (1 == parameterType) {
                //这里应该是多为数组，需要做检测
                let childs = this._parentNode.childs;
                let pNode = childs[childs.length - 1];
                if (pNode.parameterArr) {
                    this._currNameNode = pNode;
                }
            }
            if (null == this._currNameNode) {
                //应该是直接加括号的表达式，比如(a*b)
                this._currNameNode = this.nextCurrNode(true);
                this._currNameNode.name = '';
            }
        }

        if (1 == parameterType) {
            this._currNameNode.addParameterArr(sn, this._parameterNode);
        } else {
            this._currNameNode.setParameter(sn, this._parameterNode);
        }

        this._currNameNode = null;
        this._parameterNode = sn;
        this.updateCurrNode();
    }

    static isEmptyNode(node: ShaderToken, isCheckParent = false) {
        for (let name in node) {
            if ('includefiles' == name || 'owner' == name || 'z' == name) {
                continue;
            }
            if (isCheckParent && 'parent' == name) {
                continue;
            }
            return false;
        }
        return true;
    }

    /**
     * 
     * @param isForceCreate 设置force以后，自动会给当前的_parameterNode节点或者_parentNode节点下面增加一个新的节点并且返回
     * @returns 
     */
    private static nextCurrNode(isForceCreate = false) {
        if (isForceCreate) {
            this._currNode = null;
            return this.currNode;
        } else {
            if (null != this._currNode) {
                if (this.isEmptyNode(this._currNode)) {
                    return null;
                }
                this._currNode = null;
            }
            return null;
        }
    }
    private static _compileToTree(root: ShaderToken, script: string) {
        let lines = script.split(";");
        this._parentNode = root;
        for (let i = 0, len = lines.length; i < len; i++) {
            let text = lines[i].trim();
            if (text.length < 1) continue;
            this._parseNode(text);
            this._checkStructDef();
            if (null != this._currParame) {
                //目前知道只有for循环会出现这种情况
                this._parseParameter();
            }
            //这里一般是处理if、for、while等等不加{}的情况
            this._body3Fin();

        }
    }

    private static _checkStructDef() {
        let childs = this._parentNode.childs;
        if (childs) {
            let len = childs.length;
            if (2 <= len) {
                let index = len - 1;
                let o1 = childs[index];
                let o2 = childs[len - 2];
                if (('struct' == o2.type || (o2.describe == enumDescribe.uniform && o2.childs)) && null == o1.name && null != o1.type) {
                    //这里应该是struct或者uniform结构体
                    let arr = o1.type.split(',');
                    o2.varNames = arr;
                    childs.splice(index, 1);

                    if (o2.describe == enumDescribe.uniform) {
                        if (null == this._varUniform) this._varUniform = {};
                        for (let i = arr.length - 1; i >= 0; i--) {
                            this._varUniform[arr[i]] = o2.name;
                        }
                    }


                    // o1.type = o2.name;
                    // for (let i = 0, len = arr.length; i < len; i++) {
                    //     if (0 == i) {
                    //         o1.name = arr[i];
                    //     } else {
                    //         let sn = this.nextCurrNode(true);
                    //         sn.type = o1.type;
                    //         sn.name = arr[1];
                    //     }
                    // }
                }
            }
        }
    }

    private static _checkTypeByString(text: string) {
        let sn = this.nextCurrNode(true);
        this.isCheckType = true;
        let arr = text.split(" ");
        for (let i = 0, len = arr.length; i < len; i++) {
            if (this.isCheckType) {
                this._checkType(arr[i]);
            } else {
                //这里是函数参数的名字，一般不存在其它情况，如表达式，所以直接进行赋值
                sn.name = arr[i];
            }
        }
        this.isCheckType = false;
    }

    private static get _isFor() {
        if (this._parameterNode) {
            let node = this._parameterNode.owner;
            if ("for" == node.name) {
                return true;
            }
        }
        return false;
    }

    private static _parseParameter() {
        if (null != this._currParame) {
            let node = this._parameterNode.owner;
            if (this._isFor) {
                //这里应该是for循环的第一个参数，有可能有对type的定义
                let _parentNode = this._parentNode;
                let _parameterNode = this._parameterNode;
                if (null == _parameterNode.childs || 0 == _parameterNode.childs.length) {
                    //for循环的第一个节点，有可能有类型数据
                    this.isCheckType = true;
                }
                let sn = this.nextCurrNode(true);
                this._parameterNode = null;
                this._parentNode = sn;
                this._currNode = null;
                let arr = this._currParame.split(" ");
                for (let i = 0, len = arr.length; i < len; i++) {
                    this._checkBody(arr[i]);
                }

                this._parameterNode = _parameterNode;
                this._parentNode = _parentNode;
            } else {
                let isFun = false;//isFun为false代表这里是一个函数调用，参数里面有可能携带表达式，如果为true，则这里是一个函数，参数中应该会携带类型数据
                if (null != node.type && 'return' != node.type && 'else' != node.type) isFun = true;
                let arr = this._currParame.split(',');
                for (let i = 0, len = arr.length; i < len; i++) {
                    let str = arr[i];
                    if (isFun) {
                        //这里是一个函数，参数中应该会携带类型数据
                        this._checkTypeByString(str);
                    } else {
                        //代表这里是一个函数调用，参数里面有可能携带表达式
                        this._checkBody2(str, false);
                    }
                    if (i < len - 1) {
                        let sn = this.nextCurrNode(true);
                        sn.type = ',';
                        this._currNode = null;
                    }
                }
            }
        }
        this._currParame = null;
    }

    private static _addParam(text: string) {
        if (null == this._currParame) {
            this._currParame = text;
        } else {
            this._currParame += ' ' + text;
        }
    }

    private static _checkParameter(text: string) {
        text = text.trim();
        if ('' == text) {
            if (this._isFor) this._addParam(text);
            return;
        }
        if (this.isCheckType) {
            this._checkType(text);
            return;
        }
        let ofs = text.indexOf("(");
        if (0 <= ofs) {
            //这里有函数嵌套，需要先对之前的参数进行分析，然后再递归进入到嵌套函数内部进行分析
            //this._addParam(text.substring(0, ofs));
            //有可能有函数嵌套，所以不能直接调用addParam，不保险
            this._checkParameter(text.substring(0, ofs));
            this._parseParameter();
            this.newParameterNode();
            text = text.substring(ofs + 1);
            this._checkParameter(text);
        } else {
            let ofs = text.indexOf("[");
            if (0 <= ofs) {
                this._checkParameter(text.substring(0, ofs));
                this._parseParameter();
                this.newParameterNode(1);
                text = text.substring(ofs + 1);
                this._checkParameter(text);
            } else {
                ofs = text.indexOf(")");
                if (0 > ofs) {
                    ofs = text.indexOf("]");
                }
                if (0 <= ofs) {
                    //这里是函数参数结束，需要分析所有参数数据，并退到上一层参数,继续进行分析
                    //this._addParam(text.substring(0, ofs));
                    this._checkParameter(text.substring(0, ofs));
                    this._parseParameter();

                    let owner = this._parameterNode.owner;
                    if (owner) {
                        let obj: any = null;
                        if (owner.describe == enumDescribe.uniform) {
                            //这里应该是uniform的数组
                            obj = this._uniform;
                        } else if (owner.describe == enumDescribe.attribute) {
                            obj = this._attribute;
                        } else if (owner.describe == enumDescribe.varying) {
                            obj = this._varying;
                        }
                        if (null != obj) {
                            try {
                                let num = Number(this._parameterNode.childs[0].type);
                                if (!isNaN(num) && obj[owner.name]) {
                                    if (null == obj[owner.name].length) {
                                        obj[owner.name].length = [];
                                    }
                                    obj[owner.name].length.push(num);
                                }
                            } catch (err) { }
                        }
                    }

                    this._parameterNode = this._parameterNode.parent;
                    this.updateCurrNode();
                    text = text.substring(ofs + 1);
                    this._currNameNode = null;
                    if (this.currNode && null != this.currNode.parameter && null == this._parameterNode && 0 <= checkBodyName.indexOf(this.currNode.name)) {
                        this._isCheckBody3 = true;
                    }

                    this._checkBody(text);
                } else {
                    this._addParam(text);
                }
            }
        }
    }
    private static _body3Fin() {
        let arr = this._currTmpBody;
        this._currTmpBody = null;
        this._isCheckBody3 = false;

        if (arr) {
            if (this._currNode && 0 <= checkBodyName.indexOf(this._currNode.name)) {
                this._parentNode = this._currNode;
                this._currNode = null;
            } else if (this._parentNode && 0 <= checkBodyName.indexOf(this._parentNode.name)) {
                this._currNode = null;
            } else {
                console.log("理论上不应该进入这里，待查！");
                this._currNode = null;
                this._parentNode = this.currNode;
                this._currNode = null;
            }
            this.isCheckType = true;
            for (let i = 0, len = arr.length; i < len; i++) {
                this._checkBody(arr[i]);
            }
            this._parentNode = this._parentNode.parent;
            this.nextCurrNode();
            this.isCheckType = true;
        }
    }

    /** 这里是对类似if，for，while没有加{}做判断的逻辑 */
    private static _checkBody3(text: string) {
        if (this._isCheckBody3) {
            if (0 > text.indexOf("{")) {
                if (null == this._currTmpBody) {
                    this._currTmpBody = [];
                }
                this._currTmpBody.push(text);
                return true;
            } else if (null != this._currTmpBody) {
                console.log("理论上不应该会走到这里，如果到这里，待检查！", this._currTmpBody);
                this._isCheckBody3 = false;
                let arr = this._currTmpBody;
                this._currTmpBody = null;
                for (let i = 0, len = arr.length; i < len; i++) {
                    this._checkBody(arr[i]);
                }
            } else {
                this._isCheckBody3 = false;
            }
        }
        return false;
    }


    private static _checkBody(text: string) {

        text = text.trim();
        if ('' == text) return;
        if (this._checkBody3(text)) {
            return;
        }
        if (this.isCheckType) {
            this._checkType(text);
            return;
        }
        if (null != this._parameterNode) {
            this._checkParameter(text);
            return;
        }
        if (this._checkOperator(text)) return;
        let ofs = text.indexOf("=");
        if (0 > ofs) {
            ofs = text.indexOf("(");
            if (0 > ofs) {
                ofs = text.indexOf("[");
                if (0 > ofs) {
                    ofs = text.indexOf("{");
                    if (0 <= ofs) {
                        let cstr = text.substring(0, ofs);
                        if ('' != cstr) {
                            //这里应该是struct,还有可能是else……
                            this._setNodeName(cstr);
                        } else if (null != this._currNode.type && null == this._currNode.name) {
                            //这里可能是else的逻辑
                            this._currNode.name = this._currNode.type;
                            delete this._currNode.type;
                        }
                        this._parentNode = this.currNode;
                        text = text.substring(ofs + 1);
                        this.isCheckType = true;
                        this._currNode = null;
                        this._checkBody(text);
                    } else {
                        ofs = text.indexOf("}");
                        if (0 <= ofs) {
                            this._childFin(ofs, text);
                        } else {
                            ofs = text.indexOf(",");
                            if (0 <= ofs) {
                                //这里应该是用，进行并列定义变量的逻辑
                                this._checkBody(text.substring(0, ofs));
                                this.isCheckType = true;
                                this.updateCurrNode();
                                let typeNode = this._currNode;
                                if (null == typeNode.type) {
                                    console.log("理论上不应该出现这个情况！", text);
                                } else {
                                    let sn = this.nextCurrNode(true);
                                    sn.type = typeNode.type;
                                    if (null != typeNode.describe) {
                                        sn.describe = typeNode.describe;
                                    }
                                }
                                this.isCheckType = false;
                                this._checkBody(text.substring(ofs + 1));
                            } else {
                                if (!this._splitTextCheck(text, "?")) {
                                    if (!this._splitTextCheck(text, ":")) {
                                        //可能是变量或者表达式,如果是for循环，里面的i>0就会进入到这里来
                                        this._checkBody2(text);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    let cstr = text.substring(0, ofs);
                    //这里应该是数组名，也是用parameterNode来记录
                    this._setNodeName(cstr);
                    this.newParameterNode(1);
                    this._checkParameter(text.substring(ofs + 1));
                }
            } else {
                let cstr = text.substring(0, ofs).trim();
                if (null == this._currNode || null == this._currNode.name || '' != cstr) {
                    //这里应该是函数名,这里不能检测空，因为有可能是直接括号的表达式
                    this._setNodeName(cstr);
                } else if (null != this._currNode && this._currNode.assign) {
                    //这里应该也是直接的括号表达式
                    this._setNodeName(cstr);
                }
                this.newParameterNode();
                this._checkParameter(text.substring(ofs + 1));
                return;
            }
        } else {
            this._checkEqual(text, ofs);
        }
    }

    private static _splitTextCheck(text: string, cstr: string, fun?: (str: string) => any) {
        if (null == fun) fun = this._checkBody;
        let ofs = text.indexOf(cstr);
        if (0 <= ofs) {
            fun.call(this, text.substring(0, ofs));
            //this._checkBody(text.substring(0, ofs));
            let sn = this.nextCurrNode(true);
            sn.type = cstr;
            //?(aaa-bbb):(bbb-ccc)这种情况，?和:属于括号内参数的父节点
            this._currNameNode = sn;
            //this._checkBody(text.substring(ofs + cstr.length));
            this._currNode = null;
            fun.call(this, text.substring(ofs + cstr.length));
            return true;
        }
        return false;
    }
    private static _childFin(ofs: number, text: string) {
        let cstr = text.substring(0, ofs);
        this._checkBody(cstr);


        if ("struct" == this._parentNode.type) {
            if (!this._struct) this._struct = {};
            this._struct[this._parentNode.name] = this._parentNode;
        }
        let childs = this._parentNode.childs;
        if (childs) {
            for (let i = childs.length - 1; i >= 0; i--) {
                let o = childs[i];
                if (this.isEmptyNode(o, true)) {
                    childs.splice(i, 1);
                }
            }
        }

        this._parentNode = this._parentNode.parent;

        this.nextCurrNode();
        text = text.substring(ofs + 1);
        this.isCheckType = true;
        if ('' != text) {
            this.nextCurrNode();
            this._checkBody(text);
        }
    }
    private static _checkType(text: string) {
        if ('' == text) return;
        let node = this.currNode;
        let inout = (enumInOut as any)[text];
        if (undefined != inout && isNaN(Number(text))) {
            node.inOrOut = inout;
        } else {
            let describe = (enumDescribe as any)[text];
            if (undefined != describe && isNaN(Number(text))) {
                node.describe = describe;
            } else {
                let ofs = text.indexOf("}");
                if (0 <= ofs) {
                    this._childFin(ofs, text);
                    return;
                }
                ofs = text.indexOf("(");
                if (0 > ofs) {
                    ofs = text.indexOf("[");
                }
                if (0 <= ofs) {
                    //这里应该是一个函数调用
                    this.isCheckType = false;
                    //保险起见还是直接使用checkBody检测比较完整
                    this._checkBody(text);
                } else {
                    ofs = text.indexOf("=");
                    if (0 <= ofs) {
                        this._checkEqual(text, ofs);
                    } else {
                        ofs = text.indexOf("{");
                        if (0 <= ofs) {
                            this.isCheckType = false;
                            //保险起见还是直接使用checkBody检测比较完整
                            this._checkBody(text);
                        } else {
                            //TODO 这里可能还需要进一步检测
                            node.type = text;
                            if ('return' == text) {
                                this._parentNode = node;
                                this.nextCurrNode();
                            }
                            this.isCheckType = false;
                        }
                    }

                }
            }
        }
    }

    /**对于等号的检测 */
    private static _checkEqual(text: string, ofs: number) {
        this.isCheckType = false;
        if (0 == ofs) {
            let cstr = text.substring(0, 2);
            if (this._checkOperator(cstr)) {
                //可能是==或者类似的逻辑
                this._checkBody(text.substring(2));
                return;
            }
        }
        let cstr = text.substring(0, ofs);
        let len = cstr.length;
        if (0 < len) {
            let cstr2 = cstr.substring(len - 2);
            let operator = (enumOperator as any)[cstr2];
            if (null != operator && isNaN(Number(cstr2))) {
                /**这里应该是>>=或者<<= */
                cstr2 = cstr.substring(0, cstr.length - 2).trim();
                if ('' != cstr2) {
                    this._setNodeName(cstr2);
                }
                this._checkOperator("=");
                this.currNode.assignLeft = operator;
                this._checkBody(text.substring(ofs + 1));
                return;
            }


            cstr2 = cstr.substring(len - 1);
            let cstr3 = cstr2 + "=";
            operator = (enumOperator as any)[cstr3];
            if (null != operator && isNaN(Number(cstr3))) {
                //这里应该是>=、<=、!=，这种逻辑运算符号
                this._checkBody(cstr.substring(0, cstr.length - 1).trim());
                this._checkBody(cstr3);
                //这里有可能cstr带(导致进入到了参数逻辑，所以不能直接用下面的_checkOperator，eg : float l1=(x>=0.0?p:(PI-p));
                //this._checkOperator(cstr3);
                this._checkBody(text.substring(ofs + 1));
                return;
            }
            operator = (enumOperator as any)[cstr2];

            if (null != operator && isNaN(Number(cstr2))) {
                /**应该是+=或-=或/=或*= */
                cstr2 = cstr.substring(0, cstr.length - 1).trim();
                if ('' != cstr2) {
                    this._setNodeName(cstr2);
                }
                this._checkOperator("=");
                this.currNode.assignLeft = operator;
                this._checkBody(text.substring(ofs + 1));
                // let sn = this.nextCurrNode(true);
                // sn.name = this._parentNode.name;
                // sn = this.nextCurrNode(true);
                // sn.operator = operator;
                // sn.operatorRight = true;
                // this._checkBody(text.substring(ofs + 1));
                return;
            }
        }
        this._setNodeName(cstr);
        cstr = text.substring(ofs, ofs + 2);
        if (this._checkOperator(cstr)) {
            //可能是==或者类似的逻辑
            ofs += 1;
        } else {
            this._checkOperator("=");
        }
        this._checkBody(text.substring(ofs + 1));
    }

    /**这是给当前节点设置nodeName，一般是在checktype里面调用,也可以确定value里面不会存在表达式的时候直接调用*/
    private static _setNodeName(value: string) {
        value = value.trim();
        let node = this.currNode;
        if (null != node.name) {
            //这里可能是变量名或者是函数名或者运算表达式
            this._checkBody2(value, false);
            return;
        }
        if ('' == value && null != node.type) {
            //这里应该是错把name设置到了type上，在这里修正一下
            this._checkBody2(node.type, false);
            //node.name = node.type;
            delete node.type;
        } else {
            //这里也有可能value中含有运算表达式，所以还是不能直接赋值，比如!aaa;
            this._checkBody2(value);
            //node.name = value;
        }
        //this._currNameNode = node;
        // if (node.describe == enumDescribe.uniform) {
        //     ShaderCompileCode.uniforms[value] = node;
        // }
    }
    /**分解运算符等等,设置函数名，变量名或者常量理论上这里不应该出现函数嵌套,设置node的Name也应该用setNodeName */
    private static _checkBody2(text: string, isCheckEmpty = true) {
        text = text.trim();
        if ('' == text && isCheckEmpty) return;
        let ofs: number;
        let pstr: string;
        if ('' != text) {
            for (let k in enumOperator) {
                if (isNaN(Number(k))) {
                    let num = text.indexOf(k);
                    if (0 <= num) {
                        if (null == ofs || ofs > num) {
                            ofs = num;
                            pstr = k;
                        }
                    }
                }
            }
            // for (let i = operatorArr.length - 1; i >= 0; i--) {
            //     let num = text.indexOf(operatorArr[i]);
            //     if (0 <= num) {
            //         if (null == ofs || ofs > num) {
            //             ofs = num;
            //         }
            //     }
            // }
        }
        if (null != ofs) {
            this._checkBody2(text.substring(0, ofs));
            this._checkOperator(text.substring(ofs, ofs + pstr.length));
            this._checkBody2(text.substring(ofs + pstr.length));
        } else {
            if (!this._splitTextCheck(text, "?", this._checkBody2)) {
                if (!this._splitTextCheck(text, ":", this._checkBody2)) {
                    let sn = this.currNode;
                    if (null != sn.name) {
                        //正常如果没有名字的话一般就是刚刚生成的符号，后面应该直接加变量名，代表这个符号操作该变量名
                        sn = this.nextCurrNode(true);
                    }
                    sn.name = text;
                    this._currNameNode = sn;

                    if (this._parentNode) {
                        let obj: any = null;
                        if (this._parentNode.describe == enumDescribe.uniform) {
                            //这里是uniform结构体，所有的变量都是uniform！
                            if (null == this._uniform) this._uniform = {};
                            obj = this._uniform;
                        } else if (this._parentNode.describe == enumDescribe.varying) {
                            if (null == this._varying) this._varying = {};
                            obj = this._varying;
                        } else if (this._parentNode.describe == enumDescribe.attribute) {
                            if (null == this._attribute) this._attribute = {};
                            obj = this._attribute;
                        }
                        if (null != obj) {
                            obj[sn.name] = {
                                type: sn.type,
                                struct: this._parentNode,
                                blockName: this._parentNode.name
                            };
                        }
                    }
                    if (sn.describe == enumDescribe.uniform) {
                        if (null == this._uniform) this._uniform = {};
                        this._uniform[sn.name] = { type: sn.type };
                    } else if (sn.describe == enumDescribe.attribute) {
                        if (null == this._attribute) this._attribute = {};
                        this._attribute[sn.name] = { type: sn.type };
                    } else if (sn.describe == enumDescribe.varying) {
                        if (null == this._varying) this._varying = {};
                        this._varying[sn.name] = { type: sn.type };
                    }
                }
            }
        }
    }
    private static _checkOperator(text: string) {
        let operator = (enumOperator as any)[text];
        if (undefined != operator && isNaN(Number(text))) {
            let sn = this.currNode;
            if ('=' == text) {
                sn.assign = true;
                if (null == sn.name && null != sn.type) {
                    this._checkBody2(sn.type, false);
                    delete sn.type;
                }
                this._parentNode = sn;
            } else {
                if (null != sn.name || null != sn.operator) {
                    sn = this.nextCurrNode(true);
                }
                sn.operator = operator;
                this._currNameNode = sn;

                if (null != sn.name) {
                    sn.operatorRight = true;
                }
            }


            return true;
        }
        return false;
    }

    private static _parseNode(text: string) {
        if ('' == text) return;
        let ofs = text.indexOf("#");
        if (0 > ofs) {
            text = text.split("\n").join(" ").split("\t").join(" ");
            if (0 == text.indexOf('precision')) {
                //这里是精度定义
                let sn = new ShaderToken(this._parentNode.includefiles);
                sn.name = text;
                this._parentNode.addBody(sn);
                return;
            }
            let arr = text.split(" ");
            if (!this._isFor)
                this.isCheckType = true;
            this.nextCurrNode();
            for (let i = 0, len = arr.length; i < len; i++) {
                text = arr[i];
                if ('' == text) continue;
                this._checkBody(text);
            }
        } else {
            this._parseNode(text.substring(0, ofs));
            let def = text.substring(ofs);
            ofs = def.indexOf("\n");
            text = null;
            if (0 < ofs) {
                text = def.substring(ofs + 1);
                def = def.substring(0, ofs);
            }
            let sn = new ShaderToken(this._parentNode.includefiles);
            sn.name = def;
            this._parentNode.addBody(sn);
            if (null != text) {
                this._parseNode(text);
            }
        }
    }
    /**
     * 移除代码中的所有注释
     * @param text 
     * @returns 
     */
    private static removeAnnotation(text: string) {
        while (true) {
            let i = text.indexOf("//");
            if (0 > i) {
                break;
            } else {
                let num = text.indexOf('\n', i);
                if (0 < num) {
                    text = text.substring(0, i) + text.substring(num);
                } else {
                    text = text.substring(0, i);
                }
            }
        }
        while (true) {
            let i = text.indexOf("/*");
            if (0 > i) {
                break;
            } else {
                let num = text.indexOf("*/", i);
                if (0 < num) {
                    text = text.substring(0, i) + text.substring(num + 2);
                } else {
                    text = text.substring(0, i);
                }
            }
        }
        return text;
    }
}