import { IUniformBufferUser } from "./IUniformBufferUser";
import { UniformBufferAlone } from "./UniformBufferAlone";
import { UniformBufferBlock } from "./UniformBufferBlock";
import { UniformBufferCluster } from "./UniformBufferCluster";

export type TypedArray =
    | Int8Array
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array;

export type TypedArrayConstructor =
    | Int8ArrayConstructor
    | Uint8ArrayConstructor
    | Int16ArrayConstructor
    | Uint16ArrayConstructor
    | Int32ArrayConstructor
    | Uint32ArrayConstructor
    | Float32ArrayConstructor
    | Float64ArrayConstructor;

/**
 * 向上圆整到align的整数倍
 * @param n 
 * @param align 
 */
export function roundUp(n: number, align: number) {
    return (((n + align - 1) / align) | 0) * align;
}

/**
 * 向下圆整到align的整数倍
 * @param n 
 * @param align 
 */
export function roundDown(n: number, align: number) {
    const res = (((n + align - 1) / align) | 0) * align;
    return res > n ? res - align : res;
}

/**
 * UBO统计信息
 */
export class UBOStat {
    moveNum: number = 0; //内存块的移动次数
    uploadNum: number = 0; //每帧上传次数
    uploadByte: number = 0; //每帧上传字节数
    timeCostAvg: number = 0; //花费时间（帧平均）
    timeCostSum: number = 0; //花费时间（总数）
    timeCostCount: number = 0; //统计花费时间的计数器
}

/**
 * Uniform内存块管理
 */
export class UniformBufferManager {
    private _clustersAll: Map<number, UniformBufferCluster[]>; //所有大内存块，按尺寸分组
    private _clustersCur: Map<number, UniformBufferCluster>; //当前大内存块，按尺寸分组
    private _destroyed: boolean = false; //该对象是否已经销毁

    //更新数据缓存数组
    private _needUpdateClusters: Array<UniformBufferCluster> = [];
    //释放内存缓存数组
    private _removeHoleArray: Array<UniformBufferCluster> = [];
    //优化内存位置数据
    private _optimizeBufferPosArray: Array<UniformBufferCluster> = [];

    _useBigBuffer: boolean = true; //是否使用大内存模式

    //字节对齐
    byteAlign: number = 256;

    //config
    clusterMaxBlock: number = 256; //每个Cluster最多容纳的Block数量
    //config
    uploadThreshold: number = 200; //判定为动态块的上传次数阈值
    //config
    removeHoleThreshold: number = 10; //移除内存空洞的阈值

    //统计相关
    _stat: UBOStat;
    _enableStat: boolean = true;

    //单独的UniformBuffer
    aloneBuffers: UniformBufferAlone[] = [];

    constructor(useBigBuffer: boolean) {
        this._useBigBuffer = useBigBuffer;
        this._clustersAll = new Map();
        this._clustersCur = new Map();
        this._stat = new UBOStat();
    }

    /**
     * 创建大内存块对象
     * @param size 小内存块尺寸
     * @param blockNum 小内存块初始容量
     * @param manager 管理器
     */
    protected _createBufferCluster(size: number, blockNum: number) {
        return new UniformBufferCluster(size, blockNum, this);
    }

    /**
     * 添加大内存块
     * @param size 小内存块尺寸
     * @param blockNum 小内存块初始容量
     */
    private _addCluster(size: number, blockNum: number = 16) {
        const alignedSize = roundUp(size, this.byteAlign);
        const cluster = this._createBufferCluster(alignedSize, blockNum);
        const clusters = this._clustersAll.get(alignedSize);
        if (clusters) {
            clusters.push(cluster);
            cluster._sn = clusters.length - 1; //大内存块的序号就是在相同尺寸大内存块数组中的序号
        }
        else this._clustersAll.set(alignedSize, [cluster]);
        this._clustersCur.set(alignedSize, cluster); //新添加的大内存块作为当前大内存块
        return cluster;
    }

    /**
     * 开始一帧
     */
    startFrame() { }

