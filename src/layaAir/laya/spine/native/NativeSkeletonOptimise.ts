import { ISkeletonOptimise } from "../interface/ISpineParse";

/**
 * @en Native SkeletonOptimise wrapper class for accessing lightweight properties.
 * @zh Native SkeletonOptimise 封装类，用于访问轻量级属性。
 */
export class NativeSkeletonOptimise implements ISkeletonOptimise {
    private _nativeOptimise: any; // conchSkeletonOptimise from C++

    /**
     * @en Skeleton data (lightweight reference, actual data managed by native).
     * @zh 骨骼数据（轻量级引用，实际数据由 native 管理）。
     */
    data: any = null; // Native side manages the actual data

    /**
     * @en Cached animation names retrieved once during initialization.
     * @zh 初始化时一次性获取并缓存的动画名称数组。
     */
    private _animationNames: string[] = [];

    /**
     * @en Cached skin names retrieved once during initialization.
     * @zh 初始化时一次性获取并缓存的皮肤名称数组。
     */
    private _skinNames: string[] = [];

    /**
     * @en Create a NativeSkeletonOptimise wrapper.
     * @param nativeOptimise The native conchSkeletonOptimise instance.
     * @zh 创建 NativeSkeletonOptimise 封装。
     * @param nativeOptimise native conchSkeletonOptimise 实例。
     */
    constructor(nativeOptimise: any) {
        if (!nativeOptimise) {
            throw new Error("NativeSkeletonOptimise: nativeOptimise is required");
        }
        this._nativeOptimise = nativeOptimise;

        // Cache all animation and skin names once during initialization
        if (this._nativeOptimise.getAllAnimationNames) {
            this._animationNames = this._nativeOptimise.getAllAnimationNames() || [];
        }
        if (this._nativeOptimise.getAllSkinNames) {
            this._skinNames = this._nativeOptimise.getAllSkinNames() || [];
        }
    }

    /**
     * @en Get animation count.
     * @returns Animation count.
     * @zh 获取动画数量。
     * @returns 动画数量。
     */
    getAnimationCount(): number {
        return this._animationNames.length;
    }

    /**
     * @en Get animation name by index.
     * @param index Animation index.
     * @returns Animation name or null.
     * @zh 根据索引获取动画名称。
     * @param index 动画索引。
     * @returns 动画名称或 null。
     */
    getAniNameByIndex(index: number): string | null {
        if (index >= 0 && index < this._animationNames.length) {
            return this._animationNames[index];
        }
        return null;
    }

    /**
     * @en Get all animation names.
     * @returns Array of animation names.
     * @zh 获取所有动画名称。
     * @returns 动画名称数组。
     */
    getAllAnimationNames(): string[] {
        return this._animationNames;
    }

    /**
     * @en Find animation by name.
     * @param name Animation name.
     * @returns Animation object or null.
     * @zh 根据名称查找动画。
     * @param name 动画名称。
     * @returns 动画对象或 null。
     */
    findAnimation(name: string): any | null {
        if (!this._nativeOptimise || !name) {
            return null;
        }
        return this._nativeOptimise.findAnimation(name) || null;
    }

    /**
     * @en Get skin index by name.
     * @param skinName Skin name.
     * @returns Skin index or -1 if not found.
     * @zh 根据名称获取皮肤索引。
     * @param skinName 皮肤名称。
     * @returns 皮肤索引，如果未找到则返回 -1。
     */
    getSkinIndexByName(skinName: string): number {
        if (!skinName) {
            return -1;
        }
        return this._skinNames.indexOf(skinName);
    }

    /**
     * @en Get skin count.
     * @returns Skin count.
     * @zh 获取皮肤数量。
     * @returns 皮肤数量。
     */
    getSkinCount(): number {
        return this._skinNames.length;
    }

    /**
     * @en Get skin name by index.
     * @param index Skin index.
     * @returns Skin name or null.
     * @zh 根据索引获取皮肤名称。
     * @param index 皮肤索引。
     * @returns 皮肤名称或 null。
     */
    getSkinNameByIndex(index: number): string | null {
        if (index >= 0 && index < this._skinNames.length) {
            return this._skinNames[index];
        }
        return null;
    }

    /**
     * @en Get all skin names.
     * @returns Array of skin names.
     * @zh 获取所有皮肤名称。
     * @returns 皮肤名称数组。
     */
    getAllSkinNames(): string[] {
        return this._skinNames;
    }

    /**
     * @en Get skin by index.
     * @param index Skin index.
     * @returns Skin object or null.
     * @zh 根据索引获取皮肤。
     * @param index 皮肤索引。
     * @returns 皮肤对象或 null。
     */
    getSkin(index: number): any | null {
        if (!this._nativeOptimise || index < 0) {
            return null;
        }
        return this._nativeOptimise.getSkin(index) || null;
    }

    /**
     * @en Check and initialize the main attachment.
     * @param skeleton The skeleton object.
     * @param skeletonData The skeleton data.
     * @zh 检查并初始化主附件。
     * @param skeleton 骨骼对象。
     * @param skeletonData 骨骼数据。
     * @note This method is typically called internally by the parser.
     */
    checkMainAttach(skeleton: spine.Skeleton, skeletonData: spine.SkeletonData): void {
        // Native side handles this internally during parsing
        // This method is kept for interface compatibility
    }

    /**
     * @en Destroy the optimize instance.
     * @zh 销毁优化实例。
     */
    destroy(): void {
        if (this._nativeOptimise) {
            this._nativeOptimise.destroy();
            this._nativeOptimise = null;
        }
        this.data = null;
        this._animationNames = [];
        this._skinNames = [];
    }

    /**
     * @en Get the native optimize instance (for internal use).
     * @returns Native optimize instance.
     * @zh 获取 native optimize 实例（内部使用）。
     * @returns native optimize 实例。
     */
    _getNativeOptimise(): any {
        return this._nativeOptimise;
    }
}

