import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { WebGLEngine } from "./WebGLEngine";
import { GLVertexState } from "./WebGLEngine/GLVertexState";
import { WebGLIndexBuffer } from "./WebGLIndexBuffer";
import { WebGLVertexBuffer } from "./WebGLVertexBuffer";

export class WebGLBufferState implements IBufferState {
    static _curBindedBufferState: WebGLBufferState;
    _glVertexState: GLVertexState;
    _bindedIndexBuffer: WebGLIndexBuffer;
    _vertexBuffers: WebGLVertexBuffer[];
    constructor() {
        this._glVertexState = WebGLEngine.instance.createVertexState();
    }

    
	private applyVertexBuffers(): void {
		this._glVertexState.applyVertexBuffer(this._vertexBuffers);
	}

	protected applyIndexBuffers(): void {
		this._glVertexState.applyIndexBuffer(this._bindedIndexBuffer);
	}

    applyState(vertexBuffers: WebGLVertexBuffer[], indexBuffer: WebGLIndexBuffer): void {
        this._vertexBuffers = vertexBuffers.slice();
        this._bindedIndexBuffer = indexBuffer;
        indexBuffer && indexBuffer._glBuffer.unbindBuffer();//清空绑定
        this.bind();
        this.applyVertexBuffers();
        this.applyIndexBuffers();
        this.unBind();
        indexBuffer && indexBuffer._glBuffer.unbindBuffer();//清空绑定
    }

    /**
     * @private
     */
    bind(): void {
        this._glVertexState.bindVertexArray();
        WebGLBufferState._curBindedBufferState = this;
    }

    /**
     * @private
     */
    unBind(): void {
        if (WebGLBufferState._curBindedBufferState == this) {
            this._glVertexState.unbindVertexArray();
            WebGLBufferState._curBindedBufferState = null;
        } else {
            throw "BufferState: must call bind() function first.";
        }
    }

    isBind(): boolean {
        return (WebGLBufferState._curBindedBufferState == this);
    }

    destroy(): void {
        this._glVertexState.destroy();
        this._vertexBuffers = null;
        this._bindedIndexBuffer = null;
    }

}