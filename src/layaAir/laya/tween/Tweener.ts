import { ILaya } from "../../ILaya";
import { IPool, Pool } from "../utils/Pool";
import { Ease } from "./Ease";
import { TweenValue, TweenValueAdapterKey } from "./TweenValue";
import { Color } from "../maths/Color";
import { EaseFunction, TweenInterpolator, ITweener, TweenCallback, TweenValueAdapter } from "./ITween";
import type { Tween } from "./Tween";

/**
 * @internal
 */
export type TweenPropInfo = { name: string; type: 0 | 1 | 2 | TweenValueAdapter, offset: number; };

/**
 * @internal
 */
export class Tweener implements ITweener {
    id: number;
    name: string;
    owner: Tween;
    target: any;
    userData: any;
    lifecycleOwner: { destroyed: boolean };

    startValue: TweenValue;
    endValue: TweenValue;
    value: TweenValue;
    deltaValue: TweenValue;

    delay: number;
    duration: number;
    breakpoint: number;
    repeat: number;
    paused: boolean;

    props: Array<TweenPropInfo>;
    ease: EaseFunction;
    easeArgs: any[];
    yoyo: boolean;
    timeScale: number;
    ignoreEngineTimeScale: boolean;
    snapping: boolean;
    interp: TweenInterpolator<any>;
    interpArgs: any[];

    onUpdate: TweenCallback;
    onStart: TweenCallback;
    onComplete: TweenCallback;
    onUpdateCaller: any;
    onStartCaller: any;
    onCompleteCaller: any;

    _killed: boolean;
    _started: boolean;
    _ended: number;
    _startFrame: number;
    _elapsedTime: number;
    _normalizedTime: number;
    _active: boolean;

    static create(owner: Tween): Tweener {
        let tweener = Tweener._pool.take();
        _activeTweens[_totalActiveTweens++] = tweener;
        tweener.owner = owner;
        return tweener;
    }

    static getTween(id: number): Tweener | null {
        return _activeTweenMap.get(id);
    }

    static isTweening(target: any): boolean {
        if (target == null)
            return false;

        for (let i = 0; i < _totalActiveTweens; i++) {
            let tweener = _activeTweens[i];
            if (tweener && tweener.target == target && !tweener._killed)
                return true;
        }

        return false;
    }

    static getTweens(target: any, out?: Array<Tween>): Array<Tween> {
        out = out || [];
        if (target == null)
            return out;

        let cnt = _totalActiveTweens;
        for (let i = 0; i < cnt; i++) {
            let tweener = _activeTweens[i];
            if (tweener && tweener.target == target && !tweener._killed) {
                out.push(tweener.owner);
            }
        }

        return out;
    }

    static kill(tweenId: number, complete?: boolean): boolean {
        let tween = _activeTweenMap.get(tweenId);
        if (!tween || tween._killed)
            return false;

        tween.kill(complete);
        return true;
    }

    static killAll(target: any, completed?: boolean): boolean {
        if (target == null)
            return false;

        let flag = false;
        let cnt = _totalActiveTweens;
        for (let i = 0; i < cnt; i++) {
            let tweener = _activeTweens[i];
            if (tweener && tweener.target == target && !tweener._killed) {
                tweener.kill(completed);
                flag = true;
            }
        }

        return flag;
    }

    constructor() {
        this.props = [];
        this.easeArgs = [];
        this.interpArgs = [];
        this.startValue = new TweenValue(this.props);
        this.endValue = new TweenValue(this.props);
        this.value = new TweenValue(this.props);
        this.deltaValue = new TweenValue(this.props);
    }

    go<T>(propName: string, startValue: T, endValue: T): this {
        let prop = _propsPool.take();
        this.props.push(prop);
        prop.name = propName;
        prop.offset = this.startValue.nums.length;

        const type = typeof (startValue);
        let adapter: TweenValueAdapter;
        if (type === "number") {
            prop.type = 0;
            this.startValue.nums.push(startValue as number);
            this.endValue.nums.push(endValue as number);
        }
        else if (type === "string") {//for string color
            this.startValue.nums.push(Color.stringToHex(startValue as string));
            this.endValue.nums.push(Color.stringToHex(endValue as string));
            prop.type = 2;
        }
        else if (type == "object" && (adapter = (<any>startValue)[TweenValueAdapterKey]) != null) {
            adapter.write(this.startValue.nums, startValue);
            adapter.write(this.endValue.nums, endValue);
            prop.type = adapter;
        }
        else { //default use boolean
            this.startValue.nums.push(startValue ? 1 : 0);
            this.endValue.nums.push(endValue ? 1 : 0);
            prop.type = 1;
        }

        return this;
    }

