import { roundUp, TypedArray } from "../../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferManager";
import { UniformBufferUser } from "../../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferUser";
import { WebGPUShaderData } from "../WebGPUShaderData";
import { WebGPUGlobal } from "../WebGPUStatis/WebGPUGlobal";
import { WebGPUBufferManager } from "./WebGPUBufferManager";

export class WebGPUUniformBuffer extends UniformBufferUser {
    set: number;
    binding: number;

    uniformStr: string;

    globalId: number;
    objectName: string = 'WebGPUUniformBuffer';

    private _gpuBuffer: GPUBuffer;
    private _gpuBindGroupEntry: GPUBindGroupEntry;

    constructor(name: string, set: number, binding: number, size: number, manager: WebGPUBufferManager, data: WebGPUShaderData) {
        super(name, size, manager, data);
        this.set = set;
        this.binding = binding;
        if (manager.useBigBuffer) {
            this._gpuBuffer = this.bufferBlock.cluster.buffer;
            this._gpuBindGroupEntry = {
                binding,
                resource: {
                    buffer: this._gpuBuffer,
                    offset: this.bufferBlock.offset,
                    size,
                },
            };
        } else {
            this._gpuBuffer = this.bufferAlone.buffer;
            this._gpuBindGroupEntry = {
                binding,
                resource: {
                    buffer: this._gpuBuffer,
                    offset: 0,
                    size,
                },
            };
        }
        this.globalId = WebGPUGlobal.getId(this);
        //console.log('createUniformBuffer: ' + name + ', set = ' + set + ', binding = ' + binding + ', size = ' + size);
    }

    /**
     * 通知GPUBuffer改变
     */
    notifyGPUBufferChange() {
        super.notifyGPUBufferChange();
        this._gpuBuffer = this.bufferBlock.cluster.buffer;
        this._gpuBindGroupEntry = {
            binding: this.binding,
            resource: {
                buffer: this._gpuBuffer,
                offset: this.bufferBlock.offset,
                size: this.bufferBlock.size,
            },
        };
    }

    /**
     * 清除GPUBuffer绑定
     */
    clearGPUBufferBind() {
        (this.data as WebGPUShaderData).clearBindGroup();
    }

    /**
     * 获取WebGPU绑定资源入口
     */
    getGPUBindEntry() {
        return this._gpuBindGroupEntry;
    }

    /**
     * 获取uniform名称列表
     */
    getUniformNameStr() {
        let str = '|';
        this.items.forEach(item => str += item.name + '|');
        return str;
    }

    /**
     * 输出调试信息
     */
    debugInfo() {
        if (this.itemNum > 0) {
            const typeName = (type: TypedArray) => {
                if (type instanceof Int32Array)
                    return 'Init32Array';
                if (type instanceof Float32Array)
                    return 'Float32Array';
                return 'Unknown';
            }
            console.log("strId =", this.strId);
            this.items.forEach((item, key) => {
                console.log("key: %d, type: %s, view: %s, offset: %d, size: %d, padding: %d, elements: %d, count: %d",
                    key, item.type, typeName(item.view), item.view.byteOffset, item.view.byteLength,
                    roundUp(item.view.byteLength / item.count, item.align) - item.view.BYTES_PER_ELEMENT * item.elements,
                    item.elements, item.count);
            });
        }
    }

    /**
     * 销毁
     */
    destroy() {
        if (super.destroy()) {
            this._gpuBuffer = null;
            this._gpuBindGroupEntry = null;
            return true;
        }
        return false;
    }
}