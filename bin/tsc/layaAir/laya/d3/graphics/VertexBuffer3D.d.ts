import { Buffer } from "../../webgl/utils/Buffer";
import { VertexDeclaration } from "./VertexDeclaration";
/**
 * <code>VertexBuffer3D</code> 类用于创建顶点缓冲。
 */
export declare class VertexBuffer3D extends Buffer {
    /**数据类型_Float32Array类型。*/
    static DATATYPE_FLOAT32ARRAY: number;
    /**数据类型_Uint8Array类型。*/
    static DATATYPE_UINT8ARRAY: number;
    /** @private */
    private _vertexCount;
    /** @private */
    private _canRead;
    /** @private */
    private _dataType;
    /** @private */
    _vertexDeclaration: VertexDeclaration;
    /**
     * 获取顶点声明。
     */
    /**
    * 获取顶点声明。
    */
    vertexDeclaration: VertexDeclaration;
    /**
     * 获取顶点个数。
     *   @return	顶点个数。
     */
    readonly vertexCount: number;
    /**
     * 获取是否可读。
     *   @return	是否可读。
     */
    readonly canRead: boolean;
    /**
     * 创建一个 <code>VertexBuffer3D,不建议开发者使用并用VertexBuffer3D.create()代替</code> 实例。
     * @param	vertexCount 顶点个数。
     * @param	bufferUsage VertexBuffer3D用途类型。
     * @param	canRead 是否可读。
     * @param   dateType 数据类型。
     */
    constructor(byteLength: number, bufferUsage: number, canRead?: boolean, dateType?: number);
    /**
     * @inheritDoc
     */
    bind(): boolean;
    /**
     * 设置数据。
     * @param	data 顶点数据。
     * @param	bufferOffset 顶点缓冲中的偏移。
     * @param	dataStartIndex 顶点数据的偏移。
     * @param	dataCount 顶点数据的数量。
     */
    setData(data: any, bufferOffset?: number, dataStartIndex?: number, dataCount?: number): void;
    /**
     * 获取顶点数据。
     * @return	顶点数据。
     */
    getData(): any;
    /**
     * @inheritDoc
     */
    destroy(): void;
}