    get normalizedTime(): number {
        return this._normalizedTime;
    }

    get breaking(): boolean {
        return this._ended == 1;
    }

    get remainTime(): number {
        if (this.breakpoint >= 0)
            return this.delay + this.breakpoint - this._elapsedTime;
        else if (this.repeat >= 0)
            return this.delay + this.duration * (this.repeat + 1) - this._elapsedTime;
        else
            return this.delay + this.duration * 2 - this._elapsedTime;
    }

    activate() {
        this._active = true;
        this._startFrame = ILaya.timer.currFrame;
    }

    seek(time: number): void {
        if (this._killed)
            return;

        this._elapsedTime = time;
        if (this._elapsedTime < this.delay) {
            if (this._started)
                this._elapsedTime = this.delay;
            else
                return;
        }

        this.update2();
    }

    kill(complete?: boolean): void {
        if (this._killed)
            return;

        if (complete) {
            if (this._ended == 0) {
                this._elapsedTime = 0;
                this._elapsedTime = this.remainTime;
                this.update2();
            }

            this.callCompleteCallback();
        }

        this._killed = true;
    }

    private init(): void {
        _idCounter++;
        if (_idCounter < 1)
            _idCounter = 1;
        this.id = _idCounter;
        _activeTweenMap.set(this.id, this);
        this.name = null;
        this.delay = 0;
        this.duration = 0;
        this.breakpoint = -1;

        this.startValue.nums.length = 0;
        this.endValue.nums.length = 0;
        this.value.nums.length = 0;
        this.ease = Ease.linear;
        this.easeArgs.length = 0;
        this.timeScale = 1;
        this.snapping = false;
        this.repeat = 0;
        this.yoyo = false;
        this.interp = null;
        this.interpArgs.length = 0;

        this._started = false;
        this.paused = false;
        this._killed = false;
        this._startFrame = ILaya.timer.currFrame;
        this._elapsedTime = 0;
        this._normalizedTime = 0;
        this._ended = 0;
        this._active = false;
    }

    private reset(): void {
        this.id = -1;
        this.owner = null;
        this.target = null;
        this.lifecycleOwner = null;
        this.userData = null;
        _propsPool.recover(this.props);
        this.onStart = this.onUpdate = this.onComplete = null;
        this.onStartCaller = this.onUpdateCaller = this.onCompleteCaller = null;
    }

    private update(dt: number): void {
        if (this.timeScale != 1)
            dt *= this.timeScale;
        if (dt == 0)
            return;

        if (this._ended != 0) { //Maybe completed by seek
            this.callCompleteCallback();
            this._killed = true;
            return;
        }

        this._elapsedTime += dt;
        this.update2();

        if (this._ended != 0) {
            if (!this._killed) {
                this.callCompleteCallback();
                this._killed = true;
            }
        }
    }

