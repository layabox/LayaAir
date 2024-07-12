import { WebGPU_GLSLMacro } from "./WebGPU_GLSLMacro";
import { WebGPU_GLSLStruct } from "./WebGPU_GLSLStruct";
import { WebGPU_GLSLFunction } from "./WebGPU_GLSLFunction";
import { WebGPU_GLSLUniform } from "./WebGPU_GLSLUniform";

/**
 * GLSL代码处理
 */
export class WebGPU_GLSLProcess {
    glInter: string[] = []; //内置变量
    globals: string[] = []; //全局变量
    macros: WebGPU_GLSLMacro[] = []; //宏定义
    structs: WebGPU_GLSLStruct[] = []; //结构体定义
    uniforms: WebGPU_GLSLUniform[] = []; //uniform定义
    functions: WebGPU_GLSLFunction[] = []; //函数定义
    textureNames: string[] = []; //所有的贴图名称
    glslCode: string = ''; //处理后的GLSL代码
    haveVertexID: boolean = false; //是否包含gl_VertexID

    /**
     * 处理GLSL代码
     * @param glslCode GLSL代码
     * @param textureNames 所有的贴图名称
     */
    process(glslCode: string, textureNames: string[]) {
        this.textureNames = textureNames;
        this._removeComments(glslCode); //移除注释
        this._extractMacros(this.glslCode); //提取宏定义
        for (let i = 0; i < 3; i++)
            this._replaceMacros(this.glslCode); //执行宏替换（处理宏替换嵌套，执行3次）
        this._extractInternals(this.glslCode); //提取内置变量
        this._extractFunctions(this.glslCode); //提取函数定义
        this._extractStructs(this.glslCode); //提取结构体定义
        this._extractGlobals(this.glslCode); //提取全局变量
        this._findUsedFunctions(); //查找被使用的函数

        //对函数进行处理，处理sampler类型的参数（参数一分为二）
        for (let i = 0; i < this.functions.length; i++)
            this.functions[i].processSampler(textureNames);

        this._outputGLSL(); //输出处理后的GLSL代码
    }

    /**
     * 获取Uniform信息
     * @param glslCode 
     */
    getUniforms(glslCode: string) {
        this._extractMacros(glslCode); //提取宏定义
        for (let i = 0; i < 3; i++)
            this._replaceMacros(this.glslCode); //执行宏替换（处理宏替换嵌套，执行3次）
        this._extractUniforms(this.glslCode);
        return this.uniforms;
    }

    /**
     * 移除注释
     * @param glslCode 
     */
    private _removeComments(glslCode: string) {
        let result = ''; //存储结果的字符串
        let isInSingleLineComment = false; //单行注释标志
        let isInMultiLineComment = false; //多行注释标志
        let char: string;
        let next: string;
        for (let i = 0, len = glslCode.length; i < len; i++) {
            char = glslCode[i];
            next = glslCode[i + 1];
            //检测多行注释的开始
            if (!isInSingleLineComment && char === '/' && next === '*') {
                isInMultiLineComment = true;
                i++; //跳过注释的开始标志
                continue;
            }

            //检测多行注释的结束
            if (isInMultiLineComment && char === '*' && next === '/') {
                isInMultiLineComment = false;
                i++; //跳过注释的结束标志
                continue;
            }

            //检测单行注释的开始
            if (!isInMultiLineComment && char === '/' && next === '/') {
                isInSingleLineComment = true;
                i++; //跳过注释的开始标志
                continue;
            }

            //检测单行注释的结束（即行尾）
            if (isInSingleLineComment && (char === '\n' || char === '\r'))
                isInSingleLineComment = false;

            //如果既不在单行注释中也不在多行注释中，则将字符添加到结果中
            if (!isInSingleLineComment && !isInMultiLineComment)
                result += char;
        }
        this.glslCode = result;
    }

    /**
     * 移除不必要的空格
     * @param glslCode 
     */
    private _removeSpaces(glslCode: string) {
        let result = '';
        let inString = false;
        let isSpace = false;
        let stringDelimiter = ''; //用于记录是单引号还是双引号开始的字符串
        let prev = ''; //前一个字符
        let next = ''; //下一个字符
        let char: string; //当前字符
        for (let i = 0, len = glslCode.length; i < len; i++) {
            char = glslCode[i];

            //处理字符串字面量的开始和结束
            if ((char === '"' || char === '\'') && prev !== '\\') {
                if (!inString) {
                    inString = true;
                    stringDelimiter = char; //记住这是由哪个引号开始的字符串
                } else if (char === stringDelimiter) //只有当遇到匹配的引号时才结束字符串字面量
                    inString = false;
            }

            //如果我们处于字符串内，直接添加字符
            if (inString)
                result += char;
            else {
                //否则，检查并移除不必要的空格
                isSpace = char === ' ' || char === '\t';
                if (isSpace) {
                    next = glslCode[i + 1];
                    //如果上一个有效字符是操作符、分号、左括号，则当前空格不必要
                    if (!/[a-zA-Z0-9_]/.test(prev)) continue;
                    //如果下一个字符是操作符、分号、括号，则无需在之前添加空格
                    if (!/[a-zA-Z0-9_]/.test(next)) continue;
                }
                result += char;
            }

            //更新上一个字符（如果当前字符不是空格或是字符串内的空格，则更新）
            if (char !== ' ' || inString)
                prev = char;
        }
        this.glslCode = result.replace(/^\s*[\r\n]/gm, ''); //去除空行
    }

