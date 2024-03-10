type OffsetAndSize = { offset: number, size: number };

/**
 * GPU内存块
 */
class WebGPUBuffer {
    buffer: GPUBuffer;
    name: string;
    size: number;
    left: number;
    free: OffsetAndSize[] = [];
    used: OffsetAndSize[] = [];

    constructor(device: GPUDevice, name: string, size: number) {
        this.name = name;
        this.size = size;
        this.left = size;
        this.buffer = device.createBuffer({
            size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: false,
        });
        this.free.push({ offset: 0, size });
    }

    /**
     * 获取内存块
     * @param size 
     */
    getBlock(size: number) {
        for (let i = 0, len = this.free.length; i < len; i++) {
            if (this.free[i].size == size) {
                this.used.push({ ...this.free[i] });
                this.left -= size;
                return this.free.splice(i, 1)[0].offset;
            } else if (this.free[i].size > size) {
                this.used.push({ offset: this.free[i].offset, size });
                this.free[i].offset += size;
                this.free[i].size -= size;
                this.left -= size;
                return this.free[i].offset - size;
            }
        }
        return -1;
    }

    /**
     * 释放内存块
     * @param offset 
     */
    freeBlock(offset: number) {
        let doFree = false;
        for (let i = 0, len = this.used.length; i < len; i++) {
            if (this.used[i].offset == offset) {
                this.free.push({ ...this.used[i] });
                this.left += this.used[i].size;
                this.used.splice(i, 1);
                doFree = true;
                break;
            }
        }
        if (doFree)
            this._mergeFree();
        return doFree;
    }

    /**
     * 清理
     */
    clear() {
        this.left = this.size;
        this.free = [{ offset: 0, size: this.size }];
        this.used.length = 0;
    }

    /**
     * 合并内存块
     */
    private _mergeFree() {
        // 首先，根据offset对数组进行排序
        this.free.sort((a, b) => a.offset - b.offset);

        // 创建一个新数组来存储合并后的内存块
        const merged: OffsetAndSize[] = [];

        // 遍历排序后的数组，并合并连续的内存块
        let doMerge = false;
        for (const block of this.free) {
            // 如果merged数组为空，或当前内存块与前一个内存块不连续，则直接将当前内存块添加到merged数组中
            if (merged.length == 0 || block.offset > (merged[merged.length - 1].offset + merged[merged.length - 1].size)) {
                merged.push({ ...block });
            } else {
                // 如果当前内存块与前一个内存块连续，则将当前内存块的大小合并到前一个内存块中
                merged[merged.length - 1].size += block.size;
                doMerge = true;
            }
        }

        if (doMerge)
            this.free = merged;
    }
}

/**
 * GPU内存块管理
 */
export class WebGPUBufferManager {
    device: GPUDevice;
    namedBuffers: Map<string, WebGPUBuffer>;

    constructor(device: GPUDevice) {
        this.device = device;
        this.namedBuffers = new Map();
    }

    /**
     * 添加内存
     * @param name 
     * @param size 
     */
    addBuffer(name: string, size: number) {
        if (this.namedBuffers.has(name)) {
            console.warn(`namedBuffer with name: ${name} already exist!`);
            return false;
        }
        this.namedBuffers.set(name, new WebGPUBuffer(this.device, name, size));
        return true;
    }

    /**
     * 删除内存
     * @param name 
     */
    removeBuffer(name: string) {
        this.namedBuffers.delete(name);
    }

    /**
     * 获取内存块
     * @param name 
     */
    getBuffer(name: string) {
        return this.namedBuffers.get(name)?.buffer;
    }

    /**
     * 获取内存块
     * @param name 
     * @param size 
     */
    getBlock(name: string, size: number) {
        const buffer = this.namedBuffers.get(name);
        if (buffer)
            return buffer.getBlock(size);
        return -2;
    }

    /**
     * 释放内存块
     * @param name 
     * @param offset 
     */
    freeBlock(name: string, offset: number) {
        const buffer = this.namedBuffers.get(name);
        if (buffer)
            return buffer.freeBlock(offset);
        return false;
    }

    /**
     * 清理内存
     * @param name 
     */
    clearBuffer(name: string) {
        this.namedBuffers.delete(name);
    }

    /**
     * 清理所有内存
     */
    clear() {
        this.namedBuffers.forEach(buf => buf.clear());
    }

    /**
     * 销毁
     */
    destroy() {
        this.namedBuffers.clear();
    }
}