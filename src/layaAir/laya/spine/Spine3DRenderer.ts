import { BaseRender } from "../d3/core/render/BaseRender";
import { Sprite3D } from "../d3/core/Sprite3D";
import { SpineTemplet } from "./SpineTemplet";
import { ISpineRender } from "./interface/ISpineRender";
import { SpineOptimizeRender3D } from "./web/base/3d/SpineOptimizeRender3D";
import { ESpineRenderMode, ESpineRenderState, SpineConst } from "./SpineConst";
import { Material } from "../resource/Material";
import { ShaderFeatureType } from "../RenderEngine/RenderShader/Shader3D";
import { Vector2 } from "../maths/Vector2";
import { Event } from "../events/Event";
import { Loader } from "../net/Loader";
import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { Laya } from "../../Laya";
import { SpineShaderInit } from "./shader/SpineShaderInit";
import { Vector3 } from "../maths/Vector3";
import { IRenderContext3D } from "../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { IBaseRenderNode } from "../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { Laya3DRender } from "../d3/RenderObjs/Laya3DRender";
import { Stat } from "../utils/Stat";
import { LayaGL } from "../layagl/LayaGL";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Vector4 } from "../maths/Vector4";
import { Bounds } from "../d3/math/Bounds";

/**
 * @zh Spine动画3D渲染节点。
 * @en Spine animation 3D render node.
 */
export class Spine3DRenderer extends BaseRender {
    private static _tempCameraUp: Vector3 = new Vector3();
    private static _tempCameraForward: Vector3 = new Vector3();

    protected _spineRender: ISpineRender;
    
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
    // 播放轨道索引
    private trackIndex: number = 0;

    private _skinName: string = "default";
    private _animationName: string;
    private _loop: boolean = true;

    private _useFastRender: boolean = true;

    /** 
     * @zh 是否启用面向相机渲染（Billboard）
     * @en Whether to enable billboard rendering (always face camera)
     */
    private _billboard: boolean = false;

    private _enableCache: boolean = false;

    /** 
     * @zh 渲染尺寸 (宽度, 高度)
     * @en Render size (width, height)
     */
    private _renderSize: Vector2 = new Vector2(0, 0);
    private _billboardMatrix: Matrix4x4 = new Matrix4x4();
    
    private _cacheMoved: Vector2 = new Vector2(-1, -1);
    private _worldParams: Vector4 = new Vector4();
    private _playAudio: boolean = false;

    get renderSize(): Vector2 {
        return this._renderSize;
    }

    set renderSize(value: Vector2) {
        value.cloneTo(this._renderSize);
        this._baseRenderNode.shaderData.setVector2(SpineShaderInit.SPINE_RENDER_SIZE, this._renderSize);
    }

    /**
     * @zh 是否启用面向相机渲染（Billboard）。启用后，Spine动画将始终面向相机。
     * @en Whether to enable billboard rendering. When enabled, the Spine animation will always face the camera.
     */
    get billboard(): boolean {
        return this._billboard;
    }

    set billboard(value: boolean) {
        if (this._billboard === value)
            return;
        this._billboard = value;
        if (this._billboard) {
            this._baseRenderNode.shaderData.addDefine(SpineShaderInit.SPINE_BILLBOARD);
        } else {
            this._baseRenderNode.shaderData.removeDefine(SpineShaderInit.SPINE_BILLBOARD);
        }
    }

    declare readonly owner: Sprite3D;

    private _geometryBounds: Bounds = new Bounds();

    /** @ignore */
    constructor() {
        super();
    }

    protected _createBaseRenderNode(): IBaseRenderNode {
        return Laya3DRender.Render3DModuleDataFactory.createMeshRenderNode();
    }

    protected _isMaterialVaild(value: Material): boolean {
        return value.checkType(ShaderFeatureType.D3);
    }

    protected _getcommonUniformMap(): Array<string> {
        return ["Sprite3D", "Spine3D"];
    }

    private _premultipliedAlpha: boolean = true;
    /** @internal */
    _setPreAlphaFlag: boolean = false;
    /**
     * @zh 是否启用透明预乘。设置属性需要使用setPremultipliedAlpha方法。
     * @en Whether to enable transparent premultiplied. The attribute needs to be set using the setPremultipliedAlpha method.
     */
    get premultipliedAlpha(): boolean {
        return !this._templet || this._setPreAlphaFlag ? this._premultipliedAlpha : this._templet.premultipliedAlpha;
    }

