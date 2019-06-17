import { AnimatorPlayState } from "./AnimatorPlayState";
/**
 * <code>AnimatorControllerLayer</code> 类用于创建动画控制器层。
 */
export class AnimatorControllerLayer {
    /**
     * 创建一个 <code>AnimatorControllerLayer</code> 实例。
     */
    constructor(name) {
        /**@private */
        this._defaultState = null;
        /**@private */
        this._referenceCount = 0;
        /**@private */
        this._statesMap = {};
        /**	激活时是否自动播放*/
        this.playOnWake = true;
        this._playType = -1;
        this._crossMark = 0;
        this._crossDuration = -1;
        this._crossNodesOwnersIndicesMap = {};
        this._crossNodesOwnersCount = 0;
        this._crossNodesOwners = [];
        this._currentPlayState = null;
        this._states = [];
        this._playStateInfo = new AnimatorPlayState();
        this._crossPlayStateInfo = new AnimatorPlayState();
        this._srcCrossClipNodeIndices = [];
        this._destCrossClipNodeIndices = [];
        this.name = name;
        this.defaultWeight = 1.0;
        this.blendingMode = AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
    }
    /**
     * 获取默认动画状态。
     * @return 默认动画状态。
     */
    get defaultState() {
        return this._defaultState;
    }
    /**
     * 设置默认动画状态。
     * @param value 默认动画状态。
     */
    set defaultState(value) {
        this._defaultState = value;
        this._statesMap[value.name] = value;
    }
    /**
     * @private
     */
    _removeClip(clipStateInfos, statesMap, index, state) {
        var clip = state._clip;
        clipStateInfos.splice(index, 1);
        delete statesMap[state.name];
        var clipStateInfo = clipStateInfos[index];
        var frameNodes = clip._nodes;
        var nodeOwners = clipStateInfo._nodeOwners;
        if (this._animator) {
            clip._removeReference();
            for (var i = 0, n = frameNodes.count; i < n; i++)
                this._animator._removeKeyframeNodeOwner(nodeOwners, frameNodes.getNodeByIndex(i));
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
        for (var i = 0, n = this._states.length; i < n; i++)
            this._states[i]._addReference(count);
        this._referenceCount += count;
    }
    /**
     * @private
     * [实现IReferenceCounter接口]
     */
    _removeReference(count = 1) {
        for (var i = 0, n = this._states.length; i < n; i++)
            this._states[i]._removeReference(count);
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
    getAnimatorState(name) {
        var state = this._statesMap[name];
        return state ? state : null;
    }
    /**
     * 添加动画状态。
     * @param	state 动画状态。
     * @param   layerIndex 层索引。
     */
    addState(state) {
        var stateName = state.name;
        if (this._statesMap[stateName]) {
            throw "AnimatorControllerLayer:this stat's name has exist.";
        }
        else {
            this._statesMap[stateName] = state;
            this._states.push(state);
            if (this._animator) {
                state._clip._addReference();
                this._animator._getOwnersByClip(state);
            }
        }
    }
    /**
     * 移除动画状态。
     * @param	state 动画状态。
     * @param   layerIndex 层索引。
     */
    removeState(state) {
        var states = this._states;
        var index = -1;
        for (var i = 0, n = states.length; i < n; i++) {
            if (states[i] === state) {
                index = i;
                break;
            }
        }
        if (index !== -1)
            this._removeClip(states, this._statesMap, index, state);
    }
    /**
     * @private
     */
    destroy() {
        this._clearReference();
        this._statesMap = null;
        this._states = null;
        this._playStateInfo = null;
        this._crossPlayStateInfo = null;
        this._defaultState = null;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var dest = destObject;
        dest.name = this.name;
        dest.blendingMode = this.blendingMode;
        dest.defaultWeight = this.defaultWeight;
        dest.playOnWake = this.playOnWake;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new AnimatorControllerLayer(this.name);
        this.cloneTo(dest);
        return dest;
    }
}
/**@private */
AnimatorControllerLayer.BLENDINGMODE_OVERRIDE = 0;
/**@private */
AnimatorControllerLayer.BLENDINGMODE_ADDTIVE = 1;
