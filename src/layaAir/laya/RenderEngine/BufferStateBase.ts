import { LayaGL } from "../layagl/LayaGL"
import { IRenderVertexState } from "../RenderEngine/RenderInterface/IRenderVertexState";
import { IndexBuffer } from "./IndexBuffer";
import { VertexBuffer } from "./VertexBuffer";

/**
 * ...
 * @author ...
 */
export class BufferStateBase {
    /**@internal */
    static _curBindedBufferState: BufferStateBase;

    /**@private [只读]*/
    protected _nativeVertexArrayObject: IRenderVertexState;

    /**@internal [只读]*/
    _bindedIndexBuffer: IndexBuffer;

    /**@internal */
    _vertexBuffers:VertexBuffer[];
    

    constructor() {
        this._nativeVertexArrayObject = LayaGL.renderEngine.createVertexState();
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

    protected applyVertexBuffers(): void {
        this._nativeVertexArrayObject.applyVertexBuffer(this._vertexBuffers);
    }

    protected applyIndexBuffers():void{
        this._nativeVertexArrayObject.applyIndexBuffer(this._bindedIndexBuffer);
    }


    /**
     * @private
     */
    destroy(): void {
        this._nativeVertexArrayObject.destroy();
        this._nativeVertexArrayObject = null;
    }
}


