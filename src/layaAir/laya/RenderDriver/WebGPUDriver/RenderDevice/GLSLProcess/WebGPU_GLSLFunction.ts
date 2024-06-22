import { WebGPU_GLSLCommon } from "./WebGPU_GLSLCommon";

/**
 * 函数参数
 */
interface Parameter {
    name: string; //参数名称
    type: string; //参数类型
    inout?: string; //存储修饰符（in、out、inout、const）
    precision?: string; //精度限定符（lowp、mediump、highp）
    isArray: boolean; //是否是数组
    arrayLength?: number; //如果是数组，表示数组的长度
    isStruct: boolean; //是否是结构体
}

/**
 * 函数调用
 */
interface FunctionCall {
    name: string; //函数名
    params: string[]; //参数列表
}

/**
 * 不放入函数调用列表的关键词
 */
const notPutToFuncCall = [
    // Varible Functions
    "int", "float", "bool", "vec2", "vec3", "vec4",
    "bvec2", "bvec3", "bvec4", "ivec2", "ivec3", "ivec4",
    "hvec2", "hvec3", "hvec4", "fvec2", "fvec3", "fvec4",
    "mat2", "mat3", "mat4", "layout",

    // Controls
    "if", "else", "for", "while", "do", "switch",

    // Angle and Trigonometry Functions
    "radians", "degrees", "sin", "cos", "tan",
    "asin", "acos", "atan", "sinh", "cosh",
    "tanh", "asinh", "acosh", "atanh",

    // Exponential Functions
    "pow", "exp", "log", "exp2", "log2",
    "sqrt", "inversesqrt",

    // Common Functions
    "abs", "sign", "floor", "trunc", "round",
    "roundEven", "ceil", "fract", "mod", "modf",
    "min", "max", "clamp", "mix", "step",
    "smoothstep", "isnan", "isinf", "floatBitsToInt",
    "floatBitsToUint", "intBitsToFloat", "uintBitsToFloat",

    // Geometric Functions
    "length", "distance", "dot", "cross",
    "normalize", "faceforward", "reflect",
    "refract",

    // Matrix Functions
    "matrixCompMult", "outerProduct", "determinant",

    // Vector Relational Functions
    "lessThan", "lessThanEqual", "greaterThan",
    "greaterThanEqual", "equal", "notEqual",
    "any", "all", "not",

    // Texture Lookup Functions
    "texture", "texture2D", "textureSize", "textureProj",
    "textureLod", "textureOffset", "texelFetch",
    "texelFetchOffset", "textureProjOffset",
    "textureLodOffset", "textureProjLod",
    "textureProjLodOffset", "textureGrad",
    "textureGradOffset", "textureProjGrad",
    "textureProjGradOffset"
];

/**
 * GLSL函数定义
 */
export class WebGPU_GLSLFunction {
    name: string; //名称
    return: string; //返回值类型
    precision: string; //精度限定符
    all: string; //函数定义的全部字符串
    head: string; //函数头
    body: string; //函数体
    params: Parameter[] = []; //参数列表
    calls: FunctionCall[] = []; //函数调用列表

    //对函数进行处理（将sampler转换为texture和sampler）
    samplerProcessed: boolean = false; //是否已经处理过
    samplerParams: Parameter[]; //参数列表
    samplerBody: string; //函数体
    samplerOutput: string; //输出代码

    //GLSL变量类型
    static variableType = ['float', 'int', 'void', 'bool', 'vec2', 'vec3', 'vec4', 'mat2', 'mat3', 'mat4'];

    constructor(all: string) {
        this.all = all;
        this._getHeadAndBody();
        this._parse();
    }

    /**
     * 获取函数头和函数体
     */
    private _getHeadAndBody() {
        const all = this.all;
        for (let i = 0, len = all.length; i < len; i++) {
            if (all[i] !== '{') continue;
            this.head = all.substring(0, i);
            this.body = all.substring(i);
            break;
        }
        this.head = this.head.replace(/\n/g, '').trim(); //去除换行符
        this.body = this.body.replace(/^\s*[\r\n]/gm, ''); //去除空行
    }

