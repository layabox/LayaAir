import { AnimationClip } from "../../../../animation/AnimationClip";
import { AnimatorControllerLayer } from "../../AnimatorControllerLayer";
import { AnimatorState } from "../../AnimatorState";
import { AnimatorBindContext } from "../AnimatorBindContext";
import { LayerTaskType, TaskSlot } from "../TaskSlot";

/** active list 视图（FastSinglelist 的内部布局，避免反向 import）。 */
export interface ActiveSlotList {
    length: number;
    elements: TaskSlot[];
}

/**
 * 状态机字段批量同步缓冲区。
 *
 * 每帧 RT 工厂调 `sync(active, bindingMap)`：所有 active slot × layer 状态写入预分配的
 * Int32/Float32 双视图 ArrayBuffer，单次 `nativeEvaluator.syncBatch` 跨界，与场景规模无关。
 *
 * Buffer layout（与 native AnimatorEvaluator::syncBatch 协议对齐）：
 *   Layer record (48 bytes = 12 × 4-byte word，i32/f32 双视图共享同一 ArrayBuffer):
 *     [0]slotHandle    [1]layerIdx       [2]type            [3]bindingId
 *     [4]destBindingId [5]weight(f32)    [6]crossWeight(f32)[7]time(f32)
 *     [8]destTime(f32) [9]additive       [10]frontPlay      [11]destFrontPlay
 *   Slot record (8 bytes = 2 × i32):
 *     [0]slotHandle    [1]hasNonIdle
 */
export class RTBatchSyncBuffer {

    private static readonly LAYER_RECORD_WORDS = 12;
    private static readonly SLOT_RECORD_WORDS = 2;

    private readonly _nativeEvaluator: any;

    private _layerBufferI32: Int32Array;
    private _layerBufferF32: Float32Array;
    private _layerBufferCapRecords: number;
    private _slotBufferI32: Int32Array;
    private _slotBufferCapRecords: number;

    /** _computePlayTime 写入位，避免返回临时 tuple 对象。 */
    private _ptTime: number = 0;
    private _ptFront: boolean = true;

    constructor(nativeEvaluator: any) {
        this._nativeEvaluator = nativeEvaluator;
        const layer = this._allocLayerBuffer(64);
        this._layerBufferI32 = layer.i32;
        this._layerBufferF32 = layer.f32;
        this._layerBufferCapRecords = layer.cap;
        const slot = this._allocSlotBuffer(32);
        this._slotBufferI32 = slot.i32;
        this._slotBufferCapRecords = slot.cap;
    }

