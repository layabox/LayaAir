import { Shader } from "../shader/Shader";
import { ShaderNode } from "./ShaderNode";
/**
 * @private
 * <code>ShaderCompile</code> 类用于实现Shader编译。
 */
export declare class ShaderCompile {
    static IFDEF_NO: number;
    static IFDEF_YES: number;
    static IFDEF_ELSE: number;
    static IFDEF_PARENT: number;
    static _removeAnnotation: RegExp;
    static _reg: RegExp;
    static _splitToWordExps: RegExp;
    static includes: any;
    static shaderParamsMap: any;
    private _nameMap;
    protected _VS: ShaderNode;
    protected _PS: ShaderNode;
    private static _parseOne;
    static addInclude(fileName: string, txt: string): void;
    static preGetParams(vs: string, ps: string): any;
    static splitToWords(str: string, block: ShaderNode): any[];
    static _clearCR: RegExp;
    defs: Object;
    constructor(vs: string, ps: string, nameMap: any);
    static _splitToWordExps3: RegExp;
    /**
     * @private
     */
    protected _compileToTree(parent: ShaderNode, lines: any[], start: number, includefiles: any[], defs: any): void;
    createShader(define: any, shaderName: any, createShader: Function, bindAttrib: any[]): Shader;
}
