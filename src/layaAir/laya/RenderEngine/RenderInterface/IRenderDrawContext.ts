import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IndexFormat } from "../RenderEnum/IndexFormat";
import { MeshTopology } from "../RenderEnum/RenderPologyMode";

//TODO 先写完测试，这种封装过于死板
export interface IRenderDrawContext {
    /**@internal */
    drawArrays(mode: MeshTopology, first: number, count: number): void;
    /**@internal */
    drawArraysInstanced(mode: MeshTopology, first: number, count: number, instanceCount: number): void;
    /**@internal */
    drawElements(mode: MeshTopology, count: number, type: IndexFormat, offset: number): void;
    /**@internal TODO 重构2D后删除*/
    drawElements2DTemp(mode: MeshTopology, count: number, type: IndexFormat, offset: number): void;
    /**@internal */
    drawElementsInstanced(mode: MeshTopology, count: number, type: IndexFormat, offset: number, instanceCount: number): void;
    /**@internal */
    drawGeometryElement(geometryElement: IRenderGeometryElement): void;
}