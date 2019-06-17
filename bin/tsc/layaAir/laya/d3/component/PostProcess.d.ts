import { Camera } from "../core/Camera";
import { PostProcessEffect } from "../core/render/PostProcessEffect";
import { PostProcessRenderContext } from "../core/render/PostProcessRenderContext";
import { CommandBuffer } from "../core/render/command/CommandBuffer";
import { ShaderDefines } from "../shader/ShaderDefines";
/**
 * <code>PostProcess</code> 类用于创建后期处理组件。
 */
export declare class PostProcess {
    /**@private */
    static SHADERDEFINE_BLOOM_LOW: number;
    /**@private */
    static SHADERDEFINE_BLOOM: number;
    /**@private */
    static SHADERDEFINE_FINALPASS: number;
    /**@private */
    static SHADERVALUE_MAINTEX: number;
    /**@private */
    static SHADERVALUE_BLOOMTEX: number;
    /**@private */
    static SHADERVALUE_AUTOEXPOSURETEX: number;
    /**@private */
    static SHADERVALUE_BLOOM_DIRTTEX: number;
    /**@private */
    static SHADERVALUE_BLOOMTEX_TEXELSIZE: number;
    /**@private */
    static SHADERVALUE_BLOOM_DIRTTILEOFFSET: number;
    /**@private */
    static SHADERVALUE_BLOOM_SETTINGS: number;
    /**@private */
    static SHADERVALUE_BLOOM_COLOR: number;
    /**@private */
    static shaderDefines: ShaderDefines;
    /**
     * @private
     */
    static __init__(): void;
    /**@private */
    private _compositeShader;
    /**@private */
    private _compositeShaderData;
    /**@private */
    _context: PostProcessRenderContext;
    /**@private */
    private _effects;
    /**
     * 创建一个 <code>PostProcess</code> 实例。
     */
    constructor();
    /**
     *@private
     */
    _init(camera: Camera, command: CommandBuffer): void;
    /**
     * @private
     */
    _render(): void;
    /**
     * 添加后期处理效果。
     */
    addEffect(effect: PostProcessEffect): void;
    /**
     * 移除后期处理效果。
     */
    removeEffect(effect: PostProcessEffect): void;
}
