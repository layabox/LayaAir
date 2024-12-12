import { IUniformBufferUser } from "./IUniformBufferUser";
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
    private _needUpdateCluster: Array<UniformBufferCluster> = [];
    //释放内存缓存数组
    private _removeHoleArray: Array<UniformBufferCluster> = [];
    //优化内存位置数据
    private _optimizeBufferPosArray: Array<UniformBufferCluster> = [];

    _useBigBuffer: boolean = true; //是否使用大内存模式

    //序号计数器
    _snCounter: number = 0;

    //字节对齐
    byteAlign: number = 256;

    //config
    clusterMaxBlock: number = 256; //每个Cluster最多容纳的Block数量
    //config
    uploadThreshold: number = 200; //判定为动态块的上传次数阈值
    //config
    optimizeMemoryThreshold: number = 100;//移除内存空洞的阈值

    //统计相关
    _state: UBOStat;

    _enableStat: boolean = false;

    constructor(useBigBuffer: boolean) {
        this._clustersAll = new Map();
        this._clustersCur = new Map();
        this._useBigBuffer = useBigBuffer;
        this._state = new UBOStat();
    }

    /**
     * 添加大内存块
     * @param size 
     * @param blockNum 
     */
    private _addCluster(size: number, blockNum: number = 10) {
        const alignedSize = roundUp(size, this.byteAlign);
        const cluster = new UniformBufferCluster(alignedSize, blockNum, this);
        const clusters = this._clustersAll.get(alignedSize);
        if (clusters) {
            clusters.push(cluster);
            cluster.sn = clusters.length - 1;
        }
        else this._clustersAll.set(alignedSize, [cluster]);
        this._clustersCur.set(alignedSize, cluster);
        return cluster;
    }

    /**
     * 移除Manager的UBO大的Buffer中的内存空洞
     */
    removeHole() {
        if (this._useBigBuffer) {
            this._clustersAll.forEach(clusters => {
                for (let i = clusters.length - 1; i > -1; i--)
                    clusters[i].removeHole();
            });
        }
    }

    /**
     * 开始新的一帧
     */
    startFrame() {
        //按帧计数的清零
        if (this._enableStat) {
            this._state.uploadNum = 0;
            this._state.uploadByte = 0;
        }
    }

    /**
     * 结束一帧数据处理
     */
    endFrame() {
        if (!this._useBigBuffer)
            return;
        if (this._removeHoleArray.length > 0) {
            for (var i = 0; i < this._removeHoleArray.length; i++) {
                this._removeHoleArray[i].removeHole();
            }
            this._removeHoleArray.length = 0;
        }
        if (this._optimizeBufferPosArray.length > 0) {
            for (var i = 0; i < this._optimizeBufferPosArray.length; i++) {
                this._optimizeBufferPosArray[i].optimize();
            }
            this._optimizeBufferPosArray.length = 0;
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
        if (sn === -1) {
            this._clustersAll.delete(alignedSize);
            this._clustersCur.delete(alignedSize);
            return;
        }
        const cluster = this._clustersCur.get(alignedSize);
        const clusters = this._clustersAll.get(alignedSize);
        if (clusters.length > sn) {
            clusters.splice(sn, 1);
            if (clusters.length === 0) {
                this._clustersAll.delete(alignedSize);
                this._clustersCur.delete(alignedSize);
                return;
            } else {
                for (let i = sn; i < clusters.length; i++)
                    clusters[i].sn--;
            }
        } else return;
        if (cluster.sn === sn) {
            if (clusters.length === 1)
                this._clustersCur.set(alignedSize, clusters[0]);
            else {
                let index = 0;
                let usedNum = clusters[0].usedNum;
                for (let i = 1; i < clusters.length; i++) {
                    if (clusters[i].usedNum < usedNum) {
                        index = i;
                        usedNum = clusters[i].usedNum;
                    }
                }
                this._clustersCur.set(alignedSize, clusters[index]);
            }
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

        cluster = null;
        const clusters = this._clustersAll.get(alignedSize);
        for (let i = clusters.length - 1; i > -1; i--) {
            if (clusters[i].usedNum < this.clusterMaxBlock) {
                cluster = clusters[i];
                this._clustersCur.set(alignedSize, cluster);
                break;
            }
        }
        if (cluster)
            return cluster.getBlock(size, user);
        return this._addCluster(alignedSize).getBlock(size, user);
    }

    /**
     * 释放小内存块
     * @param bb 
     */
    freeBlock(bb: UniformBufferBlock) {
        const cluster = bb.cluster;
        if (cluster) {
            if (cluster.freeBlock(bb)) {
                if (cluster.usedNum === 0)
                    this.removeCluster(cluster._blockSize, cluster.sn);
                return true;
            }
            return false;
        }
        return false;
    }

    // /**
    //  * 上传所有数据上传数据
    //  */
    // uploadAll() {
    //     if (this._useBigBuffer) {
    //         const t = performance.now();
    //         this._clustersAll.forEach(clusters => {
    //             for (let i = clusters.length - 1; i > -1; i--) {
    //                 clusters[i].upload();
    //             }
    //         });

    //         if (this._enableStat) {
    //             this._state.timeCostSum += performance.now() - t;
    //             this._state.timeCostCount++;
    //             if (this._state.timeCostCount > 100) {
    //                 this._state.timeCostAvg = (this._state.timeCostSum / this._state.timeCostCount) * 1000 | 0;
    //                 this._state.timeCostSum = 0;
    //                 this._state.timeCostCount = 0;
    //             }
    //         }
    //     }
    // }

    upload() {
        if (this._useBigBuffer) {
            let cluster: UniformBufferCluster;
            for (let i = 0; i < this._needUpdateCluster.length; i++) {
                cluster = this._needUpdateCluster[i];
                cluster.upload();
                cluster._inManagerUpdateArray = false;
            }
        }
        this._needUpdateCluster.length = 0;
    }

    _addUpdateArray(cluster: UniformBufferCluster) {
        if (cluster._inManagerUpdateArray)
            return;
        this._needUpdateCluster.push(cluster);
        cluster._inManagerUpdateArray = true;
    }

    _addRemoveHoleCluster(cluster: UniformBufferCluster) {
        if (this._removeHoleArray.indexOf(cluster) != -1)
            this._removeHoleArray.push(cluster);
    }

    _addoptimizeBufferPos(cluster: UniformBufferCluster) {
        if (this._optimizeBufferPosArray.indexOf(cluster) != -1)
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
     * 统计上传次数
     * @param count 上传次数
     * @param bytes 上传字节
     */
    statisUpload(count: number, bytes: number) {
        //todo
    }
}