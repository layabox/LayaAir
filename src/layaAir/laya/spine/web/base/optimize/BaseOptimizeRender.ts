import { Color } from "../../../../maths/Color";
import { VertexDeclaration } from "../../../../RenderEngine/VertexDeclaration";
import { Mesh2D } from "../../../../resource/Mesh2D";
import { ISpineRender, IBoneInfo, ISlotInfo, ITrackEntry } from "../../../interface/ISpineRender";
import { ESpineRenderMode, ESpineRenderState, SpineConst, TSpineBakeData } from "../../../SpineConst";
import { ESpineRenderType } from "../../../SpineSkeleton";
import { SpineMeshUtils } from "../utils/SpineMeshUtils";
import { SkeletonOptimise, SkinAttach } from "./SkeletonOptimise";
import { SpineRenderUpdater } from "./SpineRenderUpdater";
import { AnimationRender } from "./AnimationRender";
import { Vector4 } from "../../../../maths/Vector4";
import { SpineTemplet } from "../../../SpineTemplet";
import { Material } from "../../../../resource/Material";
import { Texture2D } from "../../../../resource/Texture2D";
import { IRenderGeometryElement } from "../../../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IRender } from "../../IWebSpine";
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Vector2 } from "../../../../maths/Vector2";
import { BakedSpineRenderer, StandardSpineRenderer } from "./SpineRendererTypes";
import { Texture } from "../../../../resource/Texture";

enum ERenderProxyType {
    RenderNormal,
    RenderRigidBody,
    RenderOptimize,
    RenderBake
}

/**
 * @en Base class for Spine optimize render, supporting both 2D and 3D rendering.
 * @zh Spine优化渲染基类,支持2D和3D渲染。
 */
export abstract class BaseOptimizeRender implements ISpineRender {

    /** @internal */
    updater: SpineRenderUpdater;

    /** @internal */
    _skinIndex: number = 0;
    /** @internal */
    _curAnimationName: string;

    /** @internal */
    _dynamicMap: Map<number, Mesh2D[]>;

    /**
     * @en Color of the Spine object.
     * @zh Spine 对象的颜色。
     */
    spineColor: Color;
    /** @internal */
    _optimize: SkeletonOptimise;
    /** @internal */
    _skeleton: spine.Skeleton;
    /** @internal */
    protected _state: spine.AnimationState;
    /** @internal */
    protected _stateData: spine.AnimationStateData;

    /** @internal */
    protected _skinAttach: SkinAttach = null;
    /** @internal */
    protected _currentAnimator: AnimationRender = null;
    /**
     * @en Current render proxy.
     * @zh 当前渲染代理。
     */
    renderProxy: IRender;
    /**
     * @en Map of ERenderProxyType to IRender objects.
     * @zh ERenderProxyType 到 IRender 对象的映射。
     */
    renderProxyMap: Map<ERenderProxyType, IRender>;

    /** @internal */
    _templet: SpineTemplet;

    /**
     * @en Bake data for the Spine animation.
     * @zh Spine 动画的烘焙数据。
     */
    bakeData: TSpineBakeData;
 
    private _transform: Vector2 = new Vector2();

    /** @internal */
    _enableCache: boolean = false;

    /** 
     * @en Current render mode.
     * @zh 当前渲染模式。
     */
    protected _mode: ESpineRenderMode = ESpineRenderMode.None;

    public get mode(): ESpineRenderMode {
        return this._mode;
    }

    public set mode(value: ESpineRenderMode) {
        if (this._mode === value) return;
        
        if (value !== ESpineRenderMode.Normal && this._optimize.maxBoneNumber > SpineConst.MAX_BONES) {
            console.warn("The number of Bones :", this._optimize.maxBoneNumber, " > ", SpineConst.MAX_BONES, ", use CPU caculation");
            value = ESpineRenderMode.Normal;
        }

        this._mode = value;

        if (this._curAnimationName) {
            this._clearRenderElements();
            this.play(this._curAnimationName , this.trackEntry.loop , this.trackEntry.trackIndex , this.trackEntry.animationStart);
        }
    }

    state: ESpineRenderState = ESpineRenderState.Stopped;

    currentTime: number = 0;

    trackEntry: spine.TrackEntry = null;

