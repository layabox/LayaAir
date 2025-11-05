import { BaseRender2DType } from "../../display/SpriteConst";
import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";
import { Texture2D } from "../../resource/Texture2D";
import { ISpineRender } from "../interface/ISpineRender";
import { SpineShaderInit } from "../shader/SpineShaderInit";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineTemplet } from "../SpineTemplet";
import { AnimationRenderProxy } from "../animation/AnimationRenderProxy";
import { SkinRenderUpdate } from "./SkinRenderUpdate";

export interface IRender {
    changeSkeleton(skeleton: spine.Skeleton): void;
    change(skinRender: SkinRenderUpdate, currentAnimation: AnimationRenderProxy): void;
    leave(): void;
    render(curTime: number, boneMat: Float32Array): void;
}

/**
 * @en Base class for all Spine renderers.
 * @zh 所有 Spine 渲染器的基础类。
 */
export abstract class SpineBaseRenderer implements IRender {
    /** @internal */
    protected _renderNode: Spine2DRenderNode;
    /** @internal */
    protected _skeleton: spine.Skeleton;
    /** @internal */
    protected _templet: SpineTemplet;
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
     * @en The current skin updater.
     * @zh 当前皮肤更新器
     */
    skinUpdate: SkinRenderUpdate;
    
    /**
     * @en The current animation render proxy.
     * @zh 当前动画渲染代理。
     */
    currentAnimation: AnimationRenderProxy;

    /**
     * @en Create a new instance of SpineBaseRenderer.
     * @param renderNode The Spine2D render node.
     * @zh 创建 SpineBaseRenderer 的新实例。
     * @param renderNode Spine2D 渲染节点。
     */
    constructor(renderNode: Spine2DRenderNode) {
        this._renderNode = renderNode;
        this.changeSkeleton(renderNode.getSkeleton());
        this._templet = renderNode.templet;
    }

    /**
     * @en Change the current skeleton.
     * @param skeleton The new skeleton to use.
     * @zh 更改当前骨骼。
     * @param skeleton 要使用的新骨骼。
     */
    changeSkeleton(skeleton: spine.Skeleton): void {
        this._skeleton = skeleton;
        this.bones = skeleton.bones;
        this.slots = skeleton.slots;
    }

    /**
     * @en Abstract method to change the current skin renderer and animation.
     * @param skinRender The new skin renderer to use.
     * @param currentAnimation The new animation render proxy to use.
     * @zh 更改当前皮肤渲染器和动画的抽象方法。
     * @param skinRender 要使用的新皮肤渲染器。
     * @param currentAnimation 要使用的新动画渲染代理。
     */
    abstract change(skinRender: SkinRenderUpdate, currentAnimation: AnimationRenderProxy): void;

    /**
     * @en Abstract method called when leaving the current render state.
     * @zh 离开当前渲染状态时调用的抽象方法。
     */
    abstract leave(): void;

    /**
     * @en Abstract method to render the current animation at a specific time.
     * @param curTime The current time for rendering.
     * @param boneMat The bone matrix for rendering.
     * @zh 在特定时间渲染当前动画的抽象方法。
     * @param curTime 渲染的当前时间。
     * @param boneMat 用于渲染的骨骼矩阵。
     */
    abstract render(curTime: number, boneMat: Float32Array): void;
}

/**
 * @en RigidBodySpineRenderer used for rigid body rendering of Spine animations.
 * @zh RigidBodySpineRenderer 类用于刚体渲染的 Spine 动画。
 */
export class RigidBodySpineRenderer extends SpineBaseRenderer {
    private _matrix_0 = new Vector3(1,0,0);
    private _matrix_1 = new Vector3(0,1,0);

    leave(): void {
    }

    change(currentRender: SkinRenderUpdate, currentAnimation: AnimationRenderProxy) {
        this.skinUpdate = currentRender;
        this.currentAnimation = currentAnimation;
        this._renderNode._spriteShaderData.setVector3(SpineShaderInit.BONEMAT_0, this._matrix_0);
        this._renderNode._spriteShaderData.setVector3(SpineShaderInit.BONEMAT_1, this._matrix_1);
    }

