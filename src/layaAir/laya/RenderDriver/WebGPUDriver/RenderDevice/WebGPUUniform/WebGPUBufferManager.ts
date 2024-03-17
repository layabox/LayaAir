import { WebGPUGlobal } from "../WebGPUStatis/WebGPUGlobal";
import { WebGPUStatis } from "../WebGPUStatis/WebGPUStatis";
import { UniformBuffer } from "./WebGPUUniformBuffer";

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
    sn: number; //序列号
    buffer: WebGPUBufferCluster; //大内存管理对象
    offset: number; //在大内存中的偏移
    size: number; //实际尺寸
    alignedSize: number; //256字节对齐后的尺寸
    user: UniformBuffer; //内存块使用者
    destroyed: boolean; //该内存块是否已经销毁

    globalId: number; //全局id
    objectName: string; //本对象名称

    constructor(sn: number, buffer: WebGPUBufferCluster, offset: number, size: number, alignedSize: number, user: UniformBuffer) {
        this.sn = sn;
        this.buffer = buffer;
        this.offset = offset;
        this.size = size;
        this.alignedSize = alignedSize;
        this.user = user;
        this.destroyed = false;

        this.objectName = 'WebGPUBufferBlock | ' + buffer.name;
        //this.globalId = WebGPUGlobal.getId(this);
        //WebGPUGlobal.action(this, 'getMemory', alignedSize);
    }

    needUpload() {
        this.buffer.needUpload[this.offset / this.buffer.sliceSize | 0] = true;
        this.buffer.needUpload[(this.offset + this.size) / this.buffer.sliceSize | 0] = true;
    }

    destroy() {
        WebGPUGlobal.action(this, 'backMemory', this.alignedSize);
        WebGPUGlobal.releaseId(this);
        this.destroyed = true;
    }
}

/**
 * GPU内存块（大内存块）
 */
export class WebGPUBufferCluster {
    device: GPUDevice; //GPU设备
    name: string; //名称
    sliceSize: number; //分割尺寸
    sliceNum: number; //分割数量
    totalSize: number; //总体尺寸
    totalLeft: number; //剩余尺寸

    buffer: GPUBuffer; //GPU内存
    free: OffsetAndSize[]; //空闲块
    used: WebGPUBufferBlock[] = []; //占用块
    single: boolean = false; //是否只分配一个块
    expand: number; //每次扩展数量

    needUpload: boolean[] = []; //哪些块需要上传
    arrayBuffer: ArrayBuffer; //数据

    globalId: number; //全局id
    objectName: string; //本对象名称

