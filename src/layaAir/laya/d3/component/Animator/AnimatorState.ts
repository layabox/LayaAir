import { EventDispatcher } from "../../../events/EventDispatcher";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { IClone } from "../../../utils/IClone";
import { AnimationClip } from "../../animation/AnimationClip";
import { AnimatorStateScript } from "../../animation/AnimatorStateScript";
import { KeyframeNodeList } from "../../animation/KeyframeNodeList";
import { Animator, AnimatorParams } from "./Animator";
import { AnimatorTransition } from "./AnimatorTransition";
import { KeyframeNodeOwner, KeyFrameValueType } from "./KeyframeNodeOwner";

/**
 * <code>AnimatorState</code> 类用于创建动作状态。
 */
export class AnimatorState extends EventDispatcher implements IClone {
    /**
     * 动画事件 开始时调用
     */
    static EVENT_OnStateEnter = "OnStartEnter";
    /**
     * 动画事件 更新时调用
     */
    static EVENT_OnStateUpdate = "OnStateUpdate";

    /**
    * 动画事件 循环完成时调用
    */
    static EVENT_OnStateLoop = 'OnStateLoop';
    /**
     * 动画事件 离开时调用
     */
    static EVENT_OnStateExit = "OnStateExit";

    /** @internal */
    private _referenceCount: number = 0;

    /** @internal */
    _clip: AnimationClip | null = null;

    /** @internal */
    _nodeOwners: KeyframeNodeOwner[] = [];//TODO:提出去

    /** @internal */
    _currentFrameIndices: Int16Array | null = null;

    /**
     * @internal
     * 是否循环播放,为0时则使用_clip.islooping，1为循环，2为不循环
     */
    _isLooping: 0 | 1 | 2 = 0;

    /**
     * @internal
     * to avoid data confused,must put realtime datas in animatorState,can't be in animationClip,
     * for example use crossFade() with different animatorState but the sample clip source.
     */
    _realtimeDatas: Array<number | Vector3 | Quaternion> = [];

    /** @internal */
    _scripts: AnimatorStateScript[] | null = null;

    /**@internal 过渡列表*/
    _transitions: AnimatorTransition[] = [];

    /**@internal 优先过渡列表only play this transition */
    _soloTransitions: AnimatorTransition[] = [];

    /**
     * 当前过渡内容
     */
    curTransition: AnimatorTransition;

    /**名称。*/
    name: string;

    /**动画播放速度,1.0为正常播放速度。*/
    speed: number = 1.0;

    /**动作播放起始时间。*/
    clipStart: number = 0.0;

    /**动作播放结束时间。*/
    clipEnd: number = 1.0;
    /**play on awake start offset*/
    cycleOffset: number = 0;

    /**
     * 动作。
     */
    get clip(): AnimationClip | null {
        return this._clip;
    }

