import { Bone } from "./Bone";
import { IkConstraint } from "./IkConstraint";
import { PathConstraint } from "./PathConstraint";
import { BoneSlot } from "./BoneSlot";
import { TfConstraint } from "./TfConstraint";
import { SkinData } from "./SkinData";
import { EventData } from "./EventData";
import { DrawOrderData } from "./DrawOrderData";
import { Transform } from "./Transform";
import { DeformAniData } from "./DeformAniData";
import { DeformSlotData } from "./DeformSlotData";
import { DeformSlotDisplayData } from "./DeformSlotDisplayData";
import { AnimationPlayer } from "../AnimationPlayer"
import { GraphicsAni } from "../GraphicsAni"
import { Sprite } from "../../display/Sprite";
import { Handler } from "../../utils/Handler";
import { Matrix } from "../../maths/Matrix";
import { Event } from "../../events/Event";
import { SoundManager } from "../../media/SoundManager";
import { Graphics } from "../../display/Graphics";
import { Byte } from "../../utils/Byte";
import { Texture } from "../../resource/Texture";
import { IAniLib } from "../AniLibPack";
import { Templet } from "../../ani/bone/Templet";
import { ILaya } from "../../../ILaya";
import { LayaEnv } from "../../../LayaEnv";

/**动画开始播放调度
 * @eventType Event.PLAYED
 * */
/*[Event(name = "played", type = "laya.events.Event.PLAYED", desc = "动画开始播放调度")]*/
/**动画停止播放调度
 * @eventType Event.STOPPED
 * */
/*[Event(name = "stopped", type = "laya.events.Event.STOPPED", desc = "动画停止播放调度")]*/
/**动画暂停播放调度
 * @eventType Event.PAUSED
 * */
/*[Event(name = "paused", type = "laya.events.Event.PAUSED", desc = "动画暂停播放调度")]*/
/**自定义事件。
 * @eventType Event.LABEL
 */
/*[Event(name = "label", type = "laya.events.Event.LABEL", desc = "自定义事件")]*/
/**
 * 骨骼动画由<code>Templet</code>，<code>AnimationPlayer</code>，<code>Skeleton</code>三部分组成。
 */
export class Skeleton extends Sprite {
    /**@internal */
    protected _source: string;
    /**@internal */
    protected _templet: Templet;//动画解析器
    /** @internal */
    protected _player: AnimationPlayer;//播放器
    /** @internal */
    protected _curOriginalData: Float32Array;//当前骨骼的偏移数据

    /** @internal */
    private _boneMatrixArray: any[] = [];//当前骨骼动画的最终结果数据
    /** @internal */
    private _lastTime: number = 0;//上次的帧时间
    /** @internal */
    private _currAniIndex: number = -1;
    /** @internal */
    private _pause: boolean = true;
    /** @internal */
    protected _aniClipIndex: number = -1;
    /** @internal */
    protected _clipIndex: number = -1;
    /** @internal */
    private _skinIndex: number = 0;
    /** @internal */
    private _skinName: string = "default";
    /** @internal */
    private _aniMode: number = 0;//
    /** @internal 当前动画自己的缓冲区*/
    private _graphicsCache: any[];
    /** @internal */
    private _boneSlotDic: any;
    /** @internal */
    private _bindBoneBoneSlotDic: any;
    /** @internal */
    private _boneSlotArray: any[];
    /** @internal */
    private _index: number = -1;
    /** @internal */
    private _total: number = -1;
    /** @internal */
    private _indexControl: boolean = false;
    /** @internal */
    private _complete: Handler;
    /** @internal */
    private _yReverseMatrix: Matrix;
    /** @internal */
    private _ikArr: any[];
    /** @internal */
    private _tfArr: any[];
    /** @internal */
    private _pathDic: any;
    /** @internal */
    private _rootBone: Bone;
    /** @internal */
    protected _boneList: Bone[];
    /** @internal */
    protected _aniSectionDic: any;		// section 是每段数据(transform,slot,ik,path)的长度，这个是一个section的数据，表示每个clip的section数据
    /** @internal */
    private _eventIndex: number = 0;
    /** @internal */
    private _drawOrderIndex: number = 0;
    /** @internal */
    private _drawOrder: number[] = null;
    /** @internal */
    private _lastAniClipIndex: number = -1;
    /** @internal */
    private _lastUpdateAniClipIndex: number = -1;
    /** @internal */
    private _playAudio: boolean = true;
    /** @internal */
    private _soundChannelArr: any[] = [];

    private _animationName: string = "";
    private _loop: boolean = true;

    /**
     * 创建一个Skeleton对象

     * @param	aniMode	动画模式，0不支持换装，1、2支持换装
     */
    constructor(aniMode: number = 0) {
        super();

        this._aniMode = aniMode;
    }

    /**
    * @private
    * 得到帧索引
    */
    get index(): number {
        return this._index;
    }

    /**
     * @private
     * 设置帧索引
     */
    set index(value: number) {
        if (this.player) {
            this._index = value;
            this._player.currentTime = this._index * 1000 / this._player.cacheFrameRate;
            this._indexControl = true;
            if (this._aniClipIndex < 0 || this._aniClipIndex >= this.getAnimNum()) {
                this._aniClipIndex = 0;
                this._currAniIndex = 0;
                this._curOriginalData = new Float32Array(this._templet.getTotalkeyframesLength(this._currAniIndex));
                this._drawOrder = null;
                this._eventIndex = 0;
            }
            this._update(false);
        }
    }

