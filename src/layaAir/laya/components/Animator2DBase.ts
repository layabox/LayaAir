import { Stat } from "../utils/Stat";
import { AnimatorPlayState2D } from "./AnimatorPlayState2D";
import { AnimatorState2D } from "./AnimatorState2D";
import { Component } from "./Component";
import { KeyframeNode2D } from "./KeyframeNode2D";
import { Node } from "../../laya/display/Node";
import { ClassUtils } from "../utils/ClassUtils";
import { Animation2DEvent } from "./Animation2DEvent";
import { AnimatorUpdateMode } from "./AnimatorUpdateMode";
import { Loader } from "../net/Loader";
import { ILaya } from "../../ILaya";
import { Vector3 } from "../maths/Vector3";

/**
 * @en Base class for 2D animator components, provides shared clip playback logic.
 * @zh 2D 动画组件基类，提供共用的 clip 播放逻辑。
 * @internal
 */
export class Animator2DBase extends Component {
    /**@internal */
    protected _speed = 1;
    /**@internal 更新模式*/
    protected _updateMode = AnimatorUpdateMode.Normal;
    /**@internal 降低更新频率调整值*/
    protected _lowUpdateDelty = 20;
    /**@internal */
    protected _isPlaying = true;
    /**@internal */
    protected _ownerMap: Map<KeyframeNode2D, { ower: Node, pro?: { ower: any, key: string, defVal: any } }>;
    /**@internal */
    protected _isPlayBack: boolean = false;

    constructor() {
        super();
        this._ownerMap = null;
    }

    /**
     * @en The playback speed of the animation.
     * @zh 播放速度
     */
    get speed() {
        return this._speed;
    }

    set speed(num: number) {
        this._speed = num;
    }

    /**
     * @en If the animation is currently playing.
     * @zh 动画是否正在播放。
     */
    get isPlaying() {
        return this._isPlaying;
    }

    /**
     * @en Assigns data to a Node.
     * @internal
     */
    protected _setClipDatasToNode(stateInfo: AnimatorState2D, additive: boolean, weight: number): void {
        var realtimeDatas = stateInfo._realtimeDatas;
        var nodes = stateInfo._clip!._nodes!;
        for (var i = 0, n = nodes.count; i < n; i++) {
            if (null == realtimeDatas[i]) continue;
            var node = nodes.getNodeByIndex(i);
            var o = this.getOwner(node);
            o && this._applyAniData(o, additive, weight, realtimeDatas[i]);
        }
    }

    /**
     * @internal
     */
    protected _applyAniData(o: { ower: Node, pro?: { ower: any, key: string, defVal: any } }, additive: boolean, weight: number, data: string | number | boolean | { pos: Vector3, rotation: Vector3 }): void {
        var pro = o.pro;
        if (pro && pro.ower) {
            if (additive && "number" === typeof data) {
                pro.ower[pro.key] = pro.defVal + weight * data;
            } else if ("number" === typeof data) {
                pro.ower[pro.key] = weight * data;
            } else if ("object" === typeof data) {
                if (data.pos) {
                    pro.ower.x = data.pos.x;
                    pro.ower.y = data.pos.y;
                }
                if (null != data.rotation) {
                    pro.ower.rotation = data.rotation.z;
                }
            } else {
                if ("string" === typeof data) {
                    if (data.startsWith("tres://")) {
                        let url = data.replace("tres://", "");
                        let source = Loader.getRes(url, Loader.IMAGE);
                        if (source) {
                            data = source;
                        } else {
                            ILaya.loader.load(url, { type: Loader.IMAGE }).then(tex => {
                                if (!this.destroyed) {
                                    pro.ower[pro.key] = tex;
                                }
                            });
                            return;
                        }
                    }
                }
                pro.ower[pro.key] = data;
            }
        }
    }

    /**
     * @internal 更新所有已缓存的owner的defVal为当前属性值
     */
    protected _updateDefVal(): void {
        if (!this._ownerMap) return;
        this._ownerMap.forEach((ownerData) => {
            if (ownerData.pro && ownerData.pro.ower) {
                ownerData.pro.defVal = ownerData.pro.ower[ownerData.pro.key];
            }
        });
    }