    private _listeners: spine.AnimationStateListener;

    /** @internal */
    _premultipliedAlpha: boolean = true;
 
    get premultipliedAlpha(): boolean {
        return this._premultipliedAlpha;
    }

    set premultipliedAlpha(value: boolean) {
        if (this._premultipliedAlpha === value) return;
        this.clearCacheMaterials();
        this._premultipliedAlpha = value;
    }

    /**
     * @en Whether this is for 3D rendering.
     * @zh 是否用于3D渲染。
     */
    protected abstract readonly is3D: boolean;

    /** @ignore */
    constructor() {
        this.spineColor = new Color();
        this.updater = new SpineRenderUpdater(this);
    }

    /**
     * @en Initialize the renderer.
     * @param templet The Spine template. Optional, subclasses can get it from owner if not provided.
     * @zh 初始化渲染器。
     * @param templet Spine 模板。可选，子类可以从owner获取如果未提供。
     */
    init(templet: SpineTemplet): void { 
        this._templet = templet;
        let optimize = this._optimize = this._templet.optimize as any;
        this._skeleton = new spine.Skeleton(optimize.data);
        this._stateData = new spine.AnimationStateData(optimize.data);
        this._state = new spine.AnimationState(this._stateData);

        let scolor = this._skeleton.color;
        this.spineColor.setValue(scolor.r, scolor.g, scolor.b, scolor.a);
        
        // this._skinAttach = this._optimize.skinAttachArray[this._skinIndex];
        // this.updater.skinAttach = this._skinAttach;

        this.initRenderProxies();
        this._updateSkinShaderDefines();
    }

    /**
     * @en Update render elements from subMeshes and materials.
     * @param subMeshes Array of sub meshes.
     * @param materials Array of materials.
     * @zh 根据子网格和材质数组更新渲染元素。
     * @param subMeshes 子网格数组。
     * @param materials 材质数组。
     */
    abstract _updateRenderElements(subMeshes: IRenderGeometryElement[], materials: Material[]): void;

    /**
     * @en Clear all render elements.
     * @zh 清除所有渲染元素。
     */
    abstract _clearRenderElements(): void;

    /**
     * @en Get material by name and blend mode.
     * @param name Texture name.
     * @param blendMode Blend mode.
     * @zh 通过名称和混合模式获取材质。
     * @param name 纹理名称。
     * @param blendMode 混合模式。
     */
    abstract _getMaterialByName(name: string, blendMode: number): Material;
    
    /**
     * @en Get material by texture and blend mode.
     * @param texture Texture.
     * @param blendMode Blend mode.
     * @zh 通过纹理和混合模式获取材质。
     * @param texture 纹理。
     * @param blendMode 混合模式。
     */
    abstract _getMaterial(texture: Texture2D, blendMode: number): Material;

    getSkeleton(): spine.Skeleton {
        return this._skeleton;
    }

    showSkinByIndex(skinIndex: number): void {

        this.setSkinIndex(skinIndex);

        this._skeleton.setSkin(this._optimize.getSkin(skinIndex));
        this._skeleton.setSlotsToSetupPose();
    }
    
    setAttachment(slotName: string, attachmentName: string): void {
        if (this._skeleton) {
            this._skeleton.setAttachment(slotName, attachmentName);
        }
    }
    
    update(delta: number): void {
        this._state.update(delta);
        this.currentTime = this.trackEntry.getAnimationTime();
        let cacheFrameIndex = Math.floor(this.currentTime / SpineConst.SPINE_STEP);
        
        if (
            (
                !this._enableCache
                || !this.updater.currentData.renderCache[cacheFrameIndex]
            )
            && this.renderProxy.type !== ESpineRenderMode.Bake
        ) {
            this._state.apply(this._skeleton);
        } else {
            let entry = this.trackEntry;
            let animationStart = entry.animationStart, animationEnd = entry.animationEnd;
            let duration = animationEnd - animationStart;
            entry.trackLast = entry.nextTrackLast;
            let trackLastWrapped = entry.trackLast % duration;
            let animationTime = entry.getAnimationTime();

            let complete = false;
            if (entry.loop)
                complete = duration == 0 || trackLastWrapped > entry.trackTime % duration;
            else
                complete = animationTime >= animationEnd && entry.animationLast < animationEnd;

            if (complete) {
                this._listeners?.complete(entry);
                entry.nextAnimationLast = -1;
                entry.nextTrackLast = -1;
            } else {
                entry.nextAnimationLast = animationTime;
                entry.nextTrackLast = entry.trackTime;
            }

            if (this._currentAnimator.hasEvent) {
                this._updateCacheEvent(delta);
            }
        }

        this.updater.cacheFrameIndex = cacheFrameIndex;
    }