    /**
     * 提取宏定义
     * @param glslCode 
     */
    private _extractMacros(glslCode: string) {
        const regex = /^\s*#\s*define\s+/;
        const lines = glslCode.split('\n');
        const remove = []; //需要移除的行索引
        let currentMacro = '';

        for (let i = 0, len = lines.length; i < len; i++) {
            const line = lines[i].trim();
            //忽略空白行
            if (line.length === 0) continue;
            //处理宏定义
            if (currentMacro.length > 0 || regex.test(line)) {
                if (line.endsWith('\\')) { //续行
                    currentMacro += line.slice(0, -1) + ' ';
                    remove.push(i);
                } else {
                    currentMacro += line;
                    this.macros.push(new WebGPU_GLSLMacro(currentMacro));
                    currentMacro = '';
                    remove.push(i);
                }
            }
        }

        for (let i = remove.length - 1; i > -1; i--)
            lines.splice(remove[i], 1);
        this.glslCode = lines.join('\n');
    }

    /**
     * 执行宏替换
     * @param glslCode 
     */
    private _replaceMacros(glslCode: string) {
        for (let i = 0, len = this.macros.length; i < len; i++)
            glslCode = this.macros[i].replaceMacros(glslCode);
        this.glslCode = glslCode;
    }

    /**
     * 提取内置变量
     * @param glslCode
     */
    private _extractInternals(glslCode: string) {
        const regex = /\b(gl_VertexID|gl_FragColor|gl_Position)/g;

        let match;
        //查找内置变量
        while ((match = regex.exec(glslCode)) !== null) {
            const res = match[0].trim();
            if (this.glInter.indexOf(res) === -1)
                this.glInter.push(res);
        }
        if (this.glInter.indexOf('gl_VertexID') !== -1) {
            this.globals.push('int gl_VertexID;');
            this.haveVertexID = true;
        }
    }

    /**
     * 提取全局变量
     * @param glslCode
     */
    private _extractGlobals(glslCode: string) {
        const regex = /\b(?:const\s+)?(float|int|bool|vec[234]|mat[234]x?[234]?)(\s+\w+)(\[(\d+)\])?(\s*=\s*[^;]+)?;/g;

        let match;
        //查找全局变量
        while ((match = regex.exec(glslCode)) !== null)
            this.globals.push(match[0].trim());
        //移除全局变量
        this.glslCode = glslCode.replace(regex, '');
    }

    /**
     * 提取结构体定义
     * @param glslCode 
     */
    private _extractStructs(glslCode: string) {
        const regex = /struct\s+(\w+)\s*\{\s*([^}]+)\s*\}\s*;/gm;

