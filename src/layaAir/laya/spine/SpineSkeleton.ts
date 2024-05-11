import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { SoundManager } from "../media/SoundManager";
import { Loader } from "../net/Loader";
import { Handler } from "../utils/Handler";
import { ExternalSkin } from "./ExternalSkin";

import { SpineSkeletonRenderer } from "./SpineSkeletonRenderer";
import { SpineTemplet } from "./SpineTemplet";
import { ISpineOptimizeRender } from "./optimize/interface/ISpineOptimizeRender";


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
 * spine动画由<code>SpineTemplet</code>，<code>SpineSkeletonRender</code>，<code>SpineSkeleton</code>三部分组成。
 */
export class SpineSkeleton extends Sprite {
    /**状态-停止 */
    static readonly STOPPED: number = 0;
    /**状态-暂停 */
    static readonly PAUSED: number = 1;
    /**状态-播放中 */
    static readonly PLAYING: number = 2;

    /**@internal @protected */
    protected _source: string;
    /**@internal @protected */
    protected _templet: SpineTemplet;
    /**@internal @protected */
    protected _timeKeeper: spine.TimeKeeper;
    /**@internal @protected */
    protected _skeleton: spine.Skeleton;
    /**@internal @protected */
    protected _state: spine.AnimationState;
    /**@internal @protected */
    protected _stateData: spine.AnimationStateData;
    /**@internal @protected */
    protected _currentPlayTime: number = 0;
    /**@internal @protected */
    protected _renerer: SpineSkeletonRenderer;

    /** @internal */
    private _pause: boolean = true;
    /** @internal */
    private _currAniName: string = null;
    /** @internal 动画播放的起始时间位置*/
    private _playStart: number;
    /** @internal 动画播放的结束时间位置*/
    private _playEnd: number;
    /** @internal 动画的总时间*/
    private _duration: number;
    /** 播放速率*/
    private _playbackRate: number = 1.0;
    /** @internal */
    private _playAudio: boolean = true;
    /** @internal */
    private _soundChannelArr: any[] = [];
    // 播放轨道索引
    private trackIndex: number = 0;

    private _skinName: string = "default";
    private _animationName: string = "";
    private _loop: boolean = true;

    private _externalSkins: ExternalSkin[];

    constructor() {
        super();
    }

    /**
     * 外部皮肤
     */
    get externalSkins() {
        return this._externalSkins;
    }
    set externalSkins(value: ExternalSkin[]) {
        if (value) {
            for (let i = value.length - 1; i >= 0; i--) {
                value[i].target = this;
            }
        }
        this._externalSkins = value;
    }

    /**
     * 重置外部加载的皮肤的样式
     */
    resetExternalSkin() {
        if (this._skeleton) {
            this._skeleton = new this._templet.ns.Skeleton(this._templet.skeletonData);
            this._flushExtSkin();
        }
    }

    /**
     * 动画源
     */
    get source(): string {
        return this._source;
    }

    set source(value: string) {
        this._source = value;

        if (value) {
            ILaya.loader.load(value, Loader.SPINE).then((templet: SpineTemplet) => {
                if (!this._source || templet && !templet.isCreateFromURL(this._source))
                    return;

                this.templet = templet;
            });
        }
        else
            this.templet = null;
    }

    /**
     * 皮肤名
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
     * 动画名
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
     * @return templet
     */
    get templet(): SpineTemplet {
        return this._templet;
    }

    /**
     * 设置动画模板的引用
     */
    set templet(value: SpineTemplet) {
        this.init(value);
    }

    /**
     * 设置当前播放位置
     * @param	value 当前时间
     */
    set currentTime(value: number) {
        if (!this._currAniName || !this._templet)
            return;

        value /= 1000;
        if (value < this._playStart || (!!this._playEnd && value > this._playEnd) || value > this._duration)
            throw new Error("AnimationPlayer: value must large than playStartTime,small than playEndTime.");

        this._state.update(value - this._currentPlayTime);
        this._currentPlayTime = value;
    }

    /**
     * 获取当前播放状态
     * @return	当前播放状态
     */
    get playState(): number {
        if (!this._currAniName)
            return SpineSkeleton.STOPPED;
        if (this._pause)
            return SpineSkeleton.PAUSED;
        return SpineSkeleton.PLAYING;
    }

    spineItem: ISpineOptimizeRender;