    /**
     * @internal
     */
    protected getOwner(node: KeyframeNode2D) {
        var ret: { ower: Node, pro?: { ower: any, key: string, defVal: any } };
        if (this._ownerMap) {
            ret = this._ownerMap.get(node);
            if (ret) return ret;
        }

        var property = this.owner;
        for (var j = 0, m = node.ownerPathCount; j < m; j++) {
            var ownPat = node.getOwnerPathByIndex(j);
            if ("" == ownPat) continue;
            property = property.getChild(ownPat);
            if (!property) break;
        }

        ret = { ower: property };

        if (property) {
            var pobj: any = property;
            var propertyCount = node.propertyCount;
            if (1 == propertyCount) {
                var pname = node.getPropertyByIndex(0);
                ret.pro = { ower: property, key: pname, defVal: (property as any)[pname] };
            } else {
                for (var i = 0; i < propertyCount; i++) {
                    var pname = node.getPropertyByIndex(i);
                    if (i == propertyCount - 1 || null == pobj) {
                        ret.pro = { ower: pobj, key: pname, defVal: pobj ? pobj[pname] : null };
                        break;
                    }
                    if ('_gcmds' === pname && null == pobj[pname] && pobj.graphics) {
                        pobj = pobj.graphics;
                        pname = "cmds";
                    }
                    if (null == pobj[pname] && property == pobj) {
                        pobj = null;
                        var classObj = ClassUtils.getClass(pname);
                        if (classObj) pobj = property.getComponent(classObj);
                    } else {
                        pobj = pobj[pname];
                    }
                }
            }
        }
        if (null == this._ownerMap) this._ownerMap = new Map();
        this._ownerMap.set(node, ret);
        return ret;
    }

    /**
     * @internal 更新clip数据
     */
    protected _updateClipDatas(animatorState: AnimatorState2D, addtive: boolean, playStateInfo: AnimatorPlayState2D): void {
        var clip = animatorState._clip;
        var clipDuration = clip!._duration;
        var curPlayTime = animatorState.clipStart * clipDuration + playStateInfo._normalizedPlayTime * playStateInfo._duration;
        var currentFrameIndices = animatorState._currentFrameIndices;
        let frontPlay = playStateInfo._frontPlay;
        clip!._evaluateClipDatasRealTime(curPlayTime, currentFrameIndices, addtive, frontPlay, animatorState._realtimeDatas);
    }

    /**
     * @internal 仅更新时间与循环，不处理状态机过渡。供 Animator2D/AnimatorClip2D 共用。
     * @returns isReplay 本帧是否发生循环
     */
    protected _updatePlayerTime(animatorState: AnimatorState2D, playState: AnimatorPlayState2D, elapsedTime: number, loop: number): boolean {
        playState._playAllTime += Math.abs(elapsedTime);
        const clipDuration = animatorState.clipEnd - animatorState.clipStart;
        var clipDurationTime = animatorState._clip._duration * clipDuration;
        var lastElapsedTime = playState._elapsedTime;
        var elapsedPlaybackTime = lastElapsedTime + elapsedTime;
        playState._lastElapsedTime = lastElapsedTime;
        playState._elapsedTime = elapsedPlaybackTime;
        var normalizedTime = elapsedPlaybackTime / clipDurationTime;
        var playTime = normalizedTime % 1.0;
        const normalizedPlayTime = playTime < 0 ? playTime + 1.0 : playTime;
        playState._normalizedPlayTime = normalizedPlayTime;
        playState._duration = clipDurationTime;
        let parentPlayNum = Math.floor(Math.abs(lastElapsedTime) / clipDurationTime);
        let playNum = Math.floor(Math.abs(elapsedPlaybackTime) / clipDurationTime);
        if (animatorState.yoyo) {
            this._isPlayBack = 0 != Math.floor(playNum) % 2;
            if (this._isPlayBack) playState._normalizedPlayTime = 1 - playState._normalizedPlayTime;
            parentPlayNum = Math.floor(parentPlayNum / 2);
            playNum = Math.floor(playNum / 2);
        }
        if (0 < loop && loop <= playNum) {
            playState._finish = true;
            if (animatorState.yoyo) playState._normalizedPlayTime = 0;
            else playState._normalizedPlayTime = 1;
        }
        const isReplay = parentPlayNum != playNum;
        if (isReplay) {
            this._updateDefVal();
            animatorState._eventLoop();
        }
        animatorState._eventStateUpdate(playState._normalizedPlayTime);
        return isReplay;
    }

