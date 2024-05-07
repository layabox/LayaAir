import textureFastSpine_vs from '../files/textureFastSpine.vs.glsl';
import textureSpine_ps from '../files/textureSpine.ps.glsl';
import { Shader3D } from '../../RenderEngine/RenderShader/Shader3D';
import { ShaderDataType } from '../../RenderDriver/DriverDesign/RenderDevice/ShaderData';
import { SubShader } from '../../RenderEngine/RenderShader/SubShader';
import { VertexDeclaration } from '../../RenderEngine/VertexDeclaration';
import { VertexElementFormat } from '../../renders/VertexElementFormat';
import { VertexElement } from '../../renders/VertexElement';

import { SpineFastMaterial } from './SpineFastMaterial';
import { Laya } from '../../../Laya';


export class SpineFastMaterialShaderInit {
    static textureSpineShader: Shader3D;

    static vertexDeclaration: VertexDeclaration;
    /**
     * TextureSV Mesh Descript
     */
    public static readonly textureSpineAttribute: { [name: string]: [number, ShaderDataType] } = {
        'a_texcoord': [0, ShaderDataType.Vector2],
        'a_color': [1, ShaderDataType.Vector4],
        'a_pos': [2, ShaderDataType.Vector2],
        "a_weight": [3, ShaderDataType.Float],
        "a_BoneId": [4, ShaderDataType.Float],
        'a_pos2': [5, ShaderDataType.Vector2],
        "a_weight2": [6, ShaderDataType.Float],
        "a_BoneId2": [7, ShaderDataType.Float],
        'a_pos3': [8, ShaderDataType.Vector2],
        "a_weight3": [9, ShaderDataType.Float],
        "a_BoneId3": [10, ShaderDataType.Float],

        'a_pos4': [11, ShaderDataType.Vector2],
        "a_weight4": [12, ShaderDataType.Float],
        "a_BoneId4": [13, ShaderDataType.Float],
    }


    static init() {

        let uniformMap = {
            "u_sBone[200]": ShaderDataType.Vector4,
            "u_color":ShaderDataType.Vector4,
            "u_NMatrix[2]": ShaderDataType.Vector3
        };
        //textureSpineShader
        SpineFastMaterialShaderInit.textureSpineShader = Shader3D.add("Sprite2DTextureFastSpine", false, false);
        let subShader = new SubShader(SpineFastMaterialShaderInit.textureSpineAttribute, uniformMap, {});
        SpineFastMaterialShaderInit.textureSpineShader.addSubShader(subShader);
        subShader.addShaderPass(textureFastSpine_vs, textureSpine_ps);

        SpineFastMaterialShaderInit.vertexDeclaration = new VertexDeclaration(88, [
            new VertexElement(0, VertexElementFormat.Vector2, 0),
            new VertexElement(8, VertexElementFormat.Vector4, 1),
            new VertexElement(24, VertexElementFormat.Vector2, 2),
            new VertexElement(32, VertexElementFormat.Single, 3),
            new VertexElement(36, VertexElementFormat.Single, 4),
            new VertexElement(40, VertexElementFormat.Vector2, 5),
            new VertexElement(48, VertexElementFormat.Single, 6),
            new VertexElement(52, VertexElementFormat.Single, 7),
            new VertexElement(56, VertexElementFormat.Vector2, 8),
            new VertexElement(64, VertexElementFormat.Single, 9),
            new VertexElement(68, VertexElementFormat.Single, 10),

            new VertexElement(72, VertexElementFormat.Vector2, 11),
            new VertexElement(80, VertexElementFormat.Single, 12),
            new VertexElement(84, VertexElementFormat.Single, 13),

        ])
        SpineFastMaterial.__initDefine__();
    }
}
Laya.addAfterInitCallback(SpineFastMaterialShaderInit.init);