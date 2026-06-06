import { Sprite3D } from "../../../../core/Sprite3D";
import { KeyframeNode } from "../../../../animation/KeyframeNode";
import { AnimationClip } from "../../../../animation/AnimationClip";
import { IAnimatorFactory } from "../IAnimatorFactory";
import { AnimatorBindContext } from "../AnimatorBindContext";
import { AnimatorState } from "../../AnimatorState";
import { AnimatorControllerLayer } from "../../AnimatorControllerLayer";
import { AvatarMask } from "../../AvatarMask";
import { KeyFrameValueType, KeyframeNodeOwner } from "../../KeyframeNodeOwner";
import { ITaskSlot, LayerTaskType, TaskSlot } from "../TaskSlot";
import { WebAnimatorFactory } from "../web/WebAnimatorFactory";
import { isTransformType } from "../isTransformType";
import { IOwnerData, PlainOwnerData, registerOwnerDataCreator, registerClipDestroyCallback } from "../data/IAnimatorData";
import { RTBatchSyncBuffer } from "./RTBatchSyncBuffer";
import { Event } from "../../../../../events/Event";
import { Laya } from "../../../../../../Laya";
import { AnimatorManager } from "../../manager/AnimatorManager";

/**
 * Native 句柄分配器：连续整数 ID + LIFO free-list 回收。
 * alloc 出来的 ID 始终密集、有界，native 侧直接拿它当 vector 下标。0 保留作"未分配"。
 */
class IdPool {
    private _next = 0;
    private readonly _free: number[] = [];
    alloc(): number {
        return this._free.length > 0 ? this._free.pop()! : ++this._next;
    }
    free(id: number): void {
        if (id > 0) this._free.push(id);
    }
}

type RTHandleKind = "slot" | "owner" | "binding" | "clip";
const rtSlotPool = new IdPool();
const rtOwnerPool = new IdPool();
const rtBindingPool = new IdPool();
const rtClipPool = new IdPool();

const rtLiveHandles: Record<RTHandleKind, Map<number, number>> = {
    slot: new Map(),
    owner: new Map(),
    binding: new Map(),
    clip: new Map()
};
let rtFactoryIdSeed = 0;

function markRTHandle(kind: RTHandleKind, handle: number, factoryId: number): void {
    const owners = rtLiveHandles[kind];
    const current = owners.get(handle);
    if (current !== undefined && current !== factoryId) {
        console.warn(`[RTAnimatorFactory] ${kind} handle collision: handle=${handle}, ownerFactory=${current}, newFactory=${factoryId}`);
    }
    owners.set(handle, factoryId);
}

function unmarkRTHandle(kind: RTHandleKind, handle: number, factoryId: number): void {
    const owners = rtLiveHandles[kind];
    const current = owners.get(handle);
    if (current !== undefined && current !== factoryId) {
        console.warn(`[RTAnimatorFactory] ${kind} handle release mismatch: handle=${handle}, ownerFactory=${current}, releaseFactory=${factoryId}`);
    }
    owners.delete(handle);
}

/**
 * IAnimatorFactory 的 Native 后端。每 Scene3D 一个实例。
 * Native 启动时通过 `AnimatorManager.factoryCreator = () => new RTAnimatorFactory()` 接管默认工厂。
 *
 * Preparer / Evaluator / Applier 三个 conch 全局类按存在性独立嗅探，任一缺失对应职责降级到内嵌 WebAnimatorFactory。
 * 每帧热路径：flushEvaluate 把 active slot × layer 状态写入预分配 ArrayBuffer，单次 syncBatch 跨界。
 */
export class RTAnimatorFactory implements IAnimatorFactory {
    private readonly _factoryId: number = ++rtFactoryIdSeed;
    private readonly _web: WebAnimatorFactory;
    private readonly _nativePreparer: any;
    private readonly _nativeEvaluator: any;
    private readonly _nativeApplier: any;

    /** Native 句柄分配器（连续 ID + LIFO 回收）；ID 即 native 侧 vector 下标，0 保留作"未分配"。 */
    private readonly _slotPool = rtSlotPool;
    private readonly _ownerPool = rtOwnerPool;
    private readonly _bindingPool = rtBindingPool;
    private readonly _clipPool = rtClipPool;

    private readonly _slotHandles: Set<number> = new Set();
    private readonly _ownerHandleSet: Set<number> = new Set();
    private readonly _bindingHandles: Set<number> = new Set();
    private readonly _clipHandles: Set<number> = new Set();

