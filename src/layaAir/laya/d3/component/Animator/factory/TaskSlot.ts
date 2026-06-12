import { FastSinglelist } from "../../../../utils/SingletonList";
import { AnimatorPlayState } from "../AnimatorPlayState";
import { AnimatorState } from "../AnimatorState";
import { AnimatorBindContext } from "./AnimatorBindContext";

/**
 * 一个 controller layer 在某一帧的任务类型。
 * Idle 表示该 layer 本帧不做事（sleep / disable / finished + playType=0）。
 */
export enum LayerTaskType {
    Idle = 0,
    Normal = 1,
    Cross = 2,
    FixedCross = 3,
}

/**
 * 一个 Animator 上单层 layer 的任务数据。跨帧稳定，不重新分配。
 *
 * 字段分两类：
 *   - 结构性字段（type / state / destState / weight）：参与脏判定，变化时把 slot 加入 dirtyList。
 *   - 引用字段（playState / crossPlayState / crossWeight）：每帧覆盖，不参与脏判定 ——
 *     native 自己读这些对象 / 自己推时间，JS 不需要每帧同步给 native。
 */
export class LayerTask {
    type: LayerTaskType = LayerTaskType.Idle;
    state: AnimatorState | null = null;
    destState: AnimatorState | null = null;
    weight: number = 1.0;

    playState: AnimatorPlayState | null = null;
    crossPlayState: AnimatorPlayState | null = null;
    crossWeight: number = 0;
}

/**
 * Manager 在 tickOne 内通过这个接口提交本帧 layer 状态。
 * 工厂在 bindAnimator 时分配实现实例并返回给 Animator 持有。
 */
export interface ITaskSlot {
    /** @internal Manager 每帧 tickOne 入口 +1；用于 KeyframeNodeOwner.updateMark 比对去重。 */
    _updateMark: number;

    /** 该 layer 本帧不做事。 */
    submitLayerIdle(layerIndex: number): void;

    /** 提交常规任务。weight 由 caller 显式给出（fixedCross 完成那帧强制 1.0）。 */
    submitLayerNormal(
        layerIndex: number,
        state: AnimatorState,
        playState: AnimatorPlayState,
        weight: number
    ): void;

    /** 提交动态交叉融合任务。 */
    submitLayerCross(
        layerIndex: number,
        srcState: AnimatorState,
        srcPlayState: AnimatorPlayState,
        destState: AnimatorState,
        destPlayState: AnimatorPlayState,
        crossWeight: number
    ): void;

    /** 提交固定交叉融合任务（src 来自 crossFixedValue，不需要 srcState/srcPlayState）。 */
    submitLayerFixedCross(
        layerIndex: number,
        destState: AnimatorState,
        destPlayState: AnimatorPlayState,
        crossWeight: number
    ): void;

    /** Animator 级 skip 时调用：所有 layer 一次性置 Idle，slot 出 activeList。 */
    submitAllIdle(): void;

    /** addControllerLayer / removeControllerLayer 时由 Animator 通知更新 layers 数组长度。 */
    resizeLayers(count: number): void;
}

/**
 * Animator 对应的任务槽。一个 Animator 一个 slot，跨帧稳定。
 *
 * Slot 内部维护 `_layers: LayerTask[]`（长度 = animator.controllerLayerCount），以及 `_activeLayerCount`
 * （非 Idle 的 layer 数量）。Slot 自身持有 factory 的 activeList / dirtyList 引用，submit 内部直接维护。
 *
 * - activeList 跨帧维护：slot 至少一个 layer 非 Idle 时入列；全 Idle 时出列。
 * - dirtyList 跨帧维护：本帧结构性字段变化时入列；flushApply 末尾清空。
 */
export class TaskSlot implements ITaskSlot {
    /** @internal 关联的 AnimatorBindContext，flush 时通过 ctx.layers[j] 取 controllerLayer。 */
    _ctx: AnimatorBindContext;
    /** @internal 跨层更新 mark，每帧 tickOne 时由 Manager +1。 */
    _updateMark: number = 0;
    /** @internal */
    _layers: LayerTask[] = [];
    /** @internal */
    _activeLayerCount: number = 0;
    /** @internal */
    _inActive: boolean = false;
    /** @internal */
    _inDirty: boolean = false;
    /** @internal native 端 SlotTable 句柄；0 表示未绑定 native（纯 Web 路径下保持 0）。 */
    _slotHandle: number = 0;
    /**
     * @internal Resize 钩子：layer 数量变化时（addControllerLayer / remove / shrink）由 RT 工厂注入，
     * 用于同步通知 native nativePreparer.resizeSlot。Web 路径下保持 null。
     */
    _onResize: ((count: number) => void) | null = null;

    private readonly _activeList: FastSinglelist<TaskSlot>;
    private readonly _dirtyList: FastSinglelist<TaskSlot>;

    constructor(ctx: AnimatorBindContext, activeList: FastSinglelist<TaskSlot>, dirtyList: FastSinglelist<TaskSlot>) {
        this._ctx = ctx;
        this._activeList = activeList;
        this._dirtyList = dirtyList;
    }

