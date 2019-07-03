/**
 * ...
 * @author ...
 */
export declare class BufferStateBase {
    /**@private [只读]*/
    private _nativeVertexArrayObject;
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
