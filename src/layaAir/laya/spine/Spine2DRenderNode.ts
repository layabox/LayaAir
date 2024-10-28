import { ILaya } from "../../ILaya";
import { Laya } from "../../Laya";
import { LayaEnv } from "../../LayaEnv";
import { BaseRenderNode2D } from "../NodeRender2D/BaseRenderNode2D";
import { SoundManager } from "../media/SoundManager";
import { Loader } from "../net/Loader";
import { Handler } from "../utils/Handler";
import { Timer } from "../utils/Timer";
import { ExternalSkin } from "./ExternalSkin";
import { SpineSkeletonRenderer } from "./normal/SpineSkeletonRenderer";
import { SpineTemplet } from "./SpineTemplet";
import { ISpineSkeleton } from "./interface/ISpineSkeleton";
import { ISpineOptimizeRender } from "./optimize/interface/ISpineOptimizeRender";
import { Event } from "../events/Event";
import { IRenderElement2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { LayaGL } from "../layagl/LayaGL";
import { DrawType } from "../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../RenderEngine/RenderEnum/RenderPologyMode";
import { Context } from "../renders/Context";
import { SpineShaderInit } from "./material/SpineShaderInit";
import { Vector2 } from "../maths/Vector2";
import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { Material } from "../resource/Material";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { ClassUtils } from "../utils/ClassUtils";
import { SpineNormalRender } from "./optimize/SpineNormalRender";
import { SketonOptimise } from "./optimize/SketonOptimise";
import { SpineEmptyRender } from "./optimize/SpineEmptyRender";
import { Texture2D } from "../resource/Texture2D";
import { Sprite } from "../display/Sprite";
import { Color } from "../maths/Color";
import { Rectangle } from "../maths/Rectangle";
import { SpriteConst } from "../display/SpriteConst";

/**
 * @en The spine animation consists of three parts: `SpineTemplet`, `SpineSkeletonRender`, and `SpineSkeleton`.
 * - Event.PLAYED Used for animation start playing dispatch
 * - Event.STOPPED Used for animation stop playing dispatch
 * - Event.PAUSED Used for animation pause playing dispatch
 * - Event.LABEL Custom events.
 * @zh spine动画由`SpineTemplet`、`SpineSkeletonRender`和`SpineSkeleton`三部分组成。
 * - Event.PLAYED 用于动画开始播放调度
 * - Event.STOPPED 用于动画停止播放调度
 * - Event.PAUSED 用于动画暂停播放调度
 * - Event.LABEL 用于自定义事件
 */
export class Spine2DRenderNode extends BaseRenderNode2D implements ISpineSkeleton {

    static _pool: IRenderElement2D[] = [];
    /**
     * @en Create a 2D render element.
     * @zh 创建2D渲染元素。
     */
    static createRenderElement2D() {
        if (this._pool.length > 0) {
            return this._pool.pop();
        }
        let element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        element.renderStateIsBySprite = false;
        return element;
    }

    /**
     * @en Recover a 2D render element.
     * @param value The 2D render element to be recovered.
     * @zh 回收2D渲染元素。
     * @param value 要回收的2D渲染元素。
     */
    static recoverRenderElement2D(value: IRenderElement2D) {
        if (!(value as any).canotPool) {
            this._pool.push(value);
        }

    }


    /**
     * @en Status - Stopped
     * @zh 状态 - 停止
     */
    static readonly STOPPED: number = 0;
    /**
     * @en Status - Paused
     * @zh 状态 - 暂停
     */
    static readonly PAUSED: number = 1;
    /**
     * @en Status - Playing
     * @zh 状态 - 播放中
     */
    static readonly PLAYING: number = 2;

    /**@internal */
    protected _source: string;
    /**@internal */
    protected _templet: SpineTemplet;
    /**@internal */
    protected _timeKeeper: TimeKeeper;
    /**@internal */
    protected _skeleton: spine.Skeleton;
    /**@internal */
    protected _state: spine.AnimationState;
    /**@internal */
    protected _stateData: spine.AnimationStateData;
    /**@internal */
    protected _currentPlayTime: number = 0;
    /**@internal */
    protected _renerer: SpineSkeletonRenderer;

    private _pause: boolean = true;

    private _currAniName: string = null;
    /** 动画播放的起始时间位置*/
    private _playStart: number;
    /** 动画播放的结束时间位置*/
    private _playEnd: number;
    /** 动画的总时间*/
    private _duration: number;
    /** 播放速率*/
    private _playbackRate: number = 1.0;

    private _playAudio: boolean = true;

    private _soundChannelArr: any[] = [];
    // 播放轨道索引
    private trackIndex: number = 0;

    private _skinName: string = "default";
    private _animationName: string;
    private _loop: boolean = true;

    private _externalSkins: ExternalSkin[];
    private _skin: string;
    private _oldAlpha: number;

    private _matBuffer: Float32Array = new Float32Array(6);
    /** @ignore */
    constructor() {
        super();
        this._renderElements = [];
        this._materials = [];
        this.spineItem = SpineEmptyRender.instance;
    }

    /**
     * @en External skins
     * @zh 外部皮肤
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
     * @en Add command call
     * @param context The rendering context
     * @param px X coordinate
     * @param py Y coordinate
     * @zh 添加命令调用
     * @param context 渲染上下文
     * @param px X坐标
     * @param py Y坐标
     */
    addCMDCall(context: Context, px: number, py: number) {
        let mat = context._curMat;
        let buffer = this._matBuffer;
        buffer[0] = mat.a;
        buffer[1] = - mat.c;
        buffer[2] = mat.tx + mat.a * px + mat.c * py;
        buffer[3] = mat.b;
        buffer[4] = - mat.d;
        buffer[5] = mat.ty + mat.b * px + mat.d * py;
        this._spriteShaderData.setBuffer(SpineShaderInit.NMatrix, buffer);
        Vector2.TempVector2.setValue(context.width, context.height);
        this._spriteShaderData.setVector2(SpineShaderInit.Size, Vector2.TempVector2);
        // context.globalAlpha
        if (this._oldAlpha !==  context.globalAlpha) {
            let scolor = this.spineItem.getSpineColor();
            let a = scolor.a *  context.globalAlpha;
            let color = new Color(scolor.r , scolor.g , scolor.b , a);
            this._spriteShaderData.setColor(SpineShaderInit.Color, color);
            this._oldAlpha =  context.globalAlpha;
        }
        context._copyClipInfoToShaderData(this._spriteShaderData);
    }

    /**
     * @en Reset the style of externally loaded skins
     * @zh 重置外部加载的皮肤的样式
     */
    resetExternalSkin() {
        if (this._skeleton) {
            this._skeleton = new spine.Skeleton(this._templet.skeletonData);
            this.spineItem.changeSkeleton(this._skeleton);
            this._flushExtSkin();
        }
    }

    /**
     * @en Animation source
     * @zh 动画源
     */
    get source(): string {
        return this._source;
    }

    set source(value: string) {
        this._source = value;

        if (value) {
            let template = ILaya.loader.getRes(value, Loader.SPINE);
            if (template) {
                this.templet = template;
            } else {
                ILaya.loader.load(value, Loader.SPINE).then((templet: SpineTemplet) => {
                    if (!this._source || templet && !templet.isCreateFromURL(this._source))
                        return;
                    this.templet = templet;
                });
            }
        }
        else
            this.templet = null;
    }

    /**
     * @en Skin name
     * @zh 皮肤名
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
     * @en Animation name
     * @zh 动画名
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
     * @en Whether to loop
     * @zh 是否循环
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
     * @en Set the URL of the spine animation
     * @zh 设置spine动画的URL
     */
    set url(value: string) {
        if (this._skin != value) {
            this._skin = value;
            Laya.loader.load(value, Loader.SPINE).then((templet: SpineTemplet) => {
                this.init(templet)
            });
        }
    }

    get url(): string {
        return this._skin
    }

    /**
     * @en The reference to the animation template.
     * @returns The animation template.
     * @zh 动画模板的引用。
     * @returns 动画模板。
     */
    get templet(): SpineTemplet {
        return this._templet;
    }

    set templet(value: SpineTemplet) {
        this.init(value);
    }

    /**
     * @en Set the current playback position.
     * @param value Current time in milliseconds.
     * @zh 设置当前播放位置。
     * @param value 当前时间。
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
     * @en Get the current playback state.
     * @returns The current playback state.
     * @zh 获取当前播放状态。
     * @returns 当前播放状态。
     */
    get playState(): number {
        if (!this._currAniName)
            return Spine2DRenderNode.STOPPED;
        if (this._pause)
            return Spine2DRenderNode.PAUSED;
        return Spine2DRenderNode.PLAYING;
    }


    private _useFastRender: boolean = true;
    /**
     * @en Whether to use fast rendering. It is enabled by default. When some complex spines are enabled, this value will render errors. For example, the number of bone controls of a vertex in the spine resource is greater than 4
     * @returns Whether to use the state of fast rendering currently.
     * @zh 是否使用快速渲染，默认开启，某些复杂的Spine开启此值会渲染错误，比如spine资源中某个顶点的骨骼控制数大于4
     * @returns 当前是否使用快速渲染的状态。
     */
    set useFastRender(value: boolean) {
        if (this._useFastRender === value)
            return;
        this._useFastRender = value;
        if (!this._templet)
            return;
        if (value) {
          
            if ((this.spineItem instanceof SpineNormalRender)) {
                this.spineItem.destroy();
                let before = SketonOptimise.normalRenderSwitch;
                SketonOptimise.normalRenderSwitch = false;
                this.spineItem = this._templet.sketonOptimise._initSpineRender(this._skeleton, this._templet, this, this._state);
                SketonOptimise.normalRenderSwitch = before;
                this.play(this._currAniName, this._loop, true, this._currentPlayTime);
            }
        } else {
            this.changeNormal();
        }
    }

    get useFastRender() {
        return this._useFastRender;
    }

    spineItem: ISpineOptimizeRender;

    /** @ignore */
    onAwake(): void {
        if (this._skeleton) {
            if (LayaEnv.isPlaying && this._animationName !== undefined)
                this.play(this._animationName, this._loop, true);
        }
    }


    /**
     * @en Initialize the Spine animation
     * @param templet The Spine template to initialize with
     * @zh 初始化Spine动画
     * @param templet 用于初始化的Spine模板
     */
    protected init(templet: SpineTemplet): void {
        if (this._templet) {
            this.clear();
            this.reset();
            //this.graphics.clear();
        }

        this._templet = templet;
        if (!this._templet)
            return;

        this._templet._addReference();
        this._skeleton = new spine.Skeleton(this._templet.skeletonData);
        this._stateData = new spine.AnimationStateData(this._skeleton.data);
        // 动画状态类
        this._state = new spine.AnimationState(this._stateData);
        //this._renerer = new SpineSkeletonRenderer(templet, false);
        this._timeKeeper = new TimeKeeper(Laya.timer);
        //let sMesh=this._templet.slotManger.init(this._skeleton.drawOrder, this._templet,this._templet.mainTexture);
        if (!this._useFastRender) {
            let before = SketonOptimise.normalRenderSwitch;
            SketonOptimise.normalRenderSwitch = true;
            this.spineItem = this._templet.sketonOptimise._initSpineRender(this._skeleton, this._templet, this, this._state);
            SketonOptimise.normalRenderSwitch = before;
        } else
            this.spineItem = this._templet.sketonOptimise._initSpineRender(this._skeleton, this._templet, this, this._state);

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
                this.event(Event.END);
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

        if (LayaEnv.isPlaying && this._animationName !== undefined)
            this.play(this._animationName, this._loop, true);
    }

    /**
     * @en Play the animation.
     * @param nameOrIndex Animation name or index.
     * @param loop Whether to loop the animation.
     * @param force If false, the animation won't play if it's the same as the previous one; if true, it will force play.
     * @param start Start time.
     * @param end End time.
     * @param freshSkin Whether to refresh skin data.
     * @param playAudio Whether to play audio.
     * @zh 播放动画。
     * @param nameOrIndex 动画名字或者索引。
     * @param loop 是否循环播放。
     * @param force 如果为false，要播的动画跟上一个相同就不生效；如果为true，强制生效。
     * @param start 起始时间。
     * @param end 结束时间。
     * @param freshSkin 是否刷新皮肤数据。
     * @param playAudio 是否播放音频。
     */
    play(nameOrIndex: any, loop: boolean, force: boolean = true, start: number = 0, end: number = 0, freshSkin: boolean = true, playAudio: boolean = true) {
        this._playAudio = playAudio;
        start /= 1000;
        end /= 1000;
        let animationName = nameOrIndex;
        this._loop = loop;
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
            let trackEntry = this._state.setAnimation(this.trackIndex, animationName, loop);
            // 设置起始和结束时间
            //let trackEntry = this._state.getCurrent(this.trackIndex);
            trackEntry.animationStart = start;
            if (!!end && end < trackEntry.animationEnd)
                trackEntry.animationEnd = end;

            let animationDuration = trackEntry.animation.duration;
            this._duration = animationDuration;
            this._playStart = start;
            this._playEnd = end <= animationDuration ? end : animationDuration;

            if (this._pause) {
                this._pause = false;
                this._beginUpdate();
                //this.timer.frameLoop(1, this, this._update, null, true);
            }
            this._update();
        }
    }

    private _update(): void {
        this._timeKeeper.update();
        let state = this._state;
        let delta = this._timeKeeper.delta * this._playbackRate;
        // 在游戏循环中，update被调用，这样AnimationState就可以跟踪时间
        state.update(delta);
        // 使用当前动画和事件设置骨架
        state.apply(this._skeleton);
        //@ts-ignore
        this._currentPlayTime = state.getCurrentPlayTime(this.trackIndex);
        
        // spine在state.apply中发送事件，开发者可能会在事件中进行destory等操作，导致无法继续执行
        if (!this._state || !this._skeleton) {
            return;
        }
        // 计算骨骼的世界SRT(world SRT)
        this._skeleton.updateWorldTransform();
        this.spineItem.render(this._currentPlayTime);

        if ((this.owner as Sprite)._renderType & SpriteConst.FILTERS) {
            (this.owner as Sprite).repaint();
        }
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
     * @en Get the number of current animations
     * @zh 获取当前动画的数量
     */
    getAnimNum(): number {
        // return this._templet.skeletonData.animations.length;
        //@ts-ignore
        return this._templet.skeletonData.getAnimationsSize();
    }

    /**
     * @en Get the name of the specified animation
     * @param index The index of the animation
     * @zh 获取指定动画的名字
     * @param index 动画的索引
     */
    getAniNameByIndex(index: number): string {
        return this._templet.getAniNameByIndex(index);
    }

    /**
     * @en Get the reference of a slot by its name
     * @param slotName The name of the slot
     * @zh 通过名字获取插槽的引用
     * @param slotName 插槽的名字
     */
    getSlotByName(slotName: string) {
        return this._skeleton.findSlot(slotName)
    }

    /**
     * @en Set the animation playback rate
     * @param value 1 is the standard rate
     * @zh 设置动画播放速率
     * @param value 1为标准速率
     */
    playbackRate(value: number): void {
        this._playbackRate = value;
    }

    /**
     * @en Show a skin by its name
     * @param name The name of the skin
     * @zh 通过名字显示一套皮肤
     * @param name 皮肤的名字
     */
    showSkinByName(name: string): void {
        this.showSkinByIndex(this._templet.getSkinIndexByName(name));
    }

    /**
     * @en Show a skin by its index
     * @param skinIndex The index of the skin
     * @zh 通过索引显示一套皮肤
     * @param skinIndex 皮肤索引
     */
    showSkinByIndex(skinIndex: number): void {
        this.spineItem.setSkinIndex(skinIndex);
        // let newSkine = this._skeleton.data.skins[skinIndex];
        // this._skeleton.setSkin(newSkine);
        //@ts-ignore
        this._skeleton.showSkinByIndex(skinIndex);
        this._skeleton.setSlotsToSetupPose();
    }

    /**
     * @en Trigger an event
     * @param type The type of the event
     * @param data The data associated with the event
     * @zh 触发事件
     * @param type 事件类型
     * @param data 与事件关联的数据
     */
    event(type: string, data?: any): void {
        this.owner.event(type, data);
    }

    /**
     * @en Stop the animation
     * @zh 停止动画
     */
    stop(): void {
        if (!this._pause) {
            this._pause = true;
            this._currAniName = null;
            this._clearUpdate();
            //this.timer.clear(this, this._update);
            this._state.update(-this._currentPlayTime);
            this._currentPlayTime = 0;
            this.event(Event.STOPPED);

            if (this._soundChannelArr.length > 0) { // 有正在播放的声音
                this._onAniSoundStoped(true);
            }
        }
    }

    private _clearUpdate(): void {
        this._needUpdate = false;
    }

    private _beginUpdate(): void {
        this._needUpdate = true;
    }

    private _needUpdate: boolean = false;
    /**
     * @ignore
     * @en Update method called every frame
     * @zh 每帧调用的更新方法
     */
    onUpdate(): void {
        this._needUpdate && this._update();
    }



    /**
     * @en Pause the animation playback
     * @zh 暂停动画的播放
     */
    paused(): void {
        if (!this._pause) {
            this._pause = true;
            this._clearUpdate();
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
     * @en Resume the animation playback
     * @zh 恢复动画的播放
     */
    resume(): void {
        if (this._pause) {
            this._pause = false;
            this._beginUpdate();
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

    /**
     * @en Reset the Spine animation component
     * @zh 重置Spine动画组件
     */
    reset() {
        this._templet._removeReference(1);
        this._templet = null;
        this._timeKeeper = null;
        this._skeleton = null;
        this._state.clearListeners();
        this._state = null;
        //this._renerer = null;
        this._currAniName = null;
        this._pause = true;
        this._clearUpdate();
        if (this._soundChannelArr.length > 0)
            this._onAniSoundStoped(true);
    }

    // ------------------------------------新增加的接口----------------------------------------------------
    /**
     * @en Add an animation to the queue
     * @param nameOrIndex Animation name or index
     * @param loop Whether to loop the animation
     * @param delay Delay before playing the animation (in seconds, can be negative)
     * @zh 添加一个动画到队列
     * @param nameOrIndex 动画名字或者索引
     * @param loop 是否循环播放
     * @param delay 延迟调用时间
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
     * @en Set the duration of the mix between two animations
     * @param fromNameOrIndex Name or index of the source animation
     * @param toNameOrIndex Name or index of the target animation
     * @param duration Mix duration in seconds
     * @zh 设置当动画被改变时，存储混合(交叉淡出)的持续时间
     * @param fromNameOrIndex 源动画的名称或索引
     * @param toNameOrIndex 目标动画的名称或索引
     * @param duration 混合持续时间
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
     * @en Get bone information (spine.Bone)
     * Note: The returned bone information is from Spine runtime (spine.Bone) and is not compatible with engine methods
     * @param boneName Name of the bone
     * @returns Bone information
     * @zh 获取骨骼信息(spine.Bone)
     * 注意: 获取到的是spine运行时的骨骼信息(spine.Bone)，不适用于引擎的方法
     * @param boneName 骨骼名称
     * @returns 骨骼信息
     */
    getBoneByName(boneName: string) {
        return this._skeleton.findBone(boneName);
    }

    /**
     * @en Get the Skeleton (spine.Skeleton)
     * @returns Spine Skeleton
     * @zh 获取Skeleton(spine.Skeleton)
     * @returns Spine骨架
     */
    getSkeleton() {
        return this._skeleton;
    }

    /**
     * @en Replace slot attachment
     * @param slotName Name of the slot
     * @param attachmentName Name of the attachment
     * @zh 替换插槽皮肤
     * @param slotName 插槽名称
     * @param attachmentName 附件名称
     */
    setSlotAttachment(slotName: string, attachmentName: string) {
        this.changeNormal();
        this._skeleton.setAttachment(slotName, attachmentName);
    }

    /**
     * @en Clear render elements
     * @zh 清除渲染元素
     */
    clear(): void {
        this._renderElements.forEach(element => {
            Spine2DRenderNode.recoverRenderElement2D(element);
        });
        super.clear();
    }

    /**
     * @en Change to normal render mode
     * @zh 切换到普通渲染模式
     */
    changeNormal() {
        if (!(this.spineItem instanceof SpineNormalRender)) {
            this.spineItem.destroy();
            let before = SketonOptimise.normalRenderSwitch;
            SketonOptimise.normalRenderSwitch = true;
            this.spineItem = this._templet.sketonOptimise._initSpineRender(this._skeleton, this._templet, this, this._state);
            SketonOptimise.normalRenderSwitch = before;
        }
    }

    /**
     * @ignore
     * @en Called when the component is being destroyed
     * @zh 当组件被销毁时调用
     */
    onDestroy(): void {
        if (this._templet) {
            this.reset();
        }
        this.spineItem.destroy();
    }

    /**
     * @en Draw geometries
     * @param geo Render geometry element
     * @param elements Array of [Material, startIndex, indexCount]
     * @zh 绘制几何体
     * @param geo 渲染几何元素
     * @param elements [材质, 起始索引, 索引数量] 数组
     */
    drawGeos(geo: IRenderGeometryElement, elements: [Material, number, number][]) {
        for (var i = 0, n = elements.length; i < n; i++) {
            let element = Spine2DRenderNode.createRenderElement2D();
            element.geometry.bufferState = geo.bufferState;
            element.geometry.indexFormat = geo.indexFormat;
            element.geometry.clearRenderParams();
            element.geometry.setDrawElemenParams(elements[i][1], elements[i][2]);
            let material = elements[i][0];
            this._renderElements.push(element);
            if (this._materials[0] != null) {
                let rendernodeMaterial = this._materials[i];
                rendernodeMaterial.setTextureByIndex(SpineShaderInit.SpineTexture, material.getTextureByIndex(SpineShaderInit.SpineTexture));
                rendernodeMaterial.blendSrc = material.blendSrc;
                rendernodeMaterial.blendDst = material.blendDst;
                material = rendernodeMaterial;
            }
            element.materialShaderData = material.shaderData;
            element.subShader = material._shader.getSubShaderAt(0);
            element.value2DShaderData = this._spriteShaderData;
        }
    }
    /**
     * @en Update render elements
     * @param geo Render geometry element
     * @param elements Array of [Material, startIndex, indexCount]
     * @zh 更新渲染元素
     * @param geo 渲染几何元素
     * @param elements [材质, 起始索引, 索引数量] 数组
     */
    updateElements(geo: IRenderGeometryElement, elements: [Material, number, number][]) {
        this.clear();
        this.drawGeos(geo, elements);
    }

    /**
     * @en Draw a single geometry
     * @param geo Render geometry element
     * @param material Material to use for rendering
     * @param count indexCount
     * @param offset startIndex
     * @zh 绘制单个几何体
     * @param geo 渲染几何元素
     * @param material 用于渲染的材质
     * @param count 索引数量
     * @param offset 起始索引
     */
    drawGeo(geo: IRenderGeometryElement, material: Material , count:number , offset:number ) {
        let element = Spine2DRenderNode.createRenderElement2D();
        let eleGeo = element.geometry;
        eleGeo.bufferState = geo.bufferState;
        eleGeo.indexFormat = geo.indexFormat;
        eleGeo.instanceCount = geo.instanceCount;
        eleGeo.clearRenderParams();
        eleGeo.setDrawElemenParams(count , offset);

        this._renderElements.push(element);
        if (this._materials[0] != null) {
            let rendernodeMaterial = this._materials[0];
            rendernodeMaterial.setTextureByIndex(SpineShaderInit.SpineTexture, material.getTextureByIndex(SpineShaderInit.SpineTexture));
            rendernodeMaterial.blendSrc = material.blendSrc;
            rendernodeMaterial.blendDst = material.blendDst;
            material = rendernodeMaterial;
        }
        element.materialShaderData = material.shaderData;
        element.subShader = material._shader.getSubShaderAt(0);
        element.value2DShaderData = this._spriteShaderData;
    }

    /**
     * @en Get material for rendering
     * @param texture Texture to use
     * @param blendMode Blend mode
     * @returns Material for rendering
     * @zh 获取用于渲染的材质
     * @param texture 要使用的纹理
     * @param blendMode 混合模式
     * @returns 用于渲染的材质
     */
    getMaterial(texture: Texture2D, blendMode: number): Material {
        let mat: Material;
        if (this._materials.length <= this._renderElements.length) {
            //默认给一个新的Mateiral
            mat = this.templet.getMaterial(texture, blendMode);
            //renderNode._materials.push(mat);
        } else {
            mat = this._materials[this._renderElements.length];
            SpineShaderInit.SetSpineBlendMode(blendMode, mat);
            mat.setTextureByIndex(SpineShaderInit.SpineTexture, texture);
        }
        return mat;
    }
}

export enum ERenderType {
    normal = 0,
    boneGPU = 1,
    rigidBody = 2,
}

/**
 * @en TimeKeeper class for managing time-related operations in animations
 * @zh TimeKeeper类用于管理动画中的时间相关操作
 */
class TimeKeeper {
    /**
     * @en Maximum allowed delta time
     * @zh 允许的最大时间增量
     */
    maxDelta: number;
    /**
     * @en Frames per second
     * @zh 每秒帧数
     */
    framesPerSecond: number;
    /**
     * @en Time elapsed since last update
     * @zh 自上次更新以来经过的时间
     */
    delta: number;
    /**
     * @en Total elapsed time
     * @zh 总经过时间
     */
    totalTime: number;
    /**
     * @en Time of the last update
     * @zh 上次更新的时间
     */
    lastTime: number;
    /**
     * @en Total frame count
     * @zh 总帧数
     */
    frameCount: number;
    /**
     * @en Time per frame
     * @zh 每帧时间
     */
    frameTime: number;

    /**
     * @en Timer instance
     * @zh 计时器实例
     */
    timer: Timer;

    /**
     * @en Create a new TimeKeeper instance
     * @param timer Timer instance to use
     * @zh 创建 TimeKeeper 的新实例
     * @param timer 要使用的计时器实例
     */
    constructor(timer: Timer) {
        this.maxDelta = 0.064;
        this.timer = timer;
    }
    /**
     * @en Update the time keeper
     * @zh 更新时间管理器
     */
    update() {
        // this.delta =1 / 30;

        this.delta = this.timer.delta / 1000;
        if (this.delta > this.maxDelta)
            this.delta = this.maxDelta;
    }
}

ClassUtils.regClass("Spine2DRenderNode", Spine2DRenderNode);