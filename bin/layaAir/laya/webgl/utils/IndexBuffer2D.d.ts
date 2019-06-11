import { Buffer2D } from "././Buffer2D";
export declare class IndexBuffer2D extends Buffer2D {
    static create: Function;
    protected _uint16Array: Uint16Array;
    constructor(bufferUsage?: number);
    protected _checkArrayUse(): void;
    getUint16Array(): Uint16Array;
    /**
     * @inheritDoc
     */
    _bindForVAO(): void;
    /**
     * @inheritDoc
     */
    bind(): boolean;
    destory(): void;
    disposeResource(): void;
}
