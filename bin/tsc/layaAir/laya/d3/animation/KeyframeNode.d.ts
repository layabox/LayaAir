import { Keyframe } from "../core/Keyframe";
/**
 * @private
 */
export declare class KeyframeNode {
    /**@private */
    private _ownerPath;
    /**@private */
    private _propertys;
    /**@private */
    _keyFrames: Keyframe[];
    /**@private */
    _indexInList: number;
    /**@private */
    type: number;
    /**@private */
    fullPath: string;
    /**@private */
    propertyOwner: string;
    /**@private */
    data: any;
    /**
     * 获取精灵路径个数。
     * @return 精灵路径个数。
     */
    readonly ownerPathCount: number;
    /**
     * 获取属性路径个数。
     * @return 数量路径个数。
     */
    readonly propertyCount: number;
    /**
     * 获取帧个数。
     * 帧个数。
     */
    readonly keyFramesCount: number;
    /**
     * @private
     */
    _setOwnerPathCount(value: number): void;
    /**
     * @private
     */
    _setOwnerPathByIndex(index: number, value: string): void;
    /**
     * @private
     */
    _joinOwnerPath(sep: string): string;
    /**
     * @private
     */
    _setPropertyCount(value: number): void;
    /**
     * @private
     */
    _setPropertyByIndex(index: number, value: string): void;
    /**
     * @private
     */
    _joinProperty(sep: string): string;
    /**
     * @private
     */
    _setKeyframeCount(value: number): void;
    /**
     * @private
     */
    _setKeyframeByIndex(index: number, value: Keyframe): void;
    /**
     * 通过索引获取精灵路径。
     * @param index 索引。
     */
    getOwnerPathByIndex(index: number): string;
    /**
     * 通过索引获取属性路径。
     * @param index 索引。
     */
    getPropertyByIndex(index: number): string;
    /**
     * 通过索引获取帧。
     * @param index 索引。
     */
    getKeyframeByIndex(index: number): Keyframe;
}
