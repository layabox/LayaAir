import { ShaderDefinesBase } from "../ShaderDefinesBase";
export declare class ShaderDefines2D extends ShaderDefinesBase {
    static TEXTURE2D: number;
    static PRIMITIVE: number;
    static FILTERGLOW: number;
    static FILTERBLUR: number;
    static FILTERCOLOR: number;
    static COLORADD: number;
    static WORLDMAT: number;
    static FILLTEXTURE: number;
    static SKINMESH: number;
    static SHADERDEFINE_FSHIGHPRECISION: number;
    static MVP3D: number;
    static NOOPTMASK: number;
    private static __name2int;
    private static __int2name;
    private static __int2nameMap;
    static __init__(): void;
    constructor();
    static reg(name: string, value: number): void;
    static toText(value: number, int2name: any[], int2nameMap: any): any;
    static toInt(names: string): number;
}
