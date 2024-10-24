import { BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { Color } from "../../maths/Color";
import { SpineTemplet } from "../SpineTemplet";
import { TSpineBakeData } from "./SketonOptimise";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";

/**
 * @en Empty implementation of the renderer for optimizing Spine animations.
 * @zh 空实现的渲染器，用于优化 Spine 动画的渲染。
 */
export class SpineEmptyRender implements ISpineOptimizeRender{
    getSpineColor(): Color {
       return Color.WHITE;
    }
    /**
     * @en Changes the skeleton.
     * @param skeleton The new spine skeleton.
     * @zh 更改骨骼。
     * @param skeleton 新的 Spine 骨骼。
     */
    changeSkeleton(skeleton: spine.Skeleton): void {
        //throw new NotImplementedError();
    }
    /**
     * @en Singleton instance of SpineEmptyRender.
     * @zh SpineEmptyRender 的单例实例。
     */
    static instance:SpineEmptyRender=new SpineEmptyRender();
    /**
     * @en Initializes the renderer.
     * @param skeleton The spine skeleton.
     * @param templet The spine templet.
     * @param renderNode The base render node.
     * @param state The spine animation state.
     * @zh 初始化渲染器。
     * @param skeleton Spine 骨骼。
     * @param templet Spine 模板。
     * @param renderNode 基础渲染节点。
     * @param state Spine 动画状态。
     */
    init(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: BaseRenderNode2D, state: spine.AnimationState): void {
        //throw new NotImplementedError();
    }
    /**
     * @en Plays the specified animation.
     * @param animationName The name of the animation to play.
     * @zh 播放指定的动画。
     * @param animationName 要播放的动画名称。
     */
    play(animationName: string): void {
        //throw new NotImplementedError();
    }
    /**
     * @en Renders the spine animation.
     * @param time The current time for rendering.
     * @zh 渲染 Spine 动画。
     * @param time 当前渲染时间。
     */
    render(time: number): void {
        //throw new NotImplementedError();
    }
    /**
     * @en Sets the skin index.
     * @param index The index of the skin to set.
     * @zh 设置皮肤索引。
     * @param index 要设置的皮肤索引。
     */
    setSkinIndex(index: number): void {
        //throw new NotImplementedError();
    }
    /**
     * @en Initializes bake data.
     * @param obj The spine bake data.
     * @zh 初始化烘焙数据。
     * @param obj Spine 烘焙数据。
     */
    initBake(obj: TSpineBakeData): void {
        //throw new NotImplementedError();
    }
    /**
     * @en Destroys the renderer.
     * @zh 销毁渲染器。
     */
    destroy(): void {
        //throw new NotImplementedError();
    }
    
}