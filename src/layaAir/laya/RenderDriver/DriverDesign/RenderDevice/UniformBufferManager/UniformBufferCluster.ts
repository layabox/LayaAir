import { IUniformBufferUser } from "./IUniformBufferUser";
import { UniformBufferBlock } from "./UniformBufferBlock";
import { UniformBufferManager, roundUp } from "./UniformBufferManager";

/**
 * Uniform内存块（大内存块）
 */
export class UniformBufferCluster {
    sn: number = 0; //序号
    totalSize: number; //总体尺寸
    blockSize: number; //小块尺寸
    blockNum: number; //小块总数量
    usedNum: number; //小块使用量
    needUpload: boolean[] = []; //哪些块需要上传
    destroyed: boolean = false; //该对象是否已经销毁

    buffer: any; //GPU内存对象
    blocks: UniformBufferBlock[] = []; //小内存块
    expand: number = 10; //每次扩展数量

    data: ArrayBuffer; //数据
    move: Uint8Array; //移动时的临时数据

    manager: UniformBufferManager; //管理器

    constructor(blockSize: number, blockNum: number, manager: UniformBufferManager) {
        this.manager = manager;
        this.blockSize = blockSize;
        this.blockNum = blockNum;
        this.usedNum = 0;
        this.totalSize = blockSize * blockNum;

        this.data = new ArrayBuffer(this.totalSize);
        this.move = new Uint8Array(this.blockSize);

        this.buffer = this.manager.createGPUBuffer(this.totalSize);

        this.needUpload.length = this.blockNum;
        this.needUpload.fill(false);
        this.manager.statisGPUMemory(this.totalSize);
    }

    /**
     * 扩展GPU缓冲区
     */
    private _expandBuffer() {
        //计算扩展尺寸
        this.blockNum += this.expand;
        if (this.blockNum > this.manager.clusterMaxBlock)
            this.blockNum = this.manager.clusterMaxBlock;
        this.totalSize = this.blockSize * this.blockNum;
        const expandSize = this.blockSize * this.expand;
        this.needUpload = this.needUpload.concat(new Array(this.expand).fill(false));

        //创建一个新的CPUBuffer，将旧数据拷贝过来
        const newArrayBuffer = new ArrayBuffer(this.totalSize);
        new Uint8Array(newArrayBuffer).set(new Uint8Array(this.data));
        this.data = newArrayBuffer;

        //创建一个新的GPUBuffer
        this.buffer = this.manager.createGPUBuffer(this.totalSize);

        //统计GPU内存使用量
        this.manager.statisGPUMemory(expandSize);

        //通知所有使用者
        this.blocks.forEach(used => used.user.notifyGPUBufferChange());

        //通知渲染上下文
        this.manager.renderContext.notifyGPUBufferChange();

        //console.log("GPUBuffer expand, newSize =", this.totalSize / 1024 + 'KB,', 'blockSize = ' + this.blockSize, 'blockNum = ' + this.blockNum);
    }

    /**
     * 移动内存块
     * @param index 
     */
    private _deleteBlock(index: number) {
        const dataView = new Uint8Array(this.data);
        const size = this.blockSize;
        if (index === this.usedNum - 1) {
            this.blocks[index] = null;
            this.needUpload[index] = false;
        } else {
            for (let i = index + 1; i < this.usedNum; i++) {
                const start = i * size;
                const end = start + size;
                const target = start - size;
                dataView.copyWithin(target, start, end);
                this.needUpload[i - 1] = this.needUpload[i];
                this.blocks[i - 1] = this.blocks[i];
                this.blocks[i - 1].index--;
                this.blocks[i - 1].offset -= size;
                this.blocks[i - 1].user.notifyGPUBufferChange();
                this.blocks[i] = null;
                this.needUpload[i] = false;
            }
        }
        this.usedNum--;

        //通知渲染上下文
        this.manager.renderContext.notifyGPUBufferChange();
    }

    /**
     * 获取内存块
     * @param size 需求尺寸
     * @param user 使用者
     */
    getBlock(size: number, user: IUniformBufferUser) {
        const alignedSize = roundUp(size, this.manager.byteAlign);
        if (alignedSize !== this.blockSize) {
            console.warn('WebGPUBufferCluster: 获取内存块时, 长度错误!');
            return null;
        }

        const index = this._getBlockWithExpand();
        const bb = new UniformBufferBlock(this.manager.snCounter++, this, index, size, alignedSize, user);
        this.blocks[index] = bb;
        return bb;
    }