    /** ctx → slotHandle，unbind 时 release 用。 */
    private readonly _ctxToSlotHandle: WeakMap<AnimatorBindContext, number> = new WeakMap();
    /** AnimationClip._id → native 侧密集 clipHandle；兼做去重，由 registerClipDestroyCallback 清理。 */
    private readonly _clipHandleMap: Map<number, number> = new Map();
    /** owner → ownerHandle，去重 + binding 收集 + release 用。 */
    private readonly _ownerHandles: WeakMap<KeyframeNodeOwner, number> = new WeakMap();
    /** ctx → (state → bindingId)，做 (ctx, state) → binding 的去重。 */
    private readonly _bindingMap: WeakMap<AnimatorBindContext, Map<AnimatorState, number>> = new WeakMap();
    /** state → 所有它出现过的 bindingId（反向索引），revertDefaultKeyframeNodes 用。 */
    private readonly _stateBindings: WeakMap<AnimatorState, Set<number>> = new WeakMap();

    /** Transform backend 嗅探结果。LayaX → 'layax'；OpenGLES → 'jsrt'；缺失则跳过 transform 绑定。 */
    private readonly _transformBackend: 'layax' | 'jsrt' | null;

    /** state → 该 state 内 Transform-typed owner 的 propertyOwner 去重列表，_notifyJsTransformChanged 每帧消费。 */
    private readonly _statePropertyOwnersCache: WeakMap<AnimatorState, any[]> = new WeakMap();
    /** _notifyJsTransformChanged 的帧序号，每次调用自增；与 transform 上的 _notifyFrame 比对做整数去重。 */
    private _notifyFrame: number = 0;

    /** 批量同步 buffer，仅在 _nativeEvaluator 存在时初始化。 */
    private _syncBuffer: RTBatchSyncBuffer | null = null;
    private _unregisterClipDestroyCallback: (() => void) | null = null;
    private _destroyed: boolean = false;

    /**
     * 初始化 RT 工厂。
     * 步骤：
     *   1) new 内嵌 WebAnimatorFactory 作为 non-transform 类的兜底；
     *   2) 嗅探 conch 三件套（Preparer/Evaluator/Applier），任一存在则把 web 对应组件 scope
     *      切到 'non-transform-only' 避免双写；缺失则保留 null；
     *   3) 注册 IOwnerData creator（native proxy 优先，否则 PlainOwnerData）；
     *   4) 嗅探 Transform backend（LayaX / JSRT）；
     *   5) 注册 clip 销毁回调，释放 native ClipTable；
     *   6) 若 evaluator 存在则创建 RTBatchSyncBuffer。
     */
    constructor() {
        this._web = new WebAnimatorFactory();

        const preparerCtor: any = (window as any).conchRTAnimatorPreparer;
        if (typeof preparerCtor === "function") {
            this._nativePreparer = new preparerCtor();
        } else {
            console.warn("[RTAnimatorFactory] window.conchRTAnimatorPreparer not implemented; falling back to Web.");
            this._nativePreparer = null;
        }

        const evaluatorCtor: any = (window as any).conchRTAnimatorEvaluator;
        if (typeof evaluatorCtor === "function") {
            this._nativeEvaluator = new evaluatorCtor();
        } else {
            console.warn("[RTAnimatorFactory] window.conchRTAnimatorEvaluator not implemented; falling back to Web.");
            this._nativeEvaluator = null;
        }

        const applierCtor: any = (window as any).conchRTAnimatorApplier;
        if (typeof applierCtor === "function") {
            this._nativeApplier = new applierCtor();
        } else {
            console.warn("[RTAnimatorFactory] window.conchRTAnimatorApplier not implemented; falling back to Web.");
            this._nativeApplier = null;
        }

        const ownerDataCtor: any = (window as any).conchRTAnimatorOwnerData;
        if (typeof ownerDataCtor === "function") {
            registerOwnerDataCreator(() => new ownerDataCtor() as IOwnerData);
        } else {
            registerOwnerDataCreator(() => new PlainOwnerData());
        }

        if ((window as any).conchLayaXTransform) this._transformBackend = 'layax';
        else if ((window as any).conchRTTransform) this._transformBackend = 'jsrt';
        else this._transformBackend = null;

        if (this._nativeEvaluator) this._web._evaluator._scope = 'non-transform-only';
        if (this._nativeApplier) this._web._applier._scope = 'non-transform-only';

        this._unregisterClipDestroyCallback = registerClipDestroyCallback((clipId) => {
            this._releaseClipById(clipId);
        });

        if (this._nativeEvaluator) {
            this._syncBuffer = new RTBatchSyncBuffer(this._nativeEvaluator);
        }
    }

    // ==================== 数据准备 ====================

