import { PostProcessEffect } from "../core/render/PostProcessEffect";
/**
 * <code>PostProcess</code> 类用于创建后期处理组件。
 */
export declare class PostProcess {
    private _compositeShader;
    private _compositeShaderData;
    private _effects;
    /**
     * 创建一个 <code>PostProcess</code> 实例。
     */
    constructor();
    /**
     * 添加后期处理效果。
     */
    addEffect(effect: PostProcessEffect): void;
    /**
     * 移除后期处理效果。
     */
    removeEffect(effect: PostProcessEffect): void;
}
