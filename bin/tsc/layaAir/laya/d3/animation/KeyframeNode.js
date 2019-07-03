/**
 * @internal
 */
export class KeyframeNode {
    constructor() {
        this._ownerPath = [];
        this._propertys = [];
        /**@internal */
        this._keyFrames = [];
    }
    /**
     * 获取精灵路径个数。
     * @return 精灵路径个数。
     */
    get ownerPathCount() {
        return this._ownerPath.length;
    }
    /**
     * 获取属性路径个数。
     * @return 数量路径个数。
     */
    get propertyCount() {
        return this._propertys.length;
    }
    /**
     * 获取帧个数。
     * 帧个数。
     */
    get keyFramesCount() {
        return this._keyFrames.length;
    }
    /**
     * @internal
     */
    _setOwnerPathCount(value) {
        this._ownerPath.length = value;
    }
    /**
     * @internal
     */
    _setOwnerPathByIndex(index, value) {
        this._ownerPath[index] = value;
    }
    /**
     * @internal
     */
    _joinOwnerPath(sep) {
        return this._ownerPath.join(sep);
    }
    /**
     * @internal
     */
    _setPropertyCount(value) {
        this._propertys.length = value;
    }
    /**
     * @internal
     */
    _setPropertyByIndex(index, value) {
        this._propertys[index] = value;
    }
    /**
     * @internal
     */
    _joinProperty(sep) {
        return this._propertys.join(sep);
    }
    /**
     * @internal
     */
    _setKeyframeCount(value) {
        this._keyFrames.length = value;
    }
    /**
     * @internal
     */
    _setKeyframeByIndex(index, value) {
        this._keyFrames[index] = value;
    }
    /**
     * 通过索引获取精灵路径。
     * @param index 索引。
     */
    getOwnerPathByIndex(index) {
        return this._ownerPath[index];
    }
    /**
     * 通过索引获取属性路径。
     * @param index 索引。
     */
    getPropertyByIndex(index) {
        return this._propertys[index];
    }
    /**
     * 通过索引获取帧。
     * @param index 索引。
     */
    getKeyframeByIndex(index) {
        return this._keyFrames[index];
    }
}