    /**
     * @internal
     * @protected
     * @param templet 模板
     * @returns 
     */
    protected init(templet: SpineTemplet): void {
        if (this._templet) {
            this.reset();
            this.graphics.clear();
        }

        this._templet = templet;
        if (!this._templet)
            return;

        this._templet._addReference();
        this._skeleton = new templet.ns.Skeleton(this._templet.skeletonData);
        this._stateData = new templet.ns.AnimationStateData(this._skeleton.data);
        // 动画状态类
        this._state = new templet.ns.AnimationState(this._stateData);
        //this._renerer = new SpineSkeletonRenderer(templet, false);
        this._timeKeeper = new templet.ns.TimeKeeper();
        //let sMesh=this._templet.slotManger.init(this._skeleton.drawOrder, this._templet,this._templet.mainTexture);
        this.spineItem = this._templet.sketonOptimise._initSpineRender(this._skeleton, this._templet, this.graphics);
        let skinIndex = this._templet.getSkinIndexByName(this._skinName);
        if (skinIndex != -1)
            this.showSkinByIndex(skinIndex);

        this._state.addListener({
            start: (entry: any) => {
                // console.log("started:", entry);
            },
            interrupt: (entry: any) => {
                // console.log("interrupt:", entry);
            },
            end: (entry: any) => {
                // console.log("end:", entry);
            },
            dispose: (entry: any) => {
                // console.log("dispose:", entry);
            },
            complete: (entry: any) => {
                // console.log("complete:", entry);
                if (entry.loop) { // 如果多次播放,发送complete事件
                    this.event(Event.COMPLETE);
                } else { // 如果只播放一次，就发送stop事件
                    this._currAniName = null;
                    this.event(Event.STOPPED);
                }
            },
            event: (entry: any, event: any) => {
                let eventData = {
                    audioValue: event.data.audioPath,
                    audioPath: event.data.audioPath,
                    floatValue: event.floatValue,
                    intValue: event.intValue,
                    name: event.data.name,
                    stringValue: event.stringValue,
                    time: event.time * 1000,
                    balance: event.balance,
                    volume: event.volume
                };
                // console.log("event:", entry, event);
                this.event(Event.LABEL, eventData);
                if (this._playAudio && eventData.audioValue) {
                    let channel = SoundManager.playSound(templet.basePath + eventData.audioValue, 1, Handler.create(this, this._onAniSoundStoped), null, (this._currentPlayTime * 1000 - eventData.time) / 1000);
                    SoundManager.playbackRate = this._playbackRate;
                    channel && this._soundChannelArr.push(channel);
                }
            },
        });
        this._flushExtSkin();
        this.event(Event.READY);

        if (LayaEnv.isPlaying && this._animationName)
            this.play(this._animationName, this._loop, true);
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
    play(nameOrIndex: any, loop: boolean, force: boolean = true, start: number = 0, end: number = 0, freshSkin: boolean = true, playAudio: boolean = true) {
        this._playAudio = playAudio;
        start /= 1000;
        end /= 1000;
        let animationName = nameOrIndex;
        if (start < 0 || end < 0)
            throw new Error("SpineSkeleton: start and end must large than zero.");
        if ((end !== 0) && (start > end))
            throw new Error("SpineSkeleton: start must less than end.");

        if (typeof animationName == "number") {
            animationName = this.getAniNameByIndex(nameOrIndex);
        }

        if (force || this._pause || this._currAniName != animationName) {
            this._currAniName = animationName;
            this.spineItem.play(animationName);
            // 设置执行哪个动画
            this._state.setAnimation(this.trackIndex, animationName, loop);
            // 设置起始和结束时间
            let trackEntry = this._state.getCurrent(this.trackIndex);
            trackEntry.animationStart = start;
            if (!!end && end < trackEntry.animationEnd)
                trackEntry.animationEnd = end;

            let animationDuration = trackEntry.animation.duration;
            this._duration = animationDuration;
            this._playStart = start;
            this._playEnd = end <= animationDuration ? end : animationDuration;

            if (this._pause) {
                this._pause = false;
                this.timer.frameLoop(1, this, this._update, null, true);
            }
            this._update();
        }
    }

    private _update(): void {
        this._timeKeeper.update();
        let delta = this._timeKeeper.delta * this._playbackRate;
        let trackEntry = this._state.getCurrent(this.trackIndex);
        // 在游戏循环中，update被调用，这样AnimationState就可以跟踪时间
        this._state.update(delta);
        // 使用当前动画和事件设置骨架
        this._state.apply(this._skeleton);

        let animationLast = trackEntry.animationLast;
        this._currentPlayTime = Math.max(0, animationLast);

        // spine在state.apply中发送事件，开发者可能会在事件中进行destory等操作，导致无法继续执行
        if (!this._state || !this._skeleton) {
            return;
        }
        // 计算骨骼的世界SRT(world SRT)
        this._skeleton.updateWorldTransform();
        this.spineItem.render(this._currentPlayTime);

        // this.graphics.clear();
        // this._renerer.drawOld(this._skeleton, this.graphics, -1, -1);
    }

    private _flushExtSkin() {
        if (null == this._skeleton) return;
        let skins = this._externalSkins;
        if (skins) {
            for (let i = skins.length - 1; i >= 0; i--) {
                skins[i].flush();
            }
        }
    }
    /**
     * 得到当前动画的数量
     * @return 当前动画的数量
     */
    getAnimNum(): number {
        return this._templet.skeletonData.animations.length;
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
     * @param slotName 
     */
    getSlotByName(slotName: string) {
        return this._skeleton.findSlot(slotName)
    }

    /**
     * 设置动画播放速率
     * @param	value	1为标准速率
     */
    playbackRate(value: number): void {
        this._playbackRate = value;
    }

    /**
     * 通过名字显示一套皮肤
     * @param	name	皮肤的名字
     */
    showSkinByName(name: string): void {
        this.showSkinByIndex(this._templet.getSkinIndexByName(name));
    }

    /**
     * 通过索引显示一套皮肤
     * @param	skinIndex	皮肤索引
     */
    showSkinByIndex(skinIndex: number): void {
        this.spineItem.setSkinIndex(skinIndex);
        let newSkine = this._skeleton.data.skins[skinIndex];
        this._skeleton.setSkin(newSkine);
        this._skeleton.setSlotsToSetupPose();
    }

    /**
     * 停止动画
     */
    stop(): void {
        if (!this._pause) {
            this._pause = true;
            this._currAniName = null;
            this.timer.clear(this, this._update);
            this._state.update(-this._currentPlayTime);
            this._currentPlayTime = 0;
            this.event(Event.STOPPED);

            if (this._soundChannelArr.length > 0) { // 有正在播放的声音
                this._onAniSoundStoped(true);
            }
        }
    }

    /**
     * 暂停动画的播放
     */
    paused(): void {
        if (!this._pause) {
            this._pause = true;
            this.timer.clear(this, this._update);
            this.event(Event.PAUSED);
            if (this._soundChannelArr.length > 0) { // 有正在播放的声音
                for (let len = this._soundChannelArr.length, i = 0; i < len; i++) {
                    let channel = this._soundChannelArr[i];
                    if (!channel.isStopped) {
                        channel.pause();
                    }

                }
            }
        }
    }

    /**
     * 恢复动画的播放
     */
    resume(): void {
        if (this._pause) {
            this._pause = false;
            this.timer.frameLoop(1, this, this._update, null, true);
            if (this._soundChannelArr.length > 0) { // 有正在播放的声音
                for (let len = this._soundChannelArr.length, i = 0; i < len; i++) {
                    let channel = this._soundChannelArr[i];
                    if ((channel as any).audioBuffer) {
                        channel.resume();
                    }
                }
            }
        }
    }

    /**
     * @internal
     * 清掉播放完成的音频
     * @param force 是否强制删掉所有的声音channel
     */
    private _onAniSoundStoped(force: boolean): void {
        for (let len = this._soundChannelArr.length, i = 0; i < len; i++) {
            let channel = this._soundChannelArr[i];
            if (channel.isStopped || force) {
                !channel.isStopped && channel.stop();
                this._soundChannelArr.splice(i, 1);
                // SoundManager.removeChannel(_channel); // TODO 是否需要? 去掉有什么好处? 是否还需要其他操作?
                len--; i--;
            }
        }
    }

    private reset() {
        this._templet._removeReference(1);
        this._templet = null;
        this._timeKeeper = null;
        this._skeleton = null;
        this._state.clearListeners();
        this._state = null;
        //this._renerer = null;
        this._currAniName = null;
        this._pause = true;
        this.timer.clear(this, this._update);
        if (this._soundChannelArr.length > 0)
            this._onAniSoundStoped(true);
    }

    /**
     * 销毁当前动画
     * @override
     */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        if (this._templet)
            this.reset();
    }

    // ------------------------------------新增加的接口----------------------------------------------------
    /**
     * 添加一个动画
     * @param nameOrIndex   动画名字或者索引
     * @param loop          是否循环播放
     * @param delay         延迟调用，可以为负数
     */
    addAnimation(nameOrIndex: any, loop: boolean = false, delay: number = 0) {
        delay /= 1000;
        let animationName = nameOrIndex;
        if (typeof animationName == "number") {
            animationName = this.getAniNameByIndex(animationName);
        }
        this._currAniName = animationName;
        this._state.addAnimation(this.trackIndex, animationName, loop, delay);
    }

    /**
     * 设置当动画被改变时，存储混合(交叉淡出)的持续时间
     * @param fromNameOrIndex 
     * @param toNameOrIndex 
     * @param duration
     */
    setMix(fromNameOrIndex: any, toNameOrIndex: any, duration: number) {
        duration /= 1000;
        let fromName = fromNameOrIndex;
        if (typeof fromName == "number") {
            fromName = this.getAniNameByIndex(fromName);
        }
        let toName = toNameOrIndex;
        if (typeof toName == "number") {
            toName = this.getAniNameByIndex(toName);
        }
        this._stateData.setMix(fromName, toName, duration);
    }

    /**
     * 获取骨骼信息(spine.Bone)
     * 注意: 获取到的是spine运行时的骨骼信息(spine.Bone)，不适用引擎的方法
     * @param boneName 
     */
    getBoneByName(boneName: string) {
        return this._skeleton.findBone(boneName);
    }

    /**
     * 获取Skeleton(spine.Skeleton)
     */
    getSkeleton() {
        return this._skeleton;
    }

    /**
     * 替换插槽皮肤
     * @param slotName 
     * @param attachmentName 
     */
    setSlotAttachment(slotName: string, attachmentName: string) {
        this._skeleton.setAttachment(slotName, attachmentName);
    }
}

export enum ERenderType {
    normal = 0,
    boneGPU = 1,
    rigidBody = 2,
}
