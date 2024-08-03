
import { EventDispatcher } from "../events/EventDispatcher";
import { IClone } from "../utils/IClone";
import { Animation2DParm } from "./Animation2DParm";
import { AnimationClip2D } from "./AnimationClip2D";
import { Animator2D } from "./Animator2D";
import { AnimatorState2DScript } from "./AnimatorState2DScript";
import { AnimatorTransition2D } from "./AnimatorTransition2D";

/**
 * @en The Animator class is used to create animation components.
 * @zh Animator 类用于创建动画组件。
 */
export class AnimatorState2D extends EventDispatcher implements IClone {
    /**
     * @internal
     * @en Event triggered when entering the state
     * @zh 进入状态时触发的事件
     */
    static EVENT_OnStateEnter = "OnStartEnter";

    /**
     * @internal
     * @en Event triggered during state update
     * @zh 状态更新时触发的事件
     */
    static EVENT_OnStateUpdate = "OnStateUpdate";

    /**
     * @internal
     * @en Event triggered when exiting the state
     * @zh 退出状态时触发的事件
     */
    static EVENT_OnStateExit = "OnStateExit";

    /**
     * @internal
     * @en Event triggered when the state loops
     * @zh 状态循环时触发的事件
     */
    static EVENT_OnStateLoop = 'OnStateLoop';

    /** @internal */
    private _referenceCount = 0;

    /** @internal */
    _clip: AnimationClip2D | null = null;

    /**@internal */
    _currentFrameIndices: Int16Array | null = null;

    /**
     * @en Play on awake start offset
     * @zh 启动时播放偏移 
     */
    cycleOffset: number = 0;

    /**
     * @en name
     * @zh 名称
     */
    name: string;

    /**
     * @en Animation playback speed
     * @zh 动画播放速度
     */
    speed = 1.0;

    /**
     * @en Action playback start time.
     * @zh 动作播放起始时间
     */
    clipStart = 0.0;

    /**
     * @en The end time of the action playback.
     * @zh 动作播放结束时间。
     */
    clipEnd = 1.0;

    /**
     * @en The number of animation loops. -1 or less than -1 to use the loop state of the clip, 1 for playing once, 2 for playing twice, 0 for infinite looping.
     * @zh 动画循环次数，-1或小于-1使用clip的循环状态，1表示播放一次，2表示播放两次，0表示无限循环。
     */
    loop = -1;

    /**
     * @en Is it a one-time forward playback and one-time reverse playback mode
     * @zh 是否为一次正播放，一次倒播放模式 
     */
    yoyo = false;

    /**
     * @internal
     * @en The list of transitions for the animator.
     * @zh 动画器的过渡列表。
     */
    transitions: AnimatorTransition2D[] = [];

    /**
     * @internal
     * @en Priority Transition List.
     * @zh 优先过渡列表。
     */
    soloTransitions: AnimatorTransition2D[] = [];

    /**@internal */
    _scripts: AnimatorState2DScript[] | null = null;

    /**@internal */
    _realtimeDatas: Array<number | string | boolean> = [];

    /**
     * @en Animation Clip
     * @zh 动画剪辑
     */
    get clip(): AnimationClip2D | null {
        return this._clip;
    }

    set clip(value: AnimationClip2D | null) {
        if (this._clip != value) {
            if (this._clip)
                (this._referenceCount > 0) && (this._clip._removeReference(this._referenceCount));
            if (value) {
                var clipNodes = value._nodes!;
                var count = clipNodes.count;
                this._currentFrameIndices = new Int16Array(count);
                this._resetFrameIndices();
                (this._referenceCount > 0) && (value._addReference(this._referenceCount));
                this._realtimeDatas.length = count;
            }
            this._clip = value;
        }
    }

    /**
     * @internal
     */
    _eventStateUpdate(value: number) {
        this.event(AnimatorState2D.EVENT_OnStateUpdate, value);
        if (this._scripts) {
            for (var i = 0, n = this._scripts.length; i < n; i++)
                this._scripts[i].onStateUpdate(value);
        }
    }

    /**
     * @internal
     */
    _eventStart(animator: Animator2D, layerIndex: number) {
        this.event(AnimatorState2D.EVENT_OnStateEnter);
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
        this.event(AnimatorState2D.EVENT_OnStateExit);
        if (this._scripts) {
            for (let i = 0, n = this._scripts.length; i < n; i++) {
                this._scripts[i].onStateExit();
            }
        }
    }
    /**
     * @internal
     */
    _eventLoop() {
        this.event(AnimatorState2D.EVENT_OnStateLoop);
        if (this._scripts) {
            for (let i = 0, n = this._scripts.length; i < n; i++) {
                if (this._scripts[i].onStateLoop)
                    this._scripts[i].onStateLoop();
            }
        }
    }

