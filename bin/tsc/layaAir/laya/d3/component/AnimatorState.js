/**
 * <code>AnimatorState</code> 类用于创建动作状态。
 */
export class AnimatorState {
    /**
     * 创建一个 <code>AnimatorState</code> 实例。
     */
    constructor() {
        /**@private */
        this._referenceCount = 0;
        /**@private */
        this._clip = null;
        /**@private */
        this._nodeOwners = []; //TODO:提出去
        /**@private */
        this._currentFrameIndices = null;
        /**@private */
        this._scripts = null;
        /**动画播放速度,1.0为正常播放速度。*/
        this.speed = 1.0;
        /**动作播放起始时间。*/
        this.clipStart = 0.0;
        /**动作播放结束时间。*/
        this.clipEnd = 1.0;
    }
    /**
     * 获取动作。
     * @return 动作
     */
    get clip() {
        return this._clip;
    }
    /**
     * 设置动作。
     * @param value 动作。
     */
    set clip(value) {
        if (this._clip !== value) {
            if (this._clip)
                (this._referenceCount > 0) && (this._clip._removeReference(this._referenceCount));
            if (value) {
                this._currentFrameIndices = new Int16Array(value._nodes.count);
                this._resetFrameIndices();
                (this._referenceCount > 0) && (this._clip._addReference(this._referenceCount));
            }
            this._clip = value;
        }
    }
    /**
     * @private
     * [实现IReferenceCounter接口]
     */
    _getReferenceCount() {
        return this._referenceCount;
    }
    /**
     * @private
     * [实现IReferenceCounter接口]
     */
    _addReference(count = 1) {
        (this._clip) && (this._clip._addReference(count));
        this._referenceCount += count;
    }
    /**
     * @private
     * [实现IReferenceCounter接口]
     */
    _removeReference(count = 1) {
        (this._clip) && (this._clip._removeReference(count));
        this._referenceCount -= count;
    }
    /**
     * @private
     * [实现IReferenceCounter接口]
     */
    _clearReference() {
        this._removeReference(-this._referenceCount);
    }
    /**
     * @private
     */
    _resetFrameIndices() {
        for (var i = 0, n = this._currentFrameIndices.length; i < n; i++)
            this._currentFrameIndices[i] = -1; //-1表示没到第0帧,首帧时间可能大于
    }
    /**
     * 添加脚本。
     * @param	type  组件类型。
     * @return 脚本。
     *
     */
    addScript(type) {
        var script = new type();
        this._scripts = this._scripts || [];
        this._scripts.push(script);
        return script;
    }
    /**
     * 获取脚本。
     * @param	type  组件类型。
     * @return 脚本。
     *
     */
    getScript(type) {
        if (this._scripts) {
            for (var i = 0, n = this._scripts.length; i < n; i++) {
                var script = this._scripts[i];
                if (script instanceof type)
                    return script;
            }
        }
        return null;
    }
    /**
     * 获取脚本集合。
     * @param	type  组件类型。
     * @return 脚本集合。
     *
     */
    getScripts(type) {
        var coms;
        if (this._scripts) {
            for (var i = 0, n = this._scripts.length; i < n; i++) {
                var script = this._scripts[i];
                if (script instanceof type) {
                    coms = coms || [];
                    coms.push(script);
                }
            }
        }
        return coms;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var dest = destObject;
        dest.name = this.name;
        dest.speed = this.speed;
        dest.clipStart = this.clipStart;
        dest.clipEnd = this.clipEnd;
        dest.clip = this._clip;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new AnimatorState();
        this.cloneTo(dest);
        return dest;
    }
}
