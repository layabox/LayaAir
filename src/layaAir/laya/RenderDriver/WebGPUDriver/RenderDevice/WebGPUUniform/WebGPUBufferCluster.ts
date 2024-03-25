import { OffsetAndSize, roundUp } from "../WebGPUCommon";
import { WebGPUGlobal } from "../WebGPUStatis/WebGPUGlobal";
import { WebGPUStatis } from "../WebGPUStatis/WebGPUStatis";
import { WebGPUBufferBlock } from "./WebGPUBufferBlock";
import { WebGPUBufferManager } from "./WebGPUBufferManager";
import { WebGPUUniformBuffer } from "./WebGPUUniformBuffer";

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

    renderContext: any; //渲染上下文

    needUpload: boolean[] = []; //哪些块需要上传
    data: ArrayBuffer; //数据

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
        this.data = new ArrayBuffer(this.totalSize);

        this.buffer = device.createBuffer({
            size: this.totalSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.needUpload.length = this.sliceNum;

        //初始化，整个buffer最初可用
        this.free = [{ offset: 0, size: this.totalSize }];
    }

    /**
     * 设置渲染上下文
     * @param rc 
     */
    setRenderContext(rc: any) {
        this.renderContext = rc;
    }

    /**
     * 获取内存块
     * @param size 需求尺寸
     * @param user 使用者
     * @returns 偏移地址（256字节对齐）
     */
    getBlock(size: number, user: WebGPUUniformBuffer) {
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
     * 释放内存块
     */
    freeBlock(bb: WebGPUBufferBlock) {
        //根据传入的块信息，将块信息从used数组中移除，并添加到free数组中
        const index = this.used.findIndex(block => block === bb);
        if (index !== -1) {
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
     * 将数据上传到GPU内存，合并相邻块，尽可能减少上传次数
     */
    upload() {
        let count = 0;
        let bytes = 0;
        let next = false;
        let startIndex = -1;
        let endIndex = -1;
        let offset = 0;
        let size = 0;

        //遍历needUpload数组，找到需要上传的块，然后合并相邻块，上传数据
        for (let i = 0, len = this.needUpload.length; i < len; i++) {
            if (this.needUpload[i]) {
                if (startIndex === -1)
                    startIndex = i;
                endIndex = i;
                next = true;
                this.needUpload[i] = false;
            } else {
                //如果当前块不需要上传，且之前有需要上传的块，则上传数据
                if (next) {
                    offset = startIndex * this.sliceSize;
                    size = (endIndex - startIndex + 1) * this.sliceSize;
                    this.device.queue.writeBuffer(this.buffer, offset, this.data, offset, size);
                    count++;
                    bytes += size;
                    startIndex = -1;
                    endIndex = -1;
                    next = false;
                }
            }
        }

        //如果最后一个块需要上传，则上传数据
        if (next) {
            offset = startIndex * this.sliceSize;
            size = (endIndex - startIndex + 1) * this.sliceSize;
            this.device.queue.writeBuffer(this.buffer, offset, this.data, offset, size);
            count++;
            bytes += size;
        }

        //记录上传次数，字节数
        WebGPUStatis.addUploadNum(count);
        WebGPUStatis.addUploadBytes(bytes);
    }

    /**
     * 清理，释放所有内存块，回到内存未占用状态
     * @param sliceNum 保留多少分割数量
     */
    clear(sliceNum?: number) {
        this.used.forEach(block => block.destroy());
        this.used.length = 0;
        if (sliceNum !== undefined && sliceNum >= 0 && sliceNum !== this.sliceNum) {
            this.sliceNum = sliceNum;
            this.totalSize = this.sliceSize * this.sliceNum;
            //创建一个新的GPUBuffer
            this.buffer = this.device.createBuffer({
                size: this.totalSize,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
            this.data = new ArrayBuffer(this.totalSize);
        }
        this.totalLeft = this.totalSize;
        this.free = [{ offset: 0, size: this.totalSize }];
        this.needUpload.length = this.sliceNum;
    }

    /**
     * 查找或创建一个足够大的空闲块，若有必要则扩展大内存块
     */
    private _findOrCreateFreeBlock(requiredSize: number): OffsetAndSize {
        let blockIndex = this.free.findIndex(block => block.size === requiredSize);
        if (blockIndex !== -1) {
            //精确匹配大小，直接返回该块
            this.totalLeft -= requiredSize;
            return this.free.splice(blockIndex, 1)[0];
        }
        blockIndex = this.free.findIndex(block => block.size > requiredSize);
        if (blockIndex !== -1) {
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
        new Uint8Array(newArrayBuffer).set(new Uint8Array(this.data));
        this.data = newArrayBuffer;

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

        //通知渲染上下文
        this.renderContext.notifyGPUBufferChange();

        WebGPUGlobal.action(this, 'expandMemory | uniform', expandSize);
        console.log("GPUBuffer expand, newSize =", this.totalSize / 1024 + 'KB,', this.name);
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
            if (merged.length === 0 || block.offset > (merged[merged.length - 1].offset + merged[merged.length - 1].size)) {
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

    /**
     * 销毁
     */
    destroy() {
        this.clear();
        this.buffer.destroy();
        WebGPUGlobal.action(this, 'releaseMemory | uniform', this.totalSize);
        WebGPUGlobal.releaseId(this);
    }
}