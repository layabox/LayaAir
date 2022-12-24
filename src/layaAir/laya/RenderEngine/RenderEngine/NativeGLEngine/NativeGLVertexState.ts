import { IndexBuffer } from "../../IndexBuffer";
import { IRenderVertexState } from "../../RenderInterface/IRenderVertexState";
import { VertexBuffer } from "../../VertexBuffer";
import { VertexDeclaration } from "../../VertexDeclaration";
import { NativeGLObject } from "./NativeGLObject";
import { NativeWebGLEngine } from "./NativeWebGLEngine";


export class NativeGLVertexState extends NativeGLObject implements IRenderVertexState {

    _vertexDeclaration: VertexDeclaration[] = [];
    _bindedIndexBuffer: IndexBuffer;
    _vertexBuffers: VertexBuffer[];
    _nativeVertexBuffers:any[];
    _nativeObj: any;
    constructor(engine: NativeWebGLEngine) {
        super(engine);
        this._nativeObj = new (window as any).conchGLVertexState(engine._nativeObj);
        this._nativeVertexBuffers=[];
    }

    /**
     * @internal
     */
    bindVertexArray(): void {
        this._nativeObj.bindVertexArray();
    }

    /**
     * @internal
     */
    unbindVertexArray(): void {
        this._nativeObj.unbindVertexArray();
    }

    applyVertexBuffer(vertexBuffer: VertexBuffer[]): void {
        this._vertexBuffers = vertexBuffer;
        this._nativeVertexBuffers.length = 0;
        vertexBuffer.forEach((element) => {
            this._nativeVertexBuffers.push((element as any)._conchVertexBuffer3D);
        });
        this._nativeObj.applyVertexBuffer(this._nativeVertexBuffers);
    }

    applyIndexBuffer(indexBuffer: IndexBuffer|null): void {
        //需要强制更新IndexBuffer
        
        if(indexBuffer==null){
            return;
        }
        this._bindedIndexBuffer = indexBuffer;
        this._nativeObj.applyIndexBuffer((indexBuffer as any)._conchIndexBuffer3D);
    }
    /**
     * @internal
     */
    destroy() {
        this._vertexBuffers = null;
        this._nativeVertexBuffers=[];
        this._bindedIndexBuffer = null;
        super.destroy();
        this._nativeObj.destroy()
    }
} 