    /**
     * 结束一帧
     */
    endFrame() {
        //显示上传统计信息
        // const info = 'timeCost = ' + this._stat.timeCostAvg + 'us, moveNum = ' + this._stat.moveNum + ', uploadNum = ' + this._stat.uploadNum + ', uploadByte = ' + this._stat.uploadByte;
        // if (this._useBigBuffer)
        //     console.log('BigBuffer ' + info);
        // else console.log('AloneBuffer ' + info);

        if (this._enableStat) {
            //按帧计数的清零
            this._stat.moveNum = 0;
            this._stat.uploadNum = 0;
            this._stat.uploadByte = 0;
            //记录累加帧数
            this._stat.timeCostCount++;
        }

        if (this._useBigBuffer) {
            if (this._removeHoleArray.length > 0) {
                for (let i = this._removeHoleArray.length - 1; i > -1; i--)
                    this._removeHoleArray[i].removeHole();
                this._removeHoleArray.length = 0;
            }
            if (this._optimizeBufferPosArray.length > 0) {
                for (let i = this._optimizeBufferPosArray.length - 1; i > -1; i--)
                    this._optimizeBufferPosArray[i].optimize();
                this._optimizeBufferPosArray.length = 0;
            }
        }
    }

    /**
     * 获取单独的UniformBuffer
     * @param size 
     * @param name 
     */
    getBufferAlone(size: number, name?: string) {
        const alignedSize = roundUp(size, this.byteAlign);
        this.statisGPUMemory(alignedSize);
        return this.createGPUBuffer(alignedSize, name);
    }

    /**
     * 删除大内存块
     * @param size 
     * @param sn
     */
    removeCluster(size: number, sn: number) {
        const alignedSize = roundUp(size, this.byteAlign);
        if (sn < 0) { //<0表示删除所有该尺寸的大内存块
            this._clustersAll.delete(alignedSize);
            this._clustersCur.delete(alignedSize);
            return;
        }
        const cluster_sn = this._clustersCur.get(alignedSize)?._sn;
        const clusters = this._clustersAll.get(alignedSize);
        if (clusters.length > sn) {
            clusters.splice(sn, 1);
            if (clusters.length === 0) { //该尺寸的大内存块已经没有了
                this._clustersAll.delete(alignedSize);
                this._clustersCur.delete(alignedSize);
                return;
            } else {
                for (let i = sn; i < clusters.length; i++)
                    clusters[i]._sn--; //其他大内存块的序号前移
            }
        } else return; //序号不合法，不删除任何大内存块
        if (cluster_sn !== undefined
            && cluster_sn === sn) { //当前大内存块被删除了，需要更改当前大内存块
            //找一个最大usedNum，且有剩余空间的大内存块作为当前大内存块
            let usedNumMax = -1, usedNum = -1, index = -1;
            for (let i = clusters.length - 1; i > -1; i--) {
                usedNum = clusters[i].usedNum;
                if (usedNum > usedNumMax
                    && usedNum < this.clusterMaxBlock) {
                    index = i;
                    usedNumMax = usedNum;
                }
            }
            if (index >= 0) //找到符合要求的大内存块
                this._clustersCur.set(alignedSize, clusters[index]);
            else this._clustersCur.delete(alignedSize); //没有符合要求的大内存块，当前该尺寸大内存块为空
        }
    }

    /**
     * 获取小内存块
     * @param size 
     * @param user 
     */
    getBlock(size: number, user: IUniformBufferUser) {
        const alignedSize = roundUp(size, this.byteAlign);
        let cluster = this._clustersCur.get(alignedSize);
        if (!cluster)
            return this._addCluster(alignedSize).getBlock(size, user);
        if (cluster.usedNum < this.clusterMaxBlock)
            return cluster.getBlock(size, user);

        //当前大内存已经满员，找一个最大usedNum，且有剩余空间的大内存块作为当前大内存块
        cluster = null;
        const clusters = this._clustersAll.get(alignedSize);
        let usedNumMax = -1, usedNum = -1, index = -1;
        for (let i = clusters.length - 1; i > 0; i--) {
            usedNum = clusters[i].usedNum;
            if (usedNum > usedNumMax
                && usedNum < this.clusterMaxBlock) {
                index = i;
                usedNumMax = usedNum;
            }
        }
        if (index >= 0) { //找到符合要求的大内存块
            cluster = clusters[index];
            this._clustersCur.set(alignedSize, cluster);
        } else this._clustersCur.delete(alignedSize); //没有符合要求的大内存块，当前该尺寸大内存块为空

        if (cluster) //已有符合要求的大内存块
            return cluster.getBlock(size, user); //直接在该大内存块中添加小内存块
        return this._addCluster(alignedSize).getBlock(size, user); //没有符合要求的大内存块，新建一个大内存块，并在其中添加小内存块
    }

