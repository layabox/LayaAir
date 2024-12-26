import { IUniformBufferUser } from "./IUniformBufferUser";
import { UniformBufferBlock } from "./UniformBufferBlock";
import { UniformBufferManager, roundUp } from "./UniformBufferManager";

/**
 * Uniform内存块（大内存块）
 */
export class UniformBufferCluster {
    static _idCounter: number = 0;
    /**
     * @internal
     */
    _inManagerUpdateArray: boolean = false;

    /**
     * @internal
     */
    _sn: number = 0; //序号（数组中的位置）

    /**
     * @internal
     */
    _id: number = 0; //编号（Cluster中唯一）

    protected _blockNum: number; //小块总数量
    protected _move: Uint8Array; //移动时的临时数据
    protected _destroyed: boolean = false; //该对象是否已经销毁
    protected _totalSize: number; //总体尺寸
    protected _blocks: UniformBufferBlock[] = []; //小内存块，如果成员为null，表示空洞
    protected _needUpload: Array<boolean>; //相应序号的小内存块需要上传数据
    protected _holeNum: number = 0; //空洞数量

    /**
     * @internal
     */
    _blockSize: number; //小块尺寸

    private _expand: number = 16; //每次扩展小内存块容量

    buffer: any; //GPU内存对象
    data: ArrayBuffer; //数据
    manager: UniformBufferManager; //管理器

    constructor(blockSize: number, blockNum: number, manager: UniformBufferManager) {
        this._id = UniformBufferCluster._idCounter++;
        this.manager = manager;
        this._blockSize = blockSize;
        this._blockNum = blockNum;
        this._totalSize = blockSize * blockNum;
        this._needUpload = new Array(blockNum).fill(false);
        this.data = new ArrayBuffer(this._totalSize);
        this._move = new Uint8Array(this._blockSize);
        this.buffer = this.manager.createGPUBuffer(this._totalSize);
        this.manager.statisGPUMemory(this._totalSize);
    }

    /**
     * 小内存块使用量
     */
    get usedNum() {
        return this._blocks.length;
    }

    /**
     * 扩展GPU缓冲区
     */
    protected _expandBuffer() {
        //计算扩展尺寸
        let expandNum = this._blockNum;
        this._blockNum += this._expand;
        if (this._blockNum > this.manager.clusterMaxBlock)
            this._blockNum = this.manager.clusterMaxBlock;
        expandNum = this._blockNum - expandNum;
        if (expandNum < 1) return false; //没有空间可以扩展
        this._totalSize = this._blockSize * this._blockNum;
        const expandSize = this._blockSize * this._expand;
        this._needUpload = this._needUpload.concat(new Array(expandNum).fill(false));

        //创建一个新的CPUBuffer，将旧数据拷贝过来
        const newArrayBuffer = new ArrayBuffer(this._totalSize);
        new Uint8Array(newArrayBuffer).set(new Uint8Array(this.data));
        this.data = newArrayBuffer;

        //创建一个新的GPUBuffer
        this.buffer = this.manager.createGPUBuffer(this._totalSize);

        //统计GPU内存使用量
        this.manager.statisGPUMemory(expandSize);

        //通知所有使用者
        this._blocks.forEach(block => block && block.user.notifyGPUBufferChange('expand'));
        return true;
    }

    /**
     * 移动小内存块，后面的块向前移动，填补指定的内存空洞
     * @param index 
     */
    protected _moveBlock(index: number) {
        const len = this._blocks.length;
        if (index >= len) return false;
        const dataView = new Uint8Array(this.data);
        const size = this._blockSize;
        for (let i = index + 1; i < len; i++) {
            const start = i * size;
            const end = start + size;
            const target = start - size;
            dataView.copyWithin(target, start, end);
            this._needUpload[i - 1] = this._needUpload[i];
            this._blocks[i - 1] = this._blocks[i];
            if (this._blocks[i - 1]) {
                this._blocks[i - 1].index--;
                this._blocks[i - 1].offset -= size;
                this._blocks[i - 1].user.notifyGPUBufferChange('moveBlock');
            }
        }
        this._blocks.length--;
        return true;
    }

    /**
     * 创建小内存块对象
     * @param index 
     * @param size 
     * @param alignedSize 
     * @param user 
     */
    protected _createBufferBlock(index: number, size: number, alignedSize: number, user: IUniformBufferUser) {
        return new UniformBufferBlock(this, index, size, alignedSize, user);
    }

    /**
     * 获取小内存块
     * @param size 需求尺寸
     * @param user 使用者
     */
    getBlock(size: number, user: IUniformBufferUser) {
        const alignedSize = roundUp(size, this.manager.byteAlign);
        if (alignedSize !== this._blockSize) {
            console.warn('WebGPUBufferCluster: 获取内存块时, 长度错误!');
            return null;
        }

        const index = this._getBlockWithExpand();
        const bb = this._createBufferBlock(index, size, alignedSize, user);
        this._blocks[index] = bb;
        return bb;
    }

