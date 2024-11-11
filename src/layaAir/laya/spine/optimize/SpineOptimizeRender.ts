import { BaseRender2DType, BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { IIndexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { Color } from "../../maths/Color";
import { Vector2 } from "../../maths/Vector2";
import { Vector4 } from "../../maths/Vector4";
import { Material } from "../../resource/Material";
import { Mesh2D } from "../../resource/Mesh2D";
import { Texture2D } from "../../resource/Texture2D";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineAdapter } from "../SpineAdapter";
import { ESpineRenderType } from "../SpineSkeleton";
import { SpineTemplet } from "../SpineTemplet";
import { ISpineRender } from "../interface/ISpineRender";
import { SpineShaderInit } from "../material/SpineShaderInit";
import { SpineMeshUtils } from "../mesh/SpineMeshUtils";
import { AnimationRenderProxy } from "./AnimationRenderProxy";
import { SketonDynamicInfo, SketonOptimise, SkinAttach, TSpineBakeData } from "./SketonOptimise";
import { VBCreator } from "./VBCreator";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";
import { IVBChange } from "./interface/IVBChange";
import { SkinRenderUpdate } from "./SkinRenderUpdate"; // 新增导入

/**
 * @en SpineOptimizeRender used for optimized rendering of Spine animations.
 * @zh SpineOptimizeRender 类用于优化 Spine 动画的渲染。
 */
export class SpineOptimizeRender implements ISpineOptimizeRender {
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
     * @en Array of Spine bones.
     * @zh Spine 骨骼数组。
     */
    bones: spine.Bone[];
    /**
     * @en Array of Spine slots.
     * @zh Spine 插槽数组。
     */
    slots: spine.Slot[];
    /**
     * @en Array of SkinRender objects.
     * @zh SkinRender 对象数组。
     */
    skinRenderArray: SkinRenderUpdate[];

    /**
     * @en Current SkinRender being used.
     * @zh 当前使用的 SkinRender。
     */
    currentRender: SkinRenderUpdate;
    /** @internal */
    _skinIndex: number = 0;
    /** @internal */
    _curAnimationName: string;

    /** @internal */
    _dynamicMap:Map<number,Mesh2D>;

    private _isRender: boolean;

    /**
     * @en Color of the Spine object.
     * @zh Spine 对象的颜色。
     */
    spineColor: Color;
    /** @internal */
    _skeleton: spine.Skeleton;
    /** @internal */
    _state: spine.AnimationState;

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
    _nodeOwner: Spine2DRenderNode;

    /**
     * @en Float32Array for bone matrices.
     * @zh 用于骨骼矩阵的 Float32Array。
     */
    boneMat: Float32Array;

    /**
     * @en Indicates if the animation is baked.
     * @zh 指示动画是否被烘焙。
     */
    isBake: boolean;

    /**
     * @en Bake data for the Spine animation.
     * @zh Spine 动画的烘焙数据。
     */
    bakeData: TSpineBakeData;

    private _renderProxytype: ERenderProxyType;

    /**
     * @en Create a new SpineOptimizeRender instance.
     * @param spineOptimize SketonOptimise object containing optimization data.
     * @zh 创建 SpineOptimizeRender 的新实例。
     * @param spineOptimize 包含优化数据的 SketonOptimise 对象。
     */
    constructor(spineOptimize: SketonOptimise) {
        this.renderProxyMap = new Map();
        // this.geoMap = new Map();
        this._dynamicMap = new Map;
        this.animatorMap = new Map();
        this.skinRenderArray = [];
        this.boneMat = new Float32Array(spineOptimize.maxBoneNumber * 8);
        
        spineOptimize.skinAttachArray.forEach((value) => {
            this.skinRenderArray.push(new SkinRenderUpdate(this, value));
        })

        let animators = spineOptimize.animators;
        for (let i = 0, n = animators.length; i < n; i++) {
            let animator = animators[i];
            this.animatorMap.set(animator.name, new AnimationRenderProxy(animator));
    }
        this.currentRender = this.skinRenderArray[this._skinIndex];//default
    }

    /**
     * @en Destroy the SpineOptimizeRender instance.
     * @zh 销毁 SpineOptimizeRender 实例。
     */
    destroy(): void {
        this._dynamicMap.forEach(mesh=>mesh.destroy());
        this._dynamicMap.clear();
        //throw new Error("Method not implemented.");
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
            let render = this.renderProxyMap.get(ERenderProxyType.RenderBake) as RenderBake || new RenderBake(this.bones, this.slots, this._nodeOwner);
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
        //throw new Error("Method not implemented.");
    }

    /**
     * @en Change the current skeleton.
     * @param skeleton The new spine skeleton to use.
     * @zh 更改当前骨骼。
     * @param skeleton 要使用的新 spine 骨骼。
     */
    changeSkeleton(skeleton: spine.Skeleton) {
        this._skeleton = skeleton;
        this.bones = skeleton.bones;
        this.slots = skeleton.slots;
        (this.renderProxyMap.get(ERenderProxyType.RenderNormal) as RenderNormal)._skeleton = skeleton;
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
    init(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: Spine2DRenderNode, state: spine.AnimationState): void {
        this._skeleton = skeleton;
        this.bones = skeleton.bones;
        this.slots = skeleton.slots;
        this._nodeOwner = renderNode;
        let scolor = skeleton.color;
        this.spineColor = new Color(scolor.r * scolor.a, scolor.g * scolor.a, scolor.b * scolor.a, scolor.a);
        renderNode._spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this.spineColor);
        this.skinRenderArray.forEach((value) => {
            value.init(skeleton, templet, renderNode);
        });
        this._state = state;

        this.animatorMap.forEach((value, key) => {
            value.state = state;
        });
        let renderOptimize = new RenderOptimize(this.bones, this.slots, this._nodeOwner);
        let renderNormal = new RenderNormal(skeleton, this._nodeOwner);
        this.renderProxyMap.set(ERenderProxyType.RenderNormal, renderNormal);
        this.renderProxyMap.set(ERenderProxyType.RenderOptimize, renderOptimize);
    }

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
            this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
            this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
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
        this.currentRender = this.skinRenderArray[index];
        switch (this.currentRender.skinAttachType) {
            case ESpineRenderType.boneGPU:
                this._nodeOwner._spriteShaderData.addDefine(SpineShaderInit.SPINE_FAST);
                this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                break;
            case ESpineRenderType.rigidBody:
                this._nodeOwner._spriteShaderData.addDefine(SpineShaderInit.SPINE_RB);
                this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                break;
            case ESpineRenderType.normal:
                this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                break;
        }
        if (this.currentAnimation) {
            this._clear();
            this.play(this._curAnimationName);
        }
    }

    /**
     * 获取对应类型的 Dynamic mesh
     * @param type 
     * @param [create=true] 
     * @returns 
     */
    getDynamicMesh( vertexDeclaration:VertexDeclaration , create = true){
        let id = vertexDeclaration.id;
        let mesh = this._dynamicMap.get(id);
        if (!mesh && create) {
            mesh = SpineMeshUtils.createMeshDynamic(vertexDeclaration );
            this._dynamicMap.set(id , mesh);
        }
        return mesh;
    }

    private _clear() {
        this._nodeOwner.clear();
        this._isRender = false;
    }

    /**
     * @en Play a specific animation.
     * @param animationName The name of the animation to play.
     * @zh 播放特定的动画。
     * @param animationName 要播放的动画名称。
     */
    play(animationName: string) {
        this._curAnimationName = animationName;
        let currentRender = this.currentRender;
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
            switch (this.currentRender.skinAttachType) {
                case ESpineRenderType.boneGPU:
                    this._nodeOwner._spriteShaderData.addDefine(SpineShaderInit.SPINE_FAST);
                    this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                    break;
                case ESpineRenderType.rigidBody:
                    this._nodeOwner._spriteShaderData.addDefine(SpineShaderInit.SPINE_RB);
                    this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                    break;
                case ESpineRenderType.normal:
                    this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                    this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                    break;
            }

            if (old && oldSkinData.isNormalRender) {
                this._clear();
            }

            if (oldSkinData != currentSKin || !this._nodeOwner._mesh) {
                currentRender.renderUpdate(currentSKin , -1 , -1);
            }
            // old.animator.mutiRenderAble
            // let mutiRenderAble = currentSKin.mutiRenderAble;
            if (this._isRender) {
                //
                // if (mutiRenderAble != oldSkinData.mutiRenderAble) {
                    // this._clear();
                // }
            }
            else {
                // else (!this._isRender) {
                this.renderProxytype = ERenderProxyType.RenderOptimize;
                // if (mutiRenderAble) {
                //     //this._nodeOwner.drawGeos(currentRender.geo, currentRender.elements);
                    // this.renderProxytype = ERenderProxyType.RenderOptimize;
                // }
                // else {
                //     // currentRender.material&&this._nodeOwner.drawGeo(currentRender.geo, currentRender.material);
                //     this.renderProxytype = ERenderProxyType.RenderOptimize;
                // }
                this._isRender = true;
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

enum ERenderProxyType {
    RenderNormal,
    RenderOptimize,
    RenderBake
}
interface IRender {
    change(skinRender: SkinRenderUpdate, currentAnimation: AnimationRenderProxy): void;
    leave(): void;
    render(curTime: number, boneMat: Float32Array): void;
}
/**
 * @en RenderOptimize used for optimized rendering of Spine animations.
 * @zh RenderOptimize 类用于优化 Spine 动画的渲染。
 */
class RenderOptimize implements IRender {
    /**
     * @en Array of Spine bones.
     * @zh Spine 骨骼数组。
     */
    bones: spine.Bone[];
    /**
     * @en Array of Spine slots.
     * @zh Spine 插槽数组。
     */
    slots: spine.Slot[];
    /** @internal */
    _renderNode: Spine2DRenderNode;
    /**
     * @en The current skin renderer.
     * @zh 当前皮肤渲染器。
     */
    skinUpdate: SkinRenderUpdate;
    /**
     * @en The current animation render proxy.
     * @zh 当前动画渲染代理。
     */
    currentAnimation: AnimationRenderProxy;

    /**
     * @en Create a new instance of RenderOptimize.
     * @param bones Array of Spine bones.
     * @param slots Array of Spine slots.
     * @param renderNode The Spine2D render node.
     * @zh 创建 RenderOptimize 的新实例。
     * @param bones Spine 骨骼数组。
     * @param slots Spine 插槽数组。
     * @param renderNode Spine2D 渲染节点。
     */
    constructor(bones: spine.Bone[], slots: spine.Slot[], renderNode: Spine2DRenderNode) {
        this.bones = bones;
        this.slots = slots;
        this._renderNode = renderNode;
    }
    /**
     * @en Change the current skin renderer and animation.
     * @param currentRender The new skin renderer to use.
     * @param currentAnimation The new animation render proxy to use.
     * @zh 更改当前皮肤渲染器和动画。
     * @param currentRender 要使用的新皮肤渲染器。
     * @param currentAnimation 要使用的新动画渲染代理。
     */
    change(currentRender: SkinRenderUpdate, currentAnimation: AnimationRenderProxy) {
        this.skinUpdate = currentRender;
        this.currentAnimation = currentAnimation;
    }
    /**
     * @en Called when leaving the current render state.
     * @zh 离开当前渲染状态时调用。
     */
    leave(): void {

    }

    /**
     * @en Render the current animation at a specific time.
     * @param curTime The current time for rendering.
     * @param boneMat The bone matrix for rendering.
     * @zh 在特定时间渲染当前动画。
     * @param curTime 渲染的当前时间。
     * @param boneMat 用于渲染的骨骼矩阵。
     */
    render(curTime: number, boneMat: Float32Array) {
        this.currentAnimation.render(this.bones, this.slots, this.skinUpdate, curTime, boneMat );//TODO bone
        // this.material.boneMat = boneMat;
        this._renderNode._spriteShaderData.setBuffer(SpineShaderInit.BONEMAT, boneMat);
    }
}

/**
 * @en RenderNormal used for standard rendering of Spine animations.
 * @zh RenderNormal 类用于标准的 Spine 动画渲染。
 */
class RenderNormal implements IRender {
    /** @internal */
    _renderNode: Spine2DRenderNode;
    /** @internal */
    _renerer: ISpineRender;
    /** @internal */
    _skeleton: spine.Skeleton;

    /**
     * @en Create a new instance of RenderNormal.
     * @param skeleton The Spine skeleton.
     * @param renderNode The Spine2D render node.
     * @zh 创建 RenderNormal 的一个新实例。
     * @param skeleton Spine 骨骼。
     * @param renderNode Spine2D 渲染节点。
     */
    constructor(skeleton: spine.Skeleton, renderNode: Spine2DRenderNode) {
        this._renderNode = renderNode;
        this._skeleton = skeleton;
    }

    /**
     * @en Called when leaving the current render state.
     * @zh 离开当前渲染状态时调用。
     */
    leave(): void {

    }

    /**
     * @en Change the current skin renderer and animation.
     * @param currentRender The new skin renderer to use.
     * @param currentAnimation The new animation render proxy to use.
     * @zh 更改当前皮肤渲染器和动画。
     * @param currentRender 要使用的新皮肤渲染器。
     * @param currentAnimation 要使用的新动画渲染代理。
     */
    change(currentRender: SkinRenderUpdate, currentAnimation: AnimationRenderProxy) {
        this._renerer = currentRender._renderer;
    }

    /**
     * @en Render the current animation at a specific time.
     * @param curTime The current time for rendering.
     * @param boneMat The bone matrix for rendering .
     * @zh 在特定时间渲染当前动画。
     * @param curTime 渲染的当前时间。
     * @param boneMat 用于渲染的骨骼矩阵。
     */
    render(curTime: number, boneMat: Float32Array) {
        this._renderNode.clear();
        this._renerer.draw(this._skeleton, this._renderNode, -1, -1);
    }

}

/**
 * @en RenderBake used for baked Spine animation rendering.
 * @zh RenderBake 类用于烘焙 Spine 动画的渲染。
 */
class RenderBake implements IRender {
    /**
     * @en Array of Spine bones.
     * @zh Spine 骨骼数组。
     */
    bones: spine.Bone[];
    /**
     * @en Array of Spine slots.
     * @zh Spine 插槽数组。
     */
    slots: spine.Slot[];
    /** @internal */
    _simpleAnimatorParams: Vector4;

    private _simpleAnimatorTextureSize: number;

    private _simpleAnimatorTexture: Texture2D;
    /** x simpleAnimation offset,y simpleFrameOffset*/
    private _simpleAnimatorOffset: Vector2;
    /** @internal */
    _bonesNums: number;
    /**
     * @en Map of animation offsets.
     * @zh 动画偏移量映射。
     */
    aniOffsetMap: Record<string, number>;
    /**
     * @en Animatioin frame texture.
     * @zh 动画帧贴图。
     */
    get simpleAnimatorTexture(): Texture2D {
        return this._simpleAnimatorTexture;
    }

    set simpleAnimatorTexture(value: Texture2D) {
        if (this._simpleAnimatorTexture) {
            this._simpleAnimatorTexture._removeReference();
        }
        this._simpleAnimatorTexture = value;
        this._simpleAnimatorTextureSize = value.width;
        this._renderNode._spriteShaderData.setTexture(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE, value);
        value._addReference();
        this._renderNode._spriteShaderData.setNumber(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE, this._simpleAnimatorTextureSize);
    }

    /**
     * @en The simple animator offset.
     * @zh 简单动画偏移量
     */
    get simpleAnimatorOffset(): Vector2 {
        return this._simpleAnimatorOffset;
    }

    set simpleAnimatorOffset(value: Vector2) {
        value.cloneTo(this._simpleAnimatorOffset);
    }

    /** @internal */
    _renderNode: Spine2DRenderNode;
    /**
     * @en The current skin renderer.
     * @zh 当前皮肤渲染器。
     */
    skinRender: SkinRenderUpdate;
    /**
     * @en The current animation render proxy.
     * @zh 当前动画渲染代理。
     */
    currentAnimation: AnimationRenderProxy;
    /**
     * @en The time step for animation.
     * @zh 动画的时间步长。
     */
    step = 1 / 60;
    /**
     * @en Create a new instance of RenderBake.
     * @param bones Array of Spine bones.
     * @param slots Array of Spine slots.
     * @param renderNode The Spine2D render node.
     * @zh 创建 RenderBake 的新实例。
     * @param bones Spine 骨骼数组。
     * @param slots Spine 插槽数组。
     * @param renderNode Spine2D 渲染节点。
     */
    constructor(bones: spine.Bone[], slots: spine.Slot[], renderNode: Spine2DRenderNode) {
        this._simpleAnimatorParams = new Vector4();
        this.bones = bones;
        this.slots = slots;
        this._renderNode = renderNode;
        this._simpleAnimatorOffset = new Vector2();

    }

    /**
     * @en Called when leaving the current render state.
     * @zh 离开当前渲染状态时调用。
     */
    leave() {
        this._renderNode._spriteShaderData.removeDefine(SpineShaderInit.SPINE_SIMPLE);
        //this._renderNode._spriteShaderData.removeDefine(SpineShaderInit.SPINE_GPU_INSTANCE);
        this._renderNode._renderType = BaseRender2DType.spine;
    }

    /**
     * @en Change the current skin renderer and animation.
     * @param currentRender The new skin renderer to use.
     * @param currentAnimation The new animation render proxy to use.
     * @zh 更改当前皮肤渲染器和动画。
     * @param currentRender 要使用的新皮肤渲染器。
     * @param currentAnimation 要使用的新动画渲染代理。
     */
    change(currentRender: SkinRenderUpdate, currentAnimation: AnimationRenderProxy) {
        this.skinRender = currentRender;
        this.currentAnimation = currentAnimation;
        this._renderNode._spriteShaderData.addDefine(SpineShaderInit.SPINE_SIMPLE);
        this._simpleAnimatorOffset.x = this.aniOffsetMap[currentAnimation.name];
        if (currentAnimation.currentSKin.canInstance) {
            this._renderNode._renderType = BaseRender2DType.spineSimple;
            // this._renderNode._spriteShaderData.addDefine(SpineShaderInit.SPINE_GPU_INSTANCE);
        }
    }

    /**
     * @internal
     */
    _computeAnimatorParamsData() {
        this._simpleAnimatorParams.x = this._simpleAnimatorOffset.x;
        this._simpleAnimatorParams.y = Math.round(this._simpleAnimatorOffset.y) * this._bonesNums * 2;
    }

    /**
     * @en Set custom data for the animator.
     * @param value1 First custom value.
     * @param value2 Second custom value.
     * @zh 为动画器设置自定义数据。
     * @param value1 自定义数据1。
     * @param value2 自定义数据2。
     */
    setCustomData(value1: number, value2: number = 0) {
        this._simpleAnimatorParams.z = value1;
        this._simpleAnimatorParams.w = value2;
    }

    /**
     * @en Render the current animation at a specific time.
     * @param curTime The current time for rendering.
     * @param boneMat The bone matrix for rendering.
     * @zh 在特定时间渲染当前动画。
     * @param curTime 渲染的当前时间。
     * @param boneMat 用于渲染的骨骼矩阵。
     */
    render(curTime: number, boneMat: Float32Array) {
        this.currentAnimation.renderWithOutMat(this.slots, this.skinRender, curTime );
        this._simpleAnimatorOffset.y = curTime / this.step;
        this._computeAnimatorParamsData();
        // let boneMat = this.currentAnimation.render(this.bones, this.slots, this.skinRender, curTime);//TODO bone
        // this.material.boneMat = boneMat;
        this._renderNode._spriteShaderData.setVector(SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS, this._simpleAnimatorParams);
    }
}
