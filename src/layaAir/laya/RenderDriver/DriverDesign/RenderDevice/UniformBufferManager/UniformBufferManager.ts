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
 * Uniform内存块管理
 */
export class UniformBufferManager {
    renderContext: any; //渲染上下文对象
    clustersAll: Map<number, UniformBufferCluster[]>; //所有大内存块，按尺寸分组
    clustersCur: Map<number, UniformBufferCluster> //当前大内存块，按尺寸分组
    useBigBuffer: boolean = true; //是否使用大内存模式
    destroyed: boolean = false; //该对象是否已经销毁

    snCounter: number = 0; //序号计数器
    byteAlign: number = 256; //字节对齐
    clusterMaxBlock: number = 256; //每个Cluster最多容纳的Block数量
    uploadThreshold: number = 200; //判定为动态块的上传次数阈值

    moveNum: number = 0; //内存块的移动次数
    uploadNum: number = 0; //每帧上传次数
    uploadByte: number = 0; //每帧上传字节数

    timeCostAvg: number = 0; //花费时间（帧平均）
    timeCostSum: number = 0; //花费时间（总数）
    timeCostCount: number = 0; //统计花费时间的计数器

    constructor(useBigBuffer: boolean) {
        this.clustersAll = new Map();
        this.clustersCur = new Map();
        this.useBigBuffer = useBigBuffer;
    }

    /**
     * 添加大内存块
     * @param size 
     * @param blockNum 
     */
    private _addCluster(size: number, blockNum: number = 1) {
        const alignedSize = roundUp(size, this.byteAlign);
        const cluster = new UniformBufferCluster(alignedSize, blockNum, this);
        const clusters = this.clustersAll.get(alignedSize);
        if (clusters) {
            clusters.push(cluster);
            cluster.sn = clusters.length - 1;
        }
        else this.clustersAll.set(alignedSize, [cluster]);
        this.clustersCur.set(alignedSize, cluster);
        return cluster;
    }

    /**
     * 开始新的一帧
     */
    startFrame() {
        //显示上传统计信息
        // const info = 'timeCost = ' + this.timeCostAvg + 'us, moveNum = ' + this.moveNum + ', uploadNum = ' + this.uploadNum + ', uploadByte = ' + this.uploadByte;
        // if (this.useBigBuffer)
        //     console.log('BigBuffer ' + info);
        // else console.log('AloneBuffer ' + info);

        //按帧计数的清零
        this.uploadNum = 0;
        this.uploadByte = 0;
    }

    /**
     * 设置渲染上下文
     * @param renderContext 
     */
    setRenderContext(renderContext: any) {
        this.renderContext = renderContext;
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
            this.clustersAll.delete(alignedSize);
            this.clustersCur.delete(alignedSize);
            return;
        }
        const cluster = this.clustersCur.get(alignedSize);
        const clusters = this.clustersAll.get(alignedSize);
        if (clusters.length > sn) {
            clusters.splice(sn, 1);
            if (clusters.length === 0) {
                this.clustersAll.delete(alignedSize);
                this.clustersCur.delete(alignedSize);
                return;
            } else {
                for (let i = sn; i < clusters.length; i++)
                    clusters[i].sn--;
            }
        } else return;
        if (cluster.sn === sn) {
            if (clusters.length === 1)
                this.clustersCur.set(alignedSize, clusters[0]);
            else {
                let index = 0;
                let usedNum = clusters[0].usedNum;
                for (let i = 1; i < clusters.length; i++) {
                    if (clusters[i].usedNum < usedNum) {
                        index = i;
                        usedNum = clusters[i].usedNum;
                    }
                }
                this.clustersCur.set(alignedSize, clusters[index]);
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
        let cluster = this.clustersCur.get(alignedSize);
        if (!cluster)
            return this._addCluster(alignedSize).getBlock(size, user);
        if (cluster.usedNum < this.clusterMaxBlock)
            return cluster.getBlock(size, user);

        cluster = null;
        const clusters = this.clustersAll.get(alignedSize);
        for (let i = clusters.length - 1; i > -1; i--) {
            if (clusters[i].usedNum < this.clusterMaxBlock) {
                cluster = clusters[i];
                this.clustersCur.set(alignedSize, cluster);
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
                    this.removeCluster(cluster.blockSize, cluster.sn);
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
        if (this.useBigBuffer) {
            const t = performance.now();
            this.clustersAll.forEach(clusters => {
                for (let i = clusters.length - 1; i > -1; i--) {
                    clusters[i].upload();
                    clusters[i].optimize();
                }
            });
            this.timeCostSum += performance.now() - t;
            this.timeCostCount++;
            if (this.timeCostCount > 100) {
                this.timeCostAvg = (this.timeCostSum / this.timeCostCount) * 1000 | 0;
                this.timeCostSum = 0;
                this.timeCostCount = 0;
            }
        }
    }

    /**
     * 清理所有内存
     */
    clear() {
        this.clustersAll.forEach(clusters => {
            for (let i = clusters.length - 1; i > -1; i--)
                clusters[i].clear();
        });
    }

    /**
     * 销毁
     */
    destroy() {
        if (!this.destroyed) {
            this.clear();
            this.clustersAll.clear();
            this.clustersCur.clear();
            this.destroyed = true;
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