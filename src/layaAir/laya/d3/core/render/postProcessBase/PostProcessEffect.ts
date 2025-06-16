import { PostProcess } from "./PostProcess";
import { PostProcessRenderContext } from "./PostProcessRenderContext";

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
    set singleton(value: boolean) {
        this._singleton = value;
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


