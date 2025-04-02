import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { IBufferState } from "../../DriverDesign/RenderDevice/IBufferState";
import { WebGPUIndexBuffer } from "./WebGPUIndexBuffer";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";
import { WebGPUVertexBuffer } from "./WebGPUVertexBuffer";

export enum WebGPUVertexStepMode {
    vertex = "vertex",
    instance = "instance"
}

export class WebGPUBufferState implements IBufferState {
    private static _bufferStatetConterMap: Map<string, number> = new Map();
    private static _bufferStateIDConter: number = 0;

    stateCacheKey: string = '';

    stateCacheID: number;

    vertexState: GPUVertexBufferLayout[] = [];

    _bindedIndexBuffer: WebGPUIndexBuffer;

    _vertexBuffers: WebGPUVertexBuffer[];

    // attribute location Array,shader中需要排除没有用的Attribute
    _attriLocArray: Set<number> = new Set();
    applyState(vertexBuffers: WebGPUVertexBuffer[], indexBuffer: WebGPUIndexBuffer): void {
        this._vertexBuffers = vertexBuffers.slice();
        this._bindedIndexBuffer = indexBuffer;
        this._getCacheInfo();
    }

    constructor() {
    }

    private _getCacheInfo() {
        // 清空当前的顶点状态数组
        this.vertexState = [];

        // 构建缓存键
        let cacheKey = '';
        this._attriLocArray.clear();
        // 添加所有顶点缓冲区的ID到缓存键
        if (this._vertexBuffers && this._vertexBuffers.length > 0) {
            for (let i = 0; i < this._vertexBuffers.length; i++) {
                if (this._vertexBuffers[i]) {
                    cacheKey += `vb${i}_${this._vertexBuffers[i].stateCacheID}_`;
                }
                let bufferLayout = this._vertexBuffers[i].verteBufferLayout;
                this.vertexState.push(bufferLayout);

                let attriArray = this._vertexBuffers[i].vertexDeclaration._VAElements;
                for (var j = 0; j < attriArray.length; j++) {
                    this._attriLocArray.add(attriArray[j].shaderLocation)
                }
            }

        }

        // 添加索引缓冲区信息到缓存键
        if (this._bindedIndexBuffer) {
            cacheKey += `ib_${this._bindedIndexBuffer.indexType}`;
        }

        this.stateCacheKey = cacheKey;

        // 检查是否已存在相同配置的缓冲状态
        if (WebGPUBufferState._bufferStatetConterMap.has(cacheKey)) {
            // 如果存在，使用已有的ID
            this.stateCacheID = WebGPUBufferState._bufferStatetConterMap.get(cacheKey);
        } else {
            // 如果不存在，创建新ID并存储
            this.stateCacheID = WebGPUBufferState._bufferStateIDConter++;
            WebGPUBufferState._bufferStatetConterMap.set(cacheKey, this.stateCacheID);
        }
    }



    destroy(): void {
        WebGPUGlobal.releaseId(this);
    }
}