    _updateCacheEvent(delta: number) {
        let animator = this._currentAnimator
        let f = delta / SpineConst.SPINE_STEP;
        let currFrame = Math.round(f);
        let curentTrack: spine.TrackEntry = this.trackEntry;
        //@ts-ignore
        let lastEventFrame = curentTrack.lastEventFrame;
        if (lastEventFrame == currFrame) {
            return;
        }
        if (lastEventFrame > currFrame || lastEventFrame == undefined) {
            lastEventFrame = -1;
        }

        if (currFrame - lastEventFrame <= 1) {
            let events = animator.eventsFrames[currFrame];
            if (events) {
                for (let i = 0, n = events.length; i < n; i++) {
                    this.dispatchEvent(null, "event", events[i]);//TODO enty
                }
            }
        }
        else {
            for (let i = lastEventFrame + 1; i <= currFrame; i++) {
                let events = animator.eventsFrames[i];
                if (events) {
                    for (let j = 0, m = events.length; j < m; j++) {
                        this.dispatchEvent(null, "event", events[j]);//TODO enty
                    }
                }
            }
        }

        //@ts-ignore
        curentTrack.lastEventFrame = currFrame;
    }

    /**
     * @en Render the current animation at a specific time.
     * @param time The time to render the animation at.
     * @zh 在特定时间渲染当前动画。
     * @param time 要渲染动画的时间。
     */
    render(time: number, physicsUpdate: number): void {
        this._skeleton.update && this._skeleton.update(time);

        if ((!this._enableCache
            || !this.updater.currentData.renderCache[this.updater.cacheFrameIndex])
            && this.renderProxy.type !== ESpineRenderMode.Bake
        ) {
            this._skeleton.updateWorldTransform(physicsUpdate);
        }

        let offsetX = - this._skeleton.x ;
        let offsetY = - this._skeleton.y ;

        if (this.renderProxy) {
            this.renderProxy.render(this.currentTime, offsetX, offsetY);
            if (this.renderProxy.afterRender) {
                this.renderProxy.afterRender(this);
            }
        }
    }

    getSpineColor(): Color {
        return this.spineColor;
    }

    /**
     * @en Initialize render proxies.
     * @zh 初始化渲染代理。
     */
    protected initRenderProxies(): void {
        if (!this._templet || !this._optimize) {
            return;
        }
        
        this.renderProxyMap = new Map();
        this._dynamicMap = new Map();
        this.updater.clear();

        // 子类需要实现创建renderProxy的逻辑
        this._createRenderProxies();

        // 初始化所有renderer的skeleton
        this.renderProxyMap.forEach(render => {
            render.bind(this.updater, this._skeleton);
        });

        this._skinAttach = this._optimize.skinAttachArray[this._skinIndex];
        this.updater.skinAttach = this._skinAttach;
    }

    /**
     * @en Create render proxies. Subclasses should implement this.
     * @zh 创建渲染代理。子类应该实现此方法。
     */
    protected abstract _createRenderProxies(): void;

    /**
     * @en Destroy the BaseOptimizeRender instance.
     * @zh 销毁 BaseOptimizeRender 实例。
     */
    destroy(): void {
        this.reset();
    
        if (this._dynamicMap) {
            this._dynamicMap.forEach(meshes => meshes.forEach(mesh => mesh.destroy()));
            this._dynamicMap.clear();
        }

        this.updater.destroy();
        this.updater = null;
    }

