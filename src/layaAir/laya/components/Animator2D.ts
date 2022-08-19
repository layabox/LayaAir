
import { AnimatorUpdateMode } from "../d3/component/Animator";
import { Stat } from "../utils/Stat";
import { AnimatorControllerLayer2D } from "./AnimatorControllerLayer2D";
import { AnimatorPlayState2D } from "./AnimatorPlayState2D";
import { AnimatorState2D } from "./AnimatorState2D";
import { Component } from "./Component";
import { KeyframeNode2D } from "./KeyframeNode2D";
import { Node } from "../../laya/display/Node";

export class Animator2D extends Component {
    private _speed = 1;

    _controllerLayers: AnimatorControllerLayer2D[];
    /**更新模式*/
    private _updateMode = AnimatorUpdateMode.Normal;
    /**降低更新频率调整值*/
    private _lowUpdateDelty = 20;

    private _isPlaying = true;

    _parameters: Record<string, number | boolean>;


    constructor() {
        super();
        this._controllerLayers = [];
    }


    set speed(num: number) {
        this._speed = num;
    }

    get speed() {
        return this._speed;
    }
    play(name?: string, layerIndex = 0) {
        this._isPlaying = true;
        var controllerLayer = this._controllerLayers[layerIndex];
        if (controllerLayer) {
            var defaultState = controllerLayer.defaultState;
            if (!name && !defaultState)
                throw new Error("Animator:must have default clip value,please set clip property.");

            var playStateInfo = controllerLayer._playStateInfo!;
            var curPlayState = playStateInfo._currentState!;
            var animatorState = name ? controllerLayer._statesMap[name] : defaultState;
            var clipDuration = animatorState._clip!._duration;
            var calclipduration = animatorState._clip!._duration * (animatorState.clipEnd - animatorState.clipStart);

            this.resetDefOwerVal();
            playStateInfo._resetPlayState(0.0, calclipduration);
            if (curPlayState != animatorState) {
                playStateInfo._currentState = animatorState;
            }
            controllerLayer._playType = 0;
        }
        var scripts = animatorState._scripts!;
        if (scripts) {
            for (var i = 0, n = scripts.length; i < n; i++)
                scripts[i].onStateEnter();
        }
    }

    stop() {
        this._isPlaying = false;
    }

    /**
     * 是否正在播放中
     */
    get isPlaying() {
        return this._isPlaying;
    }

    onUpdate(): void {
        if (!this._isPlaying) return;
        var delta = this.owner.timer._delta / 1000.0;
        delta = this._applyUpdateMode(delta);
        if (0 == this.speed || 0 == delta) return;
        var needRender = true;//TODO:有渲染节点才可将needRender变为true

        for (var i = 0, n = this._controllerLayers.length; i < n; i++) {
            var controllerLayer = this._controllerLayers[i];
            if (!controllerLayer.enable)
                continue;


            var playStateInfo = controllerLayer._playStateInfo!;
            //var crossPlayStateInfo = controllerLayer._crossPlayStateInfo!;
            var addtive = controllerLayer.blendingMode != AnimatorControllerLayer2D.BLENDINGMODE_OVERRIDE;
            switch (controllerLayer._playType) {
                case 0:
                    var animatorState = playStateInfo._currentState!;
                    var speed = this._speed * animatorState.speed;
                    var finish = playStateInfo._finish;

                    var loop = animatorState.loop;
                    if (-1 >= loop) {
                        var clip = animatorState._clip!;
                        if (clip.islooping) {
                            loop = 0;
                        } else {
                            loop = 1;
                        }
                    }


                    finish || this._updatePlayer(animatorState, playStateInfo, delta * speed, loop);
                    if (needRender) {
                        this._updateClipDatas(animatorState, addtive, playStateInfo);
                        this._setClipDatasToNode(animatorState, addtive, controllerLayer.defaultWeight, i == 0, controllerLayer);//多层动画混合时即使动画停止也要设置数据
                    }

                    if (finish) {
                        var next = playStateInfo.checkPlayNext();
                        if (next) {
                            this.play(next.name, i);
                        }
                    }




                    break;
            }

        }

    }
    set debug(b: boolean) {
        this._isPlaying = b;

        if (b) {
            this.owner.timer.frameLoop(1, this, this.onUpdate);
            this.onEnable();
        } else {
            this.stop();
        }
    }

