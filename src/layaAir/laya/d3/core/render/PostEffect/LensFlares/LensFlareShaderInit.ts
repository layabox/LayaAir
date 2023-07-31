
import LensFlareVS from "../../../../shader/files/postProcess/LensFlare/LensFlare.vs";
import LensFlareFS from "../../../../shader/files/postProcess/LensFlare/LensFlare.fs";
import { Shader3D } from "../../../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "../../../../../RenderEngine/RenderShader/ShaderData";
import { SubShader } from "../../../../../RenderEngine/RenderShader/SubShader";
import { Color } from "../../../../../maths/Color";
import { LensFlareElementGeomtry } from "./LensFlareGeometry";

export class LensFlareShaderInit {

    static init() {
        let attribute: { [name: string]: [number, ShaderDataType] } = {
            'a_PositionTexcoord': [LensFlareElementGeomtry.PositionUV, ShaderDataType.Vector4],
            'a_DistanceRotationScale': [LensFlareElementGeomtry.PositionRotationScale, ShaderDataType.Vector4],
        }
        let uniformMap = {
            "u_Tint": ShaderDataType.Color,
            "u_TintIntensity": ShaderDataType.Float,
            "u_FlareTexture": ShaderDataType.Texture2D,
            "u_FlareCenter": ShaderDataType.Vector2,
            "u_aspectRatio": ShaderDataType.Float,
            "u_rotate": ShaderDataType.Float,
            "u_Postionoffset": ShaderDataType.Vector2,
            "u_Angularoffset": ShaderDataType.Float,
        }
        let defaultValue = {
            "u_Tint": Color.WHITE,
            "u_aspectRatio": 1
        }
        let shader = Shader3D.add("LensFlare", true, false);
        let subshader = new SubShader(attribute, uniformMap, defaultValue)
        shader.addSubShader(subshader);
        subshader.addShaderPass(LensFlareVS, LensFlareFS);
    }
}