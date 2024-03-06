import { Vector2 } from "../../../maths/Vector2";
import { WebGPUBuffer } from "./WebGPUBuffer";
import { WebGPUUniformBlockInfo, WebGPUUniformItemType } from "./WebGPUShaderInstance";


//根据unfiormBlock布局来更新数据
export class WebGPUSubUniformBlockBuffer {
    owner: WebGPUUniformBlockBuffer
    layout: WebGPUUniformBlockInfo;
    updateRange: Vector2;//从哪里更新到哪里
    needUpdata: boolean;

    //更新buffer
    uploadBuffer() {
        //TODO
        //根据updateRange来更新数据
        //用的时候再更新
    }

    markChangeProperty(propertyID: number) {
        //将需要更新的  unifom 组织在这里
        this.needUpdata = true
    }
}

//根据unfiormBlock布局来更新数据
export class WebGPUUniformBlockBuffer {
    //TODO 重名直接报错
    static _map: { [key: number]: WebGPUUniformBlockBuffer } = {};
    _source: WebGPUBuffer;//大buffer本身
    uniformID: number;//get Uniform name TO ID
    subLayout: WebGPUUniformBlockInfo;
    isMergeBuffer: boolean;//是否是大buffer
    subBufferCount: number;//这个大Buffer包含
    pool: number[];//不用的回收到池子里
    subBuffers: WebGPUUniformBlockBuffer[];//subUBOBuffer的集合
    subBuffersCount: number;//多少个SubBuffer
    expansionSubBuffer: number;//如果subBuffer不够，每一次扩展需要扩多大的buffer


    constructor(isMergeBuffer: boolean, subBuffersCount: number, layout: WebGPUUniformBlockInfo, expansion: number) {
        this.subBufferCount = subBuffersCount;
        this.isMergeBuffer = isMergeBuffer;
        this.subLayout = layout;
        this.expansionSubBuffer = expansion;
        //根据subBuffer数量创建WebGPUUniformBlockBuffer,放入Pool中
    }

    private resetBuffer() {
        this.subBuffersCount += this.expansionSubBuffer;
        //destroy 旧的
        //根据subBuffersCount 重新创建GPUBuffer
        //旧的数据拷贝
    }

    /**
     * 得到一个subUBOBuffer
     */
    getSubUbOBuffer(): WebGPUSubUniformBlockBuffer {
        //从对象池里面获取，没有就扩张subBuffer
        //
        return null;
    }

    /**
     * 回收一个SubUBOBuffer
     */
    removeSubUboBuffer(subBuffer: WebGPUSubUniformBlockBuffer) {
        //回收一个SubUniformBlockBuffer
    }
}