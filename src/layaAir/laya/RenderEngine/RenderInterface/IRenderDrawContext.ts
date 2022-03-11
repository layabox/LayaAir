import { IndexFormat } from "../../d3/graphics/IndexFormat";
import { MeshTopology } from "../RenderPologyMode";

//TODO 先写完测试，这种封装过于死板
export interface IRenderDrawContext {
    drawArrays(mode: MeshTopology,first:number,count:number):void;
    drawArraysInstanced(mode: MeshTopology, first: number, count: number, instanceCount: number): void;
    drawElements(mode:MeshTopology, count:number, type:IndexFormat, offset:number):void;
    drawElementsInstanced(mode: MeshTopology, count: number, type: IndexFormat, offset: number, instanceCount: number): void;
}