    /**
     * 得到总帧数据
     */
    get total(): number {
        if (this._templet && this._player) {
            this._total = Math.floor(this._templet.getAniDuration(this._player.currentAnimationClipIndex) / 1000 * this._player.cacheFrameRate);
        } else {
            this._total = -1;
        }
        return this._total;
    }

    /**
     * 得到播放器的引用
     */
    get player(): AnimationPlayer {
        return this._player;
    }

    /**
     * 皮肤名字
     */
    get skinName(): string {
        return this._skinName;
    }

    set skinName(value: string) {
        this._skinName = value;
        if (this._templet)
            this.showSkinByName(value);
    }

    /**
     * 动画名字
     */
    get animationName(): string {
        return this._animationName;
    }

    set animationName(value: string) {
        this._animationName = value;
        if (this._templet)
            this.play(value, this._loop, true);
    }

    /**
     * 是否循环
     */
    get loop(): boolean {
        return this._loop;
    }

    set loop(value: boolean) {
        this._loop = value;
        if (this._templet)
            this.play(this._animationName, this._loop, true);
    }

    /**
     * 得到动画模板的引用
     * @return templet.
     */
    get templet(): Templet {
        return this._templet;
    }

    set templet(value: Templet) {
        this.init(value);
    }

    /**
     * 得到动画地址
     * @return templet.
     */
    get source(): string {
        return this._source;
    }

    /**
     * 设置动画地址
     */
    set source(value: string) {
        this._source = value;

        if (value) {
            ILaya.loader.load(value).then((templet: Templet) => {
                if (!this._source || templet && !templet.isCreateFromURL(this._source))
                    return;

                this.templet = templet;
            });
        }
        else
            this.templet = null;
    }

    /**
     * 动画类型
     * <table>
     * 	<tr><th>模式</th><th>描述</th></tr>
     * 	<tr>
     * 		<td>0</td> <td>使用模板缓冲的数据，模板缓冲的数据，不允许修改（内存开销小，计算开销小，不支持换装）</td>
     * 	</tr>
     * 	<tr>
     * 		<td>1</td> <td>使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存	（内存开销大，计算开销小，支持换装）</td>
     * 	</tr>
     * 	<tr>
     * 		<td>2</td> <td>使用动态方式，去实时去画（内存开销小，计算开销大，支持换装,不建议使用）</td>
     * </tr>
     * </table>
     */
    get aniMode(): number {
        return this._aniMode;
    }

    set aniMode(value: number) {
        this._aniMode = value;
    }

    /**
     * 初始化动画
     * @param	templet		模板
     */
    protected init(templet: Templet): void {
        if (this._templet) {
            this.reset();
            this.graphics.clear();
        }

        this._templet = templet;
        if (!this._templet)
            return;

        if (this._aniMode == 1) { //使用动画自己的缓冲区
            this._graphicsCache = [];
            for (let i = 0, n = templet.getAnimationCount(); i < n; i++) {
                this._graphicsCache.push([]);
            }
        }
        this._yReverseMatrix = templet.yReverseMatrix;
        this._templet._addReference(1);
        this._player = new AnimationPlayer();

        this._player.templet = templet;
        this._player.play();
        this._parseSrcBoneMatrix();
        //骨骼数据
        this._boneList = templet.mBoneArr;
        this._rootBone = templet.mRootBone;
        this._aniSectionDic = templet.aniSectionDic;
        //ik作用器
        if (templet.ikArr.length > 0) {
            this._ikArr = [];
            for (let i = 0, n = templet.ikArr.length; i < n; i++) {
                this._ikArr.push(new IkConstraint(templet.ikArr[i], this._boneList));
            }
        }
        //path作用器
        if (templet.pathArr.length > 0) {
            this._pathDic = {};
            for (let i = 0, n = templet.pathArr.length; i < n; i++) {
                let tPathData = templet.pathArr[i];
                let tPathConstraint = new PathConstraint(tPathData, this._boneList);
                let tBoneSlot = this._boneSlotDic[tPathData.name];
                if (tBoneSlot) {
                    tPathConstraint = new PathConstraint(tPathData, this._boneList);
                    tPathConstraint.target = tBoneSlot;
                }
                this._pathDic[tPathData.name] = tPathConstraint;
            }
        }
        //tf作用器
        if (templet.tfArr.length > 0) {
            this._tfArr = [];
            for (let i = 0, n = templet.tfArr.length; i < n; i++) {
                this._tfArr.push(new TfConstraint(templet.tfArr[i], this._boneList));
            }
        }
        if (templet.skinDataArray.length > 0) {
            this._skinIndex = this._templet.getSkinIndexByName(this._skinName);
            if (this._skinIndex == -1)
                this._skinIndex = 0;
        }

        this._player.on(Event.PLAYED, this, this._onPlay);
        this._player.on(Event.STOPPED, this, this._onStop);
        this._player.on(Event.PAUSED, this, this._onPause);

        if (LayaEnv.isPlaying && this._animationName)
            this.play(this._animationName, this._loop, true);
    }

