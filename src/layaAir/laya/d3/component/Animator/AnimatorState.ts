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
 * @en The AnimatorState class is used to create animation states.
 * @zh AnimatorState 类用于创建动画状态。
 */
export class AnimatorState extends EventDispatcher implements IClone {
    /**
     * @en Animation event called when the state is entered.
     * @zh 动画事件，在进入状态时调用。
     */
    static EVENT_OnStateEnter = "OnStartEnter";
    /**
     * @en Animation event called when the state is updated.
     * @zh 动画事件，在更新状态时调用。
     */
    static EVENT_OnStateUpdate = "OnStateUpdate";

    /**
     * @en Animation event called when a loop is completed.
     * @zh 动画事件，在循环完成时调用。
     */
    static EVENT_OnStateLoop = 'OnStateLoop';
    /**
     * @en Animation event called when the state is exited.
     * @zh 动画事件，在离开状态时调用。
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
     * @en Whether to loop playback. 0 uses _clip.islooping, 1 for loop, 2 for no loop.
     * @zh 是否循环播放。0表示使用_clip.islooping，1表示循环，2表示不循环。
     */
    _isLooping: 0 | 1 | 2 = 0;

    /**
     * @internal
     * @en Realtime data array to avoid data confusion. Must store realtime data in animatorState, not in animationClip.
     * This is necessary for operations like crossFade() with different animatorStates but the same clip source.
     * @zh 实时数据数组，用于避免数据混淆。必须将实时数据存储在animatorState中，而不是animationClip中。
     * 这对于像crossFade()这样的操作是必要的，因为可能使用不同的animatorState但相同的片段源。
     */
    _realtimeDatas: Array<number | Vector3 | Quaternion> = [];

    /** @internal */
    _scripts: AnimatorStateScript[] | null = null;

    /**
     * @internal
     * @en List of transitions.
     * @zh 过渡列表。
     */
    _transitions: AnimatorTransition[] = [];

    /**
     * @internal
     * @en List of solo transitions that only play this transition.
     * @zh 优先过渡列表，只播放此过渡。
     */
    _soloTransitions: AnimatorTransition[] = [];

    /**
     * @en Current transition content.
     * @zh 当前过渡内容。
     */
    curTransition: AnimatorTransition;

    /**
     * @en Name of the animator state.
     * @zh 动画状态的名称。
     */
    name: string;

    /**
     * @en Animation playback speed. 1.0 is normal playback speed.
     * @zh 动画播放速度。1.0为正常播放速度。
     */
    speed: number = 1.0;

    /**
     * @en Start time of animation playback.
     * @zh 动画播放的起始时间。
     */
    clipStart: number = 0.0;

    /**
     * @en End time of animation playback.
     * @zh 动画播放的结束时间。
     */
    clipEnd: number = 1.0;
    /**
     * @en Play on awake start offset.
     * @zh 唤醒时播放的起始偏移量。
     */
    cycleOffset: number = 0;

    /**
     * @en The animation clip.
     * @zh 动画片段。
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
     * @en Whether the animation is looping.
     * @zh 动画是否循环播放。
     */
    get islooping() {
        if (0 != this._isLooping) {
            return 1 == this._isLooping;
        }
        return this._clip.islooping;
    }

    /**
     * @en The animation transition content (used by IDE).
     * @zh 动画过渡内容（IDE使用）。
     */
    get transitions() {
        return this._transitions;
    }

    set transitions(value: AnimatorTransition[]) {
        this._transitions = value;
    }

    /**
     * @en The priority animation transition content (used by IDE).
     * @zh 优先动画过渡内容（IDE使用）。
     */
    get soloTransitions() {
        return this._soloTransitions;
    }

    set soloTransitions(value: AnimatorTransition[]) {
        this._soloTransitions = value
    }

    /**
     * @en consrtuctor of AnimatorState
     * @zh 动画状态的构造方法
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
     * @internal
     * @en Dispatch transition events.
     * @param normalizeTime Normalized time of the animation.
     * @param paramsMap Map of animator parameters.
     * @returns The triggered transition, or null if no transition is triggered.
     * @zh 派发过渡事件。
     * @param normalizeTime 动画的归一化时间。
     * @param paramsMap 动画参数映射。
     * @returns 触发的过渡，如果没有触发过渡则返回null。
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
     * @en Add a script to the animator state.
     * @param type The type of the script to add.
     * @returns The added script instance.
     * @zh 向动画状态添加脚本。
     * @param type 要添加的脚本类型。
     * @returns 添加的脚本实例。
     */
    addScript(type: typeof AnimatorStateScript): AnimatorStateScript {
        var script: AnimatorStateScript = new type();
        this._scripts = this._scripts || [];
        this._scripts.push(script);
        return script;
    }

    /**
     * @en Get a script of the specified type from the animator state.
     * @param type The type of the script to get.
     * @returns The script of the specified type, or null if not found.
     * @zh 从动画状态获取指定类型的脚本。
     * @param type 要获取的脚本类型。
     * @returns 指定类型的脚本，如果未找到则返回null。
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
     * @en Get all scripts of the specified type from the animator state.
     * @param type The type of the scripts to get.
     * @returns An array of scripts of the specified type, or null if none found.
     * @zh 从动画状态获取所有指定类型的脚本。
     * @param type 要获取的脚本类型。
     * @returns 指定类型的脚本数组，如果未找到则返回null。
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
     * @en Clone the current AnimatorState to another object.
     * @param destObject The target object to clone to.
     * @zh 将当前AnimatorState克隆到另一个对象。
     * @param destObject 克隆的目标对象。
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
     * @en Create a clone of the current AnimatorState.
     * @returns A new AnimatorState object with the same properties as the current one.
     * @zh 创建当前AnimatorState的克隆。
     * @returns 一个新的AnimatorState对象，具有与当前对象相同的属性。
     */
    clone(): any {
        var dest: AnimatorState = new AnimatorState();
        this.cloneTo(dest);
        return dest;
    }

}