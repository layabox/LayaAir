/**
 * GPU时间戳类
 * 每个CommandEncoder分配一个本类，GPU在执行renderPass时会写入两个纳秒级时间戳
 * 分别代表renderPass开始时刻和结束时刻，这两个时刻的差值就是renderPass的执行时间
 * 要统计GPU每帧消耗的时间，只要把同一帧内所有的renderPass执行时间累加即可
 */
export class WebGPUTimingHelper {
    private _canTimestamp: boolean; //是否支持时间戳功能
    private _device: GPUDevice; //GPU设备
    private _querySet: GPUQuerySet; //时间戳数据
    private _resolveBuffer: GPUBuffer; //解析时间戳数据的缓存区
    private _resultBuffer: GPUBuffer; //拷贝时间戳结果的缓存区
    private _resultBufferPool: GPUBuffer[] = []; //拷贝时间戳结果的缓存区池
    private _state: 'free' | 'need resolve' | 'wait for result' | 'mapped' = 'free'; //当前状态

    constructor(device: GPUDevice) {
        this._device = device;
        this._canTimestamp = device.features.has('timestamp-query');
        if (this._canTimestamp) {
            this._querySet = device.createQuerySet({
                type: 'timestamp',
                count: 2,
            });
            this._resolveBuffer = device.createBuffer({
                label: 'queryResolve',
                size: this._querySet.count * 8,
                usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
            });
        }
    }

    private _beginTimestampPass(encoder: GPUCommandEncoder, fnName: 'beginRenderPass' | 'beginComputePass', descriptor: GPURenderPassDescriptor | GPUComputePassDescriptor): GPURenderPassEncoder | GPUComputePassEncoder {
        if (this._canTimestamp && this._state === 'free') {
            this._state = 'need resolve';

            const pass = encoder[fnName]({
                ...descriptor,
                timestampWrites: {
                    querySet: this._querySet!,
                    beginningOfPassWriteIndex: 0,
                    endOfPassWriteIndex: 1,
                },
            } as any);

            const resolve = () => this._resolveTiming(encoder);
            const origEnd = pass.end;
            pass.end = function (this: GPURenderPassEncoder | GPUComputePassEncoder): undefined {
                origEnd.call(this);
                resolve();
                return undefined;
            };
            return pass;
        } else {
            return encoder[fnName](descriptor as any);
        }
    }

    /**
     * 开始带时间戳的渲染流程
     * @param encoder 
     * @param descriptor 
     */
    beginRenderPass(encoder: GPUCommandEncoder, descriptor: GPURenderPassDescriptor): GPURenderPassEncoder {
        return this._beginTimestampPass(encoder, 'beginRenderPass', descriptor) as GPURenderPassEncoder;
    }

    /**
     * 开始带时间戳的计算流程
     * @param encoder 
     * @param descriptor 
     */
    beginComputePass(encoder: GPUCommandEncoder, descriptor: GPUComputePassDescriptor): GPUComputePassEncoder {
        return this._beginTimestampPass(encoder, 'beginComputePass', descriptor) as GPUComputePassEncoder;
    }

    /**
     * 解析时间戳
     * @param encoder 
     */
    private _resolveTiming(encoder: GPUCommandEncoder) {
        if (this._canTimestamp && this._state === 'need resolve') {
            this._state = 'wait for result';
            this._resultBuffer = this._resultBufferPool.pop() || this._device.createBuffer({
                label: 'queryResult',
                size: this._resolveBuffer!.size,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            });
            encoder.resolveQuerySet(this._querySet!, 0, this._querySet!.count, this._resolveBuffer!, 0);
            encoder.copyBufferToBuffer(this._resolveBuffer!, 0, this._resultBuffer, 0, this._resultBuffer.size);
        }
    }

    /**
     * 异步获取结果
     */
    async getResult(): Promise<number> {
        if (this._canTimestamp && this._state === 'wait for result') {
            this._state = 'mapped';
            const resultBuffer = this._resultBuffer!;
            await resultBuffer.mapAsync(GPUMapMode.READ);
            const times = new BigInt64Array(resultBuffer.getMappedRange());
            const duration = Number(times[1] - times[0]);
            resultBuffer.unmap();
            this._state = 'free';
            this._resultBufferPool.push(resultBuffer);
            return duration;
        }
        return -1;
    }

    /**
     * 当前是否空闲
     */
    isFree() {
        return this._state === 'free';
    }
}