    /**
     * 通过加载直接创建动画
     * @param	path		要加载的动画文件路径
     * @param	complete	加载完成的回调函数
     */
    load(path: string, complete?: Handler): void {
        ILaya.loader.load(path).then((templet: Templet) => {
            if (templet == null) return;

            if (!templet.isCreateFromURL(path))
                return;

            this.init(templet);
            this.play(0, true);

            complete && complete.runWith(this);
        });
    }

    /**
     * @internal
     * 传递PLAY事件
     */
    private _onPlay(): void {
        this.event(Event.PLAYED);
    }

    /**
     * @internal
     * 传递STOP事件
     */
    private _onStop(): void {
        //把没播的事件播完
        let tEventAniArr: any[] = this._templet.eventAniArr;
        let tEventArr: EventData[] = tEventAniArr[this._aniClipIndex];
        if (tEventArr && this._eventIndex < tEventArr.length) {
            for (; this._eventIndex < tEventArr.length; this._eventIndex++) {
                let tEventData = tEventArr[this._eventIndex];
                if (tEventData.time >= this._player.playStart && tEventData.time <= this._player.playEnd) {
                    this.event(Event.LABEL, tEventData);
                }
            }
        }
        //_eventIndex = 0;
        this._drawOrder = null;
        this.event(Event.STOPPED);
    }

    /**
     * @internal
     * 传递PAUSE事件
     */
    private _onPause(): void {
        this.event(Event.PAUSED);
    }

    /**
     * @internal
     * 创建骨骼的矩阵，保存每次计算的最终结果
     */
    private _parseSrcBoneMatrix(): void {
        let n = this._templet.srcBoneMatrixArr.length;
        for (let i = 0; i < n; i++) {
            this._boneMatrixArray.push(new Matrix());
        }
        if (this._aniMode == 0) {
            this._boneSlotDic = this._templet.boneSlotDic;
            this._bindBoneBoneSlotDic = this._templet.bindBoneBoneSlotDic;
            this._boneSlotArray = this._templet.boneSlotArray;
        } else {
            this._boneSlotDic = {};
            this._bindBoneBoneSlotDic = {};
            this._boneSlotArray = [];
            let tArr: any[] = this._templet.boneSlotArray;
            for (let i = 0, n = tArr.length; i < n; i++) {
                let tBS = tArr[i];
                let tBSArr = this._bindBoneBoneSlotDic[tBS.parent];
                if (tBSArr == null) {
                    this._bindBoneBoneSlotDic[tBS.parent] = tBSArr = [];
                }
                this._boneSlotDic[tBS.name] = tBS = tBS.copy();
                tBSArr.push(tBS);
                this._boneSlotArray.push(tBS);
            }
        }
    }

    /**
     * @internal
     * @param startTime 
     * @param endTime 
     * @param startIndex 
     */
    private _emitMissedEvents(startTime: number, endTime: number, startIndex: number = 0): void {
        let tEventAniArr: any[] = this._templet.eventAniArr;
        let tEventArr: EventData[] = tEventAniArr[this._player.currentAnimationClipIndex];
        if (tEventArr) {
            let len = tEventArr.length;
            for (let i = startIndex; i < len; i++) {
                let tEventData = tEventArr[i];
                if (tEventData.time >= this._player.playStart && tEventData.time <= this._player.playEnd) {
                    this.event(Event.LABEL, tEventData);
                }
            }
        }
    }

    /**
     * 更新动画
     * @internal
     * @param	autoKey true为正常更新，false为index手动更新
     */
    private _update(autoKey: boolean = true): void {
        if (autoKey && this._pause) return;
        if (autoKey && this._indexControl) {
            return;
        }
        let tCurrTime: number = this.timer.currTimer;
        let preIndex: number = this._player.currentKeyframeIndex;
        let dTime: number = tCurrTime - this._lastTime;
        if (autoKey) {
            // player update，更新当前帧数，判断是否stop或者complete
            this._player._update(dTime);
        } else {
            preIndex = -1;
        }
        this._lastTime = tCurrTime;
        this._index = this._clipIndex = this._player.currentKeyframeIndex;	// 当前所在帧
        if (this._index < 0) return;
        if (dTime > 0 && this._clipIndex == preIndex && this._lastUpdateAniClipIndex == this._aniClipIndex) {
            return;
        }
        this._lastUpdateAniClipIndex = this._aniClipIndex;
        if (preIndex > this._clipIndex && this._eventIndex != 0) {
            this._emitMissedEvents(this._player.playStart, this._player.playEnd, this._eventIndex);
            this._eventIndex = 0;
        }

        // 自定义事件的检查
        let tEventArr: EventData[] = this._templet.eventAniArr[this._aniClipIndex];
        if (tEventArr && this._eventIndex < tEventArr.length) {
            let tEventData: EventData = tEventArr[this._eventIndex];
            if (tEventData.time >= this._player.playStart && tEventData.time <= this._player.playEnd) {
                if (this._player.currentPlayTime >= tEventData.time) {
                    this.event(Event.LABEL, tEventData);
                    this._eventIndex++;
                    if (this._playAudio && tEventData.audioValue && tEventData.audioValue !== "null" && tEventData.audioValue !== "undefined") {
                        let channel = SoundManager.playSound((this._player.templet as any)._path + tEventData.audioValue, 1, Handler.create(this, this._onAniSoundStoped));
                        SoundManager.playbackRate = this._player.playbackRate;
                        channel && this._soundChannelArr.push(channel);
                    }
                }
            } else if (tEventData.time < this._player.playStart && this._playAudio && tEventData.audioValue && tEventData.audioValue !== "null" && tEventData.audioValue !== "undefined") {
                this._eventIndex++;
                let channel = SoundManager.playSound((this._player.templet as any)._path + tEventData.audioValue, 1, Handler.create(this, this._onAniSoundStoped), null, (this._player.currentPlayTime - tEventData.time) / 1000);
                SoundManager.playbackRate = this._player.playbackRate;
                channel && this._soundChannelArr.push(channel);
            } else {
                this._eventIndex++;
            }
        }

        if (this._aniMode == 0) {
            // 从templet中找到缓存的这一帧的 graphics
            let tGraphics = this._templet.getGrahicsDataWithCache(this._aniClipIndex, this._clipIndex) || this._createGraphics();// _clipIndex是 AnimationPlayer计算出来的
            if (tGraphics && this.graphics != tGraphics) {
                this.graphics = tGraphics;
            }
        } else if (this._aniMode == 1) {
            let tGraphics = this._getGrahicsDataWithCache(this._aniClipIndex, this._clipIndex) || this._createGraphics();	// 与0的区别是从this get，上面是从templet get
            if (tGraphics && this.graphics != tGraphics) {
                this.graphics = tGraphics;
            }
        } else {
            this._createGraphics();
        }
    }

