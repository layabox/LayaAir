import { LayaGL } from "../layagl/LayaGL"
import { IRenderVertexArray } from "../RenderEngine/RenderInterface/IRenderVertexArray";
import { Buffer } from "./utils/Buffer"

/**
 * ...
 * @author ...
 */
export class BufferStateBase {
    /**@internal [只读]*/
    static _curBindedBufferState: BufferStateBase;

    /**@private [只读]*/
    private _nativeVertexArrayObject: IRenderVertexArray;

    /**@internal [只读]*/
    _bindedIndexBuffer: Buffer;

    constructor() {
        this._nativeVertexArrayObject = LayaGL.renderEngine.createVertexArray();
    }

    /**
     * @private
     */
    bind(): void {
        if (BufferStateBase._curBindedBufferState !== this) {
            this._nativeVertexArrayObject.bindVertexArray();
            BufferStateBase._curBindedBufferState = this;
        }
    }

    /**
     * @private
     */
    unBind(): void {
        if (BufferStateBase._curBindedBufferState === this) {
            this._nativeVertexArrayObject.unbindVertexArray();
            BufferStateBase._curBindedBufferState = null;
        } else {
            throw "BufferState: must call bind() function first.";
        }
    }

    /**
     * @private
     */
    destroy(): void {
        //LayaGL.layaGPUInstance.deleteVertexArray(this._nativeVertexArrayObject);
        this._nativeVertexArrayObject.destroy();
        this._nativeVertexArrayObject = null;
    }
}


