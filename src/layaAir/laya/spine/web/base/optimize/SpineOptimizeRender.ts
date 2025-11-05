import { Color } from "../../../../maths/Color";
import { ISpineRenderDataHandle } from "../../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { VertexDeclaration } from "../../../../RenderEngine/VertexDeclaration";
import { Mesh2D } from "../../../../resource/Mesh2D";
import { ISpineRender } from "../../../interface/ISpineRender";
import { SpineShaderInit } from "../../../shader/SpineShaderInit";
import { Spine2DRenderNode } from "../../../Spine2DRenderNode";
import { ESpineRenderMode, ESpineRenderState, SpineConst, TSpineBakeData } from "../../../SpineConst";
import { ESpineRenderType } from "../../../SpineSkeleton";
import { SpineTemplet } from "../../../SpineTemplet";
import { SpineMeshUtils } from "../../../utils/SpineMeshUtils";
import { AnimationRenderProxy } from "./AnimationRenderProxy";
import { SkeletonOptimise } from "./SkeletonOptimise";
import { SkinRenderUpdate } from "./SkinRenderUpdate";
import { IRender, BakedSpineRenderer, OptimizedSpineRenderer, StandardSpineRenderer, RigidBodySpineRenderer } from "./SpineRendererTypes";

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
    /**
     * @en Map of animation names to AnimationRenderProxy objects.
     * @zh 动画名称到 AnimationRenderProxy 对象的映射。
     */
    animatorMap: Map<string, AnimationRenderProxy>;
    /**
     * @en Current animation being rendered.
     * @zh 当前正在渲染的动画。
     */
    currentAnimation: AnimationRenderProxy;
    /**
     * @en Array of SkinRender objects.
     * @zh SkinRender 对象数组。
     */
    skinRenderArray: SkinRenderUpdate[];

    /**
     * @en Current SkinUpdator being used.
     * @zh 当前使用的 SkinUpdator。
     */
    currentUpdator: SkinRenderUpdate;

    /** @internal */
    _skinIndex: number = 0;
    /** @internal */
    _curAnimationName: string;

    /** @internal */
    _dynamicMap: Map<number, Mesh2D>;

    /**
     * @en Color of the Spine object.
     * @zh Spine 对象的颜色。
     */
    spineColor: Color;
    /** @internal */
    _optimize: SkeletonOptimise;
    /** @internal */
    private _skeleton: spine.Skeleton;
    /** @internal */
    private _state: spine.AnimationState;
    /** @internal */
    private _stateData: spine.AnimationStateData;

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

    /**
     * @en Float32Array for bone matrices.
     * @zh 用于骨骼矩阵的 Float32Array。
     */
    boneMat: Float32Array;

    /**
     * @en Indicates if the animation is baked.
     * @zh 指示动画是否被烘焙。
     */
    isBake: boolean = false;

    /**
     * @en Bake data for the Spine animation.
     * @zh Spine 动画的烘焙数据。
     */
    bakeData: TSpineBakeData;
 
    private _renderProxytype: ERenderProxyType;

    mode: ESpineRenderMode;

    state: ESpineRenderState;

    currentTime: number;

 
    /** @ignore */
    constructor() {
        // spineOptimize.skinAttachArray.forEach((value) => {
        //     this.skinRenderArray.push(new SkinRenderUpdate(this, value));
        // })

        // let animators = spineOptimize.animators;
        // for (let i = 0, n = animators.length; i < n; i++) {
        //     let animator = animators[i];
        //     this.animatorMap.set(animator.name, new AnimationRenderProxy(animator));
        // }
        // this.currentRender = this.skinRenderArray[this._skinIndex];//default
    }

    stop(): void {
    }
    showSkinByIndex(skinIndex: number): void {
    }
    setAttachment(slotName: string, attachmentName: string): void {
    }

    createBones(): void {
    }
    reset(): void {
    }
    update(time: number): void {
    }
    getSpineColor(): Color {
        return this.spineColor;
    }

    init(owner: Spine2DRenderNode): void {
        this._owner = owner;
        let templet = owner.templet;
        let optimize = this._optimize = templet.optimize as SkeletonOptimise;
        let skeleton = this._skeleton = new spine.Skeleton(optimize.data);
        this._stateData = new spine.AnimationStateData(optimize.data);

        this._state = new spine.AnimationState(this._stateData);

        let scolor = this._skeleton.color;
        this.spineColor = new Color(scolor.r, scolor.g, scolor.b, scolor.a);
        (owner._getRenderHandle() as ISpineRenderDataHandle).baseColor = this.spineColor;
        

        this.renderProxyMap = new Map();
        this._dynamicMap = new Map;
        this.animatorMap = new Map();
        this.skinRenderArray = [];
        this.boneMat = new Float32Array(SpineConst.MAX_BONES * 8);

        let renderOptimize = new OptimizedSpineRenderer(this._owner);
        let renderNormal = new StandardSpineRenderer(this._owner);
        let renderRigidBody = new RigidBodySpineRenderer(this._owner);
        this.renderProxyMap.set(ERenderProxyType.RenderNormal, renderNormal);
        this.renderProxyMap.set(ERenderProxyType.RenderOptimize, renderOptimize);
        this.renderProxyMap.set(ERenderProxyType.RenderRigidBody, renderRigidBody);

        optimize.skinAttachArray.forEach((value) => {
            this.skinRenderArray.push(new SkinRenderUpdate(this, value));
        })

        let animators = optimize.animators;
        for (let i = 0, n = animators.length; i < n; i++) {
            let animator = animators[i];
            this.animatorMap.set(animator.name, new AnimationRenderProxy(animator));
        }

        this.currentUpdator = this.skinRenderArray[this._skinIndex];//default
    }

    /**
     * @en Destroy the SpineOptimizeRender instance.
     * @zh 销毁 SpineOptimizeRender 实例。
     */
    destroy(): void {
        this.skinRenderArray.forEach(skin => skin.destroy());
        this._dynamicMap.forEach(mesh => mesh.destroy());
        this._dynamicMap.clear();
        this._owner._onMeshChange(null);
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
            let render = this.renderProxyMap.get(ERenderProxyType.RenderBake) as BakedSpineRenderer || new BakedSpineRenderer(this._owner);
            render.simpleAnimatorTexture = obj.texture2d;
            render._bonesNums = obj.bonesNums;
            render.aniOffsetMap = obj.aniOffsetMap;
            this.renderProxyMap.set(ERenderProxyType.RenderBake, render);
        }
        this.isBake = !!obj;
        if (this._curAnimationName) {
            this._clear();
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
        this.renderProxyMap.forEach(render => {
            render.changeSkeleton(skeleton);
        });
        //@ts-ignore
        skeleton.showSkinByIndex(this._skinIndex);
        this._skeleton.setSlotsToSetupPose();
    }

    /**
     * @en Initialize the SpineOptimizeRender with necessary components.
     * @param skeleton The spine skeleton.
     * @param templet The spine templet.
     * @param renderNode The Spine2DRenderNode.
     * @param state The spine animation state.
     * @zh 使用必要的组件初始化 SpineOptimizeRender。
     * @param skeleton Spine 骨骼。
     * @param templet Spine 模板。
     * @param renderNode Spine2DRenderNode。
     * @param state Spine 动画状态。
     */
    // init(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: Spine2DRenderNode, state: spine.AnimationState): void {
    //     this._skeleton = skeleton;
    //     this._owner = renderNode;
    //     let scolor = skeleton.color;

    //     this.spineColor = new Color(scolor.r, scolor.g, scolor.b, scolor.a);
    //     (renderNode._getRenderHandle() as ISpineRenderDataHandle).baseColor = this.spineColor;

    //     this.skinRenderArray.forEach((value) => {
    //         value.init(skeleton, templet, renderNode);
    //     });
    //     this._state = state;

    //     this.animatorMap.forEach((value, key) => {
    //         value.state = state;
    //     });

    //     let renderOptimize = new OptimizedSpineRenderer(this._owner);
    //     let renderNormal = new StandardSpineRenderer(this._owner);
    //     let renderRigidBody = new RigidBodySpineRenderer(this._owner);
    //     this.renderProxyMap.set(ERenderProxyType.RenderNormal, renderNormal);
    //     this.renderProxyMap.set(ERenderProxyType.RenderOptimize, renderOptimize);
    //     this.renderProxyMap.set(ERenderProxyType.RenderRigidBody, renderRigidBody);
    // }

    /**
     * @en The current render proxy type.
     * @zh 当前渲染代理类型。
     */
    get renderProxytype(): ERenderProxyType {
        return this._renderProxytype;
    }

    set renderProxytype(value: ERenderProxyType) {
        if (this.isBake && value == ERenderProxyType.RenderOptimize) {
            if (this.bakeData.aniOffsetMap[this._curAnimationName] != undefined) {
                value = ERenderProxyType.RenderBake;
            }
        }
        this.renderProxy = this.renderProxyMap.get(value);
        if (value == ERenderProxyType.RenderNormal) {
            this._owner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
            this._owner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
        }
        this._renderProxytype = value;
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
        this._skinIndex = index;
        this.currentUpdator = this.skinRenderArray[index];
        switch (this.currentUpdator.skinAttachType) {
            case ESpineRenderType.boneGPU:
                this._owner._spriteShaderData.addDefine(SpineShaderInit.SPINE_FAST);
                this._owner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                break;
            case ESpineRenderType.rigidBody:
                this._owner._spriteShaderData.addDefine(SpineShaderInit.SPINE_RB);
                this._owner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                break;
            case ESpineRenderType.normal:
                this._owner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                this._owner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                break;
        }
        
        if (this.currentAnimation) {
            this._clear();
            this.play(this._curAnimationName);
        }
    }

    /**
     * 获取对应类型的 Dynamic mesh
     * @param vertexDeclaration 
     * @param create
     * @returns 
     */
    getDynamicMesh(vertexDeclaration: VertexDeclaration, create = true) {
        let id = vertexDeclaration.id;
        let mesh = this._dynamicMap.get(id);
        if (!mesh && create) {
            mesh = SpineMeshUtils.createMeshDynamic(vertexDeclaration);
            mesh.lock = true;
            this._dynamicMap.set(id, mesh);
        }
        return mesh;
    }

    private _clear() {
        this._owner.clear();
    }

    /**
     * @en Play a specific animation.
     * @param animationName The name of the animation to play.
     * @zh 播放特定的动画。
     * @param animationName 要播放的动画名称。
     */
    play(animationName: string) {
        this._curAnimationName = animationName;
        let currentRender = this.currentUpdator;
        let oldRenderProxy = this.renderProxy;

        let old = this.currentAnimation;
        let oldSkinData = old ? old.currentSKin : null;
        let currentAnimation = this.currentAnimation = this.animatorMap.get(animationName);
        currentAnimation.skinIndex = this._skinIndex;
        let currentSKin = currentAnimation.currentSKin;
        if (old) {
            old.reset();
        }

        if (currentSKin.isNormalRender) {
            this.renderProxytype = ERenderProxyType.RenderNormal;
        }
        else {
            if (currentRender.vertexBones > 4) {
                console.warn(`In FastRender mode - Current skin: ${currentRender.name} has ${currentRender.vertexBones} bones influencing each vertex. This exceeds the recommended limit of 4 bones per vertex.`);
            }

            switch (this.currentUpdator.skinAttachType) {
                case ESpineRenderType.boneGPU:
                    this._owner._spriteShaderData.addDefine(SpineShaderInit.SPINE_FAST);
                    this._owner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                    this.renderProxytype = ERenderProxyType.RenderOptimize;

                    break;
                case ESpineRenderType.rigidBody:
                    this._owner._spriteShaderData.addDefine(SpineShaderInit.SPINE_RB);
                    this._owner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                    this.renderProxytype = ERenderProxyType.RenderRigidBody;
                    
                    break;
                case ESpineRenderType.normal:
                    this._owner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                    this._owner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                    this._renderProxytype = ERenderProxyType.RenderNormal;
                    break;
            }

            if (old && oldSkinData.isNormalRender) {
                this._clear();
            }

            if (oldSkinData != currentSKin || !this._owner._mesh) {
                this.currentAnimation.currentFrameIndex = -1;
            }
        }

        if (oldRenderProxy) {
            oldRenderProxy.leave();
        }

        this.renderProxy.change(currentRender, currentAnimation);
        if ((currentAnimation.animator.isCache || this.renderProxytype == ERenderProxyType.RenderBake) && !currentSKin.isNormalRender) {
            this.beginCache();
        }
        else {
            this.endCache();
        }
    }

    clearCacheMaterials() {
        this.skinRenderArray.forEach(item=>item.clearCacheMaterials());
    }

    complete(): void {
        this.currentAnimation.currentFrameIndex = -1;
    }

    /**
     * @en Render the current animation at a specific time.
     * @param time The time to render the animation at.
     * @zh 在特定时间渲染当前动画。
     * @param time 要渲染动画的时间。
     */
    render(time: number): void {
        this.renderProxy.render(time, this.boneMat);
    }

}