    /**
     * @internal
     * 清掉播放完成的音频
     * @param force 是否强制删掉所有的声音channel
     */
    private _onAniSoundStoped(force: boolean): void {
        for (let i = this._soundChannelArr.length - 1; i >= 0; i--) {
            let channel = this._soundChannelArr[i];
            if (channel.isStopped || force) {
                !channel.isStopped && channel.stop();
                this._soundChannelArr.splice(i, 1);
                // SoundManager.removeChannel(_channel); // TODO 是否需要? 去掉有什么好处? 是否还需要其他操作?
            }
        }
    }

    /**
     * @internal
     * 创建grahics图像. 并且保存到cache中
     * @param	_clipIndex 第几帧
     */
    protected _createGraphics(_clipIndex: number = -1): GraphicsAni {
        if (_clipIndex == -1) _clipIndex = this._clipIndex;
        let curTime: number = _clipIndex * this._player.cacheFrameRateInterval;
        //处理绘制顺序
        let tDrawOrderAniArr: any[] = this._templet.drawOrderAniArr;
        // 当前动作的 drawOrderArray 信息
        let tDrawOrderArr: DrawOrderData[] = tDrawOrderAniArr[this._aniClipIndex];
        if (tDrawOrderArr && tDrawOrderArr.length > 0) {
            // 选出当前所在帧的 drawOrderArray
            this._drawOrderIndex = 0;	// 从0开始
            let tDrawOrderData = tDrawOrderArr[this._drawOrderIndex];
            while (curTime >= tDrawOrderData.time) {
                this._drawOrder = tDrawOrderData.drawOrder;
                this._drawOrderIndex++;	// 下一帧
                if (this._drawOrderIndex >= tDrawOrderArr.length) {
                    break;
                }
                tDrawOrderData = tDrawOrderArr[this._drawOrderIndex];
            }
        }

        //要用的graphics
        if (this._aniMode == 0 || this._aniMode == 1) {	// 有缓存的情况
            this.graphics = GraphicsAni.create();// new GraphicsAni();
        } else { // 实时计算的情况。 每次都是新的数据，因此要把上一帧的清理一下
            if (this.graphics instanceof GraphicsAni) {
                this.graphics.clear();
            } else {
                this.graphics = GraphicsAni.create(); //new GraphicsAni();
            }
        }
        let tGraphics: GraphicsAni = (<GraphicsAni>this.graphics);
        //获取骨骼数据
        let bones: any[] = this._templet.getNodes(this._aniClipIndex);
        // 现在把帧数计算改成实时的，根据时间算，因此时间要求准确，不能再用curTime了。
        // 用curTime可能会出一个bug就是没有到达最后一帧。例如最后两帧间隔很短
        let stopped = this._player.state == 0;

        this._templet.getOriginalData(this._aniClipIndex, this._curOriginalData, /*_templet._fullFrames[_aniClipIndex]*/null, _clipIndex, stopped ? (curTime + this._player.cacheFrameRateInterval) : curTime);
        let tSectionArr: any[] = this._aniSectionDic[this._aniClipIndex];
        //let tParentMatrix: Matrix;//父骨骼矩阵的引用
        let tStartIndex: number = 0;
        let i: number = 0, j: number = 0, k: number = 0, n: number = 0;
        //对骨骼数据进行计算
        let boneCount: number = this._templet.srcBoneMatrixArr.length;
        let origDt: Float32Array = this._curOriginalData;
        for (i = 0, n = tSectionArr[0]; i < boneCount; i++) {
            let tSrcBone = this._boneList[i];
            let resultTrans: Transform = tSrcBone.resultTransform;
            let tParentTransform = this._templet.srcBoneMatrixArr[i];
            resultTrans.scX = tParentTransform.scX * origDt[tStartIndex++];
            resultTrans.skX = tParentTransform.skX + origDt[tStartIndex++];
            resultTrans.skY = tParentTransform.skY + origDt[tStartIndex++];
            resultTrans.scY = tParentTransform.scY * origDt[tStartIndex++];
            resultTrans.x = tParentTransform.x + origDt[tStartIndex++];
            resultTrans.y = tParentTransform.y + origDt[tStartIndex++];
            if (this._templet.tMatrixDataLen === 8) {
                resultTrans.skewX = tParentTransform.skewX + origDt[tStartIndex++];
                resultTrans.skewY = tParentTransform.skewY + origDt[tStartIndex++];
            }

        }
        //对插槽进行插值计算
        let tSlotDic: any = {};
        let tSlotAlphaDic: any = {};
        for (n += tSectionArr[1]; i < n; i++) {
            let tBoneData = bones[i];
            tSlotDic[tBoneData.name] = origDt[tStartIndex++];
            tSlotAlphaDic[tBoneData.name] = origDt[tStartIndex++];	// 每一个slot的alpha?
            //预留
            tStartIndex += 4;
        }
        //ik
        let tBendDirectionDic: any = {};
        let tMixDic: any = {};
        for (n += tSectionArr[2]; i < n; i++) {
            let tBoneData = bones[i];
            tBendDirectionDic[tBoneData.name] = origDt[tStartIndex++];
            tMixDic[tBoneData.name] = origDt[tStartIndex++];
            //预留
            tStartIndex += 4;
        }
        //path
        if (this._pathDic) {
            for (n += tSectionArr[3]; i < n; i++) {
                let tBoneData = bones[i];
                let tPathConstraint = this._pathDic[tBoneData.name];
                if (tPathConstraint) {
                    let tByte: Byte = new Byte(tBoneData.extenData);
                    switch (tByte.getByte()) {
                        case 1://position
                            tPathConstraint.position = origDt[tStartIndex++];
                            break;
                        case 2://spacing
                            tPathConstraint.spacing = origDt[tStartIndex++];
                            break;
                        case 3://mix
                            tPathConstraint.rotateMix = origDt[tStartIndex++];
                            tPathConstraint.translateMix = origDt[tStartIndex++];
                            break;
                    }
                }
            }
        }

        // 从root开始级联矩阵
        this._rootBone.update(this._yReverseMatrix || Matrix.TEMP.identity());

        //刷新IK作用器
        if (this._ikArr) {
            let tIkConstraint: IkConstraint;
            for (i = 0, n = this._ikArr.length; i < n; i++) {
                tIkConstraint = this._ikArr[i];
                if (tIkConstraint.name in tBendDirectionDic) {
                    tIkConstraint.bendDirection = tBendDirectionDic[tIkConstraint.name];
                }
                if (tIkConstraint.name in tMixDic) {
                    tIkConstraint.mix = tMixDic[tIkConstraint.name]
                }
                tIkConstraint.apply();
                //tIkConstraint.updatePos(this.x, this.y);
            }
        }
        //刷新PATH作用器
        if (this._pathDic) {
            for (let tPathStr in this._pathDic) {
                let tPathConstraint = this._pathDic[tPathStr];
                tPathConstraint.apply(this._boneList, tGraphics);
            }
        }
        //刷新transform作用器
        if (this._tfArr) {
            for (i = 0, k = this._tfArr.length; i < k; i++) {
                let tTfConstraint = this._tfArr[i];
                tTfConstraint.apply();
            }
        }

        for (i = 0, k = this._boneList.length; i < k; i++) {
            let tSrcBone = this._boneList[i];
            let tDBBoneSlotArr = this._bindBoneBoneSlotDic[tSrcBone.name];
            tSrcBone.resultMatrix.copyTo(this._boneMatrixArray[i]);
            if (tDBBoneSlotArr) {
                for (j = 0, n = tDBBoneSlotArr.length; j < n; j++) {
                    let tDBBoneSlot = tDBBoneSlotArr[j];
                    if (tDBBoneSlot) {
                        tDBBoneSlot.setParentMatrix(tSrcBone.resultMatrix);
                    }
                }
            }
        }
        let tDeformDic: any = {};
        //变形动画作用器
        let tDeformAniArr: any[] = this._templet.deformAniArr;
        if (tDeformAniArr && tDeformAniArr.length > 0) {
            if (this._lastAniClipIndex != this._aniClipIndex) {
                this._lastAniClipIndex = this._aniClipIndex;
                for (i = 0, n = this._boneSlotArray.length; i < n; i++) {
                    let tDBBoneSlot = this._boneSlotArray[i];
                    tDBBoneSlot.deformData = null;
                }
            }
            let tSkinDeformAni: any = tDeformAniArr[this._aniClipIndex];
            //使用default数据
            let tDeformAniData = (<DeformAniData>(tSkinDeformAni["default"]));
            this._setDeform(tDeformAniData, tDeformDic, this._boneSlotArray, curTime);

            //使用其他皮肤的数据
            let tSkin: string;
            for (tSkin in tSkinDeformAni) {
                if (tSkin != "default" && tSkin != this._skinName) {
                    tDeformAniData = (<DeformAniData>tSkinDeformAni[tSkin]);
                    this._setDeform(tDeformAniData, tDeformDic, this._boneSlotArray, curTime);
                }
            }

            //使用自己皮肤的数据
            tDeformAniData = (<DeformAniData>(tSkinDeformAni[this._skinName]));
            this._setDeform(tDeformAniData, tDeformDic, this._boneSlotArray, curTime);
        }

        //_rootBone.updateDraw(this.x,this.y);
        //把动画按插槽顺序画出来
        if (this._drawOrder) {
            for (i = 0, n = this._drawOrder.length; i < n; i++) {
                let tDBBoneSlot = this._boneSlotArray[this._drawOrder[i]];
                let tSlotData2 = tSlotDic[tDBBoneSlot.name];
                let tSlotData3 = tSlotAlphaDic[tDBBoneSlot.name];
                if (!isNaN(tSlotData3)) {	// 如果alpha有值的话
                    //tGraphics.save();
                    //tGraphics.alpha(tSlotData3);
                }
                if (!isNaN(tSlotData2) && tSlotData2 != -2) {

                    if (this._templet.attachmentNames) {
                        tDBBoneSlot.showDisplayByName(this._templet.attachmentNames[tSlotData2]);
                    } else {
                        tDBBoneSlot.showDisplayByIndex(tSlotData2);
                    }
                }
                if (tDeformDic[this._drawOrder[i]]) {
                    let tObject = tDeformDic[this._drawOrder[i]];
                    if (tDBBoneSlot.currDisplayData && tObject[tDBBoneSlot.currDisplayData.attachmentName]) {
                        tDBBoneSlot.deformData = tObject[tDBBoneSlot.currDisplayData.attachmentName];
                    } else {
                        tDBBoneSlot.deformData = null;
                    }
                } else {
                    tDBBoneSlot.deformData = null;
                }
                if (!isNaN(tSlotData3)) {
                    tDBBoneSlot.draw(tGraphics, this._boneMatrixArray, this._aniMode == 2, tSlotData3);
                } else {
                    tDBBoneSlot.draw(tGraphics, this._boneMatrixArray, this._aniMode == 2);
                }
                if (!isNaN(tSlotData3)) {
                    //tGraphics.restore();
                }
            }
        } else {
            for (i = 0, n = this._boneSlotArray.length; i < n; i++) {
                let tDBBoneSlot = this._boneSlotArray[i];
                let tSlotData2 = tSlotDic[tDBBoneSlot.name];
                let tSlotData3 = tSlotAlphaDic[tDBBoneSlot.name];
                if (!isNaN(tSlotData3)) {
                    //tGraphics.save();
                    //tGraphics.alpha(tSlotData3);
                }
                if (!isNaN(tSlotData2) && tSlotData2 != -2) {
                    if (this._templet.attachmentNames) {
                        tDBBoneSlot.showDisplayByName(this._templet.attachmentNames[tSlotData2]);
                    } else {
                        tDBBoneSlot.showDisplayByIndex(tSlotData2);
                    }
                }
                if (tDeformDic[i]) {
                    let tObject = tDeformDic[i];
                    if (tDBBoneSlot.currDisplayData && tObject[tDBBoneSlot.currDisplayData.attachmentName]) {
                        tDBBoneSlot.deformData = tObject[tDBBoneSlot.currDisplayData.attachmentName];
                    } else {
                        tDBBoneSlot.deformData = null;
                    }
                } else {
                    tDBBoneSlot.deformData = null;
                }
                if (!isNaN(tSlotData3)) {
                    tDBBoneSlot.draw(tGraphics, this._boneMatrixArray, this._aniMode == 2, tSlotData3);
                } else {
                    tDBBoneSlot.draw(tGraphics, this._boneMatrixArray, this._aniMode == 2);
                }
                if (!isNaN(tSlotData3)) {
                    //tGraphics.restore();
                }
            }
        }
        if (this._aniMode == 0) {
            this._templet.setGrahicsDataWithCache(this._aniClipIndex, _clipIndex, tGraphics);
            this._checkIsAllParsed(this._aniClipIndex);
        } else if (this._aniMode == 1) {
            this._setGrahicsDataWithCache(this._aniClipIndex, _clipIndex, tGraphics);
        }
        return tGraphics;
    }

