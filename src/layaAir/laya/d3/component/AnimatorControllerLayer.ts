import { AnimationClip } from "../animation/AnimationClip";
import { IClone } from "../core/IClone";
import { IReferenceCounter } from "../resource/IReferenceCounter";
import { Animator } from "./Animator";
import { AnimatorPlayState } from "./AnimatorPlayState";
import { AnimatorState } from "./AnimatorState";
import { AvatarMask } from "./AvatarMask";
import { KeyframeNodeOwner } from "./KeyframeNodeOwner";


/**
 * <code>AnimatorControllerLayer</code> 类用于创建动画控制器层。
 */
export class AnimatorControllerLayer implements IReferenceCounter, IClone {
	/**混合模式_覆盖。 */
	static BLENDINGMODE_OVERRIDE: number = 0;
	/**混合模式_叠加。 */
	static BLENDINGMODE_ADDTIVE: number = 1;

	/**@internal */
	private _defaultState: AnimatorState|null;
	/**@internal */
	private _referenceCount: number = 0;

	/**@internal 0:常规播放、1:动态融合播放、2:固定融合播放*/
	_playType: number = -1;
	/**@internal */
	_crossDuration: number = -1;
	/**@internal */
	_crossPlayState: AnimatorState;
	/**@internal */
	_crossMark: number = 0;
	/**@internal */
	_crossNodesOwnersCount: number = 0;
	/**@internal */
	_crossNodesOwners: KeyframeNodeOwner[] = [];
	/**@internal */
	_crossNodesOwnersIndicesMap: any = {};
	/**@internal */
	_srcCrossClipNodeIndices: number[] = [];
	/**@internal */
	_destCrossClipNodeIndices: number[] = [];

	/**@internal */
	_animator: Animator;
	/**@internal */
	_statesMap: any = {};
	/**@internal */
	_states: AnimatorState[] = [];
	/**@internal */
	_playStateInfo: AnimatorPlayState|null = new AnimatorPlayState();
	/**@internal */
	_crossPlayStateInfo: AnimatorPlayState|null = new AnimatorPlayState();
	/**@internal */
	_avatarMask:AvatarMask;
	/** 层的名称。*/
	name: string;
	/** 混合模式。*/
	blendingMode: number = AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
	/** 默认权重。*/
	defaultWeight: number = 1.0;
	/**	激活时是否自动播放。*/
	playOnWake: boolean = true;

	/**
	 * 默认动画状态机。
	 */
	get defaultState(): AnimatorState {
		return this._defaultState!;
	}

	set defaultState(value: AnimatorState) {
		this._defaultState = value;
		this._statesMap[value.name] = value;
	}

	/**
	 * 骨骼遮罩
	 */
	get avatarMask():AvatarMask{
		return this._avatarMask;
	}

	set avatarMask(value:AvatarMask){
		this._avatarMask = value;
	}

	/**
	 * 创建一个 <code>AnimatorControllerLayer</code> 实例。
	 * @param 动画层名称
	 */
	constructor(name: string) {
		this.name = name;
	}

	/**
	 * @internal
	 */
	private _removeClip(clipStateInfos: AnimatorState[], statesMap: any, index: number, state: AnimatorState): void {
		var clip: AnimationClip = state._clip!;
		var clipStateInfo: AnimatorState = clipStateInfos[index];

		clipStateInfos.splice(index, 1);
		delete statesMap[state.name];

		if (this._animator) {
			var frameNodes = clip._nodes;
			var nodeOwners: KeyframeNodeOwner[] = clipStateInfo._nodeOwners;
			clip._removeReference();
			for (var i: number = 0, n: number = frameNodes!.count; i < n; i++)
				this._animator._removeKeyframeNodeOwner(nodeOwners, frameNodes!.getNodeByIndex(i));
		}
	}

	/**
	 * @implements IReferenceCounter
	 */
	_getReferenceCount(): number {
		return this._referenceCount;
	}

	/**
	 * @implements IReferenceCounter
	 */
	_addReference(count: number = 1): void {
		for (var i: number = 0, n: number = this._states.length; i < n; i++)
			this._states[i]._addReference(count);
		this._referenceCount += count;
	}

	/**
	 * @implements IReferenceCounter
	 */
	_removeReference(count: number = 1): void {
		for (var i: number = 0, n: number = this._states.length; i < n; i++)
			this._states[i]._removeReference(count);
		this._referenceCount -= count;
	}

	/**
	 * @implements IReferenceCounter
	 */
	_clearReference(): void {
		this._removeReference(-this._referenceCount);
	}

	/**
	 * 获取当前的播放状态。
	 * @return 动画播放状态。
	 */
	getCurrentPlayState(): AnimatorPlayState {
		return this._playStateInfo!;
	}

	/**
	 * 获取动画状态。
	 * @return 动画状态。
	 */
	getAnimatorState(name: string): AnimatorState|null {
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
				state._clip!._addReference();
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
	 * 销毁。
	 */
	destroy(): void {
		this._clearReference();
		this._statesMap = null;
		this._states = [];
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