    /** @internal */
    set premultipliedAlpha(value: boolean) {
        if (this._setPreAlphaFlag || !this._templet) {
            this._spineRender.premultipliedAlpha = value;
        } else {
            this._spineRender.premultipliedAlpha = this._templet._premultipliedAlpha;
        }
        this._premultipliedAlpha = value;
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

    _renderUpdate(context3D: IRenderContext3D): void {
        let renderNode = this._baseRenderNode;
        renderNode._applyReflection();
        renderNode._applyLightProb();

        if (renderNode.ismoved.x > this._cacheMoved.x || (renderNode.ismoved.x == this._cacheMoved.x && renderNode.ismoved.y > this._cacheMoved.y)) {
            let trans = renderNode.transform;
            renderNode.shaderData.setMatrix4x4(Sprite3D.WORLDMATRIX, trans.worldMatrix);
            this._worldParams.x = trans.getFrontFaceValue();
            renderNode.shaderData.setVector(Sprite3D.WORLDINVERTFRONT, this._worldParams);
            renderNode.ismoved.cloneTo(this._cacheMoved);
        }

        this._updateBillboardMatrix(renderNode, context3D);
    }

    private _updateBillboardMatrix(renderNode: IBaseRenderNode, context3D: IRenderContext3D): void {
        if (!this._billboard || !context3D)
            return;

        let cameraTransform = context3D.cameraModuleData?.transform;
        if (!cameraTransform)
            return;

        let transform = renderNode.transform;
        let cameraUp = Spine3DRenderer._tempCameraUp;
        let cameraForward = Spine3DRenderer._tempCameraForward;
        cameraTransform.getUp(cameraUp);
        cameraTransform.getForward(cameraForward);

        Matrix4x4.billboard(transform.position, cameraTransform.position, cameraUp, cameraForward, this._billboardMatrix);

        const lossyScale = transform.getWorldLossyScale();
        const elements = this._billboardMatrix.elements;
        //反向
        elements[0] *= -lossyScale.x;
        elements[1] *= -lossyScale.x;
        elements[2] *= -lossyScale.x;
        elements[4] *= lossyScale.y;
        elements[5] *= lossyScale.y;
        elements[6] *= lossyScale.y;
        elements[8] *= lossyScale.z;
        elements[9] *= lossyScale.z;
        elements[10] *= lossyScale.z;

        renderNode.shaderData.setMatrix4x4(SpineShaderInit.SPINE_BILLBOARD_MATRIX, this._billboardMatrix);
    }


    /**
     * @internal
     * BaseRender motion
     */
    protected _onWorldMatNeedChange(flag: number): void {
        super._onWorldMatNeedChange(flag);
        this._baseRenderNode.ismoved.setValue(Stat.loopCount, LayaGL.renderEngine._framePassCount);
        this._baseRenderNode.ismoved = this._baseRenderNode.ismoved;
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
        this._spineRender.mode = value ? ESpineRenderMode.Optimize : ESpineRenderMode.Normal;
        this.play(this._animationName, this._loop, true, this._spineRender.currentTime * 1000);
    }

    /**
     * @zh 是否启用缓存。启用后，Spine动画的渲染数据会自动缓存，提高重复播放的性能。
     * @en Whether to enable cache. When enabled, the Spine animation's render data will be automatically cached, improving performance for repeated playback.
     */
    get enableCache(): boolean {
        return this._enableCache;
    }

    set enableCache(value: boolean) {
        if (this._enableCache === value)
            return;
        this._enableCache = value;
        
        if (this._spineRender) {
            if (value) {
                this._spineRender.enableCache();
            } else {
                this._spineRender.disableCache();
            }
        }

        if (this._animationName) {
            this.play(this._animationName, this._loop, true , this._playStart , this._playEnd, this._playAudio);
        }
    }

    /** @ignore @blueprintIgnore */
    onEnable(): void {
        super.onEnable();
        this.owner.on(Event.TRANSFORM_CHANGED, this, this.onTransformChanged);

        if (LayaEnv.isPlaying && this._animationName !== undefined)
            this.play(this._animationName, this._loop, true);
    }

    /** @ignore @blueprintIgnore */
    onDisable(): void {
        super.onDisable();
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

        this._spineRender = SpineConst.factory.createSpineRender3D(this._baseRenderNode);
        this._spineRender.init(templet);
        this._spineRender.mode = this._useFastRender ? ESpineRenderMode.Optimize : ESpineRenderMode.Normal;
        this._spineRender.premultipliedAlpha = this._setPreAlphaFlag ? this._premultipliedAlpha : this._templet.premultipliedAlpha;
        
        // 设置缓存状态
        if (this._enableCache) {
            this._spineRender.enableCache();
        }
        
        if(this._renderSize.x !== 0 && this._renderSize.y !== 0) {
            this._baseRenderNode.shaderData.setVector2(SpineShaderInit.SPINE_RENDER_SIZE, this._renderSize);
        } else {
            this._baseRenderNode.shaderData.setVector2(SpineShaderInit.SPINE_RENDER_SIZE, Vector2.TEMP.setValue(templet.width , templet.height));
        }

        this.boundsChange = true;

        let skinIndex = this._templet.getSkinIndexByName(this._skinName);
        if (skinIndex != -1)
            this.showSkinByIndex(skinIndex);

        this._initBounds();
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
                if (entry.loop) {
                    this._spineRender.complete();
                    this.owner.event(Event.COMPLETE);
                } else {
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
                this.owner.event(Event.LABEL, eventData);
            }
        });

