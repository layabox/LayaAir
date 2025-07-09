import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { FastSinglelist } from "../../../utils/SingletonList";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { WebGPUDeviceBuffer } from "./compute/WebGPUStorageBuffer";
import { WebGPUBufferState } from "./WebGPUBufferState";
import { IGPURenderEncoder, WebGPURenderEncoder } from "./WebGPURenderCommandEncoder";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
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
    _drawElementInfo0:WebGPUDrawElementInfo;    //单个_drawElementInfo的优化

    /**@internal */
    _drawIndirectInfo: WebGPUDrawIndirectInfo[];

    private _drawType: DrawType;
    set drawType(v:DrawType){
        this._drawType = v;
    }

    get drawType(){
        return this._drawType;
    }

    gpuIndexFormat: GPUIndexFormat = 'uint16';

    gpuIndexByte: number = 2;

    //缓存信息
    stateCacheKey: string = '';
    //缓存ID
    private stateCacheID: number;
    private _cacheBufferStateID: number;//防止bufferState改动后，geometrycacheID错误

    isNeedReCreateCacheInfo() {
        return !(this.bufferState.stateCacheID == this._cacheBufferStateID);
    }

    getStateCacheID() {
        if (this.isNeedReCreateCacheInfo())
            this._getCacheInfo();
        return this.stateCacheID;
    }

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
            this._cacheBufferStateID = this._bufferState.stateCacheID;
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
        this._drawElementInfo0 = null;
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
        if(this._drawElementInfo.length==1){
            this._drawElementInfo0 = this._drawElementInfo[0];
        }else{
            this._drawElementInfo0 = null;
        }
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
        this._drawElementInfo0 = null;
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
        obj._drawElementInfo0 = this._drawElementInfo0;
        obj._drawIndirectInfo = this._drawIndirectInfo?.slice();
    }


    applyToEncoder(encoder:IGPURenderEncoder){
        const bufferState = this.bufferState;
        const drawType = this.drawType;

        const indexBuffer = bufferState._bindedIndexBuffer;

        let indexByte = 2; //index的字节数

        let vb0 = bufferState.vb0;
        let enc = encoder;
        if(vb0){
            let vb = vb0.source;
            enc.setVertexBuffer(0, vb._source, 0, vb._size)
        }else{
            const vertexBuffers = bufferState._vertexBuffers;
            let vbCnt = vertexBuffers.length;
            for(let i=0; i<vbCnt; i++){
                let vb = vertexBuffers[i].source;
                enc.setVertexBuffer(i, vb._source, 0, vb._size)
            }
        }
        if (indexBuffer) {
            indexByte = this.gpuIndexByte;
            enc.setIndexBuffer(indexBuffer.source._source, this.gpuIndexFormat, 0, indexBuffer.source._size);
        }

        //绘制的三角形数量
        let triangles = 0;

        //根据不同的数据类型绘制
        let count = 0, start = 0;
        switch (drawType) {
            case DrawType.DrawArray:
                {
                    let _drawArrayInfo = this._drawArrayInfo;
                    for (let i = _drawArrayInfo.length - 1; i > -1; i--) {
                        count = _drawArrayInfo[i].count;
                        start = _drawArrayInfo[i].start;
                        triangles += count - 2;
                        enc.draw(count, 1, start, 0);
                    }
                }
                break;
            case DrawType.DrawElement:
                {
                    let info0 = this._drawElementInfo0;
                    if(info0){
                        count = info0.elementCount;
                        enc.drawIndexed(count, 1, info0.elementStart / indexByte, 0);
                        triangles += count / 3;
                    }else{
                        let _drawElementInfo = this._drawElementInfo;
                        for (let i = _drawElementInfo.length - 1; i > -1; i--) {
                            let info = _drawElementInfo[i];
                            count = info.elementCount;
                            enc.drawIndexed(count, 1, info.elementStart / indexByte, 0);
                            triangles += count / 3;
                        }
                    }
                }
                break;
            case DrawType.DrawArrayInstance:
                {
                    let _drawArrayInfo = this._drawArrayInfo;
                    const instanceCount = this.instanceCount;
                    for (let i = _drawArrayInfo.length - 1; i > -1; i--) {
                        let info = _drawArrayInfo[i];
                        count = info.count;
                        start = info.start;
                        triangles += (count - 2) * instanceCount;
                        enc.draw(count, instanceCount, start, 0);
                        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    }
                }
                break;
            case DrawType.DrawElementInstance:
                {
                    let _drawElementInfo = this._drawElementInfo;
                    const instanceCount = this.instanceCount;
                    for (let i = _drawElementInfo.length - 1; i > -1; i--) {
                        count = _drawElementInfo[i].elementCount;
                        start = _drawElementInfo[i].elementStart;
                        triangles += count / 3 * instanceCount;
                        enc.drawIndexed(count, instanceCount, start / indexByte, 0);
                        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    }
                }
                break;
            case DrawType.DrawArrayIndirect:
                {
                    let _drawIndirectInfo = this._drawIndirectInfo;
                    for (let i = _drawIndirectInfo.length - 1; i > -1; i--) {
                        enc.drawIndirect(_drawIndirectInfo[i].buffer.getNativeBuffer()._source, _drawIndirectInfo[i].offset);
                    }
                    WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, _drawIndirectInfo.length);
                }
                break;
            case DrawType.DrawElementIndirect:
                {
                    let _drawIndirectInfo = this._drawIndirectInfo;
                    for (let i = _drawIndirectInfo.length - 1; i > -1; i--) {
                        enc.drawIndexedIndirect(_drawIndirectInfo[i].buffer.getNativeBuffer()._source, _drawIndirectInfo[i].offset);
                    }
                    WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, _drawIndirectInfo.length);
                }
                break;
        }
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_TriangleCount, triangles);
        return triangles;
    }

    destroy(): void {
        WebGPUGlobal.releaseId(this);
    }
}