    /**
     * 释放小内存块
     * @param bb 
     */
    freeBlock(bb: UniformBufferBlock) {
        const cluster = bb.cluster;
        if (cluster) {
            if (cluster.freeBlock(bb)) { //释放小内存块
                if (cluster.usedNum === 0) //该大内存块已经没有小内存块了
                    this.removeCluster(cluster._blockSize, cluster._sn); //删除该大内存块
                return true;
            }
            return false;
        }
        return false;
    }

    /**
     * 上传数据
     */
    upload() {
        if (this._useBigBuffer) {
            let t: number;
            if (this._enableStat)
                t = performance.now();
            let cluster: UniformBufferCluster;
            for (let i = this._needUpdateClusters.length - 1; i > -1; i--) {
                cluster = this._needUpdateClusters[i];
                cluster.upload();
                cluster._inManagerUpdateArray = false;
            }
            this._needUpdateClusters.length = 0;

            if (this._enableStat)
                this.statisTimeCostAvg(performance.now() - t);
        }
    }

    _addUpdateArray(cluster: UniformBufferCluster) {
        if (!cluster._inManagerUpdateArray) {
            this._needUpdateClusters.push(cluster);
            cluster._inManagerUpdateArray = true;
        }
    }

    _addRemoveHoleCluster(cluster: UniformBufferCluster) {
        if (this._removeHoleArray.indexOf(cluster) === -1)
            this._removeHoleArray.push(cluster);
    }

    _addOptimizeBufferPos(cluster: UniformBufferCluster) {
        if (this._optimizeBufferPosArray.indexOf(cluster) === -1)
            this._optimizeBufferPosArray.push(cluster);
    }

    /**
     * 清理所有内存
     */
    clear() {
        this._clustersAll.forEach(clusters => {
            for (let i = clusters.length - 1; i > -1; i--)
                clusters[i].clear();
        });
    }

    /**
     * 销毁
     */
    destroy() {
        if (!this._destroyed) {
            this.clear();
            this._clustersAll.clear();
            this._clustersCur.clear();
            this._destroyed = true;
            return true;
        }
        console.warn('UniformBufferManager: object alreay destroyed!');
        return false;
    }

    /**
     * 创建GPU内存对象
     * @param size 字节长度
     * @param name 名称
     */
    createGPUBuffer(size: number, name?: string) {
        //todo
    }

    /**
     * 将数据写入GPU内存
     * @param buffer GPU内存对象
     * @param data CPU数据对象
     * @param offset 数据在大内存中的偏移量（字节）
     * @param size 写入的数据长度（字节）
     */
    writeBuffer(buffer: any, data: ArrayBuffer, offset: number, size: number) {
        //todo
    }

    /**
     * 统计GPU内存使用量
     * @param bytes 字节
     */
    statisGPUMemory(bytes: number) {
        //todo
    }

    /**
     * 统计时间花费（平均值）
     * @param time 耗费时间（毫秒）
     */
    statisTimeCostAvg(time: number) {
        this._stat.timeCostSum += time;
        if (this._stat.timeCostCount > 100) {
            this._stat.timeCostAvg = ((this._stat.timeCostSum / this._stat.timeCostCount) * 10000 | 0) / 10; //微秒
            this._stat.timeCostSum = 0;
            this._stat.timeCostCount = 0;
        }
    }

    /**
     * 统计上传次数
     * @param count 上传次数
     * @param bytes 上传字节
     */
    statisUpload(count: number, bytes: number) {
        this._stat.uploadNum += count;
        this._stat.uploadByte += bytes;
    }
}