import { Sprite3D } from "../../../../core/Sprite3D";
import { Transform3D } from "../../../../core/Transform3D";
import { KeyframeNode } from "../../../../animation/KeyframeNode";
import { FastSinglelist } from "../../../../../utils/SingletonList";
import { IAnimatorFactory } from "../IAnimatorFactory";
import { AnimatorBindContext } from "../AnimatorBindContext";
import { AnimatorState } from "../../AnimatorState";
import { KeyframeNodeOwner } from "../../KeyframeNodeOwner";
import { ITaskSlot, LayerTaskType, TaskSlot } from "../TaskSlot";
import { WebAnimatorEvaluator } from "./WebAnimatorEvaluator";
import { WebAnimatorApplier, WebAnimatorApplierScope } from "./WebAnimatorApplier";
import * as Preparer from "./WebAnimatorPreparer";
import { PlainOwnerData, registerOwnerDataCreator } from "../data/IAnimatorData";
import { AnimatorTransformEventDispatcher } from "../AnimatorTransformEventDispatcher";

/**
 * IAnimatorFactory 的 Web 默认实现，每 Scene3D 一个实例。
 *
 * 组合 evaluator / applier 两个 helper（preparer 是 module-level functions，无 instance）。
 * Slot 模型：bindAnimator 分配 TaskSlot；flushEvaluate / flushApply 遍历 activeList 全量；flushApply 末尾清 dirtyList。
 */
export class WebAnimatorFactory implements IAnimatorFactory {
    /** @internal */
    _evaluator: WebAnimatorEvaluator = new WebAnimatorEvaluator();
    /** @internal */
    _applier: WebAnimatorApplier = new WebAnimatorApplier();

    /** @internal */
    _activeList: FastSinglelist<TaskSlot> = new FastSinglelist();
    /** @internal */
    _dirtyList: FastSinglelist<TaskSlot> = new FastSinglelist();

    private readonly _slotMap: WeakMap<AnimatorBindContext, TaskSlot> = new WeakMap();
    private readonly _transformEventDispatcher: AnimatorTransformEventDispatcher = new AnimatorTransformEventDispatcher();

    constructor() {
        // KeyframeNodeOwner 在 preparer 里 new，没有 factory 引用，靠 module-level register 注入。
        // Web 用 plain；RT 在自己 ctor 里 register 覆盖。
        registerOwnerDataCreator(() => new PlainOwnerData());
    }

    // ==================== 数据准备 ====================

    bindAnimator(ctx: AnimatorBindContext): ITaskSlot {
        let slot = this._slotMap.get(ctx);
        if (!slot) {
            slot = new TaskSlot(ctx, this._activeList, this._dirtyList);
            slot.resizeLayers(ctx.layers.length);
            this._slotMap.set(ctx, slot);
        }
        return slot;
    }

    unbindAnimator(ctx: AnimatorBindContext): void {
        const slot = this._slotMap.get(ctx);
        if (!slot) return;
        if (slot._inActive) {
            this._activeList.remove(slot);
            slot._inActive = false;
        }
        if (slot._inDirty) {
            this._dirtyList.remove(slot);
            slot._inDirty = false;
        }
        this._slotMap.delete(ctx);
    }

    prepareStateOwners(ctx: AnimatorBindContext, state: AnimatorState): void {
        Preparer.prepareStateOwners(ctx, state);
        this._transformEventDispatcher.registerState(state);
    }

    handleSpriteOwnersBySprite(ctx: AnimatorBindContext, isLink: boolean, path: string[], sprite: Sprite3D): void {
        Preparer.handleSpriteOwnersBySprite(ctx, isLink, path, sprite);
        this._transformEventDispatcher.rebuildContext(ctx);
    }

    addKeyframeNodeOwner(ctx: AnimatorBindContext, clipOwners: KeyframeNodeOwner[], node: KeyframeNode, propertyOwner: any): void {
        Preparer.addKeyframeNodeOwner(ctx, clipOwners, node, propertyOwner);
        this._transformEventDispatcher.rebuildByNodeOwners(clipOwners);
    }

