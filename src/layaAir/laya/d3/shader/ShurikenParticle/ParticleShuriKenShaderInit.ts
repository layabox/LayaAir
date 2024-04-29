import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { VertexShuriKenParticle } from "../../graphics/Vertex/VertexShuriKenParticle";
import ShurikenVS from "./particleShuriKen.vs";
import ShurikenFS from "./particleShuriKen.fs";
import MathGradient from "./MathGradient.glsl";
import ParticleSpriteVS from "./particleShuriKenSpriteVS.glsl";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
/**
 * ParticleShuriKen Shader init
 */
export class ParticleShuriKenShaderInit{
    static init(){
        
        Shader3D.addInclude("MathGradient.glsl", MathGradient);
        Shader3D.addInclude("particleShuriKenSpriteVS.glsl", ParticleSpriteVS);

        let attributeMap: { [name: string]: [number, ShaderDataType] } = {
            'a_CornerTextureCoordinate': [VertexShuriKenParticle.PARTICLE_CORNERTEXTURECOORDINATE0, ShaderDataType.Vector4],
		 	'a_MeshPosition': [VertexShuriKenParticle.PARTICLE_POSITION0,ShaderDataType.Vector3],
            'a_MeshColor':[VertexShuriKenParticle.PARTICLE_COLOR0,ShaderDataType.Vector4],
		 	'a_MeshTextureCoordinate': [VertexShuriKenParticle.PARTICLE_TEXTURECOORDINATE0,ShaderDataType.Vector2],
		 	'a_ShapePositionStartLifeTime': [VertexShuriKenParticle.PARTICLE_SHAPEPOSITIONSTARTLIFETIME,ShaderDataType.Vector4],
		    'a_DirectionTime': [VertexShuriKenParticle.PARTICLE_DIRECTIONTIME,ShaderDataType.Vector4],
		 	'a_StartColor': [VertexShuriKenParticle.PARTICLE_STARTCOLOR0,ShaderDataType.Vector4],
		 	'a_StartSize': [VertexShuriKenParticle.PARTICLE_STARTSIZE,ShaderDataType.Vector3],
		 	'a_StartRotation0': [VertexShuriKenParticle.PARTICLE_STARTROTATION,ShaderDataType.Vector3],
		 	'a_StartSpeed': [VertexShuriKenParticle.PARTICLE_STARTSPEED,ShaderDataType.Float],
		 	'a_Random0': [VertexShuriKenParticle.PARTICLE_RANDOM0,ShaderDataType.Vector4],
		 	'a_Random1': [VertexShuriKenParticle.PARTICLE_RANDOM1,ShaderDataType.Vector4],
		 	'a_SimulationWorldPostion': [VertexShuriKenParticle.PARTICLE_SIMULATIONWORLDPOSTION,ShaderDataType.Vector3],
		 	'a_SimulationWorldRotation': [VertexShuriKenParticle.PARTICLE_SIMULATIONWORLDROTATION,ShaderDataType.Vector4],
		 	'a_SimulationUV': [VertexShuriKenParticle.PARTICLE_SIMULATIONUV,ShaderDataType.Vector4]
        };

        let uniformMap = {
            "u_Tintcolor": ShaderDataType.Color,
            "u_texture": ShaderDataType.Texture2D,
            "u_TilingOffset": ShaderDataType.Vector4,
            "u_AlphaTestValue": ShaderDataType.Float,
        };

        let defaultValue = {
            "u_Tintcolor": new Color(0.5, 0.5, 0.5, 0.5),
            "u_TilingOffset": new Vector4(1, 1, 0, 0),
            "u_AlphaTestValue": 0.5
        };

        let shader = Shader3D.add("PARTICLESHURIKEN", false, false);
        let subShader = new SubShader(attributeMap, uniformMap, defaultValue);
        shader.addSubShader(subShader);
        shader._ShaderType = ShaderFeatureType.DEFAULT;
        let forwardPass = subShader.addShaderPass(ShurikenVS, ShurikenFS);

    }
}