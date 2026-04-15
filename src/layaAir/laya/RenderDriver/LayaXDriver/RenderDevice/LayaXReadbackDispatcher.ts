/**
 * LayaX 异步回读事件分发。
 *
 * 流程：
 * 1. `LayaXDeviceBuffer.readData` 调 FFI 拿到 requestId，用 `register` 登记 Promise
 * 2. `LayaXRenderEngine.startFrame` 每帧调 `pump(device)` 拉底层 DeviceEvent
 * 3. 按 requestId 找到登记的 Promise 完成/失败
 *
 * DeviceEventType 与 Rust 保持一致：
 *   0=DeviceLost, 1=SwapchainOutOfDate, 2=OutOfMemory, 3=BackendError,
 *   4=ReadbackCompleted, 5=ReadbackFailed
 */
export class LayaXReadbackDispatcher {
    private static _pending: Map<number, { resolve: () => void; reject: (e: Error) => void }> = new Map();

    /**
     * 登记一次待完成的回读请求。
     * @param id FFI 返回的 request_id（>0）
     */
    static register(id: number, resolve: () => void, reject: (e: Error) => void): void {
        this._pending.set(id, { resolve, reject });
    }

    /**
     * 主循环每帧调：拉底层 DeviceEvent 并派发 Readback 完成事件。
     * @param device conchLayaXDevice 实例
     */
    static pump(device: any): void {
        if (!device || !device.pollDeviceEvent) return;
        while (device.pollDeviceEvent()) {
            const ty: number = device.lastEventType();
            const id: number = device.lastEventReadbackId();
            if (ty === 4 || ty === 5) {
                const entry = this._pending.get(id);
                if (!entry) continue;
                this._pending.delete(id);
                if (ty === 4) entry.resolve();
                else entry.reject(new Error("LayaX: GPU readback failed (id=" + id + ")"));
            } else if (ty === 0) {
                // DeviceLost：reject 全部 pending
                this._rejectAll(new Error("LayaX: device lost"));
            }
            // 其他事件暂不处理
        }
    }

    private static _rejectAll(err: Error): void {
        for (const entry of this._pending.values()) {
            try { entry.reject(err); } catch { /* ignore */ }
        }
        this._pending.clear();
    }
}