    /**
     * @en Dispatches the transition event and checks for transitions based on normalized time and parameters.
     * @param normalizeTime The normalized time for transition checking.
     * @param paramsMap The map of parameters for transition checking.
     * @param isReplay Whether to repeat playback.
     * @zh 派发过渡事件并根据归一化时间和参数检查过渡。
     * @param normalizeTime 用于检查过渡的归一化时间。
     * @param paramsMap 用于检查过渡的参数映射。
     * @param isReplay 是否重复播放
     */
    _eventtransition(normalizeTime: number, paramsMap: Record<string, Animation2DParm>, isReplay: boolean): AnimatorTransition2D {
        let soloNums = this.soloTransitions.length;
        if (soloNums > 0) {
            for (var i = 0; i < soloNums; i++) {
                if (this.soloTransitions[i].check(normalizeTime, paramsMap, isReplay))
                    return this.soloTransitions[i];
            }
            return null;
        }
        let transNums = this.transitions.length;
        for (var i = 0; i < transNums; i++) {
            if (this.transitions[i].check(normalizeTime, paramsMap, isReplay))
                return this.transitions[i];
        }
        return null;
    }

    /**
     * @internal
     */
    _resetFrameIndices(): void {
        for (var i = 0, n = this._currentFrameIndices!.length; i < n; i++)
            this._currentFrameIndices![i] = -1;
    }

    /**
     * @internal
     * @returns 
     */
    _getReferenceCount(): number {
        return this._referenceCount;
    }

    /**
     * @internal
     * @param count 
     */
    _addReference(count: number): void {
        (this._clip) && (this._clip._addReference(count));
        this._referenceCount += count;
    }

    /**
     * @internal
     * @param count 
     */
    _removeReference(count: number): void {
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
     * @en Adds a script of the specified type to the animator state.
     * @param type The type of the script to be added.
     * @returns The added script instance.
     * @zh 向动画状态添加指定类型的脚本。
     * @param type 要添加的脚本类型。
     * @returns 添加的脚本实例。
     */
    addScript(type: typeof AnimatorState2DScript): AnimatorState2DScript {
        var script: AnimatorState2DScript = new type();
        this._scripts = this._scripts || [];
        this._scripts.push(script);
        return script;
    }



    /**
     * @en Get the script of the specified type.
     * @param type The type of the script to retrieve.
     * @returns The script instance if found, or null if not found.
     * @zh 获取指定类型的脚本。
     * @param type 要检索的脚本类型。
     * @returns 如果找到则返回脚本实例，如果没有找到则返回 null。
     */
    getScript(type: typeof AnimatorState2DScript): AnimatorState2DScript | null {
        if (this._scripts) {
            for (var i: number = 0, n: number = this._scripts.length; i < n; i++) {
                var script: AnimatorState2DScript = this._scripts[i];
                if (script instanceof type)
                    return script;
            }
        }
        return null;
    }

    /**
     * @en Get the collection of scripts of the specified type.
     * @param type The type of scripts to retrieve.
     * @returns An array of scripts if found, or null if no scripts match the type.
     * @zh 获取指定类型的脚本集合。
     * @param type 要检索的脚本类型。
     * @returns 如果找到则返回脚本数组，如果没有找到匹配类型的脚本则返回 null。
     */
    getScripts(type: typeof AnimatorState2DScript): AnimatorState2DScript[] | null {
        var coms: AnimatorState2DScript[] | null = null;
        if (this._scripts) {
            for (var i: number = 0, n: number = this._scripts.length; i < n; i++) {
                var script: AnimatorState2DScript = this._scripts[i];
                if (script instanceof type) {
                    coms = coms || [];
                    coms.push(script);
                }
            }
        }
        return coms;
    }

    /**
     * @en Clone of the current instance.
     * @returns A new instance of AnimatorState2D that is a clone of the current instance.
     * @zh 当前实例的克隆
     * @returns 一个新的 AnimatorState2D 实例，是当前实例的克隆。
     */
    clone() {
        var dest: AnimatorState2D = new AnimatorState2D();
        this.cloneTo(dest);
        return dest;
    }

    /**
     * @en Copies the properties of the current animator state to a target object.
     * @param destObject The target object to which the properties are copied.
     * @zh 将当前动画状态的属性拷贝到目标对象。
     * @param destObject 要拷贝属性的目标对象。
     */
    cloneTo(destObject: any): void {
        var dest: AnimatorState2D = <AnimatorState2D>destObject;
        dest.name = this.name;
        dest.speed = this.speed;
        dest.clip = this._clip;
    }

    /**
     * @en Destroys .
     * @zh 销毁。
     */
    destroy() {
        this._clip = null;
        this._currentFrameIndices = null;
        this._scripts = null;
        //this.nexts = null;
        this._realtimeDatas.length = 0;
    }

}