    set clip(value: AnimationClip | null) {
        if (this._clip !== value) {
            if (this._clip)
                (this._referenceCount > 0) && (this._clip._removeReference(this._referenceCount));
            if (value) {
                var realtimeDatas: Array<number | Vector3 | Quaternion | Vector2 | Vector4> = this._realtimeDatas;
                var clipNodes: KeyframeNodeList = value._nodes!;
                var count: number = clipNodes.count;
                this._currentFrameIndices = new Int16Array(count);
                this._resetFrameIndices();
                (this._referenceCount > 0) && (value._addReference(this._referenceCount));
                this._realtimeDatas.length = count;
                for (var i: number = 0; i < count; i++) {
                    switch (clipNodes.getNodeByIndex(i).type) {
                        case KeyFrameValueType.Float:
                            break;
                        case KeyFrameValueType.Position:
                        case KeyFrameValueType.Scale:
                        case KeyFrameValueType.RotationEuler:
                        case KeyFrameValueType.Vector3:
                            realtimeDatas[i] = new Vector3();
                            break;
                        case KeyFrameValueType.Rotation:
                            realtimeDatas[i] = new Quaternion();
                            break;
                        case KeyFrameValueType.Vector2:
                            realtimeDatas[i] = new Vector2();
                            break;
                        case KeyFrameValueType.Vector4:
                        case KeyFrameValueType.Color:
                            realtimeDatas[i] = new Vector4();
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
     * 是否循环
     */
    get islooping() {
        if (0 != this._isLooping) {
            return 1 == this._isLooping;
        }
        return this._clip.islooping;
    }

    /**
     * 动画过渡内容(IDE使用)
     */
    get transitions() {
        return this._transitions;
    }

    set transitions(value: AnimatorTransition[]) {
        this._transitions = value;
    }

    /**
     * 优先动画过渡内容(IDE使用)
     */
    get soloTransitions() {
        return this._soloTransitions;
    }

    set soloTransitions(value: AnimatorTransition[]) {
        this._soloTransitions = value
    }



    /**
     * 创建一个 <code>AnimatorState</code> 实例。
     */
    constructor() {
        super();
    }

    /**
     * @internal
     */
    _eventStart(animator: Animator, layerIndex: number) {
        this.event(AnimatorState.EVENT_OnStateEnter);

        if (this._scripts) {
            for (var i: number = 0, n: number = this._scripts.length; i < n; i++) {
                this._scripts[i].setPlayScriptInfo(animator, layerIndex, this);
                this._scripts[i].onStateEnter();
            }
        }
    }

    /**
     * @internal
     */
    _eventExit() {
        this.event(AnimatorState.EVENT_OnStateExit);
        this.curTransition = null;
        if (this._scripts) {
            for (let i = 0, n = this._scripts.length; i < n; i++) {
                this._scripts[i].onStateExit();
            }
        }
    }

    /**
     * @internal
     */
    _eventStateUpdate(value: number) {
        this.event(AnimatorState.EVENT_OnStateUpdate, value);
        if (this._scripts) {
            for (var i = 0, n = this._scripts.length; i < n; i++)
                this._scripts[i].onStateUpdate(value);
        }
    }

    /**
     * @internal
     */
    _eventLoop() {
        this.event(AnimatorState.EVENT_OnStateLoop);
        if (this._scripts) {
            for (let i = 0, n = this._scripts.length; i < n; i++) {
                if (this._scripts[i].onStateLoop)
                    this._scripts[i].onStateLoop();
            }
        }
    }

    /**
     * 派发过渡事件
     * @internal
     * @param normalizeTime 
     * @param paramsMap 
     */
    _eventtransition(normalizeTime: number, paramsMap: AnimatorParams): AnimatorTransition {
        let soloNums = this._soloTransitions.length;
        if (soloNums > 0) {
            for (var i = 0; i < soloNums; i++) {
                if (this._soloTransitions[i].check(normalizeTime, paramsMap))
                    return this._soloTransitions[i];
            }
            return null;
        }
        let transNums = this._transitions.length;
        for (var i = 0; i < transNums; i++) {
            if (this._transitions[i].check(normalizeTime, paramsMap))
                return this._transitions[i];
        }
        return null;
    }



    /**
     * @internal
     */
    _getReferenceCount(): number {
        return this._referenceCount;
    }

    /**
     * @internal
     * @param count 
     */
    _addReference(count: number = 1): void {
        (this._clip) && (this._clip._addReference(count));
        this._referenceCount += count;
    }

    /**
     * @internal
     * @param count 
     */
    _removeReference(count: number = 1): void {
        (this._clip) && (this._clip._removeReference(count));
        this._referenceCount -= count;
    }

    /**
     * @internal
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
    getScript(type: typeof AnimatorStateScript): AnimatorStateScript | null {
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
    getScripts(type: typeof AnimatorStateScript): AnimatorStateScript[] | null {
        var coms: AnimatorStateScript[] | null = null;
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