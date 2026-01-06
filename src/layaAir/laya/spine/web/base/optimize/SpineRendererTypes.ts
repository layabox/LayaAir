import { Vector2 } from "../../../../maths/Vector2";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { ShaderData } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Texture2D } from "../../../../resource/Texture2D";
import { SpineShaderInit } from "../../../shader/SpineShaderInit";
import { SpineConst } from "../../../SpineConst";
import { IRender, ISpineNormalUpdater } from "../../IWebSpine";
import { BaseOptimizeRender } from "./BaseOptimizeRender";
import { SpineRenderUpdater } from "./SpineRenderUpdater";

/**
 * @en Base class for all Spine renderers.
 * @zh 所有 Spine 渲染器的基础类。
 */
export abstract class SpineBaseRenderer implements IRender {
    /** @internal */
    protected _shaderData: ShaderData;
    /** @internal */
    protected _skeleton: spine.Skeleton;
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
     * @en The current updater.
     * @zh 当前更新器
     */
    updater: SpineRenderUpdater | null;
    
    /**
     * @en Create a new instance of SpineBaseRenderer.
     * @param shaderData The shader data.
     * @zh 创建 SpineBaseRenderer 的新实例。
     * @param shaderData 着色器数据。
     */
    constructor(shaderData:ShaderData) {
        this._shaderData = shaderData
    }

    destroy() {
    }

    /**
     * @en Change the current skeleton.
     * @param skeleton The new skeleton to use.
     * @zh 更改当前骨骼。
     * @param skeleton 要使用的新骨骼。
     */
    bind( updater: SpineRenderUpdater, skeleton: spine.Skeleton): void {
        this.updater = updater;
        this._skeleton = skeleton;
        this.bones = skeleton.bones;
        this.slots = skeleton.slots;
    }

    /**
     * @en Abstract method to change the current render context.
     * @param context The render context containing skin and animation updaters.
     * @zh 更改当前渲染上下文的抽象方法。
     * @param context 包含皮肤和动画更新器的渲染上下文。
     */
    abstract change(): void;

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
    abstract render(curTime: number, offsetX?: number, offsetY?: number): void;

    /**
     * @en Called after render to update render elements if needed.
     * Subclasses can override this to handle render element updates.
     * @param optimizeRender The BaseOptimizeRender instance.
     * @zh 渲染后调用，用于更新渲染元素（如果需要）。
     * 子类可以重写此方法以处理渲染元素更新。
     * @param optimizeRender BaseOptimizeRender 实例。
     */
    abstract afterRender?(optimizeRender: BaseOptimizeRender): void;
}

/**
 * @en RigidBodySpineRenderer used for rigid body rendering of Spine animations.
 * @zh RigidBodySpineRenderer 类用于刚体渲染的 Spine 动画。
 */
export class RigidBodySpineRenderer extends SpineBaseRenderer {
    private _matrix_0 = new Vector3(1,0,0);
    private _matrix_1 = new Vector3(0,1,0);

    leave(): void {
        this._shaderData.removeDefine(SpineShaderInit.SPINE_RB);
    }

    change() {
        this._shaderData.addDefine(SpineShaderInit.SPINE_RB);
        this.updater.needUpdate = true;
        this._shaderData.setVector3(SpineShaderInit.BONEMAT_0, this._matrix_0);
        this._shaderData.setVector3(SpineShaderInit.BONEMAT_1, this._matrix_1);
    }

    render(curTime: number, offsetX: number = 0, offsetY: number = 0) {
        if (!this.updater) return;
        
        this.updater.renderWithOutMat(this.slots, curTime);
        
        let bone = this.bones[this.updater.skinAttach.rbBoneIndex];
        if (!bone) { 
            return
        } 

        let x = bone.worldX + offsetX;
        let y = bone.worldY + offsetY;
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
       
        this._shaderData.setVector3(SpineShaderInit.BONEMAT_0, this._matrix_0);
        this._shaderData.setVector3(SpineShaderInit.BONEMAT_1, this._matrix_1);
    }

    /**
     * @en Called after render to update render elements.
     * @param optimizeRender The BaseOptimizeRender instance.
     * @zh 渲染后调用，更新渲染元素。
     * @param optimizeRender BaseOptimizeRender 实例。
     */
    afterRender(optimizeRender: BaseOptimizeRender): void {
        if (this.updater.needUpdate) {
            optimizeRender._updateRenderElements(this.updater.getSubMeshes(), this.updater.currentMaterials);
            this.updater.needUpdate = false;
        }
    }
}

/**
 * @en OptimizedSpineRenderer used for optimized rendering of Spine animations.
 * @zh OptimizedSpineRenderer 类用于优化 Spine 动画的渲染。
 */
export class OptimizedSpineRenderer extends SpineBaseRenderer {

    private _boneMat: Float32Array;

    constructor(shaderData: ShaderData) {
        super(shaderData);
        this._boneMat = new Float32Array(SpineConst.MAX_BONES * 8);
    }

    /**
     * @en Change the current render context.
     * @param context The render context containing skin and animation updaters.
     * @zh 更改当前渲染上下文。
     * @param context 包含皮肤和动画更新器的渲染上下文。
     */
    change() {
        this._shaderData.addDefine(SpineShaderInit.SPINE_FAST);
        this.updater.needUpdate = true;
    }

