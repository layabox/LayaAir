import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IDeviceBuffer } from "../../DriverDesign/RenderDevice/IDeviceBuffer";
import { WebGPUDeviceBuffer } from "./compute/WebGPUStorageBuffer";
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

interface WebGPUDrawIndirectInfo {
    buffer: WebGPUDeviceBuffer;
    offset: number;
}

export class WebGPURenderGeometry implements IRenderGeometryElement {
    private static _geometryConterMap: Map<string, number> = new Map();
    private static _geometryIDConter: number = 0;

    private static _idCounter: number = 0;

    _id: number = ++WebGPURenderGeometry._idCounter;


    private _indexFormat: IndexFormat;


    private _mode: MeshTopology;


    private _instanceCount: number;


    private _bufferState: WebGPUBufferState;

    /**@internal */
    _drawArrayInfo: WebGPUDrawArrayInfo[];

    /**@internal */
    _drawElementInfo: WebGPUDrawElementInfo[];

    /**@internal */
    _drawIndirectInfo: WebGPUDrawIndirectInfo[];

    drawType: DrawType;

    gpuIndexFormat: GPUIndexFormat = 'uint16';

    gpuIndexByte: number = 2;

    //缓存信息
    stateCacheKey: string = '';
    //缓存ID
    stateCacheID: number;

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
        this._getCacheInfo();
    }

    public get bufferState(): WebGPUBufferState {
        return this._bufferState;
    }
    public set bufferState(value: WebGPUBufferState) {
        this._bufferState = value;
        this._getCacheInfo();
    }

    get indexFormat(): IndexFormat {
        return this._indexFormat;
    }
    set indexFormat(value: IndexFormat) {
        this._indexFormat = value;
        this.gpuIndexFormat = (value === IndexFormat.UInt16) ? 'uint16' : 'uint32';
        this.gpuIndexByte = (value === IndexFormat.UInt16) ? 2 : 4;
    }

    /**@internal */
    constructor(mode: MeshTopology, drawType: DrawType) {
        this.mode = mode;
        this.drawType = drawType;
        this.indexFormat = IndexFormat.UInt16;
        this._instanceCount = 1;
    }

    private _getCacheInfo(): void {

        // 构建缓存键
        this.stateCacheKey = '';

        // 添加模式信息到缓存键
        this.stateCacheKey += `mode_${this._mode}_`;

        // 添加缓冲状态信息到缓存键
        if (this._bufferState) {
            this.stateCacheKey += `bufferState_${this._bufferState.stateCacheID}`;
        }

        // 检查是否已存在相同配置的几何体
        if (WebGPURenderGeometry._geometryConterMap.has(this.stateCacheKey)) {
            // 如果存在，使用已有的ID
            this.stateCacheID = WebGPURenderGeometry._geometryConterMap.get(this.stateCacheKey);
        } else {
            // 如果不存在，创建新ID并存储
            this.stateCacheID = WebGPURenderGeometry._geometryIDConter;
            WebGPURenderGeometry._geometryConterMap.set(this.stateCacheKey, this.stateCacheID);
            WebGPURenderGeometry._geometryIDConter++;
        }
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
        (!this._drawArrayInfo) && (this._drawArrayInfo = []);
        this._drawElementInfo = [];
        this._drawArrayInfo.push({
            start: first,
            count: count
        });
    }

    setDrawElemenParams(count: number, offset: number): void {
        (!this._drawElementInfo) && (this._drawElementInfo = []);
        this._drawElementInfo.push({
            elementStart: offset,
            elementCount: count
        });
    }

    setInstanceRenderOffset(offset: number, instanceCount: number) {

        //TODO
    }

    setIndirectDrawBuffer(buffer: WebGPUDeviceBuffer, offset: number): void {
        (!this._drawIndirectInfo) && (this._drawIndirectInfo = []);
        let buf = buffer;
        this._drawIndirectInfo.push({
            buffer: buf,
            offset: offset
        }
        )
    }

    clearRenderParams(): void {
        this._drawElementInfo && (this._drawElementInfo.length = 0);
        this._drawArrayInfo && (this._drawArrayInfo.length = 0);
        this._drawIndirectInfo && (this._drawIndirectInfo.length = 0);
    }

    cloneTo(obj: WebGPURenderGeometry) {
        obj.mode = this.mode;
        obj.drawType = this.drawType;
        obj.indexFormat = this.indexFormat;
        obj.instanceCount = this.instanceCount;
        obj._drawArrayInfo = this._drawArrayInfo?.slice();
        obj._drawElementInfo = this._drawElementInfo?.slice();
        obj._drawIndirectInfo = this._drawIndirectInfo?.slice();
    }

    destroy(): void {
        WebGPUGlobal.releaseId(this);
    }
}