    /**
     * Animator 启用时分配 TaskSlot；如有 native preparer 则同步在 native 端 SlotTable 建条目。
     * 步骤：
     *   1) Web 端 bindAnimator 拿到/复用 TaskSlot；
     *   2) 若 preparer 存在且 ctx 还没分配 slotHandle：自增分配、记入 _ctxToSlotHandle、
     *      通知 native uploadSlot + 首次 resizeSlot；
     *   3) 注入 _onResize 钩子，让后续 layer 数量变化也同步 native。
     */
    bindAnimator(ctx: AnimatorBindContext): ITaskSlot {
        const slot = this._web.bindAnimator(ctx) as TaskSlot;

        if (this._nativePreparer && !this._ctxToSlotHandle.has(ctx)) {
            const slotHandle = this._slotPool.alloc();
            this._ctxToSlotHandle.set(ctx, slotHandle);
            this._slotHandles.add(slotHandle);
            markRTHandle("slot", slotHandle, this._factoryId);
            slot._slotHandle = slotHandle;
            this._nativePreparer.uploadSlot(slotHandle);
            this._nativePreparer.resizeSlot(slotHandle, ctx.layers.length);
            slot._onResize = (count: number) => {
                this._nativePreparer.resizeSlot(slotHandle, count);
            };
        }
        return slot;
    }

    /**
     * Animator 销毁时清理 native 资源 + Web slot。
     * 步骤：释放 (ctx, *) 下所有 binding/owner → release native slot → web 解绑 → 清 ctx 注册。
     */
    unbindAnimator(ctx: AnimatorBindContext): void {
        const slotHandle = this._ctxToSlotHandle.get(ctx);
        if (this._nativePreparer && slotHandle !== undefined) {
            const stateMap = this._bindingMap.get(ctx);
            if (stateMap) {
                for (const [state, bindingId] of stateMap) {
                    this._releaseBinding(bindingId, state);
                }
                this._bindingMap.delete(ctx);
            }

            for (const owner of ctx.owners.slice()) this._releaseOwner(owner);
            ctx.owners.length = 0;
            for (const key in ctx.ownerMap) delete ctx.ownerMap[key];

            this._releaseSlot(slotHandle);
            this._ctxToSlotHandle.delete(ctx);
        }
        this._web.unbindAnimator(ctx);
    }

    /**
     * 为 state 解析 KeyframeNodeOwner + 同步 native 资源。
     * 步骤：
     *   1) Web 端 prepareStateOwners 填好 state._nodeOwners；
     *   2) 若 preparer 存在：上传 clip → 把 Transform 类 owner 补传 native → 建立 (ctx,state) 的 binding；
     *   3) 若 applier 存在：重建该 state 的 propertyOwners 缓存（_notifyJsTransformChanged 用）。
     */
    prepareStateOwners(ctx: AnimatorBindContext, state: AnimatorState): void {
        this._web.prepareStateOwners(ctx, state);

        const clip = (state as any)._clip as AnimationClip | null;
        if (!clip) return;

        if (this._nativePreparer) {
            const clipHandle = this._ensureClipUploaded(clip);
            this._syncOwnersToNative(ctx, state);
            this._ensureBindingUploaded(ctx, state, clipHandle);
        }
        if (this._nativeApplier) {
            this._rebuildStateTransformPropertyOwners(state);
        }
    }

    /** 把 state._nodeOwners 内所有 Transform 类 owner 首次同步给 native（按 owner 实例去重）。 */
    private _syncOwnersToNative(_ctx: AnimatorBindContext, state: AnimatorState): void {
        const owners = (state as any)._nodeOwners as KeyframeNodeOwner[] | undefined;
        if (!owners) return;

        for (let i = 0; i < owners.length; i++) {
            const owner = owners[i];
            if (!owner) continue;
            if (!isTransformType(owner.type)) continue;
            if (this._ownerHandles.has(owner)) continue;

            const ownerHandle = this._ownerPool.alloc();
            this._ownerHandles.set(owner, ownerHandle);
            this._ownerHandleSet.add(ownerHandle);
            markRTHandle("owner", ownerHandle, this._factoryId);
            this._uploadOwner(ownerHandle, owner, owner.propertyOwner);
        }
    }

    /**
     * 为 (ctx, state) 在 native BindingTable 建一项，clip 与相关 owner 必须已上传。
     * 步骤：分配 bindingId → 写入 _bindingMap + _stateBindings 反向索引 → 按 _nodeOwners 顺序
     * 收集 ownerHandle Uint32Array → 调 native uploadBinding（与 clip.nodes 顺序对齐）。
     */
    private _ensureBindingUploaded(ctx: AnimatorBindContext, state: AnimatorState, clipHandle: number): void {
        let stateMap = this._bindingMap.get(ctx);
        if (!stateMap) { stateMap = new Map(); this._bindingMap.set(ctx, stateMap); }
        if (stateMap.has(state)) return;

        const owners = (state as any)._nodeOwners as (KeyframeNodeOwner | null)[] | undefined;
        if (!owners) return;

        const bindingId = this._bindingPool.alloc();
        stateMap.set(state, bindingId);
        this._bindingHandles.add(bindingId);
        markRTHandle("binding", bindingId, this._factoryId);

        let stateBindings = this._stateBindings.get(state);
        if (!stateBindings) { stateBindings = new Set(); this._stateBindings.set(state, stateBindings); }
        stateBindings.add(bindingId);

        const handles = new Uint32Array(owners.length);
        for (let i = 0; i < owners.length; i++) {
            const o = owners[i];
            handles[i] = (o && this._ownerHandles.get(o)) ?? 0;
        }
        this._nativePreparer.uploadBinding(bindingId, clipHandle, handles);

        // per-layer AvatarMask 绑定时一次性下发（不进逐帧同步），运行时变更走 refreshLayerMask。
        const avatarMask = this._findLayerAvatarMask(ctx, state);
        this._nativePreparer.uploadBindingMask(bindingId, this._buildBindingMaskBytes(owners, avatarMask));
    }

