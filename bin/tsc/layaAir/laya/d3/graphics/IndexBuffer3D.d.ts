import { Buffer } from "../../webgl/utils/Buffer";
/**
 * <code>IndexBuffer3D</code> 类用于创建索引缓冲。
 */
export declare class IndexBuffer3D extends Buffer {
    /** 8位ubyte无符号索引类型。*/
    static INDEXTYPE_UBYTE: string;
    /** 16位ushort无符号索引类型。*/
    static INDEXTYPE_USHORT: string;
    /** @private */
    private _indexType;
    /** @private */
    private _indexTypeByteCount;
    /** @private */
    private _indexCount;
    /** @private */
    private _canRead;
    /**
     * 获取索引类型。
     *   @return	索引类型。
     */
    readonly indexType: string;
    /**
     * 获取索引类型字节数量。
     *   @return	索引类型字节数量。
     */
    readonly indexTypeByteCount: number;
    /**
     * 获取索引个数。
     *   @return	索引个数。
     */
    readonly indexCount: number;
    /**
     * 获取是否可读。
     *   @return	是否可读。
     */
    readonly canRead: boolean;
    /**
     * 创建一个 <code>IndexBuffer3D,不建议开发者使用并用IndexBuffer3D.create()代替</code> 实例。
     * @param	indexType 索引类型。
     * @param	indexCount 索引个数。
     * @param	bufferUsage IndexBuffer3D用途类型。
     * @param	canRead 是否可读。
     */
    constructor(indexType: string, indexCount: number, bufferUsage?: number, canRead?: boolean);
    /**
     * @inheritDoc
     */
    _bindForVAO(): void;
    /**
     * @inheritDoc
     */
    bind(): boolean;
    /**
     * 设置数据。
     * @param	data 索引数据。
     * @param	bufferOffset 索引缓冲中的偏移。
     * @param	dataStartIndex 索引数据的偏移。
     * @param	dataCount 索引数据的数量。
     */
    setData(data: any, bufferOffset?: number, dataStartIndex?: number, dataCount?: number): void;
    /**
     * 获取索引数据。
     *   @return	索引数据。
     */
    getData(): Uint16Array;
    /**
     * @inheritDoc
     */
    destroy(): void;
}