    /**
     * 把 active slot × layer 的状态机字段批量推送给 native，单次 syncBatch 跨界。
     * 步骤：
     *   1) active 为空 → syncBatch(0, 0) 让 native 知道本帧无活跃 slot；
     *   2) 估算总 layer record 数预扩容 buffer（不够则 ×2，永不缩）；
     *   3) 遍历 active slot：跳过未绑定 native 的 slot；逐 layer 算 bindingId、time/frontPlay
     *      (src + dst)、additive，按 record layout 写 i32/f32 槽位；
     *   4) 写 slot record (slotHandle, hasNonIdle)；
     *   5) 调 nativeEvaluator.syncBatch(buf, layerCount, slotBuf, slotCount)。
     *
     * 必须每帧全量同步：playState._elapsedTime 每帧都变但 TaskSlot 把 playState 当引用字段不参
     * 与脏判定（只有 type/state/weight 等结构性字段才标 dirty）。time 由 JS 推送，只能每帧扫全。
     */
    sync(active: ActiveSlotList, bindingMap: WeakMap<AnimatorBindContext, Map<AnimatorState, number>>): void {
        const slotCount = active.length;
        if (slotCount === 0) {
            this._nativeEvaluator.syncBatch(this._layerBufferI32, 0, this._slotBufferI32, 0);
            return;
        }

        let totalLayerRecords = 0;
        for (let i = 0; i < slotCount; i++) totalLayerRecords += active.elements[i]._layers.length;

        if (totalLayerRecords > this._layerBufferCapRecords) {
            const newCap = Math.max(totalLayerRecords, this._layerBufferCapRecords * 2);
            const buf = this._allocLayerBuffer(newCap);
            this._layerBufferI32 = buf.i32;
            this._layerBufferF32 = buf.f32;
            this._layerBufferCapRecords = buf.cap;
        }
        if (slotCount > this._slotBufferCapRecords) {
            const newCap = Math.max(slotCount, this._slotBufferCapRecords * 2);
            const buf = this._allocSlotBuffer(newCap);
            this._slotBufferI32 = buf.i32;
            this._slotBufferCapRecords = buf.cap;
        }

        const i32 = this._layerBufferI32;
        const f32 = this._layerBufferF32;
        const slotI32 = this._slotBufferI32;
        const STRIDE = RTBatchSyncBuffer.LAYER_RECORD_WORDS;
        const SLOT_STRIDE = RTBatchSyncBuffer.SLOT_RECORD_WORDS;
        let recOff = 0;
        let slotOff = 0;

        for (let i = 0; i < slotCount; i++) {
            const slot = active.elements[i];
            const slotHandle = slot._slotHandle;
            if (!slotHandle) continue;

            const stateMap = bindingMap.get(slot._ctx);
            const layers = slot._layers;
            let hasNonIdle = false;

            for (let j = 0, m = layers.length; j < m; j++) {
                const lt = layers[j];
                if (lt.type !== LayerTaskType.Idle) hasNonIdle = true;

                const bindingId     = (lt.state && stateMap) ? (stateMap.get(lt.state) ?? 0) : 0;
                const destBindingId = (lt.destState && stateMap) ? (stateMap.get(lt.destState) ?? 0) : 0;

                this._computePlayTime(lt.state, lt.playState);
                const time = this._ptTime;
                const frontPlay = this._ptFront;
                this._computePlayTime(lt.destState, lt.crossPlayState);
                const destTime = this._ptTime;
                const destFrontPlay = this._ptFront;

                const cl = slot._ctx.layers[j] as AnimatorControllerLayer | undefined;
                const additive = !!(cl && cl.blendingMode === AnimatorControllerLayer.BLENDINGMODE_ADDTIVE);

                i32[recOff + 0] = slotHandle;
                i32[recOff + 1] = j;
                i32[recOff + 2] = lt.type;
                i32[recOff + 3] = bindingId;
                i32[recOff + 4] = destBindingId;
                f32[recOff + 5] = lt.weight;
                f32[recOff + 6] = lt.crossWeight;
                f32[recOff + 7] = time;
                f32[recOff + 8] = destTime;
                i32[recOff + 9] = additive ? 1 : 0;
                i32[recOff + 10] = frontPlay ? 1 : 0;
                i32[recOff + 11] = destFrontPlay ? 1 : 0;
                recOff += STRIDE;
            }

            slotI32[slotOff + 0] = slotHandle;
            slotI32[slotOff + 1] = hasNonIdle ? 1 : 0;
            slotOff += SLOT_STRIDE;
        }

        this._nativeEvaluator.syncBatch(i32, recOff / STRIDE, slotI32, slotOff / SLOT_STRIDE);
    }

    /** 按 web evaluator 同公式算 (curPlayTime, frontPlay) 写入 _ptTime/_ptFront；缺失输入回退 (0, true)。 */
    private _computePlayTime(state: AnimatorState | null, playState: any): void {
        if (!state || !playState) {
            this._ptTime = 0;
            this._ptFront = true;
            return;
        }
        const clip = (state as any)._clip as AnimationClip | null | undefined;
        const clipDuration = (clip as any)?._duration ?? 0;
        const clipStart = (state as any).clipStart ?? 0;
        const normalizedPlayTime = playState._normalizedPlayTime ?? 0;
        const playDuration = playState._duration ?? 0;
        this._ptTime = clipStart * clipDuration + normalizedPlayTime * playDuration;
        this._ptFront = (playState._elapsedTime ?? 0) > (playState._lastElapsedTime ?? 0);
    }

    /** 分配 records 条 layer record 用的 ArrayBuffer，返回 i32/f32 双视图 + capacity。 */
    private _allocLayerBuffer(records: number): { i32: Int32Array; f32: Float32Array; cap: number } {
        const ab = new ArrayBuffer(records * RTBatchSyncBuffer.LAYER_RECORD_WORDS * 4);
        return { i32: new Int32Array(ab), f32: new Float32Array(ab), cap: records };
    }

    /** 分配 records 条 slot record 用的 Int32Array + capacity。 */
    private _allocSlotBuffer(records: number): { i32: Int32Array; cap: number } {
        return { i32: new Int32Array(records * RTBatchSyncBuffer.SLOT_RECORD_WORDS), cap: records };
    }
}