    private _checkIsAllParsed(_aniClipIndex: number): void {
        let len = Math.floor(0.01 + this._templet.getAniDuration(_aniClipIndex) / 1000 * this._player.cacheFrameRate);
        for (let i = 0; i < len; i++) {
            if (!this._templet.getGrahicsDataWithCache(_aniClipIndex, i)) return;
        }
        if (!this._templet.getGrahicsDataWithCache(_aniClipIndex, len)) {
            this._createGraphics(len);
            return;
        }
        this._templet.deleteAniData(_aniClipIndex);
    }

    /**
     * 设置deform数据
     * @internal
     * @param	tDeformAniData
     * @param	tDeformDic
     * @param	_boneSlotArray
     * @param	curTime
     */
    private _setDeform(tDeformAniData: DeformAniData, tDeformDic: any, _boneSlotArray: any[], curTime: number): void {
        if (!tDeformAniData) return;
        let tDeformSlotData: DeformSlotData;
        let tDeformSlotDisplayData: DeformSlotDisplayData;
        let tDBBoneSlot: BoneSlot;
        if (tDeformAniData) {
            for (let i = 0, n = tDeformAniData.deformSlotDataList.length; i < n; i++) {
                tDeformSlotData = tDeformAniData.deformSlotDataList[i];
                for (let j = 0; j < tDeformSlotData.deformSlotDisplayList.length; j++) {
                    tDeformSlotDisplayData = tDeformSlotData.deformSlotDisplayList[j];
                    tDBBoneSlot = _boneSlotArray[tDeformSlotDisplayData.slotIndex];
                    tDeformSlotDisplayData.apply(curTime, tDBBoneSlot);
                    if (!tDeformDic[tDeformSlotDisplayData.slotIndex]) {
                        tDeformDic[tDeformSlotDisplayData.slotIndex] = {};
                    }
                    tDeformDic[tDeformSlotDisplayData.slotIndex][tDeformSlotDisplayData.attachment] = tDeformSlotDisplayData.deformData;
                }
            }
        }
    }

