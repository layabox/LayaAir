import { AnimatorStateScript } from "../d3/animation/AnimatorStateScript";
import { EventDispatcher } from "../events/EventDispatcher";
import { IClone } from "../utils/IClone";
import { Animation2DParm } from "./Animation2DParm";
import { AnimationClip2D } from "./AnimationClip2D";
import { AnimatorTransition2D } from "./AnimatorTransition2D";

/**
 * <code>Animator</code> 类用于创建动画组件。
 */
export class AnimatorState2D extends EventDispatcher implements IClone {
    /**@internal */
    static EVENT_OnStateEnter = "OnStartEnter";

    /**@internal */
    static EVENT_OnStateUpdate = "OnStateUpdate";

    /**@internal */
    static EVENT_OnStateExit = "OnStateExit";

    /** @internal */
    private _referenceCount = 0;

    /** @internal */
    _clip: AnimationClip2D | null = null;

    /**@internal */
    _currentFrameIndices: Int16Array | null = null;

    /**
     * 名称
     */
    name: string;

    /**
     * 动画播放速度
     */
    speed = 1.0;

    /**
     * 动作播放起始时间。
     */
    clipStart = 0.0;

    /**
     * 动作播放结束时间。
     */
    clipEnd = 1.0;

    /**
     *  动画循环次数，-1或者小于-1为使用clip的循环状态，1为播放一次，2为播放2次，0为无限循环
     */
    loop = -1;

    /**
     * 是否为一次正播放，一次倒播放模式 
     */
    yoyo = false;

    /**@internal 过渡列表*/
    transitions: AnimatorTransition2D[] = [];

    /**@internal 优先过渡列表only play this transition */
    soloTransitions: AnimatorTransition2D[] = [];

    /**@internal */
    _scripts: AnimatorStateScript[] | null = null;

    /**@internal */
    _realtimeDatas: Array<number | string | boolean> = [];

    /**
     * 动作。
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
    _eventStart() {
        this.event(AnimatorState2D.EVENT_OnStateEnter);
        if (this._scripts) {
            for (var i: number = 0, n: number = this._scripts.length; i < n; i++)
                this._scripts[i].onStateEnter();
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
     * 派发过渡事件
     * @internal
     * @param normalizeTime 
     * @param paramsMap 
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
     * 添加脚本。
     * @param	type  组件类型。
     * @return 脚本。
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
     * 克隆
     * @returns 
     */
    clone() {
        var dest: AnimatorState2D = new AnimatorState2D();
        this.cloneTo(dest);
        return dest;
    }

    /**
     * 拷贝到目标
     * @param destObject 目标节点
     */
    cloneTo(destObject: any): void {
        var dest: AnimatorState2D = <AnimatorState2D>destObject;
        dest.name = this.name;
        dest.speed = this.speed;
        dest.clip = this._clip;
    }

    /**
     * 删除
     */
    destroy() {
        this._clip = null;
        this._currentFrameIndices = null;
        this._scripts = null;
        //this.nexts = null;
        this._realtimeDatas.length = 0;
    }

}