    /**
     * @internal
     */
    protected _updateStateFinish(animatorState: AnimatorState2D, playState: AnimatorPlayState2D): void {
        if (playState._finish) {
            animatorState._eventExit();
        }
    }

    /**
     * @internal
     */
    protected _eventScript(events: Animation2DEvent[], parentPlayTime: number, currPlayTime: number, frontPlay: boolean) {
        let scripts = this.owner.components;
        if (frontPlay) {
            for (let i = 0, len = events.length; i < len; i++) {
                let e = events[i];
                if (e.time > parentPlayTime && e.time <= currPlayTime) {
                    for (let j = 0, m = scripts.length; j < m; j++) {
                        let script = scripts[j];
                        if (script._isScript()) {
                            let fun: Function = (script as any)[e.eventName];
                            (fun) && (fun.apply(script, e.params));
                        }
                    }
                } else if (e.time > currPlayTime) break;
            }
        } else {
            for (let i = events.length - 1; i >= 0; i--) {
                let e = events[i];
                if (e.time < parentPlayTime && e.time >= currPlayTime) {
                    for (let j = 0, m = scripts.length; j < m; j++) {
                        let script = scripts[j];
                        if (script._isScript()) {
                            let fun: Function = (script as any)[e.eventName];
                            (fun) && (fun.apply(script, e.params));
                        }
                    }
                } else if (e.time < currPlayTime) break;
            }
        }
    }

    /**
     * @internal
     */
    protected _updateEventScript(stateInfo: AnimatorState2D, playStateInfo: AnimatorPlayState2D): void {
        let clip = stateInfo._clip;
        let events = clip!._animationEvents;
        if (!events || 0 == events.length) return;
        let clipDuration = clip!._duration;
        var curPlayTime = playStateInfo.animatorState.clipStart * clipDuration + playStateInfo._normalizedPlayTime * playStateInfo._duration;
        let frontPlay = playStateInfo._frontPlay;
        const speed = playStateInfo._currentState.speed;
        if (0 > speed) frontPlay = !frontPlay;
        if (this._isPlayBack) frontPlay = !frontPlay;
        let pTime = playStateInfo._parentPlayTime;
        let parentPlayTime = playStateInfo._parentPlayTime;
        if (null == parentPlayTime) {
            if (frontPlay) parentPlayTime = clipDuration * playStateInfo.animatorState.clipStart;
            else parentPlayTime = clipDuration * playStateInfo.animatorState.clipEnd;
        }
        if (frontPlay) {
            if (curPlayTime < parentPlayTime) {
                const cpt = playStateInfo.animatorState.clipStart * clipDuration + playStateInfo._duration;
                this._eventScript(events, parentPlayTime, cpt, true);
                parentPlayTime = playStateInfo.animatorState.clipStart * clipDuration;
            }
        } else {
            if (curPlayTime > parentPlayTime) {
                const cpt = playStateInfo.animatorState.clipStart * clipDuration;
                this._eventScript(events, parentPlayTime, cpt, false);
                parentPlayTime = playStateInfo.animatorState.clipStart * clipDuration + playStateInfo._duration;
            }
        }
        this._eventScript(events, parentPlayTime, curPlayTime, frontPlay);
        if (pTime == playStateInfo._parentPlayTime) {
            playStateInfo._parentPlayTime = curPlayTime;
        }
    }

    /**
     * @internal
     */
    protected _applyUpdateMode(delta: number): number {
        let ret: number;
        switch (this._updateMode) {
            case AnimatorUpdateMode.Normal:
                ret = delta;
                break;
            case AnimatorUpdateMode.LowFrame:
                ret = (Stat.loopCount % this._lowUpdateDelty == 0) ? delta * this._lowUpdateDelty : 0;
                break;
            case AnimatorUpdateMode.UnScaleTime:
                ret = 0;
                break;
            default:
                ret = delta;
        }
        return ret;
    }

    /**
     * @en Reset the base values for additive animations.
     * @zh 重置additive动画的基础值。
     */
    resetAdditiveBaseValues() {
        if (this._ownerMap) this._ownerMap.clear();
    }
}
