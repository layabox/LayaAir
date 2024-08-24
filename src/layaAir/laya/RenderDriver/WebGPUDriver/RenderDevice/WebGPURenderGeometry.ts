import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { WebGPUBufferState } from "./WebGPUBufferState";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

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

    checkDataFormat: boolean = false;

    gpuIndexFormat: GPUIndexFormat = 'uint16';
    gpuIndexByte: number = 2;

    _id: number;
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
        this.gpuIndexFormat = (value === IndexFormat.UInt16) ? 'uint16' : 'uint32';
        this.gpuIndexByte = (value === IndexFormat.UInt16) ? 2 : 4;
    }

    globalId: number;
    objectName: string = 'WebGPURenderGeometry';

    /**@internal */
    constructor(mode: MeshTopology, drawType: DrawType) {
        this.mode = mode;
        this.drawType = drawType;
        this.indexFormat = IndexFormat.UInt16;
        this._drawArrayInfo = [];
        this._drawElementInfo = [];
        this._instanceCount = 1;
        this._id = WebGPURenderGeometry._idCounter++;

        this.globalId = WebGPUGlobal.getId(this);
    }
    
    getDrawDataParams(out: FastSinglelist<number>): void {
        out.length = 0;
        if (this.drawType == DrawType.DrawArray || this.drawType == DrawType.DrawArrayInstance) {
            this._drawArrayInfo.forEach(element => {
                out.add(element.start);
                out.add(element.count);
            });
        } else {
            this._drawElementInfo.forEach(element => {
                out.add(element.elementStart);
                out.add(element.elementCount);
            });
        }

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
        });
    }

    setInstanceRenderOffset(offset: number, instanceCount: number) {
        //TODO
    }

    clearRenderParams(): void {
        this._drawElementInfo.length = 0;
        this._drawArrayInfo.length = 0;
    }

    cloneTo(obj: WebGPURenderGeometry) {
        obj.mode = this.mode;
        obj.drawType = this.drawType;
        obj.indexFormat = this.indexFormat;
        obj.instanceCount = this.instanceCount;
        obj._drawArrayInfo = this._drawArrayInfo.slice();
        obj._drawElementInfo = this._drawElementInfo.slice();
    }

    destroy(): void {
        WebGPUGlobal.releaseId(this);
    }
}