    /**
     * @en Initialize bake data for the Spine animation.
     * @param obj Bake data object.
     * @zh 初始化 Spine 动画的烘焙数据。
     * @param obj 烘焙数据对象。
     */
    initBake(obj: TSpineBakeData): void {
        this.bakeData = obj;
        if (obj) {
            let render = this.renderProxyMap.get(ERenderProxyType.RenderBake) as BakedSpineRenderer;
            if (!render) {
                render = this._createBakedRenderer() as BakedSpineRenderer;
                render.bind(this.updater, this._skeleton);
                this.renderProxyMap.set(ERenderProxyType.RenderBake, render);
            }
            if (render) {
                render.simpleAnimatorTexture = obj.texture2d;
                render._bonesNums = obj.bonesNums;
                render.aniOffsetMap = obj.aniOffsetMap;
            }
        }
        
        this._mode = ESpineRenderMode.Bake;

        if (this._curAnimationName) {
            this._clearRenderElements();
            this.play(this._curAnimationName);
        }
    }

    /**
     * @en Create baked renderer. Subclasses should implement this.
     * @zh 创建烘焙渲染器。子类应该实现此方法。
     */
    protected abstract _createBakedRenderer(): IRender;

    /**
     * @en Change the current skeleton.
     * @param skeleton The new spine skeleton to use.
     * @zh 更改当前骨骼。
     * @param skeleton 要使用的新 spine 骨骼。
     */
    changeSkeleton(skeleton: spine.Skeleton) {
        this._skeleton = skeleton;
        this.renderProxyMap.forEach(proxy => {
            proxy.bind(this.updater, skeleton);
        });
        
        skeleton.setSkin(this._optimize.getSkin(this._skinIndex));
        this._skeleton.setSlotsToSetupPose();
    }

    /**
     * @en Set the skin index for rendering.
     * @param index The index of the skin to set.
     * @zh 设置用于渲染的皮肤索引。
     * @param index 要设置的皮肤索引。
     */
    setSkinIndex(index: number) {
        if (index == this._skinIndex || !this._optimize) return;

        this._skinIndex = index;
        this._skinAttach = this._optimize.skinAttachArray[index];
        this.updater.skinAttach = this._skinAttach;

        this._updateSkinShaderDefines();
        
        if (this._currentAnimator) {
            this._clearRenderElements();
            this.play(this._curAnimationName);
        }
    }

    /**
     * @en Update shader defines based on skin. Subclasses should implement this.
     * @zh 根据皮肤更新着色器定义。子类应该实现此方法。
     */
    protected abstract _updateSkinShaderDefines(): void;

    /**
     * 获取对应类型的 Dynamic mesh
     * @param vertexDeclaration 
     * @param create
     * @param index [index=0] 
     * @returns 
     */
    getDynamicMesh(vertexDeclaration: VertexDeclaration, create = true , index = 0) {
        let id = vertexDeclaration.id;
        let meshes = this._dynamicMap.get(id);

        if (!meshes) {
            meshes = [];
            this._dynamicMap.set(id, meshes);
        }
        
        let mesh = meshes[index];
        if (!mesh && create) {
            mesh = SpineMeshUtils.createMeshDynamic(vertexDeclaration);
            meshes[index] = mesh;
        }

        return mesh;
    }

    reset(): void {
        this._skinIndex = 0;
        this._curAnimationName = null;
        this._currentAnimator = null;
        this._skinAttach = null;
        this.updater.clear();
        this.renderProxyMap.forEach(render => {
            render.destroy();
        });
        this.renderProxyMap.clear();
        this.renderProxy = null;
        this._skeleton = null;
        this._optimize = null;
        if (this._state) {
            this._state.clearListeners();
        }
        this._state = null;
        this._stateData = null;
        this._clearRenderElements();
    }

