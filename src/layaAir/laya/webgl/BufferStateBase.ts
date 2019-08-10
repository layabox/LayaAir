import { LayaGL } from "../layagl/LayaGL"
import { Buffer } from "./utils/Buffer"

/**
 * ...
 * @author ...
 */
export class BufferStateBase {
    /**@internal [只读]*/
    static _curBindedBufferState: BufferStateBase;

    /**@private [只读]*/
    private _nativeVertexArrayObject: any;

    /**@internal [只读]*/
    _bindedIndexBuffer: Buffer;

    constructor() {
        this._nativeVertexArrayObject = LayaGL.layaGPUInstance.createVertexArray();
    }

    /**
     * @private
     */
    bind(): void {
        if (BufferStateBase._curBindedBufferState !== this) {
            LayaGL.layaGPUInstance.bindVertexArray(this._nativeVertexArrayObject);
            BufferStateBase._curBindedBufferState = this;
        }
    }

    /**
     * @private
     */
    unBind(): void {
        if (BufferStateBase._curBindedBufferState === this) {
            LayaGL.layaGPUInstance.bindVertexArray(null);
            BufferStateBase._curBindedBufferState = null;
        } else {
            throw "BufferState: must call bind() function first.";
        }
    }

    /**
     * @private
     */
    destroy(): void {
        LayaGL.layaGPUInstance.deleteVertexArray(this._nativeVertexArrayObject);
    }

    /**
     * @private
     */
    bindForNative(): void {
        (<any>LayaGL.instance).bindVertexArray(this._nativeVertexArrayObject);
        BufferStateBase._curBindedBufferState = this;
    }

    /**
     * @private
     */
    unBindForNative(): void {
        (<any>LayaGL.instance).bindVertexArray(null);
        BufferStateBase._curBindedBufferState = null;
    }

}


