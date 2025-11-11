import { Color } from "../../../../maths/Color";
import { ISpineRenderDataHandle } from "../../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { VertexDeclaration } from "../../../../RenderEngine/VertexDeclaration";
import { Mesh2D } from "../../../../resource/Mesh2D";
import { ISpineRender, IBoneInfo, ISlotInfo, ITrackEntry } from "../../../interface/ISpineRender";
import { Spine2DRenderNode } from "../../../Spine2DRenderNode";
import { ESpineRenderMode, ESpineRenderState, SpineConst, TSpineBakeData } from "../../../SpineConst";
import { ESpineRenderType } from "../../../SpineSkeleton";
import { SpineMeshUtils } from "../utils/SpineMeshUtils";
import { SkeletonOptimise, SkinAttach } from "./SkeletonOptimise";
import { SpineRenderUpdater } from "./SpineRenderUpdater";
import { IRender, BakedSpineRenderer, OptimizedSpineRenderer, StandardSpineRenderer, RigidBodySpineRenderer } from "./SpineRendererTypes";
import { AnimationRender } from "./AnimationRender";
import { Vector4 } from "../../../../maths/Vector4";
import { SpineTemplet } from "../../../SpineTemplet";
import { LayaGL } from "../../../../layagl/LayaGL";
import { IRenderElement2D } from "../../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderGeometryElement } from "../../../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { Material } from "../../../../resource/Material";
import { IRenderStruct2D } from "../../../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { SpineShaderInit } from "../../../shader/SpineShaderInit";
import { Texture2D } from "../../../../resource/Texture2D";

enum ERenderProxyType {
    RenderNormal,
    RenderRigidBody,
    RenderOptimize,
    RenderBake
}

/**
 * @en SpineOptimizeRender used for optimized rendering of Spine animations.
 * @zh SpineOptimizeRender 类用于优化 Spine 动画的渲染。
 */
