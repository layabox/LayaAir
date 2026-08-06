import { FastSinglelist } from "../../../../utils/SingletonList";
import { Transform3D, IAnimatorTransformEventCollector } from "../../../core/Transform3D";
import { AnimatorState } from "../AnimatorState";
import { KeyframeNodeOwner } from "../KeyframeNodeOwner";
import { AnimatorBindContext } from "./AnimatorBindContext";
import { isTransformType } from "./isTransformType";
import { LayerTaskType, TaskSlot } from "./TaskSlot";

interface EventBuffer {
    frame: number;
    transforms: FastSinglelist<Transform3D>;
    flags: FastSinglelist<number>;
}

/** 所有 dispatcher 共用通知序号，避免 Transform 跨 Scene/Factory 后帧号碰撞。 */
let _notifyFrame: number = 0;

/**
 * @internal Web/Native 共用的 Animator Transform 事件事务。
 * Web 在原标脏遍历中直接收集；Native 在回写后从动画根递归收集；最终统一快照派发。
 */
export class AnimatorTransformEventDispatcher implements IAnimatorTransformEventCollector {
    private readonly _stateTransformOwnersCache: WeakMap<AnimatorState, FastSinglelist<Transform3D>> = new WeakMap();
    private readonly _nodeOwnersStateMap: WeakMap<KeyframeNodeOwner[], AnimatorState> = new WeakMap();
    private readonly _buffers: EventBuffer[] = [{ frame: 0, transforms: new FastSinglelist<Transform3D>(), flags: new FastSinglelist<number>() }];
    /** 纯 Web 路径直接在置脏遍历中收集，不创建 Native 子树扫描缓存。 */
    private _trackStateOwners: boolean = false;
    private _depth: number = 0;

    registerState(state: AnimatorState): void {
        if (!this._trackStateOwners) return;
        this._nodeOwnersStateMap.set(state._nodeOwners, state);
        this.rebuildState(state);
    }

    rebuildContext(ctx: AnimatorBindContext): void {
        if (!this._trackStateOwners) return;
        const layers = ctx.layers;
        for (let i = 0, n = layers.length; i < n; i++) {
            const states = layers[i]._states;
            for (let j = 0, m = states.length; j < m; j++)
                this.registerState(states[j]);
        }
    }

    rebuildByNodeOwners(nodeOwners: KeyframeNodeOwner[]): void {
        if (!this._trackStateOwners) return;
        const state = this._nodeOwnersStateMap.get(nodeOwners);
        if (state) this.rebuildState(state);
    }

    rebuildState(state: AnimatorState): void {
        const owners = state._nodeOwners;
        const seen = new Set<Transform3D>();
        let transforms = this._stateTransformOwnersCache.get(state);
        if (transforms) transforms.clear();
        else transforms = new FastSinglelist<Transform3D>();
        for (let i = 0, n = owners.length; i < n; i++) {
            const owner = owners[i];
            if (!owner || !isTransformType(owner.type)) continue;
            const transform = owner.propertyOwner as Transform3D;
            if (transform && !seen.has(transform)) {
                seen.add(transform);
                transforms.add(transform);
            }
        }
        this._stateTransformOwnersCache.set(state, transforms);
    }

    begin(): void {
        const buffer = this._getBuffer();
        buffer.frame = ++_notifyFrame;
        buffer.transforms.clear();
        buffer.flags.clear();
    }

    abort(): void {
        const buffer = this._getBuffer();
        buffer.transforms.clear();
        buffer.flags.clear();
    }

    _addAnimatorTransformEvent(transform: Transform3D, changeFlag: number): void {
        const buffer = this._getBuffer();
        if (transform._lastAnimatorNotifyFrame === buffer.frame) {
            const index = transform._animatorNotifyIndex;
            if (index >= 0) {
                buffer.flags.elements[index] |= changeFlag;
                return;
            }
        } else {
            transform._lastAnimatorNotifyFrame = buffer.frame;
        }
        transform._animatorNotifyIndex = buffer.transforms.length;
        buffer.transforms.add(transform);
        buffer.flags.add(changeFlag);
    }

    /** Native 回写完成后，从 active state 的动画根收集并派发。 */
    notifyActiveSlots(activeList: FastSinglelist<TaskSlot>): void {
        if (activeList.length === 0) return;
        this._trackStateOwners = true;
        this.begin();
        const buffer = this._getBuffer();
        const slots = activeList.elements;
        for (let i = 0, n = activeList.length; i < n; i++) {
            const layers = slots[i]._layers;
            for (let j = 0, m = layers.length; j < m; j++) {
                const layer = layers[j];
                if (layer.type === LayerTaskType.Idle) continue;
                if (layer.state) this._collectStateSubtrees(layer.state, buffer);
                if (layer.destState) this._collectStateSubtrees(layer.destState, buffer);
            }
        }
        this.flush();
    }

    flush(): void {
        const buffer = this._getBuffer();
        this._depth++;
        try {
            for (let i = 0, n = buffer.transforms.length; i < n; i++)
                buffer.transforms.elements[i]._dispatchAnimatorTransformChanged(buffer.flags.elements[i]);
        } finally {
            this._depth--;
            buffer.transforms.clear();
            buffer.flags.clear();
        }
    }

    private _collectStateSubtrees(state: AnimatorState, buffer: EventBuffer): void {
        let owners = this._stateTransformOwnersCache.get(state);
        if (!owners) {
            this.registerState(state);
            owners = this._stateTransformOwnersCache.get(state)!;
        }
        for (let i = 0, n = owners.length; i < n; i++)
            this._collectSubtree(owners.elements[i], buffer);
    }

    private _collectSubtree(transform: Transform3D, buffer: EventBuffer): void {
        if (transform._lastAnimatorNotifyFrame === buffer.frame) return;
        transform._lastAnimatorNotifyFrame = buffer.frame;
        transform._animatorNotifyIndex = -1;
        if (transform._hasTransformChangedListener) {
            transform._animatorNotifyIndex = buffer.transforms.length;
            buffer.transforms.add(transform);
            buffer.flags.add(transform._getAnimatorTransformChangeFlag());
        }
        const children = transform._children;
        if (children) for (let i = 0, n = children.length; i < n; i++)
            this._collectSubtree(children[i], buffer);
    }

    private _getBuffer(): EventBuffer {
        let buffer = this._buffers[this._depth];
        if (!buffer) {
            buffer = { frame: 0, transforms: new FastSinglelist<Transform3D>(), flags: new FastSinglelist<number>() };
            this._buffers[this._depth] = buffer;
        }
        return buffer;
    }
}