    constructor(device: GPUDevice, name: string, sliceSize: number, sliceNum: number, single: boolean = false) {
        this.device = device;
        this.name = name;
        this.sliceSize = sliceSize;
        this.sliceNum = sliceNum;
        this.single = single;

        this.totalSize = sliceSize * sliceNum;
        this.expand = 1; // 默认每次扩展数量

        this.totalLeft = this.totalSize;
        this.arrayBuffer = new ArrayBuffer(this.totalSize);

        this.buffer = device.createBuffer({
            size: this.totalSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.needUpload.length = this.sliceNum;

        //初始化，整个buffer最初可用
        this.free = [{ offset: 0, size: this.totalSize }];
    }

    /**
     * 获取内存块
     * @param size 需求尺寸
     * @param user 使用者
     * @returns 偏移地址（256字节对齐）
     */
    getBlock(size: number, user: UniformBuffer) {
        //根据需求尺寸获取一个空闲块，获取的空闲块要求按照256字节对齐
        let bb: WebGPUBufferBlock;
        const alignedSize = roundUp(size, 256);
        if (this.single && this.used.length > 0)
            return this.used[0];

        const block = this._findOrCreateFreeBlock(alignedSize);
        if (block) {
            bb = new WebGPUBufferBlock(WebGPUBufferManager.snCounter++, this, block.offset, size, alignedSize, user);
            this.used.push(bb);
            return bb;
        }

        return null;
    }

    /**
     * 查找或创建一个足够大的空闲块，若有必要则扩展大内存块
     */
    private _findOrCreateFreeBlock(requiredSize: number): OffsetAndSize {
        let blockIndex = this.free.findIndex(block => block.size == requiredSize);
        if (blockIndex != -1) {
            //精确匹配大小，直接返回该块
            this.totalLeft -= requiredSize;
            return this.free.splice(blockIndex, 1)[0];
        }
        blockIndex = this.free.findIndex(block => block.size > requiredSize);
        if (blockIndex != -1) {
            //找到了合适的块
            const block = this.free[blockIndex];
            const newBlock = { offset: block.offset, size: requiredSize };
            block.offset += requiredSize;
            block.size -= requiredSize;
            this.totalLeft -= requiredSize;
            return newBlock;
        }
        //未找到合适的块，尝试扩展
        this._expandBuffer();
        //再次尝试找到块，此时因为扩展，理应能找到
        return this._findOrCreateFreeBlock(requiredSize);
    }

    /**
     * 扩展GPU缓冲区
     */
    private _expandBuffer() {
        //添加扩展空间作为新的空闲块
        const expandSize = this.sliceSize * this.expand;
        this.free.push({ offset: this.totalSize, size: expandSize });

        //计算扩展尺寸
        this.sliceNum += this.expand;
        this.totalSize += expandSize;
        this.totalLeft += expandSize;

        //创建一个新的CPUBuffer，将旧数据拷贝过来
        const newArrayBuffer = new ArrayBuffer(this.totalSize);
        new Uint8Array(newArrayBuffer).set(new Uint8Array(this.arrayBuffer));
        this.arrayBuffer = newArrayBuffer;

        //创建一个新的GPUBuffer
        const newBuffer = this.device.createBuffer({
            size: this.totalSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.buffer = newBuffer;

        //旧的GPUBuffer失去引用时会自动销毁
        //this.buffer.destroy();

        //合并空闲内存
        this._mergeFree();

        //通知所有使用者
        this.used.forEach(used => used.user.notifyGPUBufferChange());

        WebGPUGlobal.action(this, 'expandMemory', expandSize);
        console.log("GPUBuffer expand, newSize =", this.totalSize / 1024 + 'KB,', this.name);
    }

    /**
     * 释放内存块
     */
    freeBlock(bb: WebGPUBufferBlock) {
        //根据传入的块信息，将块信息从used数组中移除，并添加到free数组中
        const index = this.used.findIndex(block => block == bb);
        if (index != -1) {
            this.used.splice(index, 1);
            this.free.push({ offset: bb.offset, size: bb.alignedSize });
            this.totalLeft += bb.alignedSize;
            bb.destroy();
            this._mergeFree(); // 尝试合并空闲块
            return true;
        }
        return false;
    }

    /**
     * 将数据上传到GPU内存
     */
    upload() {
        //遍历所有需要上传的内存块，执行上传操作
        let count = 0;
        for (let i = this.needUpload.length - 1; i > -1; i--) {
            if (this.needUpload[i]) {
                const offset = i * this.sliceSize;
                const size = this.sliceSize;
                this.device.queue.writeBuffer(this.buffer, offset, this.arrayBuffer, offset, size);
                this.needUpload[i] = false;
                count++;
            }
        }
        WebGPUStatis.addUploadNum(count);
    }

    /**
     * 清理，释放所有内存块，回到内存未占用状态
     * @param sliceNum 保留多少分割数量
     */
    clear(sliceNum?: number) {
        this.used.forEach(block => block.destroy());
        this.used.length = 0;
        if (sliceNum != undefined && sliceNum >= 0 && sliceNum != this.sliceNum) {
            this.sliceNum = sliceNum;
            this.totalSize = this.sliceSize * this.sliceNum;
            //创建一个新的GPUBuffer
            this.buffer = this.device.createBuffer({
                size: this.totalSize,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
            this.arrayBuffer = new ArrayBuffer(this.totalSize);
        }
        this.totalLeft = this.totalSize;
        this.free = [{ offset: 0, size: this.totalSize }];
        this.needUpload.length = this.sliceNum;
    }

    /**
     * 销毁
     */
    destroy() {
        this.clear();
        this.buffer.destroy();
        WebGPUGlobal.action(this, 'releaseMemory', this.totalSize);
        WebGPUGlobal.releaseId(this);
    }

    /**
     * 合并内存块
     */
    private _mergeFree() {
        //首先，根据offset对数组进行排序
        this.free.sort((a, b) => a.offset - b.offset);

        //创建一个新数组来存储合并后的内存块
        const merged: OffsetAndSize[] = [];

        //遍历排序后的数组，并合并连续的内存块
        let doMerge = false;
        for (const block of this.free) {
            //如果merged数组为空，或当前内存块与前一个内存块不连续，则直接将当前内存块添加到merged数组中
            if (merged.length == 0 || block.offset > (merged[merged.length - 1].offset + merged[merged.length - 1].size)) {
                merged.push({ ...block });
            } else {
                //如果当前内存块与前一个内存块连续，则将当前内存块的大小合并到前一个内存块中
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
    namedBuffers: Map<string, WebGPUBufferCluster>;

    static snCounter: number = 0;

    constructor(device: GPUDevice) {
        this.device = device;
        this.namedBuffers = new Map();
    }

    /**
     * 添加内存
     * @param name 
     * @param sliceSize 
     * @param sliceNum 
     * @param single 
     */
    addBuffer(name: string, sliceSize: number, sliceNum: number, single: boolean = false) {
        if (this.namedBuffers.has(name)) {
            console.warn(`namedBuffer with name: ${name} already exist!`);
            return false;
        }
        this.namedBuffers.set(name, new WebGPUBufferCluster(this.device, name, sliceSize, sliceNum, single));
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
     * @param user 
     */
    getBlock(name: string, size: number, user: UniformBuffer) {
        const buffer = this.namedBuffers.get(name);
        if (buffer)
            return buffer.getBlock(size, user);
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
     * 上传数据
     */
    upload() {
        this.namedBuffers.forEach(buf => buf.upload());
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