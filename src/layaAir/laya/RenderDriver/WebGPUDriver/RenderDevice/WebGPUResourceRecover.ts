import { WebGPUBuffer } from "./WebGPUBuffer";

/**
 * WebGPU内存回收（需要延迟一帧回收的内存）
 */
export class WebGPUResourceRecover {
    recoverList: WebGPUBuffer[] = []; //正在回收的队列
    readyToRecover: WebGPUBuffer[] = []; //需要回收的队列

    needRecover(res: WebGPUBuffer) {
        this.readyToRecover.push(res);
    }

    recover() {
        //交换队列
        const temp = this.recoverList;
        this.recoverList = this.readyToRecover;
        this.readyToRecover = temp;

        //回收内存
        for (let i = this.recoverList.length - 1; i > -1; i--)
            this.recoverList[i]._source.destroy();
        this.recoverList.length = 0;
    }
}