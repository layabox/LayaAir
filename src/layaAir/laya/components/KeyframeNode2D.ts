import { Keyframe2D } from "./KeyFrame2D";

/**
 * @en 2D animation keyframe nodes.
 * @zh 2D 动画关键帧节点的类。
 */
export class KeyframeNode2D {
    _ownerPath: string[] = [];
    _propertys: string[] = [];
    fullPath: string;
    nodePath: string;
    _indexInList: number;



    _keyFrames: Keyframe2D[] = [];
    /**
     * @en Number of frames
     * @zh 帧个数。
     */
    get keyFramesCount(): number {
        return this._keyFrames.length;
    }
    _setOwnerPathCount(value: number) {
        this._ownerPath.length = value;
    }
    _setOwnerPathByIndex(index: number, value: string) {
        this._ownerPath[index] = value;
    }
    _setPropertyCount(value: number) {
        this._propertys.length = value;
    }
    _setPropertyByIndex(index: number, value: string) {
        this._propertys[index] = value;
    }
    _setKeyframeCount(value: number) {
        this._keyFrames.length = value;
    }

    _joinOwnerPath(sep: string): string {
        return this._ownerPath.join(sep);
    }
    _joinProperty(sep: string): string {
        return this._propertys.join(sep);
    }

    /**
     * @en Gets a keyframe by its index in the animation timeline.
     * @param index The index of the keyframe to retrieve.
     * @zh 通过索引获取动画时间线上的关键帧。
     * @param index 要检索的关键帧的索引。
     */
    getKeyframeByIndex(index: number): Keyframe2D {
        return this._keyFrames[index];
    }

    /**
     * @en The number of owner paths in the animation.
     * @zh 动画中的精灵路径个数。
     */
    get ownerPathCount(): number {
        return this._ownerPath.length;
    }

    /**
     * @en The number of property paths in the animation.
     * @zh 动画中的属性路径个数。
     */
    get propertyCount(): number {
        return this._propertys.length;
    }

    /**
     * @en Gets an owner path by its index in the list of owner paths.
     * @param index The index of the owner path to retrieve.
     * @zh 通过索引获取精灵路径列表中的精灵路径。
     * @param index 要检索的精灵路径的索引。
     */
    getOwnerPathByIndex(index: number): string {
        return this._ownerPath[index];
    }

    /**
     * @en Gets a property path by its index in the list of property paths.
     * @param index The index of the property path to retrieve.
     * @zh 通过索引获取属性路径列表中的属性路径。
     * @param index 要检索的属性路径的索引。
     */
    getPropertyByIndex(index: number): string {
        return this._propertys[index];
    }


}