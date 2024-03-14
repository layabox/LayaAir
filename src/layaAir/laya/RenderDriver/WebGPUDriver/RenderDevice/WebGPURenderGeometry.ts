import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { WebGPUBufferState } from "./WebGPUBufferState";

export enum WebGPUPrimitiveTopology {
    point_list = "point-list",
    line_list = "line-list",
    line_strip = "line-strip",
    triangle_list = "triangle-list",
    triangle_strip = "triangle-strip"
}

interface WebGPUDrawArrayInfo {
    start?: number;
    count?: number;
}

interface WebGPUDrawElementInfo {
    elementStart?: number;
    elementCount?: number;
}

interface WebGPUDrawInstanceInfo {
    instanceCount?: number;
    instanceOffset?: number;
}

export class WebGPURenderGeometry implements IRenderGeometryElement {
    /**@internal */
    _drawArrayInfo: WebGPUDrawArrayInfo[];

    /**@internal */
    _drawElementInfo: WebGPUDrawElementInfo[];

    /**@internal */
    private _indexFormat: IndexFormat;

    /**@internal */
    private _mode: MeshTopology;

    /**@internal */
    private _instanceCount: number;

    /**@internal */
    bufferState: WebGPUBufferState;

    /**@internal */
    drawType: DrawType;

    private _id: number;
    static _idCounter: number = 0;

    get instanceCount(): number {
        return this._instanceCount;
    }
    set instanceCount(value: number) {
        this._instanceCount = value;
    }

    get mode(): MeshTopology {
        return this._mode;
    }
    set mode(value: MeshTopology) {
        this._mode = value;
    }

    get indexFormat(): IndexFormat {
        return this._indexFormat;
    }
    set indexFormat(value: IndexFormat) {
        this._indexFormat = value;
    }

    /**@internal */
    constructor(mode: MeshTopology, drawType: DrawType) {
        this.mode = mode;
        this.drawType = drawType;
        this.indexFormat = IndexFormat.UInt16;
        this._drawArrayInfo = [];
        this._drawElementInfo = [];
        this._id = WebGPURenderGeometry._idCounter++;
    }

    setDrawArrayParams(first: number, count: number): void {
        this._drawArrayInfo.push({
            start: first,
            count: count
        });
    }

    setDrawElemenParams(count: number, offset: number): void {
        this._drawElementInfo.push({
            elementStart: offset,
            elementCount: count
        })
    }

    setInstanceRenderOffset(offset: number, instanceCount: number) {
        //TODO
    }

    clearRenderParams(): void {
        this._drawElementInfo.length = 0;
        this._drawArrayInfo.length = 0;
    }

    destroy(): void {
        throw new Error("Method not implemented.");
    }
}