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
import { Vector3 } from "../maths/Vector3";
import { SpineOptimizeRender } from "./optimize/SpineOptimizeRender";
import { IRenderContext2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { ShaderData } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IRender2DDataHandle, ISpineRenderDataHandle } from "../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";

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
export class Spine2DRenderNode extends BaseRenderNode2D {

    static _pool: IRenderElement2D[] = [];
    
    static createRenderElement2D() {
        if (this._pool.length > 0) {
            return this._pool.pop();
        }
        let element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        element.renderStateIsBySprite = false;
        element.nodeCommonMap = ["spine2D"]
        return element;
    }

    static recoverRenderElement2D(value: IRenderElement2D) {
        if (!(value as any).canotPool) {
            this._pool.push(value);
        }
    }

    protected _renderHandle: ISpineRenderDataHandle;

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
    protected _timeKeeper: TimeKeeper;
    /**@internal @protected */
    protected _skeleton: spine.Skeleton;
    /**@internal @protected */
    protected _state: spine.AnimationState;
    /**@internal @protected */
    protected _stateData: spine.AnimationStateData;
    /**@internal @protected */
    protected _currentPlayTime: number = 0;
    /** @internal */
    private _pause: boolean = true;
    /** @internal */
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
    private _animationName: string;
    private _loop: boolean = true;

    private _externalSkins: ExternalSkin[];
    private _skin: string;
    /** @internal */
    _renderAlpha: number;

    // private _matBuffer: Float32Array = new Float32Array(6);
    _nMatrix_0 = new Vector3;
    _nMatrix_1 = new Vector3;

    _mesh: Mesh2D;

    /** 
     * @default spine.Physics.update 
     * @see spine.Physics
     * @en The physics update mode. 
     * @zh 物理更新模式。
     **/
    physicsUpdate = 2;

    constructor() {
        super();
        this._renderElements = [];
        this._materials = [];
        this.spineItem = SpineEmptyRender.instance;
    }

    protected _getcommonUniformMap(): Array<string> {
        return ["BaseRender2D", "Spine2D"]
    }

