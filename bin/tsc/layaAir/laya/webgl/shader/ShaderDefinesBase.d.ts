export declare class ShaderDefinesBase {
    private _name2int;
    private _int2name;
    private _int2nameMap;
    constructor(name2int: any, int2name: any[], int2nameMap: any[]);
    add(value: any): number;
    addInt(value: number): number;
    remove(value: any): number;
    isDefine(def: number): boolean;
    getValue(): number;
    setValue(value: number): void;
    toNameDic(): any;
    static _reg(name: string, value: number, _name2int: any, _int2name: any[]): void;
    static _toText(value: number, _int2name: any[], _int2nameMap: any): any;
    static _toInt(names: string, _name2int: any): number;
}
