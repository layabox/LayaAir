import { ShaderDefines2D } from "./ShaderDefines2D";
import { DrawStyle } from "../../canvas/DrawStyle"

import texture_vs from './files/texture.vs.glsl';
import texture_ps from './files/texture.ps.glsl';
import prime_vs from './files/primitive.vs.glsl';
import prime_ps from './files/primitive.ps.glsl';


import Sprite2DFrag from './NewShader/Sprite2DFrag.glsl';
import Sprite2DVertex from './NewShader/Sprite2DVertex.glsl';
import Sprite2DShaderInfo from './NewShader/Sprite2DShaderInfo.glsl';

import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderCompile } from "../../utils/ShaderCompile";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Material } from "../../../resource/Material";

export class Shader2D {
    /**@internal */
    static textureShader: Shader3D;
    /**@internal */
    static primitiveShader: Shader3D;

    /**@internal */
    ALPHA: number = 1;
    /**@internal */
    filters: any[];
    /**@internal */
    shaderType: number = 0;
    /**@internal */
    colorAdd: any[];
    /**@internal */
    fillStyle = DrawStyle.DEFAULT;
    /**@internal */
    strokeStyle = DrawStyle.DEFAULT;
    /**@internal */
    material: Material = null;

    /**
     * @internal
     */
    destroy(): void {
        this.filters = null;
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
    }
}

