import { BaseRender2DType, BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { IIndexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
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
import { SkinAniRenderData } from "./AnimationRender";
import { AnimationRenderProxy } from "./AnimationRenderProxy";
import { SketonDynamicInfo, SketonOptimise, SkinAttach, TSpineBakeData } from "./SketonOptimise";
import { VBCreator } from "./VBCreator";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";
import { IVBChange } from "./interface/IVBChange";
import { IVBIBUpdate } from "./interface/IVBIBUpdate";

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
    skinRenderArray: SkinRender[];

    /**
     * @en Current SkinRender being used.
     * @zh 当前使用的 SkinRender。
     */
    currentRender: SkinRender;
    /** @internal */
    _skinIndex: number = 0;
    /** @internal */
    _curAnimationName: string;

    // /**
    //  * Material
    //  */
    // material: IOptimizeMaterial;
    
    _dynamicMap:Map<number,Mesh2D>;

    /**
     * @en Map of ESpineRenderType to TGeo objects.
     * @zh ESpineRenderType 到 TGeo 对象的映射。
     */
    geoMap: Map<ESpineRenderType, TGeo>;

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

    dynamicInfo:SketonDynamicInfo;

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
            this.skinRenderArray.push(new SkinRender(this, value));
        })

        let animators = spineOptimize.animators;
        for (let i = 0, n = animators.length; i < n; i++) {
            let animator = animators[i];
            this.animatorMap.set(animator.name, new AnimationRenderProxy(animator));
        }
        this.currentRender = this.skinRenderArray[this._skinIndex];//default
        this.dynamicInfo = spineOptimize.dynamicInfo;
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
            mesh = SpineMeshUtils.createMeshDynamic(vertexDeclaration, 
                this.dynamicInfo.maxVertexCount , this.dynamicInfo.maxIndexCount , 
                this.dynamicInfo.indexFormat , this.dynamicInfo.indexByteCount );
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
                currentRender.renderUpdate(currentSKin , -1);
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
    change(skinRender: SkinRender, currentAnimation: AnimationRenderProxy): void;
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
    skinRender: SkinRender;
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
    change(currentRender: SkinRender, currentAnimation: AnimationRenderProxy) {
        this.skinRender = currentRender;
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
        this.currentAnimation.render(this.bones, this.slots, this.skinRender, curTime, boneMat );//TODO bone
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
    change(currentRender: SkinRender, currentAnimation: AnimationRenderProxy) {
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
    skinRender: SkinRender;
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
    change(currentRender: SkinRender, currentAnimation: AnimationRenderProxy) {
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


/**
 * @en SkinRender used for rendering Spine skins.
 * @zh SkinRender 类用于渲染 Spine 皮肤。
 */
class SkinRender implements IVBIBUpdate {

    /**
     * @en The owner of this SkinRender.
     * @zh 此 SkinRender 的所有者。
     */
    owner: SpineOptimizeRender;
    /**
     * @en The name of the skin.
     * @zh 皮肤的名称。
     */
    name: string;
    // protected vb: IVertexBuffer;
    // protected ib: IIndexBuffer;
    // elements: [Material, number, number][];
    private hasNormalRender: boolean;
    
    /** @internal */
    _renderer: ISpineRender;

    // elementsMap: Map<number, ElementCreator>;

    /**
     * @en The Spine template.
     * @zh Spine 模板。
     */
    templet: SpineTemplet;

    /**
     * @en The type of skin attachment.
     * @zh 皮肤附件的类型。
     */
    skinAttachType: ESpineRenderType;
    /**
     * @en The material for rendering.
     * @zh 用于渲染的材质。
     */
    material: Material;
    /**
     * @en Array of current materials.
     * @zh 当前材质数组。
     */
    currentMaterials: Material[] = [];

    cacheMaterials: Material[][] = [];

    vChanges:IVBChange[] = [];

    /**
     * @en Create a new instance of SkinRender.
     * @param owner The SpineOptimizeRender that owns this SkinRender.
     * @param skinAttach The SkinAttach data.
     * @zh 创建 SkinRender 的新实例。
     * @param owner 拥有此 SkinRender 的 SpineOptimizeRender。
     * @param skinAttach SkinAttach 数据。
     */
    constructor(owner: SpineOptimizeRender, skinAttach: SkinAttach) {
        this.owner = owner;
        this.name = skinAttach.name;
        // this.elements = [];
        this.hasNormalRender = skinAttach.hasNormalRender;
        // this.elementsMap = new Map();
        this.skinAttachType = skinAttach.type;
    }

    /**
     * @en Get material by name and blend mode.
     * @param name The name of the texture.
     * @param blendMode The blend mode.
     * @zh 通过名称和混合模式获取材质。
     * @param name 纹理的名称。
     * @param blendMode 混合模式。
     */
    getMaterialByName(name: string, blendMode: number): Material {
        return this.templet.getMaterial(this.templet.getTexture(name), blendMode);
    }

    renderUpdate( skindata:SkinAniRenderData, frame:number){
        let frameData = skindata.getFrameData(frame);
        let mulitRenderData = frameData.mulitRenderData
        let mats:Material[] = this.cacheMaterials[mulitRenderData.id];

        let needUpdate = false;
        if (!mats) {
            mats = this.cacheMaterials[mulitRenderData.id] = [];
            let renderData = mulitRenderData.renderData;
            for (let i = 0, n = renderData.length; i < n; i++) {
                let data = renderData[i];
                let mat = this.getMaterialByName(data.textureName, data.blendMode);
                mats.push(mat);
            }
        }

        let renderNode = this.owner._nodeOwner;
        if (this.currentMaterials != mats) {
            renderNode._updateMaterials(mats);
            needUpdate = true;
        }
        this.currentMaterials = mats;

        let mesh : Mesh2D ;
        if (skindata.isDynamic) {
            let mesh = this.owner.getDynamicMesh(skindata.vb.vertexDeclaration);
            
            if (this.vChanges.length || frameData.vChanges || frame < 0) {
                let needUpload = frame <= 0;
                let currentChanges = this.vChanges;
                let frameChanges = frameData.vChanges;
                
                if (frameChanges) {
                    for (let i = 0 , n = frameChanges.length; i < n; i++) 
                        currentChanges.indexOf(frameChanges[i]) == -1 && currentChanges.push(frameChanges[i]);
                }

                for (let i = currentChanges.length - 1; i > -1; i--) {
                    let change = currentChanges[i];
                    if ( change.startFrame <= frame 
                        && change.endFrame >= frame 
                        || frame <= 0) {
                            if(change.updateVB(skindata.vb ,this.owner.slots)){
                                needUpload = true;
                            }else
                                currentChanges.splice(i , 1);
                    }else{
                        currentChanges.splice(i , 1);
                    }
                }

                if (needUpload) {
                    this.uploadVertexBuffer( skindata.vb , mesh);
                }
            }

            
            if (frameData.ib || frame < 0) {
                this.uploadIndexBuffer( frameData.ib , mesh)
            }
            needUpdate = SpineMeshUtils.updateSpineSubMesh(mesh , frameData.mulitRenderData , this.owner.dynamicInfo);
            needUpdate = !renderNode._onMeshChange(mesh , needUpdate);
        }else{
            mesh = skindata.getMesh();
            needUpdate = !renderNode._onMeshChange(mesh);
        }

        if (needUpdate) renderNode._updateRenderElements();
            
    }

    uploadIndexBuffer( indexData:Uint16Array|Uint8Array|Uint32Array , mesh:Mesh2D){
        let indexbuffer = mesh._indexBuffer;
        indexbuffer._setIndexData(indexData , 0);
    }


    uploadVertexBuffer( vbCreator : VBCreator , mesh:Mesh2D){
        let vertexBuffer = mesh.vertexBuffers[0];
        // let float32 = new Float32Array(vbCreator.vb , vbCreator.vbLength);
        let vblen = vbCreator.vbLength * 4;
        vertexBuffer.setDataLength(vblen);
        vertexBuffer.setData(vbCreator.vb.buffer, 0, 0, vblen);
    }

    // updateVB(vertexArray: Float32Array, vbLength: number) {
    //     let vb = this.vb;
    //     let vblen = vbLength * 4;
    //     vb.setDataLength(vblen);
    //     vb.setData(vertexArray.buffer, 0, 0, vblen);
    // }

    // updateIB(indexArray: Uint16Array, ibLength: number, mutiRenderData: MultiRenderData, isMuti: boolean) {
    //     let ib = this.ib;
    //     let iblen = ibLength * 2;
    //     ib._setIndexDataLength(iblen)
    //     ib._setIndexData(new Uint16Array(indexArray.buffer, 0, iblen / 2), 0);
    //     this.geo.clearRenderParams();
    //     this.geo.setDrawElemenParams(iblen / 2, 0);
    //     this.ib.indexCount = iblen / 2;
    //     if (isMuti) {
    //         let elementsCreator = this.elementsMap.get(mutiRenderData.id);
    //         if (!elementsCreator) {
    //             elementsCreator = new ElementCreator(mutiRenderData, this);
    //             this.elementsMap.set(mutiRenderData.id, elementsCreator);
    //         }
    //         elementsCreator.cloneTo(this.elements);
    //         this.currentMaterials = elementsCreator.currentMaterials;
    //         this.owner._nodeOwner.updateElements(this.geo, this.elements);
    //     }
    //     else {
    //         let currentData = mutiRenderData.currentData;
    //         if(!currentData) return;
    //         let material=currentData.material;
    //         if (!material) {
    //             material=currentData.material = this.getMaterialByName(currentData.textureName, currentData.blendMode);
    //         }
    //         if(material!=this.material){
    //             this.owner._nodeOwner.clear();
    //             this.owner._nodeOwner.drawGeo(this.geo, material);
    //         }
    //     }
    // }

    init(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: Spine2DRenderNode) {
        this.templet = templet;
        if (this.hasNormalRender) {
            this._renderer = SpineAdapter.createNormalRender(templet, false);
        }
        if (templet.mainTexture) {
            this.material = templet.getMaterial(templet.mainTexture, templet.mainBlendMode);
        }
    }

    /**
     * @en Render the skin at a specific time.
     * @param time The time to render at.
     * @zh 在特定时间渲染皮肤。
     * @param time 要渲染的时间。
     */
    render(time: number) {

    }
}

// class ElementCreator {
//     elements: [Material, number, number][];
//     currentMaterials: Material[];

//     constructor(mutiRenderData: MultiRenderData, skinData: SkinRender) {
//         let elements: [Material, number, number][] = this.elements = [];
//         let currentMaterials: Material[] = this.currentMaterials = [];
//         let renderData = mutiRenderData.renderData;
//         for (let i = 0, n = renderData.length; i < n; i++) {
//             let data = renderData[i];
//             let mat = skinData.getMaterialByName(data.textureName, data.blendMode);
//             if (currentMaterials.indexOf(mat) == -1) {
//                 this.currentMaterials.push(mat);
//             }
//             elements[i] = [mat, data.length, data.offset * 2];
//         }
//     }

//     cloneTo(source: [Material, number, number][]) {
//         let target = this.elements;
//         for (let i = 0, n = target.length; i < n; i++) {
//             source[i] = target[i];
//         }
//         source.length = target.length;
//     }
// }

type TGeo = {
    geo: IRenderGeometryElement;
    vb: IVertexBuffer;
    ib: IIndexBuffer;
}