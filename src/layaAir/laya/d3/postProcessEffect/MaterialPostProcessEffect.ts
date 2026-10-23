import { Material } from "../../resource/Material";
import { ShaderFeatureType } from "../../RenderEngine/RenderShader/Shader3D";
import { Scene3D } from "../core/scene/Scene3D";
import { PostProcess } from "../core/render/postProcessBase/PostProcess";
import { PostProcessEffect } from "../core/render/postProcessBase/PostProcessEffect";
import { PostProcessRenderContext } from "../core/render/postProcessBase/PostProcessRenderContext";

/**
 * @en Applies a material with a post-processing shader as a fullscreen effect.
 * The source image is supplied as u_MainTex. Multiple instances can be chained.
 * @zh 使用后处理着色器材质执行全屏效果。输入图像通过 u_MainTex 提供，可叠加多个实例。
 * @blueprintable
 */
export class MaterialPostProcessEffect extends PostProcessEffect {
    private _material: Material | null = null;
    private _postProcess: PostProcess | null = null;

    constructor() {
        super();
        this._singleton = false;
    }

    /**
     * @en The shared material. Its shader must have shaderType: PostProcess.
     * The effect uses subshader 0 and does not destroy the material.
     * @zh 共享材质，其着色器类型必须为 PostProcess。使用子着色器 0，效果不会销毁该材质。
     */
    get material(): Material | null {
        return this._material;
    }

    set material(value: Material | null) {
        if (this._material === value) return;
        if (this._postProcess) this._material?._removeReference();
        this._material = value;
        if (this._postProcess) this._material?._addReference();
    }

    /** @internal */
    effectInit(postprocess: PostProcess): void {
        if (this._postProcess === postprocess) return;
        if (this._postProcess) this._material?._removeReference();
        this._postProcess = postprocess;
        this._material?._addReference();
    }

    /** @internal */
    release(postprocess: PostProcess): void {
        if (this._postProcess !== postprocess) return;
        this._material?._removeReference();
        this._postProcess = null;
    }

    /** @internal */
    render(context: PostProcessRenderContext): void {
        const material = this._material;
        const shader = material && !material.destroyed ? material.shader : null;
        if (!shader || shader.shaderType !== ShaderFeatureType.PostProcess) {
            // The stack advances its input after every active effect, including
            // an unconfigured one. Copy through so the next effect stays valid.
            context.command!.blitScreenTriangle(context.indirectTarget, context.destination);
            return;
        }
        // Fullscreen passes may classify scene uniforms as material uniforms.
        // Supply scene time explicitly so the standard Time node also animates here.
        const scene = context.camera?.scene as Scene3D;
        if (scene)
            material!.shaderData.setNumber(Scene3D.TIME, scene._shaderValues.getNumber(Scene3D.TIME));
        context.command!.blitScreenTriangle(context.indirectTarget, context.destination,
            null, shader, material!.shaderData);
    }
}