    /**
     * @en Called when leaving the current render state.
     * @zh 离开当前渲染状态时调用。
     */
    leave(): void {
        this._shaderData.removeDefine(SpineShaderInit.SPINE_FAST);
    }

    /**
     * @en Render the current animation at a specific time.
     * @param curTime The current time for rendering.
     * @param offsetX X轴偏移。
     * @param offsetY Y轴偏移。
     * @zh 在特定时间渲染当前动画。
     * @param curTime 渲染的当前时间。
     * @param offsetX X轴偏移。
     * @param offsetY Y轴偏移。
     */
    render(curTime: number , offsetX: number = 0, offsetY: number = 0) {
        this.updater.renderWithMat(this.bones, this.slots, curTime, this._boneMat, offsetX, offsetY);
        this._shaderData.setBuffer(SpineShaderInit.BONEMAT, this._boneMat);
    }

    /**
     * @en Called after render to update render elements.
     * @param optimizeRender The BaseOptimizeRender instance.
     * @zh 渲染后调用，更新渲染元素。
     * @param optimizeRender BaseOptimizeRender 实例。
     */
    afterRender(optimizeRender: BaseOptimizeRender): void {
        if (this.updater.needUpdate) {
            optimizeRender._updateRenderElements(this.updater.getSubMeshes(), this.updater.currentMaterials);
            this.updater.needUpdate = false;
        }
    }
}

/**
 * @en StandardSpineRenderer used for standard rendering of Spine animations (optimize mode).
 * @zh StandardSpineRenderer 类用于优化模式下的标准 Spine 动画渲染。
 */
export class StandardSpineRenderer extends SpineBaseRenderer {

    normalUpdater: ISpineNormalUpdater;

    /** @ignore @blueprintIgnore */
    constructor(shaderData: ShaderData) {
        super(shaderData);
    }

    /**
     * @en Called when leaving the current render state.
     * @zh 离开当前渲染状态时调用。
     */
    leave(): void {
        this._shaderData.removeDefine(SpineShaderInit.SPINE_COLOR2);
    }

    /**
     * @en Change the current render context.
     * @param context The render context containing skin and animation updaters.
     * @zh 更改当前渲染上下文。
     * @param context 包含皮肤和动画更新器的渲染上下文。
     */
    change() {
        this._shaderData.addDefine(SpineShaderInit.SPINE_COLOR2);
        this._skeleton.setToSetupPose();
        this.normalUpdater.needUpdate = true;
    }

    /**
     * @en Render the current animation at a specific time.
     * @param curTime The current time for rendering.
     * @zh 在特定时间渲染当前动画。
     * @param curTime 渲染的当前时间。
     */
    render(curTime: number , offsetX: number = 0, offsetY: number = 0) {
        this.normalUpdater.renderUpdate(this._skeleton, this.updater, -1, -1 , offsetX , offsetY);
    }

    /**
     * @en Called after render to update render elements.
     * @param optimizeRender The BaseOptimizeRender instance.
     * @zh 渲染后调用，更新渲染元素。
     * @param optimizeRender BaseOptimizeRender 实例。
     */
    afterRender(optimizeRender: BaseOptimizeRender): void {
        if (this.normalUpdater.needUpdate) {
            optimizeRender._updateRenderElements(this.normalUpdater.subMeshes, this.normalUpdater.materials);
            this.normalUpdater.needUpdate = false;
        }
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
        this._shaderData.setTexture(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE, value);
        value._addReference();
        this._shaderData.setNumber(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE, this._simpleAnimatorTextureSize);
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
        this._shaderData.removeDefine(SpineShaderInit.SPINE_SIMPLE);
        this._shaderData.removeDefine(SpineShaderInit.SPINE_GPU_INSTANCE);
    }

    /**
     * @en Change the current render context.
     * @param context The render context containing skin and animation updaters.
     * @zh 更改当前渲染上下文。
     * @param context 包含皮肤和动画更新器的渲染上下文。
     */
    change() {
        this._shaderData.addDefine(SpineShaderInit.SPINE_SIMPLE);
        this._simpleAnimatorOffset.x = this.aniOffsetMap[this.updater.animationName];
        this.updater.needUpdate = true;
        // if (this.updater.currentSKin && this.updater.currentSKin.canInstance) {
            // this._struct.renderType = BaseRender2DType.spineSimple;
            // this._shaderData.addDefine(SpineShaderInit.SPINE_GPU_INSTANCE);
        // }
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
    render(curTime: number , offsetX: number = 0, offsetY: number = 0) {
        this.updater.renderWithOutMat(this.slots, curTime);
        this._simpleAnimatorOffset.y = curTime / this.step;
        this._computeAnimatorParamsData();
        this._shaderData.setVector(SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS, this._simpleAnimatorParams);
        this.updater.needUpdate = true;
    }

    /**
     * @en Called after render to update render elements.
     * @param optimizeRender The BaseOptimizeRender instance.
     * @zh 渲染后调用，更新渲染元素。
     * @param optimizeRender BaseOptimizeRender 实例。
     */
    afterRender(optimizeRender: BaseOptimizeRender): void {
        // 从 updater 获取数据并更新
        optimizeRender._updateRenderElements(this.updater.getSubMeshes(), this.updater.currentMaterials);
    }
}
