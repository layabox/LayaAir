import { Resource } from "laya/resource/Resource";
/**
 * <code>ScreenTriangle</code> 类用于创建全屏三角形。
 */
export declare class ScreenTriangle extends Resource {
    /** @private */
    static SCREENTRIANGLE_POSITION_UV: number;
    /** @private */
    private static _vertexDeclaration;
    /** @private */
    private static _vertices;
    /** @private */
    private static _verticesInvertUV;
    /**@private */
    static instance: ScreenTriangle;
    /**
     * @private
     */
    static __init__(): void;
    /** @private */
    private _vertexBuffer;
    /** @private */
    private _bufferState;
    /** @private */
    private _vertexBufferInvertUV;
    /** @private */
    private _bufferStateInvertUV;
    /**
     * 创建一个 <code>ScreenTriangle</code> 实例,禁止使用。
     */
    constructor();
    /**
     * @private
     */
    render(): void;
    /**
     * @private
     */
    renderInvertUV(): void;
    /**
     * @inheritDoc
     */
    destroy(): void;
}
