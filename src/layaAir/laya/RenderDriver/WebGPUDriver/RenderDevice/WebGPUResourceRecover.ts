import { Laya } from "../../../../Laya";
import { WebGPUBuffer } from "./WebGPUBuffer";

/**
 * WebGPU内存回收（需要延迟一帧回收的内存）
 */
export class WebGPUResourceRecover {
    private _recoverList: WebGPUBuffer[] = []; //回收队列
    private _frameCount: number; //当前帧

    needRecover(res: WebGPUBuffer) {
        this._recoverList.push(res);
        this._frameCount = Laya.timer.currFrame;
    }

    recover() {
        if (this._frameCount < Laya.timer.currFrame) {
            //回收内存
            for (let i = this._recoverList.length - 1; i > -1; i--)
                this._recoverList[i]._source.destroy();
            this._recoverList.length = 0;
        }
    }
}