    resizeLayers(count: number): void {
        const layers = this._layers;
        const cur = layers.length;
        if (cur === count) return;
        if (cur < count) {
            for (let i = cur; i < count; i++) layers.push(new LayerTask());
        } else {
            // 缩容：先把要丢的 layer 当成 Idle 处理，更新 activeLayerCount
            for (let i = count; i < cur; i++) {
                if (layers[i].type !== LayerTaskType.Idle) this._activeLayerCount--;
            }
            layers.length = count;
            this._syncListMembership(this._activeLayerCount > 0);
        }
        if (this._onResize) this._onResize(count);
    }

    submitAllIdle(): void {
        const layers = this._layers;
        let changed = false;
        for (let i = 0, n = layers.length; i < n; i++) {
            const lt = layers[i];
            if (lt.type !== LayerTaskType.Idle) {
                lt.type = LayerTaskType.Idle;
                lt.state = null;
                lt.destState = null;
                lt.playState = null;
                lt.crossPlayState = null;
                lt.weight = 1.0;
                lt.crossWeight = 0;
                changed = true;
            }
        }
        if (changed) this._markDirty();
        this._activeLayerCount = 0;
        this._syncListMembership(false);
    }

    submitLayerIdle(layerIndex: number): void {
        const lt = this._layers[layerIndex];
        if (!lt) return;
        const wasActive = lt.type !== LayerTaskType.Idle;
        if (wasActive) {
            // 结构变化：从 active → idle 算 dirty（native 端要知道这个 layer 不再活跃）
            this._markDirty();
            this._activeLayerCount--;
        }
        lt.type = LayerTaskType.Idle;
        lt.state = null;
        lt.destState = null;
        lt.playState = null;
        lt.crossPlayState = null;
        lt.weight = 1.0;
        lt.crossWeight = 0;
        this._syncListMembership(this._activeLayerCount > 0);
    }

    submitLayerNormal(layerIndex: number, state: AnimatorState, playState: AnimatorPlayState, weight: number): void {
        const lt = this._layers[layerIndex];
        if (!lt) return;
        const wasIdle = lt.type === LayerTaskType.Idle;
        let dirty = false;
        if (lt.type !== LayerTaskType.Normal) { lt.type = LayerTaskType.Normal; dirty = true; }
        if (lt.state !== state) { lt.state = state; dirty = true; }
        if (lt.destState !== null) { lt.destState = null; dirty = true; }
        if (lt.weight !== weight) { lt.weight = weight; dirty = true; }
        lt.playState = playState;
        lt.crossPlayState = null;
        lt.crossWeight = 0;

        if (wasIdle) this._activeLayerCount++;
        if (dirty) this._markDirty();
        this._syncListMembership(true);
    }

    submitLayerCross(
        layerIndex: number,
        srcState: AnimatorState,
        srcPlayState: AnimatorPlayState,
        destState: AnimatorState,
        destPlayState: AnimatorPlayState,
        crossWeight: number
    ): void {
        const lt = this._layers[layerIndex];
        if (!lt) return;
        const wasIdle = lt.type === LayerTaskType.Idle;
        let dirty = false;
        if (lt.type !== LayerTaskType.Cross) { lt.type = LayerTaskType.Cross; dirty = true; }
        if (lt.state !== srcState) { lt.state = srcState; dirty = true; }
        if (lt.destState !== destState) { lt.destState = destState; dirty = true; }
        // weight 在 cross 流程不参与（从 controllerLayer.defaultWeight 推），保持上一次值，不进入脏判定
        lt.playState = srcPlayState;
        lt.crossPlayState = destPlayState;
        lt.crossWeight = crossWeight;

        if (wasIdle) this._activeLayerCount++;
        if (dirty) this._markDirty();
        this._syncListMembership(true);
    }

    submitLayerFixedCross(
        layerIndex: number,
        destState: AnimatorState,
        destPlayState: AnimatorPlayState,
        crossWeight: number
    ): void {
        const lt = this._layers[layerIndex];
        if (!lt) return;
        const wasIdle = lt.type === LayerTaskType.Idle;
        let dirty = false;
        if (lt.type !== LayerTaskType.FixedCross) { lt.type = LayerTaskType.FixedCross; dirty = true; }
        if (lt.state !== null) { lt.state = null; dirty = true; }
        if (lt.destState !== destState) { lt.destState = destState; dirty = true; }
        lt.playState = null;
        lt.crossPlayState = destPlayState;
        lt.crossWeight = crossWeight;

        if (wasIdle) this._activeLayerCount++;
        if (dirty) this._markDirty();
        this._syncListMembership(true);
    }

    /** @internal flush 末尾调用：清 dirty 标志，slot 仍留在 activeList。 */
    _clearDirty(): void {
        this._inDirty = false;
    }

    private _markDirty(): void {
        if (!this._inDirty) {
            this._dirtyList.add(this);
            this._inDirty = true;
        }
    }

    private _syncListMembership(active: boolean): void {
        if (active && !this._inActive) {
            this._activeList.add(this);
            this._inActive = true;
        } else if (!active && this._inActive) {
            this._activeList.remove(this);
            this._inActive = false;
        }
    }
}
