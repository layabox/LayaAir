import { Sprite } from "../../display/Sprite";
import { Color } from "../../maths/Color";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineAdapter } from "../SpineAdapter";
import { SpineTemplet } from "../SpineTemplet";
import { ISpineRender } from "../interface/ISpineRender";
import { SpineShaderInit } from "../material/SpineShaderInit";
import { TSpineBakeData } from "./SketonOptimise";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";

/**
 * @en Class for normal Spine rendering implementation.
 * @zh 普通 Spine 渲染实现类。
 */
export class SpineNormalRender implements ISpineOptimizeRender {
    getSpineColor(): Color {
        return this._spineColor;
    }
    /**
     * @en Destroys the renderer.
     * @zh 销毁渲染器。
     */
    destroy(): void {
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
    /** @internal */
    _owner: Spine2DRenderNode;
    /** @ineternal */
    _renerer: ISpineRender;
    /** @internal */
    _skeleton: spine.Skeleton;
    /**@internal */
    _spineColor: Color

    /**
     * @en Initializes the renderer.
     * @param skeleton The spine skeleton.
     * @param templet The spine templet.
     * @param renderNode The Spine2DRenderNode.
     * @param state The spine animation state.
     * @zh 初始化渲染器。
     * @param skeleton Spine 骨骼。
     * @param templet Spine 模板。
     * @param renderNode Spine2DRenderNode。
     * @param state Spine 动画状态。
     */
    init(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: Spine2DRenderNode, state: spine.AnimationState): void {
        this._renerer = SpineAdapter.createNormalRender(templet, false);
        this._skeleton = skeleton;
        this._owner = renderNode;
        let scolor = skeleton.color;
        this._spineColor = new Color(scolor.r, scolor.g, scolor.b, scolor.a);
        let color = new Color(scolor.r, scolor.g, scolor.b, scolor.a * (this._owner.owner as Sprite).alpha);
        renderNode._spriteShaderData.setColor(SpineShaderInit.Color, color);
        renderNode._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
        renderNode._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
    }

    /**
     * @en Plays the specified animation.
     * @param animationName The name of the animation to play.
     * @zh 播放指定的动画。
     * @param animationName 要播放的动画名称。
     */
    play(animationName: string): void {

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
     * @en Changes the skeleton.
     * @param skeleton The new spine skeleton.
     * @zh 更改骨骼。
     * @param skeleton 新的 Spine 骨骼。
     */
    changeSkeleton(skeleton: spine.Skeleton) {
        this._skeleton = skeleton;
    }

    /**
     * @en Renders the spine animation.
     * @param time The current time for rendering.
     * @zh 渲染 Spine 动画。
     * @param time 当前渲染时间。
     */
    render(time: number) {
        this._owner.clear();
        this._renerer.draw(this._skeleton, this._owner, -1, -1);
    }
}