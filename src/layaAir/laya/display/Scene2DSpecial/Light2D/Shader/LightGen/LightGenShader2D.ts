import lightGen_vs from './lightGen.vs';
import lightGen_ps from './lightGen.fs';
import { SubShader } from '../../../../../RenderEngine/RenderShader/SubShader';
import { ShaderDataType } from '../../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData';
import { Shader3D, ShaderFeatureType } from '../../../../../RenderEngine/RenderShader/Shader3D';

/**
 * 用于生成灯光图（SpotLight，FreeformLight）
 */
export class LightGenShader2D {
    static renderShader: Shader3D;

    static readonly RenderAttribute: { [name: string]: [number, ShaderDataType] } = {
        'a_position': [0, ShaderDataType.Vector4],
        'a_uv': [2, ShaderDataType.Vector2],
    }

    static __init__(): void {
        this.renderShader = Shader3D.add('LightGen2D', false, false);
        this.renderShader.shaderType = ShaderFeatureType.D2;
        const subShader = new SubShader(this.RenderAttribute, {}, {});
        this.renderShader.addSubShader(subShader);
        subShader.addShaderPass(lightGen_vs, lightGen_ps);
    }
}