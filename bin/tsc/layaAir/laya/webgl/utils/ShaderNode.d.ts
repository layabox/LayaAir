export declare class ShaderNode {
    private static __id;
    childs: any[];
    text: string;
    parent: ShaderNode;
    name: string;
    noCompile: boolean;
    includefiles: any[];
    condition: any;
    conditionType: number;
    useFuns: string;
    z: number;
    src: string;
    constructor(includefiles: any[]);
    setParent(parent: ShaderNode): void;
    setCondition(condition: string, type: number): void;
    toscript(def: any, out: any[]): any[];
    private _toscript;
}
