export class WebGPU_GLSLCommon {
    /**
     * 替换字符串的一部分
     * @param str 输入字符串
     * @param replace 替换项
     * @param start 替换开始位置（包含）
     * @param end 替换结束位置（不包含）
     */
    static replaceStringPart(str: string, replace: string, start: number, end: number): string {
        //截取起始位置之前的部分
        const beforePart = str.substring(0, start);
        //截取终止位置之后的部分
        const afterPart = str.substring(end);
        //将三部分重新连接
        return beforePart + replace + afterPart;
    }

    /**
     * 在第一对括号内查找参数，查找以逗号分割的参数，括号可以嵌套，不在第一对括号内的逗号不会被分割
     * @param input 输入字符串（带括号）
     * @param start 从哪个位置开始查找
     * @param bracket 指定括号（默认为小括号）
     */
    static findParamInBracket(input: string, start: number, bracket: string = '()')
        : { full: string, elements: string[], index: number } | null {
        let depth = 0; //用来跟踪当前的括号深度
        let firstParentIndex = 0; //第一对左括号的位置
        const beginBracket = bracket[0];
        const endBracket = bracket[1];

        const length = input.length;
        for (let i = start; i < length; i++) {
            if (input[i] === beginBracket) {
                firstParentIndex = i;
                break;
            }
            if (input[i] !== ' ' && input[i] !== '\t' && input[i] !== '\n' && input[i] !== '\r')
                return null; //没有找到左括号
        }

        let element: string;
        let elements: string[] = [];
        start = firstParentIndex; //记录元素开始位置
        let currentElementStart = firstParentIndex + 1; //记录当前元素的开始位置

        for (let i = firstParentIndex; i < length; i++) {
            const char = input[i];
            if (char === beginBracket)
                depth++;
            else if (char === endBracket) {
                depth--;
                //当回到最顶层括号层级时，结束循环
                if (depth === 0) {
                    start = i + 1;
                    //把最后一个元素加进去
                    element = input.substring(currentElementStart, i).trim();
                    if (element.length > 0)
                        elements.push(element);
                    break;
                }
            } else if (char === ',' && depth === 1) { //仅在最顶层括号里面的逗号处进行分割
                element = input.substring(currentElementStart, i).trim();
                if (element.length > 0)
                    elements.push(element);
                currentElementStart = i + 1; //设置下一个元素的开始位置
            }
        }

        const full = input.substring(firstParentIndex, start);
        return {
            full,
            elements,
            index: start
        };
    }

    /**
     * 根据函数类型替换指定实参
     * @param code 要替换的代码
     * @param variableName 要查找的变量名
     * @param functionNames 包含特定函数名称的数组
     * @param replacementInCategory 替换字符串，如果函数名称在提供的数组中
     * @param replacementOutOfCategory 替换字符串，如果函数名称不在提供的数组中
     * @return 返回替换后的代码
     */
    static replaceArgumentByFunctionCategory(code: string, variableName: string, functionNames: string[],
        replacementInCategory: string, replacementOutOfCategory: string) {
        //匹配函数和它的参数列表
        const functionRegex = new RegExp('([\\w]+)\\s*\\(([^)]*)\\)', 'g');
        const updatedCode = code.replace(functionRegex, (match, functionName, argsList) => {
            let args = argsList.split(',').map((arg: string) => arg.trim());
            const replacement = functionNames.includes(functionName) ? replacementInCategory : replacementOutOfCategory;
            //遍历参数，仅替换符合条件的参数
            args = args.map((arg: string) => arg === variableName ? (replacement ? replacement : arg) : arg);
            //重构函数调用字符串，并返回以替换原始字符串
            return `${functionName}(${args.join(', ')})`;
        });
        return updatedCode;
    }

    /**
     * 移除括号内的空格
     * @param str 输入字符串
     * @param bracket 指定括号（默认为小括号）
     */
    static removeSpacesInBracket(str: string, bracket: string = '()') {
        const length = str.length;
        const beginBracket = bracket[0];
        const endBracket = bracket[1];

        //定义一个递归函数，用来处理括号内的内容
        const _process = (index: number): [string, number] => {
            let result = '', i = index;
            while (i < length) {
                const char = str[i];
                if (char === beginBracket) {
                    //遇到左括号，递归处理括号内的内容，得到结果和新的索引位置
                    const [inner, newIndex] = _process(i + 1);
                    result += beginBracket + inner; //添加处理后的括号内内容
                    i = newIndex; //更新索引位置
                } else if (char === endBracket) {
                    //遇到右括号，返回处理结果和当前的索引位置
                    return [result, i - 1];
                } else {
                    //包含空格和非空格字符，因为我们现在在括号内部
                    result += char === ' ' && str[i - 1] !== beginBracket && str[i + 1] !== endBracket ? '' : char;
                }
                i++;
            }
            return [result, i];
        }

        //处理字符串，保留括号外的内容包括空格
        let result = '', i = 0;
        while (i < length) {
            if (str[i] === beginBracket) {
                //处理括号内的内容，并更新索引
                const [inner, newIndex] = _process(i + 1);
                result += beginBracket + inner; //添加处理后的括号内内容
                i = newIndex; //更新索引位置
            } else {
                //括号外的内容，直接添加到最终结果中
                result += str[i];
            }
            i++;
        }
        return result;
    }
}