    public get controllerLayers(): ReadonlyArray<AnimatorControllerLayer2D> {
        return this._controllerLayers;
    }

    public set controllerLayers(layers: ReadonlyArray<AnimatorControllerLayer2D>) {
        if (this._controllerLayers == layers)
            return;

        let oldLayers: Array<AnimatorControllerLayer2D> = this._controllerLayers;
        if (oldLayers.length > 0) {
            let i = 0;
            while (i < oldLayers.length) {
                if (layers.indexOf(oldLayers[i]) == -1)
                    oldLayers.splice(i, 1);
                else
                    i++;
            }
        }

        if (layers.length > 0) {
            let newAdded = layers.filter(s => oldLayers.indexOf(s) == -1);
            for (let layer of newAdded)
                this.addControllerLayer(layer);
        }

        this._controllerLayers.length = 0;
        this._controllerLayers.push(...layers);
    }

    /**
     * 添加控制器层。
     */
    addControllerLayer(controllderLayer: AnimatorControllerLayer2D): void {
        this._controllerLayers.push(controllderLayer);
    }



    /**
   * 赋值Node数据
   * @param stateInfo 动画状态
   * @param additive 是否为addtive
   * @param weight state权重
   * @param isFirstLayer 是否是第一层
   */
    private _setClipDatasToNode(stateInfo: AnimatorState2D, additive: boolean, weight: number, isFirstLayer: boolean, controllerLayer: AnimatorControllerLayer2D = null): void {
        var realtimeDatas = stateInfo._realtimeDatas;
        var nodes = stateInfo._clip!._nodes!;
        for (var i = 0, n = nodes.count; i < n; i++) {
            var node = nodes.getNodeByIndex(i);
            var o = this.getOwner(node);
            o && this._applyFloat(o, additive, weight, isFirstLayer, realtimeDatas[i]);
        }
    }
    private _applyFloat(o: { ower: Node, pro: { name: string, defVal: any }[] }, additive: boolean, weight: number, isFirstLayer: boolean, data: string | number | boolean): void {
        var pro = o.pro;
        for (var i = pro.length - 1; i >= 0; i--) {

            if (additive && "number" == typeof data) {
                (o.ower as any)[pro[i].name] = pro[i].defVal + data;
            } else
                (o.ower as any)[pro[i].name] = data;
        }
    }

    private resetDefOwerVal() {
        if (this._ownerMap) {
            this._ownerMap.forEach((val, key) => {
                var ower = val.ower;
                var pro = val.pro;
                for (var i = pro.length - 1; i >= 0; i--) {
                    pro[i].defVal = (ower as any)[pro[i].name]
                }
            })
        }
    }


    private _ownerMap: Map<KeyframeNode2D, { ower: Node, pro: { name: string, defVal: any }[] }>
    private getOwner(node: KeyframeNode2D) {
        var ret: { ower: Node, pro: { name: string, defVal: any }[] };
        if (this._ownerMap) {
            ret = this._ownerMap.get(node);
            if (ret) {
                return ret;
            }
        }



        var property = this.owner;
        for (var j = 0, m = node.ownerPathCount; j < m; j++) {
            var ownPat = node.getOwnerPathByIndex(j);
            if ("" == ownPat) {
                break;
            } else {
                property = property.getChildByName(ownPat);
                if (!property)
                    break;
            }
        }

        ret = { ower: property, pro: [] };

        if (property) {
            var propertyCount = node.propertyCount;
            for (var i = 0; i < propertyCount; i++) {
                //var fun: Function = (property as any)[node.getPropertyByIndex(i)];
                //ret.pro.push(node.getPropertyByIndex(i));
                var pname = node.getPropertyByIndex(i);
                ret.pro.push({ name: pname, defVal: (property as any)[pname] });

            }
            //console.log(node.getPropertyByIndex(i));
        }
        if (null == this._ownerMap) {
            this._ownerMap = new Map();
        }
        this._ownerMap.set(node, ret);
        return ret;


    }

