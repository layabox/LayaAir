import { ExpressTree } from "./ExpressTree";
import { Precedence } from "./Precedence";

export class ExpressParse {
    _catch:Map<string,ExpressTree> = new Map();
    private static _instance: ExpressParse;
    static get instance() {
        if (!this._instance) {
            ExpressTree.init();
            this._instance = new ExpressParse();
        }
        return this._instance;
    }

    private isOperator(token: any): boolean {
        return Object.keys(Precedence).includes(token);
    }

    private tokenize(expression: string) {
        let exp = new RegExp("/\\*([\\s\\S]*?)\\*/|//.*|'(.*?)'|\"(.*?)\"|\\`([\\s\\S]*?)\\`|\\.{3}|[$\\w.]+|(\\+\\+|--|\\|\\||&&|>>>|>>|<<|==|!=)(=){0,1}|=>|\\*\\*(=){0,1}|[+*-/%=><!\\|&~^](=){0,1}|[?;:()\\[\\]\{\\}]", "g");
        let tokens = expression.match(exp)
        //console.log("当前分割1", tokens)
        if (!tokens) {
            return null;
        }

        //处理函数
        let result1: string[] = [];
        let flag = 0;

        let isSingle = (str: any) => {
            return !isNaN(str) || this.isOperator(str) || str == ")" || str == "(";
        }

        for (let i = 0; i < tokens.length; i++) {
            let str1 = tokens[i];
            let str2 = tokens[i + 1];
            if (flag) {
                result1[result1.length - 1] += str1;
                if (str2) {
                    if (str2 == ")") {
                        flag--;
                        if (!flag) {
                            result1[result1.length - 1] += str2;
                            i++;
                        }
                    }
                    else if (str2 == "(") {
                        flag++;
                    }

                }
            } else {
                result1.push(str1)
                flag = (!isSingle(str1) && str2 == "(") ? 1 : 0
            }
        }
        //console.log("当前分割2", result1)

        //再次处理属性
        let result2: string[] = [];


        for (let i = 0; i < result1.length; i++) {
            let str1 = result1[i];
            let str2 = result1[i + 1];
            result2.push(str1)
            if (str2 && !isSingle(str1) && !isSingle(str2)) {
                i++;
                result2[result2.length - 1] += str2;
            }

        }
        return result2;
    }

    parse(expression: string): ExpressTree {
        if (this._catch.has(expression)) {
            return this._catch.get(expression) as ExpressTree;
        }
        const tokens = this.tokenize(expression);
        const operationsStack: string[] = [];
        const valuesStack: ExpressTree[] = [];

        const applyOperator = (): void => {
            const operator = operationsStack.pop() as string;
            const right = valuesStack.pop() as ExpressTree;
            const left = valuesStack.pop() as ExpressTree;
            const node = ExpressTree.creatreExpressTree(operator);
            node.left = left;
            node.right = right;
            valuesStack.push(node);
        };

        tokens?.forEach(token => {
            if (token === '(') {
                operationsStack.push(token);
            } else if (token === ')') {
                while (operationsStack[operationsStack.length - 1] !== '(') {
                    applyOperator();
                }
                operationsStack.pop();
            } else if (!this.isOperator(token)) {
                valuesStack.push(ExpressTree.creatreExpressTree(token));
            } else {
                while (operationsStack.length &&
                    Precedence[token] <= Precedence[operationsStack[operationsStack.length - 1]]) {
                    applyOperator();
                }
                operationsStack.push(token);
            }
        });

        while (operationsStack.length) {
            applyOperator();
        }

        let result=valuesStack.pop() as ExpressTree;
        this._catch.set(expression,result);
        return result;
    }

}