    /**
     * @en Play a specific animation.
     * @param animationName The name of the animation to play.
     * @param loop Whether to loop
     * @param trackIndex Track index
     * @param start Start time (seconds)
     * @param end End time (seconds), 0 means to end
     * @zh 播放特定的动画。
     * @param animationName 要播放的动画名称。
     */
    play(animationName: string, loop: boolean = true, trackIndex: number = 0, start: number = 0, end: number = 0) : void {
        // 设置动画轨道信息
        let trackEntry = this._state.setAnimation(trackIndex, animationName, loop);
        if (!trackEntry) return null;
        this.trackEntry = trackEntry;
        
        trackEntry.animationStart = start;
        if (end > 0 && end < trackEntry.animationEnd) {
            trackEntry.animationEnd = end;
        }
        
        this._curAnimationName = animationName;
        let oldProxy = this.renderProxy;
        
        this.updater.reset();

        let oldAnimator = this._currentAnimator;
        let skinAttach = this._skinAttach;

        let currentAnimator = this._optimize.animators.find(animator => animator.name === animationName);

        let skinAniData = currentAnimator.skinDataArray[skinAttach.index];
        let isNormalRender = skinAttach.isNormalRender || currentAnimator.hasClip || (skinAniData && skinAniData.isNormalRender);
        if (!isNormalRender && (this.mode === ESpineRenderMode.Optimize || this.mode === ESpineRenderMode.Bake)) {

            if (skinAttach.vertexBones > 4) {
                console.warn(`In FastRender mode - Current skin: ${skinAttach.name} has ${skinAttach.vertexBones} bones influencing each vertex. This exceeds the recommended limit of 4 bones per vertex.`);
            }

            if (
                this.bakeData
                && this.bakeData.aniOffsetMap[animationName] != undefined
            ) {
                this.renderProxy = this.renderProxyMap.get(ERenderProxyType.RenderBake);
            } else {
                switch (skinAttach.type) {
                    case ESpineRenderType.boneGPU: 
                        this.renderProxy = this.renderProxyMap.get(ERenderProxyType.RenderOptimize);
                        break;
                    case ESpineRenderType.rigidBody:
                        this.renderProxy = this.renderProxyMap.get(ERenderProxyType.RenderRigidBody);
                        break;
                    case ESpineRenderType.normal:
                        this.renderProxy = this.renderProxyMap.get(ERenderProxyType.RenderNormal);
                        break;
                }

                if (this._enableCache) {
                    if (!currentAnimator.isCache) {
                        this._optimize.cacheBone();
                    }
                }
            }
        } else {
            this.renderProxy = this.renderProxyMap.get(ERenderProxyType.RenderNormal);
        }

        if (oldProxy) {
            oldProxy.leave();
        }

        if (this.renderProxy && currentAnimator) {
            this.updater.animator = currentAnimator;
            this._currentAnimator = currentAnimator;
            this.renderProxy.change();
        }

        if (this.renderProxy.type !== ESpineRenderMode.Optimize) {
            this._skeleton.setBonesToSetupPose();
        }
    }
    
    addAnimation(animationName: string, loop: boolean = false, delay: number = 0, trackIndex: number = 0): void {
        this._state.addAnimation(trackIndex, animationName, loop, delay);
    }
    
    setMix(fromAnimation: string, toAnimation: string, duration: number): void {
        this._stateData.setMix(fromAnimation, toAnimation, duration);
    }
    
    findBone(boneName: string): IBoneInfo | null {
        if (!this._skeleton) return null;
        return this._skeleton.findBone(boneName);
    }
    
    findSlot(slotName: string): ISlotInfo | null {
        if (!this._skeleton) return null;
        let slot = this._skeleton.findSlot(slotName);
        if (!slot) return null;
        
        return {
            name: slot.data.name
        };
    }
    
    setSkeletonPosition(x: number, y: number): void {
        if (this._skeleton) {
            this._skeleton.x = x;
            this._skeleton.y = y;
        }
    }
    
    physicsTranslate(x: number, y: number): void {
        if (this._skeleton && this._optimize.hasPhysics) {
            this._skeleton.physicsTranslate(x, y);
        }
    }
    
    getBones(): IBoneInfo[] {
        if (!this._skeleton) return [];
        return this._skeleton.bones;
    }

    getSkeletonTransform(): Vector2{
        if (!this._skeleton || !this._templet) {
            return this._transform;
        }

        this._transform.x = this._skeleton.x;
        this._transform.y = this._skeleton.y;
        return this._transform;
    }
    
    resetExternalSkin(): void {
        if (!this._skeleton || !this._templet) return;
        let optimize = this._templet.optimize as any;
        if (optimize && optimize.data) {
            let newSkeleton = new spine.Skeleton(optimize.data);
            this.changeSkeleton(newSkeleton);
        }
    }
    