    /** 按 layer.avatarMask 算 per-curve mask 字节（与 ownerHandles 同序，1=激活 0=遮罩，无 mask 全 1）。 */
    private _buildBindingMaskBytes(owners: (KeyframeNodeOwner | null)[], avatarMask: AvatarMask | null): Uint8Array {
        const mask = new Uint8Array(owners.length);
        for (let i = 0; i < owners.length; i++) {
            if (!avatarMask) { mask[i] = 1; continue; }
            const o = owners[i];
            mask[i] = (o && o.nodePath != null && avatarMask.getTransformActive(o.nodePath)) ? 1 : 0;
        }
        return mask;
    }

    /** 反查 state 所属 layer 的 avatarMask（无则 null）。 */
    private _findLayerAvatarMask(ctx: AnimatorBindContext, state: AnimatorState): AvatarMask | null {
        const layers = ctx.layers;
        for (let i = 0, n = layers.length; i < n; i++) {
            if (layers[i]._states.indexOf(state) >= 0) return layers[i].avatarMask ?? null;
        }
        return null;
    }

    /**
     * 首次见到 clip 时把整张曲线表序列化到 native；按 clip._id 去重，相同 clip 跳过。
     * 步骤：beginUploadClip 写 clip header → 逐 curve 调 _uploadCurve（细粒度协议，避免 ArrayBuffer 编码）。
     */
    private _ensureClipUploaded(clip: AnimationClip): number {
        const existing = this._clipHandleMap.get(clip._id);
        if (existing !== undefined) return existing;

        const clipHandle = this._clipPool.alloc();
        this._clipHandleMap.set(clip._id, clipHandle);
        this._clipHandles.add(clipHandle);
        markRTHandle("clip", clipHandle, this._factoryId);

        const np = this._nativePreparer;
        const nodes = clip._nodes;
        const nodeCount = nodes ? nodes.count : 0;

        np.beginUploadClip(
            clipHandle,
            (clip as any)._duration ?? 0,
            (clip as any)._frameRate ?? 0,
            clip.islooping,
            nodeCount
        );

        if (nodes) {
            for (let i = 0; i < nodeCount; i++) {
                this._uploadCurve(clipHandle, i, nodes.getNodeByIndex(i));
            }
        }
        return clipHandle;
    }

    /** 把一条 KeyframeNode 序列化到 native：先 uploadCurveHeader，再逐 keyframe 上传。 */
    private _uploadCurve(clipHandle: number, curveIdx: number, node: KeyframeNode): void {
        const np = this._nativePreparer;
        const nodePath = node._joinOwnerPath('/');
        const propertyPath = node._joinProperty('/');
        const frameCount = node.keyFramesCount;

        // Float/Boolean 类型没有 weightedMode，hasWeighted 恒 false；其他类型看首帧是否带
        let hasWeighted = false;
        if (frameCount > 0) {
            const first: any = node.getKeyframeByIndex(0);
            hasWeighted = first && first.weightedMode != null;
        }

        np.uploadCurveHeader(clipHandle, curveIdx, node.type, nodePath, propertyPath, frameCount, hasWeighted);

        for (let f = 0; f < frameCount; f++) {
            this._uploadKeyframe(clipHandle, curveIdx, f, node.type, node.getKeyframeByIndex(f), hasWeighted);
        }
    }