        let match;
        //查找结构体定义
        while ((match = regex.exec(glslCode)) !== null)
            this.structs.push(new WebGPU_GLSLStruct(match[0].trim()));
        //移除结构体定义
        this.glslCode = glslCode.replace(regex, '');
    }

    /**
     * 提取Uniform定义
     * @param glslCode 
     */
    private _extractUniforms(glslCode: string) {
        const regex = /\buniform\s+(lowp|mediump|highp)?\s+(\w+)\s+(\w+)\s*;/gm;

        let match;
        //查找Uniform定义
        while ((match = regex.exec(glslCode)) !== null)
            this.uniforms.push(new WebGPU_GLSLUniform(match[0].trim()));
        //移除Uniform定义
        this.glslCode = glslCode.replace(regex, '');
    }

    /**
     * 提取函数定义
     * @param glslCode 
     */
    private _extractFunctions(glslCode: string) {
        const functions = this.functions;
        let depth = 0; //当前大括号的深度
        let lineStart = -1; //当前行的开始索引
        let commentMode: '' | '//' | '/*' = ''; //当前注释模式

        for (let i = 0, len = glslCode.length; i < len; i++) {
            const char = glslCode[i];
            const nextChar = glslCode[i + 1];

            //处理注释开始
            if (commentMode === '') {
                if (char === '/' && nextChar === '/') {
                    commentMode = '//';
                    i++;
                    continue;
                } else if (char === '/' && nextChar === '*') {
                    commentMode = '/*';
                    i++;
                    continue;
                }
            }

            //处理注释结束
            if (commentMode === '//') {
                if (char === '\n')
                    commentMode = '';
                continue;
            } else if (commentMode === '/*') {
                if (char === '*' && nextChar === '/') {
                    commentMode = '';
                    i++;
                }
                continue;
            }

            //如果处于注释模式中，忽略其他所有字符
            if (commentMode !== '') continue;

            //标记函数开始
            if (char === '{' && depth === 0) {
                //向前寻找至上一个非空白符的字符，检查是否有函数参数的结束括号`)`
                let j = i - 1;
                while (j >= 0 && /\s/.test(glslCode[j])) j--;

                if (glslCode[j] === ')') {
                    while (j >= 0 && glslCode[j] !== '(') j--; //继续向前寻找到对应的开始括号`(`
                    while (j >= 0 && /\s/.test(glslCode[j])) j--; //向前寻找函数返回类型的最后一个字符
                    let k = j;
                    while (k >= 0 && !/\s/.test(glslCode[k])) k--; //继续向前寻找到函数名称的开始位置

                    let returnTypeStart = k; //记录可能的函数返回类型开始位置
                    while (returnTypeStart >= 0 && /\s/.test(glslCode[returnTypeStart])) returnTypeStart--; //过滤掉名称之前的空白符
                    let returnTypeEnd = returnTypeStart;
                    while (returnTypeEnd >= 0 && !/\s/.test(glslCode[returnTypeEnd])) returnTypeEnd--; //继续寻找返回类型开始位置

                    //记录函数定义的起始位置（包括函数返回类型）
                    lineStart = returnTypeEnd + 1;
                }
            }

            if (char === '{')
                depth++; //进入一个新的层级
            else if (char === '}' && depth > 0) {
                depth--; //离开一个层级
                if (depth === 0 && lineStart >= 0) {
                    //此时完成了一个函数定义的提取
                    functions.push(new WebGPU_GLSLFunction(glslCode.substring(lineStart, i + 1).trim()));
                    lineStart = -1;
                }
            }
        }
        //移除函数定义
        for (let i = 0, len = this.functions.length; i < len; i++)
            glslCode = glslCode.replace(this.functions[i].all, '');
        this.glslCode = glslCode;
    }

    /**
     * 查找被使用的函数
     */
    private _findUsedFunctions() {
        const funcUsedNew: number[] = [];
        const funcUsedSet = new Set<number>();
        const _findFunc = (func: WebGPU_GLSLFunction) => {
            for (let i = 0, len = func.calls.length; i < len; i++) {
                const call = func.calls[i];
                for (let j = 0, len = this.functions.length; j < len; j++) {
                    const func = this.functions[j];
                    if (func.name === call.name) {
                        //检查参数是否匹配
                        const params = call.params;
                        const funcParams = func.params;
                        if (funcParams.length !== params.length) continue;
                        let isMatch = true;
                        // for (let m = 0, len = funcParams.length; m < len; m++) {
                        //     if (funcParams[m].type !== params[m]) { //要进一步改进，考虑参数匹配
                        //         isMatch = false;
                        //         break;
                        //     }
                        // }
                        if (isMatch && !funcUsedSet.has(j)) {
                            funcUsedNew.push(j);
                            funcUsedSet.add(j);
                        }
                    }
                }
            }
        };
        //先查找被main调用的函数
        funcUsedSet.add(this.functions.length - 1);
        _findFunc(this.functions[this.functions.length - 1]);
        while (funcUsedNew.length > 0) { //循环查找被调用的函数
            const fn = funcUsedNew.slice();
            funcUsedNew.length = 0;
            for (let i = 0, len = fn.length; i < len; i++)
                _findFunc(this.functions[fn[i]]);
        }
        //只保留被使用的函数
        for (let i = this.functions.length - 1; i > -1; i--)
            if (!funcUsedSet.has(i))
                this.functions.splice(i, 1);
    }

    /**
     * 输出处理后的GLSL代码
     */
    private _outputGLSL() {
        let output = '';
        for (let i = 0, len = this.globals.length; i < len; i++)
            output += this.globals[i] + '\n';
        output += '\n';
        for (let i = 0, len = this.structs.length; i < len; i++)
            output += this.structs[i].all + '\n\n';
        for (let i = 0, len = this.functions.length; i < len; i++) {
            if (!this.functions[i].samplerProcessed) {
                output += this.functions[i].head + '\n';
                output += this.functions[i].body + '\n\n';
            } else {
                output += this.functions[i].samplerOutput + '\n\n';
            }
        }
        this.glslCode = output;
    }

    /**
     * 获取一个变量
     * @param name 
     * @param isArray 
     */
    private _getVariable(name: string, isArray: boolean = false) {
        for (let i = this.structs.length - 1; i > -1; i--) {
            const ret = this.structs[i].getArrayField(name, isArray);
            if (ret !== undefined) return ret;
        }
        return undefined;
    }

    /**
     * 打印调试信息
     */
    debugInfo() {
        for (let i = 0, len = this.functions.length; i < len; i++)
            console.log(this.functions[i]);
    }
}