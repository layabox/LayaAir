import { IndexFormat } from "../../RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEnum/RenderPologyMode";
import { IRenderDrawContext } from "../../RenderInterface/IRenderDrawContext";
import { IRenderGeometryElement } from "../../RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { NativeGLObject } from "./NativeGLObject";
import { NativeWebGLEngine } from "./NativeWebGLEngine";

//TODO
export class NativeGLRenderDrawContext extends NativeGLObject implements IRenderDrawContext {
    _nativeObj: any;
    constructor(engine: NativeWebGLEngine) {
        super(engine);
        this._nativeObj = new (window as any).conchGLRenderDrawContext((engine as any)._nativeObj);
    }

    /**
     * @internal
     */
    drawElementsInstanced(mode: MeshTopology, count: number, type: IndexFormat, offset: number, instanceCount: number): void {
        this._nativeObj.drawElementsInstanced(mode, count, type, offset, instanceCount);
    }

    /**
     * @internal
     */
    drawArraysInstanced(mode: MeshTopology, first: number, count: number, instanceCount: number): void {
        this._nativeObj.drawArraysInstanced(mode, first, count, instanceCount);
    }

    /**
     * @internal 
     */
    drawArrays(mode: MeshTopology, first: number, count: number): void {
        this._nativeObj.drawArrays(mode, first, count);
    }

    /**
     * @internal
     */
    drawElements(mode: MeshTopology, count: number, type: IndexFormat, offset: number): void {
        this._nativeObj.drawElements(mode, count, type, offset);
    }

    drawElements2DTemp(mode: MeshTopology, count: number, type: IndexFormat, offset: number): void {
        //todo
    }

    /**
     * @internal
     */
    drawGeometryElement(geometryElement: IRenderGeometryElement): void {
        this._nativeObj.drawGeometryElement((geometryElement as any)._nativeObj);
    }


}