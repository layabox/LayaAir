/**
     * @private
     */
export declare class ShaderDefines {
    /**@private */
    private _counter;
    /**@private [只读]*/
    defines: any;
    /**
     * @private
     */
    constructor(superDefines?: ShaderDefines);
    /**
     * @private
     */
    registerDefine(name: string): number;
}