    /**
     * 释放内存块
     */
    freeBlock(bb: UniformBufferBlock) {
        //根据传入的块信息，将块信息从used数组中移除，并添加到free数组中
        const index = this.blocks.findIndex(block => block === bb);
        if (index !== -1) {
            this._deleteBlock(index);
            bb.destroy();
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
        for (let i = 0, len = this.usedNum; i < len; i++) {
            if (this.needUpload[i]) {
                if (startIndex === -1)
                    startIndex = i;
                endIndex = i;
                next = true;
                this.needUpload[i] = false;
            } else {
                //如果当前块不需要上传，且之前有需要上传的块，则上传数据
                if (next) {
                    offset = startIndex * this.blockSize;
                    size = (endIndex - startIndex + 1) * this.blockSize;
                    this.manager.writeBuffer(this.buffer, this.data, offset, size);
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
            offset = startIndex * this.blockSize;
            size = (endIndex - startIndex + 1) * this.blockSize;
            this.manager.writeBuffer(this.buffer, this.data, offset, size);
            count++;
            bytes += size;
        }

        //记录上传次数，字节数
        this.manager.uploadNum += count;
        this.manager.uploadByte += bytes;
        this.manager.statisUpload(count, bytes);
    }

    /**
     * 优化块顺序，上传频繁的块排前面
     */
    optimize() {
        for (let i = this.usedNum - 1; i > -1; i--) {
            const bb = this.blocks[i];
            if (bb.uploadNum > this.manager.uploadThreshold && !bb.moved && i > 0) {
                const needUpload = this.needUpload[i];
                const size = this.blockSize;
                const dataView = new Uint8Array(this.data);
                this.move.set(new Uint8Array(this.data, size * i, size));
                for (let j = i - 1; j >= 0; j--) {
                    const start = j * size;
                    const end = start + size;
                    const target = start + size;
                    dataView.copyWithin(target, start, end);
                    this.needUpload[j + 1] = this.needUpload[j];
                    this.blocks[j + 1] = this.blocks[j];
                    this.blocks[j + 1].index++;
                    this.blocks[j + 1].offset += size;
                    this.blocks[j + 1].user.notifyGPUBufferChange();
                }
                dataView.set(this.move);
                this.needUpload[0] = needUpload;
                bb.index = 0;
                bb.offset = 0;
                bb.moved = true;
                this.blocks[0] = bb;
                this.blocks[0].user.notifyGPUBufferChange();
                this.manager.moveNum++;
                break; //每帧只处理一个块
            }
        }
    }

    /**
     * 清理，释放所有内存块，回到内存未占用状态
     * @param blockNum 保留多少小块
     */
    clear(blockNum?: number) {
        this.blocks.forEach(block => block.destroy());
        this.blocks.length = 0;
        if (blockNum !== undefined && blockNum >= 0 && blockNum !== this.blockNum) {
            this.blockNum = blockNum;
            this.totalSize = this.blockSize * this.blockNum;
            this.buffer = this.manager.createGPUBuffer(this.totalSize);
            this.data = new ArrayBuffer(this.totalSize);
        } else {
            this.blockNum = 0;
            this.totalSize = 0;
            this.buffer = null;
            this.data = null;
        }
        this.needUpload.length = this.blockNum;
        this.needUpload.fill(false);
    }

    /**
     * 获取一个空闲块，如果空间不够，扩大内存块
     */
    private _getBlockWithExpand() {
        if (this.usedNum < this.blockNum)
            return this.usedNum++;
        else {
            this._expandBuffer();
            return this.usedNum++;
        }
    }

    /**
     * 销毁
     */
    destroy() {
        if (!this.destroyed) {
            this.clear();
            this.buffer.destroy ?? this.buffer.destroy();
            this.manager.statisGPUMemory(-this.totalSize);
            this.destroyed = true;
            return true;
        }
        console.warn('UniformBufferCluster: object alreay destroyed!');
        return false;
    }
}