    setEventListener(listeners: {
        start?: (entry: any) => void;
        interrupt?: (entry: any) => void;
        end?: (entry: any) => void;
        dispose?: (entry: any) => void;
        complete?: (entry: any) => void;
        event?: (entry: any, event: any) => void;
    }): void {

        this._listeners = listeners;
        
        if (this._state) {
            this._state.addListener(listeners);
        }
    }


    dispatchEvent(entry: spine.TrackEntry, type: string, event: any) {
        //@ts-ignore
        this._listeners[type](entry, event);
    }

    complete(): void {
        this.updater.currentFrameIndex = -1;
    }

    enableCache(): void {

        if (this._mode !== ESpineRenderMode.Normal) {
            console.log("enableCache: mode is not Normal");
        }

        if (this.renderProxyMap) {
            const renderNormal = this.renderProxyMap.get(ERenderProxyType.RenderNormal) as StandardSpineRenderer;
            
            if (renderNormal) {
                renderNormal.normalUpdater.autoCacheEnabled = true;
            }
        }
        this._enableCache = true;
    }

    disableCache(): void {

        if (this._mode !== ESpineRenderMode.Normal) {
            console.log("disableCache: mode is not Normal");
        }

        if (this.renderProxyMap) {
            const renderNormal = this.renderProxyMap.get(ERenderProxyType.RenderNormal) as StandardSpineRenderer;
            
            if (renderNormal) {
                renderNormal.normalUpdater.autoCacheEnabled = false;
            }
        }
        this._enableCache = false;
    }

    clearCacheMaterials(): void {
        this.updater._clearCacheMaterials();
    }
    
    setSlotTexture(slotName: string, texture: Texture, createAttachment: boolean): void {
        if (this._mode !== ESpineRenderMode.Normal) {
            console.log("setSlotTexture: mode is not Normal, return");
            return;
        }
        
        let slot = this._skeleton.findSlot(slotName);
        if (!slot) return;
        let attachment = slot.getAttachment();
        if (!attachment) return;

        this._templet.registerTexture(texture);
        this._optimize.registerTexture(texture);
        
        if (createAttachment) {
            attachment = attachment.copy();
            slot.setAttachment(attachment);
        }

        let pageName = texture.url;
        let textureName = slotName;
        let newRegion = this._optimize.getTextureRegion(pageName, textureName);
        
        if (attachment instanceof spine.RegionAttachment) {
            attachment.region = newRegion;
            attachment.width = newRegion.width;
            attachment.height = newRegion.height;

            if (attachment.updateRegion) {
                attachment.updateRegion();
            }
            //@ts-ignore
            else if(attachment.updateOffset){
                //@ts-ignore
                attachment.updateOffset();
            }

        } else if (attachment instanceof spine.MeshAttachment) {
            attachment.region = newRegion;
            attachment.width = newRegion.width;
            attachment.height = newRegion.height;

            if (attachment.updateRegion) {
                attachment.updateRegion();
            }
            //@ts-ignore
            else if(attachment.updateUVs){
                //@ts-ignore
                attachment.updateUVs();
            }
        }
    }

    setTempletAttachment(templet: SpineTemplet, targetSlotName: string, skinName: string,  attachmentName: string): void { 
        if (this._mode !== ESpineRenderMode.Normal) {
            console.log("setSlotAttachment: mode is not Normal");
            return;
        }
       
        let optimize = templet.optimize as SkeletonOptimise;

        if (attachmentName && targetSlotName && skinName) {
            let attachment: spine.Attachment = null;
            let skins = optimize.data.skins;
            for (let j = skins.length - 1; j >= 0; j--) {
                if (skins[j].name == skinName) {
                    let skin = skins[j];
                    let attachments = skin.attachments;
                    for (let j = attachments.length - 1; j >= 0; j--) {
                        attachment = attachments[j]?.[attachmentName];
                        if (attachment) {
                            break;
                        }
                    }
                    break;
                }
            }

            if (attachment && (attachment as any).region) {
                let regionPage = (attachment as any).region.page;
                this._templet.setTexture(regionPage.name , regionPage.texture.realTexture);
                let slotObj = this._skeleton.findSlot(targetSlotName);
                if (slotObj) {
                    slotObj.setAttachment(attachment);
                }
            }
        }
    }
}
