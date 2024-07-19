import { Laya } from "../../../../Laya";
import { WebGPUBuffer } from "./WebGPUBuffer";

/**
 * WebGPU内存回收（需要延迟一帧回收的内存）
 */
export class WebGPUResourceRecover {
    recoverList: WebGPUBuffer[] = []; //回收队列
    frameCount: number; //当前帧

    needRecover(res: WebGPUBuffer) {
        this.recoverList.push(res);
        this.frameCount = Laya.timer.currFrame;
    }

    recover() {
        if (this.frameCount < Laya.timer.currFrame) {
            //回收内存
            for (let i = this.recoverList.length - 1; i > -1; i--)
                this.recoverList[i]._source.destroy();
            this.recoverList.length = 0;
        }
    }
}