    /*******************************************定义接口*************************************************/
    /**
     * 得到当前动画的数量
     * @return 当前动画的数量
     */
    getAnimNum(): number {
        return this._templet.getAnimationCount();
    }

    /**
     * 得到指定动画的名字
     * @param	index	动画的索引
     */
    getAniNameByIndex(index: number): string {
        return this._templet.getAniNameByIndex(index);
    }

    /**
     * 通过名字得到插槽的引用
     * @param	name	动画的名字
     * @return 插槽的引用
     */
    getSlotByName(name: string): BoneSlot {
        return this._boneSlotDic[name];
    }

    /**
     * 通过名字显示一套皮肤
     * @param	name	皮肤的名字
     * @param	freshSlotIndex	是否将插槽纹理重置到初始化状态
     */
    showSkinByName(name: string, freshSlotIndex: boolean = true): void {
        this.showSkinByIndex(this._templet.getSkinIndexByName(name), freshSlotIndex);
    }

    /**
     * 通过索引显示一套皮肤
     * @param	skinIndex	皮肤索引
     * @param	freshSlotIndex	是否将插槽纹理重置到初始化状态
     */
    showSkinByIndex(skinIndex: number, freshSlotIndex: boolean = true): void {
        for (let i = 0; i < this._boneSlotArray.length; i++) {
            ((<BoneSlot>this._boneSlotArray[i])).showSlotData(null, freshSlotIndex);
        }
        if (this._templet.showSkinByIndex(this._boneSlotDic, skinIndex, freshSlotIndex)) {
            let tSkinData: SkinData = this._templet.skinDataArray[skinIndex];
            this._skinName = tSkinData.name;
        }
        this._clearCache();
    }