export class SpineOptimizeRender implements ISpineRender {

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
        element.nodeCommonMap = ["BaseRender2D", "Spine2D"];
        return element;
    }

    /** @ignore @blueprintIgnore */
    static recoverRenderElement2D(value: IRenderElement2D) {
        if (!(value as any).canotPool) {
            value.materialShaderData = null;
            value.geometry = null;
            value.subShader = null;
            value.owner = null;
            this._pool.push(value);
        }
    }
    
    /**
     * @en Current SpineRenderUpdater being used.
     * @zh 当前使用的 SpineRenderUpdater。
     */
    updater: SpineRenderUpdater;

    /** @internal */
    private _renderElements: IRenderElement2D[] = [];

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
    private _skinAttach: SkinAttach = null;
    /** @internal */
    private _currentAnimator: AnimationRender = null;
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
    _owner: Spine2DRenderNode;
    /** @internal */
    _templet: SpineTemplet;

    /**
     * @en Bake data for the Spine animation.
     * @zh Spine 动画的烘焙数据。
     */
    bakeData: TSpineBakeData;
 
    private _transform: Vector4 = new Vector4();

    /** 
     * @en Current render mode.
     * @zh 当前渲染模式。
     */
    private _mode: ESpineRenderMode = ESpineRenderMode.Optimize;

    public get mode(): ESpineRenderMode {
        return this._mode;
    }

    public set mode(value: ESpineRenderMode) {
        if (this._mode === value) return;
        
        this._mode = value;

        if (this._curAnimationName) {
            this._clearRenderElements();
            this.play(this._curAnimationName , this.trackEntry.loop , this.trackEntry.trackIndex , this.currentTime);
        }
    }

    state: ESpineRenderState = ESpineRenderState.Stopped;

    currentTime: number = 0;

    private _handle: ISpineRenderDataHandle;
 
    trackEntry: spine.TrackEntry = null;

    /** @ignore */
    constructor(owner: Spine2DRenderNode) {
        this._owner = owner;
        this.spineColor = new Color();
        this._handle = this._owner._getRenderHandle() as ISpineRenderDataHandle;
        this._handle.baseColor = this.spineColor;
        this.updater = new SpineRenderUpdater(this);
    }

    getSkeleton(): spine.Skeleton {
        return this._skeleton;
    }

    showSkinByIndex(skinIndex: number): void {
        this.setSkinIndex(skinIndex);
    }
    
    setAttachment(slotName: string, attachmentName: string): void {
        if (this._skeleton) {
            this._skeleton.setAttachment(slotName, attachmentName);
        }
    }
    
    update(delta: number): void {
        this._state.update(delta);
        this._state.apply(this._skeleton);
        this.currentTime = this.trackEntry.getAnimationTime();
    }

    /**
     * @en Render the current animation at a specific time.
     * @param time The time to render the animation at.
     * @zh 在特定时间渲染当前动画。
     * @param time 要渲染动画的时间。
     */
    render(time: number, physicsUpdate: number): void {

        this._skeleton.update && this._skeleton.update(time);
        this._skeleton.updateWorldTransform(physicsUpdate);

        let offsetX = - this._skeleton.x + this._templet.offsetX;
        let offsetY = - this._skeleton.y + this._templet.offsetY;

        if (this.renderProxy) {
            this.renderProxy.render(this.currentTime, offsetX, offsetY);
            if (this.renderProxy.afterRender) {
                this.renderProxy.afterRender(this);
            }
        }
    }

    /**
     * @en Update render elements from subMeshes and materials.
     * This method is called from renderProxy.afterRender().
     * @param subMeshes Array of sub meshes.
     * @param materials Array of materials.
     * @zh 根据子网格和材质数组更新渲染元素。
     * 此方法由 renderProxy.afterRender() 调用。
     * @param subMeshes 子网格数组。
     * @param materials 材质数组。
     */
    _updateRenderElements(subMeshes: IRenderGeometryElement[], materials: Material[]): void {
        if (!this._owner || !this._owner._struct) {
            return;
        }

        const struct = this._owner._struct;
        const shaderData = this._owner._spriteShaderData;

        this._updateRenderElementsFromData(
            struct,
            shaderData,
            subMeshes,
            materials
        );
    }

    /**
     * @en Update render elements from subMeshes and materials arrays.
     * Updates internal _renderElements first, then syncs to struct.renderElements.
     * @param struct The render struct to set renderElements.
     * @param shaderData The shader data for render elements.
     * @param subMeshes Array of sub meshes.
     * @param materials Array of materials.
     * @param getCommonUniformMap Function to get common uniform map.
     * @zh 根据子网格和材质数组更新渲染元素。
     * 先更新内部的 _renderElements，然后同步到 struct.renderElements。
     * @param struct 要设置 renderElements 的渲染结构。
     * @param shaderData 渲染元素的着色器数据。
     * @param subMeshes 子网格数组。
     * @param materials 材质数组。
     * @param getCommonUniformMap 获取通用 uniform map 的函数。
     */
    private _updateRenderElementsFromData(
        struct: IRenderStruct2D,
        shaderData: ShaderData,
        subMeshes: IRenderGeometryElement[],
        materials: Material[]
    ): void {
        if (!subMeshes || !materials || subMeshes.length === 0 || materials.length === 0) {
            // 清理所有元素
            this._clearRenderElements();
            struct.renderElements = [];
            return;
        }

        const subMeshCount = subMeshes.length;
        const materialCount = materials.length;
        const targetCount = Math.max(subMeshCount, materialCount);

        let need = false;
        
        // 更新或创建 RenderElements
        for (let i = 0; i < targetCount; i++) {
            let element = this._renderElements[i];
            const subMesh = subMeshes[i];
            const material = materials[i];

            if (subMesh && material) {
                // 检查是否需要更新 element
                let needUpdate = false;
                if (!element) {
                    // 需要创建新的 element
                    element = SpineOptimizeRender.createRenderElement2D();
                    this._renderElements[i] = element;
                    needUpdate = true;
                } else {
                    // 对比检查是否需要更新现有 element
                    if (element.geometry !== subMesh || 
                        element.materialShaderData !== material.shaderData ||
                        element.value2DShaderData !== shaderData ||
                        element.owner !== struct
                    ) {
                        needUpdate = true;
                    }
                }

                if (needUpdate) {
                    element.geometry = subMesh;
                    element.materialShaderData = material.shaderData;
                    element.subShader = material._shader.getSubShaderAt(0);
                    element.value2DShaderData = shaderData;
                    element.owner = struct;
                    need = true;
                }
            } else {
                // 清理不需要的 element
                if (element) {
                    SpineOptimizeRender.recoverRenderElement2D(element);
                }
            }
        }

        this._renderElements.length = subMeshCount;

        if (need) {
            struct.renderElements = this._renderElements;
        }
    }

    /**
     * @en Clear all render elements.
     * @zh 清除所有渲染元素。
     */
    private _clearRenderElements(): void {
        for (let i = 0, len = this._renderElements.length; i < len; i++) {
            const element = this._renderElements[i];
            if (element) {
                SpineOptimizeRender.recoverRenderElement2D(element);
            }
        }
        this._renderElements.length = 0;
        
        if (this._owner && this._owner._struct) {
            this._owner._struct.renderElements = [];
        }
    }

    getSpineColor(): Color {
        return this.spineColor;
    }

    init(): void {
        let templet = this._owner.templet;
        this._templet = templet;
        let optimize = this._optimize = templet.optimize as SkeletonOptimise;
        let skeleton = this._skeleton = new spine.Skeleton(optimize.data);
        this._stateData = new spine.AnimationStateData(optimize.data);

        this._state = new spine.AnimationState(this._stateData);

        let scolor = this._skeleton.color;
        this.spineColor.setValue(scolor.r, scolor.g, scolor.b, scolor.a);
        this._handle.skeleton = this._skeleton;
        
        this.renderProxyMap = new Map();
        this._dynamicMap = new Map;
        this.updater.clear();

        let struct = this._owner._struct;
        let renderOptimize = new OptimizedSpineRenderer(struct);
        let renderNormal = new StandardSpineRenderer(struct);
        let renderRigidBody = new RigidBodySpineRenderer(struct);
        this.renderProxyMap.set(ERenderProxyType.RenderNormal, renderNormal);
        this.renderProxyMap.set(ERenderProxyType.RenderOptimize, renderOptimize);
        this.renderProxyMap.set(ERenderProxyType.RenderRigidBody, renderRigidBody);
        
        // 初始化所有renderer的skeleton
        this.renderProxyMap.forEach(render => {
            render.bind(this.updater, this._skeleton);
        });

        this._skinAttach = this._optimize.skinAttachArray[this._skinIndex];
        this.updater.skinAttach = this._skinAttach;

        if (this._skinAttach.twoColorTint) {
            struct.spriteShaderData.addDefine(SpineShaderInit.SPINE_COLOR2);
        } else {
            struct.spriteShaderData.removeDefine(SpineShaderInit.SPINE_COLOR2);
        }
    }

    /**
     * @en Destroy the SpineOptimizeRender instance.
     * @zh 销毁 SpineOptimizeRender 实例。
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
            let render = this.renderProxyMap.get(ERenderProxyType.RenderBake) as BakedSpineRenderer || new BakedSpineRenderer(this._owner._struct);
            render.simpleAnimatorTexture = obj.texture2d;
            render._bonesNums = obj.bonesNums;
            render.aniOffsetMap = obj.aniOffsetMap;
            this.renderProxyMap.set(ERenderProxyType.RenderBake, render);
        }
        this.mode = ESpineRenderMode.Bake;

        if (this._curAnimationName) {
            this._clearRenderElements();
            this.play(this._curAnimationName);
        }
    }

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
        //@ts-ignore
        skeleton.showSkinByIndex(this._skinIndex);
        this._skeleton.setSlotsToSetupPose();
    }

    /**
     * @en Begin caching the animation.
     * @zh 开始缓存动画。
     */
    beginCache() {
        //@ts-ignore
        this._state.apply = this._state.applyCache;
        //@ts-ignore
        this._state.getCurrentPlayTime = this._state.getCurrentPlayTimeByCache;
        //@ts-ignore
        this._skeleton.updateWorldTransform = this._skeleton.updateWorldTransformCache;
    }

    /**
     * @en End caching the animation.
     * @zh 结束缓存动画。
     */
    endCache() {
        //@ts-ignore
        this._state.apply = this._state.oldApply;
        //@ts-ignore
        this._state.getCurrentPlayTime = this._state.getCurrentPlayTimeOld;
        //@ts-ignore
        this._skeleton.updateWorldTransform = this._skeleton.oldUpdateWorldTransform;
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

        if (this._skinAttach.twoColorTint) {
            this._owner._spriteShaderData.addDefine(SpineShaderInit.SPINE_COLOR2);
        } else {
            this._owner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_COLOR2);
        }
        
        if (this._currentAnimator) {
            this._clearRenderElements();
            this.play(this._curAnimationName);
        }
    }

    /** @internal */
    _getMaterialByName(name: string, blendMode: number): Material {
        return this._templet.getMaterial(this._templet.getTexture(name), blendMode);
    }
    
    /** @internal */
    _getMaterial(texture: Texture2D, blendMode: number): Material {
        return this._templet.getMaterial(texture, blendMode);
    }

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
        this._templet = null;
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

        if (this.mode === ESpineRenderMode.Optimize || this.mode === ESpineRenderMode.Bake) {

            if (skinAttach.vertexBones > 4) {
                console.warn(`In FastRender mode - Current skin: ${skinAttach.name} has ${skinAttach.vertexBones} bones influencing each vertex. This exceeds the recommended limit of 4 bones per vertex.`);
            }

            if (this.bakeData && this.bakeData.aniOffsetMap[animationName] != undefined) {
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
            }
        } else if (this.mode === ESpineRenderMode.Normal) {
            this.renderProxy = this.renderProxyMap.get(ERenderProxyType.RenderNormal);
        }

        if (oldProxy) {
            oldProxy.leave();
        }

        if (this.renderProxy && currentAnimator) {
            this.renderProxy.change();
            this.updater.animator = currentAnimator;
            const isBakeMode = this.mode === ESpineRenderMode.Bake;
            if ((this._optimize.canCache || isBakeMode) && !skinAttach.isNormalRender) {
                this.beginCache();
            }
            else {
                this.endCache();
            }
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
        if (this._skeleton && this._owner.templet.hasPhysics) {
            this._skeleton.physicsTranslate(x, y);
        }
    }
    
    getBones(): IBoneInfo[] {
        if (!this._skeleton) return [];
        return this._skeleton.bones;
    }
    

    getSkeletonTransform(): Vector4{
        if (!this._skeleton || !this._owner.templet) {
            return this._transform;
        }

        this._transform.x = this._skeleton.x;
        this._transform.y = this._skeleton.y;
        this._transform.z = this._owner.templet.offsetX;
        this._transform.w = this._owner.templet.offsetY;
        return this._transform;
    }
    
    resetExternalSkin(): void {
        if (!this._skeleton || !this._owner.templet) return;
        let optimize = this._owner.templet.optimize as any;
        if (optimize && optimize.data) {
            let newSkeleton = new spine.Skeleton(optimize.data);
            this.changeSkeleton(newSkeleton);
            this._handle.skeleton = newSkeleton;
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
        if (this._state) {
            this._state.addListener(listeners);
        }
    }

    clearCacheMaterials() {
        this.skinRenderArray.forEach(item=>item.clearCacheMaterials());
    }

    complete(): void {
        this.updater.currentFrameIndex = -1;
    }
    
}

