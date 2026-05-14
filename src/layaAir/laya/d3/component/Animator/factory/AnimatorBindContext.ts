import { Sprite3D } from "../../../core/Sprite3D";
import { AnimatorControllerLayer } from "../AnimatorControllerLayer";
import { KeyframeNodeOwner } from "../KeyframeNodeOwner";

/**
 * Preparer 接口的窄上下文：聚合 Animator 内部 worker 需要的字段，让工厂层不再 import Animator。
 *
 * 字段全部为引用而非拷贝；Animator 持有同一个 ctx 实例长期复用。
 */
export interface AnimatorBindContext {
    /** Animator 所属的 Sprite3D。 */
    sprite: Sprite3D;
    /** fullPath → KeyframeNodeOwner，去重表。 */
    ownerMap: Record<string, KeyframeNodeOwner>;
    /** 所有去重后的 KeyframeNodeOwner 平铺列表。 */
    owners: KeyframeNodeOwner[];
    /** 该 Animator 所有 ControllerLayer。 */
    layers: ReadonlyArray<AnimatorControllerLayer>;
}
