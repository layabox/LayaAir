import { Buffer } from "./utils/Buffer";
/**
 * ...
 * @author ...
 */
export declare class BufferStateBase {
    /**@private [只读]*/
    static _curBindedBufferState: BufferStateBase;
    /**@private [只读]*/
    private _nativeVertexArrayObject;
    /**@private [只读]*/
    _bindedIndexBuffer: Buffer;
    constructor();
    /**
     * @private
     */
    bind(): void;
    /**
     * @private
     */
    unBind(): void;
    /**
     * @private
     */
    destroy(): void;
    /**
     * @private
     */
    bindForNative(): void;
    /**
     * @private
     */
    unBindForNative(): void;
}
