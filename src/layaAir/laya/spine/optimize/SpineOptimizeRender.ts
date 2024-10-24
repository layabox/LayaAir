import { BaseRender2DType, BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { IIndexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { Sprite } from "../../display/Sprite";
import { LayaGL } from "../../layagl/LayaGL";
import { Color } from "../../maths/Color";
import { Vector2 } from "../../maths/Vector2";
import { Vector4 } from "../../maths/Vector4";
import { Material } from "../../resource/Material";
import { Texture2D } from "../../resource/Texture2D";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineAdapter } from "../SpineAdapter";
import { ESpineRenderType } from "../SpineSkeleton";
import { SpineTemplet } from "../SpineTemplet";
import { ISpineRender } from "../interface/ISpineRender";
import { SpineShaderInit } from "../material/SpineShaderInit";
import { AnimationRenderProxy } from "./AnimationRenderProxy";
import { MultiRenderData } from "./MultiRenderData";
import { SketonOptimise, SkinAttach, TSpineBakeData } from "./SketonOptimise";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";
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

    /**
     * @en Create a new SpineOptimizeRender instance.
     * @param spineOptimize SketonOptimise object containing optimization data.
     * @zh 创建 SpineOptimizeRender 的新实例。
     * @param spineOptimize 包含优化数据的 SketonOptimise 对象。
     */
    constructor(spineOptimize: SketonOptimise) {
        this.renderProxyMap = new Map();
        this.geoMap = new Map();
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
    }
    getSpineColor(): Color {
        return this.spineColor;
    }

    /**
     * @en Destroy the SpineOptimizeRender instance.
     * @zh 销毁 SpineOptimizeRender 实例。
     */
    destroy(): void {
        //throw new NotImplementedError();
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
        //throw new NotImplementedError();
    }

    /**
     * @en Initialize render for a specific spine render type.
     * @param type The spine render type to initialize.
     * @zh 为特定的 spine 渲染类型初始化渲染。
     * @param type 要初始化的 spine 渲染类型。
     */
    initRender(type: ESpineRenderType) {
        //buffers .pos .uv .color vbs ib

        let geoResult = this.geoMap.get(type);
        if (!geoResult) {
            let geo = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            let mesh = LayaGL.renderDeviceFactory.createBufferState();
            geo.bufferState = mesh;
            let vb = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
            vb.vertexDeclaration = type == ESpineRenderType.rigidBody ? SpineShaderInit.SpineRBVertexDeclaration : SpineShaderInit.SpineFastVertexDeclaration;
            let ib = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);

            mesh.applyState([vb], ib);
            geo.indexFormat = IndexFormat.UInt16;
            // geo.instanceCount = 
            geoResult = { geo, vb, ib };
            this.geoMap.set(type, geoResult);
        }
        return geoResult;
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
        this.spineColor = new Color(scolor.r , scolor.g, scolor.b , scolor.a);
        let color = new Color(scolor.r, scolor.g, scolor.b , scolor.a * (this._nodeOwner.owner as Sprite).alpha);
        renderNode._spriteShaderData.setColor(SpineShaderInit.Color, color);
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
            if (currentRender.vertexBones > 4) {
                console.warn(`Current skin: ${currentRender.name}, Max number of bones influencing a vertex: ${currentRender.vertexBones}.`);
            }
            
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
            if (oldSkinData != currentSKin) {
                currentRender.updateVB(currentSKin.vb.vb, currentSKin.vb.vbLength);
            }
            //currentAnimation.
            // old.animator.mutiRenderAble
            let mutiRenderAble = currentSKin.mutiRenderAble;
            if (this._isRender) {
                if (mutiRenderAble != oldSkinData.mutiRenderAble) {
                    this._clear();
                }
            }
            if (!this._isRender) {
                if (mutiRenderAble) {
                    //this._nodeOwner.drawGeos(currentRender.geo, currentRender.elements);
                    this.renderProxytype = ERenderProxyType.RenderOptimize;
                }
                else {
                    // currentRender.material && this._nodeOwner.drawGeo(currentRender.geo, currentRender.material , 0 ,0);
                    this.renderProxytype = ERenderProxyType.RenderOptimize;
                }
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
        this.currentAnimation.render(this.bones, this.slots, this.skinRender, curTime, boneMat);//TODO bone
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
        this._renerer = currentRender._renerer;
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
        this.currentAnimation.renderWithOutMat(this.slots, this.skinRender, curTime);
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
    /**
     * @en The geometry for rendering.
     * @zh 用于渲染的几何体。
     */
    geo: IRenderGeometryElement;

    protected vb: IVertexBuffer;
    protected ib: IIndexBuffer;
    /**
     * @en Array of rendering elements.
     * @zh 渲染元素数组。
     */
    elements: [Material, number, number][];
    private hasNormalRender: boolean;
    /** @internal */
    _renerer: ISpineRender;

    /**
     * @en Map of element creators.
     * @zh 元素创建器的映射。
     */
    elementsMap: Map<number, ElementCreator>;

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

    /**
     * @en The number of bones that affect a vertex.
     * @zh 影响一个顶点的最大骨骼数。
     */
    vertexBones:number = 0;

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
        this.elements = [];
        this.vertexBones = skinAttach.vertexBones;
        this.hasNormalRender = skinAttach.hasNormalRender;
        this.elementsMap = new Map();
        this.skinAttachType = skinAttach.type;
        // if (skinAttach.type == ERenderType.boneGPU) {
        //     this.materialConstructor = SpineFastMaterial;
        // }
        // else if (skinAttach.type == ERenderType.rigidBody) {
        //     this.materialConstructor = SpineRBMaterial;
        // }
        // else {
        //     this.materialConstructor = SpineFastMaterial;
        // }
        let geoResult = owner.initRender(skinAttach.type);
        this.geo = geoResult.geo;
        this.vb = geoResult.vb;
        this.ib = geoResult.ib;
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



    /**
     * @en Update the vertex buffer.
     * @param vertexArray The new vertex data.
     * @param vbLength The length of the vertex data.
     * @zh 更新顶点缓冲区。
     * @param vertexArray 新的顶点数据。
     * @param vbLength 顶点数据的长度。
     */
    updateVB(vertexArray: Float32Array, vbLength: number) {
        let vb = this.vb;
        let vblen = vbLength * 4;
        vb.setDataLength(vblen);
        vb.setData(vertexArray.buffer, 0, 0, vblen);
    }

    /**
     * @en Update the index buffer.
     * @param indexArray The new index data.
     * @param ibLength The length of the index data.
     * @param mutiRenderData Multi-render data.
     * @param isMuti Indicates if it's multi-rendering.
     * @zh 更新索引缓冲区。
     * @param indexArray 新的索引数据。
     * @param ibLength 索引数据的长度。
     * @param mutiRenderData 多重渲染数据。
     * @param isMuti 指示是否为多重渲染。
     */
    updateIB(indexArray: Uint16Array, ibLength: number, mutiRenderData: MultiRenderData, isMuti: boolean) {
        let ib = this.ib;
        ib._setIndexDataLength(ibLength * 2)
        ib._setIndexData(new Uint16Array(indexArray.buffer, 0, ibLength), 0);
        ib.indexCount = ibLength;
        
        if (isMuti) {
            let elementsCreator = this.elementsMap.get(mutiRenderData.id);
            if (!elementsCreator) {
                elementsCreator = new ElementCreator(mutiRenderData, this);
                this.elementsMap.set(mutiRenderData.id, elementsCreator);
            }
            elementsCreator.cloneTo(this.elements);
            this.currentMaterials = elementsCreator.currentMaterials;
            this.owner._nodeOwner.updateElements(this.geo, this.elements);
        }
        else {
            let currentData = mutiRenderData.currentData;
            if (!currentData) return;
            let material = currentData.material;
            if (!material) {
                material = currentData.material = this.getMaterialByName(currentData.textureName, currentData.blendMode);
            }
            if (material != this.material) {
                this.owner._nodeOwner.clear();
                this.owner._nodeOwner.drawGeo(this.geo, material , ibLength ,  0);
            }
        }
    }
    /**
     * @en Initialize the SkinRender.
     * @param skeleton The Spine skeleton.
     * @param templet The Spine template.
     * @param renderNode The Spine2D render node.
     * @zh 初始化 SkinRender。
     * @param skeleton Spine 骨骼。
     * @param templet Spine 模板。
     * @param renderNode Spine2D 渲染节点。
     */
    init(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: Spine2DRenderNode) {
        this.templet = templet;
        if (this.hasNormalRender) {
            this._renerer = SpineAdapter.createNormalRender(templet, false);
        }
        // if (templet.mainTexture) {
        //     this.material = templet.getMaterial(templet.mainTexture, templet.mainBlendMode);
        // }
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

/**
 * @en ElementCreator creates and manages rendering elements.
 * @zh ElementCreator 创建和管理渲染元素。
 */
class ElementCreator {
    /**
     * @en Array of rendering elements.
     * @zh 渲染元素数组。
     */
    elements: [Material, number, number][];
    /**
     * @en Array of current materials.
     * @zh 当前材质数组。
     */
    currentMaterials: Material[];

    /**
     * @en Create a new instance of ElementCreator.
     * @param mutiRenderData Multi-render data.
     * @param skinData The SkinRender data.
     * @zh 创建 ElementCreator 的新实例。
     * @param mutiRenderData 多重渲染数据。
     * @param skinData SkinRender 数据。
     */
    constructor(mutiRenderData: MultiRenderData, skinData: SkinRender) {
        let elements: [Material, number, number][] = this.elements = [];
        let currentMaterials: Material[] = this.currentMaterials = [];
        let renderData = mutiRenderData.renderData;
        for (let i = 0, n = renderData.length; i < n; i++) {
            let data = renderData[i];
            let mat = skinData.getMaterialByName(data.textureName, data.blendMode);
            if (currentMaterials.indexOf(mat) == -1) {
                this.currentMaterials.push(mat);
            }
            elements[i] = [mat, data.length, data.offset * 2];
        }
    }

    /**
     * @en Clone the elements to a source array.
     * @param source The source array to clone to.
     * @zh 将元素克隆到源数组。
     * @param source 要克隆到的源数组。
     */
    cloneTo(source: [Material, number, number][]) {
        let target = this.elements;
        for (let i = 0, n = target.length; i < n; i++) {
            source[i] = target[i];
        }
        source.length = target.length;
    }
}

type TGeo = {
    geo: IRenderGeometryElement;
    vb: IVertexBuffer;
    ib: IIndexBuffer;
}