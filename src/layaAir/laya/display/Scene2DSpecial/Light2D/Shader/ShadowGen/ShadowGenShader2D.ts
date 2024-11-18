import shadowGen2D_vs from './shadowGen2D.vs';
import shadowGen2D_ps from './shadowGen2D.fs';
import { ShaderDataType } from '../../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData';
import { Shader3D, ShaderFeatureType } from '../../../../../RenderEngine/RenderShader/Shader3D';
import { UniformMapType, SubShader } from '../../../../../RenderEngine/RenderShader/SubShader';

/**
 * 用于在光影图上叠加阴影亮度和颜色（如果阴影没有亮度和颜色，可以不用执行该生成步骤）
 */
export class ShadowGenShader2D {
    static renderShader: Shader3D;

    static readonly RenderUniform: UniformMapType = {
        'u_LightColor': ShaderDataType.Color,
        'u_ShadowColor': ShaderDataType.Color,
        'u_LightRotation': ShaderDataType.Float,
        'u_LightIntensity': ShaderDataType.Float,
        'u_Shadow2DStrength': ShaderDataType.Float,
        'u_LightScale': ShaderDataType.Vector2,
        'u_PCFIntensity': ShaderDataType.Float,
    }

    static readonly RenderAttribute: { [name: string]: [number, ShaderDataType] } = {
        'a_position': [0, ShaderDataType.Vector4],
        'a_uv': [2, ShaderDataType.Vector2],
    }

    static __init__(): void {
        this.renderShader = Shader3D.add('ShadowGen2D', false, false);
        this.renderShader.shaderType = ShaderFeatureType.D2;
        const subShader = new SubShader(this.RenderAttribute, this.RenderUniform, {});
        this.renderShader.addSubShader(subShader);
        subShader.addShaderPass(shadowGen2D_vs, shadowGen2D_ps);
    }
}