    /**
     * 设置某插槽的皮肤
     * @param	slotName	插槽名称
     * @param	index	插糟皮肤的索引
     */
    showSlotSkinByIndex(slotName: string, index: number): void {
        if (this._aniMode == 0) return;
        let tBoneSlot: BoneSlot = this.getSlotByName(slotName);
        if (tBoneSlot) {
            tBoneSlot.showDisplayByIndex(index);
        }
        this._clearCache();
    }

    /**
     * 设置某插槽的皮肤
     * @param	slotName	插槽名称
     * @param	name	皮肤名称
     */
    showSlotSkinByName(slotName: string, name: string): void {
        if (this._aniMode == 0) return;
        let tBoneSlot: BoneSlot = this.getSlotByName(slotName);
        if (tBoneSlot) {
            tBoneSlot.showDisplayByName(name);
        }
        this._clearCache();
    }

    /**
     * 替换插槽贴图名
     * @param	slotName 插槽名称
     * @param	oldName 要替换的贴图名
     * @param	newName 替换后的贴图名
     */
    replaceSlotSkinName(slotName: string, oldName: string, newName: string): void {
        if (this._aniMode == 0) return;
        let tBoneSlot: BoneSlot = this.getSlotByName(slotName);
        if (tBoneSlot) {
            tBoneSlot.replaceDisplayByName(oldName, newName);
        }
        this._clearCache();
    }

    /**
     * 替换插槽的贴图索引
     * @param	slotName 插槽名称
     * @param	oldIndex 要替换的索引
     * @param	newIndex 替换后的索引
     */
    replaceSlotSkinByIndex(slotName: string, oldIndex: number, newIndex: number): void {
        if (this._aniMode == 0) return;
        let tBoneSlot: BoneSlot = this.getSlotByName(slotName);
        if (tBoneSlot) {
            tBoneSlot.replaceDisplayByIndex(oldIndex, newIndex);
        }
        this._clearCache();
    }

    /**
     * 设置自定义皮肤
     * @param	name		插糟的名字
     * @param	texture		自定义的纹理
     */
    setSlotSkin(slotName: string, texture: Texture): void {
        if (this._aniMode == 0) return;
        let tBoneSlot: BoneSlot = this.getSlotByName(slotName);
        if (tBoneSlot) {
            tBoneSlot.replaceSkin(texture);
        }
        this._clearCache();
    }

    /**
     * 换装的时候，需要清一下缓冲区
     * @internal
     */
    private _clearCache(): void {
        if (this._aniMode == 1) {
            for (let i = 0, n = this._graphicsCache.length; i < n; i++) {
                for (let j = 0, len = this._graphicsCache[i].length; j < len; j++) {
                    var gp: GraphicsAni = this._graphicsCache[i][j];
                    if (gp && gp != this.graphics) {
                        GraphicsAni.recycle(gp);
                    }
                }
                this._graphicsCache[i].length = 0;
            }
        }
    }

