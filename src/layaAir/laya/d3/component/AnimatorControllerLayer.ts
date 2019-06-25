import { AnimatorState } from "./AnimatorState";
import { KeyframeNodeOwner } from "./KeyframeNodeOwner";
import { AnimatorPlayState } from "./AnimatorPlayState";
import { AnimationClip } from "../animation/AnimationClip";
import { KeyframeNodeList } from "../animation/KeyframeNodeList";
import { IClone } from "../core/IClone";
import { IReferenceCounter } from "../resource/IReferenceCounter";
import { Animator } from "./Animator";


/**
 * <code>AnimatorControllerLayer</code> 类用于创建动画控制器层。
 */
export class AnimatorControllerLayer implements IReferenceCounter, IClone {
	/**@internal */
	static BLENDINGMODE_OVERRIDE: number = 0;
	/**@internal */
	static BLENDINGMODE_ADDTIVE: number = 1;

	private _defaultState: AnimatorState = null;
	private _referenceCount: number = 0;

	/**@internal 0:常规播放、1:动态融合播放、2:固定融合播放*/
	_playType: number;
	/**@internal */
	_crossDuration: number;
	/**@internal */
	_crossPlayState: AnimatorState;
	/**@internal */
	_crossMark: number;
	/**@internal */
	_crossNodesOwnersCount: number;
	/**@internal */
	_crossNodesOwners: KeyframeNodeOwner[];
	/**@internal */
	_crossNodesOwnersIndicesMap: any;
	/**@internal */
	_srcCrossClipNodeIndices: number[];
	/**@internal */
	_destCrossClipNodeIndices: number[];

	/**@internal */
	_animator: Animator;
	/**@internal */
	_currentPlayState: AnimatorState;
	/**@internal */
	_statesMap: any = {};
	/**@internal */
	_states: AnimatorState[];
	/**@internal */
	_playStateInfo: AnimatorPlayState;
	/**@internal */
	_crossPlayStateInfo: AnimatorPlayState;

	/** 层的名称。*/
	name: string;
	/** 名称。*/
	blendingMode: number;
	/** 权重。*/
	defaultWeight: number;
	/**	激活时是否自动播放*/
	playOnWake: boolean = true;

	/**
	 * 获取默认动画状态。
	 * @return 默认动画状态。
	 */
	get defaultState(): AnimatorState {
		return this._defaultState;
	}

	/**
	 * 设置默认动画状态。
	 * @param value 默认动画状态。
	 */
	set defaultState(value: AnimatorState) {
		this._defaultState = value;
		this._statesMap[value.name] = value;
	}

	/**
	 * 创建一个 <code>AnimatorControllerLayer</code> 实例。
	 */
	constructor(name: string) {
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

	private _removeClip(clipStateInfos: AnimatorState[], statesMap: any, index: number, state: AnimatorState): void {
		var clip: AnimationClip = state._clip;
		var clipStateInfo: AnimatorState = clipStateInfos[index];

		clipStateInfos.splice(index, 1);
		delete statesMap[state.name];

		if (this._animator) {
			var frameNodes: KeyframeNodeList = clip._nodes;
			var nodeOwners: KeyframeNodeOwner[] = clipStateInfo._nodeOwners;
			clip._removeReference();
			for (var i: number = 0, n: number = frameNodes.count; i < n; i++)
				this._animator._removeKeyframeNodeOwner(nodeOwners, frameNodes.getNodeByIndex(i));
		}
	}

	/**
	 * @internal
	 * [实现IReferenceCounter接口]
	 */
	_getReferenceCount(): number {
		return this._referenceCount;
	}

	/**
	 * @internal
	 * [实现IReferenceCounter接口]
	 */
	_addReference(count: number = 1): void {
		for (var i: number = 0, n: number = this._states.length; i < n; i++)
			this._states[i]._addReference(count);
		this._referenceCount += count;
	}

	/**
	 * @internal
	 * [实现IReferenceCounter接口]
	 */
	_removeReference(count: number = 1): void {
		for (var i: number = 0, n: number = this._states.length; i < n; i++)
			this._states[i]._removeReference(count);
		this._referenceCount -= count;
	}

	/**
	 * @internal
	 * [实现IReferenceCounter接口]
	 */
	_clearReference(): void {
		this._removeReference(-this._referenceCount);
	}

	/**
	 * @internal
	 */
	getAnimatorState(name: string): AnimatorState {
		var state: AnimatorState = this._statesMap[name];
		return state ? state : null;
	}

	/**
	 * 添加动画状态。
	 * @param	state 动画状态。
	 * @param   layerIndex 层索引。
	 */
	addState(state: AnimatorState): void {
		var stateName: string = state.name;
		if (this._statesMap[stateName]) {
			throw "AnimatorControllerLayer:this stat's name has exist.";
		} else {
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
	removeState(state: AnimatorState): void {
		var states: AnimatorState[] = this._states;
		var index: number = -1;
		for (var i: number = 0, n: number = states.length; i < n; i++) {
			if (states[i] === state) {
				index = i;
				break;
			}
		}
		if (index !== -1)
			this._removeClip(states, this._statesMap, index, state);
	}

	/**
	 * @internal
	 */
	destroy(): void {
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
	cloneTo(destObject: any): void {
		var dest: AnimatorControllerLayer = (<AnimatorControllerLayer>destObject);
		dest.name = this.name;
		dest.blendingMode = this.blendingMode;
		dest.defaultWeight = this.defaultWeight;
		dest.playOnWake = this.playOnWake;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: AnimatorControllerLayer = new AnimatorControllerLayer(this.name);
		this.cloneTo(dest);
		return dest;
	}

}