    /**
     * 解析函数定义
     */
    private _parse() {
        //基本的函数正则表达式
        const headRegex = /((lowp|mediump|highp)\s+)?(\w+)\s+(\w+)\s*\((.*?)\)/; //函数头部（精度限定符、返回值类型、函数名、参数）
        const paramRegex = /((lowp|mediump|highp)\s+)?((in|out|inout|const)\s+)?([\w]+)\s+([\w]+)\s*(\[\d*\])?/g; //函数参数

        const headMatch = this.head.match(headRegex);
        if (headMatch) {
            this.precision = headMatch[1] ? headMatch[1].trim() : undefined;
            this.return = headMatch[3].trim();
            this.name = headMatch[4].trim();
            const paramsStr = headMatch[5];

            let paramMatch;
            while ((paramMatch = paramRegex.exec(paramsStr)) !== null) {
                const [, precision, , inout, , type, name, array] = paramMatch;
                const isStruct = !WebGPU_GLSLFunction.variableType.includes(type);
                const isArray = array !== undefined;
                let arrayLength = undefined;
                if (isArray)
                    arrayLength = parseInt(array.replace(/\D/g, ''));
                this.params.push({
                    name,
                    type,
                    inout,
                    precision,
                    isArray,
                    arrayLength,
                    isStruct
                });
            }
        }

        //查找函数体内的函数调用
        this._findFunctionCalls(this.body);

        //生成函数头
        this.head = `${this.return} ${this.name}(`;
        this.head += this.params.map(param => {
            let str = '';
            if (param.inout) str += `${param.inout} `;
            str += `${param.type} ${param.name}`;
            if (param.isArray) str += `[${param.arrayLength}]`;
            return str;
        }).join(', ');
        this.head += ')';
    }

    /**
     * 查找函数调用
     * @param glslCode 
     */
    private _findFunctionCalls(glslCode: string) {
        //使用正则表达式匹配函数调用，同时捕获函数名和参数部分
        //@ts-ignore
        const regex = /(\b\w+\b)\s*\(([^()]*\([^()]*\)[^()]*)*([^()]*)\)/gs;
        let matches: RegExpExecArray | null;
        while ((matches = regex.exec(glslCode)) !== null) {
            const name = matches[1];
            const args = matches[0].slice(name.length).trim();
            if (!notPutToFuncCall.includes(name)) {
                const param = WebGPU_GLSLCommon.findParamInBracket(args, 0);
                if (param) {
                    this.calls.push({
                        name,
                        params: param.elements
                    });
                }
            }
            //检查参数中是否还有函数调用，如果有，递归调用处理
            if (args.includes('('))
                this._findFunctionCalls(args);
        }
    }

    /**
     * 对函数进行处理，将sampler转换为texture和sampler
     * @param textureNames
     */
    processSampler(textureNames: string[]) {
        if (!this.samplerProcessed) {
            this.samplerProcessed = true;
            this.samplerParams = [];
            this.samplerBody = this.body;
            for (let i = 0, len = this.params.length; i < len; i++) {
                const param = this.params[i];
                if (param.type.includes('sampler')) {
                    const textureType = param.type.replace('sampler', 'texture');
                    const samplerType = 'sampler';
                    const textureName = param.name + '_texture';
                    const samplerName = param.name + '_sampler';
                    const textureParam = {
                        name: textureName,
                        type: textureType,
                        inout: param.inout,
                        precision: param.precision,
                        isArray: param.isArray,
                        arrayLength: param.arrayLength,
                        isStruct: param.isStruct
                    };
                    const samplerParam = {
                        name: samplerName,
                        type: samplerType,
                        inout: param.inout,
                        precision: param.precision,
                        isArray: param.isArray,
                        arrayLength: param.arrayLength,
                        isStruct: param.isStruct
                    };
                    this.samplerParams.push(textureParam, samplerParam);
                    let functionNames;
                    let replacementInCategory;
                    let replacementOutOfCategory;
                    if (param.type == 'sampler2D') {
                        functionNames = ['texture', 'texture2D'];
                        replacementInCategory = `sampler2D(${textureName}, ${samplerName})`;
                    } else if (param.type == 'samplerCube') {
                        functionNames = ['texture', 'textureCube'];
                        replacementInCategory = `samplerCube(${textureName}, ${samplerName})`;
                    }
                    replacementOutOfCategory = `${textureName}, ${samplerName}`;
                    this.samplerBody = WebGPU_GLSLCommon.replaceArgumentByFunctionCategory
                        (this.samplerBody, param.name, functionNames, replacementInCategory, replacementOutOfCategory);
                } else this.samplerParams.push(param);
            }

            //处理直接调用
            const functionNames = ['texture', 'texture2D', 'textureCube'];
            for (let i = 0; i < textureNames.length; i++) {
                const replacementInCategory: string = null;
                const replacementOutOfCategory = `${textureNames[i]}Texture, ${textureNames[i]}Sampler`;
                this.samplerBody = WebGPU_GLSLCommon.replaceArgumentByFunctionCategory
                    (this.samplerBody, textureNames[i], functionNames, replacementInCategory, replacementOutOfCategory);
            }

            //合成输出代码
            this.samplerOutput = `${this.return} ${this.name}(`;
            this.samplerOutput += this.samplerParams.map(param => {
                let str = '';
                if (param.inout) str += `${param.inout}`;
                str += `${param.type} ${param.name}`;
                if (param.isArray) str += `[${param.arrayLength}]`;
                return str;
            }).join(', ');
            this.samplerOutput += ')\n';
            this.samplerOutput += this.samplerBody;
        }
    }
}