    /** 按 KeyFrameValueType 选 uploadKf* 变体，把单个 keyframe 推给 native；不支持的类型跳过。 */
    private _uploadKeyframe(
        clipHandle: number, curveIdx: number, frameIdx: number,
        type: KeyFrameValueType, kf: any, hasWeighted: boolean
    ): void {
        const np = this._nativePreparer;
        switch (type) {
            case KeyFrameValueType.Float:
            case KeyFrameValueType.Boolean:
                np.uploadKfFloat(
                    clipHandle, curveIdx, frameIdx,
                    kf.time, kf.value ?? 0,
                    kf.inTangent ?? 0, kf.outTangent ?? 0,
                    kf.weightedMode ?? 0,
                    kf.inWeight ?? 0.33333, kf.outWeight ?? 0.33333
                );
                break;
            case KeyFrameValueType.Vector2: {
                const v = kf.value, it = kf.inTangent, ot = kf.outTangent;
                np.uploadKfV2(
                    clipHandle, curveIdx, frameIdx, kf.time,
                    v.x, v.y, it.x, it.y, ot.x, ot.y
                );
                if (hasWeighted && kf.weightedMode) {
                    const iw = kf.inWeight, ow = kf.outWeight, wm = kf.weightedMode;
                    np.uploadKfV2Weight(
                        clipHandle, curveIdx, frameIdx,
                        iw.x, iw.y, ow.x, ow.y, wm.x, wm.y
                    );
                }
                break;
            }
            case KeyFrameValueType.Position:
            case KeyFrameValueType.Scale:
            case KeyFrameValueType.RotationEuler:
            case KeyFrameValueType.Vector3: {
                const v = kf.value, it = kf.inTangent, ot = kf.outTangent;
                np.uploadKfV3(
                    clipHandle, curveIdx, frameIdx, kf.time,
                    v.x, v.y, v.z, it.x, it.y, it.z, ot.x, ot.y, ot.z
                );
                if (hasWeighted && kf.weightedMode) {
                    const iw = kf.inWeight, ow = kf.outWeight, wm = kf.weightedMode;
                    np.uploadKfV3Weight(
                        clipHandle, curveIdx, frameIdx,
                        iw.x, iw.y, iw.z, ow.x, ow.y, ow.z, wm.x, wm.y, wm.z
                    );
                }
                break;
            }
            case KeyFrameValueType.Vector4:
            case KeyFrameValueType.Color: {
                const v = kf.value, it = kf.inTangent, ot = kf.outTangent;
                np.uploadKfV4(
                    clipHandle, curveIdx, frameIdx, kf.time,
                    v.x, v.y, v.z, v.w,
                    it.x, it.y, it.z, it.w,
                    ot.x, ot.y, ot.z, ot.w
                );
                if (hasWeighted && kf.weightedMode) {
                    const iw = kf.inWeight, ow = kf.outWeight, wm = kf.weightedMode;
                    np.uploadKfV4Weight(
                        clipHandle, curveIdx, frameIdx,
                        iw.x, iw.y, iw.z, iw.w,
                        ow.x, ow.y, ow.z, ow.w,
                        wm.x, wm.y, wm.z, wm.w
                    );
                }
                break;
            }
            case KeyFrameValueType.Rotation: {
                const v = kf.value, it = kf.inTangent, ot = kf.outTangent;
                np.uploadKfQuat(
                    clipHandle, curveIdx, frameIdx, kf.time,
                    v.x, v.y, v.z, v.w,
                    it.x, it.y, it.z, it.w,
                    ot.x, ot.y, ot.z, ot.w
                );
                if (hasWeighted && kf.weightedMode) {
                    const iw = kf.inWeight, ow = kf.outWeight, wm = kf.weightedMode;
                    np.uploadKfQuatWeight(
                        clipHandle, curveIdx, frameIdx,
                        iw.x, iw.y, iw.z, iw.w,
                        ow.x, ow.y, ow.z, ow.w,
                        wm.x, wm.y, wm.z, wm.w
                    );
                }
                break;
            }
            default:
                // PathPoint / None / Boolean: native 不下沉，走 Web 兜底
                break;
        }
    }

    /**
     * sprite link/unlink 后同步 native owner 列表与 propertyOwners 缓存。
     * 步骤：Web 端处理 link/unlink → 遍历本 ctx 已建 binding 的所有 state，逐个补传新 owner / 重建缓存。
     */
    handleSpriteOwnersBySprite(ctx: AnimatorBindContext, isLink: boolean, path: string[], sprite: Sprite3D): void {
        this._web.handleSpriteOwnersBySprite(ctx, isLink, path, sprite);
        if (!this._nativePreparer && !this._nativeApplier) return;
        const stateMap = this._bindingMap.get(ctx);
        if (stateMap) {
            for (const state of stateMap.keys()) {
                if (this._nativePreparer) this._syncOwnersToNative(ctx, state);
                if (this._nativeApplier) this._rebuildStateTransformPropertyOwners(state);
            }
        }
    }

    /**
     * 增量绑定一个 KeyframeNodeOwner 到 (ctx, node)。
     * 步骤：Web 端建 owner → 仅 Transform 类型才走 native → ownerHandles 按实例去重 →
     * 首见时分配 ownerHandle，调 _uploadOwner 推送 native（header + transform 绑定 + defaultValue）。
     */
    addKeyframeNodeOwner(ctx: AnimatorBindContext, clipOwners: KeyframeNodeOwner[], node: KeyframeNode, propertyOwner: any): void {
        this._web.addKeyframeNodeOwner(ctx, clipOwners, node, propertyOwner);

        if (!this._nativePreparer) return;
        if (!isTransformType(node.type)) return;

        const owner = clipOwners[node._indexInList];
        if (!owner) return;
        if (this._ownerHandles.has(owner)) return;

        const ownerHandle = this._ownerPool.alloc();
        this._ownerHandles.set(owner, ownerHandle);
        this._ownerHandleSet.add(ownerHandle);
        markRTHandle("owner", ownerHandle, this._factoryId);
        this._uploadOwner(ownerHandle, owner, propertyOwner);
    }