        this.owner.event(Event.READY);

        if (
            LayaEnv.isPlaying
            && this.enabled
            && this._animationName !== undefined
        ) {
            this.play(this._animationName, this._loop, true);
        }
    }

    private _initBounds(): void {
        let x = this._templet.x;    
        let y = this._templet.y;
        let width = this._templet.width;
        let height = this._templet.height;
        let min = this._geometryBounds.getMin();
        let max = this._geometryBounds.getMax();
        //直接使用spine数据bounds
        min.x = x;
        min.y = y;
        min.z = 0;
        max.x = width + x;
        max.y = height + y;
        max.z = 0;
        this._geometryBounds.setMin(min);
        this._geometryBounds.setMax(max);

        this._baseRenderNode.baseGeometryBounds = this._geometryBounds;
    }

    /**
     * @zh 播放动画
     * @param nameOrIndex	Spine动画名字或者索引
     * @param loop		    是否循环播放
     * @param force		    false,如果要播的动画跟上一个相同就不生效,true,强制生效
     * @param start		    起始时间
     * @param end			结束时间
     * @param playAudio		Whether to play audio.
     * @en Play Spine animation.
     * @param nameOrIndex	Spine animation name or index.
     * @param loop			Whether to loop play.
     * @param force			false, if the animation to play is the same as the last one then it won't be played again. true, force playing even if the animation is the same.
     * @param start			Start time.
     * @param end			End time.
     * @param playAudio		Whether to play audio.
     */
    play(nameOrIndex: string | number, loop: boolean, force: boolean = true, start: number = 0, end: number = 0, playAudio: boolean = false) {
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
        }
    }

    private _update(): void {
        let timerDelta = this._enableCache ? SpineConst.SPINE_STEP : Laya.timer.delta / 1000 * this._playbackRate;
        
        if (timerDelta > this._maxDeltaTime)
            timerDelta = this._maxDeltaTime;

        let delta = timerDelta * this._playbackRate;

        let currentPlayTime = this._spineRender.currentTime;

        this._spineRender.update(delta);

        if (this.destroyed) {
            return;
        }

        this._spineRender.render(currentPlayTime, 2);
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
            this._spineRender.update(-this._spineRender.currentTime);
            this._spineRender.currentTime = 0;
            this.owner.event(Event.STOPPED);
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
        }
    }

    /**
     * @zh 当transform改变时，更新骨骼的位置
     * @en Transform changed, update the skeleton position.
     */
    private onTransformChanged() {
        let matrix = this.owner.transform.worldMatrix;
        this._spineRender.setSkeletonPosition(
            matrix.elements[12],
            matrix.elements[13]
        );
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
    }

    /** @internal */
    reset() {
        this._spineRender.reset();
        this._templet._removeReference(1);
        this._templet = null;
        this._pause = true;
        this._needUpdate = false;
    }

    /**
     * @ignore @blueprintIgnore
     * @zh 销毁当前对象
     * @en Destroy the current object.
     */
    protected _onDestroy(): void {
        super._onDestroy();
        if (this._templet) {
            this.clear();
        }
        this._spineRender.destroy();
        this._spineRender = null;
    }

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
}

