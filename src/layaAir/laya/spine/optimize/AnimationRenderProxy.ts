import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { AnimationRender, SkinAniRenderData } from "./AnimationRender";
import { IVBIBUpdate } from "./interface/IVBIBUpdate";

/**
 * @en Animation rendering proxy class for managing animation state and rendering.
 * @zh 动画渲染代理类，用于管理动画状态和渲染。
 */
export class AnimationRenderProxy {
    /**
     * @en The animation state.
     * @zh 动画状态。
     */
    state: spine.AnimationState;
    /**
     * @en The current animation time.
     * @zh 当前动画时间。
     */
    currentTime: number;
    /**
     * @en The current frame index.
     * @zh 当前帧索引。
     */
    currentFrameIndex: number;
    /**
     * @en The animation renderer.
     * @zh 动画渲染器。
     */
    animator: AnimationRender;
    //vb: VBCreator;
    /**
     * @en The current skin animation render data.
     * @zh 当前皮肤动画渲染数据。
     */
    currentSKin: SkinAniRenderData;

    /**
     * @en Creates an instance of AnimationRenderProxy.
     * @param animator The animation renderer.
     * @zh 创建 AnimationRenderProxy 的实例。
     * @param animator 动画渲染器。
     */
    constructor(animator: AnimationRender) {
        this.animator = animator;
        // this.vb = animator.vb;
        this.reset();
    }
    /**
     * @en Sets the skin index.
     * @param value The skin index to set.
     * @zh 设置皮肤索引。
     * @param value 要设置的皮肤索引。
     */
    set skinIndex(value: number) {
        this.currentSKin = this.animator.skinDataArray[value];
    }

    /**
     * @en Gets the name of the animator.
     * @returns The name of the animator.
     * @zh 获取动画器的名称。
     * @returns 动画器的名称。
     */
    get name() {
        return this.animator.name;
    }

    /**
     * @en Resets the animation state.
     * @zh 重置动画状态。
     */
    reset() {
        this.currentTime = -1;
        this.currentFrameIndex = -1;
    }
    /**
     * @en Renders the animation without matrix transformation.
     * @param slots The slots to render.
     * @param updator The VB/IB updater.
     * @param curTime The current animation time.
     * @zh 不进行矩阵变换的动画渲染。
     * @param slots 要渲染的插槽。
     * @param updator VB/IB 更新器。
     * @param curTime 当前动画时间。
     */
    renderWithOutMat(slots: spine.Slot[], updator: IVBIBUpdate, curTime: number) {
        let beforeFrame = this.currentFrameIndex;
        let nowFrame = this.animator.getFrameIndex(curTime, beforeFrame);
        let currentSKin = this.currentSKin;
        // let vb = currentSKin.vb;
        // let vb = currentSKin.;
        // if (currentSKin.checkVBChange(slots)) {
        //     updator.updateVB(vb.vb, vb.vbLength);
        // }
        updator.renderUpdate(currentSKin , nowFrame);
        
        this.currentTime = curTime;
        this.currentFrameIndex = nowFrame;

        // if (nowFrame != beforeFrame) {
        //     //TODO
        // }
    }

    /**
     * @en Renders the animation with matrix transformation.
     * @param bones The bones to render.
     * @param slots The slots to render.
     * @param updator The VB/IB updater.
     * @param curTime The current animation time.
     * @param boneMat The bone matrix.
     * @zh 进行矩阵变换的动画渲染。
     * @param bones 要渲染的骨骼。
     * @param slots 要渲染的插槽。
     * @param updator VB/IB 更新器。
     * @param curTime 当前动画时间。
     * @param boneMat 骨骼矩阵。
     */
    render(bones: spine.Bone[], slots: spine.Slot[], updator: IVBIBUpdate, curTime: number, boneMat: Float32Array) {
        this.renderWithOutMat(slots, updator, curTime );
        this.currentSKin.updateBoneMat(curTime, this.animator, bones, this.state, boneMat);
    }
}
