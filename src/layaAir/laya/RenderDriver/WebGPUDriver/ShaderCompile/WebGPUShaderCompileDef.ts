import { _clearCR } from "./WebGPUShaderCompileCode";
import { WebGPUShaderCompileUtil } from "./WebGPUShaderCompileUtil";
import { WebGPUShaderToken } from "./WebGPUShaderToken";

export class WebGPUShaderCompileDef {
    /**当前的父节点，一般都是往父节点里面添加节点 */
    private static _parentNode: WebGPUShaderToken;
    /**当前正在处理中的Node节点，一般是parameterNode的child的最后一个或者——parentNode的child最后一个节点 */
    private static _currNode: WebGPUShaderToken;

    private static _defs: Set<string>;

    static compile(code: string, defs?: Set<string>) {
        code = code.replace(_clearCR, "");//CRLF风格需要先去掉“\r",否则切分字符会出错导致宏定义编译错误等
        this._defs = defs;
        let st = new WebGPUShaderToken();
        this._compileToTree(st, code);
        this._parentNode = null;
        this._defs = null;
        this._currNode = null;
        return st;
    }
    static isEmptyNode(node: WebGPUShaderToken) {
        for (let name in node) {
            if ('includefiles' == name || 'owner' == name || 'z' == name) {
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
    private static get currNode() {
        if (null == this._currNode) {
            this._currNode = new WebGPUShaderToken(this._parentNode.includefiles);
            this._parentNode.addBody(this._currNode);
        }
        return this._currNode;
    }
    private static _compileToTree(parent: WebGPUShaderToken, code: string) {
        this._parentNode = parent;
        let lines = code.split("\n");
        for (let i = 0, len = lines.length; i < len; i++) {
            let text = lines[i];
            if (text.length < 1) continue;
            let ofs = text.indexOf("//");
            if (0 < ofs) {
                this._parseNode(text.substring(0, ofs));
                this._parseNode(text.substring(ofs));
            } else {
                this._parseNode(text);
            }
        }
    }

    private static _parseNode(text: string) {
        text = text.split("\t").join(" ").trim();
        if (text.indexOf("#") != 0) {
            if (null == this.currNode.code) {
                this.currNode.code = text;
            } else {
                this.currNode.code += '\n' + text;
            }
        } else {
            let arr = text.split(" ");
            let name = arr.shift();
            if ("#endif" == name) {
                this._parentNode = this._parentNode.parent;
                this._currNode = null;
                return;
            }

            let node: WebGPUShaderToken;
            switch (name) {
                case '#ifdef':
                case "#ifndef":
                case "#if":
                    node = this.nextCurrNode(true);
                    node.code = text;
                    node.name = name;
                    node.defParam = arr;

                    this._parentNode = node;
                    this._currNode = null;
                    WebGPUShaderCompileUtil.checkDef(node, this._defs);
                    break;
                case "#elif":
                case "#else":
                    this._parentNode = this._parentNode.parent;

                    node = this.nextCurrNode(true);
                    node.code = text;
                    node.name = name;
                    node.defParam = arr;

                    this._parentNode = node;
                    this._currNode = null;
                    if ('#elif' == name)
                        WebGPUShaderCompileUtil.checkDef(node, this._defs);
                    break;
                case "#include":
                    //TODO
                    break;
                default:
                    node = this.nextCurrNode(true);
                    node.code = text;
                    node.name = name;
                    node.defParam = arr;
                    this._currNode = null;
                    break;
            }
        }
    }
}