    protected _getRenderHandle(): ISpineRenderDataHandle {
        return LayaGL.render2DRenderPassFactory.createSpineRenderDataHandle();
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

    renderUpdate(context:IRenderContext2D) {
        
        // Vector2.TEMP.setValue(context.width, context.height);
        // shaderData.setVector2(BaseRenderNode2D.BASERENDERSIZE, Vector2.TEMP);

        // if (this._renderAlpha !==  context.globalAlpha) {
        //     let scolor = this.spineItem.getSpineColor();
        //     let a = scolor.a * context.globalAlpha;
        //     let color = shaderData.getColor(BaseRenderNode2D.BASERENDER2DCOLOR) || new Color();
        //     color.setValue(scolor.r , scolor.g , scolor.b , a);
        //     shaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, color);
        //     this._renderAlpha =  context.globalAlpha;
        // }

        this._lightReceive && this._updateLight();
    }

    /**
     * 重置外部加载的皮肤的样式
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
     * 动画源
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
     * 最大播放间隔
     */
    get maxDetlaTime(): number {
        return this._timeKeeper.maxDelta;
    }

    set maxDetlaTime(value: number) {
        this._timeKeeper.maxDelta = value;
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

    get twoColorTint(): boolean {
        return this._spriteShaderData.hasDefine(SpineShaderInit.SPINE_TWOCOLORTINT);
    }

    set twoColorTint(value: boolean) {
        if (value) {
            this._spriteShaderData.addDefine(SpineShaderInit.SPINE_TWOCOLORTINT);
        }else{
            this._spriteShaderData.removeDefine(SpineShaderInit.SPINE_TWOCOLORTINT);
        }
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
     * @param value 当前时间
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
     * 获取当前播放状态
     * @return	当前播放状态
     */
    get playState(): number {
        if (this._pause)
            if (this._currentPlayTime) return Spine2DRenderNode.PAUSED;
            else return Spine2DRenderNode.STOPPED;
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
            this.changeFast();
        } else {
            this.changeNormal();
        }
        this.play(this._animationName, this._loop, true, this._currentPlayTime);
    }

    get useFastRender() {
        return this._useFastRender;
    }

    spineItem: ISpineOptimizeRender;

    onEnable(): void {
        this.owner.on(Event.TRANSFORM_CHANGED , this , this.onTransformChanged);
        if (this._skeleton) {
            if (LayaEnv.isPlaying && this._animationName !== undefined)
                this.play(this._animationName, this._loop, true);
        }
    }
    

    onDisable(): void {
        this.owner.off(Event.TRANSFORM_CHANGED , this , this.onTransformChanged);
    }

    /**
     * @internal
     * @protected
     * @param templet 模板
     * @returns 
     */
    protected init(templet: SpineTemplet): void {
        if (this.destroyed) return;
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
        this._renderHandle.skeleton = this._skeleton;
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

        if (
            LayaEnv.isPlaying 
            && this.enabled 
            && this._animationName !== undefined
        ) {
            this.play(this._animationName, this._loop, true);
        }
    }

    /**
     * 播放动画
     *
     * @param nameOrIndex	动画名字或者索引
     * @param loop		是否循环播放
     * @param force		false,如果要播的动画跟上一个相同就不生效,true,强制生效
     * @param start		起始时间
     * @param end			结束时间
     * @param freshSkin	是否刷新皮肤数据
     * @param playAudio	是否播放音频
     */
    play(nameOrIndex: string | number, loop: boolean, force: boolean = true, start: number = 0, end: number = 0, freshSkin: boolean = true, playAudio: boolean = true) {
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

        if (force || this._pause || this._currentPlayTime || this._animationName != nameOrIndex) {
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
                this._beginUpdate();
            }
            this._update();
            this.event(Event.PLAYED);
        }
    }

    private _update(): void {
        this._timeKeeper.update();
        let state = this._state;
        let delta = this._timeKeeper.delta * this._playbackRate;
        // 在游戏循环中，update被调用，这样AnimationState就可以跟踪时间
        state.update(delta);

        //@ts-ignore
        let currentPlayTime = this._currentPlayTime = state.getCurrentPlayTime(this.trackIndex);

        // 使用当前动画和事件设置骨架
        state.apply(this._skeleton);

        // spine在state.apply中发送事件，开发者可能会在事件中进行destory等操作，导致无法继续执行
        if (!this._state || !this._skeleton) {
            return;
        }
        
        this._skeleton.update && this._skeleton.update(delta);
        // 计算骨骼的世界SRT(world SRT)
        this._skeleton.updateWorldTransform(this.physicsUpdate);// spine.Physics.update;
        this.spineItem.render(currentPlayTime);
        this.owner.repaint();
    }

    private _flushExtSkin() {
        if (null == this._skeleton) return;
        let skins = this._externalSkins;
        if (skins) {
            let normal = false;//todo 需要修改顶点构成?
            for (let i = skins.length - 1; i >= 0; i--) {
                skins[i].flush();
                // normal = skins[i].normal || normal;
            }

            // if (normal) {
                this.useFastRender = false;
            // }
        }
    }
    /**
     * 得到当前动画的数量
     * @return 当前动画的数量
     */
    getAnimNum(): number {
        // return this._templet.skeletonData.animations.length;
        //@ts-ignore
        return this._templet.skeletonData.getAnimationsSize();
    }

    /**
     * 得到指定动画的名字
     * @param index	动画的索引
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
     * @param value	1为标准速率
     */
    playbackRate(value: number): void {
        this._playbackRate = value;
    }

    /**
     * 通过名字显示一套皮肤
     * @param name	皮肤的名字
     */
    showSkinByName(name: string): void {
        this.showSkinByIndex(this._templet.getSkinIndexByName(name));
    }

    /**
     * 通过索引显示一套皮肤
     * @param skinIndex	皮肤索引
     */
    showSkinByIndex(skinIndex: number): void {
        this.spineItem.setSkinIndex(skinIndex);
        // let newSkine = this._skeleton.data.skins[skinIndex];
        // this._skeleton.setSkin(newSkine);
        //@ts-ignore
        this._skeleton.showSkinByIndex(skinIndex);
        this._skeleton.setSlotsToSetupPose();
    }

    event(type: string, data?: any): void {
        this.owner.event(type, data);
    }

    /**
     * 停止动画
     */
    stop(): void {
        if (!this._pause) {
            this._pause = true;
            this._clearUpdate();
            //this.timer.clear(this, this._update);
            this._state.update(-this._currentPlayTime);
            // this._skeleton.setToSetupPose();
            // this._state.clearTrack(this.trackIndex);
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
    onUpdate(): void {
        this._needUpdate && this._update();
    }

    /**
     * 暂停动画的播放
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
     * 恢复动画的播放
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

    /**
     * @internal
     */
    reset() {
        this._templet._removeReference(1);
        this._templet = null;
        this._timeKeeper = null;
        this._skeleton = null;
        this._state.clearListeners();
        this._state = null;
        this._pause = true;
        this._clearUpdate();
        if (this._soundChannelArr.length > 0)
            this._onAniSoundStoped(true);
    }

    // ------------------------------------新增加的接口----------------------------------------------------
    /**
     * 添加一个动画
     * @param nameOrIndex   动画名字或者索引
     * @param loop          是否循环播放
     * @param delay         延迟调用，可以为负数
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

    physicsTranslate( x:number , y:number){
        this._templet.hasPhysics && this._skeleton.physicsTranslate( x , y);
    }

    /**
     * 当transform改变时，更新骨骼的位置
     */
    onTransformChanged() {
        if (this._skeleton) {
            let trans = this.owner.globalTrans;
            this._skeleton.x = trans.x;
            this._skeleton.y = trans.y;
        }
    }
    /**
     * 替换插槽皮肤
     * @param slotName 
     * @param attachmentName 
     */
    setSlotAttachment(slotName: string, attachmentName: string) {
        this.useFastRender = false;
        this._skeleton.setAttachment(slotName, attachmentName);
    }

    clear(): void {
        this._mesh = null;
        this._renderElements.forEach(element => {
            Spine2DRenderNode.recoverRenderElement2D(element);
        });
        super.clear();
    }

    changeFast(){
        if (!(this.spineItem instanceof SpineOptimizeRender)) {
            this.spineItem.destroy();
            let before = SketonOptimise.normalRenderSwitch;
            SketonOptimise.normalRenderSwitch = false;
            this.spineItem = this._templet.sketonOptimise._initSpineRender(this._skeleton, this._templet, this, this._state);
            this.spineItem.setSkinIndex(this._templet.getSkinIndexByName(this._skinName));
            SketonOptimise.normalRenderSwitch = before;
        }
    }

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

    onDestroy(): void {
        if (this._templet) {
            this.reset();
        }
        this.spineItem.destroy();
    }

    _updateMaterials(elements: Material[]) {
        for (let i = 0, len = elements.length; i < len; i++) {
            this._materials[i] = elements[i];
        }
    }

    _updateRenderElements() {
        let elementLength = this._renderElements.length
        for (let i = 0; i < elementLength; i++) {
            let element = this._renderElements[i];
            let material = this._materials[i];
            element.materialShaderData = material.shaderData;
            element.subShader = material._shader.getSubShaderAt(0);
            element.value2DShaderData = this.owner.shaderData;
        }
        this.owner._struct.renderElements = this._renderElements;
    }

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
                        element.value2DShaderData = this.owner.shaderData;
                        element.nodeCommonMap = this._getcommonUniformMap();
                    } else {
                        Spine2DRenderNode.recoverRenderElement2D(element);
                    }
                }
                this._renderElements.length = mesh.subMeshCount;
                this.owner._struct.renderElements = this._renderElements;
                SpineShaderInit.changeVertexDefine(this.owner.shaderData , mesh);
            } else {
                for (let i = 0, len = this._renderElements.length; i < len; i++)
                    Spine2DRenderNode.recoverRenderElement2D(this._renderElements[i]);
                this._renderElements.length = 0;
                this.owner._struct.renderElements = this._renderElements;
            }

        }
        this._mesh = mesh;
        return hasChange
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