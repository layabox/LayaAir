import { BlueprintFactory } from "../runtime/BlueprintFactory";
import { IRunAble } from "../runtime/interface/IRunAble";
import { ExpressParse } from "./ExpressParse";
import { Precedence } from "./Precedence";

export class ExpressTree {
    value: any;
    left: ExpressTree | null;
    right: ExpressTree | null;

    call(context: any): any {
        return null;
    }

    constructor(value: any) {
        this.value = value;
        this.left = null;
        this.right = null;
    }


    private static isNumber(token: any): boolean {
        return !isNaN(token) && !isNaN(+token);
    }

    private static isExpress(token: any): boolean {
        const regex = /[&|.!+\-*/]/;
        // 使用正则表达式的test()方法检查字符串是否包含这些运算符
        return regex.test(token);
    }


    private static splitExpress(express: string) {
        const parts: string[] = [];
        let currentPart = '';
        let parenthesesDepth = 0;

        for (const char of express) {
            if (char === '(') {
                parenthesesDepth++;
                currentPart += char;
            } else if (char === ')') {
                parenthesesDepth--;
                currentPart += char;
            } else if (char === '.' && parenthesesDepth === 0) {
                parts.push(currentPart);
                currentPart = '';
            } else {
                currentPart += char;
            }
        }

        if (currentPart) {
            // Push the remaining part
            parts.push(currentPart);
        }

        return parts;

    }


    clone(): ExpressTree {
        let node = new ExpressTree(this.value);
        if (this.left) {
            node.left = this.left.clone();
        }
        if (this.right) {
            node.right = this.right.clone();
        }
        node.call = this.call;
        return node;
    }

    static operatorPriority: any = {};

    static _inited: boolean = false;

    static parseProperty(express: string): ExpressTree {
        let op: ExpressTree;
        const parts = ExpressTree.splitExpress(express);

        let operators = [];
        let isFun: boolean;
        let params = [];
        for (const part of parts) {
            if (part.includes('(')) {
                // 函数调用
                let ind = part.indexOf('(')
                let funName = part.slice(0, ind)
                let funPara = part.slice(ind + 1, part.length - 1);
                let tparams = funPara.split(",")
                for (let i = 0; i < tparams.length; i++) {
                    let param = tparams[i];
                    if (!ExpressTree.isNumber(param)) {
                        if (this.isExpress(param)) {
                            params[i] = ExpressParse.instance.parse(param);
                        } else {
                            params[i] = this.parseProperty(param)
                        }
                    }
                    else {
                        params[i] = new ExpressNumber(Number(param));
                    }
                }
                operators.push(funName);
                isFun = true;
            } else {
                operators.push(part);
            }

        }

        if (isFun) {
            op = new ExpressFunction(operators);
            (op as ExpressFunction).params = params;

        }
        else {
            op = new ExpressProperty(operators);
        }
        return op;
    }

    static creatreExpressTree(express: string): ExpressTree {
        let op: ExpressTree = this.operatorPriority[express];
        if (op == null) {
            if (this.isNumber(express)) {
                op = new ExpressNumber(Number(express));
            }
            else {
                op = this.parseProperty(express);
            }
            return op;
        }
        return op.clone();
    }
    static init(): void {
        if (!this._inited) {
            var allPrioritys: ExpressTree[] = [];
            for (let key in Precedence) {
                let treeNode = new ExpressTree(key);
                allPrioritys.push(treeNode);
                switch (key) {
                    case '&':
                        treeNode.call = function (context: any) {
                            return this.left.call(context) & this.right.call(context);
                        }
                        break;
                    case '|':
                        treeNode.call = function (context: any) {
                            return this.left.call(context) | this.right.call(context);
                        }
                        break;
                    case '&&':
                        treeNode.call = function (context: any) {
                            return this.left.call(context) && this.right.call(context);
                        }
                        break;
                    case '||':
                        treeNode.call = function (context: any) {
                            return this.left.call(context) || this.right.call(context);
                        }
                        break;
                    case '+':
                        treeNode.call = function (context: any) {
                            return this.left.call(context) + this.right.call(context);
                        }
                        break;
                    case '-':
                        treeNode.call = function (context: any) {
                            return this.left.call(context) - this.right.call(context);
                        }
                        break;
                    case '*':
                        treeNode.call = function (context: any) {
                            return this.left.call(context) * this.right.call(context);
                        }
                        break;
                    case '/':
                        treeNode.call = function (context: any) {
                            return this.left.call(context) / this.right.call(context);
                        }
                        break;
                    case '>=':
                        treeNode.call = function (context: any) {
                            return this.left.call(context) >= this.right.call(context);
                        }
                        break;
                    case '<=':
                        treeNode.call = function (context: any) {
                            return this.left.call(context) <= this.right.call(context);
                        }
                        break;
                    case '==':
                        treeNode.call = function (context: any) {
                            return this.left.call(context) == this.right.call(context);
                        }
                        break;
                    case '!=':
                        treeNode.call = function (context: any) {
                            return this.left.call(context) != this.right.call(context);
                        }
                        break;
                    case '>':
                        treeNode.call = function (context: any) {
                            return this.left.call(context) > this.right.call(context);
                        }
                        break;
                    case '<':
                        treeNode.call = function (context: any) {
                            return this.left.call(context) < this.right.call(context);
                        }
                        break;
                    case '!':
                        treeNode.call = function (context: any) {
                            return !this.right.call(context);
                        }
                        break;
                    default:
                        break;

                }

                allPrioritys.forEach((item, index) => {
                    this.operatorPriority[item.value] = item;
                });
            }
            this._inited = true;
        }
    }
}

export class ExpressNumber extends ExpressTree {
    constructor(value: any) {
        super(value);
    }
    call(context: any) {
        return this.value;
    }
}

export class ExpressProperty extends ExpressTree {
    constructor(value: any) {
        super(value);
        this.propertys = value;
    }
    propertys: string[];
    call(context: any) {
        let result = context;
        this.propertys.forEach((item, index) => {
            if (result) {
                if (result[BlueprintFactory.contextSymbol]) {
                    result = (result[BlueprintFactory.contextSymbol] as IRunAble).getVar(item);
                }
                else {
                    result = result[item];
                }
            }
            else {
                console.warn(this.propertys, item + "属性不存在")
            }
        });
        return result;
    }

}


export class ExpressFunction extends ExpressProperty {
    params: ExpressTree[];

    call(context: any) {
        let result = super.call(context);
        if(!result){
            console.warn(this.propertys, "函数不存在")
            return null;
        }
        let tparams: any[] = [];
        this.params.forEach((item, index) => {
            tparams.push(item.call(context));
        });
        return result.apply(context, tparams);
    }

}
