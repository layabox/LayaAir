import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D"
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData"
import { VertexTrail } from "../../core/trail/VertexTrail";
import { SubShader } from "../SubShader";
import TrailVS from "./Trail.vs";
import TrailFS from "./Trail.fs";
export class TrailShaderInit{
    static init(){
        let uniformMap = {
            "u_TIlingOffset":ShaderDataType.Vector4,
            "u_MainTexture":ShaderDataType.Texture2D,
            "u_MainColor":ShaderDataType.Color,
        };

        let attributeMap:{ [name: string]: [number, ShaderDataType] } = {
            	'a_Position': [VertexTrail.TRAIL_POSITION0,ShaderDataType.Vector4],
            	'a_OffsetVector': [VertexTrail.TRAIL_OFFSETVECTOR,ShaderDataType.Vector3],
            	'a_Texcoord0X': [VertexTrail.TRAIL_TEXTURECOORDINATE0X,ShaderDataType.Float],
            	'a_Texcoord0Y': [VertexTrail.TRAIL_TEXTURECOORDINATE0Y,ShaderDataType.Float],
            	'a_BirthTime': [VertexTrail.TRAIL_TIME0,ShaderDataType.Float],
            	'a_Color': [VertexTrail.TRAIL_COLOR,ShaderDataType.Vector4],
        };
        let shader = Shader3D.add("Trail",false,false);
        let subShader = new SubShader(attributeMap,uniformMap);
        shader.addSubShader(subShader);
        let forwardPass = subShader.addShaderPass(TrailVS,TrailFS);
        

    }
}