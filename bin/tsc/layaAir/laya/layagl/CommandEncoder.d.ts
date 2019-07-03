/**
 * @private
 * CommandEncoder
 */
export declare class CommandEncoder {
    constructor(layagl: any, reserveSize: number, adjustSize: number, isSyncToRenderThread: boolean);
    getArrayData(): any[];
    getPtrID(): number;
    beginEncoding(): void;
    endEncoding(): void;
    clearEncoding(): void;
    getCount(): number;
    add_ShaderValue(o: any): void;
    addShaderUniform(one: any): void;
}