    removeKeyframeNodeOwner(ctx: AnimatorBindContext, nodeOwners: (KeyframeNodeOwner | null)[], node: KeyframeNode): void {
        Preparer.removeKeyframeNodeOwner(ctx, nodeOwners, node);
        this._transformEventDispatcher.rebuildByNodeOwners(nodeOwners as KeyframeNodeOwner[]);
    }

    // ==================== 一帧两阶段批处理 ====================

    /** 遍历 activeList 全量调 evaluator.evaluateLayer。 */
    flushEvaluate(): void {
        const slots = this._activeList.elements;
        const evaluator = this._evaluator;
        for (let i = 0, n = this._activeList.length; i < n; i++) {
            const slot = slots[i];
            const layers = slot._layers;
            const ctlLayers = slot._ctx.layers;
            for (let j = 0, m = layers.length; j < m; j++) {
                const lt = layers[j];
                if (lt.type !== LayerTaskType.Idle) {
                    evaluator.evaluateLayer(lt, ctlLayers[j]);
                }
            }
        }
    }

    /** 遍历 activeList，按 LayerTask.type 分派当前 scope 的回写。 */
    private _flushApplyScope(scope: WebAnimatorApplierScope): void {
        const slots = this._activeList.elements;
        const applier = this._applier;
        for (let i = 0, n = this._activeList.length; i < n; i++) {
            const slot = slots[i];
            const layers = slot._layers;
            const ctlLayers = slot._ctx.layers;
            const updateMark = slot._updateMark;
            for (let j = 0, m = layers.length; j < m; j++) {
                const lt = layers[j];
                if (lt.type === LayerTaskType.Idle) continue;
                const cl = ctlLayers[j];
                const isFirstLayer = j === 0;
                switch (lt.type) {
                    case LayerTaskType.Normal:
                        applier.applyNormal(lt, cl, isFirstLayer, updateMark, scope);
                        break;
                    case LayerTaskType.Cross:
                        applier.applyCross(lt, cl, isFirstLayer, updateMark, scope);
                        break;
                    case LayerTaskType.FixedCross:
                        applier.applyFixedCross(lt, cl, isFirstLayer, updateMark, scope);
                        break;
                }
            }
        }
    }

    /**
     * Web 先批量回写全部 Transform，关闭 batch 后统一派发事件，再处理非 Transform 属性。
     * RT 复用实例的 scope 为 non-transform-only，保持单阶段处理。
     */
    flushApply(): void {
        const applier = this._applier;
        const originalScope = applier._scope;
        if (originalScope !== 'all') {
            this._flushApplyScope(originalScope);
            this._clearDirty();
            return;
        }

        const eventDispatcher = this._transformEventDispatcher;
        let transformApplyCompleted = false;
        eventDispatcher.begin();
        Transform3D._beginAnimatorBatch(eventDispatcher);
        try {
            this._flushApplyScope('transform-only');
            transformApplyCompleted = true;
        } finally {
            Transform3D._endAnimatorBatch();
            if (!transformApplyCompleted) eventDispatcher.abort();
        }

        eventDispatcher.flush();

        this._flushApplyScope('non-transform-only');
        this._clearDirty();
    }

    /**
     * @internal Web/Native 共用的 Animator Transform 事件提交点。
     * 先完整收集节点与 flag 快照，再派发事件，避免回调修改层级或读取缓存影响后续通知。
     */
    _notifyAnimatorTransformChanged(): void {
        this._transformEventDispatcher.notifyActiveSlots(this._activeList);
    }

    private _clearDirty(): void {
        const slots = this._dirtyList.elements;
        for (let i = 0, n = this._dirtyList.length; i < n; i++) {
            slots[i]._clearDirty();
        }
        this._dirtyList.clear();
    }

    // ==================== 冷路径 ====================

    updateDefaultValues(owners: KeyframeNodeOwner[]): void {
        this._applier.updateDefaultValues(owners);
    }

    revertDefaultKeyframeNodes(state: AnimatorState): void {
        this._applier.revertDefaultKeyframeNodes(state);
    }

    destroy(): void {
        this._activeList.clear();
        this._dirtyList.clear();
    }
}
