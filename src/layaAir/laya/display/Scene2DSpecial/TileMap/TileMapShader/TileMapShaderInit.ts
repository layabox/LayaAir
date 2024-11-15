
import TileMapVS from "./TileMap.vs";
import TileMapFS from "./TileMap.fs";
import TileMapCommonGLSL from "./TileMapCommon.glsl"
import TileMapVertexGLSL from "./TileMapVertex.glsl"
import TileMapFragmentGLSL from "./TileMapFragment.glsl"
import { ShaderDataType } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Shader3D, ShaderFeatureType } from "../../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";


export class TileMapShaderInit {
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



    }
}