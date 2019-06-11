import { Resource } from "laya/resource/Resource";
/**
 * <code>ScreenQuad</code> 类用于创建全屏四边形。
 */
export declare class ScreenQuad extends Resource {
    /** @private */
    static SCREENQUAD_POSITION_UV: number;
    /** @private */
    private static _vertexDeclaration;
    /** @private */
    private static _vertices;
    /** @private */
    private static _verticesInvertUV;
    /**@private */
    static instance: ScreenQuad;
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
     * 创建一个 <code>ScreenQuad</code> 实例,禁止使用。
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
