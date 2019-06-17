import { LayaGL } from "../layagl/LayaGL";
/**
 * ...
 * @author ...
 */
export class BufferStateBase {
    constructor() {
        this._nativeVertexArrayObject = LayaGL.layaGPUInstance.createVertexArray();
    }
    /**
     * @private
     */
    bind() {
        if (BufferStateBase._curBindedBufferState !== this) {
            LayaGL.layaGPUInstance.bindVertexArray(this._nativeVertexArrayObject);
            BufferStateBase._curBindedBufferState = this;
        }
    }
    /**
     * @private
     */
    unBind() {
        if (BufferStateBase._curBindedBufferState === this) {
            LayaGL.layaGPUInstance.bindVertexArray(null);
            BufferStateBase._curBindedBufferState = null;
        }
        else {
            throw "BufferState: must call bind() function first.";
        }
    }
    /**
     * @private
     */
    destroy() {
        LayaGL.layaGPUInstance.deleteVertexArray(this._nativeVertexArrayObject);
    }
    /**
     * @private
     */
    bindForNative() {
        LayaGL.instance.bindVertexArray(this._nativeVertexArrayObject);
        BufferStateBase._curBindedBufferState = this;
    }
    /**
     * @private
     */
    unBindForNative() {
        LayaGL.instance.bindVertexArray(null);
        BufferStateBase._curBindedBufferState = null;
    }
}
