type OffsetAndSize = { offset: number, size: number };

/**
 * 向上圆整到align的整数倍
 * @param n 
 * @param align 
 */
const roundUp = (n: number, align: number) => (((n + align - 1) / align) | 0) * align;

/**
 * GPU内存块（小内存块）
 */
export class WebGPUBufferBlock {
    sn: number;
    buffer: WebGPUBuffer;
    offset: number;
    size: number;
    alignedSize: number;
    destroyed: boolean;

    constructor(sn: number, buffer: WebGPUBuffer, offset: number, size: number, alignedSize: number) {
        this.sn = sn;
        this.buffer = buffer;
        this.offset = offset;
        this.size = size;
        this.alignedSize = alignedSize;
        this.destroyed = false;
    }
}

/**
 * GPU内存块（大内存块）
 */
class WebGPUBuffer {
    buffer: GPUBuffer;
    name: string;
    size: number;
    left: number;
    free: OffsetAndSize[] = [];
    used: WebGPUBufferBlock[] = [];

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
     * @returns 偏移地址（256字节对齐）
     */
    getBlock(size: number) {
        let offset = 0;
        let bb: WebGPUBufferBlock;
        const alignedSize = roundUp(size, 256);
        for (let i = 0, len = this.free.length; i < len; i++) {
            if (this.free[i].size == alignedSize) {
                this.left -= alignedSize;
                offset = this.free.splice(i, 1)[0].offset;
                bb = new WebGPUBufferBlock(WebGPUBufferManager.snCounter++, this, offset, size, alignedSize);
                this.used.push(bb);
                return bb;
            } else if (this.free[i].size > alignedSize) {
                offset = this.free[i].offset;
                this.free[i].offset += alignedSize;
                this.free[i].size -= alignedSize;
                this.left -= alignedSize;
                bb = new WebGPUBufferBlock(WebGPUBufferManager.snCounter++, this, offset, size, alignedSize);
                this.used.push(bb);
                return bb;
            }
        }
        return null;
    }

    /**
     * 释放内存块
     */
    freeBlock(bb: WebGPUBufferBlock) {
        let doFree = false;
        if (bb.destroyed) return doFree;
        for (let i = 0, len = this.used.length; i < len; i++) {
            if (this.used[i] == bb) {
                this.free.push({ offset: bb.offset, size: bb.alignedSize });
                this.left += bb.alignedSize;
                this.used.splice(i, 1);
                bb.destroyed = true;
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
        this.used.forEach(bb => bb.destroyed = true);
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

    static snCounter: number = 0;

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
        return null;
    }

    /**
     * 释放内存块
     * @param name 
     * @param bb 
     */
    freeBlock(name: string, bb: WebGPUBufferBlock) {
        const buffer = this.namedBuffers.get(name);
        if (buffer)
            return buffer.freeBlock(bb);
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