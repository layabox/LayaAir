import { Keyframe2D } from "./KeyFrame2D";

export class KeyframeNode2D {
    _ownerPath: string[] = [];
    _propertys: string[] = [];
    fullPath: string;
    nodePath: string;
    _indexInList: number;



    _keyFrames: Keyframe2D[] = [];
    /**
    * 帧个数。
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
    * 通过索引获取帧。
    * @param index 索引。
    */
    getKeyframeByIndex(index: number): Keyframe2D {
        return this._keyFrames[index];
    }
    /**
    * 精灵路径个数。
    */
    get ownerPathCount(): number {
        return this._ownerPath.length;
    }
    /**
     * 属性路径个数。
     */
    get propertyCount(): number {
        return this._propertys.length;
    }

    /**
     * 通过索引获取精灵路径。
     * @param index 索引。
     */
    getOwnerPathByIndex(index: number): string {
        return this._ownerPath[index];
    }
    /**
     * 通过索引获取属性路径。
     * @param index 索引。
     */
    getPropertyByIndex(index: number): string {
        return this._propertys[index];
    }


}