    /**
     * 播放动画
     *
     * @param	nameOrIndex	动画名字或者索引
     * @param	loop		是否循环播放
     * @param	force		false,如果要播的动画跟上一个相同就不生效,true,强制生效
     * @param	start		起始时间
     * @param	end			结束时间
     * @param	freshSkin	是否刷新皮肤数据
     * @param	playAudio	是否播放音频
     */
    play(nameOrIndex: any, loop: boolean, force: boolean = true, start: number = 0, end: number = 0, freshSkin: boolean = true, playAudio: boolean = true): void {
        this._playAudio = playAudio;
        this._indexControl = false;
        let index: number = -1;
        var duration: number;
        if (loop) {
            duration = 2147483647;//int.MAX_VALUE;
        } else {
            duration = 0;
        }
        if (typeof (nameOrIndex) == 'string') {
            for (let i = 0, n = this._templet.getAnimationCount(); i < n; i++) {
                let animation: any = this._templet.getAnimation(i);
                if (animation && nameOrIndex == animation.name) {
                    index = i;
                    break;
                }
            }
        } else {
            index = nameOrIndex;
        }
        if (index > -1 && index < this.getAnimNum()) {
            this._aniClipIndex = index;
            if (force || this._pause || this._currAniIndex != index) {
                this._currAniIndex = index;
                this._curOriginalData = new Float32Array(this._templet.getTotalkeyframesLength(index));
                this._drawOrder = null;
                this._eventIndex = 0;
                this._player.play(index, this._player.playbackRate, duration, start, end);
                if (freshSkin)
                    this._templet.showSkinByIndex(this._boneSlotDic, this._skinIndex);
                if (this._pause) {
                    this._pause = false;
                    this._lastTime = ILaya.Browser.now();
                    this.timer.frameLoop(1, this, this._update, null, true);
                }
                this._update();
            }
        }
    }

    /**
     * 停止动画
     */
    stop(): void {
        if (!this._pause) {
            this._pause = true;
            if (this._player) {
                this._player.stop(true);
            }
            if (this._soundChannelArr.length > 0) { // 有正在播放的声音
                this._onAniSoundStoped(true);
            }
            this.timer.clear(this, this._update);
        }
    }

    /**
     * 设置动画播放速率
     * @param	value	1为标准速率
     */
    playbackRate(value: number): void {
        if (this._player) {
            this._player.playbackRate = value;
        }
    }

    /**
     * 暂停动画的播放
     */
    paused(): void {
        if (!this._pause) {
            this._pause = true;
            if (this._player) {
                this._player.paused = true;
            }
            if (this._soundChannelArr.length > 0) { // 有正在播放的声音
                for (let len = this._soundChannelArr.length, i = 0; i < len; i++) {
                    let channel = this._soundChannelArr[i];
                    if (!channel.isStopped) {
                        channel.pause();
                    }

                }
            }
            this.timer.clear(this, this._update);
        }
    }

    /**
     * 恢复动画的播放
     */
    resume(): void {
        this._indexControl = false;
        if (this._pause) {
            this._pause = false;
            if (this._player) {
                this._player.paused = false;
            }
            if (this._soundChannelArr.length > 0) { // 有正在播放的声音
                for (let len = this._soundChannelArr.length, i = 0; i < len; i++) {
                    let channel = this._soundChannelArr[i];
                    if ((channel as any).audioBuffer) {
                        channel.resume();
                    }
                }
            }
            this._lastTime = ILaya.Browser.now();
            this.timer.frameLoop(1, this, this._update, null, true);
        }

    }

    /**
     * @internal
     * 得到缓冲数据
     * @param	aniIndex
     * @param	frameIndex
     * @return
     */
    private _getGrahicsDataWithCache(aniIndex: number, frameIndex: number): Graphics {
        return this._graphicsCache[aniIndex][frameIndex];
    }

    /**
     * @internal
     * 保存缓冲grahpics
     * @param	aniIndex
     * @param	frameIndex
     * @param	graphics
     */
    private _setGrahicsDataWithCache(aniIndex: number, frameIndex: number, graphics: Graphics): void {
        this._graphicsCache[aniIndex][frameIndex] = graphics;
    }

    /**
     * @internal
     */
    private reset() {
        this._templet._removeReference();
        this._templet = null;
        this._player.offAll();
        this._player = null;
        this._curOriginalData = null;
        this._boneMatrixArray.length = 0;
        this._ikArr = null;
        this._pathDic = null;
        this._tfArr = null;
        this._lastTime = 0;
        this._currAniIndex = -1;
        this._clipIndex = -1;
        this._indexControl = false;
        this._eventIndex = 0;
        this._drawOrderIndex = 0;
        this._drawOrder = null;
        this._lastAniClipIndex = -1;
        this._lastUpdateAniClipIndex = -1;
        this._pause = true;
        this.timer.clear(this, this._update);
        if (this._soundChannelArr.length > 0)
            this._onAniSoundStoped(true);
    }

    /**
     * @override
     * 销毁当前动画节点
     * @param destroyChild 是否销毁子节点
     */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        if (this._templet)
            this.reset();
    }
}

IAniLib.Skeleton = Skeleton;