    // private _addKeyframeNodeOwner(node: KeyframeNode2D, propertyOwner: any): void {
    // }



    /**
  * 更新clip数据
  * @internal
  */
    private _updateClipDatas(animatorState: AnimatorState2D, addtive: boolean, playStateInfo: AnimatorPlayState2D): void {
        var clip = animatorState._clip;
        var clipDuration = clip!._duration;

        var curPlayTime = animatorState.clipStart * clipDuration + playStateInfo._normalizedPlayTime * playStateInfo._duration;
        var currentFrameIndices = animatorState._currentFrameIndices;
        var frontPlay = playStateInfo._frontPlay;
        clip!._evaluateClipDatasRealTime(curPlayTime, currentFrameIndices, addtive, frontPlay, animatorState._realtimeDatas);
    }


    private _updatePlayer(animatorState: AnimatorState2D, playState: AnimatorPlayState2D, elapsedTime: number, loop: number): void {

        var clipDuration = animatorState._clip!._duration * (animatorState.clipEnd - animatorState.clipStart);
        var lastElapsedTime = playState._elapsedTime;
        var elapsedTime = lastElapsedTime + elapsedTime;
        playState._lastElapsedTime = lastElapsedTime;
        playState._elapsedTime = elapsedTime;
        var normalizedTime = elapsedTime / clipDuration;//TODO:时候可以都统一为归一化时间
        var playTime = normalizedTime % 1.0;
        playState._normalizedPlayTime = playTime < 0 ? playTime + 1.0 : playTime;
        playState._duration = clipDuration;

        var isPlayFin = false;

        if (elapsedTime >= clipDuration) {
            if (animatorState.yoyo) {
                if (!playState._frontPlay) {
                    if (elapsedTime >= clipDuration * 2) {
                        playState._elapsedTime = 0;
                        playState._normalizedPlayTime = 0;
                        playState._frontPlay = true;
                        playState._playNum += 1;
                        isPlayFin = true;
                    }
                } else {
                    playState._frontPlay = false;
                    if (!playState._frontPlay) {
                        playState._elapsedTime = clipDuration;
                        playState._normalizedPlayTime = 1;
                    }
                }

            } else {
                playState._playNum += 1;
                isPlayFin = true;
                playState._elapsedTime = clipDuration;
                playState._normalizedPlayTime = 1;
            }
        }

        if (!playState._frontPlay && playState._elapsedTime != clipDuration) {
            playState._normalizedPlayTime = 1 - playState._normalizedPlayTime;
        }


        if (isPlayFin) {
            if (0 != loop && playState._playNum >= loop) {
                playState._finish = true;
            } else {
                playState._elapsedTime = 0;
                playState._normalizedPlayTime = 0;
            }

        }
        var scripts = animatorState._scripts;
        if (scripts) {
            for (var i = 0, n = scripts.length; i < n; i++) {
                if (isPlayFin) {
                    scripts[i].onStateExit();
                } else {
                    scripts[i].onStateUpdate();
                }
            }
        }




    }



    private _applyUpdateMode(delta: number): number {
        let ret;
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
        }
        return ret;
    }


    onEnable() {
        if (this._isPlaying) {
            for (var i = 0, n = this._controllerLayers.length; i < n; i++) {
                if (this._controllerLayers[i].playOnWake) {
                    var defaultClip = this.getDefaultState(i);
                    (defaultClip) && (this.play(null, i));
                }
            }
        }
    }
    getDefaultState(layerIndex = 0) {
        var controllerLayer = this._controllerLayers[layerIndex];
        return controllerLayer.defaultState;
    }

    onDestroy() {
        for (var i = 0, n = this._controllerLayers.length; i < n; i++)
            this._controllerLayers[i].destroy();
        this._controllerLayers.length = 0;
        this._isPlaying = false;
        this._parameters = null;
    }
}