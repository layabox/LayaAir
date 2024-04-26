import textureSpine_vs from '../files/textureSpine.vs.glsl';
import textureSpine_ps from '../files/textureSpine.ps.glsl';
import { Shader3D } from '../../RenderEngine/RenderShader/Shader3D';
import { ShaderDataType } from '../../RenderDriver/DriverDesign/RenderDevice/ShaderData';
import { SubShader } from '../../RenderEngine/RenderShader/SubShader';
import { VertexDeclaration } from '../../RenderEngine/VertexDeclaration';
import { VertexElementFormat } from '../../renders/VertexElementFormat';
import { VertexElement } from '../../renders/VertexElement';
import { SpineMaterial } from './SpineMaterial';
import { Laya } from '../../../Laya';


export class SpineMaterialShaderInit {
    static textureSpineShader: Shader3D;

    static vertexDeclaration:VertexDeclaration;
    /**
     * TextureSV Mesh Descript
     */
    public static readonly textureSpineAttribute: { [name: string]: [number, ShaderDataType] } = {
        'a_pos': [0, ShaderDataType.Vector2],
        'a_color': [1, ShaderDataType.Vector4],
        'a_texcoord': [2, ShaderDataType.Vector2]
    }


    static init() {
        //textureSpineShader
        SpineMaterialShaderInit.textureSpineShader = Shader3D.add("SpineNormal", false, false);
        let subShader = new SubShader(SpineMaterialShaderInit.textureSpineAttribute, {}, {});
        SpineMaterialShaderInit.textureSpineShader.addSubShader(subShader);
        subShader.addShaderPass(textureSpine_vs, textureSpine_ps);

        //VertexDeclaration

        SpineMaterialShaderInit.vertexDeclaration = new VertexDeclaration(32, [
            new VertexElement(0, VertexElementFormat.Vector2, 0),
            new VertexElement(8, VertexElementFormat.Vector4, 1),
            new VertexElement(24, VertexElementFormat.Vector2, 2)
        ])

        SpineMaterial.__initDefine__();

    }
}
Laya.addAfterInitCallback(SpineMaterialShaderInit.init);