    /** 推送 owner header + 绑 native transform 实例（_nativeObj）+ 按 type 同步 defaultValue。 */
    private _uploadOwner(ownerHandle: number, owner: KeyframeNodeOwner, propertyOwner: any): void {
        const np = this._nativePreparer;
        const nodePath = owner.nodePath ?? '';
        const propertyPath = (owner.property ?? []).join('/');

        np.uploadOwnerHeader(ownerHandle, owner.type, !!owner.maskActive, nodePath, propertyPath);

        // propertyOwner 是 LayaAir Transform3D JS 实例；native 实例挂在 ._nativeObj 上
        const nativeTransform = propertyOwner ? (propertyOwner as any)._nativeObj : null;
        if (nativeTransform && this._transformBackend === 'layax') {
            np.bindOwnerLayaXTransform(ownerHandle, nativeTransform);
        } else if (nativeTransform && this._transformBackend === 'jsrt') {
            np.bindOwnerJSRTTransform(ownerHandle, nativeTransform);
        }

        const def = owner.defaultValue;
        if (def == null) return;
        switch (owner.type) {
            case KeyFrameValueType.Position:
            case KeyFrameValueType.Scale:
            case KeyFrameValueType.RotationEuler:
                np.setOwnerDefaultV3(ownerHandle, def.x, def.y, def.z);
                break;
            case KeyFrameValueType.Rotation:
                np.setOwnerDefaultQuat(ownerHandle, def.x, def.y, def.z, def.w);
                break;
            default:
                break;
        }
    }

    /**
     * 移除 (ctx, node) 的 owner 绑定；refCount 归零时同步释放 native 资源。
     * 步骤：Web 端 decRef + 可能从 ownerMap 删除 → 仅 Transform 且 refCount==0 + 已分配 handle 才走
     * native 释放 → unbindOwnerTransform + releaseOwner + 清 _ownerHandles。
     */
    removeKeyframeNodeOwner(ctx: AnimatorBindContext, nodeOwners: (KeyframeNodeOwner | null)[], node: KeyframeNode): void {
        const fullPath = node.fullPath;
        const ownerBefore = ctx.ownerMap[fullPath];

        this._web.removeKeyframeNodeOwner(ctx, nodeOwners, node);

        if (!this._nativePreparer) return;
        if (!ownerBefore || !isTransformType(ownerBefore.type)) return;
        if (ownerBefore.referenceCount !== 0) return;

        const handle = this._ownerHandles.get(ownerBefore);
        if (handle !== undefined) this._releaseOwner(ownerBefore);
    }

    private _releaseSlot(slotHandle: number): void {
        if (!this._slotHandles.has(slotHandle)) return;
        this._nativePreparer?.releaseSlot(slotHandle);
        this._slotHandles.delete(slotHandle);
        unmarkRTHandle("slot", slotHandle, this._factoryId);
        this._slotPool.free(slotHandle);
    }

    private _releaseBinding(bindingId: number, state?: AnimatorState): void {
        if (!this._bindingHandles.has(bindingId)) return;
        this._nativePreparer?.releaseBinding(bindingId);
        this._bindingHandles.delete(bindingId);
        unmarkRTHandle("binding", bindingId, this._factoryId);
        this._bindingPool.free(bindingId);
        if (state) {
            const stateBindings = this._stateBindings.get(state);
            if (stateBindings) {
                stateBindings.delete(bindingId);
                if (stateBindings.size === 0) this._stateBindings.delete(state);
            }
        }
    }

    private _releaseOwner(owner: KeyframeNodeOwner): void {
        const handle = this._ownerHandles.get(owner);
        if (handle === undefined) return;
        this._ownerHandles.delete(owner);
        this._releaseOwnerHandle(handle);
    }

    private _releaseOwnerHandle(ownerHandle: number): void {
        if (!this._ownerHandleSet.has(ownerHandle)) return;
        this._nativePreparer?.unbindOwnerTransform(ownerHandle);
        this._nativePreparer?.releaseOwner(ownerHandle);
        this._ownerHandleSet.delete(ownerHandle);
        unmarkRTHandle("owner", ownerHandle, this._factoryId);
        this._ownerPool.free(ownerHandle);
    }

    private _releaseClipById(clipId: number): void {
        const clipHandle = this._clipHandleMap.get(clipId);
        if (clipHandle === undefined) return;
        this._clipHandleMap.delete(clipId);
        this._releaseClipHandle(clipHandle);
    }

    private _releaseClipHandle(clipHandle: number): void {
        if (!this._clipHandles.has(clipHandle)) return;
        this._nativePreparer?.releaseClip(clipHandle);
        this._clipHandles.delete(clipHandle);
        unmarkRTHandle("clip", clipHandle, this._factoryId);
        this._clipPool.free(clipHandle);
    }

