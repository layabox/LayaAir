/**
 * 工厂运行时数据隔层 + 模块级注册点。
 *
 * - IOwnerData 是 KeyframeNodeOwner._data 的接口，Web 用 PlainOwnerData 直读字段；Native 后端
 *   可注入 proxy 实现把字段读写转发到 native OwnerTable（高频路径应避免触发 proxy，让 native
 *   求值直接在 native 端原地读写）。
 * - registerOwnerDataCreator / createOwnerData：KeyframeNodeOwner 构造时取 IOwnerData 实例的
 *   模块级 hook，避免把 factory 引用穿到无 ctor 依赖的角落。
 * - registerClipDestroyCallback / notifyClipDestroyed：AnimationClip 销毁通知 hook，让 RT 工厂
 *   在 clip 释放时同步清掉 native ClipTable。
 */

/**
 * 运行时 owner 数据，每帧热路径：
 *   - Evaluator 求值后写 value
 *   - Cross 合并器读 srcVal/dstVal 后写 value
 *   - Applier 读 value/defaultValue 回写 Transform3D
 */
export interface IOwnerData {
    /** 当前帧求值/合并结果，类型由 KeyframeNodeOwner.type 决定（Vector3 / Vec4 / Quat / number 等）。 */
    value: any;
    /** 默认值，updateDefaultValues 刷新；revert 时写回 Transform。 */
    defaultValue: any;
    /** Cross / FixedCross 用的固定 src 值。 */
    crossFixedValue: any;
    /** AvatarMask 预解析：当前 owner 是否激活，false 时 evaluator/applier 跳过。 */
    maskActive: boolean;
}

export type OwnerDataCreator = () => IOwnerData;

let _ownerDataCreator: OwnerDataCreator | null = null;

/** 注册 IOwnerData 实例化器，后注册者覆盖前者（典型：先 init Web 兜底，再切到 RT）。 */
export function registerOwnerDataCreator(creator: OwnerDataCreator): void {
    _ownerDataCreator = creator;
}

/** KeyframeNodeOwner 构造时取一个 IOwnerData 实例；未注册时回退到 PlainOwnerData。 */
export function createOwnerData(): IOwnerData {
    return _ownerDataCreator ? _ownerDataCreator() : new PlainOwnerData();
}

/** Web 默认实现 / 脱离工厂直接 new KeyframeNodeOwner 时的兜底。 */
export class PlainOwnerData implements IOwnerData {
    value: any = null;
    defaultValue: any = null;
    crossFixedValue: any = null;
    maskActive: boolean = true;
}

export type ClipDestroyCallback = (clipHandle: number) => void;

const _clipDestroyCallbacks: Set<ClipDestroyCallback> = new Set();

/** 注册 clip 销毁回调（RT 工厂 ctor 内注册以释放 native ClipTable），返回取消注册函数。 */
export function registerClipDestroyCallback(fn: ClipDestroyCallback): () => void {
    _clipDestroyCallbacks.add(fn);
    return () => {
        _clipDestroyCallbacks.delete(fn);
    };
}

/** AnimationClip._disposeResource 调用以通知所有注册方释放对应 native 资源。 */
export function notifyClipDestroyed(clipHandle: number): void {
    _clipDestroyCallbacks.forEach(callback => callback(clipHandle));
}
