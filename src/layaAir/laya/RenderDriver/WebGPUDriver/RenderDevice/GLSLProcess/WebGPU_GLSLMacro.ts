import { WebGPU_GLSLCommon } from "./WebGPU_GLSLCommon";

/**
 * GLSL宏定义
 */
export class WebGPU_GLSLMacro {
    all: string; //完整宏定义
    name: string; //名称
    params?: string[]; //参数列表
    replace?: string; //替换项

    constructor(all: string) {
        this.all = all;
        this._parse();
    }

    /**
     * 解析
     */
    private _parse() {
        let macro = this.all.replace(/^#\s*define\s+/, '').trim(); //移除宏定义前缀
        macro = WebGPU_GLSLCommon.removeSpacesInBracket(macro); //移除()内的空格

        //查找第一个空格，分割宏名称和替换项
        const index = macro.indexOf(' ');
        if (index === -1) {
            this.name = macro; //没有替换项，只有宏名称，是最简单的宏定义
        } else {
            const firstPart = macro.slice(0, index);
            let lastPart = macro.slice(index + 1).trim();
            if (lastPart.length === 0)
                lastPart = undefined;
            const paramStartIndex = firstPart.indexOf('(');
            if (paramStartIndex !== -1) { //带参数宏定义
                //尝试找到参数列表的结尾，我们简化逻辑，假设参数列表不含有未关闭的括号，且宏定义不跨行
                const paramEndIndex = firstPart.indexOf(')', paramStartIndex);
                this.name = firstPart.slice(0, paramStartIndex).trim();
                this.params = firstPart.slice(paramStartIndex + 1, paramEndIndex).split(',').map(param => param.trim());
                this.replace = lastPart;
            } else { //无参数宏定义
                this.name = firstPart;
                this.replace = lastPart;
            }
        }
    }

    /**
     * 替换GLSL代码中的宏
     * @param glslCode 原始GLSL代码
     * @returns 替换后的GLSL代码
     */
    replaceMacros(glslCode: string): string {
        let match, outCode = glslCode;
        const regex = new RegExp(`\\b${this.name}\\b`, 'g');
        if (this.params && this.params.length > 0) { //有参数的宏
            while ((match = regex.exec(outCode)) !== null) {
                const param = WebGPU_GLSLCommon.findParamInBracket(outCode, match.index + this.name.length);
                if (param) {
                    let replace = this.replace;
                    for (let i = 0; i < this.params.length; i++)
                        replace = replace.replace(new RegExp(this.params[i], 'g'), param.elements[i]);
                    outCode = WebGPU_GLSLCommon.replaceStringPart(outCode, replace, match.index, param.index);
                }
            }
        } else outCode = outCode.replace(regex, this.replace); //无参数的宏
        return outCode;
    }
}