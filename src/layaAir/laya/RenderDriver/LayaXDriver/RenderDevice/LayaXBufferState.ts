import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";

export class LayaXBufferState implements IBufferState {
    _bindedIndexBuffer: IIndexBuffer;
    _vertexBuffers: IVertexBuffer[];
    _nativeObj: any;

    /** attribute location set, collected from vertex declarations (same as WebGPUBufferState._attriLocArray) */
    _attriLocArray: Set<number> = new Set();

    constructor() {
        this._nativeObj = new (window as any).conchLayaXBufferState();
    }

    applyState(vertexBuffers: IVertexBuffer[], indexBuffer: IIndexBuffer): void {
        this._vertexBuffers = vertexBuffers;
        this._bindedIndexBuffer = indexBuffer;

        this._attriLocArray.clear();
        let tempVertexBuffers: any = [];
        vertexBuffers.forEach((element) => {
            tempVertexBuffers.push((element as any)._nativeObj);
            // Collect attribute locations from vertex declaration
            let vb = element as any;
            if (vb.vertexDeclaration && vb.vertexDeclaration._VAElements) {
                let attriArray = vb.vertexDeclaration._VAElements;
                for (let j = 0; j < attriArray.length; j++) {
                    this._attriLocArray.add(attriArray[j].shaderLocation);
                }
            }
        });
        this._nativeObj.applyState(tempVertexBuffers, indexBuffer ? (indexBuffer as any)._nativeObj : null);
    }

    destroy(): void {
        this._nativeObj.destroy();
    }
}
