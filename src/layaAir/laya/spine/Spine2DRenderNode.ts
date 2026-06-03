import { ILaya } from "../../ILaya";
import { Laya } from "../../Laya";
import { LayaEnv } from "../../LayaEnv";
import { BaseRenderNode2D } from "../NodeRender2D/BaseRenderNode2D";
import { SoundManager } from "../media/SoundManager";
import { Loader } from "../net/Loader";
import { Handler } from "../utils/Handler";
import { Timer } from "../utils/Timer";
import { ExternalSkin } from "./ExternalSkin";
import { SpineTemplet } from "./SpineTemplet";
import { ISpineOptimizeRender } from "./optimize/interface/ISpineOptimizeRender";
import { Event } from "../events/Event";
import { IRenderElement2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { LayaGL } from "../layagl/LayaGL";
import { SpineShaderInit } from "./material/SpineShaderInit";
import { Material } from "../resource/Material";
import { ClassUtils } from "../utils/ClassUtils";
import { SpineNormalRender } from "./optimize/SpineNormalRender";
import { SketonOptimise } from "./optimize/SketonOptimise";
import { SpineEmptyRender } from "./optimize/SpineEmptyRender";
import { Mesh2D } from "../resource/Mesh2D";
import { SpineOptimizeRender } from "./optimize/SpineOptimizeRender";
import { IRenderContext2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { ISpineRenderDataHandle } from "../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { Vector2 } from "../maths/Vector2";
import { Vector4 } from "../maths/Vector4";
import { ShaderFeatureType } from "../RenderEngine/RenderShader/Shader3D";
import { Texture } from "../resource/Texture";
import { SlotUtils } from "./optimize/SlotUtils";
import { RepaintFlag } from "../display/SpriteConst";

/**
 * @zh Spine动画渲染节点。
 * - Event.PLAYED:动画开始播放调度。
 * - Event.STOPPED:动画停止播放调度。
 * - Event.PAUSED:动画暂停播放调度。
 * - Event.LABEL:自定义事件。
 * @en spine render node.
 * - Event.PLAYED:Animation start play dispatch.
 * - Event.STOPPED:Animation stop play dispatch.
 * - Event.PAUSED:Animation pause play dispatch.
 * - Event.LABEL:Custom event.
 */
export class Spine2DRenderNode extends BaseRenderNode2D {

    /** @ignore @blueprintIgnore */
    static _pool: IRenderElement2D[] = [];

    /** @ignore @blueprintIgnore */
    static createRenderElement2D() {
        let element: IRenderElement2D;
        if (this._pool.length > 0) {
            element = this._pool.pop();
        } else {
            element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        }
        element.renderStateIsBySprite = false;
        element.nodeCommonMap = ["spine2D"];
        return element;
    }

    /** @ignore @blueprintIgnore */
    static recoverRenderElement2D(value: IRenderElement2D) {
        if (!(value as any).canotPool) {
            this._pool.push(value);
        }
    }

    /** @ignore */
    spineItem: ISpineOptimizeRender;
    /** @internal */
    _mesh: Mesh2D;
    /** 
     * @zh 物理更新模式。
     * @en The physics update mode. 
     **/
    physicsUpdate = 2;

    /**状态-停止 */
    static readonly STOPPED: number = 0;
    /**状态-暂停 */
    static readonly PAUSED: number = 1;
    /**状态-播放中 */
    static readonly PLAYING: number = 2;

    protected _renderHandle: ISpineRenderDataHandle;
    protected _source: string;
    protected _templet: SpineTemplet;
    protected _timeKeeper: TimeKeeper;
    protected _skeleton: spine.Skeleton;
    protected _state: spine.AnimationState;
    protected _stateData: spine.AnimationStateData;
    protected _currentPlayTime: number = 0;
    private _pause: boolean = true;
    private _needUpdate: boolean = false;
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
    private _offset: Vector2 = new Vector2();
    private _renderOffset: Vector2 = new Vector2();
    private _setPreAlphaFlag = false;
    private _premultipliedAlpha = true;

    /** @ignore */
    constructor() {
        super();
        this._renderElements = [];
        this._materials = [];
        this.spineItem = SpineEmptyRender.instance;
        this._renderHandle.offset = this._renderOffset;
    }

    protected _isMaterialVaild(value: Material): boolean {
        return value.checkType(ShaderFeatureType.D2_BaseRenderNode2D);
    }

    protected _getcommonUniformMap(): Array<string> {
        return ["BaseRender2D", "Spine2D"]
    }

    protected _createRenderHandle(): ISpineRenderDataHandle {
        let handle = LayaGL.render2DRenderPassFactory.createSpineRenderDataHandle();
        return handle;
    }

    /**
     * @zh 外部皮肤，用于根据不同皮肤，替换对应插槽的附件。
     * @en External skins, used to replace the attachments of corresponding slots according to different skins.
     */
    get externalSkins() {
        return this._externalSkins;
    }
    set externalSkins(value: ExternalSkin[]) {
        if (this._externalSkins) {
            this._externalSkins.forEach(skin => {
                skin.target = null;
            });
            this._externalSkins.length = 0;
        }
        if (value) {
            for (let i = value.length - 1; i >= 0; i--) {
                value[i].target = this;
            }
        }
        this._externalSkins = value;
    }

    /** @ignore @blueprintIgnore */
    renderUpdate(context: IRenderContext2D) {
        this._updateLight();
    }

    /**
     * @zh 重置外部加载的皮肤数据。更换附件或皮肤数据后，需要调用此方法，否则不会生效。
     * @en Resets the external loaded skin data. After replacing attachments or skin data, this method needs to be called, otherwise it will not take effect.
     */
    resetExternalSkin() {
        if (this._skeleton) {
            this._skeleton = new spine.Skeleton(this._templet.skeletonData);
            this.spineItem.changeSkeleton(this._skeleton);
            this._renderHandle.skeleton = this._skeleton;
            this._flushExtSkin();
        }
    }

    /**
     * @zh 是否启用透明预乘。设置属性需要使用setPremultipliedAlpha方法。
     * @en Whether to enable transparent premultiplied. Set the attribute needs to use the setPremultipliedAlpha method.
     */
    get premultipliedAlpha(): boolean {
        return  !this._templet || this._setPreAlphaFlag ? this._premultipliedAlpha : this._templet.premultipliedAlpha;
    }

    set premultipliedAlpha(value: boolean) {
        this._premultipliedAlpha = value;
    }
    
    /**
     * @en Set the transparent premultiplied.
     * @zh 设置透明预乘。
     * @param value Whether to enable transparent premultiplied.
     * @param value 是否启用透明预乘。
     */
    setPremultipliedAlpha(value: boolean) {
        this.spineItem.clearCacheMaterials();
        this._premultipliedAlpha = value;
        this._setPreAlphaFlag = true;
    }

    /**
     * @zh 动画源文件路径
     * @en Spine source file path.
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
                    if (this.destroyed)
                        return;
                    this.templet = templet;
                });
            }
        }
        else
            this.templet = null;
    }

    /**
     * @zh 当前的Spine动画皮肤名称。
     * @en The current spine animation skin name.
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
     * @zh 当前的Spine动画名称
     * @en The current spine animation name.
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
     * @zh 最大播放间隔
     * @en The current spine animation state.
     */
    get maxDetlaTime(): number {
        return this._timeKeeper.maxDelta;
    }

    set maxDetlaTime(value: number) {
        this._timeKeeper.maxDelta = value;
    }

    /**
     * @zh 是否循环播放Spine动画
     * @en Whether to loop spine animation.
     */
    get loop(): boolean {
        return this._loop;
    }

    set loop(value: boolean) {
        this._loop = value;
        if (this._templet)
            this.play(this._animationName, this._loop, true);
    }


    /** @deprecated */
    get url(): string {
        return this._skin
    }
    /** @deprecated */
    set url(value: string) {
        if (this._skin != value) {
            this._skin = value;
            Laya.loader.load(value, Loader.SPINE).then((templet: SpineTemplet) => {
                this.init(templet)
            });
        }
    }
    /**
     * @zh 是否启用双色着色（Two-Color Tinting）的渲染效果
     * @en Whether to use two color tint.
     */
    get twoColorTint(): boolean {
        return this._spriteShaderData.hasDefine(SpineShaderInit.SPINE_TWOCOLORTINT);
    }

    set twoColorTint(value: boolean) {
        if (value) {
            this._spriteShaderData.addDefine(SpineShaderInit.SPINE_TWOCOLORTINT);
        } else {
            this._spriteShaderData.removeDefine(SpineShaderInit.SPINE_TWOCOLORTINT);
        }
    }

    /**
     * @zh Spine动画模板的引用
     * @en The Spine template reference.
     */
    get templet(): SpineTemplet {
        return this._templet;
    }

    set templet(value: SpineTemplet) {
        this.init(value);
    }

    /**
     * @zh 设置当前播放位置
     * @param value 当前时间
     * @en Set the current play time.
     * @param value The current play time.
     */
    set currentTime(value: number) {
        if (!this._templet)
            return;

        value /= 1000;
        if (value < this._playStart || (!!this._playEnd && value > this._playEnd) || value > this._duration)
            throw new Error("AnimationPlayer: value must large than playStartTime,small than playEndTime.");

        this._state.update(value - this._currentPlayTime);
        this._currentPlayTime = value;
    }

    /**
     * @zh 获取当前播放状态
     * @en Get the current play time.
     */
    get playState(): number {
        if (this._pause)
            if (this._currentPlayTime) return Spine2DRenderNode.PAUSED;
            else return Spine2DRenderNode.STOPPED;
        return Spine2DRenderNode.PLAYING;
    }


    private _useFastRender: boolean = true;
    /**
     * @zh 是否使用快速渲染，默认开启，某些复杂的Spine开启此值会渲染错误，比如spine资源中某个顶点的骨骼控制数大于4
     * @en Whether to use fast rendering. It is enabled by default. When some complex spines are enabled, this value will render errors. For example, the number of bone controls of a vertex in the spine resource is greater than 4.
     */
    get useFastRender() {
        return this._useFastRender;
    }
    set useFastRender(value: boolean) {
        if (this._useFastRender === value)
            return;
        this._useFastRender = value;
        if (!this._templet)
            return;
        if (value) {
            this.changeFast();
        } else {
            this.changeNormal();
        }
        this.play(this._animationName, this._loop, true, this._currentPlayTime);
    }

    get offset(): Vector2 {
        return this._offset;
    }

    set offset(value: Vector2) {
        this._offset = value;
        this.boundsChange = true;

        if (this._templet) {
            this._renderOffset.x = value.x + this._templet.offsetX;
            this._renderOffset.y = value.y - this._templet.offsetY;
            this._renderHandle.offset = this._renderOffset;
        }
        
        if (this.playState !== Spine2DRenderNode.PLAYING) {
            this.owner.repaint(RepaintFlag.UpdateRT);
        }
    }

    private _autoAdjust: boolean = false;

    public get autoAdjust(): boolean {
        return this._autoAdjust;
    }

    public set autoAdjust(value: boolean) {
        if (this._autoAdjust === value)
            return;
        this._autoAdjust = value;
        if (value) {
            this._doAutoAdjust();
        }
    }

    private _doAutoAdjust() {
        if (!this._templet)
            return;
        let width = this._templet.width;
        let height = this._templet.height;

        if (width === undefined || height === undefined) {
            console.warn('Spine.SkeletonData: width or height is undefined');
            this._autoAdjust = false;
            return;
        }

        if (width < 1) width = 100;
        if (height < 1) height = 100;

        this.owner.size(Math.round(width), Math.round(height));
        this.owner.pivot(Math.round(this._templet.offsetX), Math.round(-this._templet.offsetY));
    }

    /** @ignore @blueprintIgnore */
    onEnable(): void {
        // this._offset.setValue(this.owner.pivotX, this.owner.pivotY);
        // this._renderHandle.offset = this._offset;
        this.owner.on(Event.TRANSFORM_CHANGED, this, this.onTransformChanged);
        if (this._skeleton) {
            if (LayaEnv.isPlaying && this._animationName !== undefined)
                this.play(this._animationName, this._loop, true);
        }
    }

    /** @ignore @blueprintIgnore */
    onDisable(): void {
        this.owner.off(Event.TRANSFORM_CHANGED, this, this.onTransformChanged);
    }

    /**
     * @zh 初始化渲染器。
     * @param templet Spine 模板
     * @en Initializes the renderer.
     * @param templet The Spine template.
     */
    protected init(templet: SpineTemplet): void {
        if (this.destroyed) return;
        if (this._templet) {
            this.clear();
        }

        this._templet = templet;
        if (!this._templet)
            return;

        this._templet._addReference();
        this._skeleton = new spine.Skeleton(this._templet.skeletonData);

        this._renderHandle.skeleton = this._skeleton;
        this._stateData = new spine.AnimationStateData(this._skeleton.data);
        // 动画状态类
        this._state = new spine.AnimationState(this._stateData);
        //this._renerer = new SpineSkeletonRenderer(templet, false);
        this._timeKeeper = new TimeKeeper(Laya.timer);
        //let sMesh=this._templet.slotManger.init(this._skeleton.drawOrder, this._templet,this._templet.mainTexture);
        if (this.spineItem)
            this.spineItem.destroy();

        this._struct.renderElements = [];
        this._struct.setRepaint();

        if (this._autoAdjust) {
            this._doAutoAdjust();
        }

        this.onTransformChanged();

        this._renderOffset.x = this._offset.x + this._templet.offsetX;
        this._renderOffset.y = this._offset.y - this._templet.offsetY;
        this._renderHandle.offset = this._renderOffset;
        this.boundsChange = true;

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
                this.owner.event(Event.END);
                if (entry.loop) { // 如果多次播放,发送complete事件
                    this.spineItem.complete();
                    this.owner.event(Event.COMPLETE);
                } else { // 如果只播放一次，就发送stop事件
                    this.stop();
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
                this.owner.event(Event.LABEL, eventData);
                if (this._playAudio && eventData.audioValue) {
                    let channel = SoundManager.playSound(templet.basePath + eventData.audioValue, 1, Handler.create(this, this._onAniSoundStoped), null, (this._currentPlayTime * 1000 - eventData.time) / 1000);
                    SoundManager.playbackRate = this._playbackRate;
                    channel && this._soundChannelArr.push(channel);
                }
            },
        });
        this._flushExtSkin();
        this.owner.event(Event.READY);

        if (
            LayaEnv.isPlaying
            && this.enabled
            && this._animationName !== undefined
        ) {
            this.play(this._animationName, this._loop, true);
        }
    }

    /**
     * @zh 播放动画
     * @param nameOrIndex	Spine动画名字或者索引
     * @param loop		    是否循环播放
     * @param force		    false,如果要播的动画跟上一个相同就不生效,true,强制生效
     * @param start		    起始时间
     * @param end			结束时间
     * @param freshSkin	    是否刷新皮肤数据
     * @param playAudio	    是否播放音频
     * @en Play Spine animation.
     * @param nameOrIndex	Spine animation name or index.
     * @param loop			Whether to loop play.
     * @param force			false, if the animation to play is the same as the last one then it won't be played again. true, force playing even if the animation is the same.
     * @param start			Start time.
     * @param end			End time.
     * @param freshSkin		Whether to refresh skin data.
     * @param playAudio		Whether to play audio.
     */
    play(nameOrIndex: string | number, loop: boolean, force: boolean = true, start: number = 0, end: number = 0, freshSkin: boolean = true, playAudio: boolean = true) {
        if (!this._templet) {
            console.warn("Spine2DRenderNode.play: templet is not ready, animation:", nameOrIndex);
            return;
        }
        this._playAudio = playAudio;
        start /= 1000;
        end /= 1000;
        this._loop = loop;
        if (start < 0 || end < 0)
            throw new Error("SpineSkeleton: start and end must large than zero.");
        if ((end !== 0) && (start > end))
            throw new Error("SpineSkeleton: start must less than end.");

        if (typeof nameOrIndex == "number") {
            nameOrIndex = this.getAniNameByIndex(nameOrIndex);
        } else {
            let hasAni = !!this.templet.findAnimation(nameOrIndex);
            if (!hasAni) return
        }

        if (force || this._pause || this._animationName != nameOrIndex) {
            this._animationName = nameOrIndex;
            this.spineItem.play(nameOrIndex);
            // 设置执行哪个动画
            let trackEntry = this._state.setAnimation(this.trackIndex, nameOrIndex, loop);
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
                this._needUpdate = true;
            }
            this._update();
            this.owner.event(Event.PLAYED);
        }
    }

    private _update(): void {
        this._timeKeeper.update();
        let state = this._state;
        let delta = this._timeKeeper.delta * this._playbackRate;
        // 在游戏循环中，update被调用，这样AnimationState就可以跟踪时间
        state.update(delta);

        let currentPlayTime = 0;
        let enableCache = this.spineItem.enableCache;
        if (enableCache) {
            //@ts-ignore
            currentPlayTime = state.getCurrentPlayTimeByCache(this.trackIndex);
        } else {
            //@ts-ignore
            currentPlayTime = state.getCurrentPlayTime(this.trackIndex);
        }

        this._currentPlayTime = currentPlayTime;

        // 使用当前动画和事件设置骨架
        if (!enableCache) {
            state.apply(this._skeleton);
        }

        // spine在state.apply中发送事件，开发者可能会在事件中进行destory等操作，导致无法继续执行
        if (!this._state || !this._skeleton || this.destroyed) {
            return;
        }

        if (!enableCache) {
            if (SpineTemplet.VersionFirst >= 4 && SpineTemplet.VersionSecond >= 2) {
                this._skeleton.update(delta);
            }
            // 计算骨骼的世界SRT(world SRT)
            this._skeleton.updateWorldTransform(this.physicsUpdate);// spine.Physics.update;
        }

        this.spineItem.render(currentPlayTime);
        this.owner.repaint(RepaintFlag.UpdateRT);
    }

    private _flushExtSkin() {
        if (null == this._skeleton) return;
        let skins = this._externalSkins;
        if (skins) {
            // let normal = false;//todo 需要修改顶点构成?
            for (let i = skins.length - 1; i >= 0; i--) {
                skins[i].flush();
                // normal = skins[i].normal || normal;
            }
            this.useFastRender = false;
        }
    }
    /**
     * @zh 得到当前动画的数量
     * @en Get the number of current animations.
     */
    getAnimNum(): number {
        // return this._templet.skeletonData.animations.length;
        //@ts-ignore
        return this._templet.skeletonData.getAnimationsSize();
    }

    /**
     * @zh 得到指定动画的名字
     * @param index	动画的索引
     * @en Get the name of the specified animation.
     * @param index The index of the animation.
     */
    getAniNameByIndex(index: number): string {
        return this._templet.getAniNameByIndex(index);
    }
    /**

     * @zh 通过名字得到插槽的引用
     * @param slotName 插槽的名字
     * @en Get the reference to the slot by name.
     * @param slotName The name of the slot.
     */
    getSlotByName(slotName: string) {
        return this._skeleton.findSlot(slotName)
    }

    /**
     * @zh 设置动画播放速率
     * @param value	速率值，1为标准速率
     * @en Set the animation playback rate.
     * @param value The playback rate.
     */
    playbackRate(value: number): void {
        this._playbackRate = value;
    }

    /**
     * @zh 通过名字显示一套皮肤
     * @param name	皮肤的名字
     * @en Show a set of skins by name.
     * @param name The name of the skin.
     */
    showSkinByName(name: string): void {
        this.showSkinByIndex(this._templet.getSkinIndexByName(name));
    }

    /**
     * @zh 通过索引显示一套皮肤
     * @param skinIndex	皮肤索引
     * @en Show a set of skins by index.
     * @param skinIndex The index of the skin.
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
     * @zh 停止动画
     * @en Stop the animation.
     */
    stop(): void {
        if (!this._pause) {
            this._pause = true;
            this._needUpdate = false;
            this._state.update(-this._currentPlayTime);
            this._currentPlayTime = 0;
            this.owner.event(Event.STOPPED);

            if (this._soundChannelArr.length > 0) { // 有正在播放的声音
                this._onAniSoundStoped(true);
            }
        }
    }

    /** @ignore @blueprintIgnore */
    onUpdate(): void {
        this._needUpdate && this._update();
    }

    /**
     * @zh 暂停动画的播放
     * @en Pause the animation playback.
     */
    paused(): void {
        if (!this._pause) {
            this._pause = true;
            this._needUpdate = false;
            this.owner.event(Event.PAUSED);
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
     * @zh 恢复动画的播放
     * @en Resume the animation playback.
     */
    resume(): void {
        if (this._pause) {
            this._pause = false;
            this._needUpdate = true;
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
     * @zh 清掉播放完成的音频
     * @param force 是否强制删掉所有的声音channel
     * @en Clear the finished audio.
     * @param force Whether to force delete all audio channels.
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

    /** @internal */
    reset() {
        this._templet._removeReference(1);
        this._templet = null;
        this._timeKeeper = null;
        this._skeleton = null;
        this._state.clearListeners();
        this._state = null;
        this._pause = true;
        this._needUpdate = false;
        if (this._soundChannelArr.length > 0)
            this._onAniSoundStoped(true);
    }

    // ------------------------------------新增加的接口----------------------------------------------------
    /**
     * @zh 添加一个动画
     * @param nameOrIndex   动画名字或者索引
     * @param loop          是否循环播放
     * @param delay         延迟调用，可以为负数
     * @en Add an animation
     * @param nameOrIndex   Animation name or index
     * @param loop          Whether to play in a loop
     * @param delay         Delay call, can be negative
     */
    addAnimation(nameOrIndex: string | number, loop: boolean = false, delay: number = 0) {
        delay /= 1000;
        let animationName = nameOrIndex;
        if (typeof animationName == "number") {
            animationName = this.getAniNameByIndex(animationName);
        }
        this._animationName = animationName;
        this._state.addAnimation(this.trackIndex, animationName, loop, delay);
    }

    /**
     * @zh 设置插槽纹理
     * @param slotName 插槽名称
     * @param texture 纹理对象
     * @param createAttachment 是否创建新的附件副本
     * @en Set slot texture
     * @param slotName Slot name
     * @param texture Texture object
     * @param createAttachment Whether to create a new attachment copy
     */
    setSlotTexture(slotName: string, texture: Texture, createAttachment: boolean = true) {
        if (this._useFastRender) {
            console.log("setSlotTexture: useFastRender is true, return");
            return
        }

        if (!this._skeleton){
            console.log("setSlotTexture: skeleton not found, return");
            return;
        }
        
        let slot = this._skeleton.findSlot(slotName);
        if (!slot){
            console.log("setSlotTexture: slot not found, slotName: " + slotName);
            return;
        }
        
        SlotUtils.setSlotTexture(slot, texture, this._templet, createAttachment);
    }

    /**
     * @zh 设置当动画被改变时，存储混合(交叉淡出)的持续时间
     * @param fromNameOrIndex 原来的动画名字或者索引 
     * @param toNameOrIndex   目标的动画名字或者索引
     * @param duration 混合(交叉淡出)的持续时间
     * @en Set the duration of mixing (cross-fade) when an animation is changed.
     * @param fromNameOrIndex The name or index of the original animation.
     * @param toNameOrIndex The name or index of the target animation.
     * @param duration The duration of mixing (cross-fade).
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
     * @zh 获取骨骼信息(spine.Bone)
     * - 注意: 获取到的是spine运行时的骨骼信息(spine.Bone)，不适用引擎的方法
     * @param boneName  骨骼名称
     * @en Get the bone information (spine.Bone)
     * - Note: Get the spine runtime bone information (spine.Bone), not the engine method.
     * @param boneName The name of the bone.
     */
    getBoneByName(boneName: string) {
        return this._skeleton.findBone(boneName);
    }

    /**
     * @zh 获取骨骼(spine.Skeleton)
     * @en Get the Skeleton(spine.Skeleton)
     */
    getSkeleton() {
        return this._skeleton;
    }

    /**
     * @zh 根据给定的坐标移动物体,支持Spine物理时有效（不能低于Spine4.2版本）
     * @param x X轴坐标
     * @param y Y轴坐标
     * @en Move the object according to the given coordinates, effective when Spine physics is enabled (cannot be lower than version 4.2 of Spine)
     * @param x X-axis coordinate
     * @param y Y-axis coordinate
     */
    physicsTranslate(x: number, y: number) {
        this._templet.hasPhysics && this._skeleton.physicsTranslate(x, y);
    }

    /**
     * @zh 当transform改变时，更新骨骼的位置
     * @en Transform changed, update the skeleton position.
     */
    private onTransformChanged() {
        if (this._skeleton) {
            let matrix = this.owner.globalTrans.getMatrix();
            // this._skeleton.x = matrix.tx;
            // this._skeleton.y = matrix.ty;
            this._skeleton.x = matrix.tx;
            this._skeleton.y = matrix.ty;
            // this._offset.setValue(this.owner.pivotX, this.owner.pivotY);
            // this._skeleton.x = matrix.tx
            // this._skeleton.y = matrix.ty
            // if (this.owner.pivotX != 0 || this.owner.pivotY != 0) {
            //     this._offset.setValue(this.owner.pivotX, this.owner.pivotY);
            //     this._renderHandle.offset = this._offset;
            // } else {
            //     this._renderHandle.offset = null;
            // }
        }
    }
    /**
     * @zh 替换插槽皮肤
     * @param slotName 插槽名称
     * @param attachmentName 附件名称
     * @en Replace the slot skin.
     * @param slotName Slot name.
     * @param attachmentName Attachment name.
     */
    setSlotAttachment(slotName: string, attachmentName: string) {
        this.useFastRender = false;
        this._skeleton.setAttachment(slotName, attachmentName);
    }

    /**
     * @zh 清除方法，用于释放和重置相关资源。
     * @en Clear method, used to release and reset related resources.
     */
    clear(): void {
        this.clearRenderElement();
        this.reset();
        this.owner?.repaint();
        //native 同步数据
        this._struct.renderElements = this._renderElements;
    }

    /** @internal */
    clearRenderElement(): void {
        this._mesh = null;
        this._renderElements.forEach(element => {
            Spine2DRenderNode.recoverRenderElement2D(element);
        });
        this._renderElements.length = 0;
    }

    /**
     * @zh 切换至快速渲染模式，开启后可以大幅度提升渲染性能，但是有骨骼顶点限制，比如spine资源中某个顶点的骨骼控制数不能大于4
     * @en Use fast rendering mode, which can greatly improve rendering performance but has limitations on bone vertices. For example, the number of bones controlling a vertex in spine resources cannot be greater than 4
     */
    changeFast() {
        if (!(this.spineItem instanceof SpineOptimizeRender)) {
            this.spineItem.destroy();
            let before = SketonOptimise.normalRenderSwitch;
            SketonOptimise.normalRenderSwitch = false;
            this.spineItem = this._templet.sketonOptimise._initSpineRender(this._skeleton, this._templet, this, this._state);
            this.spineItem.setSkinIndex(this._templet.getSkinIndexByName(this._skinName));
            SketonOptimise.normalRenderSwitch = before;
        }
    }

    /**
     * @zh 切换至普通渲染模式，采用未优化过的Spine运行时，性能不如快速渲染模式，但没有骨骼顶点限制
     * @en Switch to normal rendering mode, which uses the unoptimized Spine runtime and has no bone vertex limitations. Performance is not as good as fast rendering mode.
     */
    changeNormal() {
        if (!(this.spineItem instanceof SpineNormalRender)) {
            this.spineItem.destroy();
            let before = SketonOptimise.normalRenderSwitch;
            SketonOptimise.normalRenderSwitch = true;
            this.spineItem = this._templet.sketonOptimise._initSpineRender(this._skeleton, this._templet, this, this._state);
            this.spineItem.setSkinIndex(this._templet.getSkinIndexByName(this._skinName));
            SketonOptimise.normalRenderSwitch = before;
        }
    }

    /**
     * @ignore @blueprintIgnore
     * @zh 销毁当前对象
     * @en Destroy the current object.
     */
    onDestroy(): void {
        if (this._templet) {
            this.clear();
        }
        if (this._externalSkins) {
            this._externalSkins.forEach(skin => {
                skin.destroy();
            });
            this._externalSkins.length = 0;
        }
        this.spineItem.destroy();
    }

    /** @internal */
    _updateMaterials(elements: Material[]) {
        for (let i = 0, len = this._materials.length; i < len; i++) {
            if (this._materials[i]) {
                this._materials[i]._removeReference();
            }
        }
        this._materials.length = 0;

        for (let i = 0, len = elements.length; i < len; i++) {
            this._materials[i] = elements[i];
            this._materials[i]._addReference();
        }
    }
    /** @internal */
    _updateRenderElements() {
        let elementLength = this._renderElements.length;
        for (let i = 0; i < elementLength; i++) {
            let element = this._renderElements[i];
            let material = this._materials[i];
            element.materialShaderData = material.shaderData;
            element.subShader = material._shader.getSubShaderAt(0);
            element.value2DShaderData = this.owner._shaderData;
        }
        this.owner._struct.renderElements = this._renderElements;
    }
    /** @internal */
    _onMeshChange(mesh: Mesh2D, force: boolean = false) {
        let hasChange = false;
        if (this._mesh != mesh || force) {
            hasChange = true;
            if (mesh) {
                let subMeshes = mesh._subMeshes;
                let elementLength = this._renderElements.length;
                let flength = Math.max(elementLength, mesh.subMeshCount);
                for (let i = 0; i < flength; i++) {
                    let element = this._renderElements[i];
                    let subMesh = subMeshes[i];
                    if (subMesh) {
                        if (!element) {
                            element = Spine2DRenderNode.createRenderElement2D();
                            this._renderElements[i] = element;
                        }
                        let material = this._materials[i];
                        element.geometry = subMesh;
                        element.materialShaderData = material.shaderData;
                        element.subShader = material._shader.getSubShaderAt(0);
                        element.value2DShaderData = this.owner._shaderData;
                        element.nodeCommonMap = this._getcommonUniformMap();
                        element.owner = this.owner._struct;
                    } else {
                        Spine2DRenderNode.recoverRenderElement2D(element);
                    }
                }
                this._renderElements.length = mesh.subMeshCount;
                SpineShaderInit.changeVertexDefine(this.owner._shaderData, mesh);
            } else {
                for (let i = 0, len = this._renderElements.length; i < len; i++)
                    Spine2DRenderNode.recoverRenderElement2D(this._renderElements[i]);
                this._renderElements.length = 0;
            }

            if (this.owner._struct) {
                this.owner._struct.renderElements = this._renderElements;
            }

        }
        this._mesh = mesh;
        return hasChange;
    }


    get rect(): Vector4 {
        if (this._boundsChange) {
            if (this._templet) {
                this._rect.z = this._templet.width + this._renderOffset.x;
                this._rect.w = this._templet.height + this._renderOffset.y;
            }else{
                this._rect.z = this.owner.width + this._renderOffset.x;
                this._rect.w = this.owner.height + this._renderOffset.y;
            }
            this._rect.x = this._renderOffset.x;
            this._rect.y = this._renderOffset.y;
            this._boundsChange = false;
        }
        return this._rect;
    }

}

class TimeKeeper {
    maxDelta: number;
    framesPerSecond: number;
    delta: number;
    totalTime: number;
    lastTime: number;
    frameCount: number;
    frameTime: number;

    timer: Timer;
    constructor(timer: Timer) {
        this.maxDelta = 0.064;
        this.timer = timer;
    }

    update() {
        // this.delta =1 / 30;
        this.delta = this.timer.delta / 1000;
        if (this.delta > this.maxDelta)
            this.delta = this.maxDelta;
    }
}

ClassUtils.regClass("Spine2DRenderNode", Spine2DRenderNode);
