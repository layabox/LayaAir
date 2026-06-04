import { Sprite3D } from "../../../core/Sprite3D";
import { KeyframeNode } from "../../../animation/KeyframeNode";
import { AnimatorState } from "../AnimatorState";
import { KeyframeNodeOwner } from "../KeyframeNodeOwner";
import { AnimatorBindContext } from "./AnimatorBindContext";
import { ITaskSlot } from "./TaskSlot";

/**
 * AnimatorManager 的统一工厂接口。每个 Scene3D 一个实例，持有该 scene 下所有 Animator 的
 * TaskSlot / activeList / dirtyList。
 *
 * 三组职责：
 *   - 数据准备：bindAnimator / unbindAnimator / prepareStateOwners / handleSpriteOwnersBySprite /
 *     add/removeKeyframeNodeOwner —— Animator 生命周期 + sprite 树变化时调用。
 *   - 一帧两阶段：flushEvaluate（采样）+ flushApply（回写），Manager 每帧调一次；flushApply 末尾清 dirtyList。
 *   - 冷路径：updateDefaultValues（additive 基础值刷新）+ revertDefaultKeyframeNodes（state 切走时还原）。
 *
 * 工厂自身不引用 Animator 类型，跨边界数据走 AnimatorBindContext + ITaskSlot。
 */
export interface IAnimatorFactory {

    // ==================== 数据准备 ====================

    /** Animator 启用：建立 native 槽位（如有）并返回 TaskSlot 给 Animator 持有。 */
    bindAnimator(ctx: AnimatorBindContext): ITaskSlot;

    /** Animator 销毁：释放 slot + 从 active/dirty list 移除 + 通知 native。 */
    unbindAnimator(ctx: AnimatorBindContext): void;

    /** 解析 state._clip 的所有曲线，填充 state._nodeOwners。 */
    prepareStateOwners(ctx: AnimatorBindContext, state: AnimatorState): void;

    /** Sprite link/unlink：刷新所有 layer 上对应 path 的 nodeOwner。 */
    handleSpriteOwnersBySprite(
        ctx: AnimatorBindContext,
        isLink: boolean,
        path: string[],
        sprite: Sprite3D
    ): void;

    /** 增量新增 nodeOwner（去重 + 引用计数 + propertyOwner 绑定）。 */
    addKeyframeNodeOwner(
        ctx: AnimatorBindContext,
        clipOwners: KeyframeNodeOwner[],
        node: KeyframeNode,
        propertyOwner: any
    ): void;

    /** 增量移除 nodeOwner（refCount 归零时释放，nodeOwners[node._indexInList] 置 null）。 */
    removeKeyframeNodeOwner(
        ctx: AnimatorBindContext,
        nodeOwners: (KeyframeNodeOwner | null)[],
        node: KeyframeNode
    ): void;

    // ==================== 一帧两阶段批处理 ====================

    /** 采样 active slot 内每个非 Idle layer 的曲线值。 */
    flushEvaluate(): void;

    /** 回写求值结果到目标属性；末尾清 dirtyList。 */
    flushApply(): void;

    // ==================== 冷路径 ====================

    /** 把 owners 的 defaultValue 刷新为当前属性值（additive 模式 loop 边界刷新）。 */
    updateDefaultValues(owners: KeyframeNodeOwner[]): void;

    /** 还原 state 涉及的节点到 defaultValue（state 切走时调用）。 */
    revertDefaultKeyframeNodes(state: AnimatorState): void;

    /** Scene/AnimatorManager 销毁：释放该工厂持有的所有 native 资源与运行时回调。 */
    destroy(): void;
}
