import { DrawType } from "../../RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEnum/RenderPologyMode";
import { IRenderDrawContext } from "../../RenderInterface/IRenderDrawContext";
import { IRenderGeometryElement } from "../../RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { GLObject } from "../WebGLEngine/GLObject";
import { WebGLEngine } from "../WebGLEngine/WebGLEngine";

//TODO
export class NativeGLRenderDrawContext extends GLObject implements IRenderDrawContext {
    _nativeObj: any;
    constructor(engine: WebGLEngine) {
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

    drawArrays(mode: MeshTopology, first: number, count: number): void {
        this._nativeObj.drawArrays(mode, first, count);
    }

    drawElements(mode: MeshTopology, count: number, type: IndexFormat, offset: number): void {
        this._nativeObj.drawElements(mode, count, type, offset);
    }

    drawGeometryElement(geometryElement: IRenderGeometryElement): void {
        this._nativeObj.drawGeometryElement((geometryElement as any)._nativeObj);
    }


}