import { ILaya } from "../../ILaya";
import { Laya } from "../../Laya";
import { LayaEnv } from "../../LayaEnv";
import { BaseRenderNode2D } from "../NodeRender2D/BaseRenderNode2D";
import { SoundManager } from "../media/SoundManager";
import { Loader } from "../net/Loader";
import { Handler } from "../utils/Handler";
import { ExternalSkin } from "./ExternalSkin";
import { SpineTemplet } from "./SpineTemplet";
import { Event } from "../events/Event";
import { LayaGL } from "../layagl/LayaGL";
import { SpineShaderInit } from "./shader/SpineShaderInit";
import { Material } from "../resource/Material";
import { ClassUtils } from "../utils/ClassUtils";
import { IRenderContext2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { ISpineRenderDataHandle } from "../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { Vector2 } from "../maths/Vector2";
import { Vector4 } from "../maths/Vector4";
import { ShaderFeatureType } from "../RenderEngine/RenderShader/Shader3D";
import { Sprite } from "../display/Sprite";
import { Matrix } from "../maths/Matrix";
import { ISpineRender } from "./interface/ISpineRender";
import { ESpineRenderMode, ESpineRenderState, SpineConst } from "./SpineConst";
import { RepaintFlag } from "../display/SpriteConst";
import { Texture } from "../resource/Texture";

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

    private _createBone: boolean = false;

    /** @internal */
    _spineRender: ISpineRender;
    
    /** 
     * @zh 物理更新模式。
     * @en The physics update mode. 
     **/
    physicsUpdate = 2;

    /** @deprecated 状态-停止 */
    static readonly STOPPED: number = 0;
    /** @deprecated 状态-暂停 */
    static readonly PAUSED: number = 1;
    /** @deprecated 状态-播放中 */
    static readonly PLAYING: number = 2;

    protected _renderHandle: ISpineRenderDataHandle;
    protected _source: string;
    protected _templet: SpineTemplet;
    protected _maxDeltaTime: number = 0.1;

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
    private _renderOffset: Vector2 = new Vector2();
    private _offset: Vector2 = new Vector2();
    /** @internal */
    _setPreAlphaFlag = false;
    private _premultipliedAlpha = true;

    protected _bones: Sprite[];
    protected _boneMap: Map<string, Sprite>;
    /**
     * @zh 骨骼映射
     * @en Bone mapping
     */
    get boneMap(): Map<string, Sprite> {
        return this._boneMap;
    }

    private _rootBone: Sprite;

    /** @ignore */
    constructor() {
        super();
        this._renderElements = [];
        this._materials = [];
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
     * @zh 是否创建骨骼
     * @en Whether to create bones
     */
    get createBone() {
        return this._createBone;
    }
    
    set createBone(value: boolean) {
        if (this._createBone === value)
            return;
        this._createBone = value;

        if (value) {
            this._createBones();
        } else {
            this._rootBone.destroy();
            this._rootBone = null;
        }
    }

    private _createBones() {
        if (this._rootBone || !this._templet)
            return;
        this._bones = [];
        let bones = this._spineRender.getBones();
        if (!bones || bones.length === 0)
            return;
            
        let map: Map<string, Sprite> = new Map;
        this._rootBone = new Sprite();
        this._rootBone.name = "__bone_root__";
        this.owner.addChild(this._rootBone);
        
        // 计算坐标系偏移，与 Spine 渲染时使用的偏移保持一致
        let transform = this._spineRender.getSkeletonTransform();
        let offsetX = -transform.x + this._renderOffset.x;
        let offsetY = -transform.y + this._renderOffset.y;
        
        for (let i = 0; i < bones.length; i++) {
            let bone = bones[i];
            let boneSprite = new Sprite();
            boneSprite.name = bone.data.name;

            let attachSprite = new Sprite();
            attachSprite.name = bone.data.name + "__attach";
            attachSprite.scaleY = -1;

            boneSprite.x = bone.worldX + offsetX;
            boneSprite.y = -(bone.worldY + offsetY);

            boneSprite.addChild(attachSprite);
            this._rootBone.addChild(boneSprite);

            // 外层节点用于矩阵同步
            this._bones.push(boneSprite);
            // 名称映射返回可挂载且正向的节点
            map.set(bone.data.name, attachSprite);
        }

        this._boneMap = map;
    }

    /**
     * @zh 获取骨骼
     * @param boneName 骨骼名称
     * @returns 骨骼节点
     * @en Get bone
     * @param boneName The name of the bone.
     * @returns The bone node.
     */
    getBone(boneName: string) {
        return this._boneMap.get(boneName);
    }

    /**
     * @zh 外部皮肤，用于根据不同皮肤，替换对应插槽的附件。
     * @en External skins, used to replace the attachments of corresponding slots according to different skins.
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

    /** @ignore @blueprintIgnore */
    renderUpdate(context: IRenderContext2D) {
        this._updateLight();
    }

    /**
     * @zh 重置外部加载的皮肤数据。更换附件或皮肤数据后，需要调用此方法，否则不会生效。
     * @en Resets the external loaded skin data. After replacing attachments or skin data, this method needs to be called, otherwise it will not take effect.
     */
    resetExternalSkin() {
        if (this._spineRender) {
            this._spineRender.resetExternalSkin();
            this._flushExtSkin();
        }
    }

    /**
     * @zh 是否启用透明预乘。设置属性需要使用setPremultipliedAlpha方法。
     * @en Whether to enable transparent premultiplied. The attribute needs to be set using the setPremultipliedAlpha method.
     */
    get premultipliedAlpha(): boolean {
        return !this._templet || this._setPreAlphaFlag ? this._premultipliedAlpha : this._templet.premultipliedAlpha;
    }

    /** @internal */
    set premultipliedAlpha(value: boolean) {
        this._premultipliedAlpha = value;
        if (!this._spineRender) return;
        if (this._setPreAlphaFlag || !this._templet) {
            this._spineRender.premultipliedAlpha = value;
        } else {
            this._spineRender.premultipliedAlpha = this._templet.premultipliedAlpha;
        }
    }
    
    /**
     * @en Set the transparent premultiplied.
     * @zh 设置透明预乘。
     * @param value Whether to enable transparent premultiplied.
     * @param value 是否启用透明预乘。
     */
    setPremultipliedAlpha(value: boolean) {
        this._premultipliedAlpha = value;
        this._spineRender.premultipliedAlpha = value;
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
        return this._maxDeltaTime;
    }

    set maxDetlaTime(value: number) {
        this._maxDeltaTime = value;
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

        this._spineRender.currentTime = value;
    }

    get currentTime(): number {
        if (!this._templet)
            return 0;
        return this._spineRender.currentTime;
    }

    /**
     * @zh 获取当前播放状态
     * @en Get the current play time.
     */
    get playState(): ESpineRenderState {
        if (this._pause)
            if (this.currentTime) return ESpineRenderState.Paused;
            else return ESpineRenderState.Stopped;
        return ESpineRenderState.Playing;
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
        this._spineRender.mode = !SpineConst.normalRenderSwitch && value ? ESpineRenderMode.Optimize : ESpineRenderMode.Normal;
    }

    get offset(): Vector2 {
        return this._offset;
    }

    set offset(value: Vector2) {
        this._offset = value;
        // this._renderHandle.offset = this._offset;
        if (value) {
            this._renderOffset.x = value.x + this._templet.offsetX;
            this._renderOffset.y = value.y - this._templet.offsetY;
            this._renderHandle.offset = this._renderOffset;
        }
        this.boundsChange = true;

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

    private _enableCache: boolean = false;

    /**
     * @zh 是否启用缓存。启用后，Spine动画的渲染数据会自动缓存，提高重复播放的性能。
     * @en Whether to enable cache. When enabled, the Spine animation's render data will be automatically cached, improving performance for repeated playback.
     */
    public get enableCache(): boolean {
        return this._enableCache;
    }

    public set enableCache(value: boolean) {
        if (this._enableCache === value)
            return;
        this._enableCache = value;
        
        // 通过接口方法设置缓存
        if (this._spineRender) {
            if (value) {
                this._spineRender.enableCache();
            } else {
                this._spineRender.disableCache();
            }
        }
        
        if (this._animationName) {
            this.play(this._animationName, this._loop, true , this._playStart , this._playEnd, false, this._playAudio);
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

        this.owner.size(width, height);
        this.owner.pivot(this._templet.offsetX, -this._templet.offsetY);
    }

    /** @ignore @blueprintIgnore */
    onEnable(): void {
        this.owner.on(Event.TRANSFORM_CHANGED, this, this.onTransformChanged);

        if (this._spineRender && LayaEnv.isPlaying && this._animationName !== undefined)
            this.play(this._animationName, this._loop, true);
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

        if (this._spineRender) {
            this._spineRender.destroy();
        }

        this._struct.renderElements = [];
        this._struct.setRepaint();

        this._spineRender = SpineConst.factory.createSpineRender2D(this);
        this._spineRender.init(templet);
        this._spineRender.mode = !SpineConst.normalRenderSwitch && this._useFastRender ? ESpineRenderMode.Optimize : ESpineRenderMode.Normal;
        this._spineRender.premultipliedAlpha = this._setPreAlphaFlag ? this._premultipliedAlpha : this._templet.premultipliedAlpha;
        
        // 设置缓存状态
        if (this._enableCache) {
            this._spineRender.enableCache();
        }
        
        if (this._autoAdjust) {
            this._doAutoAdjust();
        }

        if (this._createBone) {
            this._createBones();
        }

        this.onTransformChanged();

        this.boundsChange = true;

        this._renderOffset.x = this._offset.x + this._templet.offsetX;
        this._renderOffset.y = this._offset.y - this._templet.offsetY;
        this._renderHandle.offset = this._renderOffset;

        let skinIndex = this._templet.getSkinIndexByName(this._skinName);
        if (skinIndex != -1)
            this.showSkinByIndex(skinIndex);

        this.onTransformChanged();

        // 设置事件监听器
        this._spineRender.setEventListener({
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
                    this._spineRender.complete();
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
                    let channel = SoundManager.playSound(eventData.audioValue, 1, Handler.create(this, this._onAniSoundStoped), null, (this._spineRender.currentTime * 1000 - eventData.time) / 1000);
                    SoundManager.playbackRate = this._playbackRate;
                    channel && this._soundChannelArr.push(channel);
                }
            }
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
            if (!this.templet.hasAnimation(nameOrIndex)) return
        }

        if (force || this._pause || this._animationName != nameOrIndex) {
            this._animationName = nameOrIndex;
            // 使用新的play接口，支持设置起始和结束时间
            this._spineRender.play(nameOrIndex, loop, this.trackIndex, start, end);
            let duration = this._spineRender.trackEntry.animation.duration;
            this._duration = duration;
            this._playStart = start;
            this._playEnd = end <= duration ? end : duration;

            if (this._pause) {
                this._pause = false;
                this._needUpdate = true;
            }
            this._update();
            this.owner.event(Event.PLAYED);
        }
    }

    private _update(): void {
        let timerDelta = Laya.timer.delta / 1000 * this._playbackRate;
        
        if (timerDelta > this._maxDeltaTime)
            timerDelta = this._maxDeltaTime;

        let delta = timerDelta * this._playbackRate;

        let currentPlayTime = this._spineRender.currentTime;

        // 使用当前动画和事件设置骨架
        this._spineRender.update(delta);

        // spine在state.apply中发送事件，开发者可能会在事件中进行destroy等操作，导致无法继续执行
        if (this.destroyed) {
            return;
        }

        
        this._spineRender.render(currentPlayTime, this.physicsUpdate);
        this._updateBones();
        
        this.owner.repaint(RepaintFlag.UpdateRT);
    }

    private _updateBones() {
        if (!this._createBone || !this._bones) return;

        let bones = this._spineRender.getBones();
        if (!bones || bones.length === 0) return;
        
        let transform = this._spineRender.getSkeletonTransform();
        let offset = this._renderOffset;
        let offsetX = -transform.x + offset.x;
        let offsetY = -transform.y + offset.y;

        for (let i = 0; i < bones.length && i < this._bones.length; i++) {
            let bone = bones[i];
            let boneSprite = this._bones[i];
            
            let matrix = boneSprite.transform;
            if (!matrix) {
                matrix = new Matrix();
                boneSprite.transform = matrix;
            }
            // 由于 Y 轴翻转，需要调整矩阵
            matrix.a = bone.a;
            matrix.b = bone.b;
            matrix.c = -bone.c;
            matrix.d = -bone.d;
            matrix.tx = bone.worldX + offsetX;
            matrix.ty = -(bone.worldY + offsetY);
            
            boneSprite.transform = matrix;
        }
    }

    private _flushExtSkin() {
        let skins = this._externalSkins;
        if (skins) {
            for (let i = skins.length - 1; i >= 0; i--) {
                skins[i].flush();
            }
            this.useFastRender = false;
        }
    }
    /**
     * @zh 得到当前动画的数量
     * @en Get the number of current animations.
     */
    getAnimNum(): number {
        return this._templet.getAnimationCount();
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
     * @deprecated only WEB
     * @zh 通过名字得到插槽的引用
     * @param slotName 插槽的名字
     * @en Get the reference to the slot by name.
     * @param slotName The name of the slot.
     */
    getSlotByName(slotName: string) {
        return this._spineRender.findSlot(slotName);
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
        this._spineRender.showSkinByIndex(skinIndex);
    }

    /**
     * @zh 停止动画
     * @en Stop the animation.
     */
    stop(): void {
        if (!this._pause) {
            this._pause = true;
            this._needUpdate = false;
            // 回退到开始位置
            this._spineRender.update(-this._spineRender.currentTime);
            this._spineRender.currentTime = 0;
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
        this._spineRender.reset();
        this._templet._removeReference(1);
        this._templet = null;
        this._pause = true;
        this._needUpdate = false;
        if (this._soundChannelArr.length > 0)
            this._onAniSoundStoped(true);
        this.owner.repaint();
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
        this._spineRender.addAnimation(animationName, loop, delay, this.trackIndex);
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

        this._spineRender.setSlotTexture(slotName, texture, createAttachment);
    }

    /**
     * @zh 设置模板附件
     * @param templet Spine模板
     * @param targetSlotName 目标插槽名称
     * @param skinName 皮肤名称
     * @param attachmentName 附件名称
     * @en Set the template attachment.
     * @param templet Spine template.
     * @param targetSlotName Target slot name.
     * @param skinName Skin name.
     * @param attachmentName Attachment name.
     */
    setTempletAttachment( templet: SpineTemplet, targetSlotName: string, skinName: string, attachmentName: string) {
        if (this._useFastRender) {
            console.log("setTempletAttachment: useFastRender is true, return");
            return
        }

        this._spineRender.setTempletAttachment(templet, targetSlotName, skinName, attachmentName);
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
        this._spineRender.setMix(fromName, toName, duration);
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
        return this._spineRender.findBone(boneName);
    }

    /**
     * @zh 获取骨骼信息（已废弃，只有 Web 运行时有准确对象）
     * @deprecated 不再直接暴露原生spine对象，只有 Web 运行时有准确对象
     * @en Get skeleton information (deprecated, only accurate object in Web)
     */
    getSkeleton():any {
        return this._spineRender.getSkeleton();
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
        this._spineRender.physicsTranslate(x, y);
    }

    /**
     * @zh 当transform改变时，更新骨骼的位置
     * @en Transform changed, update the skeleton position.
     */
    private onTransformChanged() {
        if (this._spineRender) {
            let matrix = this.owner.globalTrans.getMatrix();
            this._spineRender.setSkeletonPosition(
                matrix.tx,
                matrix.ty
            );
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
        this._spineRender.setAttachment(slotName, attachmentName);
    }

    /**
     * @zh 清除方法，用于释放和重置相关资源。
     * @en Clear method, used to release and reset related resources.
     */
    clear(): void {
        this.reset();
        this.owner?.repaint();
        //native 同步数据
        this._struct.renderElements = this._renderElements;
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
        this._spineRender.destroy();
        this._spineRender = null;
        // 清理骨骼可视化
        if (this._rootBone) {
            this._rootBone.destroy();
            this._rootBone = null;
            this._bones = null;
        }
    }

    get rect(): Vector4 {
        if (this._boundsChange ) {
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

ClassUtils.regClass("Spine2DRenderNode", Spine2DRenderNode);