    // ==================== 一帧两阶段批处理 ====================

    /**
     * 一帧求值入口。
     * 步骤：批量同步 active slot × layer 状态到 native → 调 native flush 跑 evaluate →
     * Web 端 flushEvaluate 处理 non-transform 类型（scope='non-transform-only' 限定）。
     */
    flushEvaluate(): void {
        if (this._nativeEvaluator && this._syncBuffer) {
            this._syncBuffer.sync((this._web as any)._activeList, this._bindingMap);
            this._nativeEvaluator.flush();
        }
        this._web.flushEvaluate();
    }

    /**
     * 一帧回写入口。
     * 步骤：native applier flush 写完 Transform（并在 C++ 侧设好 WORLD 脏标志）→
     * _notifyJsTransformChanged 派发 JS 端 TRANSFORM_CHANGED 事件 →
     * Web 端 flushApply 处理 non-transform 类型，并清 dirtyList。
     *
     * WORLD 脏标志由 native applier 在 C++ 里设：_setTransformFlag 是虚函数，JSRTTransform
     * 会同时更新 m_transformFlag 和共享内存 CHANGEFLAG，C++→C++ 无跨界。JS 侧只剩派发
     * TRANSFORM_CHANGED 这一步——SkinnedMeshRenderer / BaseRender 的 bounds 失效靠它，
     * C++ 那边 Transform3D listener 为 null 发不出来，所以必须留在 JS。
     */
    flushApply(): void {
        if (this._nativeApplier) {
            this._nativeApplier.flush();
            // C++ 回写后 JS 侧补派发 TRANSFORM_CHANGED（Native 化后唯一留在 JS 的逐帧事件开销）。
            this._notifyJsTransformChanged();
        }
        this._web.flushApply();
    }

    /**
     * 派发 JS 端 TRANSFORM_CHANGED 事件，驱动 SkinnedMeshRenderer / BaseRender 的 bounds 失效。
     * 扫 active slot 内非 Idle layer 的 propertyOwner 列表，逐个 _dispatchTransformEvent 递归派发。
     *
     * 去重用 transform 上的 _notifyFrame 帧标记（整数比对，比 Set hash 去重快得多）：派发过即标记
     * 为本帧序号，再遇到直接跳过；且因 _dispatchTransformEvent 返回时保证整棵子树都已派发，命中
     * 标记时连子节点一起跳过。WORLD 脏标志已由 native applier 在 C++ 侧设好，此处只补事件派发。
     */
    private _notifyJsTransformChanged(): void {
        const active = (this._web as any)._activeList as { length: number; elements: TaskSlot[] };
        if (active.length === 0) return;

        const frame = ++this._notifyFrame;
        const cache = this._statePropertyOwnersCache;

        for (let i = 0, n = active.length; i < n; i++) {
            const slot = active.elements[i];
            const layers = slot._layers;
            for (let j = 0, m = layers.length; j < m; j++) {
                const lt = layers[j];
                if (lt.type === LayerTaskType.Idle) continue;
                if (lt.state) {
                    const list = cache.get(lt.state);
                    if (list) for (let k = 0, kn = list.length; k < kn; k++) this._dispatchTransformEvent(list[k], frame);
                }
                if (lt.destState) {
                    const list = cache.get(lt.destState);
                    if (list) for (let k = 0, kn = list.length; k < kn; k++) this._dispatchTransformEvent(list[k], frame);
                }
            }
        }
    }

    /**
     * 递归派发 TRANSFORM_CHANGED：_notifyFrame 命中本帧 frame 即返回（它和整棵子树都派过了）；
     * 否则标记本帧、派发事件、递归子节点。无 TRANSFORM_CHANGED 监听者的 transform 跳过 event
     * 调用（_hasTransformChangedListener=false），但仍递归——子孙可能有监听者。
     */
    private _dispatchTransformEvent(pro: any, frame: number): void {
        if (pro._notifyFrame === frame) return;
        pro._notifyFrame = frame;
        if (pro._hasTransformChangedListener) pro.event(Event.TRANSFORM_CHANGED, pro._RTtransformFlag);
        const children = pro._children;
        if (children) for (let i = 0, n = children.length; i < n; i++) {
            this._dispatchTransformEvent(children[i], frame);
        }
    }

    /** 重建一个 state 的 Transform-typed propertyOwner 去重列表到 _statePropertyOwnersCache（冷路径）。 */
    private _rebuildStateTransformPropertyOwners(state: AnimatorState): void {
        const owners = (state as any)._nodeOwners as KeyframeNodeOwner[] | undefined;
        if (!owners) {
            this._statePropertyOwnersCache.delete(state);
            return;
        }
        const seen = new Set<any>();
        const result: any[] = [];
        for (let i = 0, n = owners.length; i < n; i++) {
            const o = owners[i];
            if (!o || !isTransformType(o.type)) continue;
            const pro = o.propertyOwner;
            if (pro && !seen.has(pro)) { seen.add(pro); result.push(pro); }
        }
        this._statePropertyOwnersCache.set(state, result);
    }

