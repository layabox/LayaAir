import { GPUEngineStatisticsInfo } from "../../../../RenderEngine/RenderEnum/RenderStatInfo";
import { roundUp } from "../WebGPUCommon";
import { WebGPURenderEngine } from "../WebGPURenderEngine";
import { WebGPUGlobal } from "../WebGPUStatis/WebGPUGlobal";
import { WebGPUStatis } from "../WebGPUStatis/WebGPUStatis";
import { WebGPUBufferBlock } from "./WebGPUBufferBlock";
import { WebGPUBufferManager } from "./WebGPUBufferManager";
import { WebGPUUniformBuffer } from "./WebGPUUniformBuffer";

/**
 * GPU内存块（大内存块）
 */
export class WebGPUBufferCluster {
    name: string; //名称

    totalSize: number; //总体尺寸
    blockSize: number; //小块尺寸
    blockNum: number; //小块总数量
    usedNum: number; //小块使用量
    uploadNum: number[] = []; //小块的上传次数
    needUpload: boolean[] = []; //哪些块需要上传

    buffer: GPUBuffer; //GPU内存
    used: WebGPUBufferBlock[] = []; //占用块（有序）
    expand: number; //每次扩展数量

    renderContext: any; //渲染上下文

    data: ArrayBuffer; //数据
    move: Uint8Array; //移动时的临时数据

    manager: WebGPUBufferManager; //管理器

    globalId: number; //全局id
    objectName: string; //本对象名称

    constructor(device: GPUDevice, name: string, blockSize: number, blockNum: number, manager: WebGPUBufferManager) {
        this.manager = manager;
        this.name = name;
        this.blockSize = blockSize;
        this.blockNum = blockNum;
        this.usedNum = 0;
        this.totalSize = blockSize * blockNum;
        this.expand = 10; // 默认每次扩展数量

        this.data = new ArrayBuffer(this.totalSize);
        this.move = new Uint8Array(this.blockSize);

        this.buffer = device.createBuffer({
            size: this.totalSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.uploadNum.length = this.blockNum;
        this.needUpload.length = this.blockNum;
        for (let i = this.blockNum - 1; i > -1; i--) {
            this.uploadNum[i] = 0;
            this.needUpload[i] = false;
        }

        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory, this.totalSize);
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUBuffer, this.totalSize);
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
        //根据需求尺寸获取一个空闲块，获取的空闲块要求满足字节对齐要求
        let bb: WebGPUBufferBlock;
        const alignedSize = roundUp(size, this.manager.byteAlign);
        if (alignedSize !== this.blockSize) {
            console.warn('WebGPUBufferCluster: 获取内存块时, 长度错误!');
            return null;
        }

        const index = this._getBlockWithExpand();
        bb = new WebGPUBufferBlock(this.manager.snCounter++, this, index, size, alignedSize, user);
        this.used[index] = bb;
        return bb;
    }

    /**
     * 释放内存块
     */
    freeBlock(bb: WebGPUBufferBlock) {
        //根据传入的块信息，将块信息从used数组中移除，并添加到free数组中
        const index = this.used.findIndex(block => block === bb);
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
        const queue = this.manager.device.queue;

        //遍历needUpload数组，找到需要上传的块，然后合并相邻块，上传数据
        for (let i = 0, len = this.usedNum; i < len; i++) {
            if (this.needUpload[i]) {
                if (startIndex === -1)
                    startIndex = i;
                endIndex = i;
                next = true;
                this.needUpload[i] = false;
                this.uploadNum[i]++;
            } else {
                //如果当前块不需要上传，且之前有需要上传的块，则上传数据
                if (next) {
                    offset = startIndex * this.blockSize;
                    size = (endIndex - startIndex + 1) * this.blockSize;
                    queue.writeBuffer(this.buffer, offset, this.data, offset, size);
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
            queue.writeBuffer(this.buffer, offset, this.data, offset, size);
            count++;
            bytes += size;
        }

        //记录上传次数，字节数
        this.manager.uploadNum += count;
        this.manager.uploadByte += bytes;
        WebGPUStatis.addUploadNum(count);
        WebGPUStatis.addUploadBytes(bytes);

        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_UniformBufferUploadCount, count);
    }

    /**
     * 优化块顺序，上传频繁的块排前面
     */
    optimize() {
        for (let i = this.usedNum; i > -1; i--) {
            if (this.uploadNum[i] > this.manager.uploadThreshold && i > 0) {
                const bb = this.used[i];
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
                    this.uploadNum[j + 1] = this.uploadNum[j];
                    this.used[j + 1] = this.used[j];
                    this.used[j + 1].index++;
                    this.used[j + 1].offset += size;
                    this.used[j + 1].user.notifyGPUBufferChange();
                }
                dataView.set(this.move);
                this.needUpload[0] = needUpload;
                this.uploadNum[0] = this.manager.uploadThreshold / 2 | 0;
                bb.index = 0;
                bb.offset = 0;
                this.used[0] = bb;
                this.used[0].user.notifyGPUBufferChange();
                break; //每帧只处理一个块
            }
        }
    }