    private update2(): void {
        this._ended = 0;

        if (!this._started) {
            if (this._elapsedTime < this.delay)
                return;

            this._started = true;
            this.value.copy(this.startValue);
            this.deltaValue.nums.length = this.startValue.nums.length;
            this.deltaValue.nums.fill(0);
            this.callStartCallback();
            if (this._killed)
                return;
        }

        let reversed: boolean = false;
        let dur = this.duration;
        let tt: number = this._elapsedTime - this.delay;
        if (this.breakpoint >= 0 && tt >= this.breakpoint) {
            tt = this.breakpoint;
            this._ended = 2;
        }

        if (this.repeat != 0) {
            let round: number = Math.floor(tt / dur);
            tt -= dur * round;
            if (this.yoyo)
                reversed = round % 2 == 1;

            if (this.repeat > 0 && this.repeat - round < 0) {
                if (this.yoyo)
                    reversed = this.repeat % 2 == 1;
                tt = dur;
                this._ended = 1;
            }
        }
        else if (tt >= dur) {
            tt = dur;
            this._ended = 1;
        }

        let t = dur > 0 ? this.ease(reversed ? (dur - tt) : tt, 0, 1, dur, ...this.easeArgs) : 1;
        this._normalizedTime = t;

        let startNums = this.startValue.nums;
        let endNums = this.endValue.nums;
        let valueNums = this.value.nums;
        let deltaNums = this.deltaValue.nums;

        valueNums.fill(0);
        deltaNums.fill(0);

        if (this.interp) {
            this.interp(t, startNums, endNums, valueNums, ...this.interpArgs);
            for (let i = 0, n = startNums.length; i < n; i++) {
                let f = valueNums[i];
                if (this.snapping)
                    f = Math.round(f);
                deltaNums[i] = f - valueNums[i];
            }
        }
        else {
            for (let i = 0, n = startNums.length; i < n; i++) {
                let n1 = startNums[i];
                let n2 = endNums[i];
                let f = n1 + (n2 - n1) * t;
                if (this.snapping)
                    f = Math.round(f);
                deltaNums[i] = f - valueNums[i];
                valueNums[i] = f;
            }
        }

        if (this.target != null) {
            for (let i = 0, n = this.props.length; i < n; i++) {
                let prop = this.props[i];
                if (prop.name) {
                    let v = prop.type === 1 ? (this._ended === 1 ? this.endValue.read(prop.type, prop.offset)
                        : this.startValue.read(prop.type, prop.offset))
                        : this.value.read(prop.type, prop.offset);

                    if ((prop.type === 0 || prop.type === 1 || prop.type === 2)
                        && this.target[prop.name] === v) //optimize for primitive value
                        continue;

                    this.target[prop.name] = v;
                }
            }
        }

        this.callUpdateCallback();
    }

    private callStartCallback(): void {
        if (this.onStart) {
            try {
                this.onStart.call(this.onStartCaller, this);
            }
            catch (err) {
                console.error("error in start callback > ", err);
            }
        }
    }

    private callUpdateCallback(): void {
        if (this.onUpdate) {
            try {
                this.onUpdate.call(this.onUpdateCaller, this);
            }
            catch (err) {
                console.error("error in update callback > ", err);
            }
        }
    }

    private callCompleteCallback(): void {
        if (this.onComplete) {
            try {
                this.onComplete.call(this.onCompleteCaller, this);
            }
            catch (err) {
                console.error("error in complete callback > ", err);
            }
        }
    }

    static _pool: IPool<Tweener> = Pool.createPool(Tweener, e => e.init(), e => e.reset());

    static _runAll(): void {
        let cnt = _totalActiveTweens;
        if (cnt == 0)
            return;

        let frame = ILaya.timer.currFrame;
        let dt = ILaya.timer.delta;
        let udt = ILaya.timer.unscaledDelta;
        let freePosStart = -1;
        for (let i = 0; i < cnt; i++) {
            let tweener = _activeTweens[i];
            if (tweener == null) {
                if (freePosStart == -1)
                    freePosStart = i;
            }
            else if (tweener._killed) {
                _activeTweenMap.delete(tweener.id);
                tweener.owner?._check();
                Tweener._pool.recover(tweener);
                _activeTweens[i] = null;

                if (freePosStart == -1)
                    freePosStart = i;
            }
            else {
                if (tweener.target && (<any>tweener.target).destroyed
                    || tweener.lifecycleOwner && tweener.lifecycleOwner.destroyed)
                    tweener._killed = true;
                else if (!tweener.paused && tweener._active)
                    tweener.update(tweener._startFrame == frame ? 0 : tweener.ignoreEngineTimeScale ? udt : dt);

                if (freePosStart != -1) {
                    _activeTweens[freePosStart] = tweener;
                    _activeTweens[i] = null;
                    freePosStart++;
                }
            }
        }

        if (freePosStart >= 0) {
            if (_totalActiveTweens != cnt) { //new tweens added
                let j = cnt;
                cnt = _totalActiveTweens - cnt;
                for (let i = 0; i < cnt; i++) {
                    _activeTweens[freePosStart++] = _activeTweens[j];
                    _activeTweens[j] = null;
                    j++;
                }
            }
            _totalActiveTweens = freePosStart;
        }
    }

    static _getMap(): ReadonlyMap<number, Tweener> {
        return _activeTweenMap;
    }
}

var _idCounter = 0;
var _totalActiveTweens: number = 0;
const _activeTweens: Tweener[] = [];
const _activeTweenMap: Map<number, Tweener> = new Map();
const _propsPool = Pool.createPool<TweenPropInfo>(<any>Object);