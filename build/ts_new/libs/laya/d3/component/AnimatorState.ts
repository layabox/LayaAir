import { AnimationClip } from "../animation/AnimationClip";
import { AnimatorStateScript } from "../animation/AnimatorStateScript";
import { IClone } from "../core/IClone";
import { IReferenceCounter } from "../resource/IReferenceCounter";
import { KeyframeNodeOwner } from "./KeyframeNodeOwner";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { KeyframeNodeList } from "../animation/KeyframeNodeList";
import { ConchVector3 } from "../math/Native/ConchVector3";
import { ConchQuaternion } from "../math/Native/ConchQuaternion";

/**
 * <code>AnimatorState</code> 类用于创建动作状态。
 */
export class AnimatorState implements IReferenceCounter, IClone {
	/** @internal */
	private _referenceCount: number = 0;

	/** @internal */
	_clip: AnimationClip|null = null;
	/** @internal */
	_nodeOwners: KeyframeNodeOwner[] = [];//TODO:提出去
	/** @internal */
	_currentFrameIndices: Int16Array|null = null;
	/**
	 * @internal
	 * to avoid data confused,must put realtime datas in animatorState,can't be in animationClip,
	 * for example use crossFade() with different animatorState but the sample clip source.
	 */
	_realtimeDatas: Array<number | Vector3 | Quaternion | ConchVector3 | ConchQuaternion> = [];
	/** @internal */
	_scripts: AnimatorStateScript[]|null = null;

	/**名称。*/
	name: string;
	/**动画播放速度,1.0为正常播放速度。*/
	speed: number = 1.0;
	/**动作播放起始时间。*/
	clipStart: number = 0.0;
	/**动作播放结束时间。*/
	clipEnd: number = 1.0;

	/**
	 * 动作。
	 */
	get clip(): AnimationClip|null {
		return this._clip;
	}

	set clip(value: AnimationClip|null) {
		if (this._clip !== value) {
			if (this._clip)
				(this._referenceCount > 0) && (this._clip._removeReference(this._referenceCount));
			if (value) {
				var realtimeDatas: Array<number | Vector3 | Quaternion | ConchVector3 | ConchQuaternion> = this._realtimeDatas;
				var clipNodes: KeyframeNodeList = value._nodes!;
				var count: number = clipNodes.count;
				this._currentFrameIndices = new Int16Array(count);
				this._resetFrameIndices();
				(this._referenceCount > 0) && (value._addReference(this._referenceCount));
				this._realtimeDatas.length = count;
				for (var i: number = 0; i < count; i++) {
					switch (clipNodes.getNodeByIndex(i).type) {
						case 0:
							break;
						case 1:
						case 3:
						case 4:
							realtimeDatas[i] = new Vector3();
							break;
						case 2:
							realtimeDatas[i] = new Quaternion();
							break;
						default:
							throw "AnimationClipParser04:unknown type.";
					}
				}
			}
			this._clip = value;
		}
	}

	/**
	 * 创建一个 <code>AnimatorState</code> 实例。
	 */
	constructor() {

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
		(this._clip) && (this._clip._addReference(count));
		this._referenceCount += count;
	}

	/**
	 * @implements IReferenceCounter
	 */
	_removeReference(count: number = 1): void {
		(this._clip) && (this._clip._removeReference(count));
		this._referenceCount -= count;
	}

	/**
	 * @implements IReferenceCounter
	 */
	_clearReference(): void {
		this._removeReference(-this._referenceCount);
	}

	/**
	 * @internal
	 */
	_resetFrameIndices(): void {
		for (var i: number = 0, n: number = this._currentFrameIndices!.length; i < n; i++)
			this._currentFrameIndices![i] = -1;//-1表示没到第0帧,首帧时间可能大于
	}

	/**
	 * 添加脚本。
	 * @param	type  组件类型。
	 * @return 脚本。
	 *
	 */
	addScript(type: typeof AnimatorStateScript): AnimatorStateScript {
		var script: AnimatorStateScript = new type();
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
	getScript(type: typeof AnimatorStateScript): AnimatorStateScript|null {
		if (this._scripts) {
			for (var i: number = 0, n: number = this._scripts.length; i < n; i++) {
				var script: AnimatorStateScript = this._scripts[i];
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
	 */
	getScripts(type: typeof AnimatorStateScript): AnimatorStateScript[]|null {
		var coms: AnimatorStateScript[]|null = null;
		if (this._scripts) {
			for (var i: number = 0, n: number = this._scripts.length; i < n; i++) {
				var script: AnimatorStateScript = this._scripts[i];
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
	cloneTo(destObject: any): void {
		var dest: AnimatorState = <AnimatorState>destObject;
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
	clone(): any {
		var dest: AnimatorState = new AnimatorState();
		this.cloneTo(dest);
		return dest;
	}

}