    // ==================== 冷路径 ====================

    /** layer.avatarMask 运行时变更后，重算该 layer 各 binding 的 mask 并重传 native（冷路径）。 */
    refreshLayerMask(ctx: AnimatorBindContext, layer: AnimatorControllerLayer): void {
        if (!this._nativePreparer) return;
        const stateMap = this._bindingMap.get(ctx);
        if (!stateMap) return;
        const avatarMask = layer.avatarMask ?? null;
        const states = layer._states;
        for (let i = 0, n = states.length; i < n; i++) {
            const bindingId = stateMap.get(states[i]);
            if (bindingId === undefined) continue;
            const owners = (states[i] as any)._nodeOwners as (KeyframeNodeOwner | null)[] | undefined;
            if (!owners) continue;
            this._nativePreparer.uploadBindingMask(bindingId, this._buildBindingMaskBytes(owners, avatarMask));
        }
    }

    /**
     * 进入 FixedCross 时把前 count 个 owner 的 native value 快照为 crossFixedValue（FixedCross 的 src）。
     * JS 的 saveCrossFixedValue 只写 JS 端 PlainOwnerData，native 看不到，故这里单独同步。
     * 冷路径，主线程、flush 并行区外调用 —— 与 mask 同写时序，多线程安全。
     */
    saveCrossFixedValues(owners: KeyframeNodeOwner[], count: number): void {
        if (!this._nativePreparer) return;
        const handles = new Uint32Array(count);
        let n = 0;
        for (let i = 0; i < count; i++) {
            const h = this._ownerHandles.get(owners[i]);
            if (h !== undefined) handles[n++] = h;
        }
        if (n > 0) this._nativePreparer.saveCrossFixedValue(handles.subarray(0, n));
    }

    /** 把 owners 里已注册 native 的 handle 收成 Uint32Array 推给 native applier，再调 web 兜底。 */
    updateDefaultValues(owners: KeyframeNodeOwner[]): void {
        if (this._nativeApplier) {
            const handles = new Uint32Array(owners.length);
            let count = 0;
            for (const o of owners) {
                const h = this._ownerHandles.get(o);
                if (h !== undefined) handles[count++] = h;
            }
            if (count > 0) {
                this._nativeApplier.updateDefaultValues(handles.subarray(0, count));
            }
        }
        this._web.updateDefaultValues(owners);
    }

    /** 把 state 涉及的所有 binding 在 native 端回退到 default value，配合 web 兜底覆盖 non-transform 类型。 */
    revertDefaultKeyframeNodes(state: AnimatorState): void {
        if (this._nativeApplier) {
            const stateBindings = this._stateBindings.get(state);
            if (stateBindings) {
                for (const bindingId of stateBindings) {
                    this._nativeApplier.revertDefaultByBinding(bindingId);
                }
            }
        }
        this._web.revertDefaultKeyframeNodes(state);
    }

    destroy(): void {
        if (this._destroyed) return;
        this._destroyed = true;

        this._unregisterClipDestroyCallback?.();
        this._unregisterClipDestroyCallback = null;

        for (const bindingId of Array.from(this._bindingHandles)) this._releaseBinding(bindingId);
        for (const slotHandle of Array.from(this._slotHandles)) this._releaseSlot(slotHandle);
        for (const ownerHandle of Array.from(this._ownerHandleSet)) this._releaseOwnerHandle(ownerHandle);
        for (const clipId of Array.from(this._clipHandleMap.keys())) this._releaseClipById(clipId);
        for (const clipHandle of Array.from(this._clipHandles)) this._releaseClipHandle(clipHandle);

        this._clipHandleMap.clear();
        this._syncBuffer = null;
        this._web.destroy();
    }
}

Laya.addBeforeInitCallback(() => {
    createConchAnimatorFactory();
});

export function createConchAnimatorFactory(): void {
    // RTAnimatorFactory 仅在有 native transform backend 时才有意义：
    // C++ 路径只处理 Transform 类型，没有 native Transform（如 native WebGL）则零贡献，直接走 WebAnimatorFactory。
    const hasNativeTransform = !!(window as any).conchLayaXTransform || !!(window as any).conchRTTransform;
    const hasNativeAnimator = !!(window as any).conchRTAnimatorPreparer
        || !!(window as any).conchRTAnimatorEvaluator
        || !!(window as any).conchRTAnimatorApplier;
    if (hasNativeAnimator && hasNativeTransform) {
        AnimatorManager.factoryCreator = () => new RTAnimatorFactory();
    } else if (hasNativeAnimator && !hasNativeTransform) {
        console.log("[RTAnimatorFactory] Native animator components detected but no native transform backend; using WebAnimatorFactory for full JS evaluation.");
    }
}