    /**
     * 释放小内存块
     */
    freeBlock(bb: UniformBufferBlock) {
        const index = this._blocks.indexOf(bb);
        if (index !== -1) {
            if (index === this._blocks.length - 1) //删除最后一个
                this._blocks.length--;
            else {
                this._blocks[index] = null; //变成空洞
                this._holeNum++;
            }
            bb.destroy();
            if (this._holeNum > this.manager.removeHoleThreshold) {
                this.manager._addRemoveHoleCluster(this);
                this._holeNum = 0;
            }
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
        for (let i = 0, len = this._blocks.length; i < len; i++) {
            if (this._needUpload[i]) {
                if (startIndex === -1)
                    startIndex = i;
                endIndex = i;
                next = true;
                this._needUpload[i] = false;
                this._blocks[i]?.user.updateOver();
            } else {
                //如果当前块不需要上传，且之前有需要上传的块，则上传数据
                if (next) {
                    offset = startIndex * this._blockSize;
                    size = (endIndex - startIndex + 1) * this._blockSize;
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
            offset = startIndex * this._blockSize;
            size = (endIndex - startIndex + 1) * this._blockSize;
            this.manager.writeBuffer(this.buffer, this.data, offset, size);
            count++;
            bytes += size;
        }

        //记录上传次数，字节数
        this.manager.statisUpload(count, bytes);
    }

    /**
     * 标记块需要上传
     * @param index 
     */
    _addUploadBlock(index: number) {
        this._needUpload[index] = true;
        if (!this._inManagerUpdateArray)
            this.manager._addUpdateArray(this);
    }

    /**
     * 优化小内存块顺序，上传频繁的块放前面
     */
    optimize() {
        let ret = false;
        for (let i = 0, len = this._blocks.length; i < len; i++) { //这里不能用倒序，否则会遗漏
            const bb = this._blocks[i];
            if (bb && !bb.moved && bb.uploadNum > this.manager.uploadThreshold && i > 0) {
                const size = this._blockSize;
                const dataView = new Uint8Array(this.data);
                this._move.set(new Uint8Array(this.data, size * i, size));
                for (let j = i - 1; j >= 0; j--) {
                    const start = j * size;
                    const end = start + size;
                    const target = start + size;
                    dataView.copyWithin(target, start, end);
                    this._needUpload[j + 1] = this._needUpload[j];
                    this._blocks[j + 1] = this._blocks[j];
                    if (this._blocks[j + 1]) {
                        this._blocks[j + 1].index++;
                        this._blocks[j + 1].offset += size;
                        this._blocks[j + 1].user.notifyGPUBufferChange('optimize');
                    }
                }
                dataView.set(this._move);
                bb.index = 0;
                bb.offset = 0;
                bb.moved = true;
                this._blocks[0] = bb;
                this._blocks[0].user.notifyGPUBufferChange('optimize');
                ret = true;
                if (this.manager._enableStat)
                    this.manager._stat.moveNum++;
            }
        }
        return ret;
    }

    /**
     * 移除空洞，使小内存块连续
     */
    removeHole() {
        let ret = false;
        for (let i = this._blocks.length - 1; i > -1; i--) {
            if (!this._blocks[i]) {
                if (this._moveBlock(i)) {
                    ret = true;
                    if (this.manager._enableStat)
                        this.manager._stat.moveNum++;
                }
            }
        }
        this._holeNum = 0;
        return ret;
    }

    /**
     * 清理，释放所有小内存块，回到内存未占用状态
     * @param blockNum 保留多少小块
     */
    clear(blockNum?: number) {
        this._blocks.forEach(block => block && block.destroy());
        this._blocks.length = 0;
        if (blockNum != undefined && blockNum > 0 && blockNum !== this._blockNum) {
            this._blockNum = blockNum;
            this._totalSize = this._blockSize * this._blockNum;
            this.buffer = this.manager.createGPUBuffer(this._totalSize);
            this.data = new ArrayBuffer(this._totalSize);
        } else {
            this._blockNum = 0;
            this._totalSize = 0;
            this.buffer = null;
            this.data = null;
        }
        this._needUpload.length = this._blockNum;
        this._needUpload.fill(false);
    }

    /**
     * 获取一个空闲块，如果空间不够，扩大内存块
     */
    private _getBlockWithExpand() {
        //先查找空洞
        for (let i = this._blocks.length - 1; i > -1; i--) {
            if (!this._blocks[i]) { //找到空洞，返回该位置
                this._holeNum--;
                return i;
            }
        }
        if (this._blocks.length < this._blockNum)
            return this._blocks.length;
        else {
            this._expandBuffer(); //扩展一定会成功，因为调用该函数前已经检查待扩展空间
            return this._blocks.length;
        }
    }

    /**
     * 销毁
     */
    destroy() {
        if (!this._destroyed) {
            this.clear();
            this.buffer.destroy ?? this.buffer.destroy();
            this.manager.statisGPUMemory(-this._totalSize);
            this._destroyed = true;
            return true;
        }
        console.warn('UniformBufferCluster: object alreay destroyed!');
        return false;
    }
}