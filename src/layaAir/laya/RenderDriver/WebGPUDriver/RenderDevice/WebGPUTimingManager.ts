import { WebGPUTimingHelper } from "./WebGPUTimingHelper";

/**
 * GPU时间戳管理类
 */
export class WebGPUTimingManager {
    private _device: GPUDevice;
    private _timingPool: WebGPUTimingHelper[] = []; //时间戳池
    private _timingGroups: WebGPUTimingHelper[][] = [[], [], []]; //时间戳组
    private _timingFrames: number[] = [0, 0, 0]; //时间戳组对应的帧序号

    private _groupNum: number = 0; //当前时间戳组的长度
    get groupNum() {
        return this._groupNum;
    }

    constructor(device: GPUDevice) {
        this._device = device;
    }

    /**
     * 根据帧序号获取时间戳对象（相同的帧序号放入同一组）
     * @param frameCount 
     */
    getTimingHelper(frameCount: number) {
        if (this._timingFrames[0] !== frameCount) {
            const groups = this._timingGroups[2];
            for (let i = 2; i > 0; i--) {
                this._timingFrames[i] = this._timingFrames[i - 1];
                this._timingGroups[i] = this._timingGroups[i - 1];
            }
            this._timingGroups[0] = groups;
            this._timingFrames[0] = frameCount;
            for (let i = this._timingGroups[0].length - 1; i > -1; i--)
                this._timingPool.push(this._timingGroups[0][i]); //回收
            this._timingGroups[0].length = 0;
        }

        const timing = this._getTimingFromPool() ?? new WebGPUTimingHelper(this._device);
        this._timingGroups[0].push(timing);
        return timing;
    }

    /**
     * 从池中获取时间戳对象（重用时间戳对象）
     */
    private _getTimingFromPool() {
        for (let i = this._timingPool.length - 1; i > -1; i--)
            if (this._timingPool[i].isFree())
                return this._timingPool.splice(i, 1)[0];
        return null;
    }

    /**
     * 获取GPU在本帧消耗时间（毫秒）
     */
    getGPUFrameTime(): Promise<number> {
        return new Promise(async (resolve, reject) => {
            const group = this._timingGroups[2];
            let time = 0, n = group.length;
            this._groupNum = n;
            for (let i = group.length - 1; i > -1; i--) {
                group[i].getResult().then(t => {
                    time += t;
                    n--;
                    if (n === 0) {
                        this._timingPool.push(...group); //回收时间戳对象
                        group.length = 0;
                        resolve(((time * 1.e-6) * 1000 | 0) / 1000); //毫秒（保留小数点后三位）
                    }
                });
            }
        });
    }
}