    /**
     * 清理，释放所有内存块，回到内存未占用状态
     * @param blockNum 保留多少小块
     */
    clear(blockNum?: number) {
        this.used.forEach(block => block.destroy());
        this.used.length = 0;
        if (blockNum !== undefined && blockNum >= 0 && blockNum !== this.blockNum) {
            this.blockNum = blockNum;
            this.totalSize = this.blockSize * this.blockNum;
            //创建一个新的GPUBuffer
            this.buffer = this.manager.device.createBuffer({
                size: this.totalSize,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
            this.data = new ArrayBuffer(this.totalSize);
        } else {
            this.blockNum = 0;
            this.totalSize = 0;
            this.buffer = null;
            this.data = null;
        }
        this.uploadNum.length = this.blockNum;
        this.needUpload.length = this.blockNum;
        for (let i = this.blockNum - 1; i > -1; i--) {
            this.uploadNum[i] = 0;
            this.needUpload[i] = false;
        }
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
     * 扩展GPU缓冲区
     */
    private _expandBuffer() {
        //计算扩展尺寸
        this.blockNum += this.expand;
        this.totalSize = this.blockSize * this.blockNum;
        const expandSize = this.blockSize * this.expand;
        this.needUpload = this.needUpload.concat(new Array(this.expand).fill(false));
        this.uploadNum = this.uploadNum.concat(new Array(this.expand).fill(0));

        //创建一个新的CPUBuffer，将旧数据拷贝过来
        const newArrayBuffer = new ArrayBuffer(this.totalSize);
        new Uint8Array(newArrayBuffer).set(new Uint8Array(this.data));
        this.data = newArrayBuffer;

        //创建一个新的GPUBuffer
        this.buffer = this.manager.device.createBuffer({
            size: this.totalSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory, expandSize);
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUBuffer, expandSize);

        //旧的GPUBuffer失去引用时会自动销毁
        //this.buffer.destroy();

        //通知所有使用者
        this.used.forEach(used => used.user.notifyGPUBufferChange());

        //通知渲染上下文
        this.renderContext.notifyGPUBufferChange();

        WebGPUGlobal.action(this, 'expandMemory | uniform', expandSize);
        console.log("GPUBuffer expand, newSize =", this.totalSize / 1024 + 'KB,', 'blockSize = ' + this.blockSize, 'blockNum = ' + this.blockNum);
    }

    /**
     * 移动内存块
     * @param index 
     */
    private _deleteBlock(index: number) {
        const dataView = new Uint8Array(this.data);
        const size = this.blockSize;
        if (index == this.usedNum - 1) {
            this.used[index] = null;
            this.needUpload[index] = false;
            this.uploadNum[index] = 0;
        } else {
            for (let i = index + 1; i < this.usedNum; i++) {
                const start = i * size;
                const end = start + size;
                const target = start - size;
                dataView.copyWithin(target, start, end);
                this.needUpload[i - 1] = this.needUpload[i];
                this.uploadNum[i - 1] = this.uploadNum[i];
                this.used[i - 1] = this.used[i];
                this.used[i - 1].index--;
                this.used[i - 1].offset -= size;
                this.used[i - 1].user.notifyGPUBufferChange();
                this.used[i] = null;
                this.needUpload[i] = false;
                this.uploadNum[i] = 0;
            }
        }
        this.usedNum--;

        //通知渲染上下文
        this.renderContext.notifyGPUBufferChange();
    }

    /**
     * 销毁
     */
    destroy() {
        this.clear();
        this.buffer.destroy();
        WebGPUGlobal.action(this, 'releaseMemory | uniform', this.totalSize);
        WebGPUGlobal.releaseId(this);

        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory, -this.totalSize);
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUBuffer, -this.totalSize);
    }
}