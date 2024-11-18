
import TileMapVS from "./TileMap.vs";
import TileMapFS from "./TileMap.fs";
import TileMapCommonGLSL from "./TileMapCommon.glsl"
import TileMapVertexGLSL from "./TileMapVertex.glsl"
import TileMapFragmentGLSL from "./TileMapFragment.glsl"
import { ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";

export class TileMapShaderInit {
    /**
     * @internal
     */
    static _tileMapPositionUVColorDec: VertexDeclaration;

    /**
     * @internal
     */
    static _tileMapCellColorInstanceDec: VertexDeclaration;
    /**
     * @internal
     */
    static _tileMapCellPosScaleDec: VertexDeclaration;

    /**
     * @internal
     */
    static _tileMapCellUVOriScaleDec: VertexDeclaration;
    /**
     * @internal
     */
    static _tileMapCellUVTrans: VertexDeclaration;

    static __init__() {
        let attributeMap: { [name: string]: [number, ShaderDataType] } = {
            'a_posuv': [0, ShaderDataType.Vector4],
            'a_color': [1, ShaderDataType.Vector4],
            'a_cellColor': [2, ShaderDataType.Vector4],
            'a_cellPosScale': [3, ShaderDataType.Vector4],
            'a_cellUVOriScale': [4, ShaderDataType.Vector4],
            'a_celluvTrans': [5, ShaderDataType.Vector4],

        };
        Shader3D.addInclude("TileMapCommon.glsl", TileMapCommonGLSL);
        Shader3D.addInclude("TileMapVertex.glsl", TileMapVertexGLSL);
        Shader3D.addInclude("TileMapFragment.glsl", TileMapFragmentGLSL);
        let shader = Shader3D.add("TileMapLayer", false, false);
        shader.shaderType = ShaderFeatureType.Effect;
        let subShader = new SubShader(attributeMap, {}, {});
        shader.addSubShader(subShader);
        let forwardPass = subShader.addShaderPass(TileMapVS, TileMapFS);

        TileMapShaderInit._tileMapPositionUVColorDec = new VertexDeclaration(32, [
            new VertexElement(0, VertexElementFormat.Vector4, 0),//vec4 a_position uv
            new VertexElement(16, VertexElementFormat.Vector4, 1),//vec4 a_color
        ]);

        TileMapShaderInit._tileMapCellColorInstanceDec = new VertexDeclaration(16, [
            new VertexElement(0, VertexElementFormat.Vector4, 2),//vec4 a_cellColor
        ]);

        TileMapShaderInit._tileMapCellPosScaleDec = new VertexDeclaration(16, [
            new VertexElement(0, VertexElementFormat.Vector4, 3),//vec4 a_cellPosScale
        ]);

        TileMapShaderInit._tileMapCellUVOriScaleDec = new VertexDeclaration(16, [
            new VertexElement(0, VertexElementFormat.Vector4, 4),//vec4 a_cellUVOriScale
        ]);

        TileMapShaderInit._tileMapCellUVTrans = new VertexDeclaration(16, [
            new VertexElement(0, VertexElementFormat.Vector4, 5),//vec4 a_uvTrans
        ]);


    }
}