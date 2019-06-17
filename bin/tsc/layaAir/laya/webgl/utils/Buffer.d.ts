export declare class Buffer {
    static _bindedVertexBuffer: any;
    static _bindedIndexBuffer: any;
    protected _glBuffer: any;
    protected _buffer: any;
    protected _bufferType: number;
    protected _bufferUsage: number;
    _byteLength: number;
    readonly bufferUsage: number;
    constructor();
    /**
     * @private
     * 绕过全局状态判断,例如VAO局部状态设置
     */
    _bindForVAO(): void;
    /**
     * @private
     */
    bind(): boolean;
    /**
     * @private
     */
    destroy(): void;
}
