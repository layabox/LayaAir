import textureSpine_vs from '../files/textureRBSpine.vs.glsl';
import textureSpine_ps from '../files/textureSpine.ps.glsl';
import { Shader3D } from '../../RenderEngine/RenderShader/Shader3D';
import { ShaderDataType } from '../../RenderDriver/DriverDesign/RenderDevice/ShaderData';
import { SubShader } from '../../RenderEngine/RenderShader/SubShader';
import { VertexDeclaration } from '../../RenderEngine/VertexDeclaration';
import { VertexElementFormat } from '../../renders/VertexElementFormat';
import { VertexElement } from '../../renders/VertexElement';
import { Laya } from '../../../Laya';
import { SpineRBMaterial } from './SpineRBMaterial';






export class SpineRBMaterialShaderInit {
    static textureSpineShader: Shader3D;

    static vertexDeclaration: VertexDeclaration;
    /**
     * TextureSV Mesh Descript
     */
    public static readonly textureSpineAttribute: { [name: string]: [number, ShaderDataType] } = {
        'a_pos': [0, ShaderDataType.Vector2],
        'a_color': [1, ShaderDataType.Vector4],
        'a_texcoord': [2, ShaderDataType.Vector2],
        'a_boneId': [3, ShaderDataType.Float],
    }


    static init() {
        let uniformMap = {
            "u_sBone[200]": ShaderDataType.Vector4,
            "u_NMatrix[2]": ShaderDataType.Vector3
        };
        //textureSpineShader
        SpineRBMaterialShaderInit.textureSpineShader = Shader3D.add("SpineRigidBody", false, false);
        let subShader = new SubShader(SpineRBMaterialShaderInit.textureSpineAttribute, uniformMap, {});
        SpineRBMaterialShaderInit.textureSpineShader.addSubShader(subShader);
        subShader.addShaderPass(textureSpine_vs, textureSpine_ps);

        //VertexDeclaration

        SpineRBMaterialShaderInit.vertexDeclaration = new VertexDeclaration(36, [
            new VertexElement(0, VertexElementFormat.Vector2, 0),
            new VertexElement(8, VertexElementFormat.Vector4, 1),
            new VertexElement(24, VertexElementFormat.Vector2, 2),
            new VertexElement(32, VertexElementFormat.Single, 3)
        ])

        SpineRBMaterial.__initDefine__();

    }
}
Laya.addAfterInitCallback(SpineRBMaterialShaderInit.init);