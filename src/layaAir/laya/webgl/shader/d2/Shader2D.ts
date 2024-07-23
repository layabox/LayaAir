
import prime_ps from './files/primitive.ps.glsl';
import prime_vs from './files/primitive.vs.glsl';
import texture_ps from './files/texture.ps.glsl';
import texture_vs from './files/texture.vs.glsl';
import baseRender2D_vs from './files/baseRender2D.vs';
import baseRender2D_ps from './files/baseRender2D.fs';

import Sprite2DFrag from './NewShader/Sprite2DFrag.glsl';
import Sprite2DShaderInfo from './NewShader/Sprite2DShaderInfo.glsl';
import Sprite2DVertex from './NewShader/Sprite2DVertex.glsl';

import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";

export class Shader2D {
    /**@internal */
    static textureShader: Shader3D;
    /**@internal */
    static primitiveShader: Shader3D;
    /**@internal */
    static render2DNodeShader: Shader3D;

    /**
     * @internal
     */
    destroy(): void {
    }

    /**
     * primitive Mesh Descript
     */
    public static readonly primitiveAttribute: { [name: string]: [number, ShaderDataType] } = {
        'a_position': [0, ShaderDataType.Vector4],
        'a_attribColor': [1, ShaderDataType.Vector4],
    }

    /**
     * TextureSV Mesh Descript
     */
    public static readonly textureAttribute: { [name: string]: [number, ShaderDataType] } = {
        'a_posuv': [0, ShaderDataType.Vector4],
        'a_attribColor': [1, ShaderDataType.Vector4],
        'a_attribFlags': [2, ShaderDataType.Vector4]
    }

    public static readonly Render2DNodeAttribute: { [name: string]: [number, ShaderDataType] } = {
        'a_position': [0, ShaderDataType.Vector4],
        'a_color': [1, ShaderDataType.Vector4],
        'a_uv': [2, ShaderDataType.Vector2]
    }

    /**
     * init 2D internal Shader
     */
    static __init__(): void {
        Shader3D.addInclude("Sprite2DFrag.glsl", Sprite2DFrag);
        Shader3D.addInclude("Sprite2DVertex.glsl", Sprite2DVertex);
        Shader3D.addInclude("Sprite2DShaderInfo.glsl", Sprite2DShaderInfo);

        //textureShader
        Shader2D.textureShader = Shader3D.add("Sprite2DTexture", false, false);
        Shader2D.textureShader.shaderType = ShaderFeatureType.D2;
        let subShader = new SubShader(Shader2D.textureAttribute, {}, {});
        Shader2D.textureShader.addSubShader(subShader);
        subShader.addShaderPass(texture_vs, texture_ps);

        //primitiveShader
        Shader2D.primitiveShader = Shader3D.add("Sprite2DPrimitive", false, false);
        Shader2D.primitiveShader.shaderType = ShaderFeatureType.D2;
        subShader = new SubShader(Shader2D.primitiveAttribute, {}, {});
        Shader2D.primitiveShader.addSubShader(subShader);
        subShader.addShaderPass(prime_vs, prime_ps);

        //meshspriteShader
        Shader2D.render2DNodeShader = Shader3D.add("baseRender2D", false, false);
        Shader2D.render2DNodeShader.shaderType = ShaderFeatureType.D2;
        subShader = new SubShader(Shader2D.Render2DNodeAttribute, {}, {});
        Shader2D.render2DNodeShader.addSubShader(subShader);
        subShader.addShaderPass(baseRender2D_vs, baseRender2D_ps);

    }
}