    render(curTime: number, boneMat: Float32Array) {
        this.currentAnimation.renderWithOutMat(this.slots, this.skinUpdate, curTime);

        let bone = this.bones[this.skinUpdate.rbBoneIndex];
        if (!bone) { 
            return
        } 

        let x = bone.worldX - this._skeleton.x + this._templet.offsetX;
        let y = bone.worldY - this._skeleton.y + this._templet.offsetY;
        if (bone.a === this._matrix_0.x
            && bone.b === this._matrix_0.y
            && bone.c === this._matrix_1.x
            && bone.d === this._matrix_1.y
            && x === this._matrix_0.z
            && y === this._matrix_1.z) {
            return;
        }

        this._matrix_0.x = bone.a;
        this._matrix_0.y = bone.b;
        this._matrix_0.z = x;
        this._matrix_1.x = bone.c;
        this._matrix_1.y = bone.d;
        this._matrix_1.z = y;
       
        this._renderNode._spriteShaderData.setVector3(SpineShaderInit.BONEMAT_0, this._matrix_0);
        this._renderNode._spriteShaderData.setVector3(SpineShaderInit.BONEMAT_1, this._matrix_1);
    }
}

/**
 * @en OptimizedSpineRenderer used for optimized rendering of Spine animations.
 * @zh OptimizedSpineRenderer 类用于优化 Spine 动画的渲染。
 */
export class OptimizedSpineRenderer extends SpineBaseRenderer {
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
        let offsetX = -this._skeleton.x + this._templet.offsetX;
        let offsetY = -this._skeleton.y + this._templet.offsetY;
        this.currentAnimation.render(this.bones, this.slots, this.skinUpdate, curTime, boneMat, offsetX, offsetY);//TODO bone
        this._renderNode._spriteShaderData.setBuffer(SpineShaderInit.BONEMAT, boneMat);
    }
}

/**
 * @en StandardSpineRenderer used for standard rendering of Spine animations.
 * @zh StandardSpineRenderer 类用于标准的 Spine 动画渲染。
 */
export class StandardSpineRenderer extends SpineBaseRenderer {
    /** @internal */
    _renderer: ISpineRender;
    /**
     * @en Create a new instance of StandardSpineRenderer.
     * @param skeleton The Spine skeleton.
     * @param renderNode The Spine2D render node.
     * @zh 创建 StandardSpineRenderer 的一个新实例。
     * @param skeleton Spine 骨骼。
     * @param renderNode Spine2D 渲染节点。
     */
    constructor(renderNode: Spine2DRenderNode) {
        super(renderNode);
    }

    /**
     * @en Called when leaving the current render state.
     * @zh 离开当前渲染状态时调用。
     */
    leave(): void {
        this._renderNode._spriteShaderData.removeDefine(SpineShaderInit.SPINE_COLOR2);
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
        this._renderer = currentRender._renderer;
        this._renderNode._spriteShaderData.addDefine(SpineShaderInit.SPINE_COLOR2);
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
        this._renderer.draw(this._skeleton, this._renderNode, -1, -1);
        this._renderNode.owner._struct.renderElements = this._renderNode._renderElements;
    }

}

/**
 * @en BakedSpineRenderer used for baked Spine animation rendering.
 * @zh BakedSpineRenderer 类用于烘焙 Spine 动画的渲染。
 */
export class BakedSpineRenderer extends SpineBaseRenderer {
    
    /** @internal */
    private _simpleAnimatorParams: Vector4 = new Vector4();

    private _simpleAnimatorTextureSize: number;

    private _simpleAnimatorTexture: Texture2D;
    /** x simpleAnimation offset,y simpleFrameOffset*/
    private _simpleAnimatorOffset: Vector2 = new Vector2();
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

   
    /**
     * @en The time step for animation.
     * @zh 动画的时间步长。
     */
    step = 1 / 60;

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
        this.skinUpdate = currentRender;
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
        this.currentAnimation.renderWithOutMat(this.slots, this.skinUpdate, curTime);
        this._simpleAnimatorOffset.y = curTime / this.step;
        this._computeAnimatorParamsData();
        // let boneMat = this.currentAnimation.render(this.bones, this.slots, this.skinRender, curTime);//TODO bone
        // this.material.boneMat = boneMat;
        this._renderNode._spriteShaderData.setVector(SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS, this._simpleAnimatorParams);
    }
}
