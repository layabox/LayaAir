import { PostProcess } from "./PostProcess";
import { PostProcessRenderContext } from "./PostProcessRenderContext";
import type { CameraOpaqueMRTRequirement } from "../../Camera";

/**
 * @en Used to create post-processing rendering effects.
 * @zh 后期处理渲染效果的基类。
 * @blueprintable @blueprintableSubclasses
 */
export class PostProcessEffect {

    protected _active: boolean;
    protected _singleton: boolean;

    /**
     * @ignore
     */
    constructor() {
        this._active = true;
        this._singleton = true;
    }

    /**
     * @internal
     * @en Whether only one instance of the effect can be added.
     * @zh 是否只能添加一个效果实例。
     */
    get singleton() {
        return this._singleton;
    }

    /** @internal 是否在 TAA 前执行。 */
    get renderBeforeTAA(): boolean {
        return false;
    }

    /**
     * @en Whether the effect is enabled.
     * @zh 效果是否开启。
     */
    get active() {
        return this._active;
    }

    set active(value: boolean) {
        this._active = value;
    }

    /**
     * @en Gets the camera depth texture mode flag based on post-processing settings.
     * @zh 根据后期处理设置获取摄像机深度纹理模式标志。
     */
    getCameraDepthTextureModeFlag() {
        return 0;
    }

    /**
     * 声明本效果需要的相机不透明 MRT 数据，无需求时返回 null。
     * index 是辅助附件下标，对应 Shader location = index + 1；名称用于查询，不改变输出位置。
     * 此声明只安排附件，材质 Shader 仍须写入约定的数据与编码，未提供的输出不会自动生成。
     * 此方法须为纯查询；相机分配目标前与效果执行前均会读取，影响布局的参数应在相机渲染开始前设置。
     * 中途启用或修改效果时，当前附件满足声明即可执行，否则本次跳过该效果。
     */
    getCameraOpaqueMRTRequirements(): readonly CameraOpaqueMRTRequirement[] | null {
        return null;
    }

    /**
     * @en Called when added to the post-processing stack.
     * @param postprocess The post-processing component.
     * @zh 在添加到后期处理栈时调用。
     * @param postprocess 后期处理组件。
     */
    effectInit(postprocess: PostProcess) {
        return;
    }

    /**
     * @en Releases the effect.
     * @param postprocess The post-processing component.
     * @zh 释放效果。
     * @param postprocess 后期处理组件。
     */
    release(postprocess: PostProcess) {

    }

    /**
     * @en Renders the effect.
     * @param context The post-processing rendering context.
     * @zh 渲染效果。
     * @param context 后期处理渲染上下文。
     */
    render(context: PostProcessRenderContext): void {

    }
}


